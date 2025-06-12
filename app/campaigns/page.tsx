'use client'

import { useState, useEffect } from 'react'
import { CampaignTable } from '@/app/src/components/campaigns/CampaignTable'
import { useCampaigns } from '@/app/src/hooks/useCampaigns'
import { Button } from '@/components/ui/button'
import { RefreshCw, PlusCircle } from 'lucide-react'
import { useToast } from '@/app/src/hooks/use-toast'

export default function CampaignsPage() {
  const { campaigns, loading, refetch } = useCampaigns()
  const { toast } = useToast()
  const [creatingTestData, setCreatingTestData] = useState(false)
  
  const handleCreateTestData = async () => {
    setCreatingTestData(true)
    try {
      const response = await fetch('/api/campaigns/test-data', {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error('Failed to create test data')
      
      const data = await response.json()
      toast({
        title: 'Test data created',
        description: `Created ${data.campaigns} test campaigns`
      })
      
      refetch()
    } catch (error) {
      toast({
        title: 'Failed to create test data',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    } finally {
      setCreatingTestData(false)
    }
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Campaign Analytics</h1>
          <p className="text-muted-foreground">
            Track and manage your marketing campaigns
          </p>
        </div>
        <div className="flex gap-2">
          {campaigns.length === 0 && !loading && (
            <Button 
              variant="outline" 
              onClick={handleCreateTestData}
              disabled={creatingTestData}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Test Data
            </Button>
          )}
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
      <CampaignTable
        campaigns={campaigns}
        loading={loading}
      />
    </div>
  )
}