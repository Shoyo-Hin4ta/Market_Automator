"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      style={{
        backgroundColor: props.checked ? '#fbbf24' : 'rgba(251, 191, 36, 0.2)',
        borderColor: props.checked ? '#fbbf24' : 'rgba(251, 191, 36, 0.3)',
        boxShadow: props.checked ? '0 0 20px rgba(251, 191, 36, 0.5)' : 'none'
      }}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full shadow-lg ring-0 transition-transform duration-200",
          "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        )}
        style={{
          backgroundColor: props.checked ? '#1a0827' : '#fbbf24',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.4)'
        }}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
