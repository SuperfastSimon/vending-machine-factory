// ─────────────────────────────────────────────────────────────
// Centralised environment variable validation with graceful
// fallbacks.  Every service check is lazy — nothing crashes at
// import time.  Use `getEnvStatus()` to build a live dashboard.
// ─────────────────────────────────────────────────────────────

/** A single service's health report. */
export interface ServiceStatus {
  name: string;
  configured: boolean;
  /** Which env vars are missing (empty when configured === true). */
  missing: string[];
  /** Optional hint shown to the owner on the setup page. */
  hint?: string;
}

// ── individual checks ────────────────────────────────────────

export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function isAutoGPTConfigured(): boolean {
  return !!process.env.AUTOGPT_API_KEY;
}

export function isStripeConfigured(): boolean {
  return !!(
    process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET
  );
}

export function isStripePublicConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
}

export function isDatabaseConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}

export function isResendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

export function isOwnerConfigured(): boolean {
  return !!process.env.OWNER_EMAIL;
}

// ── aggregate status ─────────────────────────────────────────

export function getEnvStatus(): {
  ready: boolean;
  services: ServiceStatus[];
} {
  const services: ServiceStatus[] = [
    {
      name: "Supabase (Auth & DB proxy)",
      configured: isSupabaseConfigured(),
      missing: [
        !process.env.NEXT_PUBLIC_SUPABASE_URL && "NEXT_PUBLIC_SUPABASE_URL",
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
          "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      ].filter(Boolean) as string[],
      hint: "Get these from your Supabase project → Settings → API.",
    },
    {
      name: "Database (Prisma)",
      configured: isDatabaseConfigured(),
      missing: [
        !process.env.DATABASE_URL && "DATABASE_URL",
      ].filter(Boolean) as string[],
      hint: "Prisma connection string. Usually the Supabase pooler URL.",
    },
    {
      name: "AutoGPT Agent API",
      configured: isAutoGPTConfigured(),
      missing: [
        !process.env.AUTOGPT_API_KEY && "AUTOGPT_API_KEY",
      ].filter(Boolean) as string[],
      hint: "Create an API key at https://platform.agpt.co → Settings → API Keys.",
    },
    {
      name: "Stripe Payments",
      configured: isStripeConfigured(),
      missing: [
        !process.env.STRIPE_SECRET_KEY && "STRIPE_SECRET_KEY",
        !process.env.STRIPE_WEBHOOK_SECRET && "STRIPE_WEBHOOK_SECRET",
      ].filter(Boolean) as string[],
      hint: "Stripe Dashboard → Developers → API keys + Webhooks.",
    },
    {
      name: "Stripe (public key)",
      configured: isStripePublicConfigured(),
      missing: [
        !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
          "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
      ].filter(Boolean) as string[],
      hint: "The publishable key from the same Stripe dashboard page.",
    },
    {
      name: "Resend Email",
      configured: isResendConfigured(),
      missing: [
        !process.env.RESEND_API_KEY && "RESEND_API_KEY",
      ].filter(Boolean) as string[],
      hint: "Optional — transactional emails via resend.com.",
    },
    {
      name: "Owner Email",
      configured: isOwnerConfigured(),
      missing: [
        !process.env.OWNER_EMAIL && "OWNER_EMAIL",
      ].filter(Boolean) as string[],
      hint: "The email address that matches the owner/admin account.",
    },
  ];

  // "ready" = the critical services are all green
  const critical = ["Supabase (Auth & DB proxy)", "Database (Prisma)"];
  const ready = services
    .filter((s) => critical.includes(s.name))
    .every((s) => s.configured);

  return { ready, services };
}

/** Quick boolean: can the app serve real traffic? */
export function isAppReady(): boolean {
  return getEnvStatus().ready;
}
