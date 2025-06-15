'use client'

import { useState, useEffect } from 'react'
import { Campaign } from '@/types/campaign'

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/campaigns')
      
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns')
      }
      
      const data = await response.json()
      setCampaigns(data.campaigns || [])
    } catch (err) {
      console.error('Error fetching campaigns:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch campaigns')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  return {
    campaigns,
    loading,
    error,
    refetch: fetchCampaigns
  }
}