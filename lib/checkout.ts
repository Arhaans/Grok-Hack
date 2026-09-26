import { randomUUID } from "node:crypto"
import { getProduct, MERCHANT } from "./catalog"
import { logEvent, store } from "./events"
import { verifyOffer } from "./sign"
import type { CheckoutSession, SignedOffer } from "./types"

// UCP-style checkout sessions. Prices come from the catalog, or from an offer Prism signed
// (a negotiated price) — so an agent can't invent a discount and a copycat can't reuse one.
const FREE_SHIPPING_OVER = 75

function fulfillmentOptions(subtotal: number) {
  return [
    { id: "standard", title: "Standard (2-4 days)", amount: 0 },
    { id: "express", title: "Express (next day)", amount: subtotal >= FREE_SHIPPING_OVER ? 0 : 6.95 },
  ]
}

export function createCheckout(sessionId: string, items: { sku: string; quantity?: number }[], offers: SignedOffer[] = []): CheckoutSession | string {
  const valid = offers.filter((o) => verifyOffer(o).valid)
  const line_items: CheckoutSession["line_items"] = []
  for (const it of items) {
    const p = getProduct(it.sku)
    if (!p) return `unknown sku ${it.sku}`
    const quantity = Math.max(1, Math.min(5, Number(it.quantity) || 1))
    if (p.stock < quantity) return `only ${p.stock} of ${p.sku} in stock`
    const offer = valid.find((o) => o.sku === p.sku)
    line_items.push({ sku: p.sku, name: p.name, quantity, unit_price: offer ? offer.price : p.price, signed: !!offer })
  }
  const subtotal = line_items.reduce((s, l) => s + l.unit_price * l.quantity, 0)
  const cs: CheckoutSession = {
    id: "cs_" + randomUUID().replace(/-/g, "").slice(0, 16),
    sessionId,
    status: "incomplete",
    currency: "USD",
    line_items,
    fulfillment_options: fulfillmentOptions(subtotal),
    totals: { subtotal, fulfillment: 0, total: subtotal },
    messages: ["fulfillment_address and fulfillment_option_id required"],
  }
  store().checkouts.set(cs.id, cs)
  return cs
}

export function updateCheckout(id: string, patch: { fulfillment_option_id?: string }): CheckoutSession | string {
  const cs = store().checkouts.get(id)
  if (!cs) return "unknown checkout session"
  if (cs.status === "completed" || cs.status === "canceled") return `session is ${cs.status}`
  const opt = cs.fulfillment_options.find((o) => o.id === (patch.fulfillment_option_id ?? "standard")) ?? cs.fulfillment_options[0]
  cs.fulfillment_option_id = opt.id
  cs.totals = { subtotal: cs.totals.subtotal, fulfillment: opt.amount, total: +(cs.totals.subtotal + opt.amount).toFixed(2) }
  cs.status = "ready_for_complete"
  cs.messages = []
  return cs
}

export function completeCheckout(id: string, payment: { provider?: string; token?: string }, origin: string): CheckoutSession | string {
  const cs = store().checkouts.get(id)
  if (!cs) return "unknown checkout session"
  if (cs.status !== "ready_for_complete") return `session is ${cs.status}, not ready_for_complete`
  if (!payment.token?.startsWith("spt_")) return "payment_data.token must be a Shared Payment Token (spt_…)"
  cs.payment_data = { provider: "stripe", token: payment.token }
  cs.status = "completed"
  cs.order = { id: "ord_" + randomUUID().slice(0, 8), checkout_url: `${origin}/store?order=${cs.id}` }
  logEvent(cs.sessionId, "checkout", `order_created ${cs.order.id} on ${MERCHANT.checkoutDomain}: $${cs.totals.total}`, {
    total: cs.totals.total,
    checkout_session: cs.id,
    order: cs.order,
  })
  return cs
}
