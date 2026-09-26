import { createHmac, timingSafeEqual } from "node:crypto"
import type { SignedOffer } from "./types"
import { MERCHANT } from "./catalog"

// Stand-in for Web Bot Auth / public-key signatures: shared-secret HMAC is enough for the demo.
const SECRET = process.env.PRISM_SIGNING_SECRET || "prism-dev-secret"

export function hmac(payload: string, secret = SECRET) {
  return createHmac("sha256", secret).update(payload).digest("hex")
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  return ab.length === bb.length && timingSafeEqual(ab, bb)
}

// ---------- Merchant offers ----------

function offerPayload(o: Omit<SignedOffer, "signature">) {
  return [o.sku, o.price.toFixed(2), o.currency, o.merchant, o.checkoutDomain, o.expires].join("|")
}

export function signOffer(sku: string, price: number): SignedOffer {
  const base = {
    sku,
    price,
    currency: "GBP" as const,
    merchant: MERCHANT.id,
    checkoutDomain: MERCHANT.checkoutDomain,
    expires: Date.now() + 60 * 60 * 1000,
  }
  return { ...base, signature: hmac(offerPayload(base)) }
}

export function verifyOffer(o: SignedOffer): { valid: boolean; reasons: string[] } {
  const reasons: string[] = []
  if (!o || typeof o.signature !== "string") return { valid: false, reasons: ["no signature"] }
  const { signature, ...base } = o
  if (!safeEqual(hmac(offerPayload(base)), signature)) reasons.push("signature does not match offer contents")
  if (o.merchant !== MERCHANT.id) reasons.push(`merchant is "${o.merchant}", not ${MERCHANT.id}`)
  if (o.checkoutDomain !== MERCHANT.checkoutDomain)
    reasons.push(`checkout domain ${o.checkoutDomain} is not ${MERCHANT.checkoutDomain}`)
  if (o.expires < Date.now()) reasons.push("offer expired")
  return { valid: reasons.length === 0, reasons }
}

// ---------- Agent request signatures ----------
// Agents that cooperate sign "<agentId>|<timestamp>" with a key registered with Prism.

export const AGENT_REGISTRY: Record<string, { name: string; secret: string; userAgentMatch: RegExp }> = {
  "grok-shopper": {
    name: "Grok Shopper",
    secret: process.env.GROK_AGENT_SECRET || "grok-shopper-dev-key",
    userAgentMatch: /GrokShopper/i,
  },
}

// Agents whose real operators sign their traffic, so an unsigned request claiming to be them is suspicious.
export const SIGNING_OPERATORS: { match: RegExp; family: string; label: string }[] = [
  { match: /ChatGPT-User|ChatGPT-Agent|OAI-SearchBot|GPTBot/i, family: "openai", label: "ChatGPT" },
  { match: /Claude-User|ClaudeBot/i, family: "anthropic", label: "Claude" },
  { match: /Perplexity-User|PerplexityBot/i, family: "perplexity", label: "Perplexity" },
  { match: /GrokShopper/i, family: "xai", label: "Grok Shopper" },
]

export function signAgentRequest(agentId: string, ts = Date.now()) {
  const entry = AGENT_REGISTRY[agentId]
  if (!entry) throw new Error(`unknown agent ${agentId}`)
  return {
    "signature-agent": agentId,
    "x-prism-agent-ts": String(ts),
    "x-prism-agent-signature": hmac(`${agentId}|${ts}`, entry.secret),
  }
}

export function verifyAgentRequest(headers: Headers): { verified: boolean; agentId?: string; reason?: string } {
  const agentId = headers.get("signature-agent")
  const ts = headers.get("x-prism-agent-ts")
  const sig = headers.get("x-prism-agent-signature")
  if (!agentId || !ts || !sig) return { verified: false, reason: "no signature headers" }
  const entry = AGENT_REGISTRY[agentId]
  if (!entry) return { verified: false, reason: `unknown signer ${agentId}` }
  if (Math.abs(Date.now() - Number(ts)) > 5 * 60 * 1000) return { verified: false, reason: "stale signature" }
  if (!safeEqual(hmac(`${agentId}|${ts}`, entry.secret), sig)) return { verified: false, reason: "bad signature" }
  return { verified: true, agentId }
}
