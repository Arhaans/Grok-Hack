import { logEvent } from "@/lib/events"
import { observe } from "@/lib/identify"
import { bad, body, json } from "@/lib/http"
import { pickTactic, prismReply } from "@/lib/playbook"
import { signOffer } from "@/lib/sign"

// POST /api/agent/negotiate { sku, round, message?, ask? } → Prism's reply, chosen by the agent's model family.
export async function POST(req: Request) {
  const b = await body<{ sku: string; round: number; message: string; ask: number }>(req)
  if (!b.sku) return bad("sku required")
  const { sessionId, identity } = observe(req, { path: "/api/agent/negotiate", skus: [b.sku], quiet: true })
  const { tactic, family, modelLabel } = pickTactic(identity)
  const round = Number(b.round) || 0
  if (b.message) logEvent(sessionId, "negotiation", `${modelLabel} agent: "${b.message}"`, { from: "agent", round })
  if (round === 0)
    logEvent(sessionId, "negotiation", `Prism identified ${modelLabel} → tactic "${tactic.name}"`, { tactic, family, modelLabel })
  const turn = prismReply(tactic.id, b.sku, round, b.ask ? Number(b.ask) : undefined)
  // bundles come with one signed offer per line so the cart can honour them
  const bundleOffers = turn.bundle?.map((l) => signOffer(l.sku, l.price))
  logEvent(sessionId, "negotiation", `Prism: "${turn.text}"`, { from: "prism", round, tactic: tactic.id, turn })
  return json({ tactic, family, modelLabel, turn, bundleOffers, prism: { sessionId } })
}
