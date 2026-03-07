# Vercel Deployment Rules

## Pre-Deploy Checklist
- Verifieer correcte branch met `git branch --show-current`
- Check env vars voor juiste scope (Development/Preview/Production)
- Verifieer build command en output directory matchen het framework
- Check Node.js versie in `package.json` engines of `.nvmrc`
- Verifieer lockfile consistentie — geen gemixte package managers

## Framework Build Commands
- Next.js: `next build` → output `.next/`
- SvelteKit: `vite build` → output `build/`
- Astro: `astro build` → output `dist/`
- Nuxt: `nuxt build` met `NITRO_PRESET=vercel`
- Remix: `remix build` met Vercel adapter

## Serverless vs Edge
- Edge Runtime: globaal, geen `fs`, geen Node-only modules, geen native binaries
- Serverless: specifieke regio's, volledige Node.js API
- ISR: check `revalidate` waarden en on-demand revalidation paden
- Server Actions: verifieer CSRF bescherming

## DNS & Domains
- A record: alleen voor apex/root domains
- CNAME: voor subdomeinen
- Vercel DNS vs externe DNS: ken het verschil
- SSL provisioning issues: wacht op DNS propagation (tot 48u)

## Rollback Awareness
- Vercel Instant Rollback draait GEEN database migraties terug
- Edge config changes zijn permanent
- Preview deployment eerst, dan pas production promote
