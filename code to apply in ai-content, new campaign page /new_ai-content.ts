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
  selectedPalette?: ColorPalette
}

interface ThemeConfig {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  fontFamily: string
  fontUrl?: string
  style: string
}

interface ColorPalette {
  id: number
  name: string
  description: string
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
  mood: string
}

interface ConversationAnalysis {
  hasEnoughInfo: boolean
  missingInfo: string[]
  suggestedQuestions: string[]
  context: Partial<CampaignContext>
}

export class AIContentService {
  private openai: ReturnType<typeof createOpenAI>
  
  constructor(apiKey: string) {
    this.openai = createOpenAI({ apiKey })
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
  "missingInfo": [array of what's missing: "product details", "target audience", "campaign purpose", "CTA decision", "CTA link", "color preference"],
  "suggestedQuestions": [array of 1-3 friendly questions to ask],
  "context": {
    "product": "extracted product info or null",
    "audience": "extracted audience or null",
    "campaignPurpose": "extracted purpose or null",
    "ctaEnabled": boolean or null,
    "ctaLink": "extracted link or null",
    "colorPreference": "extracted color preference or null"
  }
}

Rules:
- If user only provided a title/name, we definitely need more info
- We need at least: what the product/service is, who it's for, and campaign purpose
- CTA is optional but if they want one, we need the link
- Color preference is optional
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
  
  // Agent 2: Color Palette Generator - Creates 5 color palette options based on user preference
  async generateColorPalettes(colorPreference: string, tone: string, style: string): Promise<ColorPalette[]> {
    const { text } = await generateText({
      model: this.openai('gpt-4o'),
      prompt: `You are a professional color theorist and designer creating color palettes for marketing campaigns.

User's color preference: "${colorPreference}"
Campaign tone: ${tone}
Visual style: ${style}

Generate 5 distinct color palette options that match the user's preference. Return ONLY a valid JSON object with:
{
  "palettes": [
    {
      "id": 1,
      "name": "Palette Name (2-3 words)",
      "description": "Brief description of the palette mood/feeling",
      "primary": "#HEX",
      "secondary": "#HEX",
      "accent": "#HEX",
      "background": "#HEX",
      "text": "#HEX",
      "mood": "energetic/calm/professional/playful/sophisticated/bold"
    },
    // ... 4 more palettes
  ]
}

CRITICAL Rules:
- Interpret the user's color preference creatively (e.g., "little red" = palettes with red accents, not all red)
- Each palette should be distinctly different while still matching the preference
- Ensure excellent contrast between text and background colors (WCAG AA compliant)
- Background colors should be light (#f5f5f5 to #ffffff) for most palettes
- Only use dark backgrounds if specifically requested or for dramatic effect
- Consider the tone and style when selecting colors:
  - Professional: muted, sophisticated colors
  - Playful: bright, vibrant colors
  - Modern: clean, contemporary color combinations
  - Bold: high contrast, striking colors
  - Minimal: limited color palette with lots of neutrals

Examples of interpreting preferences:
- "little red" = palettes with red as accent color, not dominant
- "blue and green" = various combinations of blues and greens
- "warm" = oranges, reds, yellows, warm browns
- "corporate" = blues, grays, professional tones
- "fun" = bright, cheerful, varied colors
- "dark mode" = dark backgrounds with bright accents

Return ONLY the JSON object with 5 unique, beautiful palettes.`,
      temperature: 0.7,
      maxTokens: 1200,
    })
    
    try {
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const result = JSON.parse(cleanedText)
      return result.palettes
    } catch {
      // Fallback palettes
      return [
        {
          id: 1,
          name: "Modern Blue",
          description: "Clean and professional with a trustworthy feel",
          primary: "#2563EB",
          secondary: "#3B82F6",
          accent: "#F59E0B",
          background: "#FFFFFF",
          text: "#1F2937",
          mood: "professional"
        },
        {
          id: 2,
          name: "Warm Sunset",
          description: "Energetic and inviting with warm tones",
          primary: "#DC2626",
          secondary: "#F97316",
          accent: "#FBBF24",
          background: "#FEF3C7",
          text: "#1F2937",
          mood: "energetic"
        },
        {
          id: 3,
          name: "Nature Fresh",
          description: "Organic and calming with natural greens",
          primary: "#059669",
          secondary: "#10B981",
          accent: "#F59E0B",
          background: "#F0FDF4",
          text: "#1F2937",
          mood: "calm"
        },
        {
          id: 4,
          name: "Bold Contrast",
          description: "High impact with strong contrast",
          primary: "#1F2937",
          secondary: "#6B7280",
          accent: "#EF4444",
          background: "#FFFFFF",
          text: "#1F2937",
          mood: "bold"
        },
        {
          id: 5,
          name: "Playful Pop",
          description: "Fun and vibrant with multiple bright colors",
          primary: "#8B5CF6",
          secondary: "#EC4899",
          accent: "#14B8A6",
          background: "#FAFAFA",
          text: "#1F2937",
          mood: "playful"
        }
      ]
    }
  }
  
  // Agent 3: Theme Builder - Creates complete theme with fonts based on selected palette
  async buildThemeFromPalette(palette: ColorPalette, style: string): Promise<ThemeConfig> {
    const { text } = await generateText({
      model: this.openai('gpt-4o'),
      prompt: `You are a design expert creating a complete theme configuration.

Selected Color Palette:
- Name: ${palette.name}
- Primary: ${palette.primary}
- Secondary: ${palette.secondary}
- Accent: ${palette.accent}
- Background: ${palette.background}
- Text: ${palette.text}
- Mood: ${palette.mood}

Visual Style: ${style}

Create a complete theme configuration. Return ONLY a valid JSON object with:
{
  "fontFamily": "font-family-name",
  "fontUrl": "https://fonts.googleapis.com/css2?family=..."
}

Font selection rules based on style and mood:
- Modern + professional: Inter, Roboto, or Source Sans Pro
- Modern + playful: Poppins, Nunito, or Fredoka
- Bold + any mood: Montserrat, Bebas Neue, or Oswald
- Minimal + any mood: Inter, Helvetica, or Work Sans
- Elegant + sophisticated: Playfair Display, Lora, or Merriweather
- Retro + any mood: Bebas Neue, Righteous, or Bungee
- Tech/futuristic: Space Grotesk, Orbitron, or Exo 2

Popular Google Fonts URLs:
- Inter: https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700
- Poppins: https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700
- Montserrat: https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800
- Playfair Display: https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700
- Space Grotesk: https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700
- Bebas Neue: https://fonts.googleapis.com/css2?family=Bebas+Neue
- Fredoka: https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600

Return ONLY the JSON object.`,
      temperature: 0.3,
      maxTokens: 300,
    })
    
    try {
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const fontConfig = JSON.parse(cleanedText)
      
      return {
        primaryColor: palette.primary,
        secondaryColor: palette.secondary,
        accentColor: palette.accent,
        backgroundColor: palette.background,
        textColor: palette.text,
        fontFamily: fontConfig.fontFamily,
        fontUrl: fontConfig.fontUrl,
        style: style
      }
    } catch {
      // Fallback theme
      return {
        primaryColor: palette.primary,
        secondaryColor: palette.secondary,
        accentColor: palette.accent,
        backgroundColor: palette.background,
        textColor: palette.text,
        fontFamily: 'Inter',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700',
        style: style
      }
    }
  }
  
  // Generate palette selection message
  async generatePaletteMessage(palettes: ColorPalette[]): Promise<string> {
    return `I've created 5 beautiful color palettes based on your preferences. Please choose the one that best fits your vision:

${palettes.map(p => `**${p.id}. ${p.name}** - ${p.description}
   Primary: ${p.primary}, Accent: ${p.accent}`).join('\n\n')}

Just type the number (1-5) of your preferred palette, and I'll use those colors for your campaign!`
  }
  
  // Updated context extraction
  async extractContext(userInput: string, messages: any[], selectedPalette?: ColorPalette): Promise<CampaignContext> {
    const analysis = await this.analyzeConversation(messages)
    
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
      
      let emailTheme, landingTheme
      if (selectedPalette) {
        const theme = await this.buildThemeFromPalette(selectedPalette, extracted.style || 'modern')
        emailTheme = theme
        landingTheme = theme
      }
      
      return {
        ...extracted,
        hasEnoughInfo: analysis.hasEnoughInfo,
        missingInfo: analysis.missingInfo,
        emailTheme,
        landingTheme,
        selectedPalette
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
        selectedPalette
      }
    }
  }
  
  // Process palette selection
  async processPaletteSelection(selection: string, palettes: ColorPalette[]): Promise<{ palette: ColorPalette | null, message: string }> {
    const num = parseInt(selection.trim())
    
    if (num >= 1 && num <= 5) {
      const palette = palettes[num - 1]
      return {
        palette,
        message: `Perfect choice! I'll use the "${palette.name}" palette for your campaign. Now let me create your content with these beautiful colors...`
      }
    }
    
    return {
      palette: null,
      message: "Please select a palette by typing a number from 1 to 5."
    }
  }
  
  // Generate clarifying questions response
  async generateClarifyingQuestions(analysis: ConversationAnalysis): Promise<string> {
    if (analysis.suggestedQuestions.length > 0) {
      return analysis.suggestedQuestions.join(' ')
    }
    
    const questionMap = {
      'product details': "Could you tell me more about what you're promoting?",
      'target audience': "Who is your ideal customer for this campaign?",
      'campaign purpose': "What's the main goal you want to achieve with this campaign?",
      'CTA decision': "Would you like to include a call-to-action button?",
      'CTA link': "Where should the CTA button link to?",
      'color preference': "What colors would you like for your campaign?"
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
4. Apply the theme colors using inline styles and CSS variables:
   <style>
     :root {
       --primary: ${theme.primaryColor};
       --secondary: ${theme.secondaryColor};
       --accent: ${theme.accentColor};
       --bg: ${theme.backgroundColor};
       --text: ${theme.textColor};
     }
     body { 
       background-color: var(--bg); 
       color: var(--text);
       font-family: '${theme.fontFamily}', sans-serif;
     }
     .btn-primary {
       background-color: var(--accent);
       color: white;
       padding: 12px 24px;
       border-radius: 6px;
       text-decoration: none;
       display: inline-block;
       font-weight: 600;
       transition: all 0.3s ease;
     }
     .btn-primary:hover {
       background-color: var(--secondary);
       transform: translateY(-2px);
     }
     h1, h2, h3 { color: var(--primary); }
     a { color: var(--secondary); }
   </style>
5. Use the specified font family throughout
6. Include the image CENTERED: <img src="${designUrl}" alt="${campaignName}" style="max-width: 100%; height: auto; margin: 0 auto; display: block;">
7. ${context.ctaEnabled ? `Include CTA button with href="${context.ctaLink || '#'}" using the accent color` : 'No CTA buttons'}
8. Email container max-width: 600px
9. Mobile responsive
10. Style should match: ${theme.style}

Color usage guidelines:
- Headers: Use primary color (${theme.primaryColor})
- Links: Use secondary color (${theme.secondaryColor})
- CTA buttons: Use accent color (${theme.accentColor})
- Background: Use background color (${theme.backgroundColor})
- Body text: Use text color (${theme.textColor})

Generate professional, themed email content that uses these exact colors throughout.`,
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
      prompt: `You are a web developer creating a landing page.

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
4. Apply theme colors throughout using CSS variables and inline styles:
   <style>
     :root {
       --primary: ${theme.primaryColor};
       --secondary: ${theme.secondaryColor};
       --accent: ${theme.accentColor};
       --bg: ${theme.backgroundColor};
       --text: ${theme.textColor};
     }
     body { 
       background-color: var(--bg); 
       color: var(--text);
       font-family: '${theme.fontFamily}', sans-serif;
     }
     .bg-primary { background-color: var(--primary) !important; }
     .bg-secondary { background-color: var(--secondary) !important; }
     .bg-accent { background-color: var(--accent) !important; }
     .text-primary { color: var(--primary) !important; }
     .text-secondary { color: var(--secondary) !important; }
     .text-accent { color: var(--accent) !important; }
     .btn-primary {
       background-color: var(--accent);
       color: white;
       padding: 12px 32px;
       border-radius: 8px;
       text-decoration: none;
       display: inline-block;
       font-weight: 600;
       transition: all 0.3s ease;
     }
     .btn-primary:hover {
       background-color: var(--secondary);
       transform: translateY(-2px);
       box-shadow: 0 10px 20px rgba(0,0,0,0.1);
     }
     h1, h2, h3 { color: var(--primary); }
     a { color: var(--secondary); }
     
     /* Section backgrounds */
     .section-primary { background-color: var(--primary); color: white; }
     .section-secondary { background-color: var(--secondary); color: white; }
     .section-light { background-color: color-mix(in srgb, var(--bg) 95%, var(--primary) 5%); }
   </style>
5. Use the specified font family throughout
6. Include the image prominently CENTERED: <img src="${designUrl}" alt="${campaignName}" class="w-full max-w-2xl mx-auto h-auto block shadow-xl rounded-lg">
7. ${context.ctaEnabled ? `Multiple CTA buttons with href="${context.ctaLink || '#'}" using the accent color` : 'No CTA buttons'}
8. Structure: Hero, Features, Image showcase, ${context.ctaEnabled ? 'CTA sections,' : ''} Footer
9. Style should match: ${theme.style}
10. Fully responsive

Color usage throughout the page:
- Hero section: Primary color background or gradient
- Section backgrounds: Alternate between background color and light tints
- Headlines: Primary color
- CTA buttons: Accent color with hover effects
- Icons and highlights: Accent color
- Footer: Primary or secondary color background

Generate a high-converting, beautifully themed landing page using these exact colors.`,
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
6. Preserve all CSS variables and theme colors unless specifically asked to change them

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
}