// AutoGPT API Wrapper - Connection layer for vending machine frontends
// Drop into: /src/lib/autogpt.ts
// API Docs: https://backend.agpt.co/external-api/docs
// Auth: X-API-Key header

export interface AgentConfig { libraryId: string; graphId: string; }
export interface ExecutionResult { executionId: string; status: 'completed'|'running'|'failed'|'queued'; outputs: Record<string,any>; startedAt: string; completedAt?: string; }

const BASE = 'https://backend.agpt.co/external-api';
const KEY = process.env.AUTOGPT_API_KEY!;

async function autogptFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const r = await fetch(`${BASE}${endpoint}`, { ...options, headers: { 'X-API-Key': KEY, 'Content-Type': 'application/json', ...options.headers } });
  if (!r.ok) throw new Error(`AutoGPT API error (${r.status}): ${await r.text()}`);
  return r.json();
}

export async function triggerAgentRun(graphId: string, inputs: Record<string,any>) {
  const result = await autogptFetch(`/v1/graphs/${graphId}/execute`, { method: 'POST', body: JSON.stringify(inputs) });
  return { executionId: result.id || result.execution_id };
}

export async function getExecutionStatus(graphId: string, executionId: string): Promise<ExecutionResult> {
  const r = await autogptFetch(`/v1/graphs/${graphId}/executions/${executionId}`);
  return { executionId, status: r.status||'running', outputs: r.output||r.outputs||{}, startedAt: r.started_at||r.created_at, completedAt: r.ended_at||r.completed_at };
}

export async function listExecutions(graphId: string) { return autogptFetch(`/v1/graphs/${graphId}/executions`); }
export async function listLibraryAgents() { return autogptFetch('/v1/library/agents'); }

export async function pollExecution(graphId: string, executionId: string, onUpdate?: (s: ExecutionResult)=>void, interval=2000, timeout=300000): Promise<ExecutionResult> {
  const start = Date.now();
  while (Date.now()-start < timeout) {
    const s = await getExecutionStatus(graphId, executionId);
    if (onUpdate) onUpdate(s);
    if (s.status==='completed'||s.status==='failed') return s;
    await new Promise(r => setTimeout(r, interval));
  }
  throw new Error('Execution timed out');
}

// See full examples (Next.js API routes + React hook) in the workspace version