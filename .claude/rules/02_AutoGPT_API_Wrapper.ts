// ===============================================================

// AUTOGPT API wRAPPER - The connection layer between your 
// vending machine frontend and AutoGPT agents
//
// Drop this into: /src/lib/autogpt.ts
// 
// API Docs: https://backend.agpt.co/external-api/docs
// Auth: X-API-Key header
// Scopes: EXECUTEGGRAPH, READ_GRAPH
// ===============================================================

// ------------------------------------------------------
// TYPES
// ------------------------------------------------------

export interface AgentConfig {
  libraryId: string;
  graphId: string;
}

export interface ExecutionResult {
  executionId: string;
  status: "completed" | "running" | "failed" | "queued";
  outputs: Record<string, any>;
  startedAt: string;
  completedAt?: string;
}

export interface AgentRunRequest {
  inputs: Record<string, any>;
}

// ------------------------------------------------------
// CORE API CLOENT
// ------------------------------------------------------

const AUTOGPT_BASE_URL = "https://backend.agpt.co/external-api";
const API_KEY = process.env.AUTOGPT_API_KEY!;

async function autogptFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const response = await fetch(`${AUTOGPT_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "X-API-Key": API_KEY,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      `AutoGPT API error (${response.status}): ${error}`
    );
  }

  return response.json();
}

// ------------------------------------------------------
// AGENT OPERATIONS
// ------------------------------------------------------

/**
 * Trigger an agent run from a customer action.
 * This is the core "vending machine" action: 
 * customer pays -> agent runs -> customer gets value
 */
export async function triggerAgentRun(
  graphId: string,
  inputs: Record<string, any>
): Promise<{ executionId: string }> {
  const result = await autogptFetch(
    `/v1/graphs/${graphId}/execute`,
    {
      method: "POST",
      body: JSON.stringify(inputs),
    }
  );

  return { executionId: result.id || result.execution_id };
}

/**
 * Check the status of an agent run.
 * Poll this until status is "completed" or "failed"
 */
export async function getExecutionStatus(
  graphId: string,
  executionId: string
): Promise<ExecutionResult> {
  const result = await autogptFetch(
    `/v1/graphs/${graphId}/executions/${executionId}`
  );

  return {
    executionId,
    status: result.status || "running",
    outputs: result.output || result.outputs || {},
    startedAt: result.started_at || result.created_at,
    completedAt: result.ended_at || result.completed_at,
  };
}

/**
 * Get all executions for an agent (for owner dashboard)
 */
export async function listExecutions(
  graphId: string
): Promise<ExecutionResult[]> {
  return autogptFetch(`/v1/graphs/${graphId}/executions`);
}

/**
 * Get available agents from the library
 */
export async function listLibraryAgents() {
  return autogptFetch("/v1/library/agents");
}

// ------------------------------------------------------
// POLLING HELPER (for UI)
// ------------------------------------------------------

/**
 * Poll for execution completion.
 * Use this in the customer UI to show real-time progress.
 * 
 * Example usage in a React component:
 *   const result = await pollExecution(graphId, executionId, (status) => {
 *     setProgress(status); // Update UI in real-time
 *   });
 */
export async function pollExecution(
  graphId: string,
  executionId: string,
  onStatusUpdate?: (status: ExecutionResult) => void,
  pollIntervalMs: number = 2000,
  timeoutMs: number = 300000 // 5 minutes
): Promise<ExecutionResult> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const status = await getExecutionStatus(graphId, executionId);

    if (onStatusUpdate) {
      onStatusUpdate(status);
    }

    if (status.status === "completed" || status.status === "failed") {
      return status;
    }

    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error("Execution timed out");
}

// ------------------------------------------------------
// NEXT.JS API ROUTES (drop into /app/api/agent/)
// ------------------------------------------------------

// File: /app/api/agent/run/route.ts
// Customer hits this to trigger an agent run

export const exampleRunRoute = `
// /app/api/agent/run/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { triggerAgentRun } from "@/lib/autogpt";
import { VENDING_MACHINE_CONFIG } from "@/config/vending-machine";
import { checkUserQuota } from "@/lib/usage";

export async function POST(req: NextRequest) {
  // 1. Verify user is authenticated
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Check usage quota
  const hasQuota = await checkUserQuota(session.user.id);
  if (!hasQuota) {
    return NextResponse.json(
      { error: "Usage limit reached. Please upgrade your plan." },
      { status: 429 }
    );
  }

  // 3. Get customer inputs
  const body = await req.json();

  // 4. Trigger the agent
  const { executionId } = await triggerAgentRun(
    VENDING_MACHINE_CONFIG.agent.graphId,
    body.inputs
  );

  // 5. Log usage
  await logUsage(session.user.id, executionId);

  return NextResponse.json({ executionId, status: "queued" });
}
`;

// File: /app/api/agent/status/[executionId]/route.ts
// Customer polls this for results

export const exampleStatusRoute = `
-/ /app/api/agent/status/[executionId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getExecutionStatus } from "@/lib/autogpt";
import { VENDING_MACHINE_CONFIG } from "@/config/vending-machine";

export async function GET(
  req: NextRequest,
  { params }: { params: { executionId: string } }
) {
  const status = await getExecutionStatus(
    VENDING_MACHINE_CONFIG.agent.graphId,
    params.executionId
  );
  return NextResponse.json(status);
}
`;

// ------------------------------------------------------
// REACT HOOK (drop into /src/hooks/useAgentRun.ts)
// ------------------------------------------------------

export const exampleReactHook = `
-/ /src/hooks/useAgentRun.ts
import { useState, useCallback } from "react";

type Status = "idle" | "submitting" | "running" | "completed" | "error";

export function useAgentRun() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runAgent = useCallback(async (inputs: Record<string, any>) => {
    setStatus("submitting");
    setError(null);
    setResult(null);

    try {
      // 1. Trigger the run
      const res = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to start");
      }

      const { executionId } = await res.json();
      setStatus("running");

      // 2. Poll for completion
      while (true) {
        await new Promise((r) => setTimeout(r, 2000));
        const statusRes = await fetch(\`/api/agent/status/\${executionId}\`);
        const data = await statusRes.json();

        if (data.status === "completed") {
          setResult(data.outputs);
          setStatus("completed");
          return data.outputs;
        }

        if (data.status === "failed") {
          throw new Error("Agent execution failed");
        }
      }
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
      throw err;
    }
  }, []);

  return { runAgent, status, result, error };
}
`;