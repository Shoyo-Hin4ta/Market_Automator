import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Test endpoint is working',
    instructions: 'Use POST method to populate test data'
  })
}