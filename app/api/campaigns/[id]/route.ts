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
    
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (error || !campaign) {
      return new Response('Campaign not found', { status: 404 })
    }
    
    return Response.json(campaign)
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return new Response('Internal server error', { status: 500 })
  }
}