import { createClient } from '@/app/src/lib/supabase/server'
import { OpenAIService } from '@/app/src/services/openai'
import { EMAIL_PROMPT_TEMPLATE, fillTemplate } from '@/app/src/lib/ai/prompts'
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
    const { campaignName, designUrl, tone } = await request.json()
    
    // Create a custom prompt that works with the available data
    const prompt = `You are a professional email marketing copywriter. Create an engaging marketing email for a campaign.

Campaign Name: ${campaignName}
Tone: ${tone || 'professional'}
${designUrl ? `Design Reference: ${designUrl}` : ''}

Generate a complete marketing email with:
1. Subject line (max 60 characters)
2. Preview text (max 100 characters)  
3. Full HTML email body with:
   - Greeting
   - Main content (2-3 paragraphs) promoting "${campaignName}"
   - Clear call-to-action button
   - Professional closing

Return the response as JSON with this structure:
{
  "subject": "subject line here",
  "preview": "preview text here",
  "html": "<html>full email HTML here</html>"
}`
    
    // Generate content using OpenAI
    const openaiService = new OpenAIService(apiKey)
    const generatedText = await openaiService.generateEmailContent(prompt)
    
    // Parse the JSON response from OpenAI
    try {
      const emailContent = JSON.parse(generatedText)
      return NextResponse.json(emailContent)
    } catch (parseError) {
      // If parsing fails, return a structured response
      return NextResponse.json({
        subject: `Introducing ${campaignName}`,
        preview: `Don't miss out on ${campaignName}`,
        html: generatedText // Use the raw text as HTML fallback
      })
    }
  } catch (error) {
    console.error('Email generation error:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Failed to generate email content'
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'OpenAI API key is invalid or missing'
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'OpenAI rate limit exceeded. Please try again later.'
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}