"use client";

import { productConfig } from "@/config/product";
import { useState } from "react";

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(planId: string) {
    setLoading(planId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Something went wrong.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  async function handleBuyCredits(packId: string) {
    setLoading(packId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Something went wrong.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-gray-900">Pricing Plans</h1>
        <p className="mt-2 text-gray-500">
          Choose the plan that fits your needs
        </p>
      </div>

      <div className="mt-10 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {productConfig.pricing.plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-xl border p-6 flex flex-col ${
              plan.id === "pro"
                ? "border-indigo-300 ring-2 ring-indigo-500"
                : "border-gray-200"
            }`}
          >
            {plan.id === "pro" && (
              <span className="self-start text-xs font-semibold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full mb-3">
                Most popular
              </span>
            )}
            <h2 className="text-xl font-semibold text-gray-900">{plan.name}</h2>
            <p className="mt-2">
              <span className="text-3xl font-bold text-gray-900">
                {plan.price === 0 ? "Free" : `${plan.price}`}
              </span>
              {plan.price > 0 && (
                <span className="text-sm text-gray-500">
                  {" "}
                  {productConfig.pricing.currency}/mo
                </span>
              )}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {plan.credits} credits/month
            </p>
            <ul className="mt-4 space-y-2 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              {plan.price === 0 ? (
                <a
                  href="/auth/register"
                  className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2.5 rounded-lg text-sm transition-colors"
                >
                  Get started free
                </a>
              ) : (
                <button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={loading === plan.id}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
                >
                  {loading === plan.id ? "Redirecting..." : `Upgrade to ${plan.name}`}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Credit Packs */}
      {productConfig.pricing.creditPacks &&
        productConfig.pricing.creditPacks.length > 0 && (
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Or buy credits individually
              </h2>
              <p className="mt-2 text-gray-500">
                No subscription needed — pay per use
              </p>
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {productConfig.pricing.creditPacks.map((pack) => (
                <div
                  key={pack.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center text-center"
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    {pack.name}
                  </h3>
                  <p className="mt-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {pack.price}
                    </span>
                    <span className="text-sm text-gray-500">
                      {" "}
                      {productConfig.pricing.currency}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {(pack.price / pack.credits).toFixed(2)}{" "}
                    {productConfig.pricing.currency}/credit
                  </p>
                  <button
                    onClick={() => handleBuyCredits(pack.id)}
                    disabled={loading === pack.id}
                    className="mt-4 w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
                  >
                    {loading === pack.id ? "Redirecting..." : "Buy credits"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
