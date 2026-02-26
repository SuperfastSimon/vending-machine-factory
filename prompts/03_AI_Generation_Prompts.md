# AI-Ready Generation Prompts

Copy-paste these into your AI coding tool of choice.
Each prompt is optimized for the specific tool.

## PROMPT 1: FULL TEMPLATE (for Bolt.new or Lovable)
Build a Next.js 15 (App Router) SaaS template with TypeScript, Tailwind CSS, and shadcn/ui.
Dual frontend: Owner Dashboard (/owner/*) + Customer UI (/app/*) + Public pages.
Includes auth (NextAuth v5), Stripe, Prisma+Supabase, Recharts dashboard, configurable via single config file.

## PROMPT 2: OWNER DASHBOARD ONLY (for v0)
Build owner/admin dashboard with KPI cards, revenue chart, agent monitor, customer table.
Dark sidebar layout. shadcn/ui + Recharts.

## PROMPT 3: CUSTOMER PRODUCT UI (for v0 or Lovable)
Customer-facing AI product interface: form -> submit -> animated processing -> markdown output.
History sidebar, usage bar, upgrade prompts. ChatGPT-level polish.

## PROMPT 4: LANDING PAGE (for v0)
Conversion-optimized landing page: hero, social proof, how it works, features grid, pricing, testimonials, FAQ, CTA.
Config-driven for reuse across products.

## PROMPT 5: AUTOGPT API LAYER (for Cursor)
Connect Next.js to AutoGPT External API. Create: /src/lib/autogpt.ts, /app/api/agent/run/route.ts, /app/api/agent/status/[executionId]/route.ts, /src/hooks/useAgentRun.ts, /app/api/webhooks/stripe/route.ts

## PROMPT 6: FIRST PRODUCT - BUSINESS PLAN GENERATOR (for Bolt.new)
Customize template for BusinessAI product. Input: business idea, industry, target market, funding stage, geo focus.
Output: full business plan in markdown. Pricing: $9.99/$29.99/$99.99.

## PROMPT 7: AFFILIATE SYSTEM (for Cursor)
Add referral system: unique links, 30-day cookie tracking, 20% first-month commission.
Cross-promotion section linking to other vending machine products.

## USAGE: Option A (Bolt.new) -> Option B (v0+Cursor) -> Option C (Lovable)
Time per new vending machine after template: 1.5-2.5 hours.

See full prompts in workspace version.