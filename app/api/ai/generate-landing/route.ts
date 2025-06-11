import { createClient } from '@/app/src/lib/supabase/server'
import { OpenAIService } from '@/app/src/services/openai'
import { LANDING_PAGE_PROMPT_TEMPLATE, fillTemplate } from '@/app/src/lib/ai/prompts'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get OpenAI API key from database
    const { data: apiKeyData } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('user_id', user.id)
      .eq('service', 'openai')
      .single()
    
    if (!apiKeyData) {
      return NextResponse.json(
        { error: 'OpenAI not connected' },
        { status: 400 }
      )
    }
    
    // Decrypt API key
    const apiKey = apiKeyData.encrypted_key // Using plain text for now
    
    // Get campaign data from request
    const campaignData = await request.json()
    
    // Generate landing page content
    const openaiService = new OpenAIService(apiKey)
    const content = await openaiService.generateLandingPageContent({
      title: campaignData.title,
      description: campaignData.description,
      imageUrl: campaignData.imageUrl || ''
    })
    
    // Parse the JSON response
    try {
      const parsedContent = JSON.parse(content)
      return NextResponse.json({ content: parsedContent })
    } catch {
      // If parsing fails, return the raw content
      return NextResponse.json({ content })
    }
  } catch (error) {
    console.error('Landing page generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate landing page content' },
      { status: 500 }
    )
  }
}