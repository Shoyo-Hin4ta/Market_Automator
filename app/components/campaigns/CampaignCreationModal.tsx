'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CampaignCreationProgress } from './CampaignCreationProgress'
import { GitHubDeploymentStatus } from './GitHubDeploymentStatus'
import { CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import '../../styles/magical-theme.css'

interface CreationStep {
  id: string
  name: string
  status: 'pending' | 'in_progress' | 'completed' | 'error'
  error?: string
}

interface CampaignCreationModalProps {
  open: boolean
  onClose: () => void
  campaignData: any
  onSuccess?: (campaignId: string) => void
}

export function CampaignCreationModal({ 
  open, 
  onClose, 
  campaignData,
  onSuccess 
}: CampaignCreationModalProps) {
  const router = useRouter()
  const [steps, setSteps] = useState<CreationStep[]>([
    { id: 'validate', name: 'Validating campaign data', status: 'pending' },
    { id: 'mailchimp', name: 'Creating email campaign', status: 'pending' },
    { id: 'notion', name: 'Creating Notion page', status: 'pending' },
    { id: 'github', name: 'Deploying landing page', status: 'pending' },
    { id: 'save', name: 'Saving campaign', status: 'pending' }
  ])
  
  const [currentStep, setCurrentStep] = useState<string>('')
  const [campaignId, setCampaignId] = useState<string>('')
  const [githubUrl, setGithubUrl] = useState<string>('')
  const [isComplete, setIsComplete] = useState(false)
  const [hasErrors, setHasErrors] = useState(false)

  useEffect(() => {
    if (open && campaignData) {
      createCampaign()
    }
  }, [open, campaignData])

  const updateStep = (stepId: string, status: CreationStep['status'], error?: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, error } : step
    ))
    if (status === 'error') {
      setHasErrors(true)
    }
  }

  const createCampaign = async () => {
    try {
      // Reset state
      setIsComplete(false)
      setHasErrors(false)
      setCampaignId('')
      setGithubUrl('')
      
      // Step 1: Validate
      setCurrentStep('validate')
      updateStep('validate', 'in_progress')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (!campaignData.selected_channels || campaignData.selected_channels.length === 0) {
        updateStep('validate', 'error', 'No channels selected')
        return
      }
      
      updateStep('validate', 'completed')

      // Create the campaign via API
      const response = await fetch('/api/campaigns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      })

      if (!response.ok) {
        throw new Error('Failed to create campaign')
      }

      const data = await response.json()
      setCampaignId(data.campaign.id)
      
      // Update steps based on what was created
      if (data.campaign.mailchimp_campaign_id) {
        updateStep('mailchimp', 'completed')
      } else if (campaignData.selected_channels.includes('email')) {
        updateStep('mailchimp', 'error', 'Failed to create email campaign')
      } else {
        setSteps(prev => prev.filter(s => s.id !== 'mailchimp'))
      }

      if (data.campaign.notion_page_id) {
        updateStep('notion', 'completed')
      } else if (campaignData.selected_channels.includes('notion')) {
        updateStep('notion', 'error', 'Failed to create Notion page')
      } else {
        setSteps(prev => prev.filter(s => s.id !== 'notion'))
      }

      if (data.campaign.github_page_url) {
        updateStep('github', 'completed')
        setGithubUrl(data.campaign.github_page_url)
      } else if (campaignData.selected_channels.includes('github')) {
        updateStep('github', 'error', 'Failed to deploy landing page')
      } else {
        setSteps(prev => prev.filter(s => s.id !== 'github'))
      }

      updateStep('save', 'completed')
      setIsComplete(true)
      
      // Show warnings if any
      if (data.warnings && data.warnings.length > 0) {
        data.warnings.forEach((warning: string) => {
          console.warn('Campaign warning:', warning)
        })
      }

      onSuccess?.(data.campaign.id)
    } catch (error) {
      console.error('Campaign creation error:', error)
      updateStep(currentStep || 'validate', 'error', error instanceof Error ? error.message : 'Unknown error')
      setHasErrors(true)
    }
  }

  const handleViewCampaign = () => {
    if (campaignId) {
      router.push(`/campaigns/${campaignId}`)
      onClose()
    }
  }

  const handleClose = () => {
    if (isComplete || hasErrors) {
      onClose()
      if (isComplete) {
        router.push('/campaigns')
      }
    }
  }

  // Filter steps based on selected channels
  const filteredSteps = steps.filter(step => {
    if (step.id === 'mailchimp' && !campaignData?.selected_channels?.includes('email')) return false
    if (step.id === 'notion' && !campaignData?.selected_channels?.includes('notion')) return false
    if (step.id === 'github' && !campaignData?.selected_channels?.includes('github')) return false
    return true
  })

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px] modal-magical">
        <DialogHeader>
          <DialogTitle>
            {isComplete ? 'Campaign Created Successfully!' : 'Creating Your Campaign'}
          </DialogTitle>
          <DialogDescription>
            {isComplete 
              ? 'Your campaign has been distributed to all selected channels.'
              : 'Please wait while we set up your campaign across all channels.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <CampaignCreationProgress 
            steps={filteredSteps} 
            currentStep={currentStep}
          />

          {githubUrl && isComplete && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your GitHub Pages site is being deployed. It typically takes 2-10 minutes to go live.
                </AlertDescription>
              </Alert>
              
              <GitHubDeploymentStatus 
                githubUrl={githubUrl}
                onDeploymentComplete={() => {
                  // Optional: Show a success notification
                }}
              />
            </div>
          )}

          {isComplete && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Campaign created successfully! All selected channels have been configured.
              </AlertDescription>
            </Alert>
          )}

          {hasErrors && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Some steps failed during campaign creation. You can still view and manage the campaign.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex justify-end gap-3">
          {isComplete && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button onClick={handleViewCampaign}>
                <ExternalLink className="w-4 h-4 mr-2" />
                View Campaign
              </Button>
            </>
          )}
          {hasErrors && (
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}