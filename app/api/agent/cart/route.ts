import { randomUUID } from "node:crypto"
import { getProduct } from "@/lib/catalog"
import { logEvent, store } from "@/lib/events"
import { observe } from "@/lib/identify"
import { bad, body, json } from "@/lib/http"
import type { Cart } from "@/lib/types"

// POST /api/agent/cart { items: [{ sku, qty }] } → Cart. Prices always come from our catalog.
export async function POST(req: Request) {
  const b = await body<{ items: { sku: string; qty?: number }[] }>(req)
  if (!Array.isArray(b.items) || b.items.length === 0) return bad("items required")
  const items: Cart["items"] = []
  for (const it of b.items) {
    const p = getProduct(it.sku)
    if (!p) return bad(`unknown sku ${it.sku}`)
    const qty = Math.max(1, Math.min(5, Number(it.qty) || 1))
    if (p.stock < qty) return bad(`only ${p.stock} of ${p.sku} in stock`, 409)
    items.push({ sku: p.sku, qty, price: p.price })
  }
  const { sessionId, identity } = observe(req, { path: "/api/agent/cart", skus: items.map((i) => i.sku), quiet: true })
  const cart: Cart = {
    id: "cart_" + randomUUID().slice(0, 8),
    sessionId,
    items,
    total: items.reduce((s, i) => s + i.price * i.qty, 0),
    currency: "GBP",
  }
  store().carts.set(cart.id, cart)
  logEvent(sessionId, "cart", `${identity.claimed ?? "Unknown agent"} built a cart: ${items.map((i) => `${i.qty}× ${i.sku}`).join(", ")} (£${cart.total})`, cart)
  return json({ ...cart, prism: { sessionId } })
}
