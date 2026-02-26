# Frontend Research Report: The Online Vending Machine Factory

**Prepared for:** Martin Hatch - Genesis Protocol
**Purpose:** Identify the best frontend system for stamping out dual-frontend micro-SaaS products at scale.

---

## Executive Summary

You need a frontend system that lets you **template once, deploy many**. Each vending machine gets dual frontend (owner dashboard + customer UI), Stripe payments, auth, and AutoGPT API connections.

> **Winner: Next.js + SaaS Starter Kit + AI Coding Tools (v0, Cursor, Bolt.new)**

## Comparison Matrix

| Solution | Speed | Reuse | Payments | Auth | API | Dual FE | Dashboard | AI-Friendly | Code Own | Maint | TOTAL |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Next.js + SaaS kit** | 9 | 10 | 10 | 10 | 10 | 10 | 10 | 10 | 10 | 7 | **96** |
| **Lovable -> Next.js** | 10 | 8 | 7 | 7 | 9 | 8 | 8 | 10 | 10 | 7 | **84** |
| **Anything/Mocha** | 10 | 7 | 10 | 10 | 7 | 7 | 7 | 8 | 8 | 9 | **83** |
| **v0 (Vercel)** | 9 | 7 | 6 | 7 | 9 | 8 | 9 | 10 | 9 | 8 | **82** |
| **Bubble** | 5 | 6 | 8 | 8 | 8 | 7 | 6 | 3 | 1 | 6 | **54** |

## Strategy

1. Buy supastarter ($299 one-time) - auth, Stripe, admin pre-built
2. Customize with AI tools
3. Add AutoGPT API layer (standardized wrapper)
4. Fork for each vending machine
5. Deploy on Vercel

## Cost Per Vending Machine

- First product: ~$380 + $50/mo
- Each additional: ~$20/mo

**Bottom line:** Next.js foundation + SaaS starter template + AI coding tools = fastest path to multiple vending machines with full code ownership.