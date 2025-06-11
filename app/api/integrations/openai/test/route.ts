import { NextRequest, NextResponse } from 'next/server'
import { OpenAIService } from '@/app/src/services/openai'

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json()
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      )
    }
    
    const openaiService = new OpenAIService(apiKey)
    const isValid = await openaiService.testConnection()
    
    return NextResponse.json({ 
      success: isValid,
      message: isValid ? 'Connection successful' : 'Invalid API key'
    })
  } catch (error) {
    console.error('OpenAI test connection error:', error)
    return NextResponse.json(
      { error: 'Failed to test connection' },
      { status: 500 }
    )
  }
}