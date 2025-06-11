'use client'

import { useState, useEffect } from 'react'
import { DesignGrid } from '@/components/dashboard/DesignGrid'
import { DesignFilters } from '@/components/dashboard/DesignFilters'
import { useCanvaDesigns } from '@/hooks/useCanvaDesigns'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const { designs, loading, error, refetch } = useCanvaDesigns()
  const [filteredDesigns, setFilteredDesigns] = useState(designs)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  useEffect(() => {
    setFilteredDesigns(designs)
  }, [designs])
  
  const handleSearch = (query: string) => {
    const filtered = designs.filter(design =>
      design.title.toLowerCase().includes(query.toLowerCase())
    )
    setFilteredDesigns(filtered)
  }
  
  const handleSort = (sortBy: 'name' | 'date') => {
    const sorted = [...filteredDesigns].sort((a, b) => {
      if (sortBy === 'name') {
        return a.title.localeCompare(b.title)
      }
      return b.updated_at - a.updated_at
    })
    setFilteredDesigns(sorted)
  }
  
  if (error) {
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
          <h2 className="text-xl font-semibold">Your Designs</h2>
          <p className="text-muted-foreground">
            Select a design to create a marketing campaign
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create in Canva
        </Button>
      </div>
      
      <DesignFilters
        onSearch={handleSearch}
        onSort={handleSort}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      
      {loading ? (
        <DesignGridSkeleton />
      ) : (
        <DesignGrid
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