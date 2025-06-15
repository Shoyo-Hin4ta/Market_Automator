'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { FileText, ExternalLink, Database, Loader2 } from 'lucide-react'
import { BaseIntegrationSection } from './BaseIntegrationSection'
import { TestConnection } from './TestConnection'
import { useToast } from '@/app/hooks/use-toast'

export function NotionSection() {
  const [integrationToken, setIntegrationToken] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [databaseId, setDatabaseId] = useState('')
  const [databaseUrl, setDatabaseUrl] = useState('')
  const [isCreatingDatabase, setIsCreatingDatabase] = useState(false)
  const [hasTestedConnection, setHasTestedConnection] = useState(false)
  const [isPopulatingTestData, setIsPopulatingTestData] = useState(false)
  const { toast } = useToast()

  // Fetch connection status on mount
  useEffect(() => {
    fetchConnectionStatus()
  }, [])

  const fetchConnectionStatus = async () => {
    try {
      const response = await fetch('/api/integrations/notion')
      if (response.ok) {
        const data = await response.json()
        setIsConnected(data.isConnected)
        if (data.database) {
          setDatabaseId(data.database.id)
          setDatabaseUrl(data.database.url)
        }
      }
    } catch (error) {
      console.error('Failed to fetch connection status:', error)
    }
  }


  const handleTest = async () => {
    const response = await fetch('/api/integrations/notion/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ integrationToken })
    })

    const data = await response.json()
    
    if (data.success) {
      toast({
        title: 'Connection successful',
        description: 'Your Notion integration is working correctly.'
      })
      setHasTestedConnection(true)
    } else {
      toast({
        title: 'Connection failed',
        description: data.message || 'Please check your integration token.',
        variant: 'destructive'
      })
      setHasTestedConnection(false)
    }
    
    return data.success
  }

  const handleSave = async () => {
    try {
      setIsCreatingDatabase(true)
      
      // First, save the integration token
      const saveResponse = await fetch('/api/integrations/notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integrationToken,
          createDatabase: true
        })
      })

      if (!saveResponse.ok) {
        throw new Error('Failed to save integration')
      }

      const saveData = await saveResponse.json()
      
      if (saveData.database) {
        setDatabaseId(saveData.database.id)
        setDatabaseUrl(saveData.database.url)
      }

      setIsConnected(true)
      
      toast({
        title: 'Notion connected',
        description: saveData.database?.id === databaseId 
          ? 'Credentials updated successfully!' 
          : 'Database created successfully! Please grant full access to the integration in Notion settings.'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save Notion credentials',
        variant: 'destructive'
      })
    } finally {
      setIsCreatingDatabase(false)
    }
  }

  const handlePopulateTestData = async () => {
    setIsPopulatingTestData(true)
    try {
      const response = await fetch('/api/integrations/notion/databases/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to populate test data')
      }

      const data = await response.json()
      
      toast({
        title: 'Test data added',
        description: `Created ${data.createdPages.filter((p: any) => !p.error).length} test campaigns in your Notion database.`
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to populate test data',
        variant: 'destructive'
      })
    } finally {
      setIsPopulatingTestData(false)
    }
  }

  return (
    <BaseIntegrationSection
      title="Notion"
      description="Connect your Notion workspace to create campaign databases"
      icon={<FileText className="h-5 w-5" />}
      isConnected={isConnected}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="notion-token">Integration Token</Label>
          <Input
            id="notion-token"
            type="password"
            value={integrationToken}
            onChange={(e) => setIntegrationToken(e.target.value)}
            placeholder="secret_..."
            disabled={isConnected}
          />
          <p className="text-sm text-magical-secondary">
            Get your integration token from{' '}
            <a 
              href="https://www.notion.so/my-integrations" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: 'var(--wizard-gold)' }}
            >
              notion.so/my-integrations
            </a>
          </p>
        </div>
        
        {!isConnected && hasTestedConnection && (
          <div className="p-4 rounded-lg" style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
            <p className="text-sm" style={{ color: 'var(--wizard-gold-light)' }}>
              <strong>Important:</strong> Before saving, make sure you've shared at least one page with your integration in Notion.
            </p>
          </div>
        )}
        
        {databaseUrl && isConnected && (
          <div className="p-4 rounded-lg" style={{ background: 'rgba(251, 191, 36, 0.1)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--wizard-gold-light)' }}>Marketing Campaigns Database</p>
            <p className="text-xs mt-1 text-magical-secondary">ID: {databaseId}</p>
            <div className="mt-2 space-y-3">
              <div className="flex gap-2">
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto"
                  onClick={() => window.open(databaseUrl, '_blank')}
                >
                  View Database <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePopulateTestData}
                  disabled={isPopulatingTestData}
                >
                  {isPopulatingTestData ? (
                    <>
                      <Database className="mr-2 h-3 w-3 animate-pulse" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-3 w-3" />
                      Add Test Data
                    </>
                  )}
                </Button>
              </div>
              <div className="space-y-2 text-xs">
                <p style={{ color: 'var(--wizard-gold)' }}>
                  ⚠️ <strong>Action Required:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-magical-secondary">
                  <li>Click "View Database" above</li>
                  <li>Grant full access to this integration in Notion</li>
                  <li>Optionally, move the database to your workspace root</li>
                </ol>
              </div>
            </div>
          </div>
        )}
        
        <TestConnection
          onTest={handleTest}
          onSave={handleSave}
          canTest={!!integrationToken}
          canSave={!!integrationToken && hasTestedConnection}
          disabled={isConnected || isCreatingDatabase}
          testLabel={isConnected ? 'Connected' : 'Test Connection'}
          saveLabel={isCreatingDatabase ? 'Creating Database...' : (databaseId && !isConnected ? 'Update Credentials' : 'Create Database & Save')}
        />
      </div>
    </BaseIntegrationSection>
  )
}