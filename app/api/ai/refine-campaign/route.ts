import { createClient } from '@/app/lib/supabase/server'
import { MultiAgentCampaignService } from '@/app/services/multi-agent-campaign'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get OpenAI API key
    const { data: apiKeyData } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('user_id', user.id)
      .eq('service', 'openai')
      .single()
    
    if (!apiKeyData) {
      return NextResponse.json({ error: 'OpenAI not connected' }, { status: 400 })
    }
    
    const { 
      campaignName, 
      designUrl, 
      messages, 
      currentEmail, 
      currentLanding,
      selectedChannels,
      skipAnalysis = false,
      selectedColors,
      themeStyle,
      aiDecideColors = false
    } = await request.json()
    
    const aiService = new MultiAgentCampaignService(apiKeyData.encrypted_key)
    
    
    const latestMessage = messages[messages.length - 1].content
    
    // Check if this is a refinement or initial generation
    const isRefinement = currentEmail || currentLanding
    
    if (isRefinement) {
      // Refine existing content
      const result = await aiService.refineContent(
        {
          currentEmail,
          currentLanding,
          agentContext: {
            formData: { selectedColors, themeStyle },
            campaignName,
            designUrl,
            selectedChannels,
          },
        },
        latestMessage
      );
      
      return NextResponse.json({
        email: result.email,
        landing: result.landing,
        message: result.message,
        context: null
      })
    }
    
    // Initial generation with multi-agent system
    const formData = {
      product: '', // Extract from messages
      audience: '', // Extract from messages
      purpose: '', // Extract from messages
      tone: 'professional',
      theme: themeStyle || 'modern',
      ctaEnabled: true,
      ctaText: 'Get Started',
      ctaLink: '#',
      selectedColors: selectedColors || null, // Direct color selection or null for AI generation
      campaignName,
      designUrl,
    }
    
    // Parse the form description from the message
    const formDescriptionMatch = latestMessage.match(/I want to create a campaign for (.+?)\. My target audience is (.+?)\. The purpose of this campaign is (.+?)\./s)
    if (formDescriptionMatch) {
      formData.product = formDescriptionMatch[1]
      formData.audience = formDescriptionMatch[2]
      formData.purpose = formDescriptionMatch[3]
    }
    
    // Parse tone and theme
    const toneMatch = latestMessage.match(/I want a (\w+) tone/)
    if (toneMatch) {
      formData.tone = toneMatch[1] as any
    }
    
    const themeMatch = latestMessage.match(/with a (\w+) theme/)
    if (themeMatch) {
      formData.theme = themeMatch[1]
    }
    
    // Parse CTA info
    const ctaMatch = latestMessage.match(/Include a CTA button "(.+?)" linking to (.+)/)
    if (ctaMatch) {
      formData.ctaText = ctaMatch[1]
      formData.ctaLink = ctaMatch[2]
    } else if (latestMessage.includes('No CTA buttons needed')) {
      formData.ctaEnabled = false
    }
    
    // Generate colors if AI Decide is enabled
    if (aiDecideColors && !formData.selectedColors) {
      const { BrandAgent } = await import('@/app/services/agents/brand-agent')
      const brandAgent = new BrandAgent(apiKeyData.encrypted_key)
      const generatedColors = await brandAgent.generateColorPalette(formData)
      formData.selectedColors = generatedColors
    }
    
    const result = await aiService.generateInitialContent(
      formData,
      null, // selectedDesign
      selectedChannels
    )
    
    return NextResponse.json({
      email: result.email,
      landing: result.landing,
      message: result.message,
      context: result.context,
      generatedColors: aiDecideColors ? formData.selectedColors : null
    })
    
  } catch (error) {
    console.error('AI refinement error:', error)
    return NextResponse.json(
      { error: 'Failed to process your request. Please try again.' },
      { status: 500 }
    )
  }
}