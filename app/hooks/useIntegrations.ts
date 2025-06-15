'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../lib/supabase/client'
import { useAuth } from '../contexts/AuthContext'

export interface IntegrationStatus {
  notion: boolean
  github: boolean
  mailchimp: boolean
  openai: boolean
  canva: boolean
}

export function useIntegrations() {
  const [integrations, setIntegrations] = useState<IntegrationStatus>({
    notion: false,
    github: false,
    mailchimp: false,
    openai: false,
    canva: false
  })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    const fetchIntegrations = async () => {
      try {
        const { data, error } = await supabase
          .from('api_keys')
          .select('service')
          .eq('user_id', user.id)

        if (error) throw error

        const connectedServices = data?.reduce((acc, row) => {
          if (row.service in acc) {
            acc[row.service as keyof IntegrationStatus] = true
          }
          return acc
        }, { ...integrations })

        if (connectedServices) {
          setIntegrations(connectedServices)
        }
      } catch (error) {
        console.error('Error fetching integrations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchIntegrations()
  }, [user])

  return { integrations, loading }
}