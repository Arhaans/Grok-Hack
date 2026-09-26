import { randomUUID } from "node:crypto"
import { signAgentRequest } from "@/lib/sign"
import type { AgentKind, RunResult, RunStep } from "@/lib/types"

export type AgentOptions = {
  origin: string
  pace: number
  brain?: "scripted" | "grok"
  autoScan?: boolean
  probeAnswers?: "live" | "recorded" // copycat: generate probe answers live (~14s) or use the recorded ones
  voice?: "live" | "recorded" // shopper: lines written live by a local model (~1-2s each) or the recorded ones (instant)
  mode?: "replay" | "live" // replay: recorded answers/lines (instant, deterministic); live: Claude seller + local Llama
  onStep?: (step: RunStep, run: { runId: string; sessionId: string; agent: AgentKind }) => void // streaming
}

// A tiny HTTP client that behaves like an external agent hitting our public API.
export function makeAgent(kind: AgentKind, opts: AgentOptions, identity: { userAgent: string; signAs?: string }) {
  const runId = randomUUID().slice(0, 8)
  const sessionId = `${kind}-${runId}`
  const steps: RunStep[] = []

  function headers(): Record<string, string> {
    return {
      "user-agent": identity.userAgent,
      "x-prism-session": sessionId,
      "content-type": "application/json",
      ...(opts.mode === "live" ? { "x-prism-demo-mode": "live" } : {}),
      // UCP request headers (ucp.dev)
      "ucp-agent": `profile="https://agents.example/${kind}/profile.json"`,
      "idempotency-key": randomUUID(),
      "request-id": randomUUID(),
      ...(identity.signAs ? signAgentRequest(identity.signAs) : {}),
    }
  }

  async function call<T>(method: "GET" | "POST" | "PUT", path: string, payload?: unknown): Promise<T> {
    const r = await fetch(opts.origin + path, {
      method,
      headers: headers(),
      body: payload === undefined ? undefined : JSON.stringify(payload),
      cache: "no-store",
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok && r.status !== 503) throw new Error(`${method} ${path} → ${r.status} ${JSON.stringify(data)}`)
    return data as T
  }

  async function step(name: string, label: string, data?: unknown) {
    const s: RunStep = { ts: Date.now(), step: name, label, data }
    steps.push(s)
    opts.onStep?.(s, { runId, sessionId, agent: kind })
    if (opts.pace > 0) await new Promise((r) => setTimeout(r, opts.pace))
  }

  function result(ok: boolean, brain: RunResult["brain"] = "scripted", error?: string): RunResult {
    return { runId, agent: kind, sessionId, ok, brain, steps, error }
  }

  return {
    runId,
    sessionId,
    get: <T>(path: string) => call<T>("GET", path),
    post: <T>(path: string, payload: unknown) => call<T>("POST", path, payload),
    put: <T>(path: string, payload: unknown) => call<T>("PUT", path, payload),
    // Shared Payment Token the agent's platform delegated for this purchase (Stripe SPT, simulated)
    spt: () => "spt_" + randomUUID().replace(/-/g, "").slice(0, 24),
    step,
    result,
  }
}
