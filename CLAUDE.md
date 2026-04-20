# CLAUDE.md

## Commands

```bash
npm run dev      # Start dev server on localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```

No test suite. Migrations applied manually via Supabase dashboard SQL editor.

## Architecture

**Stack:** Next.js 16 App Router · Supabase (Postgres + Auth + RLS) · Tailwind CSS v4 · Anthropic Claude API · Resend · Vercel

This project replaces `~/Sites/sundeas` and reuses the same Supabase project (`bkwyrubkcnglwxdadrbb`) and Vercel deployment (sundeas.com).

### What this app does

Sundeas AI is an investment education and portfolio tracking platform. It:
1. **Educates** — plain-English explainers on ETFs, ISAs, risk, diversification
2. **Tracks** — connects to Trading 212 (read-only API) or accepts manual holdings
3. **Informs** — AI generates insights about a user's portfolio using Claude API

**Critical:** The app is NOT a financial adviser. Every AI output must be framed as educational information, never personal advice. The disclaimer "This is not financial advice. Past performance is not a guarantee of future results." must appear alongside all AI-generated content.

### Supabase clients

- `lib/supabase/server.ts` — cookie-based client for Server Components and Route Handlers
- `lib/supabase/server.ts` — cookie-based client for Server Components and Route Handlers
- `lib/supabase/client.ts` — browser client for Client Components
- `lib/supabase/admin.ts` — service-role client, only in cron routes (`/api/sync-portfolios`)

### Auth

Supabase Auth with Google/Apple OAuth + Magic Link (no passwords). Callback at `/api/auth/callback/route.ts`. Profile row auto-created on sign-up via database trigger.

### Styling

Tailwind CSS v4 — `@import "tailwindcss"` and `@theme` blocks in `globals.css`. No `tailwind.config.*` file.

### Cron jobs (`vercel.json`)

| Route | Schedule (UTC) |
|---|---|
| `/api/sync-portfolios` | Every Monday 9am |

Secured with `Authorization: Bearer $CRON_SECRET`.

### Key env vars

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
RESEND_API_KEY
RESEND_FROM
CRON_SECRET
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_GA_MEASUREMENT_ID
ALPHA_VANTAGE_API_KEY
```

### Database schema (key tables)

- `profiles` — extends auth.users (display_name, onboarding_completed, risk_profile jsonb)
- `modules` — education content (slug, title, body_md, video_url, tags[], published)
- `user_module_progress` — which modules a user has completed
- `portfolios` — user portfolios (source: trading212 | manual, t212_api_key stored server-side)
- `holdings` — individual ETF/share positions (ticker, quantity, target_weight)
- `insights` — AI-generated portfolio insights (content, market_context jsonb)

Schema in `supabase/schema.sql`.

### Mobile client

A React Native + Expo app will live in `mobile/` (not yet scaffolded). It is a thin client — all business logic lives in Next.js API routes. The mobile app never holds API secrets.
