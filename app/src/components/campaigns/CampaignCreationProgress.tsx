'use client'

import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  id: string
  name: string
  status: 'pending' | 'in_progress' | 'completed' | 'error'
  error?: string
}

interface CampaignCreationProgressProps {
  steps: Step[]
  currentStep?: string
}

export function CampaignCreationProgress({ steps, currentStep }: CampaignCreationProgressProps) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep
        const isCompleted = step.status === 'completed'
        const isError = step.status === 'error'
        const isInProgress = step.status === 'in_progress'
        
        return (
          <div
            key={step.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg transition-all",
              isActive && "bg-muted/50",
              isCompleted && "opacity-75"
            )}
          >
            <div className="flex-shrink-0">
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : isInProgress ? (
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              ) : isError ? (
                <Circle className="h-5 w-5 text-red-500" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-medium",
                isCompleted && "text-muted-foreground",
                isError && "text-red-600"
              )}>
                {step.name}
              </p>
              {step.error && (
                <p className="text-xs text-red-600 mt-1">{step.error}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}