'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { BarChart3, Sparkles, Settings } from 'lucide-react'
import '@/app/styles/magical-theme.css'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #1a0827 30%, #0f0517 70%, #0a0a0a 100%)' }}>
      <header className="border-b backdrop-blur-sm" style={{ backgroundColor: 'rgba(10, 10, 10, 0.7)', borderColor: 'rgba(251, 191, 36, 0.1)' }}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, var(--wizard-gold) 0%, var(--wizard-gold-light) 100%)', boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)' }}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Campaign Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="border-yellow-500/20 hover:bg-yellow-500/10 hover:text-yellow-400 hover:border-yellow-500/30 transition-all"
                onClick={() => router.push('/campaigns')}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Campaigns
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-yellow-500/10 hover:text-yellow-400 transition-all"
                onClick={() => router.push('/settings')}
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}