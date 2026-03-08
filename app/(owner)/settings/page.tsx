import { productConfig } from "@/config/product";

const envVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "AUTOGPT_API_KEY",
  "AUTOGPT_API_URL",
  "AUTOGPT_WEBHOOK_SECRET",
  "OWNER_EMAIL",
] as const;

export default function SettingsPage() {
  const envStatus = envVars.map((key) => ({
    key,
    set: !!process.env[key],
  }));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Product info */}
      <Section title="Product">
        <Row label="Name" value={productConfig.name} />
        <Row label="Slug" value={productConfig.slug} />
        <Row label="Tagline" value={productConfig.tagline} />
        <Row label="Primary color" value={productConfig.theme.primary} />
      </Section>

      {/* Agent */}
      <Section title="AutoGPT Agent">
        <Row label="Library ID" value={productConfig.agent.libraryId} mono />
        <Row label="Graph ID" value={productConfig.agent.graphId} mono />
        <Row label="Output display" value={productConfig.agent.outputDisplay} />
      </Section>

      {/* Pricing */}
      <Section title="Pricing">
        {productConfig.pricing.plans.map((plan) => (
          <Row
            key={plan.id}
            label={plan.name}
            value={`${plan.price} ${productConfig.pricing.currency} · ${plan.credits} credits`}
          />
        ))}
      </Section>

      {/* Environment variables */}
      <Section title="Environment Variables">
        {envStatus.map(({ key, set }) => (
          <div
            key={key}
            className="flex items-center justify-between px-5 py-3"
          >
            <code className="text-sm text-gray-700">{key}</code>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded ${
                set
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {set ? "Set" : "Missing"}
            </span>
          </div>
        ))}
      </Section>

      <p className="text-xs text-gray-400">
        Product configuration is defined in <code>config/product.ts</code>.
        Environment variables are set in Vercel or your <code>.env</code> file.
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="divide-y divide-gray-100">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <span className="text-sm text-gray-500">{label}</span>
      <span
        className={`text-sm font-medium text-gray-900 ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
