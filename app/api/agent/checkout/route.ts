import { MERCHANT } from "@/lib/catalog"
import { logEvent, store } from "@/lib/events"
import { observe } from "@/lib/identify"
import { bad, body, json, originOf } from "@/lib/http"
import { hmac } from "@/lib/sign"
import type { CheckoutHandoff } from "@/lib/types"

// POST /api/agent/checkout { cartId } → handoff to the merchant's own checkout (no real payment).
export async function POST(req: Request) {
  const b = await body<{ cartId: string }>(req)
  const cart = b.cartId ? store().carts.get(b.cartId) : undefined
  if (!cart) return bad("unknown cartId", 404)
  const { sessionId, identity } = observe(req, { path: "/api/agent/checkout", quiet: true })
  const handoff: CheckoutHandoff = {
    cartId: cart.id,
    handoffUrl: `${originOf(req)}/checkout?cart=${cart.id}`,
    domain: MERCHANT.checkoutDomain,
    total: cart.total,
    receiptSignature: hmac(`${cart.id}|${cart.total}|${MERCHANT.checkoutDomain}`),
  }
  logEvent(sessionId, "checkout", `${identity.claimed ?? "Unknown agent"} handed off to checkout on ${MERCHANT.checkoutDomain} ($${cart.total})`, handoff)
  return json({ ...handoff, prism: { sessionId } })
}
