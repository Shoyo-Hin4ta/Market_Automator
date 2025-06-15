import { createClient } from '@/app/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', user.id)
      .eq('service', 'notion')
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    const { data: databases } = await supabase
      .from('notion_databases')
      .select('*')
      .eq('user_id', user.id)

    return NextResponse.json({
      isConnected: !!data,
      databases: databases || [],
      database: databases?.[0] ? {
        id: databases[0].database_id,
        url: `https://notion.so/${databases[0].database_id.replace(/-/g, '')}`,
        name: databases[0].database_name
      } : null
    })
  } catch (error) {
    console.error('Failed to fetch Notion connection:', error)
    return NextResponse.json(
      { error: 'Failed to fetch connection status' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { integrationToken, createDatabase } = await request.json()

    if (!integrationToken) {
      return NextResponse.json(
        { error: 'Integration token is required' },
        { status: 400 }
      )
    }

    let databaseInfo = null
    
    // Check if user already has a database
    const { data: existingDatabases } = await supabase
      .from('notion_databases')
      .select('*')
      .eq('user_id', user.id)
    
    // If requested, create a database first
    if (createDatabase && (!existingDatabases || existingDatabases.length === 0)) {
      const { NotionService } = await import('@/app/services/notion')
      const notion = new NotionService(integrationToken)
      
      try {
        databaseInfo = await notion.createCampaignDatabase('Marketing Campaigns')
        
        if (!databaseInfo) {
          throw new Error('Failed to create database')
        }
      } catch (error: any) {
        return NextResponse.json(
          { error: error.message || 'Failed to create database' },
          { status: 400 }
        )
      }
    }
    
    // Save the API key
    const { error: keyError } = await supabase
      .from('api_keys')
      .upsert({
        user_id: user.id,
        service: 'notion',
        encrypted_key: integrationToken,
        metadata: databaseInfo ? { database_id: databaseInfo.id } : (existingDatabases?.[0] ? { database_id: existingDatabases[0].database_id } : {})
      })

    if (keyError) {
      throw keyError
    }

    // If database was created, save its info
    if (databaseInfo) {
      const { error: dbError } = await supabase
        .from('notion_databases')
        .upsert({
          user_id: user.id,
          database_id: databaseInfo.id,
          database_name: 'Marketing Campaigns'
        })

      if (dbError) {
        console.error('Failed to save database info:', dbError)
      }
    }

    // Return existing database if no new one was created
    const returnDatabase = databaseInfo || (existingDatabases?.[0] ? {
      id: existingDatabases[0].database_id,
      url: `https://notion.so/${existingDatabases[0].database_id.replace(/-/g, '')}`,
      parentPageId: null
    } : null)

    return NextResponse.json({ 
      success: true,
      database: returnDatabase
    })
  } catch (error) {
    console.error('Failed to save Notion credentials:', error)
    return NextResponse.json(
      { error: 'Failed to save credentials' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Delete API key
    const { error: keyError } = await supabase
      .from('api_keys')
      .delete()
      .eq('user_id', user.id)
      .eq('service', 'notion')

    if (keyError) {
      throw keyError
    }

    // Delete associated databases
    const { error: dbError } = await supabase
      .from('notion_databases')
      .delete()
      .eq('user_id', user.id)

    if (dbError) {
      throw dbError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete Notion connection:', error)
    return NextResponse.json(
      { error: 'Failed to delete connection' },
      { status: 500 }
    )
  }
}