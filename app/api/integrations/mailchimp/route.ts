import { createClient } from '../../../src/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('user_id', user.id)
    .eq('service', 'mailchimp')
    .single()
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    return new Response('Error fetching credentials', { status: 500 })
  }
  
  if (!data) {
    return Response.json({ connected: false })
  }
  
  return Response.json({
    connected: true,
    serverPrefix: data.metadata?.server_prefix || '',
    audienceId: data.metadata?.audience_id || ''
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { apiKey, serverPrefix, audienceId } = await request.json()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })
  
  // Store API key unencrypted (following Notion pattern)
  const { error } = await supabase
    .from('api_keys')
    .upsert({
      user_id: user.id,
      service: 'mailchimp',
      encrypted_key: apiKey, // Not actually encrypted, following established pattern
      metadata: {
        server_prefix: serverPrefix,
        audience_id: audienceId
      }
    })
  
  if (error) {
    return new Response('Failed to save credentials', { status: 500 })
  }
  
  return new Response('Success', { status: 200 })
}