export interface ScrollytellingContent {
  hero: {
    title: string
    subtitle: string
    cta: string
  }
  transformation: {
    title: string
    description: string
  }
  distribution: {
    title: string
    description: string
  }
  results: {
    title: string
    description: string
    metric1: string
    metric1Value: string
    metric2: string
    metric2Value: string
  }
  portal: {
    title: string
    description: string
    cta: string
  }
}

export interface ScrollytellingColors {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
}

export interface ScrollytellingCampaign {
  templateType: 'standard' | 'scrollytelling'
  content?: ScrollytellingContent
  colors?: ScrollytellingColors
  font?: string
}