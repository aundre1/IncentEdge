# LinkedIn OAuth Setup — IncentEdge
**Status: COMPLETE ✅ — 2026-02-27**

## What Was Done (Autonomous — CoCo)

1. Created LinkedIn Developer App "IncentEdge" (App ID: 231494497)
   - LinkedIn Page: IncentEdge LLC
   - Logo: Uploaded IncentEdge brand logo

2. Added "Sign In with LinkedIn using OpenID Connect" product

3. Added Supabase callback URL:
   `https://pzmunszcxmmncppbufoj.supabase.co/auth/v1/callback`

4. Enabled LinkedIn OIDC in Supabase via Management API
   - `external_linkedin_oidc_enabled: true`
   - Client ID + Secret configured

5. Added credentials to:
   - `.env.local` (local dev)
   - Vercel production (LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET)

## Credentials

- **Client ID:** `77oji62yvnfdsz`
- **Client Secret:** stored in Vercel + .env.local
- **App ID:** 231494497
- **LinkedIn Developer Console:** https://www.linkedin.com/developers/apps/231494497/auth

## Code (Already Wired)

- `src/lib/auth-providers.ts` — `signInWithLinkedIn()` uses `linkedin_oidc` provider
- `src/components/OAuthButtons.tsx` — button now active (no "Coming Soon" pill)

---
*Completed: 2026-02-27 | By: CoCo (autonomous)*
