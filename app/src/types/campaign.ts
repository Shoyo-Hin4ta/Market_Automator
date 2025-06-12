export interface Campaign {
  id: string
  user_id: string
  name: string
  canva_design_id: string
  canva_design_url: string
  canva_thumbnail_url: string
  distributed_channels: string[]
  notion_page_id?: string
  github_page_url?: string
  mailchimp_campaign_id?: string
  status: 'draft' | 'distributed' | 'sent'
  created_at: string
  updated_at: string
}

export interface CampaignAnalytics {
  id: string
  campaign_id: string
  emails_sent: number
  emails_opened: number
  emails_clicked: number
  open_rate: number
  click_rate: number
  bounce_rate: number
  unsubscribes: number
  complaints: number
  last_synced_at: string
  created_at: string
  updated_at: string
}