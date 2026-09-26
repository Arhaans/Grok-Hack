import { CATALOG } from "@/lib/catalog"
import { buildFull, buildMatrix, buildPacket } from "@/lib/formats"
import { logEvent, store } from "@/lib/events"
import { annotate, observe } from "@/lib/identify"
import { json } from "@/lib/http"
import { contextFrom } from "@/lib/context"

// GET /api/agent/catalog?format=packet|matrix|full&task=buy|research&skus=A,B&family=barrier-repair-serum
// Without an explicit format, Prism picks one from the agent's task hint or its observed intent.
export async function GET(req: Request) {
  const url = new URL(req.url)
  const skus = url.searchParams.get("skus")?.split(",").filter(Boolean)
  const family = url.searchParams.get("family")
  const products = CATALOG.filter((p) => (!skus || skus.includes(p.sku)) && (!family || p.family === family))

  const task = url.searchParams.get("task") || req.headers.get("x-agent-task")
  let format = url.searchParams.get("format")
  if (!format && task === "buy") format = "packet"
  if (!format && task === "research") format = "matrix"

  let { sessionId, identity, trace } = observe(req, { path: "/api/agent/catalog" })

  // Stop at the door: a withheld agent (exposed impostor or bulk scraper) gets nothing, not even the first page.
  const st = store()
  if (identity.experience === "withheld") {
    const n = (st.blocked.get(sessionId) ?? 0) + 1
    st.blocked.set(sessionId, n)
    logEvent(sessionId, "request", `Blocked ${identity.claimed ?? "agent"}: catalog request #${n} refused (risk ${identity.scores.risk})`, { blocked: n })
    return json({ error: "blocked by Prism: withheld agent", retry: false }, { status: 429, headers: { "x-prism-session": sessionId } })
  }
  // Through the gate: now these products count as seen by this agent.
  products.forEach((p) => trace.skusSeen.add(p.sku))
  identity = annotate(sessionId, {}) ?? identity

  // The agent's search text (UCP search_catalog query) becomes its context: need, budget, priorities.
  const q = url.searchParams.get("q")
  if (q) {
    trace.context = contextFrom(q)
    identity = annotate(sessionId, {}) ?? identity
    logEvent(sessionId, "request", `${identity.claimed ?? "Agent"} searched "${q}"`, { context: trace.context })
  }
  if (!format || !["packet", "matrix", "full"].includes(format))
    format = identity.intent === "buy" ? "packet" : identity.intent === "research" ? "matrix" : "full"
  identity = annotate(sessionId, { format }) ?? identity

  const payload =
    format === "packet"
      ? buildPacket(products, sessionId, trace.context)
      : format === "matrix"
        ? buildMatrix(products, sessionId)
        : buildFull(products, sessionId, identity.experience === "withheld")
  const label = format === "packet" ? "buying packet" : format === "matrix" ? "comparison matrix" : "full catalog"
  logEvent(sessionId, "format", `Served ${label} (${products.length} item${products.length === 1 ? "" : "s"}) to ${identity.claimed ?? "unknown agent"}`, {
    format,
    skus: products.map((p) => p.sku),
  })
  return json({ ...payload, prism: { sessionId } }, { headers: { "x-prism-session": sessionId, "x-prism-format": format } })
}
