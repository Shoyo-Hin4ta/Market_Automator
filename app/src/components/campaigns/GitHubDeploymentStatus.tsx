'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, Loader2, AlertCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'

interface GitHubDeploymentStatusProps {
  githubUrl: string
  onDeploymentComplete?: () => void
}

export function GitHubDeploymentStatus({ githubUrl, onDeploymentComplete }: GitHubDeploymentStatusProps) {
  const [status, setStatus] = useState<'checking' | 'building' | 'deployed' | 'error'>('checking')
  const [progress, setProgress] = useState(0)
  const [checkCount, setCheckCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!githubUrl) return

    const checkDeployment = async () => {
      try {
        let pagesUrl = githubUrl
        
        // Check if it's a GitHub repo URL and convert to Pages URL
        const repoMatch = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
        if (repoMatch) {
          const [_, username, repo] = repoMatch
          pagesUrl = `https://${username}.github.io/${repo.replace(/\.git$/, '')}/`
        }
        
        // Check if it's already a GitHub Pages URL
        const pagesMatch = githubUrl.match(/([^\/]+)\.github\.io\/([^\/]+)/)
        if (!repoMatch && !pagesMatch) {
          setError('Invalid GitHub URL format')
          setStatus('error')
          return
        }

        // Check if the page is accessible
        const response = await fetch(pagesUrl, { 
          method: 'HEAD',
          mode: 'no-cors' // Avoid CORS issues
        })

        // Since no-cors mode, we can't read the response status
        // We'll use a different approach - try to fetch with a timeout
        const checkWithTimeout = new Promise((resolve, reject) => {
          fetch(pagesUrl)
            .then(res => {
              if (res.ok || res.status === 200) {
                resolve('deployed')
              } else if (res.status === 404) {
                resolve('building')
              } else {
                resolve('checking')
              }
            })
            .catch(() => resolve('building'))

          setTimeout(() => resolve('building'), 3000)
        })

        const result = await checkWithTimeout
        setStatus(result as any)

        if (result === 'deployed') {
          setProgress(100)
          onDeploymentComplete?.()
        } else {
          // Update progress based on check count
          const estimatedProgress = Math.min(checkCount * 10, 90)
          setProgress(estimatedProgress)
        }
      } catch (error) {
        console.error('Deployment check error:', error)
        // Don't set error state for network issues, just keep checking
      }
    }

    // Initial check
    checkDeployment()

    // Set up polling interval
    const interval = setInterval(() => {
      if (status === 'deployed' || status === 'error') {
        clearInterval(interval)
        return
      }

      setCheckCount(prev => prev + 1)
      checkDeployment()

      // Stop checking after 10 minutes
      if (checkCount > 60) {
        clearInterval(interval)
        setError('Deployment is taking longer than expected. The page should be available soon.')
        setStatus('error')
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [githubUrl, status, checkCount])

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      case 'building':
        return <Circle className="h-5 w-5 text-yellow-500 animate-pulse" />
      case 'deployed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'checking':
        return 'Checking deployment status...'
      case 'building':
        return 'GitHub Pages is building your site...'
      case 'deployed':
        return 'Your landing page is live!'
      case 'error':
        return error || 'Deployment check failed'
    }
  }

  const getProgressText = () => {
    if (status === 'deployed') return 'Deployment complete!'
    if (status === 'error') return 'Check manually'
    
    const estimatedMinutes = Math.max(1, Math.ceil((100 - progress) / 20))
    return `Estimated time remaining: ${estimatedMinutes} minute${estimatedMinutes > 1 ? 's' : ''}`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>

      {status !== 'error' && (
        <>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">{getProgressText()}</p>
        </>
      )}

      {status === 'building' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            GitHub Pages typically takes 2-10 minutes to deploy. We'll keep checking for you.
          </AlertDescription>
        </Alert>
      )}

      {status === 'deployed' && (
        <Button
          onClick={() => window.open(githubUrl.replace('github.com', 'github.io').replace(/\.git$/, ''), '_blank')}
          className="w-full"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          View Live Landing Page
        </Button>
      )}

      {status === 'error' && (
        <div className="space-y-2">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button
            variant="outline"
            onClick={() => {
              setStatus('checking')
              setCheckCount(0)
              setProgress(0)
              setError(null)
            }}
          >
            Retry Check
          </Button>
        </div>
      )}
    </div>
  )
}