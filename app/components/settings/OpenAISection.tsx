'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Brain } from 'lucide-react'
import { BaseIntegrationSection } from './BaseIntegrationSection'
import { TestConnection } from './TestConnection'
import { useToast } from '@/app/hooks/use-toast'
import { useIntegrations } from '@/app/hooks/useIntegrations'

export function OpenAISection() {
  const [apiKey, setApiKey] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const { toast } = useToast()
  const { integrations, isLoading } = useIntegrations()

  useEffect(() => {
    if (integrations?.openai) {
      setIsConnected(true)
    }
  }, [integrations])

  const handleTest = async () => {
    try {
      const response = await fetch('/api/integrations/openai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: 'Connection successful',
          description: 'Your OpenAI API key is valid'
        })
        return true
      } else {
        toast({
          title: 'Connection failed',
          description: data.message || 'Please check your API key',
          variant: 'destructive'
        })
        return false
      }
    } catch (error) {
      toast({
        title: 'Connection failed',
        description: 'An error occurred while testing the connection',
        variant: 'destructive'
      })
      return false
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/integrations/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save credentials')
      }
      
      setIsConnected(true)
      setApiKey('') // Clear the API key from UI for security
      
      toast({
        title: 'OpenAI connected',
        description: 'Your API key has been saved securely'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save OpenAI credentials',
        variant: 'destructive'
      })
    }
  }

  return (
    <BaseIntegrationSection
      title="OpenAI"
      description="Connect to OpenAI for AI-powered content generation"
      icon={<Brain className="h-5 w-5" />}
      isConnected={isConnected}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="openai-api-key">API Key</Label>
          <Input
            id="openai-api-key"
            type="password"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="text-sm text-magical-secondary">
            Get your API key from platform.openai.com/api-keys
          </p>
        </div>
        <TestConnection
          onTest={handleTest}
          onSave={handleSave}
          canSave={apiKey.length > 0}
          canTest={apiKey.length > 0}
        />
      </div>
    </BaseIntegrationSection>
  )
}