import Link from "next/link";
import { productConfig } from "@/config/product";

export default function Home() {
  const { name, tagline, description, pricing, theme } = productConfig;

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <Link href="/" className="text-xl font-bold" style={{ color: theme.primary }}>
          {name}
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">
            Pricing
          </Link>
          <Link
            href="/auth/login"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Log in
          </Link>
          <Link
            href="/auth/register"
            className="text-sm font-medium text-white px-4 py-2 rounded-lg"
            style={{ backgroundColor: theme.primary }}
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 flex-1">
        <h1 className="text-5xl font-extrabold tracking-tight max-w-3xl leading-tight">
          {tagline}
        </h1>
        <p className="mt-6 text-lg text-gray-500 max-w-xl">{description}</p>
        <div className="mt-10 flex gap-4">
          <Link
            href="/auth/register"
            className="text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:opacity-90 transition"
            style={{ backgroundColor: theme.primary }}
          >
            Start for free
          </Link>
          <Link
            href="/pricing"
            className="text-gray-700 font-semibold px-6 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
          >
            See pricing
          </Link>
        </div>
      </section>

      {/* Pricing overview */}
      <section className="px-6 py-20 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-12">Simple, transparent pricing</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricing.plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col"
            >
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-bold">
                  {plan.price === 0 ? "Free" : `€${plan.price}`}
                </span>
                {plan.price > 0 && (
                  <span className="text-gray-400 mb-1">/mo</span>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500">{plan.credits} credits included</p>
              <ul className="mt-6 space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <span style={{ color: theme.primary }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className="mt-8 text-center font-medium text-sm py-2 rounded-lg border transition hover:opacity-90"
                style={
                  plan.id === "pro"
                    ? { backgroundColor: theme.primary, color: "#fff", borderColor: theme.primary }
                    : { borderColor: "#d1d5db", color: "#374151" }
                }
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-100 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} {name}. All rights reserved.
      </footer>
    </div>
  );
}
