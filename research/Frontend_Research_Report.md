# Frontend Research Report: The Online Vending Machine Factory

**Prepared for:** Martin Hatch - Genesis Protocol
**Purpose:** Identify the most reliable, least time-consuming frontend system for stamping out multiple dual-frontend micro-SaaS products at scale.

## Executive Summary
Recommendation: **Two-layer strategy**
- Primary: Next.js + v0 (Vercel) + Cursor/Bolt.new for generation
- Alternative: Lovable for rapid MVPs, then graduate to Next.js template

## Winner: Next.js + SaaS Starter Kit + AI Coding Tools (Score: 96/100)

### The Strategy:
1. Buy supastarter ($299 one-time) - auth, Stripe, admin dashboard, multi-tenancy pre-built
2. Customize with AI tools (v0 for UI, Cursor for code, Bolt.new for prototyping)
3. Add standardized AutoGPT API wrapper
4. Fork for each new vending machine
5. Deploy on Vercel (free tier -> auto-scale)

### Cost Per Vending Machine:
- First product: ~$380 + $50/mo
- Each additional: ~$20/mo

### Comparison Matrix (top scores):
- Next.js + SaaS kit: 96/100
- Lovable -> Next.js: 84/100
- Anything/Mocha: 83/100
- v0 (Vercel): 82/100
- Nuxt: 78/100
- SvelteKit: 73/100
- WeWeb + Xano: 71/100
- Bolt.new: 70/100
- FlutterFlow: 63/100
- Bubble: 54/100 (rejected: no code export, platform lock-in)

See full detailed report in workspace version.