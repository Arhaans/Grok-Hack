import { createHash } from "node:crypto"
import type { AgentIdentity, AgentIntent, ModelGuess } from "./types"
import { CATALOG } from "./catalog"
import { SIGNING_OPERATORS, verifyAgentRequest } from "./sign"
import { logEvent, store, type SessionTrace } from "./events"

export type Observation = {
  path: string
  skus?: string[]
  format?: string
  topic?: string
  quiet?: boolean // don't log a "request" event (caller logs something more specific)
}

export function sessionIdFor(req: Request) {
  const explicit = req.headers.get("x-prism-session")
  if (explicit) return explicit.slice(0, 64)
  const ua = req.headers.get("user-agent") || ""
  const ip = (req.headers.get("x-forwarded-for") || "local").split(",")[0].trim()
  return "s_" + createHash("sha256").update(ua + "|" + ip).digest("hex").slice(0, 10)
}

function claimedFrom(ua: string): string | null {
  const op = SIGNING_OPERATORS.find((o) => o.match.test(ua))
  if (op) return ua.match(op.match)?.[0] ?? op.label
  if (!ua) return null
  if (/Mozilla\//.test(ua) && !/bot|agent|crawler|spider/i.test(ua)) return "Browser"
  return ua.split(/[\/\s]/)[0] || null
}

// Record a request against its session and recompute the identity.
export function observe(req: Request, obs: Observation) {
  const s = store()
  const sessionId = sessionIdFor(req)
  const now = Date.now()
  const ua = req.headers.get("user-agent") || ""
  let t = s.sessions.get(sessionId)
  if (!t) {
    t = {
      sessionId,
      userAgent: ua,
      firstSeen: now,
      lastSeen: now,
      requestTimes: [],
      skusSeen: new Set(),
      paths: new Set(),
      topics: new Set(),
      formats: new Set(),
      servedDescriptions: new Map(),
    }
    s.sessions.set(sessionId, t)
  }
  t.lastSeen = now
  t.requestTimes.push(now)
  t.paths.add(obs.path)
  obs.skus?.forEach((k) => t!.skusSeen.add(k))
  if (obs.format) t.formats.add(obs.format)
  if (obs.topic) t.topics.add(obs.topic)

  const sig = verifyAgentRequest(req.headers)
  if (sig.verified) t.verifiedAs = sig.agentId
  else if (!t.verifiedAs) t.signatureReason = sig.reason

  const identity = computeIdentity(t)
  if (!obs.quiet) {
    logEvent(sessionId, "request", `${identity.claimed ?? "Unknown agent"} → ${obs.path}`, {
      path: obs.path,
      skus: obs.skus,
      intent: identity.intent,
    })
  }
  return { sessionId, trace: t, identity }
}

export function computeIdentity(t: SessionTrace): AgentIdentity {
  const claimed = claimedFrom(t.userAgent)
  const verified = !!t.verifiedAs
  const evidence: string[] = []
  const op = SIGNING_OPERATORS.find((o) => o.match.test(t.userAgent))

  if (verified) evidence.push(`Valid Web Bot Auth signature (keyid "${t.verifiedAs}")`)
  else if (op) evidence.push(`Claims to be ${op.label}, unverified (no signature)`)
  else evidence.push("No agent signature")

  // behaviour
  const coverage = t.skusSeen.size / CATALOG.length
  const times = t.requestTimes
  const spanS = times.length > 1 ? (times[times.length - 1] - times[0]) / 1000 : 0
  // densest 3-second window
  let peak = 0
  for (let i = 0, j = 0; j < times.length; j++) {
    while (times[j] - times[i] > 3000) i++
    peak = Math.max(peak, j - i + 1)
  }
  const burst = peak >= 5
  const hasCart = t.paths.has("/api/agent/cart")
  const hasCheckout = t.paths.has("/api/agent/checkout")

  if (t.skusSeen.size > 0)
    evidence.push(`Viewed ${t.skusSeen.size}/${CATALOG.length} products in ${times.length} requests over ${spanS.toFixed(1)}s`)
  if (t.topics.size) evidence.push(`Asked about ${[...t.topics].join(", ")}`)
  if (t.formats.has("matrix")) evidence.push("Requested a comparison matrix")
  if (t.formats.has("packet")) evidence.push("Requested a buying packet")
  if (hasCheckout) evidence.push("Reached checkout")
  else if (hasCart) evidence.push("Built a cart")

  let intent: AgentIntent = "unknown"
  let confidence = 0.3
  const harvestScore = coverage >= 0.8 && !hasCart ? 0.5 + 0.3 * coverage + (burst ? 0.15 : 0) : 0
  if (harvestScore > 0 && (burst || t.formats.has("full"))) {
    intent = "harvest"
    confidence = Math.min(0.95, harvestScore + (t.modelGuess?.contradictsClaim ? 0.05 : 0))
    evidence.push(burst ? `Burst of ${peak} requests in under 3s across the whole catalog, no cart` : "Pulled the full catalog, no cart")
  } else if (hasCart || hasCheckout) {
    intent = "buy"
    confidence = hasCheckout ? 0.95 : 0.9
  } else if (t.formats.has("matrix")) {
    intent = "research"
    confidence = 0.75
  } else if (t.formats.has("packet")) {
    intent = "buy"
    confidence = 0.65 + (t.topics.size ? 0.1 : 0)
  }

  if (t.copiedTo) evidence.push(`Content served to this session was found on ${t.copiedTo}`)

  const modelGuess = t.modelGuess
  if (modelGuess) {
    const best = modelGuess.top[0]
    if (!modelGuess.inLibrary) evidence.push("Model fingerprint: no close match in the known-model library")
    else if (modelGuess.contradictsClaim)
      evidence.push(`Model fingerprint contradicts the claim: answers closest to ${best.model} (distance ${best.distance.toFixed(1)})`)
    else evidence.push(`Model fingerprint consistent with claim: closest to ${best.model} (distance ${best.distance.toFixed(1)})`)
  }

  // Scores (0–100) used by the experience rule and shown in the UI.
  const consistent = !!modelGuess?.inLibrary && !modelGuess.contradictsClaim
  const impersonating = !verified && !!op && !!modelGuess?.contradictsClaim
  const trust = verified ? 96 : impersonating ? 4 : consistent ? 72 : op ? 35 : 45
  const lead =
    intent === "buy"
      ? Math.min(100, 55 + (t.topics.size ? 10 : 0) + (t.paths.has("/api/agent/negotiate") ? 5 : 0) + (hasCart ? 15 : 0) + (hasCheckout ? 15 : 0) + (verified ? 5 : 0))
      : intent === "research" ? 40 : intent === "harvest" ? 3 : 20
  const risk = Math.min(
    100,
    (intent === "harvest" ? 55 + Math.round(15 * coverage) : 5) + (impersonating ? 25 : 0) + (t.copiedTo ? 25 : 0) + (!verified && !consistent ? 10 : 0),
  )
  const experience: AgentIdentity["experience"] =
    risk > 70 ? "withheld" : trust > 90 && lead > 80 ? "private-offer" : consistent && intent === "buy" ? "negotiated" : "public"

  const identity: AgentIdentity = {
    sessionId: t.sessionId,
    claimed,
    verified,
    verifiedAs: t.verifiedAs,
    intent,
    confidence: Math.round(confidence * 100) / 100,
    evidence,
    // impersonation needs evidence against the claim, not just a missing signature
    impersonation: impersonating,
    modelGuess,
    scores: { trust, lead, risk },
    experience,
    firstSeen: t.firstSeen,
    lastSeen: t.lastSeen,
    requests: times.length,
  }
  t.identity = identity
  return identity
}

// Add facts to a session after the fact (chosen format, probe result, ...) and recompute.
export function annotate(
  sessionId: string,
  patch: { format?: string; topic?: string; path?: string; modelGuess?: ModelGuess },
) {
  const t = store().sessions.get(sessionId)
  if (!t) return undefined
  if (patch.format) t.formats.add(patch.format)
  if (patch.topic) t.topics.add(patch.topic)
  if (patch.path) t.paths.add(patch.path)
  if (patch.modelGuess) t.modelGuess = patch.modelGuess
  return computeIdentity(t)
}
