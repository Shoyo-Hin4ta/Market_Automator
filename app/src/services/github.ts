import { Octokit } from '@octokit/rest'

export class GitHubService {
  public octokit: Octokit | null = null
  
  constructor(pat?: string) {
    if (pat) {
      this.octokit = new Octokit({
        auth: pat
      })
    }
  }
  
  async testConnection(username: string): Promise<boolean> {
    if (!this.octokit) return false
    
    try {
      // Test authentication by getting the authenticated user
      await this.octokit.users.getAuthenticated()
      
      // Also verify the username matches
      const { data } = await this.octokit.users.getByUsername({
        username
      })
      return !!data
    } catch (error) {
      // Don't log the full error object as it may contain sensitive data
      console.error('GitHub connection test failed')
      return false
    }
  }
  
  async getRepositories(username: string) {
    if (!this.octokit) return []
    
    try {
      const { data } = await this.octokit.repos.listForUser({
        username,
        type: 'owner',
        sort: 'updated'
      })
      return data
    } catch (error) {
      console.error('Failed to get repositories:', error)
      return []
    }
  }
  
  async createRepository(name: string, description?: string) {
    if (!this.octokit) return null
    
    try {
      const { data } = await this.octokit.repos.createForAuthenticatedUser({
        name,
        description: description || 'Created by Marketing Automator',
        private: false,
        auto_init: true // Initialize with README
      })
      
      return data
    } catch (error) {
      console.error('Failed to create repository:', error)
      throw error
    }
  }

  async createLandingPage(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string
  ) {
    if (!this.octokit) return null
    
    try {
      // Convert content to base64
      const contentBase64 = Buffer.from(content).toString('base64')
      
      const { data } = await this.octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: contentBase64
      })
      
      return data
    } catch (error) {
      console.error('Failed to create landing page:', error)
      throw error
    }
  }
  
  async enableGitHubPages(owner: string, repo: string) {
    if (!this.octokit) return null
    
    try {
      // Enable GitHub Pages with main branch as source
      const { data } = await this.octokit.repos.createPagesSite({
        owner,
        repo,
        source: {
          branch: 'main',
          path: '/'
        }
      })
      
      return data
    } catch (error: any) {
      // If Pages is already enabled, that's fine
      if (error.status === 409) {
        console.log('GitHub Pages already enabled')
        return { html_url: `https://${owner}.github.io/${repo}/` }
      }
      console.error('Failed to enable GitHub Pages:', error)
      throw error
    }
  }
}