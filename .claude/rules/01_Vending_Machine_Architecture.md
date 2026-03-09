# Online Vending Machine - Template Architecture Blueprint

## Overview

This is the reusable template for every Online Vending Machine product.
Fork it, configure the product-specific agent, customize the UI, deploy.

---

## Dual Frontend Routing (Implemented)

```
/app
 ├── /(owner)/                # Owner Dashboard (protected, OWNER_EMAIL match)
 │   ├── owner/               # Main overview - KPIs, revenue chart, agent status
 │   ├── agents/              # Agent management - trigger, monitor, logs
 │   ├── customers/           # Customer list with run counts, plan, credits
 │   ├── settings/            # Product config display, env var status
 │   ├── billing/             # Revenue, payouts, Stripe dashboard
 │   └── layout.tsx           # Owner sidebar layout with nav + LogoutButton
 │
 ├── /(customer)/             # Customer UI (protected, any authenticated user)
 │   ├── dashboard/           # Customer's personal dashboard with AgentInterface
 │   ├── [product]/           # Dynamic product page (lookup from availableAgents)
 │   ├── history/             # Past usage, outputs, downloads
 │   ├── account/             # Profile, subscription, API key management
 │   └── layout.tsx           # Customer nav layout (auto-creates user, tracks referrals)
 │
 ├── /(public)/               # Public pages (no auth)
 │   ├── page.tsx             # Landing page / marketing
 │   ├── pricing/             # Pricing page (client component, Stripe checkout)
 │   └── auth/                # Login + Register pages
 │       ├── login/
 │       └── register/
 │
 ├── /api/                    # API routes
 │   ├── agent/               # AutoGPT agent proxy (run + status polling)
 │   ├── auth/logout/         # Session logout
 │   ├── billing/portal/      # Stripe billing portal
 │   ├── checkout/            # Stripe checkout session creation
 │   ├── cron/health/         # Health check endpoint
 │   ├── keys/                # API key generation/revocation (Pro+)
 │   └── webhooks/            # Stripe + AutoGPT webhooks
 │
 └── globals.css              # Shared styles (Tailwind)
```

---

## Core Modules (Implemented)

### 1. Authentication (Supabase SSR)
- Two roles: `owner` (by OWNER_EMAIL env var) and `customer` (all other authenticated users)
- Cookie-based JWT sessions via Supabase SSR
- Middleware route protection on all protected path prefixes
- Referral code capture via `?ref=` query params in middleware

### 2. Payments (Stripe)
- Subscription model (monthly)
- `POST /api/checkout` — Stripe Checkout for new subscriptions
- `POST /api/billing/portal` — Stripe Customer Portal for management
- `POST /api/webhooks/stripe` — webhook handler for:
  - `checkout.session.completed` — upgrade plan + set credits
  - `invoice.paid` — refresh credits on renewal
  - `customer.subscription.deleted` — downgrade to free

### 3. AutoGPT Agent Connection Layer
- API wrapper in `lib/autogpt.ts`
- Trigger agent runs from customer actions
- Poll for execution status
- Fetch and display outputs
- `hooks/useAgentRun.ts` — React hook for submit/poll/display flow
- `POST /api/webhooks/autogpt` — webhook for async execution results

### 4. Database (Supabase PostgreSQL via Prisma)
- `User` model — auth, plan, credits, Stripe customer ID, API key, referral
- `AgentRun` model — execution tracking (status, output, error)

### 5. Owner Dashboard Components
- Revenue/runs chart (`components/RunsChart.tsx` using Recharts)
- Customer list with run counts (`/customers`)
- Settings panel with env var status (`/settings`)
- Status badges (`components/StatusBadge.tsx`)

### 6. Customer UI Components
- `AgentInterface` — input form, loading state, output display, credit tracking
- `ManageSubscriptionButton` — opens Stripe billing portal
- `LogoutButton` — session logout
- Dynamic `[product]` page — loads agent config from `availableAgents`

### 7. Email (Resend)
- Welcome email on first registration
- Run completed/failed notifications
- Gracefully skips if RESEND_API_KEY is not set

### 8. Affiliate System
- Referral code generation (`ref_` + hex)
- Cookie-based tracking (30 days)
- `referred_by` field on User model
- Configurable commission percentage (default 20%)

### 9. API Key Authentication
- `vmf_` prefixed keys for Pro+ users
- `POST /api/keys` to generate, `DELETE /api/keys` to revoke
- `lib/api-auth.ts` for Bearer token validation

---

## Configuration File

Each vending machine is configured via `config/product.ts`:

```typescript
export const productConfig = {
  name: "Vending Machine Factory",
  slug: "vending-machine-factory",
  tagline: "Build your AI-powered micro-SaaS products effortlessly.",
  description: "...",
  theme: { primary: "#6366f1", secondary: "#8b5cf6" },

  agent: {
    libraryId: "6387fd67-6aea-4090-9cca-fed50f747cdc",
    graphId: "cd0870a3-0a0f-425e-91cf-041b84548ef7",
    inputSchema: {
      prompt: { type: "textarea", label: "Describe your business idea", placeholder: "..." },
    },
    outputDisplay: "markdown",
  },

  pricing: {
    currency: "EUR",
    plans: [
      { id: "free", name: "Free", price: 0, credits: 5, features: ["Basic access"] },
      { id: "pro", name: "Pro", price: 19, credits: 100, features: ["Priority", "API access"] },
      { id: "business", name: "Business", price: 49, credits: 500, features: ["Everything", "White-label"] },
    ],
  },

  affiliate: { enabled: true, commissionPercent: 20, cookieDays: 30 },
};

export const availableAgents = { ... }; // 16 agents with libraryId + graphId
```

---

## Tech Stack (Actual)

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Auth | Supabase SSR (cookie-based JWT) |
| Database | Supabase (PostgreSQL) |
| ORM | Prisma 5 |
| Payments | Stripe |
| Charts | Recharts |
| AI Backend | AutoGPT External API |
| Hosting | Vercel |
| Email | Resend |
| Testing | Vitest |

---

## Forking Process (For Each New Vending Machine)

1. Fork the template repo on GitHub
2. Update `config/product.ts` with product details and agent IDs
3. Customize the customer product page (`/app/(customer)/[product]/`)
4. Set up Stripe products/prices
5. Set environment variables (AutoGPT API key, Stripe keys, Supabase URL)
6. Deploy to Vercel
7. Connect custom domain

Estimated time: 1.5–2.5 hours per new product (after template is built)
