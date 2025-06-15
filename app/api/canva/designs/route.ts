import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { getValidCanvaToken } from '@/app/lib/canva/token-manager'
import { CanvaService } from '@/app/services/canva'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    // Check if Canva is connected first
    const { data: canvaConnection } = await supabase
      .from('api_keys')
      .select('id')
      .eq('user_id', user.id)
      .eq('service', 'canva')
      .single()
    
    if (!canvaConnection) {
      return NextResponse.json({ 
        error: 'Canva not connected',
        connected: false,
        designs: [] 
      }, { status: 200 })
    }
    
    const token = await getValidCanvaToken(user.id)
    const canva = new CanvaService(token)
    
    // Get continuation token from query params for pagination
    const searchParams = request.nextUrl.searchParams
    const continuation = searchParams.get('continuation')
    
    // Fetch designs using the Canva API
    const response = await canva.listDesigns(50, continuation || undefined)
    
    return NextResponse.json({ 
      connected: true,
      designs: response.items || [],
      continuation: response.continuation 
    })
  } catch (error) {
    console.error('Failed to fetch designs:', error)
    
    // If error is about missing connection, return appropriate response
    if (error instanceof Error && error.message === 'Canva not connected') {
      return NextResponse.json({ 
        error: 'Canva not connected',
        connected: false,
        designs: [] 
      }, { status: 200 })
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch designs', connected: false }, 
      { status: 500 }
    )
  }
}