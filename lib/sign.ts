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
    currency: "USD" as const,
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

// Web Bot Auth style (RFC 9421 HTTP Message Signatures): Signature-Agent + Signature-Input + Signature.
// Real agents sign with Ed25519 keys published at /.well-known/http-message-signatures-directory;
// the demo uses a shared-secret HMAC with the same header shapes.
export const AGENT_DIRECTORY: Record<string, string> = { "grok-shopper": "https://grok-shopper.agents.example" }

export function signAgentRequest(agentId: string, ts = Date.now(), tag = "agent-browser-auth") {
  const entry = AGENT_REGISTRY[agentId]
  if (!entry) throw new Error(`unknown agent ${agentId}`)
  const created = Math.floor(ts / 1000)
  const sig = Buffer.from(hmac(`${agentId}|${created}|${tag}`, entry.secret), "hex").toString("base64")
  return {
    "signature-agent": `"${AGENT_DIRECTORY[agentId]}"`,
    "signature-input": `sig1=("@authority" "signature-agent");created=${created};expires=${created + 300};keyid="${agentId}";alg="hmac-sha256";tag="${tag}"`,
    signature: `sig1=:${sig}:`,
  }
}

export function verifyAgentRequest(headers: Headers): { verified: boolean; agentId?: string; tag?: string; reason?: string } {
  const input = headers.get("signature-input")
  const sigHeader = headers.get("signature")
  if (!input || !sigHeader) return { verified: false, reason: "no Web Bot Auth signature" }
  const keyid = input.match(/keyid="([^"]+)"/)?.[1]
  const created = Number(input.match(/created=(\d+)/)?.[1])
  const tag = input.match(/tag="([^"]+)"/)?.[1] ?? ""
  const sig = sigHeader.match(/sig1=:([^:]+):/)?.[1]
  const entry = keyid ? AGENT_REGISTRY[keyid] : undefined
  if (!keyid || !entry) return { verified: false, reason: `unknown keyid ${keyid ?? "(none)"}` }
  if (!created || Math.abs(Date.now() / 1000 - created) > 300) return { verified: false, reason: "stale signature" }
  const expected = Buffer.from(hmac(`${keyid}|${created}|${tag}`, entry.secret), "hex").toString("base64")
  if (!sig || !safeEqual(expected, sig)) return { verified: false, reason: "bad signature" }
  return { verified: true, agentId: keyid, tag }
}
