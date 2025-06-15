'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface PortalProps {
  children: React.ReactNode
  containerId?: string
}

export function Portal({ children, containerId = 'portal-root' }: PortalProps) {
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    let container = document.getElementById(containerId)
    
    if (!container) {
      container = document.createElement('div')
      container.id = containerId
      container.style.position = 'fixed'
      container.style.top = '0'
      container.style.left = '0'
      container.style.width = '0'
      container.style.height = '0'
      container.style.zIndex = '9999'
      container.style.pointerEvents = 'none'
      document.body.appendChild(container)
    }
    
    containerRef.current = container
    setMounted(true)

    return () => {
      // Don't remove the container as other portals might be using it
    }
  }, [containerId])

  if (!mounted || !containerRef.current) {
    return null
  }

  return createPortal(
    <div style={{ pointerEvents: 'auto' }}>{children}</div>,
    containerRef.current
  )
}