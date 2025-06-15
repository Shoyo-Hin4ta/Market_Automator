import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get GitHub credentials
    const { data, error } = await supabase
      .from('api_keys')
      .select('metadata')
      .eq('user_id', user.id)
      .eq('service', 'github')
      .single()
    
    if (error && error.code !== 'PGRST116') {
      throw error
    }
    
    return NextResponse.json({
      isConnected: !!data,
      username: data?.metadata?.username || null
    })
  } catch (error) {
    console.error('Failed to fetch GitHub connection:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { pat, username } = await request.json()
    
    if (!pat || !username) {
      return NextResponse.json({ error: 'PAT and username are required' }, { status: 400 })
    }
    
    // Save to api_keys table using upsert (storing directly like Notion does)
    const { error } = await supabase
      .from('api_keys')
      .upsert({
        user_id: user.id,
        service: 'github',
        encrypted_key: pat, // Store directly without encryption for now
        metadata: { username },
        updated_at: new Date().toISOString()
      })
    
    if (error) {
      console.error('Failed to save GitHub credentials:', error)
      return NextResponse.json({ error: 'Failed to save credentials' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('GitHub integration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}