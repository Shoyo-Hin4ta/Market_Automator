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
    const { title } = await request.json()

    // Get the user's Notion integration token
    const { data: apiKey, error: keyError } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('user_id', user.id)
      .eq('service', 'notion')
      .single()

    if (keyError || !apiKey) {
      return NextResponse.json(
        { error: 'Notion integration not found' },
        { status: 404 }
      )
    }

    const notion = new NotionService(apiKey.encrypted_key)
    const databaseInfo = await notion.createCampaignDatabase(
      title || 'Marketing Campaigns'
    )
    
    if (!databaseInfo) {
      throw new Error('Failed to create database')
    }

    // Save the database info
    const { error: dbError } = await supabase
      .from('notion_databases')
      .insert({
        user_id: user.id,
        database_id: databaseInfo.id,
        database_name: title || 'Marketing Campaigns'
      })

    if (dbError && dbError.code !== '23505') { // Ignore duplicate key errors
      console.error('Failed to save database info:', dbError)
    }

    return NextResponse.json({ 
      database: databaseInfo,
      message: 'Database created successfully'
    })
  } catch (error) {
    console.error('Failed to create Notion database:', error)
    return NextResponse.json(
      { error: 'Failed to create database' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get the user's Notion integration token
    const { data: apiKey, error: keyError } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('user_id', user.id)
      .eq('service', 'notion')
      .single()

    if (keyError || !apiKey) {
      return NextResponse.json(
        { error: 'Notion integration not found' },
        { status: 404 }
      )
    }

    const notion = new NotionService(apiKey.encrypted_key)
    const databases = await notion.getDatabases()

    // Transform databases to a simpler format
    const simplifiedDatabases = databases.map((db: any) => ({
      id: db.id,
      title: db.title?.[0]?.plain_text || 'Untitled Database',
      icon: db.icon,
      url: db.url
    }))

    return NextResponse.json({ databases: simplifiedDatabases })
  } catch (error) {
    console.error('Failed to fetch Notion databases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch databases' },
      { status: 500 }
    )
  }
}