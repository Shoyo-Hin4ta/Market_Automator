"use client"

import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: 'bg-magical-dark border-magical shadow-xl backdrop-blur-md',
          title: 'text-yellow-400 font-semibold',
          description: 'text-yellow-200',
          actionButton: 'bg-yellow-600 text-black hover:bg-yellow-500',
          cancelButton: 'bg-transparent text-yellow-400 border-yellow-600',
          closeButton: 'bg-transparent text-yellow-400 hover:bg-yellow-600/20',
          error: 'bg-red-900/20 border-red-500/50 text-red-400',
          success: 'bg-green-900/20 border-green-500/50 text-green-400',
          warning: 'bg-yellow-900/20 border-yellow-500/50 text-yellow-400',
          info: 'bg-blue-900/20 border-blue-500/50 text-blue-400',
        },
        style: {
          background: 'linear-gradient(135deg, rgba(26, 8, 39, 0.95) 0%, rgba(15, 5, 23, 0.95) 100%)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(251, 191, 36, 0.3)',
        }
      }}
      {...props}
    />
  )
}

export { Toaster }
