# CLAUDE.md — Vending Machine Factory

This file provides AI assistants with context about the codebase structure, conventions, and workflows.

## Project Overview

**Vending Machine Factory** is a micro-SaaS starter template for building AI-powered SaaS products. Fork it, configure the agent, customize the UI, deploy. Each fork becomes one "vending machine" — a product where customers pay to run an AutoGPT agent and receive value.

- **Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma, Supabase, Stripe, Vercel
- **Database:** PostgreSQL (via Prisma ORM)
- **Auth:** Supabase SSR with cookie-based JWT sessions
- **AI Backend:** AutoGPT External API (`lib/autogpt.ts`)
- **Deployment:** Vercel (configured via `vercel.json`)
- **Version:** 0.1.0 (early stage)

---

## Planned App Structure (Dual Frontend)

The target routing architecture has three route groups:

```
app/
├── (owner)/                # Owner Dashboard — protected, role: owner
│   ├── dashboard/          # KPIs, revenue, agent status
│   ├── agents/             # Trigger, monitor, view logs
│   ├── customers/          # Customer list, usage, revenue per user
│   ├── settings/           # Product config, pricing, branding
│   ├── billing/            # Revenue, payouts, Stripe dashboard
│   └── layout.tsx          # Owner sidebar layout
│
├── (customer)/             # Customer UI — protected, role: customer
│   ├── dashboard/          # Customer's personal dashboard
│   ├── [product]/          # The product interface (custom per vending machine)
│   ├── history/            # Past runs, outputs, downloads
│   ├── account/            # Profile, subscription, billing
│   └── layout.tsx          # Customer nav layout
│
├── (public)/               # Public pages — no auth required
│   ├── page.tsx            # Landing / marketing page
│   ├── pricing/            # Pricing page
│   └── auth/               # Login / signup
│
├── api/
│   ├── agent/              # AutoGPT agent proxy routes
│   │   ├── run/            # POST — trigger a run, deduct credit
│   │   └── status/[executionId]/  # GET — poll for result
│   ├── webhooks/           # Stripe + AutoGPT webhooks
│   └── cron/               # Scheduled tasks / health checks
│
├── layout.tsx              # Root layout (Vercel Analytics)
└── globals.css             # Global Tailwind + CSS variables
```

**Currently built:** `(public)/` routes and `api/agent/` routes. Owner and customer dashboards are next.

---

## Current Repository Structure

```
vending-machine-factory/
├── .claude/rules/          # Behavioral rules for AI assistants
├── .devcontainer/          # VS Code devcontainer (Node 20)
├── .github/workflows/      # CI pipeline (ci.yml)
├── app/
│   ├── (public)/           # Landing, pricing, auth pages
│   ├── api/agent/          # run/ and status/[executionId]/ routes
│   ├── api/webhooks/       # autogpt/ webhook handler
│   ├── layout.tsx
│   └── globals.css
├── config/
│   └── product.ts          # Product metadata, pricing, agent IDs
├── lib/
│   └── autogpt.ts          # AutoGPT External API wrapper
├── prisma/
│   └── schema.prisma       # User model (PostgreSQL)
├── middleware.ts            # Auth middleware — protects /dashboard and /owner
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
| `npx prisma generate` | Regenerate Prisma client after schema changes |
| `npx prisma migrate dev` | Apply DB migrations in development |
| `npx tsc --noEmit` | Type-check without emitting files |

**Note:** There are currently no automated tests. The CI pipeline runs type-checking and a full build instead.

---

## CI/CD Pipeline

Defined in `.github/workflows/ci.yml`. Triggers on every push and pull request.

Steps:
1. Checkout code
2. Set up Node.js 20 (npm cache enabled)
3. `npm ci`
4. `npx prisma generate`
5. `npx tsc --noEmit`
6. `npm run build` (uses placeholder Supabase credentials in CI)

---

## Database

**ORM:** Prisma 5
**Database:** PostgreSQL

### Connection Variables
- `POSTGRES_URL` — pooled connection (for app runtime)
- `POSTGRES_URL_NON_POOLING` — direct connection (for migrations)

### User Model (`prisma/schema.prisma`)

```prisma
model User {
  id                String   @id @default(uuid())
  email             String   @unique
  plan              String   @default("free")
  credits_remaining Int      @default(5)
  created_at        DateTime @default(now())
}
```

After any schema changes, run `npx prisma generate` and `npx prisma migrate dev`.

---

## Authentication

Authentication is handled by **Supabase SSR** using cookie-based JWT sessions.

- `middleware.ts` intercepts all requests and validates the Supabase session.
- Protected routes: `/dashboard/**` and `/owner/**` — unauthenticated users are redirected to `/auth/login`.
- Public routes include `/`, `/auth/login`, `/auth/register`, `/pricing`.

### Required Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
POSTGRES_URL=
POSTGRES_URL_NON_POOLING=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
AUTOGPT_API_KEY=               # API key for the AutoGPT External API
AUTOGPT_API_URL=               # Optional override (default: https://backend.agpt.co/external-api)
AUTOGPT_WEBHOOK_SECRET=        # Shared secret to verify AutoGPT webhook callbacks
OWNER_EMAIL=                   # Email of the admin user with access to /owner
```

---

## Product Configuration

All product metadata and pricing lives in **`config/product.ts`**. Update this file to change:
- Product name, tagline, and brand colors
- Active AutoGPT agent (`agent.libraryId` + `agent.graphId`)
- Pricing tiers and credit allocations
- Affiliate system settings

The `availableAgents` export in the same file lists all connected AutoGPT agents with their IDs. Copy the relevant IDs into `productConfig.agent` when forking for a specific product.

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

---

## Forking for a New Product

1. Fork the repo on GitHub
2. Update `config/product.ts` — set name, agent IDs, pricing
3. Build the customer product page (`app/(customer)/[product]/`)
4. Set up Stripe products/prices
5. Set environment variables in Vercel
6. Deploy and connect custom domain

Estimated time per new product: **1.5 – 2.5 hours** after the template is fully built.

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

- Base image: Node.js 20 on Debian Bullseye
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

---

## What Does Not Exist Yet

- `(owner)/` dashboard (KPIs, agent management, customer list)
- `(customer)/` product interface and history pages
- Stripe webhook handler
- Automated tests (no Jest, Vitest, or Playwright)
- `useAgentRun` React hook (`hooks/useAgentRun.ts`)

When adding these, follow the existing App Router conventions and the dual frontend routing structure above.
