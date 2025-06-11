import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getValidCanvaToken } from '@/lib/canva/token-manager'
import { CanvaService } from '@/services/canva'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const token = await getValidCanvaToken(user.id)
    const canva = new CanvaService(token)
    
    // Get continuation token from query params for pagination
    const searchParams = request.nextUrl.searchParams
    const continuation = searchParams.get('continuation')
    
    // Fetch designs using the Canva API
    const response = await canva.listDesigns(50, continuation || undefined)
    
    return NextResponse.json({ 
      designs: response.items,
      continuation: response.continuation 
    })
  } catch (error) {
    console.error('Failed to fetch designs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch designs' }, 
      { status: 500 }
    )
  }
}