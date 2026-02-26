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
 │   ├── page.tsx             # Landing page / marketing
 │   ├── pricing/             # Pricing page
 │   └── auth/                # Login / signup
 │
 ├── /api/                     # API routes
 │   ├── agent/               # AutoGPT agent proxy endpoints
 │   ├── webhooks/            # Stripe and agent webhooks
 │   └── cron/                # Scheduled tasks / health checks
 │
 └── globals.css              # Shared styles (Tailwind)
```