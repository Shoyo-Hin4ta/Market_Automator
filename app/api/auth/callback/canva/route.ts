import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'
import { CANVA_CONFIG } from '../../../../lib/canva/config'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  
  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(new URL('/settings?tab=canva&error=oauth_denied', request.url))
  }
  
  if (!code || !state) {
    return NextResponse.redirect(new URL('/settings?tab=canva&error=missing_params', request.url))
  }
  
  // Verify state
  const storedState = request.cookies.get('canva_state')?.value
  if (state !== storedState) {
    return NextResponse.redirect(new URL('/settings?tab=canva&error=invalid_state', request.url))
  }
  
  // Get code verifier
  const codeVerifier = request.cookies.get('canva_code_verifier')?.value
  if (!codeVerifier) {
    return NextResponse.redirect(new URL('/settings?tab=canva&error=missing_verifier', request.url))
  }
  
  try {
    // Exchange code for tokens
    const tokenResponse = await fetch(CANVA_CONFIG.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${CANVA_CONFIG.clientId}:${CANVA_CONFIG.clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: CANVA_CONFIG.redirectUri,
        code_verifier: codeVerifier
      })
    })
    
    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error('Token exchange failed:', error)
      throw new Error('Failed to exchange code for tokens')
    }
    
    const tokens = await tokenResponse.json()
    
    // Get user profile
    const profileResponse = await fetch('https://api.canva.com/rest/v1/users/me/profile', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    })
    
    if (!profileResponse.ok) {
      throw new Error('Failed to fetch user profile')
    }
    
    const profile = await profileResponse.json()
    
    // Save tokens to database
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Store unencrypted following established pattern
    await supabase.from('api_keys').upsert({
      user_id: user.id,
      service: 'canva',
      encrypted_key: tokens.access_token, // Not actually encrypted, following pattern
      metadata: {
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        scope: tokens.scope,
        profile
      }
    })
    
    // Clear cookies and redirect
    const response = NextResponse.redirect(new URL('/settings?tab=canva&success=true', request.url))
    response.cookies.delete('canva_code_verifier')
    response.cookies.delete('canva_state')
    
    return response
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(new URL('/settings?tab=canva&error=callback_failed', request.url))
  }
}