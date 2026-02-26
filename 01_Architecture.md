# Online Vending Machine - Template Architecture Blueprint

## Overview

This is the reusable template for every Online Vending Machine product. 
Fork it, configure the product-specific agent, customize the UI, deploy.

---

## Dual Frontend Routing

```
/app
 ├── /(owner)/                # Owner Dashboard (protected, role: owner)
 │   ├── dashboard/           # Main overview - KPIs, revenue, status
 │   ├── agents/              # Agent management - trigger, monitor, logs
 │   ├── customers/           # Customer list, usage, revenue per user
 │   ├── settings/            # Product config, pricing, branding
 │   ├── billing/             # Revenue, payouts, Stripe dashboard
 │   └── layout.tsx           # Owner sidebar layout
 │ 
 ├── /(customer)/            # Customer UI (protected, role: customer)
 │   ├── dashboard/           # Customer's personal dashboard
 │   ├── [product]/           # The actual product interface (custom per vending machine)
 │   ├── history/             # Past usage, outputs, downloads
 │   ├── account/             # Profile, subscription, billing
 │   └── layout.tsx           # Customer nav layout
 │
 ├── /(public)/               # Public pages (no auth)
 │   ├── page.tsx              # Landing page / marketing
 │   ├── pricing/              # Pricing page
 │   └── auth/                 # Login / signup
 │
 ├── /api/                     # API routes
 │   ├── agent/                # AutoGPT agent proxy endpoints
 │   ├── webhooks/            # Stripe and agent webhooks
 │   └── cron/                # Scheduled tasks / health checks
 │
 └── globals.css              # Shared styles (Tailwind)
```

---

## Core Modules

### 1. Authentication (NextAuth.js or Clerk)
- Two roles: `owner` and `customer`
- Owner: email/password (or magic link)
- Customer: email/password, Google OAuth, magic link
- Middleware route protection based on role

### 2. Payments (Stripe)
- Subscription model (monthly/per-use)
- Stripe Checkout for new subscriptions
- Stripe Customer Portal for management
- Webhook handler for payment events
- Usage-based billing option (metered)

### 3. AutoGPT Agent Connection Layer
- Standardized API wrapper (see separate file)
- Trigger agent runs from customer actions
- Poll for execution status
- Fetch and display outputs
- Owner dashboard: full agent management

### 4. Database (Supabase or PlanetScale)
- Users table (role, subscription status)
- Executions table (agent runs, inputs, outputs, status)
- Usage table (by user, for billing)
- Product settings table (configurable per vending machine)

### 5. Owner Dashboard Components
- Revenue chart (daily/weekly/monthly)
- Active customers count
- Agent status (running/completed/failed)
- Recent executions list
- Error log
- Manual agent trigger button
- Settings panel

### 6. Customer UI Components (CUSTOMIZE PER PRODUCT)
- Product interface (this changes per vending machine)
- Input form -> submit to agent
- Loading/processing state
- Output display
- History of past runs
- Account / billing management

---

## Configuration File

Each vending machine gets a single config file that customizes everything:

```typescript
// config/vending-machine.ts

export const VENDING_MACHINE_CONFIG = {
  // Branding
  name: "Business Plan Machine",
  description: "AI-powered business plan generation",
  logo: "/logo.svg",
  primaryColor: "#3B82F6",
  
  // AutoGPT Agent
  agent: {
    libraryId: "6387fd67-6aea-4090-9cca-fed50f747cdc",
    graphId: "cd0870a3-0a0f-425e-91cf-041b84548ef7",
    inputSchema: {
      prompt: { type: "textarea", label: "Describe your business idea" },
      industry: { type: "select", options: ["tech", "retail", "health"] },
    },
    outputDisplay: "markdown", // or "json", "html", "file"
  },
  
  // Pricing
  pricing: {
    model: "subscription", // or "per-use"
    plans: [
      { name: "Starter", price: 9.99, runsPerMonth: 5 },
      { name: "Pro", price: 29.99, runsPerMonth: 50 },
      { name: "Unlimited", price: 99.99, runsPerMonth: -1 },
    ],
    stripePriceIds: {
      starter: "price_xxx",
      pro: "price_xxx",
      unlimited: "price_xxx",
    },
  },
  
  // Feature toggles
  features: {
    affiliateSystem: true,
    apiAccess: false,
    whiteLabel: false,
    exportOutputs: true,
  },
};
```

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | Industry standard, best AI tool support |
| Styling | Tailwind CSS + shadcn/ui | Rapid UI dev with professional components |
| Auth | NextAuth.js v5 (or Clerk) | Flexible, role-based |
| Database | Supabase (Postgres) | Free tier, real-time, auth built-in |
| ORM | Prisma or Drizzle | Type-safe database queries |
| Payments | Stripe | Industry standard |
| Charts | Recharts or Tremor | Dashboard visualizations |
| AI Backend | AutoGPT External API | Your agents are the engine |
| Hosting | Vercel | One-click deploy, auto-scale |
| Email | Resend | Transactional emails |

---

## Forking Process (For Each New Vending Machine)

1. Fork the template repo on GitHub
2. Update `config/vending-machine.ts` with product details
3. Customize the customer product page (`/app/(customer)/[product]/`)
4. Set up Stripe products/prices
5. Set environment variables (AutoGPT API key, Stripe keys, Supabase URL)
6. Deploy to Vercel
7. Connect custom domain

Estimated time: 2-4 hours per new product (after template is built)