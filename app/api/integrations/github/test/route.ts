import { createClient } from '@/app/lib/supabase/server'
import { GitHubService } from '@/app/services/github'
import { NextResponse } from 'next/server'

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
    
    const github = new GitHubService(pat)
    const isConnected = await github.testConnection(username)
    
    return NextResponse.json({ success: isConnected })
  } catch (error) {
    console.error('GitHub test connection error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}