"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createSupabaseBrowserClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const redirectTo =
      (process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin) +
      "/auth/callback?next=/auth/reset-password";

    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) {
      setError(
        error.message === "Failed to fetch"
          ? "Unable to connect. Please check your internet connection."
          : error.message
      );
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center">Reset your password</h1>
        <p className="mt-1 text-sm text-gray-500 text-center">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {sent ? (
          <div className="mt-8 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-center">
            Check your inbox — a reset link has been sent to <strong>{email}</strong>.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          <a href="/auth/login" className="text-indigo-600 font-medium hover:underline">
            Back to sign in
          </a>
        </p>
      </div>
    </div>
  );
}
