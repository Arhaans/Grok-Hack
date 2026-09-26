import { createCheckout } from "@/lib/checkout"
import { logEvent } from "@/lib/events"
import { observe } from "@/lib/identify"
import { bad, body, json } from "@/lib/http"
import type { SignedOffer } from "@/lib/types"

// POST /api/ucp/checkout-sessions { line_items: [{ sku, quantity }], offers?: SignedOffer[] } → CheckoutSession (incomplete)
export async function POST(req: Request) {
  const b = await body<{ line_items: { sku: string; quantity?: number }[]; offers: SignedOffer[] }>(req)
  if (!Array.isArray(b.line_items) || !b.line_items.length) return bad("line_items required")
  const { sessionId, identity } = observe(req, { path: "/api/agent/cart", skus: b.line_items.map((l) => l.sku), quiet: true })
  const cs = createCheckout(sessionId, b.line_items, b.offers ?? [])
  if (typeof cs === "string") return bad(cs, 409)
  logEvent(sessionId, "cart", `${identity.claimed ?? "Agent"} POST /checkout-sessions ${cs.id}: ${cs.line_items.map((l) => `${l.quantity}× ${l.sku} $${l.unit_price}${l.signed ? " (signed offer)" : ""}`).join(", ")}`, cs)
  return json(cs, { status: 201 })
}
