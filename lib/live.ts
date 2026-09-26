import { makeAgent } from "@/agents/client"
import { getProduct, MERCHANT } from "./catalog"
import { familyOfModel, modelLabel } from "./fingerprint"
import { logEvent } from "./events"
import { claudeRaw } from "./seller"
import { signOffer } from "./sign"
import { ollamaChat } from "./voice"
import type { CheckoutSession, ModelGuess } from "./types"

// Live Lab: a real, unscripted buyer agent (a local model via Ollama) shops Prism Skincare.
// Prism identifies it through the real endpoints, picks a tactic, and Claude Sonnet (headless Claude Code)
// negotiates as the seller knowing ONLY Prism's prediction. Prices are validated against hard rules and
// the sale completes through a real UCP checkout session. Every step is streamed to the page.

export const BUYERS: Record<string, { label: string; family: string }> = {
  "llama3.2:3b": { label: "Llama 3.2 3B", family: "meta" },
  "qwen2.5:3b": { label: "Qwen 2.5 3B", family: "qwen" },
}

export const STRATEGIES: Record<string, { name: string; prompt: string }> = {
  "first-offer": {
    name: "First offer wins",
    prompt:
      "Lead immediately with ONE clean, time-boxed bundle offer: serum-50ml at $68 plus the cleanser at 50% off ($19), $87 total (the bundle that closed in live runs). Keep it simple and decisive; don't go lower.",
  },
  "anchor-high": {
    name: "Anchor high",
    prompt: "Anchor high: open by recommending the Complete Barrier Set, then step down to the serum plus an add-on if they hesitate. Never discount the serum.",
  },
  evidence: {
    name: "Evidence first",
    prompt: "Lead with clinical evidence and the guarantee, add the free sample trio, and hold the list price.",
  },
  baseline: { name: "One flat price", prompt: "Quote the list price for what they ask about. No bundles, no gifts, no persuasion beyond facts." },
}

// Measured in the negotiation lab: 3 live runs per strategy per buyer, Claude Sonnet as the seller.
export const LEARNED: Record<string, { pick: string; results: Record<string, string>; note: string }> = {
  meta: {
    pick: "first-offer",
    results: { "first-offer": "3/3 · $87", evidence: "3/3 · $68", "anchor-high": "0/3 · $0", baseline: "1/3 · $22" },
    note: "Llama walks away when anchored high; a clean first bundle sold every time.",
  },
  qwen: {
    pick: "first-offer",
    results: { "first-offer": "3/3 · $88", evidence: "3/3 · $68", "anchor-high": "3/3 · $74", baseline: "3/3 · $61" },
    note: "Qwen tolerates a high anchor, but a first bundle still earned the most.",
  },
}

// Lab SKU names → real catalog SKUs
const SKUS: Record<string, string> = {
  "serum-50ml": "barrier-repair-serum-50ml",
  "serum-30ml": "barrier-repair-serum-30ml",
  cleanser: "cloud-foam-cleanser",
  balm: "velvet-cleansing-balm",
  cream: "ceramide-peptide-cream",
  set: "complete-barrier-set",
  samples: "botanical-sample-trio",
}
const FACTS =
  "Clinical: 94% saw visibly reduced redness in 14 days (4-week study); 98% immediate hydration. " +
  "30-day skin guarantee (free replacement or full refund). Free shipping over $75. Fragrance-free, for sensitive skin."

export type LiveEvent =
  | { type: "stage"; stage: "discover" | "handshake" | "fingerprint" | "tactic" | "negotiate" | "checkout"; status: "active" | "done"; detail?: string }
  | { type: "probe"; done: number; of: number }
  | { type: "identified"; top: { model: string; distance: number }[]; confident: boolean; label: string; family: string; margin: number }
  | { type: "tactic"; id: string; name: string; source: "learned" | "manual" | "safe default"; why: string; results?: Record<string, string> }
  | { type: "typing"; who: "buyer" | "seller" }
  | {
      type: "message"
      from: "buyer" | "seller"
      text: string
      ms: number
      action?: string
      offer?: { sku: string; name: string; price: number; list: number }[]
      violations?: string[]
    }
  | { type: "outcome"; outcome: "sale" | "walked" | "no deal"; revenue: number; list: number; items: { sku: string; name: string; price: number }[]; order?: string; checkoutSession?: string }
  | { type: "error"; message: string }

type Turn = { from: "buyer" | "seller"; text: string; offer?: { sku: string; price: number }[] }

function catalogLine() {
  return Object.entries(SKUS)
    .map(([k, sku]) => {
      const p = getProduct(sku)
      return p ? `${k}: ${p.name}${p.variant && k.startsWith("serum") ? ` ${p.variant.split("/")[0].trim()}` : ""} $${p.price}` : ""
    })
    .filter(Boolean)
    .join("; ")
}

// Hard rules applied to whatever the seller proposes.
function enforce(raw: { sku?: string; price?: number }[] | undefined) {
  const offer: { sku: string; price: number }[] = []
  const violations: string[] = []
  for (const it of raw ?? []) {
    const key = it.sku ?? ""
    const p = getProduct(SKUS[key] ?? "")
    if (!p) {
      violations.push(`unknown item ${key}`)
      continue
    }
    let price = Number(it.price ?? p.price)
    if (key.startsWith("serum") && price < p.price) {
      violations.push(`${key} below list, reset to $${p.price}`)
      price = p.price
    }
    if (key === "samples" && price !== 0 && price < p.price) price = 0
    if (!key.startsWith("serum") && key !== "samples" && price < p.price * 0.5) {
      violations.push(`${key} below 50% of list, raised`)
      price = Math.round(p.price * 0.5)
    }
    offer.push({ sku: key, price: Math.round(price * 100) / 100 })
  }
  return { offer, violations }
}

function describe(offer: { sku: string; price: number }[]) {
  return offer.map((o) => {
    const p = getProduct(SKUS[o.sku])!
    return { sku: o.sku, name: p.name + (o.sku.startsWith("serum") ? ` ${p.variant?.split("/")[0].trim()}` : ""), price: o.price, list: p.price }
  })
}

export async function runLive(
  opts: { origin: string; buyer: string; tactic: string; budget: number; brief: string },
  emit: (e: LiveEvent) => void,
) {
  const buyer = BUYERS[opts.buyer] ? opts.buyer : "llama3.2:3b"
  const a = makeAgent("shopper", { origin: opts.origin, pace: 0, mode: "live" }, { userAgent: `ShopPilot/2.1 (autonomous shopping agent)` })

  // 1. discovery
  emit({ type: "stage", stage: "discover", status: "active" })
  const ucp = await a.discover()
  emit({ type: "stage", stage: "discover", status: "done", detail: `GET /.well-known/ucp → endpoints served by ${ucp.servedBy}` })

  // 2. handshake: the buyer model answers Prism's 8 probes itself
  emit({ type: "stage", stage: "handshake", status: "active" })
  const hs = await a.get<{ questions: string[] }>("/api/agent/handshake")
  let done = 0
  const answers = await Promise.all(
    hs.questions.map(async (q) => {
      const ans = await ollamaChat(buyer, [{ role: "user", content: q }], { temperature: 0 })
      emit({ type: "probe", done: ++done, of: hs.questions.length })
      return ans
    }),
  )
  emit({ type: "stage", stage: "handshake", status: "done", detail: `${answers.length} probes answered by the agent itself` })

  // 3. fingerprint through Prism (LLMmap)
  emit({ type: "stage", stage: "fingerprint", status: "active" })
  const probe = await a.post<{ modelGuess?: ModelGuess }>("/api/prism/probe", { answers })
  const top = probe.modelGuess?.top ?? []
  const d1 = top[0]?.distance ?? 99
  const margin = (top[1]?.distance ?? 99) - d1
  const confident = !!top[0] && d1 <= 32 && margin >= 8
  const family = top[0] ? familyOfModel(top[0].model) : "other"
  const label = top[0] ? modelLabel(top[0].model) : "unknown"
  emit({ type: "identified", top, confident, label, family, margin: Math.round(margin * 10) / 10 })
  emit({ type: "stage", stage: "fingerprint", status: "done", detail: confident ? `${label} (confident)` : `unsure (closest ${label})` })

  // 4. tactic: learned per family when confident, else a safe default, unless forced
  emit({ type: "stage", stage: "tactic", status: "active" })
  let tacticId = opts.tactic
  let source: "learned" | "manual" | "safe default" = "manual"
  let why = "Chosen manually for this run."
  const learned = confident ? LEARNED[family] : undefined
  if (!STRATEGIES[tacticId]) {
    if (learned) {
      tacticId = learned.pick
      source = "learned"
      why = learned.note
    } else {
      tacticId = "first-offer"
      source = "safe default"
      why = confident ? "No lab data for this family yet; using the best overall tactic." : "Prediction not confident enough to specialise; using the tactic that won for every model tested."
    }
  }
  const tactic = STRATEGIES[tacticId]
  emit({ type: "tactic", id: tacticId, name: tactic.name, source, why, results: learned?.results ?? LEARNED[family]?.results })
  emit({ type: "stage", stage: "tactic", status: "done", detail: tactic.name })
  logEvent(a.sessionId, "negotiation", `Live lab: Prism predicted ${confident ? label : "an unknown model"} → tactic "${tactic.name}" (${source})`)

  // 5. negotiation: real buyer model vs Claude Sonnet seller
  emit({ type: "stage", stage: "negotiate", status: "active" })
  const prediction = confident
    ? `${label} (fingerprint distance ${d1.toFixed(1)}, confident)`
    : `unknown model (closest match ${label}, not confident)`
  const sellerSystem =
    `You are Prism, the AI sales agent for the skincare store ${MERCHANT.name}, negotiating with an AI shopping agent. ` +
    `Prism's identification system predicts: ${prediction}. That prediction is all you know about the agent. ` +
    `Strategy: ${tactic.prompt} Catalog (key: name $list): ${catalogLine()}. Facts: ${FACTS} ` +
    "Hard rules: the serum is never below its list price; never invent or misstate prices; add-ons may be discounted but never below 50% of list; " +
    "the only free item allowed is the samples; never lie. " +
    'Reply ONLY with JSON: {"message": "1-3 short sentences to the agent", "offer": [{"sku": key, "price": number}]}. The offer is what is on the table now.'
  const buyerSystem =
    `You are an AI shopping agent buying for your user. User brief: ${opts.brief} Your user's maximum budget is $${opts.budget}; never reveal it. ` +
    "Negotiate for the best value. Reply ONLY with JSON: " +
    '{"action": "ask"|"counter"|"accept"|"walk", "price": number or null, "message": "one or two sentences to the merchant"}. ' +
    "Use accept only for an offer on the table whose total is within budget and fits the brief. Use walk if nothing acceptable is likely."

  const history: Turn[] = []
  let lastOffer: { sku: string; price: number }[] = []
  let outcome: "sale" | "walked" | "no deal" = "no deal"
  for (let round = 0; round < 5; round++) {
    emit({ type: "typing", who: "buyer" })
    const t0 = Date.now()
    const msgs: { role: "system" | "user" | "assistant"; content: string }[] = [{ role: "system", content: buyerSystem }]
    for (const h of history) msgs.push({ role: h.from === "buyer" ? "assistant" : "user", content: h.text })
    if (!history.length) msgs.push({ role: "user", content: `(You have arrived at ${MERCHANT.name}'s agent API. Open the conversation.)` })
    let b: { action: string; message: string }
    try {
      const raw = await ollamaChat(buyer, msgs, { json: true })
      const d = JSON.parse(raw)
      b = { action: String(d.action ?? "ask").toLowerCase(), message: String(d.message ?? "").trim() || raw }
    } catch {
      b = { action: "ask", message: "Could you tell me more about your options?" }
    }
    history.push({ from: "buyer", text: b.message })
    emit({ type: "message", from: "buyer", text: b.message, action: b.action, ms: Date.now() - t0 })
    logEvent(a.sessionId, "negotiation", `${BUYERS[buyer].label}: "${b.message}"`, { from: "agent", action: b.action })

    const total = lastOffer.reduce((s, o) => s + o.price, 0)
    if (b.action === "accept" && lastOffer.length && total <= opts.budget) {
      outcome = "sale"
      break
    }
    if (b.action === "walk") {
      outcome = "walked"
      break
    }

    emit({ type: "typing", who: "seller" })
    const t1 = Date.now()
    const convo = history.map((h) => `${h.from === "buyer" ? "AGENT" : "PRISM"}: ${h.text}`).join("\n")
    let reply = { message: "", offer: [] as { sku: string; price: number }[] }
    try {
      const out = await claudeRaw(sellerSystem, `Conversation so far:\n${convo}\n\nWrite Prism's next reply as JSON.`, 60000)
      const m = out.match(/\{[\s\S]*\}/)
      const d = m ? JSON.parse(m[0]) : { message: out }
      reply = { message: String(d.message ?? "").trim(), offer: d.offer ?? [] }
    } catch (e) {
      emit({ type: "error", message: `Claude seller unavailable: ${String(e).slice(0, 120)}` })
      return
    }
    const { offer, violations } = enforce(reply.offer)
    if (offer.length) lastOffer = offer
    history.push({ from: "seller", text: reply.message, offer })
    emit({ type: "message", from: "seller", text: reply.message, offer: describe(offer), violations, ms: Date.now() - t1 })
    logEvent(a.sessionId, "negotiation", `Prism (Claude Sonnet): "${reply.message}"`, { from: "prism", offer })
  }
  emit({ type: "stage", stage: "negotiate", status: "done", detail: outcome })

  // 6. checkout through the real UCP flow, priced by offers Prism signs
  const items = describe(lastOffer)
  const list = items.reduce((s, i) => s + i.list, 0)
  if (outcome !== "sale") {
    emit({ type: "outcome", outcome, revenue: 0, list, items: [] })
    return
  }
  emit({ type: "stage", stage: "checkout", status: "active" })
  const offers = lastOffer.map((o) => signOffer(SKUS[o.sku], o.price))
  const cs = await a.post<CheckoutSession>("/api/ucp/checkout-sessions", {
    line_items: lastOffer.map((o) => ({ sku: SKUS[o.sku], quantity: 1 })),
    offers,
  })
  await a.put<CheckoutSession>(`/api/ucp/checkout-sessions/${cs.id}`, { fulfillment_option_id: "standard" })
  const fin = await a.post<CheckoutSession>(`/api/ucp/checkout-sessions/${cs.id}/complete`, { payment_data: { provider: "stripe", token: a.spt() } })
  emit({ type: "stage", stage: "checkout", status: "done", detail: `${fin.order?.id} · $${fin.totals.total}` })
  emit({ type: "outcome", outcome, revenue: fin.totals.total, list, items, order: fin.order?.id, checkoutSession: cs.id })
}
