import { createClient } from '@/app/lib/supabase/server'
import { AIContentService } from '@/app/services/ai-content'
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
      generatePalettes = false,
      colorPreference,
      tone,
      style,
      selectedPalette
    } = await request.json()
    
    const aiService = new AIContentService(apiKeyData.encrypted_key)
    const latestMessage = messages[messages.length - 1].content
    
    // Check if this is a refinement or initial generation
    const isRefinement = currentEmail || currentLanding
    
    if (isRefinement) {
      // Refine existing content based on instruction
      let emailHtml = currentEmail
      let landingHtml = currentLanding
      
      if (selectedChannels.includes('email') && currentEmail) {
        emailHtml = await aiService.refineContent(currentEmail, latestMessage, 'email')
      }
      if ((selectedChannels.includes('github') || selectedChannels.includes('landing')) && currentLanding) {
        landingHtml = await aiService.refineContent(currentLanding, latestMessage, 'landing')
      }
      
      return NextResponse.json({
        email: emailHtml,
        landing: landingHtml,
        message: 'I\'ve updated the content based on your feedback. Check the preview!',
        context: null
      })
    }
    
    // Handle color palette generation
    if (generatePalettes && colorPreference) {
      const colorPalettes = await aiService.generateColorPalettes(
        colorPreference,
        tone || 'professional',
        style || 'modern'
      )
      
      const paletteMessage = await aiService.generatePaletteMessage(colorPalettes)
      
      return NextResponse.json({
        email: null,
        landing: null,
        message: paletteMessage,
        colorPalettes,
        needsPaletteSelection: true
      })
    }
    
    // Handle content generation with selected palette
    if (selectedPalette) {
      const context = await aiService.extractContext(latestMessage, messages, selectedPalette)
      
      let emailHtml = null
      let landingHtml = null
      
      // Generate content with the selected palette
      if (selectedChannels.includes('email')) {
        emailHtml = await aiService.generateEmailContent(context, campaignName, designUrl)
      }
      if (selectedChannels.includes('github') || selectedChannels.includes('landing')) {
        landingHtml = await aiService.generateLandingPageContent(context, campaignName, designUrl)
      }
      
      const responseMessage = `Great! I've created your campaign content using the "${selectedPalette.name}" color palette. 
The content focuses on ${context.product} for ${context.audience}.`
      
      const channelInfo = selectedChannels.includes('email') && (selectedChannels.includes('github') || selectedChannels.includes('landing'))
        ? ' Both email and landing page are ready in the preview tabs.'
        : selectedChannels.includes('email')
        ? ' Your email is ready in the preview.'
        : ' Your landing page is ready in the preview.'
      
      return NextResponse.json({
        email: emailHtml,
        landing: landingHtml,
        message: responseMessage + channelInfo,
        context
      })
    }
    
    // Original flow - analyze if we have enough info
    if (!skipAnalysis) {
      const analysis = await aiService.analyzeConversation(messages)
      
      if (!analysis.hasEnoughInfo) {
        // Generate clarifying questions
        const questions = await aiService.generateClarifyingQuestions(analysis)
        
        return NextResponse.json({
          email: null,
          landing: null,
          message: questions,
          context: null,
          needsMoreInfo: true
        })
      }
    }
    
    // We have enough info, extract full context and generate content
    const context = await aiService.extractContext(latestMessage, messages)
    
    let emailHtml = null
    let landingHtml = null
    let responseMessage = ''
    
    // Generate content without color selection (fallback)
    if (selectedChannels.includes('email')) {
      emailHtml = await aiService.generateEmailContent(context, campaignName, designUrl)
    }
    if (selectedChannels.includes('github') || selectedChannels.includes('landing')) {
      landingHtml = await aiService.generateLandingPageContent(context, campaignName, designUrl)
    }
    
    responseMessage = `Perfect! I've created your campaign content focusing on ${context.product} for ${context.audience}.`
    
    if (context.ctaEnabled) {
      responseMessage += context.ctaLink && context.ctaLink !== '#' 
        ? ` The CTA buttons link to ${context.ctaLink}.`
        : ' I\'ve added CTA buttons - let me know where they should link to.'
    }
    
    // Add channel-specific info
    if (selectedChannels.includes('email') && (selectedChannels.includes('github') || selectedChannels.includes('landing'))) {
      responseMessage += ' Both email and landing page are ready in the preview tabs.'
    } else if (selectedChannels.includes('email')) {
      responseMessage += ' Your email is ready in the preview.'
    } else {
      responseMessage += ' Your landing page is ready in the preview.'
    }
    
    return NextResponse.json({
      email: emailHtml,
      landing: landingHtml,
      message: responseMessage,
      context
    })
    
  } catch (error) {
    console.error('AI refinement error:', error)
    return NextResponse.json(
      { error: 'Failed to process your request. Please try again.' },
      { status: 500 }
    )
  }
}