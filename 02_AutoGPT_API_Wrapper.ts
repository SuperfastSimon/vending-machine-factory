// AUTOGPT API WRAPPER - Connection layer between vending machine frontend and AutoGPT agents
// Drop into: /src/lib/autogpt.ts | API Docs: https://backend.agpt.co/external-api/docs

export interface AgentConfig { libraryId: string; graphId: string; }
export interface ExecutionResult { executionId: string; status: 'completed'|'running'|'failed'|'queued'; outputs: Record<string,any>; startedAt: string; completedAt?: string; }

const AUTOGPT_BASE_URL = 'https://backend.agpt.co/external-api';
const API_KEY = process.env.AUTOGPT_API_KEY!;

async function autogptFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const r = await fetch(`${AUTOGPT_BASE_URL}${endpoint}`, { ...options, headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/json', ...options.headers } });
  if (!r.ok) throw new Error(`AutoGPT API error (${r.status}): ${await r.text()}`);
  return r.json();
}

export async function triggerAgentRun(graphId: string, inputs: Record<string,any>) {
  const result = await autogptFetch(`/v1/graphs/${graphId}/execute`, { method: 'POST', body: JSON.stringify(inputs) });
  return { executionId: result.id || result.execution_id };
}

export async function getExecutionStatus(graphId: string, executionId: string): Promise<ExecutionResult> {
  const result = await autogptFetch(`/v1/graphs/${graphId}/executions/${executionId}`);
  return { executionId, status: result.status||'running', outputs: result.output||result.outputs||{}, startedAt: result.started_at||result.created_at, completedAt: result.ended_at||result.completed_at };
}

export const listExecutions = (graphId: string) => autogptFetch(`/v1/graphs/${graphId}/executions`);
export const listLibraryAgents = () => autogptFetch('/v1/library/agents');

export async function pollExecution(graphId: string, executionId: string, onUpdate?: (s:ExecutionResult)=>void, interval=2000, timeout=300000) {
  const start = Date.now();
  while (Date.now()-start < timeout) {
    const s = await getExecutionStatus(graphId, executionId);
    onUpdate?.(s);
    if (s.status==='completed'||s.status==='failed') return s;
    await new Promise(r=>setTimeout(r,interval));
  }
  throw new Error('Execution timed out');
}