'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ExternalLink, RefreshCw, Clock, AlertCircle } from 'lucide-react'

interface GitHubPagesInfoProps {
  githubUrl: string
  createdAt: string
}

export function GitHubPagesInfo({ githubUrl, createdAt }: GitHubPagesInfoProps) {
  const [isChecking, setIsChecking] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  
  // If no GitHub URL, show a message
  if (!githubUrl) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          GitHub Pages URL not available. The landing page may still be deploying.
        </AlertDescription>
      </Alert>
    )
  }
  
  // Calculate time since creation
  const minutesSinceCreation = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000 / 60)
  const isLikelyDeployed = minutesSinceCreation > 10
  
  const handleOpenWithRefresh = () => {
    // Open in new tab
    const newWindow = window.open(githubUrl, '_blank')
    
    // Show alert about refresh
    setLastChecked(new Date())
  }
  
  const handleDirectOpen = () => {
    window.open(githubUrl, '_blank')
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm" style={{ color: '#d4a574' }}>
        <Clock className="h-4 w-4" />
        <span>Created {minutesSinceCreation} minute{minutesSinceCreation !== 1 ? 's' : ''} ago</span>
      </div>

      {minutesSinceCreation < 15 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>GitHub Pages typically takes 2-10 minutes to deploy after creation.</p>
              {minutesSinceCreation < 2 ? (
                <p className="font-medium">Your site is likely still building. Please wait a moment.</p>
              ) : minutesSinceCreation < 10 ? (
                <p className="font-medium">Your site should be available soon. Click below to check.</p>
              ) : (
                <p className="font-medium">Your site should be live now. If you see a 404, refresh the page once.</p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2">
        <Button
          onClick={handleDirectOpen}
          variant={isLikelyDeployed ? "default" : "outline"}
          className="w-full btn-magical"
          style={{
            background: isLikelyDeployed 
              ? 'linear-gradient(135deg, var(--wizard-gold) 0%, var(--wizard-gold-dark) 100%)' 
              : 'transparent',
            border: isLikelyDeployed ? 'none' : '1px solid var(--wizard-gold)',
            color: isLikelyDeployed ? 'var(--bg-primary)' : 'var(--wizard-gold)'
          }}
        >
          <ExternalLink className="mr-2 h-4 w-4" style={{ color: isLikelyDeployed ? 'var(--bg-primary)' : 'var(--wizard-gold)' }} />
          {isLikelyDeployed ? 'View Landing Page' : 'Check Landing Page'}
        </Button>
        
        {minutesSinceCreation >= 2 && minutesSinceCreation < 15 && (
          <div className="text-xs text-center" style={{ color: '#d4a574' }}>
            If you see a 404 error, refresh the page once
          </div>
        )}
      </div>

      {lastChecked && (
        <p className="text-xs text-center" style={{ color: '#d4a574' }}>
          Last checked: {lastChecked.toLocaleTimeString()}
        </p>
      )}
    </div>
  )
}