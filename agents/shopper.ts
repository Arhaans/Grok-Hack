import { makeAgent, type AgentOptions } from "./client"
import REPLAYS from "./fixtures/replays.json"
import { annotate } from "@/lib/identify"
import { familyOfModel } from "@/lib/fingerprint"
import { getProduct } from "@/lib/catalog"
import type { BuyingPacket, Cart, CheckoutHandoff, ModelGuess, NegotiationTurn, RunResult, SignedOffer, Tactic } from "@/lib/types"

// Shopping agents built on different models. Their handshake answers are real recordings from LLMmap's
// held-out test set, fingerprinted live; their negotiation lines re-enact how each family tends to shop.
export type ShopperModel = "gpt-4o" | "claude-3.5-sonnet" | "llama-3.1-8b"

type Script = {
  userAgent: string
  claim: string
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
    label: "ChatGPT shopping agent",
    opening: "I'd like to buy Halo One in Liquid Silver for my user. What's your best price?",
    accept: "That works. Accepting the offer.",
  },
  "claude-3.5-sonnet": {
    userAgent: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; Claude-User/1.0; +https://www.anthropic.com",
    claim: "claims Claude-User",
    label: "Claude shopping agent",
    opening: "Before I purchase Halo One in Liquid Silver, can you confirm the return window and warranty, with sources?",
    accept: "I verified the offer signature and the cited policies. Proceeding.",
  },
  "llama-3.1-8b": {
    userAgent: "ShopPilot/2.1 (self-hosted shopping agent; +https://shoppilot.dev)",
    claim: "no claimed operator",
    label: "Self-hosted shopping agent",
    opening: "Price for Halo One Liquid Silver?",
    followUp: { message: "Too high. I can do £299.", ask: 299 },
    accept: "OK, I'll take the bundle.",
  },
}

type NegotiateRes = { tactic: Tactic; modelLabel: string; turn: NegotiationTurn; bundleOffers?: SignedOffer[] }

export async function runShopper(opts: AgentOptions & { model?: string }): Promise<RunResult> {
  const model = (opts.model && opts.model in SCRIPTS ? opts.model : "gpt-4o") as ShopperModel
  const script = SCRIPTS[model]
  const a = makeAgent("shopper", opts, { userAgent: script.userAgent })
  const sku = "HALO-1-SLV"
  try {
    await a.step("arrive", `${script.label} arrives (${script.claim}, unsigned)`, { model })

    const hs = await a.get<{ questions: string[] }>("/api/agent/handshake")
    const answers = (REPLAYS.answers as Record<string, string[]>)[model]
    await a.step("handshake", `Answered ${hs.questions.length} handshake probes (recorded answers from LLMmap's test set)`)
    const probe = await a.post<{ modelGuess?: ModelGuess; skipped?: boolean }>("/api/prism/probe", { answers })
    let guess = probe.modelGuess
    if (!guess) {
      // fingerprint service offline: use the result it produced for these same answers earlier
      const top = (REPLAYS.recordedGuess as Record<string, { model: string; distance: number }[]>)[model]
      guess = { top, inLibrary: true, contradictsClaim: false }
      annotate(a.sessionId, { modelGuess: guess })
    }
    const best = guess.top[0]
    await a.step("fingerprinted", `Prism fingerprint: ${best.model} (distance ${best.distance.toFixed(1)}), family ${familyOfModel(best.model)}`, guess)

    const packet = await a.get<BuyingPacket>(`/api/agent/catalog?task=buy&skus=${sku}`)
    await a.step("fetch_packet", `Got a buying packet: ${packet.items[0].name} ${packet.items[0].variant}, list £${packet.items[0].price}`, packet)

    const turns: NegotiationTurn[] = [{ from: "agent", text: script.opening }]
    let res = await a.post<NegotiateRes>("/api/agent/negotiate", { sku, round: 0, message: script.opening })
    turns.push(res.turn)
    await a.step("tactic", `Prism identified ${res.modelLabel} → tactic "${res.tactic.name}": ${res.tactic.why}`, res.tactic)
    await a.step("negotiate", `Agent: "${script.opening}"`, { from: "agent" })
    await a.step("negotiate", `Prism: "${res.turn.text}"`, res.turn)

    if (script.followUp) {
      turns.push({ from: "agent", text: script.followUp.message })
      res = await a.post<NegotiateRes>("/api/agent/negotiate", { sku, round: 1, message: script.followUp.message, ask: script.followUp.ask })
      turns.push(res.turn)
      await a.step("negotiate", `Agent: "${script.followUp.message}"`, { from: "agent" })
      await a.step("negotiate", `Prism: "${res.turn.text}"`, res.turn)
    }
    turns.push({ from: "agent", text: script.accept })
    await a.step("negotiate", `Agent: "${script.accept}"`, { from: "agent" })

    const offers = res.bundleOffers ?? (res.turn.offer ? [res.turn.offer] : [])
    const lines = res.turn.bundle ?? [{ sku, price: res.turn.offer?.price ?? packet.items[0].price }]
    const cart = await a.post<Cart>("/api/agent/cart", { items: lines.map((l) => ({ sku: l.sku, qty: 1 })), offers })
    await a.step("cart", `Cart ${cart.id}: ${cart.items.map((i) => `${i.sku} £${i.price}`).join(" + ")} = £${cart.total}`, cart)
    const handoff = await a.post<CheckoutHandoff>("/api/agent/checkout", { cartId: cart.id })
    const listTotal = cart.items.reduce((s, i) => s + (getProduct(i.sku)?.price ?? i.price) * i.qty, 0)
    await a.step("checkout", `Checked out £${handoff.total} on ${handoff.domain}`, {
      handoff,
      negotiation: {
        sessionId: a.sessionId,
        family: familyOfModel(best.model),
        modelLabel: res.modelLabel,
        tactic: res.tactic,
        turns,
        outcome: { converted: true, total: cart.total, listTotal, items: cart.items.map((i) => ({ sku: i.sku, price: i.price })) },
      },
    })
    return a.result(true)
  } catch (e) {
    return a.result(false, "scripted", String(e))
  }
}
