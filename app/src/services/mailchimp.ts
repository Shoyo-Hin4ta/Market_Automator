export interface MailchimpAudience {
  id: string
  name: string
  stats: {
    member_count: number
  }
}

export interface MailchimpCampaignAnalytics {
  emails_sent: number
  emails_opened: number
  emails_clicked: number
  bounce_rate: number
  open_rate: number
  click_rate: number
  unsubscribes: number
}

export class MailchimpService {
  private apiKey: string
  private serverPrefix: string
  private baseUrl: string
  
  constructor(apiKey?: string, serverPrefix?: string) {
    this.apiKey = apiKey || ''
    this.serverPrefix = serverPrefix || ''
    this.baseUrl = `https://${this.serverPrefix}.api.mailchimp.com/3.0`
  }
  
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/ping`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })
      return response.ok
    } catch {
      return false
    }
  }
  
  async getAudiences(): Promise<MailchimpAudience[]> {
    const response = await fetch(`${this.baseUrl}/lists`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    })
    
    if (!response.ok) throw new Error('Failed to fetch audiences')
    
    const data = await response.json()
    return data.lists || []
  }
  
  async getCampaignAnalytics(campaignId: string): Promise<MailchimpCampaignAnalytics> {
    const response = await fetch(`${this.baseUrl}/reports/${campaignId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    })
    
    if (!response.ok) throw new Error('Failed to fetch analytics')
    
    const data = await response.json()
    return {
      emails_sent: data.emails_sent,
      emails_opened: data.opens.unique_opens,
      emails_clicked: data.clicks.unique_clicks,
      bounce_rate: data.bounces.hard_bounces + data.bounces.soft_bounces,
      open_rate: data.opens.open_rate * 100,
      click_rate: data.clicks.click_rate * 100,
      unsubscribes: data.unsubscribed
    }
  }
}