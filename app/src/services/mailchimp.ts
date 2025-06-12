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
    
    if (!response.ok) {
      const error = await response.text()
      console.error('Mailchimp analytics error:', error)
      // Return zero analytics if campaign hasn't been sent yet
      if (response.status === 404) {
        return {
          emails_sent: 0,
          emails_opened: 0,
          emails_clicked: 0,
          bounce_rate: 0,
          open_rate: 0,
          click_rate: 0,
          unsubscribes: 0
        }
      }
      throw new Error(`Failed to fetch analytics: ${error}`)
    }
    
    const data = await response.json()
    return {
      emails_sent: data.emails_sent || 0,
      emails_opened: data.opens?.unique_opens || 0,
      emails_clicked: data.clicks?.unique_clicks || 0,
      bounce_rate: (data.bounces?.hard_bounces || 0) + (data.bounces?.soft_bounces || 0),
      open_rate: (data.opens?.open_rate || 0) * 100,
      click_rate: (data.clicks?.click_rate || 0) * 100,
      unsubscribes: data.unsubscribed || 0
    }
  }
  
  async sendCampaign(campaignId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/campaigns/${campaignId}/actions/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to send campaign: ${error}`)
    }
  }
  
  async createCampaign(data: {
    type: string
    recipients: { list_id: string }
    settings: {
      subject_line: string
      from_name: string
      reply_to: string
      title: string
    }
  }): Promise<{ id: string }> {
    const response = await fetch(`${this.baseUrl}/campaigns`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to create campaign: ${error}`)
    }
    
    return response.json()
  }
  
  async setContent(campaignId: string, content: { html: string }): Promise<void> {
    const response = await fetch(`${this.baseUrl}/campaigns/${campaignId}/content`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(content)
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to set campaign content: ${error}`)
    }
  }
}