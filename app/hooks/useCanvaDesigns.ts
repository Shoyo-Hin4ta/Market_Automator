import { useState, useEffect } from 'react'
import { CanvaDesign } from '@/app/types/canva'

interface UseCanvaDesignsReturn {
  designs: CanvaDesign[]
  loading: boolean
  error: Error | null
  connected: boolean
  refetch: () => Promise<void>
}

export function useCanvaDesigns(): UseCanvaDesignsReturn {
  const [designs, setDesigns] = useState<CanvaDesign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [connected, setConnected] = useState(false)
  
  const fetchDesigns = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/canva/designs')
      
      if (!response.ok && response.status !== 200) {
        throw new Error('Failed to fetch designs')
      }
      
      const data = await response.json()
      setConnected(data.connected || false)
      setDesigns(data.designs || [])
      
      if (!data.connected && !data.error) {
        setError(new Error('Canva not connected'))
      }
    } catch (err) {
      setError(err as Error)
      setConnected(false)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchDesigns()
  }, [])
  
  return {
    designs,
    loading,
    error,
    connected,
    refetch: fetchDesigns
  }
}