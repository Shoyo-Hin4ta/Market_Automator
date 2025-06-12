import { useState } from 'react'

interface CampaignData {
  campaignName: string
  designUrl?: string
  tone?: string
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
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate email content')
      }
      
      return data
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
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate landing page content')
      }
      
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setLoading(false)
    }
  }
  
  return { generateEmail, generateLandingPage, loading, error }
}