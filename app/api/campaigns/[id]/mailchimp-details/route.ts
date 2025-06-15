import { createClient } from '@/app/lib/supabase/server'
import { MailchimpService } from '@/app/services/mailchimp'
import { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
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
    
    if (!campaign || !campaign.mailchimp_campaign_id) {
      return new Response('Campaign not found or no Mailchimp campaign', { status: 404 })
    }
    
    // Get Mailchimp credentials
    const { data: apiKeyData } = await supabase
      .from('api_keys')
      .select('encrypted_key, metadata')
      .eq('user_id', user.id)
      .eq('service', 'mailchimp')
      .single()
    
    if (!apiKeyData) {
      return new Response('Mailchimp not connected', { status: 400 })
    }
    
    // Fetch campaign details from Mailchimp
    const mailchimp = new MailchimpService(
      apiKeyData.encrypted_key,
      apiKeyData.metadata.server_prefix
    )
    
    try {
      const details = await mailchimp.getCampaignDetails(campaign.mailchimp_campaign_id)
      return Response.json(details)
    } catch (error) {
      console.error('Failed to fetch Mailchimp details:', error)
      // Return empty details if campaign hasn't been sent yet
      return Response.json({
        settings: {
          subject_line: 'Campaign preparing...',
          from_name: 'N/A',
          reply_to: 'N/A'
        },
        recipients: {
          list_name: 'Loading...',
          recipient_count: 0
        }
      })
    }
  } catch (error) {
    console.error('Error fetching Mailchimp details:', error)
    return new Response('Internal server error', { status: 500 })
  }
}