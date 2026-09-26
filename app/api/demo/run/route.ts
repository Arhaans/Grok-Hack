import { runBuyer } from "@/agents/buyer"
import { runCopycat } from "@/agents/copycat"
import { runResearcher } from "@/agents/researcher"
import { runShopper } from "@/agents/shopper"
import { bad, json, originOf } from "@/lib/http"
import type { AgentOptions } from "@/agents/client"
import type { RunResult } from "@/lib/types"

export const maxDuration = 120

// POST /api/demo/run?agent=buyer|researcher|copycat|shopper[&model=gpt-4o|claude-3.5-sonnet|llama-3.1-8b]
//[&pace=600][&brain=scripted|grok][&autoScan=0][&probeAnswers=recorded][&voice=live][&stream=1][&mode=live]
// Runs the bot against our own public API and returns its steps (RunResult). Events stream via /api/prism/events.
export async function POST(req: Request) {
  const q = new URL(req.url).searchParams
  const agent = q.get("agent")
  const opts = {
    origin: originOf(req),
    pace: Math.max(0, Math.min(3000, Number(q.get("pace") ?? 600))),
    brain: (q.get("brain") as "scripted" | "grok" | null) ?? undefined,
    autoScan: q.get("autoScan") !== "0",
    probeAnswers: (q.get("probeAnswers") === "recorded" ? "recorded" : "live") as "live" | "recorded",
    voice: (q.get("voice") === "live" ? "live" : "recorded") as "live" | "recorded",
    mode: (q.get("mode") === "live" ? "live" : "replay") as "live" | "replay",
  }
  const runners: Record<string, (o: typeof opts & AgentOptions) => Promise<RunResult>> = {
    buyer: runBuyer,
    researcher: runResearcher,
    copycat: runCopycat,
    shopper: (o) => runShopper({ ...o, model: q.get("model") ?? undefined }),
  }
  const runner = agent ? runners[agent] : undefined
  if (!runner) return bad("agent must be buyer, researcher, copycat or shopper")
  if (q.get("stream") !== "1") return json(await runner(opts))

  // stream=1: NDJSON, one {type:"step"} line per step as it happens, then {type:"done", result}
  const enc = new TextEncoder()
  const body = new ReadableStream({
    async start(controller) {
      const send = (o: unknown) => controller.enqueue(enc.encode(JSON.stringify(o) + "\n"))
      try {
        const result = await runner({ ...opts, onStep: (step, run) => send({ type: "step", step, run }) })
        send({ type: "done", result })
      } catch (e) {
        send({ type: "error", error: String(e) })
      }
      controller.close()
    },
  })
  return new Response(body, { headers: { "content-type": "application/x-ndjson", "cache-control": "no-store" } })
}
