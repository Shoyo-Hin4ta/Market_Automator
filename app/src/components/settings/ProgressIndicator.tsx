'use client'

import { Progress } from '@/components/ui/progress'
import { IntegrationStatus } from '@/hooks/useIntegrations'

export function ProgressIndicator({ integrations }: { integrations: IntegrationStatus }) {
  const completed = Object.values(integrations).filter(Boolean).length
  const total = Object.keys(integrations).length
  const percentage = (completed / total) * 100

  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-muted-foreground">Setup Progress</span>
        <span className="text-sm font-medium">{completed}/{total} Connected</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  )
}