# Vending Machine Factory — Deploy Reference Guide
**Datum:** 3 maart 2026  
**Voor:** Martin Hatch — Genesis Protocol

---

## 1. AutoGPT Credentials voor Deploy

### API Endpoint
```
Base URL: https://backend.agpt.co/external-api/
Docs:     https://backend.agpt.co/external-api/docs
```

### Authenticatie
```
Header: X-API-Key
Env var: AUTOGPT_API_KEY
Scopes: EXECUTE_GRAPH, READ_GRAPH
```

> **agpt API Key**  agpt_eKWACzE0g7-EC2zwEFmKEz9UA9MJgC9sItr8K0PwZQM

---

## 2. Agent IDs (Graph IDs + Library IDs)

### Verbonden Agents

| Agent | Library ID | Graph ID |
|-------|------------|----------|
| **Business Concept Studio** | `6387fd67-6aea-4090-9cca-fed50f747cdc` | `cd0870a3-0a0f-425e-91cf-041b84548ef7` |
| **Genesis Boss Agent** | `d5f31b2a-d683-4748-a0e3-acbb9ffde653` | `63421075-a04d-458d-a845-082a44a8d522` |
| **Code Writer Agent** | `a2627a06-0d4a-4d9b-bf61-ab428f05c04f` | `825855d2-1af3-4915-b26d-71bd65ac7c45` |
| **Code Architect Agent** | `ecbd1bbb-7992-452d-8901-aeaa7205fa55` | `9d4cedb8-d047-4921-ac79-cf636e761b99` |
| **Genesis Builder Agent** | `96c9f3ce-b970-4c50-bf2e-37d089d13422` | `af73c435-ab1d-4fed-beca-e8e5b9b5b95e` |
| **Genesis Deployment Agent** | `56b3ad38-fa86-4757-978d-0671d984e513` | `da52be89-4c37-4c38-82ce-bc5018771846` |
| **Genesis Protocol Maintainer** | `d4488f6d-b2ec-43c3-b16f-2aaeecc577d6` | `c1fdd73c-644f-4234-94fd-f96f0a74ef6f` |
| **Business Plan Generator** | `5c4d8efe-5be4-4921-8b14-b30be5d42e6a` | `241fe3f4-0689-4249-83aa-de1f75706f73` |
| **Image Classifier** | `52e2cbca-feab-44ed-8a5c-cc8063842597` | `f24f0acc-f2a9-46b4-b5d4-36af3bf851cd` |
| **Product Listing Generator** | `fa4dc0f3-8307-4bb9-bf98-3f675afe37be` | `be06eaa8-a874-4e35-8f16-610e084ab4f4` |
| **ProCodePro** | `ff17817d-0225-436b-9e81-364ff803d5ad` | `3b98e0e4-ba7e-4db2-b974-fc7f57ef4e71` |
| **ProCodePro V2** | `ff45e20c-f872-4cf8-a761-f8cc11a7cf53` | `7fff0519-beba-4a04-88f0-91a8fe768f40` |
| **ProCodePro mini 10** | `dff91533-4f76-434f-af65-743e3390f44f` | `8d9f07ed-be04-4c0f-b097-172371ff9cc9` |
| **Website Health Monitor** | `613bad37` | — |
| **WrapAppPro** | `aab46efc-6d19-4fcc-b025-3f269e3ebe3f` | `9c2c7c87-f466-41cd-b3ca-a7ecfe538ab0` |
| **Code Quality Scanner** | `73207433-983f-44f2-aa70-1d54bc7007b0` | `8063f37a-4887-4cfe-b60a-35298b470566` |
| **Certificate Generator** | `e5d3c12a-7996-48d2-9ec8-0c90ec828c0f` | `5cf92dfd-e631-442b-a4e2-91f36f9ef9fa` |

---

## 3. Vending Machine Config Template

Elk product wordt geconfigureerd via `config/product.ts`:

```typescript
export const VENDING_MACHINE_CONFIG = {
  // Branding
  name: "Product Name",
  slug: "product-slug",
  tagline: "One-liner description",
  description: "Full product description",
  theme: {
    primary: "#6366f1",
    secondary: "#8b5cf6",
  },

  // AutoGPT Agent — VEREIST VOOR DEPLOY
  agent: {
    libraryId: "LIBRARY_ID_HIER",     // ← Library ID uit tabel hierboven
    graphId: "GRAPH_ID_HIER",         // ← Graph ID uit tabel hierboven
    inputSchema: {
      prompt: { type: "textarea", label: "Describe your request" },
    },
    outputDisplay: "markdown",
  },

  // Pricing
  pricing: {
    currency: "EUR",
    plans: [
      { id: "free", name: "Free", price: 0, credits: 5, features: ["Basic access"] },
      { id: "pro", name: "Pro", price: 19, credits: 100, features: ["Priority", "API access"] },
      { id: "business", name: "Business", price: 49, credits: 500, features: ["Everything", "White-label"] },
    ],
  },

  // API
  apiEndpoint: "https://backend.agpt.co/external-api/",

  // Affiliate System
  affiliate: {
    enabled: true,
    commissionPercent: 20,
    cookieDays: 30,
  },
};
```

---

## 4. Environment Variables (.env)

```env
# AutoGPT
AUTOGPT_API_KEY=jouw_api_key_hier
AUTOGPT_API_URL=https://backend.agpt.co/external-api/
AUTOGPT_WEBHOOK_SECRET=              # Shared secret to verify AutoGPT webhook callbacks

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Database (Prisma)
POSTGRES_URL=                        # Pooled connection (for app runtime)
POSTGRES_URL_NON_POOLING=            # Direct connection (for migrations)

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Auth
OWNER_EMAIL=martin@example.com       # Email of the admin user with access to /owner routes

# Email (Optional)
RESEND_API_KEY=                      # Resend API key for transactional emails
EMAIL_FROM=                          # Sender address (default: product name via resend.dev)

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 5. API Wrapper (Samenvatting)

**Locatie:** `lib/autogpt.ts`

| Functie | Endpoint | Methode |
|---------|----------|---------|
| `triggerAgentRun(graphId, inputs)` | `/v1/graphs/{graphId}/execute` | POST |
| `getExecutionStatus(graphId, executionId)` | `/v1/graphs/{graphId}/executions/{executionId}` | GET |
| `listExecutions(graphId)` | `/v1/graphs/{graphId}/executions` | GET |
| `listLibraryAgents()` | `/v1/library/agents` | GET |
| `pollExecution(graphId, executionId)` | polling wrapper | — |

### Voorbeeld: Agent Triggeren
```typescript
const { executionId } = await triggerAgentRun(
  "cd0870a3-0a0f-425e-91cf-041b84548ef7",  // graphId
  { prompt: "Generate a business plan for..." }
);
```

---

## 6. Architectuur: Dual Frontend (Implemented)

```
/app
 ├── /(owner)/          → Owner Dashboard (KPIs, agents, customers, settings, billing)
 ├── /(customer)/       → Customer UI (dashboard, product, history, account)
 ├── /(public)/         → Landing page, pricing, auth (login + register)
 └── /api/              → Agent proxy, auth, billing, checkout, cron, keys, webhooks
```

---

## 7. GitHub Repo

**Repo:** [github.com/SuperfastSimon/vending-machine-factory](https://github.com/SuperfastSimon/vending-machine-factory)  
**Homepage:** https://vending-machine-factory.vercel.app  
**Branch:** main

---

## 8. Tech Stack

| Layer | Technologie |
|-------|-------------|
| Framework | Next.js 14 (App Router) |
| UI | Tailwind CSS |
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

## 9. Deploy Checklist (Per Nieuwe Vending Machine)

- [ ] Fork template repo op GitHub
- [ ] Update `config/product.ts` (naam, kleuren, agent IDs)
- [ ] Customise customer product page
- [ ] Stel Stripe producten/prijzen in
- [ ] Zet environment variables in Vercel
- [ ] Deploy naar Vercel
- [ ] Connect custom domain
- [ ] Test agent run via API

**Geschatte tijd per product:** 1.5 - 2.5 uur (na template is gebouwd)

---

## 10. Huidige Status

- ✅ Architectuur blueprint compleet
- ✅ Next.js 14 App Router (migrated from Vite/React)
- ✅ Dual frontend (owner + customer + public) — all pages built
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

*Samengesteld door Otto — AutoGPT Co-Pilot*
*Laatst bijgewerkt: maart 2026*
