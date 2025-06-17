# Canva OAuth Authentication Issue

## Problem Description
The Canva OAuth authentication flow is failing with "Invalid state parameter" error during the callback phase.

## Issue Details

### Error Message
```
GET /api/auth/callback/canva?code=xxx&state=499d7c250d966a3e8d4d73416b28b2fe 307
Redirects to: /settings?tab=canva&error=invalid_state
```

### Root Cause
The OAuth state and code_verifier cookies are not being properly shared between:
- `/api/integrations/canva/auth` (where cookies are set)
- `/api/auth/callback/canva` (where cookies should be read)

### Debug Logs
```
Setting OAuth cookies: {
  state: '9e89f8fcc504ad6e00a50793a72bb63a',
  codeVerifier: 'h9fWRhvlh6...',
  env: 'development',
  secure: false
}

OAuth callback state verification: {
  receivedState: '9e89f8fcc504ad6e00a50793a72bb63a',
  storedState: undefined,
  cookieExists: false,
  allCookies: [
    { name: 'sb-smoobjxhvuljlieyefhd-auth-token', hasValue: true },
    { name: 'sidebar:state', hasValue: true },
    { name: '__next_hmr_refresh_hash__', hasValue: true },
    { name: 'sb-jsowieaeaetjvgddosau-auth-token', hasValue: true }
  ]
}
```

## Technical Details

### Current Implementation
1. **Auth Route** (`/api/integrations/canva/auth/route.ts`):
   - Generates PKCE code_verifier and code_challenge
   - Generates random state for CSRF protection
   - Attempts to store state and code_verifier in cookies
   - Redirects to Canva OAuth URL

2. **Callback Route** (`/api/auth/callback/canva/route.ts`):
   - Receives authorization code and state from Canva
   - Attempts to read state from cookies for verification
   - Fails because cookies are not found

### Cookie Settings Used
```javascript
{
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 600, // 10 minutes
  path: '/'
}
```

## Attempted Solutions
1. **Explicit path setting**: Added `path: '/'` to ensure cookies are available across all routes
2. **Database fallback**: Attempted to store OAuth session in database as backup
3. **Enhanced logging**: Added debug logs to track cookie behavior
4. **Cookie options adjustment**: Tried various cookie configurations

## Environment
- Local development: `http://127.0.0.1:3000`
- Next.js App Router
- Cookies visible in browser but not accessible in API routes

## Possible Causes
1. **Next.js App Router cookie handling**: May have issues with cookie propagation between API routes
2. **Domain/subdomain mismatch**: Although using same domain, there might be subtle differences
3. **Middleware interference**: The Supabase middleware might be affecting cookie handling
4. **Browser security**: Modern browsers might block cookies in certain OAuth redirect scenarios

## Next Steps
1. Consider using URL parameters with signed tokens instead of cookies
2. Implement server-side session storage (Redis/database)
3. Use Next.js server actions instead of API routes
4. Check if this is a known Next.js App Router issue

## Related Files
- `/app/api/integrations/canva/auth/route.ts`
- `/app/api/auth/callback/canva/route.ts`
- `/app/lib/canva/config.ts`
- `/middleware.ts`