import { createClient } from '@/app/lib/supabase/server'
import { MailchimpService } from '@/app/services/mailchimp'
import { NotionService } from '@/app/services/notion'
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
      return new Response('No email campaign configured', { status: 400 })
    }
    
    // Get Mailchimp credentials
    const { data: mailchimpCreds } = await supabase
      .from('api_keys')
      .select('encrypted_key, metadata')
      .eq('user_id', user.id)
      .eq('service', 'mailchimp')
      .single()
    
    if (!mailchimpCreds) {
      return new Response('Mailchimp not connected', { status: 400 })
    }
    
    const api_key = mailchimpCreds.encrypted_key
    const server = mailchimpCreds.metadata?.server_prefix
    const mailchimp = new MailchimpService(api_key, server)
    
    // Send the campaign
    try {
      await mailchimp.sendCampaign(campaign.mailchimp_campaign_id)
    } catch (mailchimpError: any) {
      console.error('Mailchimp send error:', mailchimpError)
      // Check if it's already sent
      if (mailchimpError.message?.includes('is in status sent')) {
        // Campaign was already sent, just update our database
        console.log('Campaign was already sent, updating status only')
      } else {
        throw mailchimpError
      }
    }
    
    // Update campaign status
    await supabase
      .from('campaigns')
      .update({ status: 'sent' })
      .eq('id', id)
    
    // Update Notion if connected
    if (campaign.notion_page_id) {
      const { data: notionCreds } = await supabase
        .from('api_keys')
        .select('encrypted_key')
        .eq('user_id', user.id)
        .eq('service', 'notion')
        .single()
      
      if (notionCreds) {
        const notionKey = notionCreds.encrypted_key
        const notion = new NotionService(notionKey)
        
        // Update the Notion entry to mark email as sent
        await notion.updateDatabaseEntry(campaign.notion_page_id, {
          'Email Sent': { checkbox: true }
        })
      }
    }
    
    return Response.json({ success: true })
  } catch (error) {
    console.error('Failed to send email:', error)
    return new Response('Failed to send email', { status: 500 })
  }
}