// ============================================================
// AutoGPT API WRAPPER — The connection layer between your
// vending machine frontend and AutoGPT agents
//
// tap this into: /en/docs/autogpt.io
//
// API Docs: https://backend.agpt.co/external-api/docs
// Auth: X-API-Key header
// Scopes: EXECUTE_GRAPH, READ_GRAPH
// ============================================================

// ============================================================
// TYPES
// ============================================================

export interface AgentConfig {
  executionId: string;
  status: "completed" | "running" | "failed" | "paused";
  inputs: Record<string, string>;
  stepResults?: Record<string, unknown>[];
}

export interface ExecutionResult {
  executionId: string;
  status: "completed" | "running" | "failed" | "paused";
  outputs: Record<string, unknown>;
  stepResults: Record<string, unknown>[];
  startedAt: string | null;
  endedAt: string | null;
}

export interface AgentRunRequest {
  inputs: Record<string, string>;
}

// ============================================================
// CORE API CLIENT
// ============================================================

const AUTOGPT_BASE_URL =
  process.env.NEXT_PUBLIC_AUTOGPT_API_URL ??
  "https://backend.agpt.co/external-api";

async function autogptFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const apiKey = process.env.AUTOGPT_API_KEY;
  const response = await fetch(`${AUTOGPT_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "X-Api-Key": apiKey ?? "",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AutoGPT API error (${response.status}): ${error}`);
  }

  return response;
}

// ============================================================
// AGENT OPERATIONS
// ============================================================

/**
 * Trigger an agent run from a customer action.
 * This is the core "vending machine" action:
 * customer pays -> agent runs -> customers get value
 */
export async function triggerAgentRun(
  graphId: string,
  inputs: Record<string, string>
): Promise<{ executionId: string }> {
  const result = await autogptFetch(`/1/graphs/${graphId}/execute`, {
    method: "POST",
    body: JSON.stringify({ inputs }),
  });

  return result.json() as Promise<{ executionId: string }>;
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
    `/1/graphs/${graphId}/executions/${executionId}`
  );

  return result.json() as Promise<ExecutionResult>;
}

/**
 * Get all executions for an agent (for owner dashboard)
 */
export async function listExecutions(
  graphId: string
): Promise<ExecutionResult[]> {
  const result = await autogptFetch(`/1/graphs/${graphId}/executions`);

  return result.json() as Promise<ExecutionResult[]>;
}

// ============================================================
// POLLING HELPER (for UI)
// ============================================================

/**
 * Poll for execution completion.
 * Use this in the customer UI to show real-time progress.
 *
 * Example usage in a React component:
 *   const result = await pollExecution(graphId, executionId, (status) => {
 *     setProgress(status);
 *   });
 */
export async function pollExecution(
  graphId: string,
  executionId: string,
  onUpdate?: (status: ExecutionResult) => void,
  timeoutMs = 5 * 60 * 1000 // 5 minutes
): Promise<ExecutionResult> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const status = await getExecutionStatus(graphId, executionId);

    if (onUpdate) onUpdate(status);

    if (status.status === "completed" || status.status === "failed") {
      return status;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error("Execution timed out");
}
