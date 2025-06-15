'use client'

import { useState, useEffect } from 'react'
import { CampaignTable } from '@/app/components/campaigns/CampaignTable'
import { useCampaigns } from '@/app/hooks/useCampaigns'
import { Button } from '@/components/ui/button'
import { RefreshCw, PlusCircle, Home, Sparkles } from 'lucide-react'
import { useToast } from '@/app/hooks/use-toast'
import { useRouter } from 'next/navigation'
import '@/app/styles/magical-theme.css'

export default function CampaignsPage() {
  const { campaigns, loading, refetch } = useCampaigns()
  const { toast } = useToast()
  const router = useRouter()
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
    <div className="min-h-screen thunder-gradient">
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--wizard-gold) 0%, var(--wizard-gold-light) 100%)' }}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold shimmer-text">Campaign Analytics</h1>
              <p style={{ color: '#fbbf24' }}>
                Track and manage your marketing campaigns
              </p>
            </div>
          </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="btn-magical"
            style={{ borderColor: 'var(--wizard-gold)', color: 'var(--wizard-gold)' }}
            onClick={() => router.push('/dashboard')}
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          {campaigns.length === 0 && !loading && (
            <Button 
              variant="outline"
              className="btn-magical"
              style={{ borderColor: 'var(--wizard-gold)', color: 'var(--wizard-gold)' }}
              onClick={handleCreateTestData}
              disabled={creatingTestData}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Test Data
            </Button>
          )}
          <Button 
            variant="outline" 
            className="btn-magical"
            style={{ borderColor: 'var(--wizard-gold)', color: 'var(--wizard-gold)' }}
            onClick={refetch}
          >
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
    </div>
  )
}