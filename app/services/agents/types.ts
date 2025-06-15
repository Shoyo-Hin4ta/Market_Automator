// Agent System Type Definitions

export interface CampaignFormData {
  product: string
  audience: string
  purpose: string
  tone: 'professional' | 'casual' | 'playful' | 'urgent' | 'friendly'
  theme: 'modern' | 'minimal' | 'bold' | 'retro' | 'elegant' | 'tech' | 'playful'
  ctaEnabled: boolean
  ctaText: string
  ctaLink: string
  selectedColors: ColorSelection  // Changed from selectedPalette
}

export interface ColorSelection {
  primary: string      // Hex color from color picker
  secondary: string    // Hex color from color picker
  accent: string      // Hex color from color picker
  background: string  // Hex color from color picker
  text: string       // Hex color from color picker
}

export interface BrandSystem {
  colors: ColorSelection  // Direct use of selected colors
  typography: {
    headingFont: string
    bodyFont: string
    fontSizes: {
      h1: string
      h2: string
      h3: string
      body: string
      small: string
    }
  }
  spacing: {
    small: string
    medium: string
    large: string
    xlarge: string
  }
  visualStyle: {
    borderRadius: string
    shadowStyle: string
    buttonStyle: string
    layoutStyle: string
  }
}

export interface ContentStrategy {
  headlines: {
    primary: string
    secondary: string
    email: string
  }
  body: {
    intro: string
    valueProps: string[]
    benefits: string[]
    socialProof?: string
  }
  cta: {
    primary: string
    secondary?: string
    urgency?: string
  }
  tone: {
    voice: string
    emotion: string
    formality: string
  }
}

export interface GeneratedContent {
  email: string
  landing: string
  metadata?: {
    brandSystem: BrandSystem
    contentStrategy: ContentStrategy
    agentInsights: Record<string, any>
    suggestedRefinements: string[]
  }
}

export interface AgentContext {
  formData: CampaignFormData
  campaignName: string
  designUrl?: string
  selectedChannels: string[]
  selectedDesign?: any
}

export interface RefinementRequest {
  currentEmail?: string
  currentLanding?: string
  userRequest: string
  context: AgentContext
}