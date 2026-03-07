# CLAUDE.md — Vending Machine Factory

This file provides AI assistants with context about the codebase structure, conventions, and workflows.

## Project Overview

**Vending Machine Factory** is a micro-SaaS starter template for building AI-powered SaaS products. It provides authentication, tiered pricing, a credit system, and Stripe payment integration out of the box.

- **Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma, Supabase, Stripe, Vercel
- **Database:** PostgreSQL (via Prisma ORM)
- **Auth:** Supabase SSR with cookie-based JWT sessions
- **Deployment:** Vercel (configured via `vercel.json`)
- **Version:** 0.1.0 (early stage)

---

## Repository Structure

```
vending-machine-factory/
├── .devcontainer/          # VS Code devcontainer (Node 20, auto-installs deps)
├── .github/workflows/      # CI pipeline (ci.yml)
├── app/                    # Next.js App Router pages and layouts
│   ├── (public)/          # Route group — publicly accessible pages
│   │   ├── page.tsx       # Landing/home page
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   └── pricing/page.tsx
│   ├── layout.tsx          # Root layout (includes Vercel Analytics)
│   └── globals.css         # Global Tailwind + CSS variable styles
├── config/
│   └── product.ts          # Central product metadata and pricing config
├── prisma/
│   └── schema.prisma       # Prisma schema (User model, PostgreSQL)
├── reviews/                # PR review comment artifacts
├── middleware.ts            # Auth middleware — protects /dashboard and /owner
├── next-env.d.ts           # Next.js TypeScript declarations
├── tsconfig.json           # TypeScript config (strict mode, @/* alias)
├── .eslintrc.json          # ESLint (next/core-web-vitals)
├── vercel.json             # Vercel deployment + security headers
└── package.json            # Dependencies and scripts
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
```

---

## Product Configuration

All product metadata and pricing lives in **`config/product.ts`**. Update this file to change:
- Product name and tagline
- Brand colors (`primary: "#6366f1"`, `secondary: "#8b5cf6"`)
- Pricing tiers and credit allocations

### Current Pricing Tiers

| Plan | Price | Credits | Notes |
|------|-------|---------|-------|
| Free | €0 | 5 | Basic access |
| Pro | €19/mo | 100 | Priority + API access |
| Business | €49/mo | 500 | White-label support |

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
2. **Credits system** — Each user has a `credits_remaining` counter. Free users start with 5 credits; paid plans grant more.
3. **Route protection in middleware** — Auth is enforced at the edge in `middleware.ts`, not per-page. Add new protected path prefixes there.
4. **Centralized config** — Pricing, branding, and feature flags live in `config/product.ts` to avoid magic strings scattered across the codebase.

---

## What Does Not Exist Yet

- Automated tests (no Jest, Vitest, or Playwright configured)
- `/dashboard` implementation (route exists in middleware but no pages yet)
- `/owner` admin panel (protected but not built)
- Stripe webhook handler
- API routes (`app/api/`)

When adding these, follow the existing App Router conventions.
