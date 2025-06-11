'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Github, ExternalLink, Loader2 } from 'lucide-react'
import { BaseIntegrationSection } from './BaseIntegrationSection'
import { TestConnection } from './TestConnection'
import { useToast } from '@/app/src/hooks/use-toast'

export function GitHubSection() {
  const [pat, setPat] = useState('')
  const [username, setUsername] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isTested, setIsTested] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [testPageUrl, setTestPageUrl] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    // Check if already connected
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/integrations/github')
        if (response.ok) {
          const data = await response.json()
          setIsConnected(data.isConnected)
          if (data.username) {
            setUsername(data.username)
          }
        }
      } catch (error) {
        console.error('Failed to check GitHub connection:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkConnection()
  }, [])

  const handleTest = async () => {
    if (!username) {
      toast({
        title: 'Username required',
        description: 'Please enter your GitHub username',
        variant: 'destructive'
      })
      return false
    }
    
    if (!pat) {
      toast({
        title: 'Personal Access Token required',
        description: 'Please enter your GitHub PAT',
        variant: 'destructive'
      })
      return false
    }
    
    try {
      const response = await fetch('/api/integrations/github/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pat, username }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: 'Connection successful',
          description: `Connected to GitHub as ${username}`
        })
        setIsTested(true)
        return true
      } else {
        toast({
          title: 'Connection failed',
          description: 'Please check your PAT and username',
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
      const response = await fetch('/api/integrations/github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pat, username }),
      })
      
      if (response.ok) {
        setIsConnected(true)
        setIsTested(false)
        setPat('') // Clear the PAT from memory
        
        toast({
          title: 'GitHub connected',
          description: 'Your GitHub credentials have been saved securely'
        })
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save GitHub credentials',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save GitHub credentials',
        variant: 'destructive'
      })
    }
  }

  const handleGenerateTestPage = async () => {
    setIsGenerating(true)
    setTestPageUrl('')
    
    try {
      const response = await fetch('/api/integrations/github/test-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      
      if (response.ok && data.url) {
        setTestPageUrl(data.url)
        toast({
          title: 'Test page created!',
          description: data.message || 'Click the link to view your test landing page'
        })
      } else {
        // Handle repository not found error
        if (data.createRepoUrl) {
          toast({
            title: data.error || 'Repository not found',
            description: 'Click here to create the repository',
            variant: 'destructive',
            action: {
              label: 'Create Repo',
              onClick: () => window.open(data.createRepoUrl, '_blank')
            }
          })
        } else {
          toast({
            title: 'Failed to create test page',
            description: data.error || 'Please try again',
            variant: 'destructive'
          })
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate test page',
        variant: 'destructive'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  if (isLoading) {
    return (
      <BaseIntegrationSection
        title="GitHub"
        description="Connect GitHub to create landing pages for your campaigns"
        icon={<Github className="w-5 h-5" />}
        isConnected={false}
      >
        <div className="space-y-4">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </BaseIntegrationSection>
    )
  }

  return (
    <BaseIntegrationSection
      title="GitHub"
      description="Connect GitHub to create landing pages for your campaigns"
      icon={<Github className="w-5 h-5" />}
      isConnected={isConnected}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="github-username">Username</Label>
          <Input
            id="github-username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              setIsTested(false)
            }}
            placeholder="your-github-username"
            disabled={isConnected}
          />
        </div>
        
        <div>
          <Label htmlFor="github-pat">Personal Access Token</Label>
          <Input
            id="github-pat"
            type="password"
            value={pat}
            onChange={(e) => {
              setPat(e.target.value)
              setIsTested(false)
            }}
            placeholder="ghp_..."
            disabled={isConnected}
          />
          <p className="text-sm text-muted-foreground mt-1">
            Create a PAT with repo scope in GitHub settings
          </p>
        </div>
        
        {!isConnected && (
          <TestConnection
            onTest={handleTest}
            onSave={handleSave}
            canTest={!!pat && !!username}
            canSave={isTested}
          />
        )}
        
        {isConnected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleGenerateTestPage}
                disabled={isGenerating}
                variant="outline"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Github className="mr-2 h-4 w-4" />
                    Generate Test Landing Page
                  </>
                )}
              </Button>
            </div>
            
            {testPageUrl && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm text-muted-foreground">Test page created successfully!</p>
                <a
                  href={testPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Preview your landing page
                </a>
                <p className="text-xs text-muted-foreground">
                  This is a preview. For permanent hosting, enable GitHub Pages in your repository.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </BaseIntegrationSection>
  )
}