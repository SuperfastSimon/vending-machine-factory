const AUTOGPT_BASE_URL = "https://backend.agpt.co/external-api";

function apiKey(): string {
  const key = process.env.AUTOGPT_API_KEY;
  if (!key) throw new Error("AUTOGPT_API_KEY is not set");
  return key;
}

async function autogptFetch(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${AUTOGPT_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "X-API-Key": apiKey(),
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`AutoGPT API error (${res.status}): ${error}`);
  }

  return res.json();
}

export async function triggerAgentRun(
  graphId: string,
  inputs: Record<string, string>
): Promise<{ executionId: string }> {
  const result = await autogptFetch(`/v1/graphs/${graphId}/execute`, {
    method: "POST",
    body: JSON.stringify(inputs),
  });

  return { executionId: result.id || result.execution_id };
}

export type ExecutionStatus = "queued" | "running" | "completed" | "failed";

export interface ExecutionResult {
  executionId: string;
  status: ExecutionStatus;
  outputs: Record<string, unknown>;
  startedAt: string;
  completedAt?: string;
}

export async function getExecutionStatus(
  graphId: string,
  executionId: string
): Promise<ExecutionResult> {
  const result = await autogptFetch(
    `/v1/graphs/${graphId}/executions/${executionId}`
  );

  return {
    executionId,
    status: result.status ?? "running",
    outputs: result.output ?? result.outputs ?? {},
    startedAt: result.started_at ?? result.created_at ?? "",
    completedAt: result.ended_at ?? result.completed_at,
  };
}
