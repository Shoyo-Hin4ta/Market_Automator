import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'

// GET - Check connection status
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { data } = await supabase
    .from('api_keys')
    .select('metadata')
    .eq('user_id', user.id)
    .eq('service', 'canva')
    .single()
  
  if (!data) {
    return NextResponse.json({ connected: false })
  }
  
  return NextResponse.json({
    connected: true,
    profile: data.metadata?.profile || null
  })
}

// DELETE - Disconnect Canva
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Get current tokens for revocation
  const { data: canvaData } = await supabase
    .from('api_keys')
    .select('encrypted_key')
    .eq('user_id', user.id)
    .eq('service', 'canva')
    .single()
  
  if (canvaData?.encrypted_key) {
    try {
      // Revoke the token
      await fetch('https://api.canva.com/rest/v1/oauth/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_CANVA_CLIENT_ID}:${process.env.CANVA_CLIENT_SECRET}`).toString('base64')}`
        },
        body: new URLSearchParams({
          token: canvaData.encrypted_key
        })
      })
    } catch (error) {
      console.error('Failed to revoke token:', error)
    }
  }
  
  // Delete from database
  await supabase
    .from('api_keys')
    .delete()
    .eq('user_id', user.id)
    .eq('service', 'canva')
  
  return NextResponse.json({ success: true })
}