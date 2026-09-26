import type { AgentIdentity, ModelFamily, NegotiationTurn, Tactic, TacticId } from "./types"
import { getProduct } from "./catalog"
import { signOffer } from "./sign"
import { familyOfModel, modelLabel } from "./fingerprint"

// Prism's negotiation playbook: which tactic to use once it knows the model family.
// Grounded in: all tested models show strong first-proposal bias (Magentic Marketplace, arXiv:2510.25779);
// different agents get significantly different outcomes (arXiv:2506.00073); tactics shift payoffs ~20% (arXiv:2402.05863).
// The per-family choice is what Prism learns from outcomes (see Learn → byModel), not a published result.
export const TACTICS: Record<TacticId, Tactic> = {
  "first-offer": {
    id: "first-offer",
    name: "First offer wins",
    why: "This family tends to accept the first solid proposal, so lead with one clean, signed, time-boxed price.",
  },
  "evidence-first": {
    id: "evidence-first",
    name: "Evidence first",
    why: "This family checks claims before buying, so lead with signed offers and sourced policies, and add value instead of discounting.",
  },
  "bundle-not-discount": {
    id: "bundle-not-discount",
    name: "Bundle, don't discount",
    why: "This family haggles on price, so protect the headline price and win the deal with a bundle.",
  },
  "partner-price": {
    id: "partner-price",
    name: "Verified partner price",
    why: "Signed agent from a registered operator: give the partner price straight away.",
  },
  blocked: {
    id: "blocked",
    name: "No negotiation",
    why: "Identity contradicted or scraping behaviour: standard catalog only, no agent pricing.",
  },
  standard: {
    id: "standard",
    name: "Standard offer",
    why: "Unknown model: list price with a signed offer.",
  },
}

const PLAYBOOK: Partial<Record<ModelFamily, TacticId>> = {
  openai: "first-offer",
  anthropic: "evidence-first",
  meta: "bundle-not-discount",
}

export function pickTactic(identity: AgentIdentity | undefined): { tactic: Tactic; family: ModelFamily; modelLabel: string } {
  const best = identity?.modelGuess?.inLibrary ? identity.modelGuess.top[0] : undefined
  const family = best ? familyOfModel(best.model) : identity?.verifiedAs === "grok-shopper" ? "xai" : "other"
  const label = best ? modelLabel(best.model) : identity?.verified ? identity.verifiedAs ?? "verified agent" : "unknown model"
  if (identity?.impersonation || identity?.intent === "harvest") return { tactic: TACTICS.blocked, family, modelLabel: label }
  if (identity?.verified) return { tactic: TACTICS["partner-price"], family, modelLabel: label }
  return { tactic: TACTICS[PLAYBOOK[family] ?? "standard"], family, modelLabel: label }
}

// Never go below this share of list price.
const FLOOR = 0.9

// One Prism reply for a negotiation round. Offers are signed, so the cart honours exactly these prices.
export function prismReply(tactic: TacticId, sku: string, round: number, ask?: number): NegotiationTurn {
  const p = getProduct(sku)
  if (!p) return { from: "prism", text: `Unknown product ${sku}.` }
  const floor = Math.ceil(p.price * FLOOR)
  const agentPrice = Math.max(floor, p.price - 10)

  switch (tactic) {
    case "first-offer":
      return {
        from: "prism",
        text: `Agent price for ${p.name} ${p.variant ?? ""}: £${agentPrice} (list £${p.price}), signed and valid for 10 minutes. Ships in ${p.deliveryDays} days.`,
        offer: signOffer(sku, agentPrice),
      }
    case "evidence-first": {
      const kase = getProduct("HALO-CASE")!
      return {
        from: "prism",
        text: `£${p.price}, signed by Halo Audio. Sources: ${p.returnsDays}-day free returns (returns policy), ${p.warrantyMonths / 12}-year warranty (warranty policy), ${p.stock} in stock (live inventory). I'll include the ${kase.name} (£${kase.price}) at no cost.`,
        offer: signOffer(sku, p.price),
        bundle: [
          { sku, price: p.price },
          { sku: kase.sku, price: 0 },
        ],
      }
    }
    case "bundle-not-discount": {
      const stand = getProduct("HALO-STAND")!
      if (round === 0 || !ask || ask >= agentPrice) {
        return { from: "prism", text: `£${p.price} for ${p.name} ${p.variant ?? ""}, signed. Free delivery in ${p.deliveryDays} days.`, offer: signOffer(sku, p.price) }
      }
      const standPrice = stand.price - 29
      return {
        from: "prism",
        text: `I can't go to £${ask} on the headphones alone. Best I can do: ${p.name} + ${stand.name} for £${agentPrice + standPrice} (saves £${p.price + stand.price - agentPrice - standPrice}).`,
        bundle: [
          { sku, price: agentPrice },
          { sku: stand.sku, price: standPrice },
        ],
      }
    }
    case "partner-price":
      return { from: "prism", text: `Verified partner price: £${agentPrice}, signed.`, offer: signOffer(sku, agentPrice) }
    case "blocked":
      return { from: "prism", text: "Agent pricing needs a verified or consistent identity. Standard catalog prices apply." }
    default:
      return { from: "prism", text: `£${p.price}, signed.`, offer: signOffer(sku, p.price) }
  }
}
