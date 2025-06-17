# Canva OAuth Cookie Domain Fix

## Problem
Cookies were being isolated between 127.0.0.1 and localhost domains, causing the OAuth flow to fail with missing verifier/state errors.

## Root Cause
When Canva redirects back to the callback URL, the browser was sometimes using localhost instead of 127.0.0.1, causing cookies set on 127.0.0.1 to be inaccessible.

## Solution Implemented

### 1. Fixed Redirect URLs in `/app/api/auth/callback/canva/route.ts`
- Added explicit `baseUrl` that always uses `http://127.0.0.1:3000` in development
- Updated all `NextResponse.redirect()` calls to use `baseUrl` instead of `request.url`
- This ensures all redirects consistently use 127.0.0.1

### 2. Updated Cookie Settings in `/app/api/integrations/canva/auth/route.ts`
- Added explicit domain setting for cookies in development: `domain: '127.0.0.1'`
- Added `path: '/'` to ensure cookies are accessible across all paths
- Used consistent cookie options for both set and delete operations

### 3. Fixed Cookie Deletion in Callback
- Updated cookie deletion to use the same options as when setting cookies
- Ensures cookies are properly cleared after successful OAuth

### 4. Updated Middleware Redirects in `/middleware.ts`
- Added consistent `baseUrl` handling to ensure all middleware redirects use 127.0.0.1 in development

## Configuration Requirements
Ensure your `.env.local` file has:
```
CANVA_REDIRECT_URI=http://127.0.0.1:3000/api/auth/callback/canva
```

## Testing
1. Always access the application at `http://127.0.0.1:3000` (not localhost:3000)
2. Ensure your Canva app settings use the exact redirect URI: `http://127.0.0.1:3000/api/auth/callback/canva`
3. Clear browser cookies before testing to ensure clean state

## Key Changes Summary
- All development URLs now consistently use 127.0.0.1 instead of localhost
- Cookies are explicitly set with domain='127.0.0.1' in development
- All redirects use a consistent baseUrl
- Cookie deletion uses the same options as cookie setting