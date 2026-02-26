# Online Vending Machine - Template Architecture Blueprint

## Overview
This is the reusable template for every Online Vending Machine product.
Fork it, configure the product-specific agent, customize the UI, deploy.

## Dual Frontend Routing
/app/(owner)/ - Owner Dashboard (KPIs, revenue, agents, customers, settings, billing)
/app/(customer)/ - Customer UI (dashboard, product, history, account)
/app/(public)/ - Landing page, pricing, auth
/api/ - Agent proxy, webhooks, cron

## Core Modules
1. Auth (NextAuth.js/Clerk) - owner + customer roles
2. Payments (Stripe) - subscriptions, checkout, webhooks
3. AutoGPT Agent Layer - standardized API wrapper
4. Database (Supabase/PlanetScale) - users, executions, usage, settings
5. Owner Dashboard - revenue charts, agent status, executions, error logs
6. Customer UI (customized per product) - input form, processing, output, history

## Config: Single file per vending machine (config/vending-machine.ts)
- Branding (name, logo, colors)
- Agent config (libraryId, graphId, inputSchema, outputDisplay)
- Pricing plans + Stripe price IDs
- Feature toggles (affiliate, API access, exports)

## Tech Stack: Next.js 15, Tailwind+shadcn/ui, NextAuth v5, Supabase, Prisma/Drizzle, Stripe, Recharts, Vercel, Resend

## Fork Process: Fork -> config -> customize customer UI -> Stripe setup -> env vars -> deploy to Vercel -> custom domain
Estimated: 2-4 hours per new product