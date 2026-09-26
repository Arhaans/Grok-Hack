import { makeAgent, type AgentOptions } from "./client"
import { grokAvailable, grokJSON } from "@/lib/grok"
import { logEvent } from "@/lib/events"
import { DEMO, MERCHANT } from "@/lib/catalog"
import type { BuyingPacket, Cart, CheckoutHandoff, CloneStore, RunResult, SignedOffer } from "@/lib/types"

export const BUYER_BRIEF = "Buy the Barrier Repair Serum for me: sensitive skin, I need it within 3 days, budget $70."

type Candidate = { store: "merchant" | "clone"; domain: string; sku: string; price: number; deliveryDays: number; inStock: boolean; offerValid: boolean; problems: string[] }
type Decision = { sku: string; store: "merchant" | "clone"; reason: string }

function scriptedDecision(cands: Candidate[]): Decision {
  const ok = cands.filter((c) => c.offerValid && c.inStock && c.deliveryDays <= 3 && c.price <= 70).sort((a, b) => a.price - b.price)
  const pick = ok[0] ?? cands.find((c) => c.offerValid)!
  const rejected = cands.filter((c) => !c.offerValid)
  return {
    sku: pick.sku,
    store: pick.store,
    reason:
      `${pick.sku} arrives in ${pick.deliveryDays} days at $${pick.price} with a merchant-signed offer.` +
      (rejected.length ? ` Rejected ${rejected[0].domain}: ${rejected[0].problems.join("; ")}.` : ""),
  }
}

export async function runBuyer(opts: AgentOptions): Promise<RunResult> {
  const a = makeAgent("buyer", opts, { userAgent: "GrokShopper/1.0 (+https://x.ai/grok; shopping agent)", signAs: "grok-shopper" })
  try {
    await a.step("brief", `Task from user: "${BUYER_BRIEF}"`)

    const packet = await a.get<BuyingPacket>(`/api/agent/catalog?task=buy&family=${DEMO.heroFamily}`)
    await a.step("fetch_packet", `Got a signed buying packet with ${packet.items.length} variants from ${packet.merchant}`, packet)

    const returns = await a.get<{ policy: string }>("/api/agent/policy?topic=returns")
    await a.step("ask_policy", `Asked about returns: "${returns.policy}"`, { topic: "returns", ...returns })
    const shipping = await a.get<{ policy: string }>("/api/agent/policy?topic=shipping")
    await a.step("ask_policy", `Asked about shipping: "${shipping.policy}"`, { topic: "shipping", ...shipping })

    const cands: Candidate[] = packet.items.map((i) => ({
      store: "merchant",
      domain: packet.checkout.domain,
      sku: i.sku,
      price: i.price,
      deliveryDays: parseInt(i.delivery),
      inStock: i.inStock,
      offerValid: true,
      problems: [],
    }))
    await a.step("compare", `Compared ${packet.items.map((i) => `${i.variant} $${i.price} (${i.delivery}, ${i.stock} left)`).join(" vs ")}`, cands)

    // Shop around: does anyone else sell it cheaper?
    const { clone } = await a.get<{ clone: CloneStore | null }>("/api/clone")
    if (clone) {
      for (const p of clone.products.filter((p) => p.family === DEMO.heroFamily)) {
        const v = await a.post<{ valid: boolean; reasons: string[] }>("/api/agent/verify-offer", { offer: p.offer as SignedOffer, seenAt: clone.domain })
        cands.push({ store: "clone", domain: clone.domain, sku: p.sku, price: p.price, deliveryDays: p.deliveryDays, inStock: p.stock > 0, offerValid: v.valid, problems: v.reasons })
      }
      const cheaper = cands.filter((c) => c.store === "clone").sort((x, y) => x.price - y.price)[0]
      await a.step(
        "check_clone",
        `Found ${clone.name} (${clone.domain}) selling ${cheaper?.sku} for $${cheaper?.price}. Checked its offer with the merchant: ${cheaper?.offerValid ? "valid" : "INVALID, " + cheaper?.problems.join("; ")}`,
        cands.filter((c) => c.store === "clone"),
      )
    }

    let decision: Decision
    let brain: RunResult["brain"] = "scripted"
    if (opts.brain !== "scripted" && grokAvailable()) {
      try {
        const { data, model } = await grokJSON<Decision>(
          "You are a careful shopping agent buying on behalf of a user. Only buy from offers whose merchant signature verified (offerValid true). Reply with JSON only: {\"sku\": string, \"store\": \"merchant\" | \"clone\", \"reason\": string (one or two sentences, mention any rejected store and why)}.",
          `User brief: ${BUYER_BRIEF}\n\nCandidates:\n${JSON.stringify(cands, null, 2)}\n\nReturns policy: ${returns.policy}\nShipping policy: ${shipping.policy}`,
        )
        const chosen = cands.find((c) => c.sku === data.sku && c.store === data.store)
        if (!chosen || !chosen.offerValid) throw new Error(`Grok picked an invalid option (${data.store} ${data.sku})`)
        decision = data
        brain = "grok"
        await a.step("grok", `Grok (${model}) decided`, data)
      } catch (e) {
        decision = scriptedDecision(cands)
        await a.step("grok_fallback", `Grok unavailable, used scripted policy (${String(e).slice(0, 120)})`)
      }
    } else decision = scriptedDecision(cands)

    logEvent(a.sessionId, "decision", `Grok Shopper chose ${decision.sku} from ${decision.store === "merchant" ? MERCHANT.name : "the clone"}: ${decision.reason}`, decision)
    if (clone) await a.step("reject_clone", `Rejected ${clone.domain}: offer not signed by ${MERCHANT.name}, checkout on ${clone.checkoutDomain}`)
    await a.step("decide", decision.reason, decision)

    const cart = await a.post<Cart>("/api/agent/cart", { items: [{ sku: decision.sku, qty: 1 }] })
    await a.step("cart", `Built cart ${cart.id}: ${decision.sku}, $${cart.total}`, cart)
    const handoff = await a.post<CheckoutHandoff>("/api/agent/checkout", { cartId: cart.id })
    await a.step("checkout", `Handed off to checkout on ${handoff.domain} for $${handoff.total}`, handoff)
    return a.result(true, brain)
  } catch (e) {
    return a.result(false, "scripted", String(e))
  }
}
