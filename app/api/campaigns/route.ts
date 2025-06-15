import { createClient } from '@/app/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  try {
    // Fetch campaigns with analytics data
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        campaign_analytics (
          emails_sent,
          emails_opened,
          emails_clicked,
          open_rate,
          click_rate,
          bounce_rate,
          unsubscribes,
          last_synced_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Failed to fetch campaigns:', error)
      return new Response('Failed to fetch campaigns', { status: 500 })
    }
    
    return Response.json({ campaigns: campaigns || [] })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return new Response('Internal server error', { status: 500 })
  }
}