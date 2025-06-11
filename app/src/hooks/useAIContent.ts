import { useState } from 'react'

interface CampaignData {
  title: string
  description: string
  audience?: string
  imageUrl?: string
}

export function useAIContent() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const generateEmail = async (campaignData: CampaignData) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/ai/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate email content')
      }
      
      const { content } = await response.json()
      return content
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setLoading(false)
    }
  }
  
  const generateLandingPage = async (campaignData: CampaignData) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/ai/generate-landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate landing page content')
      }
      
      const { content } = await response.json()
      return content
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setLoading(false)
    }
  }
  
  return { generateEmail, generateLandingPage, loading, error }
}