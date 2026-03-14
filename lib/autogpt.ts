// ===============================================================
// AUTOGPT API WRAPPER - The connection layer between your
// vending machine frontend and AutoGPT agents
//
// Drop this into: /lib/autogpt.ts
//
// API Docs: https://backend.agpt.co/external-api/docs
// Auth: X-API-Key header
// Scopes: EXECUTE_GRAPH, READ_GRAPH
// ===============================================================

import { isAutoGPTConfigured } from "@/lib/env";

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
  outputs: Record<string, unknown>;
  startedAt: string;
  completedAt?: string;
}

export interface AgentRunRequest {
  inputs: Record<string, unknown>;
}

// ------------------------------------------------------
// CORE API CLIENT
// ------------------------------------------------------

const AUTOGPT_BASE_URL =
  process.env.AUTOGPT_API_URL ?? "https://backend.agpt.co/external-api";

function getApiKey(): string {
  const key = process.env.AUTOGPT_API_KEY;
  if (!key) {
    throw new AutoGPTNotConfiguredError();
  }
  return key;
}

/** Thrown when the AUTOGPT_API_KEY env var is missing. */
export class AutoGPTNotConfiguredError extends Error {
  constructor() {
    super(
      "AutoGPT API key is not configured. Set AUTOGPT_API_KEY in your environment variables."
    );
    this.name = "AutoGPTNotConfiguredError";
  }
}

async function autogptFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const apiKey = getApiKey(); // throws if missing

  const response = await fetch(`${AUTOGPT_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "X-API-Key": apiKey,
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
  inputs: Record<string, unknown>
): Promise<{ executionId: string }> {
  const response = await autogptFetch(`/v1/graphs/${graphId}/execute`, {
    method: "POST",
    body: JSON.stringify(inputs),
  });

  const result = await response.json() as Record<string, unknown>;
  return { executionId: (result.id ?? result.execution_id) as string };
}

/**
 * Check the status of an agent run.
 * Poll this until status is "completed" or "failed"
 */
export async function getExecutionStatus(
  graphId: string,
  executionId: string
): Promise<ExecutionResult> {
  const response = await autogptFetch(
    `/v1/graphs/${graphId}/executions/${executionId}`
  );

  const result = await response.json() as Record<string, unknown>;
  return {
    executionId,
    status: (result.status ?? "running") as ExecutionResult["status"],
    outputs: (result.output ?? result.outputs ?? {}) as Record<string, unknown>,
    startedAt: (result.started_at ?? result.created_at) as string,
    completedAt: (result.ended_at ?? result.completed_at) as string | undefined,
  };
}

/**
 * Get all executions for an agent (for owner dashboard)
 */
export async function listExecutions(
  graphId: string
): Promise<ExecutionResult[]> {
  const response = await autogptFetch(`/v1/graphs/${graphId}/executions`);
  return response.json() as Promise<ExecutionResult[]>;
}

/**
 * Get available agents from the library
 */
export async function listLibraryAgents(): Promise<unknown[]> {
  const response = await autogptFetch("/v1/library/agents");
  return response.json() as Promise<unknown[]>;
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
  pollIntervalMs = 2000,
  timeoutMs = 300000 // 5 minutes
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
