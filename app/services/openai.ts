export class OpenAIService {
  private apiKey: string
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey || ''
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
}