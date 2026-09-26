import { logEvent, store } from "@/lib/events"
import { sessionIdFor } from "@/lib/identify"
import { bad, body, json } from "@/lib/http"
import { verifyOffer } from "@/lib/sign"
import type { SignedOffer } from "@/lib/types"

// POST /api/agent/verify-offer { offer } → { valid, reasons }. Lets any agent check an offer really came from us.
export async function POST(req: Request) {
  const b = await body<{ offer: SignedOffer; seenAt?: string }>(req)
  if (!b.offer) return bad("offer required")
  const result = verifyOffer(b.offer as SignedOffer)
  // after a trace, Prism tells every agent that asks: this domain is a copycat
  const flagged = b.seenAt ? store().flaggedDomains.get(b.seenAt) : undefined
  if (flagged) result.reasons.unshift(`${b.seenAt} is flagged by Prism as a traced copycat (${flagged})`)
  result.valid = result.valid && !flagged
  logEvent(
    sessionIdFor(req),
    "verify",
    result.valid
      ? `Offer for ${b.offer.sku} at $${b.offer.price} verified as genuine`
      : `Offer for ${b.offer.sku} at $${b.offer.price}${b.seenAt ? ` seen on ${b.seenAt}` : ""} failed verification`,
    { offer: b.offer, ...result },
  )
  return json(result)
}
