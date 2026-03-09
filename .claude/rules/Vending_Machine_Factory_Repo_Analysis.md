# Vending Machine Factory - Repo Analysis
**Repo:** [github.com/SuperfastSimon/vending-machine-factory](https://github.com/SuperfastSimon/vending-machine-factory)
**Taal:** TypeScript
**Homepage:** https://vending-machine-factory.vercel.app
**Branch:** main

---

## Repo Structuur

```
vending-machine-factory/
├── .claude/rules/          # AI assistant behavioral rules
├── .devcontainer/          # VS Code devcontainer (Node 22)
├── .github/workflows/      # CI pipeline (ci.yml)
├── __tests__/              # Vitest test suite (7 files, 27 tests)
├── app/
│   ├── (owner)/            # Owner dashboard (owner, agents, customers, settings, billing)
│   ├── (customer)/         # Customer UI (dashboard, [product], history, account)
│   ├── (public)/           # Landing, pricing, auth (login + register)
│   └── api/                # agent/, auth/, billing/, checkout/, cron/, keys/, webhooks/
├── components/             # AgentInterface, LogoutButton, ManageSubscriptionButton, RunsChart, StatusBadge
├── config/product.ts       # Product metadata, pricing, agent IDs, availableAgents (16 agents)
├── hooks/useAgentRun.ts    # React hook: submit agent run, poll status, track elapsed
├── lib/                    # affiliate, api-auth, autogpt, email, prisma, supabase-server
├── prisma/schema.prisma    # User + AgentRun models (PostgreSQL)
├── middleware.ts           # Auth middleware + referral cookie capture
├── vitest.config.ts        # Test configuration
├── vercel.json             # Vercel deployment config with security headers
├── tsconfig.json
└── package.json            # Node 22, npm
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Styling** | Tailwind CSS |
| **Auth** | Supabase SSR (cookie-based JWT) |
| **Database** | Supabase (PostgreSQL) |
| **ORM** | Prisma 5 |
| **Payments** | Stripe |
| **Charts** | Recharts |
| **AI Backend** | AutoGPT External API |
| **Email** | Resend |
| **Testing** | Vitest |
| **Hosting** | Vercel |

---

## Architecture: Dual Frontend

```
/app
 ├── /(owner)/          → Owner Dashboard (KPIs, agents, customers, settings, billing)
 ├── /(customer)/       → Customer UI (dashboard, product interface, history, account)
 ├── /(public)/         → Landing page, pricing, auth (login + register)
 └── /api/              → Agent proxy, auth, billing, checkout, cron, keys, webhooks
```

### Rollen
- **Owner:** Dashboard met KPIs (RunsChart), agent management, klanten lijst, settings, billing
- **Customer:** AgentInterface, product pages, usage history, account/subscriptions, API keys
- **Public:** Landing page, pricing (met Stripe checkout), login/signup

---

## AutoGPT API Wrapper

**Locatie:** `lib/autogpt.ts`
**Base URL:** `https://backend.agpt.co/external-api`
**Auth:** API Key via `X-API-Key` header

### Functies:
| Functie | Beschrijving |
|---------|--------------|
| `triggerAgentRun(graphId, inputs)` | Start een agent run |
| `getExecutionStatus(graphId, executionId)` | Check status van een run |
| `listExecutions(graphId)` | Lijst van alle executions |
| `listLibraryAgents()` | Lijst van alle agents in library |
| `pollExecution(graphId, executionId)` | Poll tot completion |

### Frontend Hook
`hooks/useAgentRun.ts` — States: idle → submitting → polling → completed | error

---

## Business Model (per Vending Machine)

| Plan | Prijs | Credits/maand |
|------|-------|---------------|
| Free | €0 | 5 |
| Pro | €19 | 100 |
| Business | €49 | 500 |

---

## API Routes

| Route | Method | Beschrijving |
|-------|--------|-------------|
| `/api/agent/run` | POST | Trigger agent run, deduct credit |
| `/api/agent/status/[executionId]` | GET | Poll execution status |
| `/api/auth/logout` | POST | Clear Supabase session |
| `/api/billing/portal` | POST | Create Stripe billing portal session |
| `/api/checkout` | POST | Create Stripe checkout session |
| `/api/cron/health` | GET | Health check ({ status, timestamp }) |
| `/api/keys` | POST/DELETE | Generate/revoke API keys (Pro+) |
| `/api/webhooks/autogpt` | POST | AutoGPT execution webhook |
| `/api/webhooks/stripe` | POST | Stripe webhook (checkout, invoice, subscription) |

---

## Database Models

### User
- id, email, plan, credits_remaining, stripe_customer_id, api_key, referral_code, referred_by, created_at
- Relation: has many AgentRun

### AgentRun
- id, user_id, agent_id, execution_id, status, output, error, created_at, updated_at
- Relation: belongs to User

---

## Components

| Component | Type | Beschrijving |
|-----------|------|-------------|
| `AgentInterface` | Client | Agent interaction UI (form, status, output, credits) |
| `LogoutButton` | Client | Calls /api/auth/logout, redirects to / |
| `ManageSubscriptionButton` | Client | Opens Stripe billing portal |
| `RunsChart` | Client | Recharts chart for agent run stats |
| `StatusBadge` | Server | Status indicator badge |

---

## Lib Modules

| Module | Beschrijving |
|--------|-------------|
| `affiliate.ts` | Referral code generation + tracking |
| `api-auth.ts` | API key authentication (Bearer vmf_xxx) |
| `autogpt.ts` | AutoGPT External API wrapper |
| `email.ts` | Resend email (welcome + run notifications) |
| `prisma.ts` | Prisma client singleton |
| `supabase-server.ts` | Server-side Supabase client factory |

---

## Tests

7 test files, 27 tests (Vitest):
- `affiliate.test.ts` — referral code generation + tracking
- `api-auth.test.ts` — API key authentication
- `autogpt-webhook.test.ts` — AutoGPT webhook handler
- `cron-health.test.ts` — health check endpoint
- `product-config.test.ts` — product configuration validation
- `stripe-webhook.test.ts` — Stripe webhook handler
- `useAgentRun.test.ts` — useAgentRun hook export

---

## Verbonden AutoGPT Agents (16)

| Agent | Library ID | Graph ID |
|-------|------------|----------|
| Business Concept Studio | `6387fd67...` | `cd0870a3...` |
| Genesis Boss Agent | `d5f31b2a...` | `63421075...` |
| Code Writer Agent | `a2627a06...` | `825855d2...` |
| Code Architect Agent | `ecbd1bbb...` | `9d4cedb8...` |
| Genesis Builder Agent | `96c9f3ce...` | `af73c435...` |
| Genesis Deployment Agent | `56b3ad38...` | `da52be89...` |
| Genesis Protocol Maintainer | `d4488f6d...` | `c1fdd73c...` |
| Business Plan Generator | `5c4d8efe...` | `241fe3f4...` |
| Image Classifier | `52e2cbca...` | `f24f0acc...` |
| Product Listing Generator | `fa4dc0f3...` | `be06eaa8...` |
| ProCodePro | `ff17817d...` | `3b98e0e4...` |
| ProCodePro V2 | `ff45e20c...` | `7fff0519...` |
| ProCodePro mini 10 | `dff91533...` | `8d9f07ed...` |
| WrapAppPro | `aab46efc...` | `9c2c7c87...` |
| Code Quality Scanner | `73207433...` | `8063f37a...` |
| Certificate Generator | `e5d3c12a...` | `5cf92dfd...` |

Full IDs in `config/product.ts` → `availableAgents`

---

## Huidige Status

- ✅ Architectuur blueprint compleet
- ✅ Next.js 14 App Router (migrated from Vite/React)
- ✅ Dual frontend (owner + customer + public)
- ✅ AutoGPT API wrapper + useAgentRun hook
- ✅ Supabase SSR auth with middleware
- ✅ Stripe integration (checkout, billing portal, webhooks)
- ✅ Prisma ORM (User + AgentRun models)
- ✅ Affiliate system (referral codes, tracking)
- ✅ API key authentication (Pro+)
- ✅ Email notifications (Resend)
- ✅ Vitest test suite (7 files, 27 tests)
- ✅ CI pipeline (GitHub Actions: test + typecheck + build)
- ✅ Health check endpoint

---

*Last updated: March 2026*
