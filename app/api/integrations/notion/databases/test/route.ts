import { createClient } from '@/app/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { NotionService } from '@/app/services/notion'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get the user's Notion credentials and database info
    const { data: apiKey, error: keyError } = await supabase
      .from('api_keys')
      .select('encrypted_key, metadata')
      .eq('user_id', user.id)
      .eq('service', 'notion')
      .single()

    if (keyError || !apiKey) {
      return NextResponse.json(
        { error: 'Notion integration not found' },
        { status: 404 }
      )
    }

    const { data: notionDb, error: dbError } = await supabase
      .from('notion_databases')
      .select('database_id')
      .eq('user_id', user.id)
      .single()

    if (dbError || !notionDb) {
      return NextResponse.json(
        { error: 'No Notion database found. Please create one first.' },
        { status: 404 }
      )
    }

    const notion = new NotionService(apiKey.encrypted_key)
    
    // Create dummy campaign data
    const dummyCampaigns = [
      {
        name: 'Summer Sale Campaign',
        designUrl: 'https://www.canva.com/design/dummy123',
        status: 'published',
        emailSent: true,
        githubUrl: 'https://github.com/user/landing-page-1',
        emailsSent: 1250,
        emailsOpened: 875,
        emailsClicked: 425,
        openRate: 70,
        clickRate: 34,
        bounceRate: 2.5
      },
      {
        name: 'Product Launch Newsletter',
        designUrl: 'https://www.canva.com/design/dummy456',
        status: 'draft',
        emailSent: false,
        githubUrl: '',
        emailsSent: 0,
        emailsOpened: 0,
        emailsClicked: 0,
        openRate: 0,
        clickRate: 0,
        bounceRate: 0
      },
      {
        name: 'Holiday Special Offer',
        designUrl: 'https://www.canva.com/design/dummy789',
        status: 'archived',
        emailSent: true,
        githubUrl: 'https://github.com/user/holiday-landing',
        emailsSent: 3500,
        emailsOpened: 2100,
        emailsClicked: 890,
        openRate: 60,
        clickRate: 25.4,
        bounceRate: 3.2
      }
    ]

    const createdPages = []
    
    for (const campaign of dummyCampaigns) {
      try {
        const response = await notion.client?.pages.create({
          parent: { database_id: notionDb.database_id },
          properties: {
            'Campaign Name': {
              title: [
                {
                  text: {
                    content: campaign.name
                  }
                }
              ]
            },
            'Design URL': {
              url: campaign.designUrl
            },
            'Created Date': {
              date: {
                start: new Date().toISOString()
              }
            },
            'Status': {
              select: {
                name: campaign.status
              }
            },
            'Email Sent': {
              checkbox: campaign.emailSent
            },
            'GitHub URL': {
              url: campaign.githubUrl || null
            },
            'Emails Sent': {
              number: campaign.emailsSent
            },
            'Emails Opened': {
              number: campaign.emailsOpened
            },
            'Emails Clicked': {
              number: campaign.emailsClicked
            },
            'Open Rate': {
              number: campaign.openRate
            },
            'Click Rate': {
              number: campaign.clickRate
            },
            'Bounce Rate': {
              number: campaign.bounceRate
            }
          }
        })
        
        createdPages.push({
          name: campaign.name,
          pageId: response?.id,
          url: response?.url
        })
      } catch (error: any) {
        console.error(`Failed to create page for ${campaign.name}:`, error)
        createdPages.push({
          name: campaign.name,
          error: error.message || 'Failed to create page'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Test data populated successfully',
      createdPages,
      databaseUrl: `https://notion.so/${notionDb.database_id.replace(/-/g, '')}`
    })
  } catch (error: any) {
    console.error('Failed to populate test data:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to populate test data' },
      { status: 500 }
    )
  }
}