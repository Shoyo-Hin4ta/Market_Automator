'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Home } from 'lucide-react'
import '@/app/styles/magical-theme.css'
import '@/app/styles/settings-overrides.css'

export default function SettingsLayout({
  children
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  
  return (
    <div className="min-h-screen thunder-gradient settings-page">
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold shimmer-text">Connect Your Services</h1>
          <Button
            variant="outline"
            className="btn-magical"
            style={{ borderColor: 'var(--wizard-gold)', color: 'var(--wizard-gold)' }}
            onClick={() => router.push('/dashboard')}
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        {children}
      </div>
    </div>
  )
}