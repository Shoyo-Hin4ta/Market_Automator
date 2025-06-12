import { createClient } from '@/app/src/lib/supabase/server'
import { OpenAIService } from '@/app/src/services/openai'
import { LANDING_PAGE_PROMPT_TEMPLATE, fillTemplate } from '@/app/src/lib/ai/prompts'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get OpenAI API key from database
    const { data: apiKeyData } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('user_id', user.id)
      .eq('service', 'openai')
      .single()
    
    if (!apiKeyData) {
      return NextResponse.json(
        { error: 'OpenAI not connected' },
        { status: 400 }
      )
    }
    
    // Decrypt API key
    const apiKey = apiKeyData.encrypted_key // Using plain text for now
    
    // Get campaign data from request
    const { campaignName, designUrl, tone } = await request.json()
    
    // Generate landing page content
    const openaiService = new OpenAIService(apiKey)
    const content = await openaiService.generateLandingPageContent({
      title: campaignName,
      description: `A ${tone || 'professional'} marketing campaign`,
      imageUrl: designUrl || ''
    })
    
    // Parse the JSON response and create HTML
    try {
      const parsedContent = JSON.parse(content)
      
      // Generate HTML from the parsed content
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${parsedContent.headline || campaignName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 0;
      background: #f5f5f5;
    }
    .hero {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 60px 20px;
      text-align: center;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    h1 { font-size: 3rem; margin-bottom: 1rem; }
    h2 { font-size: 1.5rem; font-weight: normal; margin-bottom: 2rem; }
    .benefits {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin: 3rem 0;
    }
    .benefit {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .cta {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 16px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-size: 1.2rem;
      transition: background 0.3s;
    }
    .cta:hover { background: #5a67d8; }
    .footer {
      text-align: center;
      padding: 2rem;
      color: #666;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 2rem 0;
    }
  </style>
</head>
<body>
  <div class="hero">
    <div class="container">
      <h1>${parsedContent.headline || campaignName}</h1>
      <h2>${parsedContent.subheadline || 'Transform your business today'}</h2>
      ${designUrl ? `<img src="${designUrl}" alt="${campaignName}">` : ''}
    </div>
  </div>
  
  <div class="container">
    <div class="benefits">
      ${(parsedContent.benefits || ['Benefit 1', 'Benefit 2', 'Benefit 3']).map(benefit => `
        <div class="benefit">
          <h3>${benefit}</h3>
        </div>
      `).join('')}
    </div>
    
    <div style="text-align: center; margin: 3rem 0;">
      <a href="#" class="cta">${parsedContent.cta_text || 'Get Started'}</a>
    </div>
  </div>
  
  <div class="footer">
    <p>${parsedContent.footer || 'Trusted by thousands of customers worldwide'}</p>
  </div>
</body>
</html>`
      
      return NextResponse.json({ 
        title: parsedContent.headline || campaignName,
        html 
      })
    } catch {
      // If parsing fails, return a default landing page
      return NextResponse.json({ 
        title: campaignName,
        html: `<!DOCTYPE html>
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
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      text-align: center;
      max-width: 600px;
    }
    h1 { color: #333; margin-bottom: 1rem; }
    img { max-width: 100%; height: auto; border-radius: 8px; margin: 2rem 0; }
    .cta {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${campaignName}</h1>
    ${designUrl ? `<img src="${designUrl}" alt="${campaignName}">` : ''}
    <p>Welcome to our campaign. Discover amazing opportunities.</p>
    <a href="#" class="cta">Learn More</a>
  </div>
</body>
</html>`
      })
    }
  } catch (error) {
    console.error('Landing page generation error:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Failed to generate landing page content'
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'OpenAI API key is invalid or missing'
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'OpenAI rate limit exceeded. Please try again later.'
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}