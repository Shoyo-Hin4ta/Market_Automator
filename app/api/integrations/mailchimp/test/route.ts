import { MailchimpService } from '../../../../services/mailchimp'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const { apiKey, serverPrefix } = await request.json()
  
  if (!apiKey || !serverPrefix) {
    return Response.json({ 
      success: false, 
      error: 'API key and server prefix are required' 
    }, { status: 400 })
  }
  
  const mailchimp = new MailchimpService(apiKey, serverPrefix)
  
  try {
    const isValid = await mailchimp.testConnection()
    
    if (!isValid) {
      return Response.json({ 
        success: false, 
        error: 'Invalid credentials' 
      }, { status: 401 })
    }
    
    // If connection is successful, also fetch audiences
    try {
      const audiences = await mailchimp.getAudiences()
      return Response.json({ 
        success: true, 
        audiences 
      })
    } catch (error) {
      // Connection works but failed to fetch audiences
      return Response.json({ 
        success: true, 
        audiences: [],
        warning: 'Connected but could not fetch audiences'
      })
    }
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: 'Failed to connect to Mailchimp' 
    }, { status: 500 })
  }
}