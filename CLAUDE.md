# CLAUDE.md — Vending Machine Factory

This file provides AI assistants with context about the codebase structure, conventions, and workflows.

---

## Current Session Status (last updated: 2026-03-10)

### Active PR
**Branch:** `claude/fix-github-vercel-integration-7lshW`
**Status:** Pushed, ready to merge into `main` — PR needs to be created manually on GitHub (gh CLI not available).

### What's in the PR (all tested, 28/28 passing)
- `app/(public)/auth/callback/route.ts` — NEW: Supabase email verification callback handler
- `app/api/cron/health/route.ts` — enhanced: verifies DB connectivity, not just uptime
- `components/` + `package.json` — added `@vercel/speed-insights`
- `app/api/webhooks/autogpt/route.ts` — security: `AUTOGPT_WEBHOOK_SECRET` now required, uses `timingSafeEqual`
- `.github/workflows/ci.yml` — CI upgraded from Node 20 → 22
- `.env.example` — added
- `__tests__/autogpt-webhook.test.ts` — updated for required secret

### Open PRs to CLOSE (do not merge)
- PR #1 — Vercel bot Speed Insights (wrong package manager)
- PR #6 — Speed Insights only (superseded)
- PR #10 — Documentation/security (all cherry-picked into active branch)
- PR #14 — Health check + Next.js v15 (Next.js v15 removed, health check superseded)

### Pending manual steps (user needs to do in dashboards)
1. **Supabase → Authentication → URL Configuration**
   - Site URL → `https://your-app.vercel.app`
   - Redirect URLs → add `https://your-app.vercel.app/auth/callback`
2. **Vercel → Settings → Environment Variables** — confirm these are set:
   - `POSTGRES_URL` (Supabase → Settings → Database → Transaction connection string)
   - `POSTGRES_URL_NON_POOLING` (Supabase → Settings → Database → Session connection string)
   - `NEXT_PUBLIC_SUPABASE_URL` ✅ (user confirmed set)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅ (user confirmed set)
   - `NEXT_PUBLIC_APP_URL` → `https://your-app.vercel.app`
3. **Merge the PR** on GitHub after above steps

### Known remaining issues (after PR merge + env vars)
- None known — auth flow, DB, webhooks, health check all wired up

---

## Project Overview

**Vending Machine Factory** is a micro-SaaS starter template for building AI-powered SaaS products. Fork it, configure the agent, customize the UI, deploy. Each fork becomes one "vending machine" — a product where customers pay to run an AutoGPT agent and receive value.

- **Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma, Supabase, Stripe, Vercel
- **Database:** PostgreSQL (via Prisma ORM)
- **Auth:** Supabase SSR with cookie-based JWT sessions
- **AI Backend:** AutoGPT External API (`lib/autogpt.ts`)
- **Email:** Resend (`lib/email.ts`)
- **Testing:** Vitest (`vitest.config.ts`)
- **Deployment:** Vercel (configured via `vercel.json`)
- **Version:** 0.1.0

---

## App Structure (Dual Frontend)

All three route groups are implemented:

```
app/
├── (owner)/                # Owner Dashboard — protected, role: owner (OWNER_EMAIL)
│   ├── owner/              # KPIs, revenue chart, agent status (main dashboard)
│   ├── agents/             # Agent management
│   ├── customers/          # Customer list with run counts
│   ├── settings/           # Product config display, env var status
│   ├── billing/            # Revenue, payouts
│   └── layout.tsx          # Owner sidebar layout with nav + LogoutButton
│
├── (customer)/             # Customer UI — protected, any authenticated user
│   ├── dashboard/          # Customer dashboard with AgentInterface
│   ├── [product]/          # Dynamic product page (lookup from availableAgents)
│   ├── history/            # Past runs
│   ├── account/            # Profile, subscription, API key management
│   └── layout.tsx          # Customer nav layout (auto-creates user in Prisma, tracks referrals)
│
├── (public)/               # Public pages — no auth required
│   ├── page.tsx            # Landing page
│   ├── pricing/            # Pricing page (client component, wired to Stripe checkout)
│   └── auth/               # Login + Register pages
│       ├── login/
│       └── register/
│
├── api/
│   ├── agent/
│   │   ├── run/            # POST — trigger agent run, deduct credit
│   │   └── status/[executionId]/  # GET — poll for result
│   ├── auth/
│   │   └── logout/         # POST — clear Supabase session
│   ├── billing/
│   │   └── portal/         # POST — create Stripe billing portal session
│   ├── checkout/           # POST — create Stripe checkout session
│   ├── cron/
│   │   └── health/         # GET — health check ({ status, timestamp })
│   ├── keys/               # POST/DELETE — generate/revoke API keys (Pro+ only)
│   └── webhooks/
│       ├── autogpt/        # POST — AutoGPT execution webhook
│       └── stripe/         # POST — Stripe webhook (checkout, invoice, subscription)
│
├── layout.tsx              # Root layout (Vercel Analytics)
└── globals.css             # Global Tailwind + CSS variables
```

---

## Repository Structure

```
vending-machine-factory/
├── .claude/rules/          # Behavioral rules for AI assistants
├── .devcontainer/          # VS Code devcontainer (Node 22)
├── .github/workflows/      # CI pipeline (ci.yml)
├── __tests__/              # Vitest test files (7 test files, 27 tests)
│   ├── affiliate.test.ts
│   ├── api-auth.test.ts
│   ├── autogpt-webhook.test.ts
│   ├── cron-health.test.ts
│   ├── product-config.test.ts
│   ├── stripe-webhook.test.ts
│   └── useAgentRun.test.ts
├── app/                    # Next.js App Router (see structure above)
├── components/
│   ├── AgentInterface.tsx  # Main agent interaction UI (form, status, output)
│   ├── LogoutButton.tsx    # Client component, calls /api/auth/logout
│   ├── ManageSubscriptionButton.tsx  # Opens Stripe billing portal
│   ├── RunsChart.tsx       # Recharts chart for agent run stats
│   └── StatusBadge.tsx     # Status indicator badge
├── config/
│   └── product.ts          # Product metadata, pricing, agent IDs, availableAgents
├── hooks/
│   └── useAgentRun.ts      # React hook: submit agent run, poll status, track elapsed time
├── lib/
│   ├── affiliate.ts        # Referral code generation and tracking
│   ├── api-auth.ts         # API key authentication (Bearer vmf_xxx)
│   ├── autogpt.ts          # AutoGPT External API wrapper
│   ├── email.ts            # Resend email (welcome + run completed notifications)
│   ├── prisma.ts           # Prisma client singleton
│   └── supabase-server.ts  # Server-side Supabase client factory
├── prisma/
│   └── schema.prisma       # User + AgentRun models (PostgreSQL)
├── middleware.ts            # Auth middleware + referral cookie capture
├── vitest.config.ts         # Vitest configuration
├── tsconfig.json
├── vercel.json
└── package.json
```

---

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server on port 3000 |
| `npm run build` | Generate Prisma client + build Next.js for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest test suite (`vitest run`) |
| `npx prisma generate` | Regenerate Prisma client after schema changes |
| `npx prisma migrate dev` | Apply DB migrations in development |
| `npx tsc --noEmit` | Type-check without emitting files |

---

## CI/CD Pipeline

Defined in `.github/workflows/ci.yml`. Triggers on every push and pull request.

Steps:
1. Checkout code
2. Set up Node.js 22 (npm cache enabled)
3. `npm ci`
4. `npx prisma generate`
5. `npm test` (Vitest)
6. `npx tsc --noEmit`
7. `npm run build` (uses placeholder Supabase credentials in CI)

---

## Database

**ORM:** Prisma 5
**Database:** PostgreSQL

### Connection Variables
- `POSTGRES_URL` — pooled connection (for app runtime)
- `POSTGRES_URL_NON_POOLING` — direct connection (for migrations)

### Models (`prisma/schema.prisma`)

```prisma
model User {
  id                  String     @id @db.Uuid
  email               String     @unique
  plan                String     @default("free")
  credits_remaining   Int        @default(5)
  stripe_customer_id  String?    @unique
  api_key             String?    @unique
  referral_code       String?    @unique
  referred_by         String?
  created_at          DateTime   @default(now())
  agent_runs          AgentRun[]
}

model AgentRun {
  id           String   @id @default(uuid())
  user_id      String   @db.Uuid
  agent_id     String
  execution_id String   @unique
  status       String   @default("queued")
  output       String?
  error        String?
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt
  user         User     @relation(fields: [user_id], references: [id])
}
```

Note: `User.id` is set from Supabase Auth (not auto-generated by Prisma).

After any schema changes, run `npx prisma generate` and `npx prisma migrate dev`.

---

## Authentication

Authentication is handled by **Supabase SSR** using cookie-based JWT sessions.

- `middleware.ts` intercepts all requests and validates the Supabase session.
- Protected path prefixes: `/dashboard`, `/owner`, `/agents`, `/history`, `/account`, `/billing`, `/customers`, `/settings`.
- The middleware also captures `?ref=` query params into a `ref_code` cookie (30 days) for the affiliate system.
- Owner access is determined by matching `user.email` against the `OWNER_EMAIL` env var (checked in the owner layout).
- Public routes include `/`, `/auth/login`, `/auth/register`, `/pricing`.

### Required Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
POSTGRES_URL=
POSTGRES_URL_NON_POOLING=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
AUTOGPT_API_KEY=               # API key for the AutoGPT External API
AUTOGPT_API_URL=               # Optional override (default: https://backend.agpt.co/external-api)
AUTOGPT_WEBHOOK_SECRET=        # Shared secret to verify AutoGPT webhook callbacks
OWNER_EMAIL=                   # Email of the admin user with access to /owner routes
RESEND_API_KEY=                # Optional — Resend API key for transactional emails
EMAIL_FROM=                    # Optional — sender address (default: product name via resend.dev)
NEXT_PUBLIC_APP_URL=           # Optional — base URL for email links
```

---

## Product Configuration

All product metadata and pricing lives in **`config/product.ts`**. Update this file to change:
- Product name, tagline, and brand colors
- Active AutoGPT agent (`agent.libraryId` + `agent.graphId`)
- Pricing tiers and credit allocations
- Affiliate system settings

The `availableAgents` export in the same file lists all connected AutoGPT agents (16 agents) with their IDs. Copy the relevant IDs into `productConfig.agent` when forking for a specific product.

### Current Pricing Tiers

| Plan | Price | Credits | Notes |
|------|-------|---------|-------|
| Free | €0 | 5 | Basic access |
| Pro | €19/mo | 100 | Priority + API access |
| Business | €49/mo | 500 | White-label support |

---

## AutoGPT Integration

The connection layer lives in **`lib/autogpt.ts`**.

| Function | Endpoint | Description |
|----------|----------|-------------|
| `triggerAgentRun(graphId, inputs)` | `POST /v1/graphs/{id}/execute` | Start an agent run |
| `getExecutionStatus(graphId, executionId)` | `GET /v1/graphs/{id}/executions/{execId}` | Check run status |
| `listExecutions(graphId)` | `GET /v1/graphs/{id}/executions` | List all runs |
| `listLibraryAgents()` | `GET /v1/library/agents` | List available agents |
| `pollExecution(graphId, executionId, onUpdate?)` | polling wrapper | Poll until done |

**Auth:** `X-API-Key` header, value from `AUTOGPT_API_KEY` env var.

### Agent Run Flow

1. Customer submits form → `POST /api/agent/run`
2. Route checks auth + credits, calls `triggerAgentRun`, decrements credit
3. Returns `{ executionId, status: "queued" }`
4. Frontend polls `GET /api/agent/status/[executionId]` until `completed` or `failed`
5. Display outputs to customer

### Frontend Hook

`hooks/useAgentRun.ts` provides the `useAgentRun()` React hook:
- States: `idle` → `submitting` → `polling` → `completed` | `error`
- Tracks elapsed time during polling
- Extracts output from various response shapes (result, text, content, etc.)

---

## Stripe Integration

- **Checkout:** `POST /api/checkout` creates a Stripe checkout session for paid plans.
- **Billing portal:** `POST /api/billing/portal` creates a Stripe billing portal session for subscription management.
- **Webhooks:** `POST /api/webhooks/stripe` handles:
  - `checkout.session.completed` — upgrade user plan + set credits
  - `invoice.paid` — refresh credits on renewal
  - `customer.subscription.deleted` — downgrade to free plan

---

## Affiliate System

- Managed in `lib/affiliate.ts`
- Referral codes are generated as `ref_` + 12 hex chars
- `?ref=CODE` query params are captured in middleware as cookies
- On user registration (in customer layout), referrals are tracked via `referred_by` field
- Config in `productConfig.affiliate`: `enabled`, `commissionPercent` (20%), `cookieDays` (30)

---

## API Key Authentication

- `lib/api-auth.ts` authenticates requests using `Authorization: Bearer vmf_xxx` headers.
- `POST /api/keys` generates a new API key (Pro+ plans only).
- `DELETE /api/keys` revokes the current API key.
- API keys are stored in the `User.api_key` field.

---

## Email Notifications

`lib/email.ts` uses Resend for transactional emails (gracefully skips if `RESEND_API_KEY` is not set):
- `sendWelcomeEmail(to)` — sent on first login/registration
- `sendRunCompletedEmail(to, executionId, status)` — sent when an agent run completes or fails

---

## Forking for a New Product

1. Fork the repo on GitHub
2. Update `config/product.ts` — set name, agent IDs, pricing
3. Customize the customer product page (`app/(customer)/[product]/`)
4. Set up Stripe products/prices
5. Set environment variables in Vercel
6. Deploy and connect custom domain

---

## Code Conventions

### TypeScript
- **Strict mode** is enabled — all types must be explicit.
- Path alias `@/*` resolves to the project root.
- No `any` types without justification.
- Run `npx tsc --noEmit` before committing to catch type errors.

### React / Next.js
- Use the **App Router** (`app/` directory) — not the Pages Router.
- Mark client components explicitly with `"use client"` at the top of the file.
- Prefer Server Components by default; use Client Components only when interactivity or browser APIs are needed.
- Route groups use parentheses: `(public)` — these don't affect URL paths.

### Styling
- **Tailwind CSS** utility classes are used throughout.
- CSS variables are defined in `app/globals.css` for theme tokens (supports light/dark mode).
- Do not add inline styles — use Tailwind or CSS variables.

### ESLint
- Config extends `next/core-web-vitals`.
- Run `npm run lint` before opening PRs.

---

## Deployment

The app deploys to **Vercel**. Configuration is in `vercel.json`.

Security headers applied on all routes:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

The build command on Vercel runs `npx prisma generate && next build`, matching the local `npm run build` script.

---

## Dev Container

A devcontainer configuration is provided at `.devcontainer/devcontainer.json` for VS Code / GitHub Codespaces:

- Base image: Node.js 22
- Auto-runs `npm install` and `npx prisma generate` on container creation
- Forwards port 3000
- Pre-installs VS Code extensions: Prisma, Prettier, ESLint

---

## Key Architectural Decisions

1. **Supabase for auth, Prisma for data** — Supabase handles JWT/session management; Prisma manages application data in PostgreSQL. User IDs from Supabase Auth are stored as the `User.id` in Prisma.
2. **Credits system** — Each user has a `credits_remaining` counter. Free users start with 5 credits; paid plans grant more. One agent run = one credit.
3. **Route protection in middleware** — Auth is enforced at the edge in `middleware.ts`, not per-page. Add new protected path prefixes there.
4. **Centralized config** — Pricing, branding, agent IDs, and feature flags live in `config/product.ts` to avoid magic strings scattered across the codebase.
5. **Dual frontend** — Owner and customer UIs are separate route groups with separate layouts and middleware roles, keeping concerns cleanly separated.
6. **API key auth** — Pro+ users can generate API keys (`vmf_` prefix) for programmatic access, authenticated via `lib/api-auth.ts`.
7. **Affiliate tracking** — Referral codes are captured via URL params and cookies, tracked on registration.
