import { createClient } from '@/app/src/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { apiKey } = await request.json()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }
    
    // Save to api_keys table (storing directly like Notion does)
    const { error } = await supabase
      .from('api_keys')
      .upsert({
        user_id: user.id,
        service: 'openai',
        encrypted_key: apiKey, // Store directly without encryption for now
        updated_at: new Date().toISOString()
      })
    
    if (error) {
      console.error('Failed to save OpenAI credentials:', error)
      return NextResponse.json(
        { error: 'Failed to save credentials' }, 
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('OpenAI integration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}