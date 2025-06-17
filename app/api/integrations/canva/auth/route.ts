import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'
import { CANVA_CONFIG, generateCodeVerifier, generateCodeChallenge, generateState } from '../../../../lib/canva/config'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Generate PKCE parameters
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = generateCodeChallenge(codeVerifier)
  const state = generateState()
  
  // Construct authorization URL
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CANVA_CONFIG.clientId,
    redirect_uri: CANVA_CONFIG.redirectUri,
    scope: CANVA_CONFIG.scopes.join(' '),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  })
  
  const authUrl = `${CANVA_CONFIG.authorizationUrl}?${params}`
  
  // Return the auth URL and set cookies for the callback
  const response = NextResponse.json({ authUrl })
  
  // Store verifier and state in cookies for callback
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 600, // 10 minutes
    path: '/',
    // In development, explicitly set domain to ensure cookies work across 127.0.0.1
    ...(process.env.NODE_ENV === 'development' && { domain: '127.0.0.1' })
  }
  
  response.cookies.set('canva_code_verifier', codeVerifier, cookieOptions)
  response.cookies.set('canva_state', state, cookieOptions)
  
  return response
}