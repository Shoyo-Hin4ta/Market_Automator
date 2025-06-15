'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail } from 'lucide-react'
import { BaseIntegrationSection } from './BaseIntegrationSection'
import { TestConnection } from './TestConnection'
import { useToast } from '../../hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface MailchimpAudience {
  id: string
  name: string
  stats: {
    member_count: number
  }
}

export function MailchimpSection() {
  const [apiKey, setApiKey] = useState('')
  const [serverPrefix, setServerPrefix] = useState('')
  const [audiences, setAudiences] = useState<MailchimpAudience[]>([])
  const [selectedAudience, setSelectedAudience] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [showAudienceSelect, setShowAudienceSelect] = useState(false)
  const [testPassed, setTestPassed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  
  useEffect(() => {
    // Check if already connected
    fetch('/api/integrations/mailchimp')
      .then(res => res.json())
      .then(data => {
        if (data.connected) {
          setIsConnected(true)
          setServerPrefix(data.serverPrefix || '')
        }
      })
      .catch(error => {
        console.error('Error checking Mailchimp connection:', error)
      })
      .finally(() => setIsLoading(false))
  }, [])
  
  const handleTest = async () => {
    if (!serverPrefix) {
      toast({
        title: 'Server prefix required',
        description: 'Please enter your Mailchimp server prefix (e.g., us14)',
        variant: 'destructive'
      })
      return false
    }
    
    try {
      const response = await fetch('/api/integrations/mailchimp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, serverPrefix })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setAudiences(data.audiences || [])
        setShowAudienceSelect(true)
        setTestPassed(true)
        
        toast({
          title: 'Connection successful',
          description: `Found ${data.audiences?.length || 0} audience(s)`,
        })
        
        return true
      } else {
        toast({
          title: 'Connection failed',
          description: data.error || 'Please check your API key and server prefix',
          variant: 'destructive'
        })
        return false
      }
    } catch (error) {
      toast({
        title: 'Connection failed',
        description: 'Please check your API key and server prefix',
        variant: 'destructive'
      })
      return false
    }
  }
  
  const handleSave = async () => {
    if (!selectedAudience) {
      toast({
        title: 'Select an audience',
        description: 'Please select an audience to continue',
        variant: 'destructive'
      })
      return
    }
    
    try {
      const response = await fetch('/api/integrations/mailchimp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          apiKey, 
          serverPrefix, 
          audienceId: selectedAudience 
        })
      })
      
      if (response.ok) {
        setIsConnected(true)
        setApiKey('') // Clear sensitive data
        toast({
          title: 'Mailchimp connected',
          description: 'Your Mailchimp credentials have been saved'
        })
      } else {
        throw new Error('Failed to save credentials')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save Mailchimp credentials',
        variant: 'destructive'
      })
    }
  }
  
  if (isLoading) {
    return (
      <BaseIntegrationSection
        title="Mailchimp"
        description="Connect to Mailchimp for email marketing campaigns"
        icon={<Mail className="h-5 w-5" />}
        isConnected={false}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-10 rounded skeleton-magical"></div>
          <div className="h-10 rounded skeleton-magical"></div>
        </div>
      </BaseIntegrationSection>
    )
  }
  
  return (
    <BaseIntegrationSection
      title="Mailchimp"
      description="Connect to Mailchimp for email marketing campaigns"
      icon={<Mail className="h-5 w-5" />}
      isConnected={isConnected}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mailchimp-api-key">API Key</Label>
          <Input
            id="mailchimp-api-key"
            type="password"
            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-us14"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={isConnected}
          />
          <p className="text-sm text-magical-secondary">
            Find your API key in Account Settings → Extras → API keys
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="mailchimp-prefix">Server Prefix</Label>
          <Input
            id="mailchimp-prefix"
            value={serverPrefix}
            onChange={(e) => setServerPrefix(e.target.value)}
            placeholder="us14"
            disabled={isConnected}
          />
          <p className="text-sm text-magical-secondary">
            The server prefix from your API key (e.g., us14)
          </p>
        </div>
        
        {showAudienceSelect && audiences.length > 0 && !isConnected && (
          <div className="space-y-2">
            <Label htmlFor="audience-select">Select Audience</Label>
            <Select value={selectedAudience} onValueChange={setSelectedAudience}>
              <SelectTrigger id="audience-select">
                <SelectValue placeholder="Choose an audience" />
              </SelectTrigger>
              <SelectContent>
                {audiences.map((audience) => (
                  <SelectItem key={audience.id} value={audience.id}>
                    {audience.name} ({audience.stats.member_count} members)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {!isConnected && (
          <TestConnection
            onTest={handleTest}
            onSave={handleSave}
            canSave={testPassed && !!selectedAudience}
            canTest={!!apiKey && !!serverPrefix}
          />
        )}
      </div>
    </BaseIntegrationSection>
  )
}