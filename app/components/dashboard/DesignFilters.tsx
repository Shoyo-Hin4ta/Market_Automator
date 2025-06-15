import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Grid3X3, List, ArrowUpDown } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CustomDropdown } from '@/app/components/ui/CustomDropdown'
import { DesignCategory } from '@/app/types/canva'
import { DESIGN_CATEGORIES, getCategoryIcon } from '@/app/lib/constants/design-categories'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import '../../styles/magical-theme.css'

interface DesignFiltersProps {
  onSearch: (query: string) => void
  onSort: (sortBy: 'name' | 'date') => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  selectedCategory: DesignCategory
  onCategoryChange: (category: DesignCategory) => void
}

export function DesignFilters({
  onSearch,
  onSort,
  viewMode,
  onViewModeChange,
  selectedCategory,
  onCategoryChange
}: DesignFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name')

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  const handleSort = (value: 'name' | 'date') => {
    setSortBy(value)
    onSort(value)
  }

  return (
    <div className="space-y-4">
      {/* Category Filter Buttons */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          {DESIGN_CATEGORIES.map((category) => {
            const Icon = getCategoryIcon(category.icon)
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => onCategoryChange(category.id)}
                className={cn(
                  "flex items-center gap-2 rounded-full btn-magical",
                  selectedCategory === category.id && "shadow-sm"
                )}
                style={selectedCategory === category.id ? { background: 'linear-gradient(135deg, var(--wizard-gold) 0%, var(--wizard-gold-dark) 100%)', border: 'none', color: 'white' } : { borderColor: 'var(--border-magical)' }}
              >
                <Icon className="h-4 w-4" style={selectedCategory === category.id ? { color: 'white' } : {}} />
                <span>{category.label}</span>
              </Button>
            )
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      
      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#d4a574' }} />
          <Input
            placeholder="Search designs..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 input-magical"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <ArrowUpDown className="h-4 w-4 mr-2" style={{ color: '#d4a574' }} />
            <CustomDropdown
              value={sortBy}
              onValueChange={(value) => handleSort(value as 'name' | 'date')}
              options={[
                { value: 'name', label: 'Name' },
                { value: 'date', label: 'Last Modified' }
              ]}
              placeholder="Sort by..."
              width="180px"
              triggerClassName="h-10"
              displayFormat={(label) => (
                <span>
                  <span style={{ color: '#d4a574' }}>Sort by: </span>
                  <span style={{ color: '#fcd34d' }}>{label}</span>
                </span>
              )}
            />
          </div>
          
          <div className="flex items-center rounded-md magical-border">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => onViewModeChange('grid')}
              className="rounded-r-none hover:bg-transparent"
              style={viewMode === 'grid' ? { background: 'var(--wizard-gold)', color: 'white' } : { color: 'var(--wizard-gold)' }}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => onViewModeChange('list')}
              className="rounded-l-none hover:bg-transparent"
              style={viewMode === 'list' ? { background: 'var(--wizard-gold)', color: 'white' } : { color: 'var(--wizard-gold)' }}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}