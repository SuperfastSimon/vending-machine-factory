# AI-Ready Generation Prompts

Copy-paste these into your AI coding tool of choice.
Each prompt is optimized for the specific tool.

---

## PROMPT 1: FULL TEMPLATE (for Bolt.new or Lovable)

Build a Next.js 15 (App Router) SaaS template with TypeScript, Tailwind CSS, and shadcn/ui.

This is a reusable template for AI-powered micro-SaaS products. Each product connects to an external AI API that processes customer inputs and returns outputs.

### DUAL FRONTEND ARCHITECTURE

**Panel 1: Owner Dashboard (/owner/*)** - Dark sidebar layout with: Dashboard (Revenue chart, active customers, total runs, MRR), Agent Monitor (executions table, manual trigger, logs), Customers (list with plans, usage, revenue), Settings (branding, pricing tiers, API keys).

**Panel 2: Customer UI (/app/*)** - Clean top-navbar layout: Product Page (input form -> submit -> loading -> output display -> download), History (past runs), Account (profile, plan, usage meter, upgrade).

**Public Pages** - Landing (hero, features, how it works, testimonials, CTA), Pricing (3 tiers with Stripe Checkout), Login/Signup (email + Google OAuth).

### TECH: Next.js 15 App Router, NextAuth v5, Stripe, Prisma + Supabase, shadcn/ui, Tailwind, Recharts

---

## PROMPT 2: OWNER DASHBOARD ONLY (for v0)

Build owner admin dashboard with Next.js, shadcn/ui, Recharts. Pages: Overview (4 KPIs, revenue chart, recent executions), Agent Monitor (status, manual run, execution history), Customers (searchable table). Dark sidebar, blue/teal accents, mock data.

---

## PROMPT 3: CUSTOMER PRODUCT UI (for v0/Lovable)

Customer AI product interface. Flow: form -> Generate -> animated processing -> formatted markdown output with copy + download. Includes history sidebar, usage bar, upgrade prompt at 80%+. ChatGPT-level polish.

---

## PROMPT 4: LANDING PAGE (for v0)

Hero, social proof, how it works (3 steps), features grid (6), pricing (3 tiers), testimonials (3), FAQ (6 accordion), final CTA. Sticky navbar, modern gradient hero, config-driven.

---

## PROMPT 5: AUTOGPT API LAYER (for Cursor)

Connect Next.js to AutoGPT External API (https://backend.agpt.co/external-api). Create: autogpt.ts client, /api/agent/run route, /api/agent/status route, useAgentRun hook, Stripe webhook handler.

---

## PROMPT 6: FIRST VENDING MACHINE - BUSINESS PLAN GENERATOR

Product: BusinessAI | Tagline: "AI-powered business plans in minutes" | Color: #2D63EA
Input: Business idea, Industry, Target market, Funding stage, Geographic focus
Output: Full business plan in markdown
Pricing: Starter $9.99/mo (5 runs), Pro $29.99/mo (25), Unlimited $99.99/mo

---

## PROMPT 7: AFFILIATE SYSTEM (for Cursor)

Referral links, cookie tracking (30 days), 20% commission on first month, owner + customer dashboards, cross-promotion section.

---

## USAGE: Option A (Bolt.new) Prompt 1 -> GitHub -> Cursor + Prompt 5 -> Vercel. Option B (v0+Cursor) Prompts 2-4 individually -> Combine -> Prompt 5 -> Prompt 7 -> Deploy.

**Per vending machine: ~1.5-2.5 hours setup. Config changes only in config/vending-machine.ts.**