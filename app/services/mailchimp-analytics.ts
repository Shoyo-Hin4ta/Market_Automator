import { createClient } from '../lib/supabase/server'
import { MailchimpService } from './mailchimp'

export async function syncMailchimpAnalytics(campaignId: string, mailchimpCampaignId: string) {
  const supabase = await createClient()
  
  // Get user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')
  
  // Get Mailchimp credentials
  const { data: apiKeyData } = await supabase
    .from('api_keys')
    .select('encrypted_key, metadata')
    .eq('user_id', user.id)
    .eq('service', 'mailchimp')
    .single()
  
  if (!apiKeyData) throw new Error('Mailchimp not connected')
  
  // Note: encrypted_key is not actually encrypted (following established pattern)
  const mailchimp = new MailchimpService(
    apiKeyData.encrypted_key,
    apiKeyData.metadata.server_prefix
  )
  
  // Fetch analytics
  const analytics = await mailchimp.getCampaignAnalytics(mailchimpCampaignId)
  
  // Clean up analytics data - remove undefined values and convert empty strings to null for timestamps
  const cleanedAnalytics = Object.entries(analytics).reduce((acc, [key, value]) => {
    // Skip undefined values
    if (value === undefined) return acc
    
    // Convert empty strings to null for timestamp fields
    if ((key === 'last_open' || key === 'last_click') && value === '') {
      acc[key] = null
    } else {
      acc[key] = value
    }
    
    return acc
  }, {} as any)
  
  // Update campaign_analytics table
  const { error } = await supabase
    .from('campaign_analytics')
    .upsert({
      campaign_id: campaignId,
      ...cleanedAnalytics,
      last_synced_at: new Date().toISOString()
    }, {
      onConflict: 'campaign_id'
    })
  
  if (error) throw error
  
  return analytics
}