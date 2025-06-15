'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CustomDropdownProps {
  value: string
  onValueChange: (value: string) => void
  options: Array<{
    value: string
    label: string
  }>
  placeholder?: string
  className?: string
  width?: string
  parentHovered?: boolean
  onDropdownHover?: (isHovered: boolean) => void
  onOpenChange?: (isOpen: boolean) => void
}

export function CustomDropdown({
  value,
  onValueChange,
  options,
  placeholder = 'Select...',
  className,
  width = '100%',
  parentHovered = false,
  onDropdownHover,
  onOpenChange
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get the label for the current value
  const selectedOption = options.find(opt => opt.value === value)
  const displayValue = selectedOption?.label || placeholder

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        onOpenChange?.(false)
        onDropdownHover?.(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  const handleToggle = () => {
    const newState = !isOpen
    setIsOpen(newState)
    onOpenChange?.(newState)
    if (newState && !hasOpened) {
      setHasOpened(true)
    }
    if (!newState) {
      onDropdownHover?.(false)
    }
  }

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue)
    setIsOpen(false)
    onOpenChange?.(false)
    onDropdownHover?.(false)
  }

  return (
    <div 
      ref={dropdownRef} 
      className={cn('relative', className)} 
      style={{ width }}
      onMouseEnter={() => isOpen && onDropdownHover?.(true)}
      onMouseLeave={() => isOpen && onDropdownHover?.(false)}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          'w-full px-3 py-2 text-left flex items-center justify-between',
          'border rounded-md transition-all duration-200',
          'hover:border-yellow-500 hover:shadow-lg hover:shadow-yellow-600/20',
          'focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20',
          isOpen && 'border-yellow-500 shadow-lg shadow-yellow-600/20'
        )}
        style={{
          background: 'rgba(15, 5, 23, 0.6)',
          borderColor: isOpen ? 'var(--wizard-gold)' : 'rgba(251, 191, 36, 0.1)',
          color: '#fbbf24'
        }}
      >
        <span className="truncate">{displayValue}</span>
        <ChevronDown 
          className={cn(
            'h-4 w-4 ml-2 flex-shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
          style={{ color: 'var(--wizard-gold)' }}
        />
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div
          className={cn(
            'absolute w-full max-h-60 overflow-auto rounded-md',
            'border shadow-xl z-50'
          )}
          style={{
            top: parentHovered ? 'calc(100% + 4px)' : 'calc(100% + 8px)',
            background: 'rgba(15, 5, 23, 0.98)',
            borderColor: 'var(--wizard-gold)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px var(--wizard-glow)',
            transition: hasOpened ? 'top 0.3s ease' : 'none'
          }}
        >
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  'w-full px-3 py-2 text-left text-sm transition-all duration-200',
                  'hover:bg-yellow-600/10 hover:text-yellow-500',
                  'focus:outline-none focus:bg-yellow-600/10 focus:text-yellow-500',
                  value === option.value && 'bg-yellow-600/20 text-yellow-500'
                )}
                style={{
                  color: value === option.value ? 'var(--wizard-gold)' : '#fbbf24'
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}