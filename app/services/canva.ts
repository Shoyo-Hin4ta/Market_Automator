interface CanvaDesign {
  id: string
  title: string
  thumbnail: {
    url: string
    width: number
    height: number
  }
  urls: {
    edit_url: string
    view_url: string
  }
  created_at: number
  updated_at: number
}

interface CanvaBrandTemplate {
  id: string
  title: string
  thumbnail: {
    url: string
    width: number
    height: number
  }
}

export class CanvaService {
  private accessToken: string
  
  constructor(accessToken: string) {
    this.accessToken = accessToken
  }
  
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch('https://api.canva.com/rest/v1/users/me/profile', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })
      return response.ok
    } catch {
      return false
    }
  }
  
  async getUserProfile() {
    const response = await fetch('https://api.canva.com/rest/v1/users/me/profile', {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    })
    
    if (!response.ok) throw new Error('Failed to fetch user profile')
    
    return response.json()
  }
  
  async listDesigns(limit = 50, continuation?: string): Promise<{ items: CanvaDesign[], continuation?: string }> {
    const params = new URLSearchParams({ limit: limit.toString() })
    if (continuation) params.append('continuation', continuation)
    
    const response = await fetch(`https://api.canva.com/rest/v1/designs?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    })
    
    if (!response.ok) throw new Error('Failed to fetch designs')
    
    return response.json()
  }
  
  async listBrandTemplates(brand_id: string): Promise<{ items: CanvaBrandTemplate[] }> {
    const response = await fetch(`https://api.canva.com/rest/v1/brand-templates?brand_id=${brand_id}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    })
    
    if (!response.ok) throw new Error('Failed to fetch brand templates')
    
    return response.json()
  }
  
  async exportDesign(designId: string, format: 'png' | 'pdf' | 'jpg' = 'png') {
    const response = await fetch('https://api.canva.com/rest/v1/exports', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        design_id: designId,
        format: {
          type: format.toUpperCase()
        }
      })
    })
    
    if (!response.ok) throw new Error('Failed to start export')
    
    const { job } = await response.json()
    return this.pollExportJob(job.id)
  }
  
  private async pollExportJob(jobId: string): Promise<string> {
    let attempts = 0
    const maxAttempts = 30
    
    while (attempts < maxAttempts) {
      const response = await fetch(`https://api.canva.com/rest/v1/exports/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })
      
      if (!response.ok) throw new Error('Failed to check export status')
      
      const data = await response.json()
      
      if (data.status === 'success') {
        return data.urls[0] 
      }
      
      if (data.status === 'failed') {
        throw new Error('Export failed')
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      attempts++
    }
    
    throw new Error('Export timeout')
  }
}