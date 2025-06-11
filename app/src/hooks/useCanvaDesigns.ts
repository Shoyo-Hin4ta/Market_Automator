import { useState, useEffect } from 'react'
import { CanvaDesign } from '@/types/canva'

export function useCanvaDesigns() {
  const [designs, setDesigns] = useState<CanvaDesign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const fetchDesigns = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/canva/designs')
      
      if (!response.ok) throw new Error('Failed to fetch designs')
      
      const data = await response.json()
      setDesigns(data.designs || [])
    } catch (err) {
      setError(err as Error)
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
    refetch: fetchDesigns
  }
}