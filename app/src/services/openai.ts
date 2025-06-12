import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'

export class OpenAIService {
  private apiKey: string
  private openai: ReturnType<typeof createOpenAI>
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey || ''
    // Create a custom OpenAI instance with the provided API key
    this.openai = createOpenAI({
      apiKey: this.apiKey,
    })
  }
  
  async testConnection(): Promise<boolean> {
    if (!this.apiKey) return false
    
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })
      return response.ok
    } catch (error) {
      console.error('OpenAI connection test failed:', error)
      return false
    }
  }
  
  async generateEmailContent(prompt: string) {
    const { text } = await generateText({
      model: this.openai('gpt-4o-mini'),
      prompt,
      temperature: 0.7,
      maxTokens: 2000,
    })
    return text
  }
  
  async generateLandingPageContent(designInfo: {
    title: string
    description: string
    imageUrl: string
  }) {
    const prompt = `Create compelling landing page content for a marketing campaign:
    Title: ${designInfo.title}
    Description: ${designInfo.description}
    
    Generate:
    1. A catchy headline
    2. A compelling subheadline
    3. 3-4 bullet points highlighting key benefits
    4. A call-to-action button text
    5. A brief footer text`
    
    const { text } = await generateText({
      model: this.openai('gpt-4o-mini'),
      prompt,
      temperature: 0.7,
      maxTokens: 1500,
    })
    
    return text
  }
}