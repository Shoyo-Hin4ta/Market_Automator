import { createClient } from '@/app/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { NotionService } from '@/app/services/notion'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { integrationToken } = await request.json()

    if (!integrationToken) {
      return NextResponse.json(
        { error: 'Integration token is required' },
        { status: 400 }
      )
    }

    const notion = new NotionService(integrationToken)
    const isValid = await notion.testConnection()

    return NextResponse.json({ 
      success: isValid,
      message: isValid ? 'Connection successful' : 'Invalid integration token'
    })
  } catch (error) {
    console.error('Failed to test Notion connection:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to test connection' },
      { status: 500 }
    )
  }
}