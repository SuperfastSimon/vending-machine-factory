"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ServiceStatus {
  name: string;
  configured: boolean;
  missing: string[];
  hint?: string;
}

interface SetupStatus {
  ready: boolean;
  services: ServiceStatus[];
}

/**
 * Floating banner shown to the owner when critical services are not configured.
 * Automatically hidden once everything is green.
 */
export function SetupBanner() {
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/setup/check")
      .then((r) => r.json())
      .then((data: SetupStatus) => setStatus(data))
      .catch(() => {
        /* setup endpoint itself failed — show nothing */
      });
  }, []);

  if (!status || status.ready || dismissed) return null;

  const unconfigured = status.services.filter((s) => !s.configured);
  if (unconfigured.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border border-yellow-400/50 bg-yellow-50 p-4 shadow-lg dark:border-yellow-600/50 dark:bg-yellow-950">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
          ⚠️ Setup Incomplete
        </h3>
        <button
          onClick={() => setDismissed(true)}
          className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
      <p className="mb-2 text-xs text-yellow-700 dark:text-yellow-300">
        {unconfigured.length} service{unconfigured.length > 1 ? "s" : ""} not
        configured yet:
      </p>
      <ul className="mb-3 space-y-1 text-xs text-yellow-700 dark:text-yellow-300">
        {unconfigured.map((s) => (
          <li key={s.name}>• {s.name}</li>
        ))}
      </ul>
      <Link
        href="/owner/setup"
        className="inline-block rounded bg-yellow-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-yellow-700"
      >
        Open Setup →
      </Link>
    </div>
  );
}
