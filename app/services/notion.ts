import { Client } from '@notionhq/client'

export class NotionService {
  public client: Client | null = null

  constructor(integrationToken?: string) {
    if (integrationToken) {
      this.client = new Client({
        auth: integrationToken
      })
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.client) return false
    
    try {
      const response = await this.client.users.me()
      return !!response
    } catch (error) {
      console.error('Notion connection test failed:', error)
      return false
    }
  }

  async getFirstPage(): Promise<string | null> {
    if (!this.client) return null
    
    try {
      // Search for any page the integration has access to
      const response = await this.client.search({
        filter: {
          property: 'object',
          value: 'page'
        },
        page_size: 1
      })
      
      if (response.results.length > 0) {
        return response.results[0].id
      }
      
      return null
    } catch (error) {
      console.error('Failed to find a page:', error)
      return null
    }
  }

  async createCampaignDatabase(title: string = 'Marketing Campaigns'): Promise<{ id: string; url: string; parentPageId: string } | null> {
    if (!this.client) return null
    
    try {
      // First, try to find any page we have access to
      const parentPageId = await this.getFirstPage()
      
      if (!parentPageId) {
        throw new Error('No accessible pages found. Please share at least one page with your integration.')
      }
      
      const database = await this.client.databases.create({
        parent: { 
          type: 'page_id', 
          page_id: parentPageId 
        },
        is_inline: false, // Create as full page database
        title: [{ 
          type: 'text', 
          text: { content: title } 
        }],
        properties: {
          'Campaign Name': { 
            title: {} 
          },
          'Design URL': { 
            url: {} 
          },
          'Created Date': { 
            date: {} 
          },
          'Status': {
            select: {
              options: [
                { name: 'draft', color: 'gray' },
                { name: 'published', color: 'green' },
                { name: 'archived', color: 'red' }
              ]
            }
          },
          'Email Sent': { 
            checkbox: {} 
          },
          'GitHub URL': { 
            url: {} 
          },
          'Emails Sent': { 
            number: {} 
          },
          'Emails Opened': { 
            number: {} 
          },
          'Emails Clicked': { 
            number: {} 
          },
          'Open Rate': { 
            number: {} 
          },
          'Click Rate': { 
            number: {} 
          },
          'Bounce Rate': { 
            number: {} 
          }
        }
      })
      
      return {
        id: database.id,
        url: database.url,
        parentPageId
      }
    } catch (error) {
      console.error('Failed to create database:', error)
      throw error
    }
  }

  async getDatabases(): Promise<any[]> {
    if (!this.client) return []
    
    try {
      const response = await this.client.search({
        filter: {
          property: 'object',
          value: 'database'
        }
      })
      return response.results
    } catch (error) {
      console.error('Failed to get databases:', error)
      return []
    }
  }
  
  async updateDatabaseEntry(pageId: string, properties: Record<string, any>): Promise<void> {
    if (!this.client) throw new Error('Notion client not initialized')
    
    try {
      await this.client.pages.update({
        page_id: pageId,
        properties
      })
    } catch (error) {
      console.error('Failed to update database entry:', error)
      throw error
    }
  }
  
  async createCampaignPage(databaseId: string, campaignData: {
    name: string
    design_url: string
    status: string
    created_date: string
    github_url?: string
  }): Promise<{ id: string; url: string }> {
    if (!this.client) throw new Error('Notion client not initialized')
    
    try {
      const properties: any = {
        'Campaign Name': { 
          title: [{ 
            type: 'text', 
            text: { content: campaignData.name } 
          }] 
        },
        'Design URL': { 
          url: campaignData.design_url 
        },
        'Created Date': { 
          date: { start: campaignData.created_date } 
        },
        'Status': { 
          select: { name: campaignData.status } 
        }
      }
      
      // Add GitHub URL if provided
      if (campaignData.github_url) {
        properties['GitHub URL'] = { url: campaignData.github_url }
      }
      
      const page = await this.client.pages.create({
        parent: { database_id: databaseId },
        properties
      })
      
      return {
        id: page.id,
        url: (page as any).url || `https://www.notion.so/${page.id.replace(/-/g, '')}`
      }
    } catch (error) {
      console.error('Failed to create campaign page:', error)
      throw error
    }
  }
}