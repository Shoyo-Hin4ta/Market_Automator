'use client'

import { useState, useEffect } from 'react'
import { BaseIntegrationSection } from './BaseIntegrationSection'
import { Button } from '@/components/ui/button'
import { Palette } from 'lucide-react'
import { useToast } from '@/app/hooks/use-toast'

export function CanvaSection() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  const { toast } = useToast()
  
  useEffect(() => {
    checkCanvaConnection()
  }, [])
  
  const checkCanvaConnection = async () => {
    try {
      const response = await fetch('/api/integrations/canva')
      if (response.ok) {
        const data = await response.json()
        setIsConnected(data.connected)
        setUserProfile(data.profile)
      }
    } catch (error) {
      console.error('Failed to check Canva connection:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleConnect = async () => {
    try {
      const response = await fetch('/api/integrations/canva/auth', {
        method: 'POST'
      })
      const { authUrl } = await response.json()
      window.location.href = authUrl
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to initiate Canva authentication',
        variant: 'destructive'
      })
    }
  }
  
  const handleDisconnect = async () => {
    try {
      await fetch('/api/integrations/canva', { 
        method: 'DELETE' 
      })
      setIsConnected(false)
      setUserProfile(null)
      toast({
        title: 'Disconnected',
        description: 'Your Canva account has been disconnected'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disconnect Canva',
        variant: 'destructive'
      })
    }
  }
  
  return (
    <BaseIntegrationSection
      title="Canva"
      description="Connect to Canva for creating and managing visual content"
      icon={<Palette className="w-5 h-5" />}
      isConnected={isConnected}
    >
      <div className="space-y-4">
        {!isConnected ? (
          <div>
            <p className="text-sm mb-4 text-magical-secondary">
              Connect your Canva account to access your designs
            </p>
            <Button onClick={handleConnect} disabled={isLoading}>
              Connect Canva Account
            </Button>
          </div>
        ) : (
          <div>
            <div className="p-4 rounded-lg mb-4" style={{ background: 'rgba(251, 191, 36, 0.1)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--wizard-gold-light)' }}>Connected Account</p>
              {userProfile && (
                <p className="text-xs mt-1 text-magical-secondary">
                  {userProfile.display_name || userProfile.email}
                </p>
              )}
            </div>
            <Button variant="destructive" onClick={handleDisconnect}>
              Disconnect
            </Button>
          </div>
        )}
      </div>
    </BaseIntegrationSection>
  )
}