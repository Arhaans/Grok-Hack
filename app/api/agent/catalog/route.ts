import { CATALOG } from "@/lib/catalog"
import { buildFull, buildMatrix, buildPacket } from "@/lib/formats"
import { logEvent } from "@/lib/events"
import { annotate, observe } from "@/lib/identify"
import { json } from "@/lib/http"

// GET /api/agent/catalog?format=packet|matrix|full&task=buy|research&skus=A,B&family=halo
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

  let { sessionId, identity } = observe(req, { path: "/api/agent/catalog", skus: products.map((p) => p.sku) })
  if (!format || !["packet", "matrix", "full"].includes(format))
    format = identity.intent === "buy" ? "packet" : identity.intent === "research" ? "matrix" : "full"
  identity = annotate(sessionId, { format }) ?? identity

  const payload =
    format === "packet" ? buildPacket(products, sessionId) : format === "matrix" ? buildMatrix(products, sessionId) : buildFull(products, sessionId)
  const label = format === "packet" ? "buying packet" : format === "matrix" ? "comparison matrix" : "full catalog"
  logEvent(sessionId, "format", `Served ${label} (${products.length} item${products.length === 1 ? "" : "s"}) to ${identity.claimed ?? "unknown agent"}`, {
    format,
    skus: products.map((p) => p.sku),
  })
  return json({ ...payload, prism: { sessionId } }, { headers: { "x-prism-session": sessionId, "x-prism-format": format } })
}
