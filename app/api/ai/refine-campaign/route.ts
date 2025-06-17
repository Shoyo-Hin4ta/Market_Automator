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
      aiDecideColors = false,
      colorMode,
      colorThemeDescription
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
    
    // Parse the form description from the message with better regex handling
    const lines = latestMessage.split('\n').map(line => line.trim());
    
    // Extract product
    const productLine = lines.find(line => line.startsWith('I want to create a campaign for'));
    if (productLine) {
      formData.product = productLine.replace('I want to create a campaign for ', '').replace(/\.$/, '').trim();
    }
    
    // Extract audience
    const audienceLine = lines.find(line => line.startsWith('My target audience is'));
    if (audienceLine) {
      formData.audience = audienceLine.replace('My target audience is ', '').replace(/\.$/, '').trim();
    }
    
    // Extract purpose
    const purposeLine = lines.find(line => line.startsWith('The purpose of this campaign is'));
    if (purposeLine) {
      formData.purpose = purposeLine.replace('The purpose of this campaign is ', '').replace(/\.$/, '').trim();
    }
    
    // Parse tone and theme from the combined line
    const toneThemeLine = lines.find(line => line.includes('tone with a') && line.includes('theme'));
    if (toneThemeLine) {
      const toneMatch = toneThemeLine.match(/I want a (\w+) tone/);
      const themeMatch = toneThemeLine.match(/with a (\w+) theme/);
      if (toneMatch) formData.tone = toneMatch[1] as any;
      if (themeMatch) formData.theme = themeMatch[1];
    }
    
    // Parse CTA info
    const ctaLine = lines.find(line => line.includes('Include a CTA button') || line.includes('No CTA buttons'));
    if (ctaLine) {
      if (ctaLine.includes('No CTA buttons')) {
        formData.ctaEnabled = false;
      } else {
        const ctaMatch = ctaLine.match(/Include a CTA button "(.+?)" linking to (.+)$/);
        if (ctaMatch) {
          formData.ctaText = ctaMatch[1];
          formData.ctaLink = ctaMatch[2];
        }
      }
    }
    
    // Validate extracted data
    if (!formData.product || formData.product === 'your product or service') {
      console.error('Product extraction failed, message:', latestMessage);
      return NextResponse.json({ 
        error: 'Could not extract product information. Please ensure you filled in the product field.' 
      }, { status: 400 });
    }
    
    if (!formData.audience || formData.audience === 'your target audience') {
      console.error('Audience extraction failed, message:', latestMessage);
      return NextResponse.json({ 
        error: 'Could not extract audience information. Please ensure you filled in the target audience field.' 
      }, { status: 400 });
    }
    
    if (!formData.purpose || formData.purpose === 'your campaign purpose') {
      console.error('Purpose extraction failed, message:', latestMessage);
      return NextResponse.json({ 
        error: 'Could not extract campaign purpose. Please ensure you filled in the purpose field.' 
      }, { status: 400 });
    }
    
    // Log extracted data for debugging
    console.log('Extracted form data:', {
      product: formData.product,
      audience: formData.audience,
      purpose: formData.purpose,
      tone: formData.tone,
      theme: formData.theme,
      ctaEnabled: formData.ctaEnabled,
      ctaText: formData.ctaText,
      ctaLink: formData.ctaLink
    });
    
    // Generate colors if AI Decide or Describe mode is enabled
    if ((colorMode === 'ai' || colorMode === 'describe') && !formData.selectedColors) {
      const { BrandAgent } = await import('@/app/services/agents/brand-agent')
      const brandAgent = new BrandAgent(apiKeyData.encrypted_key)
      const generatedColors = await brandAgent.generateColorPalette(formData, colorThemeDescription)
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
      generatedColors: (colorMode === 'ai' || colorMode === 'describe') ? formData.selectedColors : null
    })
    
  } catch (error) {
    console.error('AI refinement error:', error)
    return NextResponse.json(
      { error: 'Failed to process your request. Please try again.' },
      { status: 500 }
    )
  }
}