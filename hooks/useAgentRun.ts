"use client";

import { useState, useCallback, useRef } from "react";

type RunStatus = "idle" | "submitting" | "polling" | "completed" | "error";

interface UseAgentRunOptions {
  onComplete?: (output: string) => void;
  onError?: (error: string) => void;
  pollIntervalMs?: number;
}

interface UseAgentRunReturn {
  status: RunStatus;
  output: string | null;
  error: string | null;
  elapsed: number;
  submit: (inputs: Record<string, unknown>) => Promise<void>;
  reset: () => void;
}

function extractOutput(outputs: Record<string, unknown>): string {
  for (const key of ["result", "text", "content", "output", "response", "answer"]) {
    if (typeof outputs[key] === "string") return outputs[key] as string;
  }
  for (const val of Object.values(outputs)) {
    if (typeof val === "string" && val.length > 0) return val;
  }
  return JSON.stringify(outputs, null, 2);
}

export function useAgentRun(options: UseAgentRunOptions = {}): UseAgentRunReturn {
  const { onComplete, onError, pollIntervalMs = 3000 } = options;

  const [status, setStatus] = useState<RunStatus>("idle");
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setOutput(null);
    setError(null);
    setElapsed(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const submit = useCallback(
    async (inputs: Record<string, unknown>) => {
      setStatus("submitting");
      setOutput(null);
      setError(null);
      setElapsed(0);

      let executionId: string;
      try {
        const res = await fetch("/api/agent/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inputs }),
        });
        const data = await res.json();
        if (!res.ok) {
          const msg = data.error ?? "Failed to start agent.";
          setError(msg);
          setStatus("error");
          onError?.(msg);
          return;
        }
        executionId = data.executionId;
      } catch {
        const msg = "Network error. Please check your connection and try again.";
        setError(msg);
        setStatus("error");
        onError?.(msg);
        return;
      }

      setStatus("polling");
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      try {
        while (true) {
          await new Promise((r) => setTimeout(r, pollIntervalMs));
          const res = await fetch(`/api/agent/status/${executionId}`);
          const data = await res.json();

          if (!res.ok) throw new Error(data.error ?? "Failed to get status.");

          if (data.status === "completed") {
            const result = extractOutput(data.outputs);
            setOutput(result);
            setStatus("completed");
            onComplete?.(result);
            break;
          }

          if (data.status === "failed") {
            throw new Error("The agent run failed. Please try again.");
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Something went wrong.";
        setError(msg);
        setStatus("error");
        onError?.(msg);
      } finally {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    },
    [onComplete, onError, pollIntervalMs]
  );

  return { status, output, error, elapsed, submit, reset };
}
