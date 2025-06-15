import crypto from 'crypto'

export const CANVA_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_CANVA_CLIENT_ID!,
  clientSecret: process.env.CANVA_CLIENT_SECRET!,
  redirectUri: process.env.CANVA_REDIRECT_URI || 'http://127.0.0.1:3000/api/auth/callback/canva',
  authorizationUrl: 'https://www.canva.com/api/oauth/authorize',
  tokenUrl: 'https://api.canva.com/rest/v1/oauth/token',
  scopes: [
    'design:content:read',
    'design:content:write', 
    'design:meta:read',
    'design:permission:read',
    'asset:read',
    'profile:read',
    'brandtemplate:content:read',
    'brandtemplate:meta:read'
  ]
}

// PKCE helper functions
export function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString('base64url')
}

export function generateCodeChallenge(verifier: string): string {
  return crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url')
}

export function generateState(): string {
  return crypto.randomBytes(16).toString('hex')
}