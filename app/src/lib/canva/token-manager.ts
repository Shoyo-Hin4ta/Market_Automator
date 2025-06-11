import { createClient } from '../supabase/server'

export async function getValidCanvaToken(userId: string): Promise<string> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('api_keys')
    .select('encrypted_key, metadata')
    .eq('user_id', userId)
    .eq('service', 'canva')
    .single()
  
  if (!data) throw new Error('Canva not connected')
  
  const expiresAt = new Date(data.metadata.expires_at)
  const now = new Date()
  
  // Check if token needs refresh (5 minutes before expiry)
  if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
    const newTokens = await refreshCanvaToken(data.metadata.refresh_token)
    
    // Update tokens in database
    await supabase
      .from('api_keys')
      .update({
        encrypted_key: newTokens.access_token,
        metadata: {
          ...data.metadata,
          refresh_token: newTokens.refresh_token,
          expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString()
        }
      })
      .eq('user_id', userId)
      .eq('service', 'canva')
    
    return newTokens.access_token
  }
  
  return data.encrypted_key
}

async function refreshCanvaToken(refreshToken: string) {
  const response = await fetch('https://api.canva.com/rest/v1/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_CANVA_CLIENT_ID}:${process.env.CANVA_CLIENT_SECRET}`).toString('base64')}`
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  })
  
  if (!response.ok) {
    throw new Error('Failed to refresh token')
  }
  
  return response.json()
}