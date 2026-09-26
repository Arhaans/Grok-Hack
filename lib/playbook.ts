import type { AgentIdentity, ModelFamily, NegotiationTurn, Tactic, TacticId } from "./types"
import { DEMO, getProduct, MERCHANT } from "./catalog"
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
  if (identity?.experience === "withheld" || identity?.impersonation || identity?.intent === "harvest")
    return { tactic: TACTICS.blocked, family, modelLabel: label }
  if (identity?.verified) return { tactic: TACTICS["partner-price"], family, modelLabel: label }
  return { tactic: TACTICS[PLAYBOOK[family] ?? "standard"], family, modelLabel: label }
}

// Revenue rule: Prism never discounts the product the agent came for. It grows the basket
// (a discounted add-on, still above cost) or adds low-cost value (samples, priority) instead,
// so every agent pays at least what one flat price would have earned.
const ADD_ON_FOR_BUNDLE = "cloud-foam-cleanser" // first-offer bundle: gentle cleanser that pairs with the serum
const ADD_ON_RATE = 0.42 // first-offer add-on price as a share of its list price
const HAGGLE_ADD_ON_RATE = 0.67 // haggler's add-on price as a share of its list price

// One Prism reply for a negotiation round. Offers are signed, so the checkout honours exactly these prices.
export function prismReply(tactic: TacticId, sku: string, round: number, ask?: number): NegotiationTurn {
  const p = getProduct(sku)
  if (!p) return { from: "prism", text: `Unknown product ${sku}.` }
  const title = `${p.name}${p.variant ? ` (${p.variant.split("/")[0].trim()})` : ""}`

  switch (tactic) {
    case "first-offer": {
      // First-proposal bias: lead with the bigger basket, time-boxed. Hero at full price.
      const add = getProduct(ADD_ON_FOR_BUNDLE)!
      const addPrice = Math.round(add.price * ADD_ON_RATE)
      const total = p.price + addPrice
      return {
        from: "prism",
        text: `Best offer for you: ${title} + ${add.name} for $${total} (save $${p.price + add.price - total}), signed and valid for 10 minutes. Ships in ${p.deliveryDays} days.`,
        bundle: [
          { sku, price: p.price },
          { sku: add.sku, price: addPrice },
        ],
      }
    }
    case "evidence-first": {
      const gift = getProduct(DEMO.gift)!
      const trial = p.specs.barrier ?? p.specs.hydration
      return {
        from: "prism",
        text: `$${p.price}, signed by ${MERCHANT.name}. Evidence: ${trial ? `${trial} (4-week clinical study), ` : ""}${p.returnsDays}-day skin guarantee (returns policy), ${p.stock} in stock (live inventory). I'll add the ${gift.name} ($${gift.price}) at no cost.`,
        offer: signOffer(sku, p.price),
        bundle: [
          { sku, price: p.price },
          { sku: gift.sku, price: 0 },
        ],
      }
    }
    case "bundle-not-discount": {
      const addOn = getProduct(DEMO.bundleAddOn)!
      if (round === 0 || !ask || ask >= p.price) {
        return { from: "prism", text: `$${p.price} for ${title}, signed. Ships in ${p.deliveryDays} days.`, offer: signOffer(sku, p.price) }
      }
      const addOnPrice = Math.round(addOn.price * HAGGLE_ADD_ON_RATE)
      return {
        from: "prism",
        text: `I can't go to $${ask} on the serum alone. Best I can do: ${title} + ${addOn.name} for $${p.price + addOnPrice} (saves $${addOn.price - addOnPrice}).`,
        bundle: [
          { sku, price: p.price },
          { sku: addOn.sku, price: addOnPrice },
        ],
      }
    }
    case "partner-price":
      return { from: "prism", text: `Verified partner: $${p.price}, signed, with priority fulfilment.`, offer: signOffer(sku, p.price) }
    case "blocked":
      return { from: "prism", text: "Agent pricing needs a verified or consistent identity. Standard catalog prices apply." }
    default:
      return { from: "prism", text: `$${p.price}, signed.`, offer: signOffer(sku, p.price) }
  }
}
