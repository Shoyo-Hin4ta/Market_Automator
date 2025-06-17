export function generateLandingPage(campaign: {
  title: string
  imageUrl: string
  description: string
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${campaign.title}</title>
    <style>
        /* Tailwind-inspired styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f9fafb;
            color: #1f2937;
            line-height: 1.6;
            overflow-x: hidden;
        }
        
        /* Hide scrollbars but keep functionality */
        html {
            overflow-x: hidden;
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE and Edge */
        }
        html::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem 1rem;
        }
        
        h1 {
            font-size: 2.5rem;
            font-weight: 700;
            color: #111827;
            margin-bottom: 2rem;
            text-align: center;
        }
        
        .hero-image {
            width: 100%;
            max-width: 800px;
            height: auto;
            margin: 0 auto 2rem;
            display: block;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        
        .description {
            max-width: 800px;
            margin: 0 auto;
            font-size: 1.125rem;
            color: #4b5563;
            text-align: center;
            line-height: 1.75;
        }
        
        .cta {
            text-align: center;
            margin-top: 3rem;
        }
        
        .cta-button {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            padding: 0.75rem 2rem;
            border-radius: 0.375rem;
            text-decoration: none;
            font-weight: 500;
            transition: background-color 0.2s;
        }
        
        .cta-button:hover {
            background-color: #2563eb;
        }
        
        @media (max-width: 640px) {
            h1 {
                font-size: 2rem;
            }
            
            .description {
                font-size: 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${campaign.title}</h1>
        <img src="${campaign.imageUrl}" alt="${campaign.title}" class="hero-image">
        <p class="description">${campaign.description}</p>
        <div class="cta">
            <a href="#" class="cta-button">Learn More</a>
        </div>
    </div>
</body>
</html>`
}

export function generateLandingPageHTML(data: {
  title: string
  description: string
  imageUrl?: string
  content?: string
  features?: string[]
  audience?: string
  ctaText?: string
  ctaUrl?: string
}): string {
  const featuresHtml = data.features ? `
    <div class="features">
      <h2>Key Features</h2>
      <ul>
        ${data.features.map(feature => `<li>${feature}</li>`).join('\n        ')}
      </ul>
    </div>
  ` : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      overflow-x: hidden;
    }
    /* Hide scrollbars but keep functionality */
    html {
      overflow-x: hidden;
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE and Edge */
    }
    html::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Opera */
    }
    .hero {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 4rem 2rem;
      text-align: center;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }
    h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
      font-weight: 700;
    }
    .subtitle {
      font-size: 1.5rem;
      opacity: 0.9;
      margin-bottom: 2rem;
    }
    .hero-image {
      width: 100%;
      max-width: 800px;
      height: auto;
      margin: 2rem auto;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      display: block;
    }
    .content-section {
      background: white;
      padding: 4rem 0;
    }
    .content {
      margin: 2rem 0;
      font-size: 1.1rem;
      color: #555;
    }
    .features {
      background: #f8f9fa;
      padding: 3rem;
      border-radius: 12px;
      margin: 2rem 0;
    }
    .features h2 {
      color: #333;
      margin-bottom: 1.5rem;
      font-size: 2rem;
    }
    .features ul {
      list-style: none;
    }
    .features li {
      padding: 1rem 0;
      padding-left: 2rem;
      position: relative;
      font-size: 1.1rem;
    }
    .features li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #667eea;
      font-weight: bold;
      font-size: 1.3rem;
    }
    .cta-section {
      text-align: center;
      padding: 3rem 0;
    }
    .cta-button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 16px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1.2rem;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    .cta-button:hover {
      background: #5a67d8;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
    }
    .footer {
      background: #2d3748;
      color: white;
      text-align: center;
      padding: 2rem;
      margin-top: 4rem;
    }
    @media (max-width: 768px) {
      h1 {
        font-size: 2rem;
      }
      .subtitle {
        font-size: 1.2rem;
      }
      .hero {
        padding: 3rem 1rem;
      }
    }
  </style>
</head>
<body>
  <div class="hero">
    <div class="container">
      <h1>${data.title}</h1>
      <p class="subtitle">${data.description}</p>
    </div>
  </div>
  
  ${data.imageUrl ? `
  <div class="container">
    <img src="${data.imageUrl}" alt="${data.title}" class="hero-image">
  </div>
  ` : ''}
  
  <div class="content-section">
    <div class="container">
      ${data.content ? `
      <div class="content">
        ${data.content}
      </div>
      ` : ''}
      
      ${featuresHtml}
      
      ${data.audience ? `
      <div class="content">
        <p><strong>Perfect for:</strong> ${data.audience}</p>
      </div>
      ` : ''}
      
      ${data.ctaText && data.ctaUrl ? `
      <div class="cta-section">
        <a href="${data.ctaUrl}" class="cta-button">${data.ctaText}</a>
      </div>
      ` : ''}
    </div>
  </div>
  
  <div class="footer">
    <p>Created with Marketing Automator</p>
  </div>
</body>
</html>`
}