'use client'

import { useState, useEffect } from 'react'
import { DesignGrid } from '@/app/components/dashboard/DesignGrid'
import { GroupedDesignGrid } from '@/app/components/dashboard/GroupedDesignGrid'
import { DesignFilters } from '@/app/components/dashboard/DesignFilters'
import { useCanvaDesigns } from '@/app/hooks/useCanvaDesigns'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { DesignCategory } from '@/app/types/canva'
import { detectDesignCategory } from '@/app/lib/constants/design-categories'
import '@/app/styles/magical-theme.css'
import '@/app/styles/settings-overrides.css'

export default function DashboardPage() {
  const { designs, loading, error, connected, refetch } = useCanvaDesigns()
  const [filteredDesigns, setFilteredDesigns] = useState(designs)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategory, setSelectedCategory] = useState<DesignCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  useEffect(() => {
    applyFilters(designs, searchQuery, selectedCategory)
  }, [designs, selectedCategory])
  
  const applyFilters = (designList: typeof designs, search: string, category: DesignCategory) => {
    let filtered = [...designList]
    
    // Apply search filter
    if (search) {
      filtered = filtered.filter(design =>
        design?.title?.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    // Apply category filter
    if (category !== 'all') {
      filtered = filtered.filter(design => {
        const detectedCategory = detectDesignCategory(design?.title || '')
        return detectedCategory === category || (detectedCategory === 'all' && category === 'all')
      })
    }
    
    setFilteredDesigns(filtered)
  }
  
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    applyFilters(designs, query, selectedCategory)
  }
  
  const handleCategoryChange = (category: DesignCategory) => {
    setSelectedCategory(category)
  }
  
  const handleSort = (sortBy: 'name' | 'date') => {
    const sorted = [...filteredDesigns].sort((a, b) => {
      if (sortBy === 'name') {
        return (a?.title || '').localeCompare(b?.title || '')
      }
      return (b?.updated_at || 0) - (a?.updated_at || 0)
    })
    setFilteredDesigns(sorted)
  }
  
  // Handle Canva not connected
  if (!loading && !connected) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Connect Your Canva Account</h2>
          <p className="max-w-md mx-auto text-muted-foreground">
            To view and distribute your designs, you need to connect your Canva account first.
          </p>
        </div>
        <Button 
          onClick={() => window.location.href = '/settings?tab=canva'}
          size="lg"
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white border-0 shadow-md hover:shadow-lg transition-all"
        >
          Connect Canva Account
        </Button>
      </div>
    )
  }
  
  if (error && connected) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Failed to load designs</p>
        <Button onClick={refetch}>Try Again</Button>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Your Designs</h2>
          <p className="text-muted-foreground">
            Select a design to create a marketing campaign
          </p>
        </div>
        <Button
          onClick={() => window.open('https://www.canva.com/', '_blank')}
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white border-0 shadow-md hover:shadow-lg transition-all font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create in Canva
        </Button>
      </div>
      
      <DesignFilters
        onSearch={handleSearch}
        onSort={handleSort}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />
      
      {loading ? (
        <DesignGridSkeleton />
      ) : (
        <GroupedDesignGrid
          designs={filteredDesigns}
          viewMode={viewMode}
        />
      )}
    </div>
  )
}

function DesignGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-square" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}