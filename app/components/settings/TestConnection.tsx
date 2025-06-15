'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import '../../styles/magical-theme.css'

interface TestConnectionProps {
  onTest: () => Promise<boolean>
  onSave: () => Promise<void>
  canSave: boolean
  canTest?: boolean
  disabled?: boolean
  testLabel?: string
  saveLabel?: string
}

export function TestConnection({ 
  onTest, 
  onSave, 
  canSave,
  canTest = true,
  disabled = false,
  testLabel = 'Test Connection',
  saveLabel = 'Save'
}: TestConnectionProps) {
  const [testing, setTesting] = useState(false)
  const [tested, setTested] = useState(false)
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleTest = async () => {
    setTesting(true)
    try {
      const result = await onTest()
      setSuccess(result)
      setTested(true)
    } catch (error) {
      setSuccess(false)
      setTested(true)
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        className="btn-magical"
        style={{ borderColor: 'var(--wizard-gold)', color: 'var(--wizard-gold)' }}
        onClick={handleTest}
        disabled={testing || !canTest || disabled}
      >
        {testing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Testing...
          </>
        ) : (
          testLabel
        )}
      </Button>

      {tested && (
        <div className="flex items-center gap-1">
          {success ? (
            <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--wizard-gold)' }} />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          <span className="text-sm" style={{ color: success ? '#4ade80' : '#ef4444' }}>
            {success ? 'Connection successful' : 'Connection failed'}
          </span>
        </div>
      )}

      <Button
        onClick={handleSave}
        disabled={!canSave || !tested || !success || saving || disabled}
        className="ml-auto btn-magical"
        style={{ background: (!canSave || !tested || !success || saving || disabled) ? undefined : 'linear-gradient(135deg, var(--wizard-gold) 0%, var(--wizard-gold-dark) 100%)', border: 'none', color: 'white' }}
      >
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          saveLabel
        )}
      </Button>
    </div>
  )
}