"use client";

import { useEffect, useState } from "react";

interface ServiceStatus {
  name: string;
  configured: boolean;
  missing: string[];
  hint?: string;
}

interface SetupData {
  ready: boolean;
  services: ServiceStatus[];
  live: Record<string, boolean | string>;
}

export default function SetupPage() {
  const [data, setData] = useState<SetupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    setLoading(true);
    setError(null);
    fetch("/api/setup/check")
      .then((r) => r.json())
      .then((d: SetupData) => setData(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">⚙️ Setup Status</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure your environment variables in Vercel (or .env.local) to
            get every service green.
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Checking…" : "Re-check"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {data && (
        <>
          {/* Overall readiness */}
          <div
            className={`mb-6 rounded-lg p-4 ${
              data.ready
                ? "border border-green-300 bg-green-50 text-green-800"
                : "border border-yellow-300 bg-yellow-50 text-yellow-800"
            }`}
          >
            {data.ready
              ? "✅ App is ready — all critical services are configured."
              : "⚠️ App is NOT ready — some critical services need configuration."}
          </div>

          {/* Service cards */}
          <div className="space-y-3">
            {data.services.map((svc) => (
              <div
                key={svc.name}
                className={`rounded-lg border p-4 ${
                  svc.configured
                    ? "border-green-200 bg-green-50/50"
                    : "border-red-200 bg-red-50/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {svc.configured ? "✅" : "❌"} {svc.name}
                  </span>
                  {svc.configured && (
                    <span className="text-xs text-green-600">Configured</span>
                  )}
                </div>

                {!svc.configured && (
                  <div className="mt-2">
                    <p className="text-sm text-red-700">
                      Missing:{" "}
                      {svc.missing.map((v) => (
                        <code
                          key={v}
                          className="mx-0.5 rounded bg-red-100 px-1 py-0.5 text-xs"
                        >
                          {v}
                        </code>
                      ))}
                    </p>
                    {svc.hint && (
                      <p className="mt-1 text-xs text-gray-500">{svc.hint}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Live connectivity */}
          <h2 className="mb-3 mt-8 text-lg font-semibold">Live Connectivity</h2>
          <div className="space-y-2">
            {Object.entries(data.live).map(([name, status]) => (
              <div
                key={name}
                className="flex items-center justify-between rounded border p-3"
              >
                <span className="capitalize">{name}</span>
                <span
                  className={`text-sm font-medium ${
                    status === true
                      ? "text-green-600"
                      : status === false
                      ? "text-gray-400"
                      : "text-red-600"
                  }`}
                >
                  {status === true
                    ? "🟢 Reachable"
                    : status === false
                    ? "⚪ Not configured"
                    : `🔴 ${status}`}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
