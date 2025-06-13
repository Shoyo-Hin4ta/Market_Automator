import { createClient } from '@/app/src/lib/supabase/server'
import { AIContentService } from '@/app/src/services/ai-content'
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
      action,
      colorDescription,
      brandInfo,
      selectedPalette,
      themeStyle,
      templateType = 'standard' 
    } = await request.json()
    
    const aiService = new AIContentService(apiKeyData.encrypted_key)
    
    // Handle palette generation request
    if (action === 'generatePalettes') {
      const palettes = await aiService.generatePaletteOptions(colorDescription, brandInfo)
      return NextResponse.json({ palettes })
    }
    
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
    
    // For initial generation, check if we should skip analysis
    if (!skipAnalysis) {
      // Original flow - analyze if we have enough info
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
    const context = await aiService.extractContext(latestMessage, messages, selectedPalette, themeStyle)
    
    let emailHtml = null
    let landingHtml = null
    let responseMessage = ''
    
    // Generate content with themes
    if (selectedChannels.includes('email')) {
      emailHtml = await aiService.generateEmailContent(context, campaignName, designUrl)
    }
    if (selectedChannels.includes('github') || selectedChannels.includes('landing')) {
      if (templateType === 'scrollytelling') {
        // Generate scrollytelling content
        const scrollyContent = await aiService.generateScrollytellingContent(
          campaignName,
          context,
          context.landingTheme || context.emailTheme
        )
        
        // Import the template and generate HTML
        const { generateScrollytellingLandingPage } = await import('@/app/src/templates/scrollytelling-landing-page')
        
        landingHtml = generateScrollytellingLandingPage(
          scrollyContent,
          {
            primary: context.landingTheme?.primaryColor || '#667eea',
            secondary: context.landingTheme?.secondaryColor || '#764ba2',
            accent: context.landingTheme?.accentColor || '#fbbf24',
            background: context.landingTheme?.backgroundColor || '#0a0a0a',
            text: context.landingTheme?.textColor || '#e9d5ff'
          },
          designUrl,
          context.landingTheme?.fontFamily || 'Playfair Display'
        )
      } else {
        landingHtml = await aiService.generateLandingPageContent(context, campaignName, designUrl)
      }
    }
    
    // Create contextual response with theme info
    const themeInfo = context.emailTheme?.style === context.landingTheme?.style
      ? `I've created content with a ${context.emailTheme?.style} theme using ${context.emailTheme?.fontFamily} font.`
      : `I've created content with a ${context.emailTheme?.style} theme for email and ${context.landingTheme?.style} theme for the landing page.`
    
    responseMessage = `Perfect! ${themeInfo} The content focuses on ${context.product} for ${context.audience}.`
    
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