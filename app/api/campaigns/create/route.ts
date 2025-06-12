import { createClient } from '@/app/src/lib/supabase/server'
import { NextRequest } from 'next/server'
import { MailchimpService } from '@/app/src/services/mailchimp'
import { NotionService } from '@/app/src/services/notion'
import { GitHubService } from '@/app/src/services/github'
import { OpenAIService } from '@/app/src/services/openai'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  try {
    const body = await request.json()
    const { 
      name, 
      canva_design_id, 
      canva_design_url, 
      canva_thumbnail_url,
      selected_channels,
      ai_content
    } = body
    
    // Fetch all connected services
    const { data: apiKeys } = await supabase
      .from('api_keys')
      .select('service, encrypted_key, metadata')
      .eq('user_id', user.id)
    
    if (!apiKeys || apiKeys.length === 0) {
      return new Response('No integrations connected', { status: 400 })
    }
    
    // Create a map of available services
    const servicesMap = new Map(apiKeys.map(key => [key.service, key]))
    
    // Validate selected channels are available
    const validChannels = selected_channels.filter((channel: string) => {
      if (channel === 'email') return servicesMap.has('mailchimp')
      if (channel === 'notion') return servicesMap.has('notion')
      if (channel === 'github') return servicesMap.has('github')
      return false
    })
    
    if (validChannels.length === 0) {
      return new Response('No valid channels selected', { status: 400 })
    }
    
    // Initialize campaign data
    let mailchimp_campaign_id = null
    let notion_page_id = null
    let github_page_url = null
    
    // Process each channel
    const errors = []
    
    // 1. Create Mailchimp Campaign
    if (validChannels.includes('email') && servicesMap.has('mailchimp')) {
      const mailchimpKey = servicesMap.get('mailchimp')!
      const serverPrefix = mailchimpKey.metadata?.server_prefix
      if (!serverPrefix) {
        errors.push('Mailchimp: Server prefix not found')
      } else {
        const mailchimp = new MailchimpService(mailchimpKey.encrypted_key, serverPrefix)
        
        try {
          // Get audience from metadata
          const audienceId = mailchimpKey.metadata?.audience_id
          if (!audienceId) {
            throw new Error('No Mailchimp audience selected')
          }
        
        // Create campaign
        const campaign = await mailchimp.createCampaign({
          type: 'regular',
          recipients: {
            list_id: audienceId
          },
          settings: {
            subject_line: ai_content?.email?.subject || name,
            from_name: ai_content?.email?.from_name || 'Marketing Team',
            reply_to: user.email,
            title: name
          }
        })
        
        mailchimp_campaign_id = campaign.id
        
        // Set content
        if (ai_content?.email?.html) {
          await mailchimp.setContent(campaign.id, {
            html: ai_content.email.html
          })
        }
        
      } catch (error) {
        console.error('Mailchimp error:', error)
        errors.push(`Mailchimp: ${error instanceof Error ? error.message : 'Failed to create campaign'}`)
      }
      }
    }
    
    // 2. Create Notion Page
    if (validChannels.includes('notion') && servicesMap.has('notion')) {
      const notionKey = servicesMap.get('notion')!
      const notion = new NotionService(notionKey.encrypted_key)
      
      try {
        // Get database ID from notion_databases table
        const { data: notionDb } = await supabase
          .from('notion_databases')
          .select('database_id')
          .eq('user_id', user.id)
          .single()
        
        if (!notionDb?.database_id) {
          throw new Error('No Notion database found')
        }
        
        // Create page
        const page = await notion.createCampaignPage(
          notionDb.database_id,
          {
            name,
            design_url: canva_design_url,
            status: 'published',
            created_date: new Date().toISOString()
          }
        )
        
        notion_page_id = page.id
        
      } catch (error) {
        console.error('Notion error:', error)
        errors.push(`Notion: ${error instanceof Error ? error.message : 'Failed to create page'}`)
      }
    }
    
    // 3. Create GitHub Landing Page
    if (validChannels.includes('github') && servicesMap.has('github')) {
      const githubKey = servicesMap.get('github')!
      const github = new GitHubService(githubKey.encrypted_key)
      
      try {
        const username = githubKey.metadata?.username
        if (!username) {
          throw new Error('GitHub username not found')
        }
        
        // Generate landing page HTML
        const landingPageHtml = ai_content?.landing_page?.html || generateDefaultLandingPage(name, canva_thumbnail_url)
        
        // Ensure repository exists
        const repoName = 'market-automator-campaigns'
        let repoExists = true
        try {
          // Try to get the repository
          await github.octokit?.repos.get({
            owner: username,
            repo: repoName
          })
        } catch (repoError: any) {
          if (repoError.status === 404) {
            // Repository doesn't exist, create it
            repoExists = false
            await github.createRepository(repoName, 'Campaigns created by Marketing Automator')
            
            // Create a root index.html for GitHub Pages
            const rootIndexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Marketing Campaigns</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 0;
      background: #f5f5f5;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .container {
      background: white;
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      text-align: center;
      max-width: 600px;
    }
    h1 { color: #333; margin-bottom: 1rem; }
    p { color: #666; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Marketing Campaigns</h1>
    <p>This repository hosts landing pages for marketing campaigns created with Marketing Automator.</p>
  </div>
</body>
</html>`
            
            await github.createLandingPage(
              username,
              repoName,
              'index.html',
              rootIndexHtml,
              'Initial commit - Set up GitHub Pages'
            )
          } else {
            throw repoError
          }
        }
        
        // Always try to enable GitHub Pages (in case it's not enabled yet)
        try {
          await github.enableGitHubPages(username, repoName)
        } catch (error) {
          console.log('GitHub Pages might already be enabled or there was an error:', error)
        }
        
        // Create or update file
        const campaignSlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        const filePath = `campaigns/${campaignSlug}/index.html`
        
        await github.createLandingPage(
          username,
          repoName,
          filePath,
          landingPageHtml,
          `Add landing page for ${name}`
        )
        
        github_page_url = `https://${username}.github.io/${repoName}/campaigns/${campaignSlug}/`
        
      } catch (error) {
        console.error('GitHub error:', error)
        errors.push(`GitHub: ${error instanceof Error ? error.message : 'Failed to create landing page'}`)
      }
    }
    
    // Create campaign record
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        user_id: user.id,
        name,
        canva_design_id,
        canva_design_url,
        canva_thumbnail_url,
        distributed_channels: validChannels,
        status: 'distributed',
        mailchimp_campaign_id,
        notion_page_id,
        github_page_url,
        metadata: {
          ai_content,
          creation_errors: errors
        }
      })
      .select()
      .single()
    
    if (campaignError) {
      console.error('Failed to create campaign:', campaignError)
      return new Response('Failed to create campaign record', { status: 500 })
    }
    
    // Return success with any errors that occurred
    return Response.json({ 
      success: true, 
      campaign,
      warnings: errors
    })
    
  } catch (error) {
    console.error('Error creating campaign:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

function generateDefaultLandingPage(campaignName: string, thumbnailUrl?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${campaignName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .container {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      text-align: center;
      max-width: 600px;
    }
    h1 {
      color: #333;
      margin-bottom: 1rem;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 1rem 0;
    }
    p {
      color: #666;
      line-height: 1.6;
    }
    .cta {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      margin-top: 1rem;
      transition: background 0.3s;
    }
    .cta:hover {
      background: #5a67d8;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${campaignName}</h1>
    ${thumbnailUrl ? `<img src="${thumbnailUrl}" alt="${campaignName}">` : ''}
    <p>Welcome to our campaign landing page. This content was automatically generated.</p>
    <a href="#" class="cta">Learn More</a>
  </div>
</body>
</html>`
}