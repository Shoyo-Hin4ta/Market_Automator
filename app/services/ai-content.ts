import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'

interface CampaignContext {
  product: string
  audience: string
  tone: string
  style: string
  benefits: string[]
  ctaEnabled: boolean
  ctaLink?: string
  ctaText?: string
  theme?: string
  userDescription: string
  hasEnoughInfo: boolean
  missingInfo: string[]
  emailTheme?: ThemeConfig
  landingTheme?: ThemeConfig
}

interface ThemeConfig {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  fontFamily: string
  fontUrl?: string
  style: string // modern, retro, minimal, bold, etc.
}

interface PaletteOption {
  name: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  mood: string
}

interface ConversationAnalysis {
  hasEnoughInfo: boolean
  missingInfo: string[]
  suggestedQuestions: string[]
  context: Partial<CampaignContext>
}

// This file is maintained for backward compatibility but delegates to the multi-agent system
import { MultiAgentCampaignService } from './multi-agent-campaign'

export class AIContentService {
  private openai: ReturnType<typeof createOpenAI>
  private multiAgentService: MultiAgentCampaignService
  
  constructor(apiKey: string) {
    this.openai = createOpenAI({ apiKey })
    this.multiAgentService = new MultiAgentCampaignService(apiKey)
  }
  
  // Agent 1: Conversation Analyst - Determines if we have enough info
  async analyzeConversation(messages: any[]): Promise<ConversationAnalysis> {
    const { text } = await generateText({
      model: this.openai('gpt-4o'),
      prompt: `You are a helpful marketing assistant analyzing a conversation to determine if we have enough information to create a campaign.

Conversation:
${messages.map(m => `${m.role}: ${m.content}`).join('\n')}

Analyze the conversation and return ONLY a valid JSON object with:
{
  "hasEnoughInfo": boolean (true if we have enough to create content),
  "missingInfo": [array of what's missing: "product details", "target audience", "campaign purpose", "CTA decision", "CTA link", "theme preference"],
  "suggestedQuestions": [array of 1-3 friendly questions to ask],
  "context": {
    "product": "extracted product info or null",
    "audience": "extracted audience or null",
    "campaignPurpose": "extracted purpose or null",
    "ctaEnabled": boolean or null,
    "ctaLink": "extracted link or null",
    "theme": "extracted theme preference or null"
  }
}

Rules:
- If user only provided a title/name, we definitely need more info
- We need at least: what the product/service is, who it's for, and campaign purpose
- CTA is optional but if they want one, we need the link
- Theme is optional
- Questions should be conversational and friendly

Return ONLY the JSON object.`,
      temperature: 0.3,
      maxTokens: 800,
    })
    
    try {
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      return JSON.parse(cleanedText)
    } catch {
      return {
        hasEnoughInfo: false,
        missingInfo: ['product details', 'target audience', 'campaign purpose'],
        suggestedQuestions: [
          "I'd love to help you create an amazing campaign! Could you tell me more about what you're promoting?",
          "Who is your target audience for this campaign?",
          "What's the main goal of this campaign?"
        ],
        context: {}
      }
    }
  }
  
  // Generate multiple color palette options based on user preferences
  async generatePaletteOptions(description: string, brandInfo: string): Promise<PaletteOption[]> {
    const { text } = await generateText({
      model: this.openai('gpt-4o'),
      prompt: `You are a professional color consultant creating color palettes for marketing campaigns.

User's color preferences: "${description}"
Brand/Product info: "${brandInfo}"

Generate 4 distinct color palette options that match the user's preferences. Each palette should have a different mood/vibe.

Return ONLY a valid JSON array with exactly 4 palette options:
[
  {
    "name": "Palette name (2-3 words)",
    "description": "Brief description of the palette's character",
    "colors": {
      "primary": "#hex",
      "secondary": "#hex",
      "accent": "#hex",
      "background": "#hex (usually light)",
      "text": "#hex (usually dark)"
    },
    "mood": "one word mood descriptor"
  }
]

Guidelines:
- Create diverse options (e.g., one bold, one soft, one elegant, one playful)
- Ensure good contrast between text and background
- Primary should be the dominant brand color
- Secondary complements primary
- Accent should pop for CTAs
- Consider color psychology for the brand

Return ONLY the JSON array.`,
      temperature: 0.7,
      maxTokens: 1000,
    })
    
    try {
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      return JSON.parse(cleanedText)
    } catch {
      // Fallback palettes
      return [
        {
          name: "Modern Professional",
          description: "Clean and trustworthy with a tech-forward feel",
          colors: {
            primary: "#3B82F6",
            secondary: "#1E40AF",
            accent: "#F59E0B",
            background: "#FFFFFF",
            text: "#1F2937"
          },
          mood: "professional"
        },
        {
          name: "Warm Sunset",
          description: "Inviting and energetic with warm tones",
          colors: {
            primary: "#F97316",
            secondary: "#EA580C",
            accent: "#7C3AED",
            background: "#FFF7ED",
            text: "#292524"
          },
          mood: "energetic"
        },
        {
          name: "Ocean Breeze",
          description: "Calm and refreshing with cool undertones",
          colors: {
            primary: "#0EA5E9",
            secondary: "#0284C7",
            accent: "#10B981",
            background: "#F0F9FF",
            text: "#0C4A6E"
          },
          mood: "calm"
        },
        {
          name: "Bold Impact",
          description: "Strong and memorable with high contrast",
          colors: {
            primary: "#DC2626",
            secondary: "#991B1B",
            accent: "#FBBF24",
            background: "#FAFAFA",
            text: "#111827"
          },
          mood: "bold"
        }
      ]
    }
  }

  // Create theme from selected palette
  createThemeFromPalette(palette: PaletteOption, style: string): ThemeConfig {
    // Map style to appropriate font
    const fontMap: Record<string, { family: string, url: string }> = {
      modern: { 
        family: 'Inter', 
        url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700' 
      },
      professional: { 
        family: 'Playfair Display', 
        url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700' 
      },
      playful: { 
        family: 'Fredoka', 
        url: 'https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600' 
      },
      retro: { 
        family: 'Bebas Neue', 
        url: 'https://fonts.googleapis.com/css2?family=Bebas+Neue' 
      },
      elegant: {
        family: 'Playfair Display',
        url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700'
      },
      tech: { 
        family: 'Space Grotesk', 
        url: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600' 
      },
      minimal: {
        family: 'Inter',
        url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700'
      },
      bold: {
        family: 'Bebas Neue',
        url: 'https://fonts.googleapis.com/css2?family=Bebas+Neue'
      }
    }
    
    const font = fontMap[style] || fontMap.modern
    
    return {
      primaryColor: palette.colors.primary,
      secondaryColor: palette.colors.secondary,
      accentColor: palette.colors.accent,
      backgroundColor: palette.colors.background,
      textColor: palette.colors.text,
      fontFamily: font.family,
      fontUrl: font.url,
      style: palette.mood
    }
  }

  // Agent 2: Theme Generator - Creates consistent color and font themes
  async generateTheme(userInput: string, messages: any[], selectedPalette?: PaletteOption): Promise<{ emailTheme: ThemeConfig, landingTheme: ThemeConfig }> {
    const { text } = await generateText({
      model: this.openai('gpt-4o'),
      prompt: `You are a design expert creating color and font themes for marketing campaigns.

Conversation:
${messages.map(m => `${m.role}: ${m.content}`).join('\n')}

Latest input: ${userInput}

Generate theme configurations. Return ONLY a valid JSON object with:
{
  "sameTheme": boolean (true if user wants same theme for both, or didn't specify separate themes),
  "emailTheme": {
    "primaryColor": "#hex",
    "secondaryColor": "#hex",
    "accentColor": "#hex",
    "backgroundColor": "#hex",
    "textColor": "#hex",
    "fontFamily": "font-family-name",
    "fontUrl": "https://fonts.googleapis.com/css2?family=...",
    "style": "modern/retro/minimal/bold/playful/professional"
  },
  "landingTheme": {
    // same structure - if sameTheme is true, this should match emailTheme
  }
}

Rules:
- If user mentions one theme (e.g., "retro"), use it for both
- If user specifies different themes for email vs landing, respect that
- Use Google Fonts CDN URLs
- Ensure good contrast for accessibility
- Match the style to the campaign tone

Popular Google Fonts URLs:
- Modern: https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700
- Professional: https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700
- Playful: https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600
- Retro: https://fonts.googleapis.com/css2?family=Bebas+Neue
- Tech: https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600

Return ONLY the JSON object.`,
      temperature: 0.5,
      maxTokens: 800,
    })
    
    try {
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const result = JSON.parse(cleanedText)
      return {
        emailTheme: result.emailTheme,
        landingTheme: result.sameTheme ? result.emailTheme : result.landingTheme
      }
    } catch {
      // Fallback theme
      const defaultTheme: ThemeConfig = {
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        accentColor: '#F59E0B',
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        fontFamily: 'Inter',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700',
        style: 'modern'
      }
      return { emailTheme: defaultTheme, landingTheme: defaultTheme }
    }
  }
  
  // Updated context extraction with theme support
  async extractContext(userInput: string, messages: any[], selectedPalette?: PaletteOption, themeStyle?: string): Promise<CampaignContext> {
    // First, analyze if we have enough info
    const analysis = await this.analyzeConversation(messages)
    
    // Generate themes - use selected palette if provided
    let themes: { emailTheme: ThemeConfig, landingTheme: ThemeConfig }
    if (selectedPalette && themeStyle) {
      const theme = this.createThemeFromPalette(selectedPalette, themeStyle)
      themes = { emailTheme: theme, landingTheme: theme }
    } else {
      themes = await this.generateTheme(userInput, messages)
    }
    
    const { text } = await generateText({
      model: this.openai('gpt-4o'),
      prompt: `Extract campaign context from this conversation.

Conversation:
${messages.map(m => `${m.role}: ${m.content}`).join('\n')}

Latest input: ${userInput}

Extract and return ONLY a valid JSON object with:
- product: what is being promoted
- audience: target demographic
- tone: professional/casual/playful/urgent
- style: visual/design preferences
- benefits: array of key benefits
- ctaEnabled: boolean if they want a CTA
- ctaLink: the CTA link if provided
- ctaText: CTA button text
- userDescription: "${userInput}"

Return ONLY the JSON object, no markdown.`,
      temperature: 0.3,
      maxTokens: 800,
    })
    
    try {
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const extracted = JSON.parse(cleanedText)
      
      return {
        ...extracted,
        hasEnoughInfo: analysis.hasEnoughInfo,
        missingInfo: analysis.missingInfo,
        emailTheme: themes.emailTheme,
        landingTheme: themes.landingTheme
      }
    } catch {
      return {
        product: 'your product or service',
        audience: 'your target audience',
        tone: 'professional',
        style: 'modern',
        benefits: ['High quality', 'Great value', 'Excellent service'],
        ctaEnabled: true,
        ctaText: 'Learn More',
        theme: 'modern and clean',
        userDescription: userInput,
        hasEnoughInfo: false,
        missingInfo: ['product details', 'audience', 'campaign purpose'],
        emailTheme: themes.emailTheme,
        landingTheme: themes.landingTheme
      }
    }
  }
  
  // Generate clarifying questions response
  async generateClarifyingQuestions(analysis: ConversationAnalysis): Promise<string> {
    if (analysis.suggestedQuestions.length > 0) {
      return analysis.suggestedQuestions.join(' ')
    }
    
    // Fallback questions
    const questionMap = {
      'product details': "Could you tell me more about what you're promoting?",
      'target audience': "Who is your ideal customer for this campaign?",
      'campaign purpose': "What's the main goal you want to achieve with this campaign?",
      'CTA decision': "Would you like to include a call-to-action button?",
      'CTA link': "Where should the CTA button link to?",
      'theme preference': "Do you have any color or style preferences?"
    }
    
    const questions = analysis.missingInfo
      .slice(0, 3)
      .map(info => questionMap[info as keyof typeof questionMap])
      .filter(Boolean)
    
    return questions.join(' ') || "Could you tell me more about your campaign?"
  }
  
  async generateEmailContent(context: CampaignContext, campaignName: string, designUrl?: string): Promise<string> {
    const theme = context.emailTheme!
    
    const { text } = await generateText({
      model: this.openai('gpt-4o'),
      prompt: `You are a marketing expert creating an email campaign.

User's Campaign Description: "${context.userDescription}"

Theme Configuration:
- Primary Color: ${theme.primaryColor}
- Secondary Color: ${theme.secondaryColor}
- Accent Color: ${theme.accentColor}
- Background: ${theme.backgroundColor}
- Text Color: ${theme.textColor}
- Font Family: ${theme.fontFamily}
- Style: ${theme.style}

Create a complete marketing email HTML based on the user's description.

CRITICAL INSTRUCTIONS:
1. Return ONLY HTML code - no markdown, no explanations
2. Start with <!DOCTYPE html> and end with </html>
3. Include these CDN links in <head>:
   - <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
   - ${theme.fontUrl ? `<link href="${theme.fontUrl}" rel="stylesheet">` : ''}
4. Apply the theme colors using inline styles and CSS variables
5. Use the specified font family: font-family: '${theme.fontFamily}', sans-serif;
6. Include the image CENTERED: <img src="${designUrl}" alt="${campaignName}" style="max-width: 100%; height: auto; margin: 0 auto; display: block;">
7. ${context.ctaEnabled ? `Include CTA button with href="${context.ctaLink || '#'}" styled with accent color` : 'No CTA buttons'}
8. Email container max-width: 600px
9. Mobile responsive
10. Style should match: ${theme.style}

Generate professional, themed email content.`,
      temperature: 0.7,
      maxTokens: 4000,
    })
    
    const cleanedHtml = text
      .replace(/^```html\n?/i, '')
      .replace(/```$/i, '')
      .replace(/^```\n?/i, '')
      .trim()
    
    if (!cleanedHtml.toLowerCase().startsWith('<!doctype')) {
      return `<!DOCTYPE html>\n${cleanedHtml}`
    }
    
    return cleanedHtml
  }
  
  async generateLandingPageContent(context: CampaignContext, campaignName: string, designUrl?: string): Promise<string> {
    const theme = context.landingTheme!
    
    const { text } = await generateText({
      model: this.openai('gpt-4o'),
      prompt: `You are an expert web developer creating a premium, high-converting landing page.

User's Campaign Description: "${context.userDescription}"

Theme Configuration:
- Primary Color: ${theme.primaryColor}
- Secondary Color: ${theme.secondaryColor}
- Accent Color: ${theme.accentColor}
- Background: ${theme.backgroundColor}
- Text Color: ${theme.textColor}
- Font Family: ${theme.fontFamily}
- Style: ${theme.style}

Create a complete landing page HTML based on the user's description.

CRITICAL INSTRUCTIONS:
1. Return ONLY HTML code - no markdown, no explanations
2. Start with <!DOCTYPE html> and end with </html>
3. Include these CDN links in <head>:
   - <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
   - <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
   - ${theme.fontUrl ? `<link href="${theme.fontUrl}" rel="stylesheet">` : ''}
4. Apply theme colors throughout using inline styles and CSS
5. Use the specified font family: font-family: '${theme.fontFamily}', sans-serif;
6. Include the image prominently CENTERED: <img src="${designUrl}" alt="${campaignName}" class="w-full max-w-2xl mx-auto h-auto block">
7. ${context.ctaEnabled ? `Multiple CTA buttons with href="${context.ctaLink || '#'}" styled with accent color` : 'No CTA buttons'}
8. Structure: Hero, Features, Image showcase, ${context.ctaEnabled ? 'CTA sections,' : ''} Footer
9. Style should match: ${theme.style}
10. Fully responsive

PREMIUM UX GUIDELINES:
- NO bouncing animations or overly playful effects
- Use subtle, sophisticated animations only:
  - Smooth fade-ins on scroll (opacity transitions)
  - Gentle hover effects (scale: 1.02-1.05 max)
  - Smooth color transitions (0.3s ease)
  - Professional parallax effects if appropriate
- Focus on:
  - Clean, generous white space
  - Clear visual hierarchy
  - Premium typography with proper line-height
  - Subtle shadows and depth (box-shadow, not drop-shadow)
  - Smooth scroll behavior
  - Professional micro-interactions
- Avoid:
  - Bouncing/pulsing animations
  - Rotating elements
  - Excessive movement
  - Distracting effects

Create a landing page that feels expensive, trustworthy, and conversion-focused.`,
      temperature: 0.7,
      maxTokens: 5000,
    })
    
    const cleanedHtml = text
      .replace(/^```html\n?/i, '')
      .replace(/```$/i, '')
      .replace(/^```\n?/i, '')
      .trim()
    
    if (!cleanedHtml.toLowerCase().startsWith('<!doctype')) {
      return `<!DOCTYPE html>\n${cleanedHtml}`
    }
    
    return cleanedHtml
  }
  
  async refineContent(currentContent: string, instruction: string, type: 'email' | 'landing'): Promise<string> {
    const { text } = await generateText({
      model: this.openai('gpt-4o'),
      prompt: `Modify this ${type} HTML based on the user's instruction.

Current HTML:
${currentContent}

User's Instruction: "${instruction}"

CRITICAL INSTRUCTIONS:
1. Return ONLY the complete modified HTML - no markdown, no explanations
2. Start with <!DOCTYPE html> and end with </html>
3. Apply the requested changes while preserving all functionality
4. Maintain all CDN links, fonts, and color schemes
5. Keep the same overall structure unless specifically asked to change it

Output only the modified HTML code.`,
      temperature: 0.5,
      maxTokens: 5000,
    })
    
    const cleanedHtml = text
      .replace(/^```html\n?/i, '')
      .replace(/```$/i, '')
      .replace(/^```\n?/i, '')
      .trim()
    
    if (!cleanedHtml.toLowerCase().startsWith('<!doctype')) {
      return `<!DOCTYPE html>\n${cleanedHtml}`
    }
    
    return cleanedHtml
  }
  
  async generateScrollytellingContent(
    campaignName: string, 
    context: CampaignContext,
    theme: ThemeConfig
  ): Promise<any> {
    const { text } = await generateText({
      model: this.openai('gpt-4o'),
      prompt: `Create content for a magical scrollytelling landing page with 5 sections.
      
Campaign: ${campaignName}
Product: ${context.product}
Audience: ${context.audience}
Purpose: ${context.userDescription}
Tone: ${context.tone}
CTA: ${context.ctaEnabled ? `"${context.ctaText}" → ${context.ctaLink}` : 'No CTA'}

Theme Colors:
- Primary: ${theme.primaryColor}
- Secondary: ${theme.secondaryColor}
- Accent: ${theme.accentColor}

Generate ONLY a valid JSON object with magical/wizard metaphors throughout:
{
  "hero": {
    "title": "Magical headline with product name",
    "subtitle": "2-3 sentences setting the magical journey",
    "cta": "${context.ctaEnabled ? context.ctaText : 'Discover the Magic'}"
  },
  "transformation": {
    "title": "The Transformation",
    "description": "How this ${context.product} transforms their business/life (2-3 sentences)"
  },
  "distribution": {
    "title": "The Distribution Spell",
    "description": "Benefits of ${context.product} spreading across multiple touchpoints (2-3 sentences)"
  },
  "results": {
    "title": "The Enchanted Results",
    "description": "Expected magical outcomes (2-3 sentences)",
    "metric1": "Key benefit metric name",
    "metric1Value": "Impressive number/percentage",
    "metric2": "Second benefit metric",
    "metric2Value": "Another impressive stat"
  },
  "portal": {
    "title": "Enter the Portal",
    "description": "Final compelling message to take action (2-3 sentences)",
    "cta": "${context.ctaEnabled ? context.ctaText : 'Begin Your Journey'}"
  }
}

Use magical/mystical language throughout while clearly conveying the value of ${context.product}.`,
      temperature: 0.7,
      maxTokens: 1500,
    })
    
    try {
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      return JSON.parse(cleanedText)
    } catch {
      // Fallback content
      return {
        hero: {
          title: `The Magic of ${context.product}`,
          subtitle: "Begin your transformative journey into a world where marketing becomes magical",
          cta: context.ctaEnabled ? context.ctaText : "Discover the Magic"
        },
        transformation: {
          title: "The Transformation",
          description: `Watch as ${context.product} transforms your approach, turning ordinary campaigns into extraordinary experiences`
        },
        distribution: {
          title: "The Distribution Spell",
          description: "Cast your message across multiple realms, reaching your audience wherever they dwell"
        },
        results: {
          title: "The Enchanted Results",
          description: "Witness the magical metrics that prove the power of your campaigns",
          metric1: "Engagement Rate",
          metric1Value: "85%",
          metric2: "ROI Increase",
          metric2Value: "3x"
        },
        portal: {
          title: "Enter the Portal",
          description: "The gateway to your marketing transformation awaits. Step through and claim your power.",
          cta: context.ctaEnabled ? context.ctaText : "Begin Your Journey"
        }
      }
    }
  }
}