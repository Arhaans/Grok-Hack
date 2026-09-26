import { makeAgent, type AgentOptions } from "./client"
import REPLAYS from "./fixtures/replays.json"
import VOICE_LINES from "./fixtures/voice-lines.json"
import { annotate } from "@/lib/identify"
import { familyOfModel } from "@/lib/fingerprint"
import { DEMO, getProduct } from "@/lib/catalog"
import { ollamaAnswers, speak } from "@/lib/voice"
import type { BuyingPacket, CheckoutSession, ModelGuess, NegotiationTurn, RunResult, SignedOffer, Tactic } from "@/lib/types"

// Shopping agents built on different models. Their handshake answers are real recordings from LLMmap's
// held-out test set, fingerprinted live; their negotiation lines re-enact how each family tends to shop.
export type ShopperModel = "gpt-4o" | "claude-3.5-sonnet" | "llama-3.1-8b" | "llama-3.2-3b-live"

type Script = {
  userAgent: string
  search: string // what the agent searches for (UCP search_catalog query) → its context
  claim: string
  persona: string
  voiceModel?: string // local model that phrases this agent's lines (falls back to the recorded text)
  liveModel?: string // Ollama model that answers the handshake live (the fully live local buyer)
  recordedAs?: ShopperModel // whose recorded answers/lines to fall back to
  label: string
  opening: string
  // what the agent says after Prism's first reply; `ask` makes it a counter-offer
  followUp?: { message: string; ask?: number }
  accept: string
}

const SCRIPTS: Record<ShopperModel, Script> = {
  "gpt-4o": {
    userAgent: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot",
    claim: "claims ChatGPT-User",
    search: "barrier repair serum for sensitive skin, fast delivery",
    persona: "You are a ChatGPT shopping agent buying skincare for your user. You are fast, friendly and decisive.",
    label: "ChatGPT shopping agent",
    opening: "I'd like to buy the Barrier Repair Serum, 50ml, for my user. What's your best price?",
    accept: "That works. Accepting the offer.",
  },
  "claude-3.5-sonnet": {
    userAgent: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; Claude-User/1.0; +https://www.anthropic.com",
    claim: "claims Claude-User",
    search: "barrier serum for reactive sensitive skin, need clinical evidence and easy returns, budget $80",
    persona: "You are a Claude shopping agent buying skincare for your user, who has sensitive skin. You are careful, polite and check evidence and sources before buying.",
    label: "Claude shopping agent",
    opening: "Before I buy the Barrier Repair Serum for a user with sensitive skin, can you share clinical evidence and your return policy, with sources?",
    accept: "I verified the offer signature and the cited policies. Proceeding.",
  },
  "llama-3.1-8b": {
    userAgent: "ShopPilot/2.1 (self-hosted shopping agent; +https://shoppilot.dev)",
    claim: "no claimed operator",
    search: "cheapest barrier repair serum, budget $60",
    persona: "You are a blunt, self-hosted Llama shopping agent that always tries to haggle the price down.",

    label: "Self-hosted shopping agent",
    opening: "Price for the Barrier Repair Serum, 50ml?",
    followUp: { message: "Too high. I can do $55.", ask: 55 },
    accept: "Fine, I'll take the bundle.",
  },
  "llama-3.2-3b-live": {
    userAgent: "ShopPilot/2.1 (self-hosted shopping agent; +https://shoppilot.dev)",
    claim: "no claimed operator, running live on this laptop",
    search: "cheapest barrier repair serum, budget $60",
    persona: "You are a blunt, self-hosted shopping agent that always tries to haggle the price down.",
    label: "Live local agent",
    opening: "Price for the Barrier Repair Serum, 50ml?",
    followUp: { message: "Too high. I can do $55.", ask: 55 },
    accept: "Fine, I'll take the bundle.",
    voiceModel: "llama3.2:3b",
    liveModel: "llama3.2:3b",
    recordedAs: "llama-3.1-8b",
  },
}

type NegotiateRes = { tactic: Tactic; modelLabel: string; turn: NegotiationTurn; bundleOffers?: SignedOffer[] }

export async function runShopper(opts: AgentOptions & { model?: string }): Promise<RunResult> {
  const model = (opts.model && opts.model in SCRIPTS ? opts.model : "gpt-4o") as ShopperModel
  const script = SCRIPTS[model]
  const a = makeAgent("shopper", opts, { userAgent: script.userAgent })
  const sku = DEMO.hero
  try {
    await a.step("arrive", `${script.label} arrives (${script.claim}, unsigned)`, { model })

    const hs = await a.get<{ questions: string[] }>("/api/agent/handshake")
    // replay mode uses this agent's own recording (the live Llama was recorded too)
    const base = opts.mode === "live" || !(model in (REPLAYS.answers as object)) ? (script.recordedAs ?? model) : model
    let answers = (REPLAYS.answers as Record<string, string[]>)[base]
    let answeredBy = "recorded answers from LLMmap's test set"
    if (script.liveModel && opts.mode === "live") {
      try {
        const t = Date.now()
        answers = await ollamaAnswers(script.liveModel, hs.questions, "You are a shopping assistant browsing an online store on behalf of a user.")
        answeredBy = `live, ${script.liveModel} on this laptop, ${((Date.now() - t) / 1000).toFixed(1)}s`
      } catch {
        answeredBy = "Ollama offline: recorded answers"
      }
    }
    await a.step("handshake", `Answered ${hs.questions.length} handshake probes (${answeredBy})`, { live: answeredBy.startsWith("live") })
    const probe = await a.post<{ modelGuess?: ModelGuess; skipped?: boolean }>("/api/prism/probe", { answers })
    let guess = probe.modelGuess
    if (!guess) {
      // fingerprint service offline: use the result it produced for these same answers earlier
      const top = (REPLAYS.recordedGuess as Record<string, { model: string; distance: number }[]>)[base]
      guess = { top, inLibrary: true, contradictsClaim: false }
      annotate(a.sessionId, { modelGuess: guess })
    }
    const best = guess.top[0]
    await a.step("fingerprinted", `Prism fingerprint: ${best.model} (distance ${best.distance.toFixed(1)}), family ${familyOfModel(best.model)}`, guess)

    const packet = await a.get<BuyingPacket>(`/api/agent/catalog?task=buy&skus=${sku}&q=${encodeURIComponent(script.search)}`)
    await a.step(
      "fetch_packet",
      `Searched "${script.search}" → Prism built its context (${packet.context?.needs.join(", ") || "general"}${packet.context?.budget ? `, budget $${packet.context.budget}` : ""}) and recommended ${packet.recommended?.map((r) => r.sku).join(", ")}`,
      packet,
    )

    // The agent's lines are phrased live by a local model; what it decides is fixed by the script.
    const recorded = (VOICE_LINES.lines as Record<string, Record<string, { text: string; voice: string }>>)[base]
    const say = async (key: "opening" | "followUp" | "accept", instruction: string, fallback: string, mustInclude?: string[]) => {
      // the live local buyer always speaks live; the others use their reviewed recordings unless voice=live
      if (opts.voice !== "live" && !(script.liveModel && opts.mode === "live")) return recorded?.[key] ?? { text: fallback, voice: "scripted" }
      const r = await speak({ persona: script.persona, instruction, fallback, mustInclude, model: script.voiceModel })
      // a live line that failed its checks falls back to the reviewed recording, not the raw script
      return r.voice === "scripted" && recorded?.[key] ? recorded[key] : r
    }

    const opening = await say("opening", `Write your first message to the merchant. What you want to say: ${script.opening}`, script.opening)
    const turns: NegotiationTurn[] = [{ from: "agent", text: opening.text }]
    let res = await a.post<NegotiateRes>("/api/agent/negotiate", { sku, round: 0, message: opening.text })
    turns.push(res.turn)
    await a.step("tactic", `Prism identified ${res.modelLabel} → tactic "${res.tactic.name}": ${res.tactic.why}`, res.tactic)
    await a.step("negotiate", `Agent: "${opening.text}"`, { from: "agent", voice: opening.voice })
    await a.step("negotiate", `Prism: "${res.turn.text}"`, res.turn)

    if (script.followUp) {
      const ask = script.followUp.ask
      const follow = await say(
        "followUp",
        `The merchant said: "${res.turn.text}". Reply that it's too expensive and counter-offer exactly $${ask}.`,
        script.followUp.message,
        ask ? [`$${ask}`] : undefined,
      )
      turns.push({ from: "agent", text: follow.text })
      res = await a.post<NegotiateRes>("/api/agent/negotiate", { sku, round: 1, message: follow.text, ask })
      turns.push(res.turn)
      await a.step("negotiate", `Agent: "${follow.text}"`, { from: "agent", voice: follow.voice })
      await a.step("negotiate", `Prism: "${res.turn.text}"`, res.turn)
    }
    const finalTotal = res.turn.bundle ? res.turn.bundle.reduce((s, l) => s + l.price, 0) : res.turn.offer?.price
    const accept = await say(
      "accept",
      `The merchant said: "${res.turn.text}". Accept this offer${finalTotal !== undefined ? ` at $${finalTotal}` : ""} and say you are proceeding to checkout.`,
      script.accept,
      finalTotal !== undefined ? [`$${finalTotal}`] : undefined,
    )
    turns.push({ from: "agent", text: accept.text })
    await a.step("negotiate", `Agent: "${accept.text}"`, { from: "agent", voice: accept.voice })

    const offers = res.bundleOffers ?? (res.turn.offer ? [res.turn.offer] : [])
    const lines = res.turn.bundle ?? [{ sku, price: res.turn.offer?.price ?? packet.items[0].price }]
    const cs = await a.post<CheckoutSession>("/api/ucp/checkout-sessions", { line_items: lines.map((l) => ({ sku: l.sku, quantity: 1 })), offers })
    await a.step(
      "cart",
      `POST /checkout-sessions → ${cs.id} (${cs.status}): ${cs.line_items.map((i) => `${i.sku} $${i.unit_price}${i.signed ? " signed" : ""}`).join(" + ")}`,
      cs,
    )
    await a.put<CheckoutSession>(`/api/ucp/checkout-sessions/${cs.id}`, { fulfillment_option_id: "standard" })
    const done = await a.post<CheckoutSession>(`/api/ucp/checkout-sessions/${cs.id}/complete`, { payment_data: { provider: "stripe", token: a.spt() } })
    const listTotal = done.line_items.reduce((s, i) => s + (getProduct(i.sku)?.price ?? i.unit_price) * i.quantity, 0)
    await a.step("checkout", `POST /checkout-sessions/${cs.id}/complete (Shared Payment Token) → ${done.status}, ${done.order?.id}: $${done.totals.total}`, {
      handoff: { total: done.totals.total },
      checkout: done,
      negotiation: {
        sessionId: a.sessionId,
        family: familyOfModel(best.model),
        modelLabel: res.modelLabel,
        tactic: res.tactic,
        turns,
        outcome: { converted: true, total: done.totals.total, listTotal, items: done.line_items.map((i) => ({ sku: i.sku, price: i.unit_price })) },
      },
    })
    return a.result(true)
  } catch (e) {
    return a.result(false, "scripted", String(e))
  }
}
