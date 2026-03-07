# 🏭 Vending Machine Factory - Repo Analysis
**Repo:** [github.com/SuperfastSimon/vending-machine-factory](https://github.com/SuperfastSimon/vending-machine-factory)
**Taal:** TypeScript
**Homepage:** https://vending-machine-factory.vercel.app
**Branch:** main
**Aangemaakt:** 2026-02-26

---

## 📁 Repo Structuur

| Bestand/Map | Type | Beschrijving |
|-------------|------|--------------|
| `01_Architecture.md` | Docs | Template architectuur blueprint (dual frontend) |
| `01_Vending_Machine_Architecture.md` | Docs | Vending machine specifieke architectuur |
| `02_AutoGPT_API_Wrapper.ts` | Code | AutoGPT External API connection layer |
| `03_AI_Generation_Prompts.md` | Docs | AI generatie prompts |
| `04_Frontend_Research_Report.md` | Docs | Frontend onderzoek |
| `API_Wrapper.ts` | Code | API wrapper (klein) |
| `App.tsx` | Code | Hoofd React component (Business Plan Generator) |
| `Bolt grok.md` / `.txt` | Docs | Bolt.diy + Grok integratie notities |
| `Frontend_Research_Report_Vending_Machine_Factory.md` | Docs | Uitgebreid frontend onderzoek |
| `Readme` | Docs | README (leeg) |
| `/api` | Map | API routes |
| `/architecture` | Map | Architectuur bestanden |
| `/bolt.diy` | Ref | Bolt.diy submodule/referentie |
| `/prompts` | Map | AI prompts |
| `/research` | Map | Onderzoeksbestanden |
| `/src` | Map | Broncode |

---

## 🛠️ Tech Stack

| Layer | Technologie |
|-------|-------------|
| **Framework** | React + Vite (TypeScript) |
| **Styling** | Tailwind CSS |
| **Icons** | Lucide React |
| **Build** | Vite 5.4 |
| **Linting** | ESLint 9 |
| **Hosting** | Vercel |

---

## 🏗️ Architectuur: Dual Frontend

```
/app
 ├── /(owner)/          → Owner Dashboard (KPIs, agents, customers, settings)
 ├── /(customer)/       → Customer UI (product interface, history, account)
 ├── /(public)/         → Landing page, pricing, auth
 └── /api/              → Agent proxy, webhooks, cron
```

### Rollen
- **Owner:** Dashboard met KPIs, agent management, klanten, billing
- **Customer:** Product interface, gebruik history, account/subscriptions
- **Public:** Landing page, pricing, login/signup

---

## 🔌 AutoGPT API Wrapper

**Locatie:** `02_AutoGPT_API_Wrapper.ts`
**Base URL:** `https://backend.agpt.co/external-api`
**Auth:** API Key via `X-API-Key` header

### Functies:
| Functie | Beschrijving |
|---------|--------------|
| `triggerAgentRun(graphId, inputs)` | Start een agent run |
| `getExecutionStatus(graphId, executionId)` | Check status van een run |
| `listExecutions(graphId)` | Lijst van alle executions |
| `listLibraryAgents()` | Lijst van alle agents in library |
| `pollExecution(graphId, executionId)` | Poll tot completion |

---

## 💰 Business Model (per Vending Machine)

| Plan | Prijs | Runs/maand |
|------|-------|------------|
| Starter | $9.99 | 5 |
| Pro | $29.99 | 50 |
| Unlimited | $99.99 | ∞ |

---

## 🔧 Vending Machine Config

Elk product wordt geconfigureerd via `config/vending-machine.ts`:
- Branding (naam, logo, kleur)
- AutoGPT Agent (libraryId, graphId, inputSchema)
- Pricing (model, plans, Stripe price IDs)
- Feature toggles (affiliate, API access, white label, export)

---

## 📊 Geplande Stack (Architectuur Doc)

| Layer | Technologie |
|-------|-------------|
| Framework | Next.js 15 (App Router) |
| UI | Tailwind + shadcn/ui |
| Auth | NextAuth.js v5 / Clerk |
| Database | Supabase (Postgres) |
| ORM | Prisma / Drizzle |
| Payments | Stripe |
| Charts | Recharts / Tremor |
| AI Backend | AutoGPT External API |
| Hosting | Vercel |
| Email | Resend |

---

## 🚀 Huidige Status

- ✅ Architectuur blueprint compleet
- ✅ AutoGPT API wrapper geschreven
- ✅ AI prompts gedefinieerd
- ✅ Frontend research gedaan
- ✅ Basis React app (Business Plan Form)
- ⚠️ Nog op Vite/React (niet Next.js zoals gepland)
- ⚠️ Geen auth, database, of Stripe integratie
- ⚠️ Geen /src structuur volgens blueprint
- ⚠️ README is leeg

---

## 🔗 Verbonden AutoGPT Agents

| Agent | Library ID | Graph ID |
|-------|------------|----------|
| Business Concept Studio | `6387fd67` | `cd0870a3` |
| (Meer agents te koppelen) | | |

---

*Gegenereerd door Otto - AutoGPT Co-Pilot*
*Datum: 2026-02-26*
