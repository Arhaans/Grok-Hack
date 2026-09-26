import { runBuyer } from "@/agents/buyer"
import { runCopycat } from "@/agents/copycat"
import { runResearcher } from "@/agents/researcher"
import { runShopper } from "@/agents/shopper"
import { bad, json, originOf } from "@/lib/http"

export const maxDuration = 120

// POST /api/demo/run?agent=buyer|researcher|copycat|shopper[&model=gpt-4o|claude-3.5-sonnet|llama-3.1-8b]
//[&pace=600][&brain=scripted|grok][&autoScan=0][&probeAnswers=recorded]
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
  }
  if (agent === "buyer") return json(await runBuyer(opts))
  if (agent === "researcher") return json(await runResearcher(opts))
  if (agent === "copycat") return json(await runCopycat(opts))
  if (agent === "shopper") return json(await runShopper({ ...opts, model: q.get("model") ?? undefined }))
  return bad("agent must be buyer, researcher, copycat or shopper")
}
