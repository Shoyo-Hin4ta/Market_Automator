import { createClient } from '@/app/lib/supabase/server'
import { GitHubService } from '@/app/services/github'
import { generateLandingPageHTML } from '@/app/templates/landing-page'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get GitHub credentials
    const { data: credentials, error: credError } = await supabase
      .from('api_keys')
      .select('encrypted_key, metadata')
      .eq('user_id', user.id)
      .eq('service', 'github')
      .single()
    
    if (credError || !credentials) {
      return NextResponse.json(
        { error: 'GitHub not connected. Please connect GitHub first.' },
        { status: 400 }
      )
    }
    
    const pat = credentials.encrypted_key
    const username = credentials.metadata?.username
    
    if (!username) {
      return NextResponse.json(
        { error: 'GitHub username not found' },
        { status: 400 }
      )
    }
    
    // Generate dummy campaign data with actual content
    const dummyData = {
      title: 'Summer Sale 2024',
      description: 'Get up to 50% off on selected items this summer!',
      audience: 'Fashion-conscious shoppers aged 18-35',
      imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
      content: 'Discover our exclusive summer collection with incredible discounts on fashion, accessories, and more. This limited-time offer brings you the best deals of the season with premium quality products at unbeatable prices.',
      features: [
        'Free shipping on orders over $50',
        'Limited time offer - ends July 31st',
        'New arrivals added daily',
        'Easy 30-day returns',
        'Exclusive member rewards'
      ],
      ctaText: 'Shop Now',
      ctaUrl: 'https://example.com/shop'
    }
    
    // Generate HTML content
    const htmlContent = generateLandingPageHTML(dummyData)
    
    // Create GitHub service instance
    const github = new GitHubService(pat)
    
    // Create a test repository name (or use existing one)
    const repoName = 'marketing-automator-test'
    const fileName = `landing-page-${Date.now()}.html`
    
    try {
      // First, try to create the landing page
      let repoCreated = false
      
      try {
        const result = await github.createLandingPage(
          username,
          repoName,
          fileName,
          htmlContent,
          'Test landing page created by Marketing Automator'
        )
        
        // Construct URLs
        const githubUrl = `https://github.com/${username}/${repoName}/blob/main/${fileName}`
        const rawUrl = `https://raw.githubusercontent.com/${username}/${repoName}/main/${fileName}`
        const previewUrl = `https://htmlpreview.github.io/?${rawUrl}`
        
        return NextResponse.json({
          success: true,
          url: previewUrl,
          githubUrl: githubUrl,
          rawUrl: rawUrl,
          message: 'Test landing page created successfully! Click the link to preview.',
          note: 'For permanent hosting, enable GitHub Pages in repository settings.'
        })
      } catch (error: any) {
        if (error.status === 404) {
          // Repository doesn't exist, create it
          try {
            await github.createRepository(
              repoName,
              'Landing pages for Marketing Automator campaigns'
            )
            repoCreated = true
            
            // Wait a moment for the repo to be ready
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Now try to create the landing page again
            const result = await github.createLandingPage(
              username,
              repoName,
              fileName,
              htmlContent,
              'Test landing page created by Marketing Automator'
            )
            
            // Construct URLs
            const githubUrl = `https://github.com/${username}/${repoName}/blob/main/${fileName}`
            const rawUrl = `https://raw.githubusercontent.com/${username}/${repoName}/main/${fileName}`
            const previewUrl = `https://htmlpreview.github.io/?${rawUrl}`
            
            return NextResponse.json({
              success: true,
              url: previewUrl,
              githubUrl: githubUrl,
              rawUrl: rawUrl,
              message: 'Repository created and test page added successfully! Click the link to preview.',
              repoCreated: true,
              note: 'For permanent hosting, enable GitHub Pages in repository settings.'
            })
          } catch (createError: any) {
            console.error('Failed to create repository:', createError)
            
            if (createError.status === 422) {
              return NextResponse.json({
                error: 'Repository already exists or name is invalid.',
                message: 'Please check your GitHub account.'
              }, { status: 400 })
            }
            
            throw createError
          }
        }
        throw error
      }
    } catch (error: any) {
      console.error('GitHub error details:', error)
      
      if (error.status === 401) {
        return NextResponse.json({
          error: 'GitHub authentication failed. Please check your Personal Access Token.',
          hint: 'Make sure your PAT has "repo" scope enabled.'
        }, { status: 401 })
      }
      
      if (error.status === 403) {
        return NextResponse.json({
          error: 'Permission denied. Your PAT needs "repo" scope.',
          hint: 'Generate a new PAT with full "repo" permissions.'
        }, { status: 403 })
      }
      
      throw error
    }
  } catch (error) {
    console.error('Failed to create test landing page:', error)
    return NextResponse.json(
      { error: 'Failed to create test landing page' },
      { status: 500 }
    )
  }
}