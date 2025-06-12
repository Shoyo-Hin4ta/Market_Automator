import { createClient } from '@/app/src/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  try {
    // Create test campaigns
    const testCampaigns = [
      {
        user_id: user.id,
        name: 'Summer Sale Campaign',
        canva_design_id: 'DAGFsHjKlmn',
        canva_design_url: 'https://www.canva.com/design/DAGFsHjKlmn/view',
        canva_thumbnail_url: 'https://document-export.canva.com/thumbnail.jpg',
        distributed_channels: ['email', 'notion', 'github'],
        notion_page_id: 'notion-123',
        github_page_url: 'https://username.github.io/campaigns/summer-sale',
        mailchimp_campaign_id: 'mc-campaign-123',
        status: 'sent'
      },
      {
        user_id: user.id,
        name: 'Product Launch Campaign',
        canva_design_id: 'DAGFsABCdef',
        canva_design_url: 'https://www.canva.com/design/DAGFsABCdef/view',
        canva_thumbnail_url: 'https://document-export.canva.com/thumbnail2.jpg',
        distributed_channels: ['email', 'notion'],
        notion_page_id: 'notion-456',
        mailchimp_campaign_id: 'mc-campaign-456',
        status: 'distributed'
      },
      {
        user_id: user.id,
        name: 'Holiday Newsletter',
        canva_design_id: 'DAGFsXYZabc',
        canva_design_url: 'https://www.canva.com/design/DAGFsXYZabc/view',
        canva_thumbnail_url: 'https://document-export.canva.com/thumbnail3.jpg',
        distributed_channels: ['github'],
        github_page_url: 'https://username.github.io/campaigns/holiday-newsletter',
        status: 'distributed'
      }
    ]
    
    // Insert campaigns
    const { data: campaigns, error: campaignError } = await supabase
      .from('campaigns')
      .insert(testCampaigns)
      .select()
    
    if (campaignError) {
      console.error('Failed to create test campaigns:', campaignError)
      return new Response('Failed to create test campaigns', { status: 500 })
    }
    
    // Create analytics for the sent campaign
    if (campaigns && campaigns[0]) {
      const analyticsData = {
        campaign_id: campaigns[0].id,
        emails_sent: 1250,
        emails_opened: 875,
        emails_clicked: 342,
        open_rate: 70.0,
        click_rate: 27.36,
        bounce_rate: 2.4,
        unsubscribes: 12,
        complaints: 2,
        last_synced_at: new Date().toISOString()
      }
      
      const { error: analyticsError } = await supabase
        .from('campaign_analytics')
        .insert(analyticsData)
      
      if (analyticsError) {
        console.error('Failed to create test analytics:', analyticsError)
      }
    }
    
    return Response.json({ 
      success: true, 
      message: 'Test data created successfully',
      campaigns: campaigns?.length || 0
    })
  } catch (error) {
    console.error('Error creating test data:', error)
    return new Response('Internal server error', { status: 500 })
  }
}