'use client'

import { useState, useRef, useEffect, createContext, useContext } from 'react'
import { cn } from '@/lib/utils'
import { Portal } from './Portal'

const MenuContext = createContext<{ closeMenu: () => void }>({ closeMenu: () => {} })

interface CustomContextMenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
  className?: string
  contentClassName?: string
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export function CustomContextMenu({
  trigger,
  children,
  className,
  contentClassName,
  align = 'end',
  side = 'bottom'
}: CustomContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })

  // Calculate menu position
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      
      // Use setTimeout to ensure the menu is rendered before calculating dimensions
      setTimeout(() => {
        if (contentRef.current) {
          const menuRect = contentRef.current.getBoundingClientRect()
          const menuWidth = menuRect.width || 200
          const menuHeight = menuRect.height || 100
          
          let top = rect.bottom + 8
          let left = rect.left
          
          // Handle different alignments
          if (align === 'end') {
            left = rect.right - menuWidth
          } else if (align === 'center') {
            left = rect.left + (rect.width / 2) - (menuWidth / 2)
          }
          
          // Handle different sides
          if (side === 'top') {
            top = rect.top - menuHeight - 8
          } else if (side === 'left') {
            top = rect.top
            left = rect.left - menuWidth - 8
          } else if (side === 'right') {
            top = rect.top
            left = rect.right + 8
          }
          
          // Ensure menu stays within viewport
          const viewportWidth = window.innerWidth
          const viewportHeight = window.innerHeight
          
          if (left + menuWidth > viewportWidth) {
            left = viewportWidth - menuWidth - 10
          }
          if (left < 10) {
            left = 10
          }
          if (top + menuHeight > viewportHeight) {
            top = rect.top - menuHeight - 8
          }
          if (top < 10) {
            top = 10
          }
          
          setMenuPosition({ top, left })
        }
      }, 0)
    }
  }, [isOpen, align, side])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if clicking on the trigger button or the menu itself
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      // Use a slight delay to prevent immediate closure
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 0)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen])

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  return (
    <div ref={menuRef} className={cn('relative inline-block', className)}>
      {/* Trigger */}
      <div 
        ref={triggerRef} 
        onClick={handleTriggerClick}
        style={{ cursor: 'pointer' }}
      >
        {trigger}
      </div>

      {/* Menu Content - Using Portal pattern */}
      {isOpen && (
        <Portal>
          {/* Invisible overlay to capture clicks outside */}
          <div 
            className="fixed inset-0" 
            style={{ zIndex: 999 }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Content */}
          <div
            ref={contentRef}
            className={cn(
              'fixed min-w-[200px] overflow-hidden rounded-md',
              'border shadow-xl',
              'bg-magical-dark border-magical',
              'animate-in fade-in-0 zoom-in-95',
              contentClassName
            )}
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              background: 'var(--card-bg-solid)',
              borderColor: 'var(--wizard-gold)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px var(--wizard-glow)',
              zIndex: 1000
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <MenuContext.Provider value={{ closeMenu: () => setIsOpen(false) }}>
              <div className="py-1">
                {children}
              </div>
            </MenuContext.Provider>
          </div>
        </Portal>
      )}
    </div>
  )
}

interface CustomContextMenuItemProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export function CustomContextMenuItem({
  children,
  onClick,
  disabled = false,
  className
}: CustomContextMenuItemProps) {
  const { closeMenu } = useContext(MenuContext)
  
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        if (!disabled && onClick) {
          onClick()
          closeMenu()
        }
      }}
      disabled={disabled}
      className={cn(
        'w-full px-3 py-2 text-left text-sm transition-all duration-200',
        'hover:bg-yellow-600/10 hover:text-yellow-500',
        'focus:outline-none focus:bg-yellow-600/10 focus:text-yellow-500',
        'flex items-center',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={{
        color: disabled ? 'var(--text-secondary)' : 'var(--text-secondary)'
      }}
    >
      {children}
    </button>
  )
}