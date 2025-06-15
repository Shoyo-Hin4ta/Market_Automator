import { createClient } from '@/app/lib/supabase/server'
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
    
    // First verify the campaign belongs to the user
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (!campaign) {
      return new Response('Campaign not found', { status: 404 })
    }
    
    // Fetch analytics data
    const { data: analytics, error } = await supabase
      .from('campaign_analytics')
      .select('*')
      .eq('campaign_id', id)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching analytics:', error)
      return new Response('Failed to fetch analytics', { status: 500 })
    }
    
    return Response.json(analytics || null)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return new Response('Internal server error', { status: 500 })
  }
}