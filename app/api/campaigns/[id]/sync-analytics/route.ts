import { createClient } from '@/app/src/lib/supabase/server'
import { syncMailchimpAnalytics } from '@/app/src/services/mailchimp-analytics'
import { NotionService } from '@/app/src/services/notion'
import { NextRequest } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  try {
    // Await params before using
    const { id } = await params
    
    // Get campaign details
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (!campaign) {
      return new Response('Campaign not found', { status: 404 })
    }
    
    if (!campaign.mailchimp_campaign_id) {
      return new Response('No email campaign to sync', { status: 400 })
    }
    
    // Sync Mailchimp analytics
    const analytics = await syncMailchimpAnalytics(id, campaign.mailchimp_campaign_id)
    
    // Update Notion with latest analytics if connected
    if (campaign.notion_page_id) {
      const { data: notionCreds } = await supabase
        .from('api_keys')
        .select('encrypted_key')
        .eq('user_id', user.id)
        .eq('service', 'notion')
        .single()
      
      if (notionCreds) {
        const api_key = notionCreds.encrypted_key
        const notion = new NotionService(api_key)
        
        await notion.updateDatabaseEntry(campaign.notion_page_id, {
          'Emails Sent': { number: analytics.emails_sent },
          'Emails Opened': { number: analytics.emails_opened },
          'Emails Clicked': { number: analytics.emails_clicked },
          'Open Rate': { number: analytics.open_rate },
          'Click Rate': { number: analytics.click_rate },
          'Bounce Rate': { number: analytics.bounce_rate }
        })
      }
    }
    
    return Response.json({ success: true, analytics })
  } catch (error) {
    console.error('Failed to sync analytics:', error)
    return new Response('Failed to sync analytics', { status: 500 })
  }
}