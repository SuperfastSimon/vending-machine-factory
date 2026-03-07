"use client";

import { useState } from "react";

interface Props {
  credits: number;
  inputSchema: {
    prompt: {
      label: string;
      placeholder: string;
    };
  };
}

type RunStatus = "idle" | "submitting" | "polling" | "completed" | "error";

function extractOutput(outputs: Record<string, unknown>): string {
  // Try common output keys from AutoGPT agents
  for (const key of ["result", "text", "content", "output", "response", "answer"]) {
    if (typeof outputs[key] === "string") return outputs[key] as string;
  }
  // Fall back to first string value found
  for (const val of Object.values(outputs)) {
    if (typeof val === "string" && val.length > 0) return val;
  }
  // Last resort: pretty-print the object
  return JSON.stringify(outputs, null, 2);
}

export default function AgentInterface({ credits, inputSchema }: Props) {
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<RunStatus>("idle");
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creditsLeft, setCreditsLeft] = useState(credits);
  const [elapsed, setElapsed] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || creditsLeft <= 0) return;

    setStatus("submitting");
    setOutput(null);
    setError(null);
    setElapsed(0);

    // Trigger agent run
    let executionId: string;
    try {
      const res = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: { prompt: prompt.trim() } }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to start agent.");
        setStatus("error");
        return;
      }
      executionId = data.executionId;
      setCreditsLeft((c) => c - 1);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setStatus("error");
      return;
    }

    // Poll for completion
    setStatus("polling");
    const startTime = Date.now();
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    try {
      while (true) {
        await new Promise((r) => setTimeout(r, 3000));
        const res = await fetch(`/api/agent/status/${executionId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error ?? "Failed to get status.");
        }

        if (data.status === "completed") {
          setOutput(extractOutput(data.outputs));
          setStatus("completed");
          break;
        }

        if (data.status === "failed") {
          throw new Error("The agent run failed. Please try again.");
        }

        // still running / queued — keep polling
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    } finally {
      clearInterval(timer);
    }
  }

  function handleReset() {
    setStatus("idle");
    setOutput(null);
    setError(null);
    setPrompt("");
  }

  const isRunning = status === "submitting" || status === "polling";
  const noCredits = creditsLeft <= 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <h2 className="font-semibold text-gray-900">AI Business Concept Studio</h2>
        </div>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            creditsLeft > 0
              ? "bg-indigo-50 text-indigo-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {creditsLeft} credit{creditsLeft !== 1 ? "s" : ""} remaining
        </span>
      </div>

      <div className="p-6 space-y-5">
        {/* Input form — only show when not running and no output yet */}
        {status !== "completed" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="prompt"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                {inputSchema.prompt.label}
              </label>
              <textarea
                id="prompt"
                rows={5}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={inputSchema.prompt.placeholder}
                disabled={isRunning || noCredits}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none disabled:bg-gray-50 disabled:text-gray-400 transition"
              />
            </div>

            {noCredits ? (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
                You have no credits left.{" "}
                <a href="/pricing" className="font-semibold underline hover:text-amber-900">
                  Upgrade your plan
                </a>{" "}
                to continue.
              </div>
            ) : (
              <button
                type="submit"
                disabled={isRunning || !prompt.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium py-3 px-4 text-sm transition-colors"
              >
                {isRunning ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    {status === "submitting" ? "Starting agent..." : "Generating..."}
                  </>
                ) : (
                  "Generate →"
                )}
              </button>
            )}
          </form>
        )}

        {/* Loading state */}
        {isRunning && (
          <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">
                <div className="relative w-5 h-5">
                  <div className="absolute inset-0 rounded-full border-2 border-indigo-200" />
                  <div className="absolute inset-0 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-900">
                  {status === "submitting"
                    ? "Connecting to AI agent..."
                    : "Your AI is working on it"}
                </p>
                <p className="mt-0.5 text-xs text-indigo-600">
                  {status === "polling"
                    ? `${elapsed}s elapsed · usually takes 30–90 seconds`
                    : "Initialising..."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
        {status === "error" && error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm font-medium text-red-800">{error}</p>
            <button
              onClick={handleReset}
              className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Output */}
        {status === "completed" && output && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Result</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">1 credit used</span>
                <button
                  onClick={handleReset}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  + New generation
                </button>
              </div>
            </div>
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-5 max-h-[500px] overflow-y-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                {output}
              </pre>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(output);
              }}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy to clipboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
