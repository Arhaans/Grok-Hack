import { randomUUID } from "node:crypto"
import { CATALOG, getProduct } from "./catalog"
import { logEvent, store } from "./events"
import { computeIdentity } from "./identify"
import { findZeroWidthMarkers, matchByPhrase, stripMarkers } from "./watermark"
import type { CloneStore, Incident } from "./types"

async function fetchText(url: string) {
  try {
    const r = await fetch(url, { cache: "no-store", headers: { "user-agent": "PrismMonitor/1.0" } })
    return r.ok ? await r.text() : ""
  } catch {
    return ""
  }
}

function diff(clone: CloneStore): Incident["changedFields"] {
  const out: Incident["changedFields"] = []
  for (const cp of clone.products) {
    const ours = getProduct(cp.sku)
    if (!ours) continue
    if (cp.price !== ours.price) out.push({ sku: cp.sku, field: "price", ours: `£${ours.price}`, theirs: `£${cp.price}` })
    if (cp.returnsDays !== ours.returnsDays)
      out.push({ sku: cp.sku, field: "returns", ours: `${ours.returnsDays} days`, theirs: cp.returnsDays ? `${cp.returnsDays} days` : "No returns" })
    if (cp.deliveryDays !== ours.deliveryDays)
      out.push({ sku: cp.sku, field: "delivery", ours: `${ours.deliveryDays} days`, theirs: `${cp.deliveryDays} days` })
  }
  return out
}

// Scan a suspected clone. Looks at the rendered page first, then the clone's data feed.
export async function scanClone(origin: string, url?: string): Promise<Incident | null> {
  const s = store()
  const clone = s.clone
  const cloneUrl = url || `${origin}/clone`
  const page = await fetchText(cloneUrl)
  const feed = clone ? JSON.stringify(clone) : await fetchText(`${origin}/api/clone`)
  const text = page + "\n" + feed

  logEvent("prism", "scan", `Prism monitor scanned ${clone?.domain ?? cloneUrl}`, { cloneUrl })

  let sourceSessionId: string | undefined
  let markerFound = ""
  let matchedBy: Incident["matchedBy"] = "zero-width"
  let copiedSnippet = ""

  const zw = findZeroWidthMarkers(text).find((m) => m.sessionId)
  if (zw) {
    sourceSessionId = zw.sessionId
    markerFound = zw.markerId
    const hit = clone?.products.find((p) => findZeroWidthMarkers(p.description).some((m) => m.markerId === zw.markerId))
    copiedSnippet = stripMarkers(hit?.description ?? "")
  } else if (clone) {
    for (const p of clone.products) {
      const hits = matchByPhrase(p.description)
      if (hits.length) {
        sourceSessionId = hits[hits.length - 1]
        markerFound = "phrase variant"
        matchedBy = "phrase"
        copiedSnippet = stripMarkers(p.description)
        break
      }
    }
  }

  if (!sourceSessionId) {
    logEvent("prism", "scan", `No Prism markers found on ${clone?.domain ?? cloneUrl}`)
    return null
  }

  const src = s.sessions.get(sourceSessionId)
  if (src) {
    src.copiedTo = clone?.domain ?? new URL(cloneUrl).host
    computeIdentity(src)
  }

  const incident: Incident = {
    id: "inc_" + randomUUID().slice(0, 8),
    ts: Date.now(),
    cloneUrl: clone ? `https://${clone.domain}` : cloneUrl,
    markerFound,
    matchedBy,
    sourceSessionId,
    sourceClaimed: src?.identity?.claimed ?? null,
    changedFields: clone ? diff(clone) : [],
    badCheckoutDomain: clone?.checkoutDomain ?? "unknown",
    copiedSnippet,
  }
  s.incidents = s.incidents.filter((i) => !(i.cloneUrl === incident.cloneUrl && i.sourceSessionId === incident.sourceSessionId))
  s.incidents.push(incident)
  logEvent(
    sourceSessionId,
    "incident",
    `Copied catalog found on ${clone?.domain ?? cloneUrl}: marker ${markerFound} traces back to ${incident.sourceClaimed ?? "unknown agent"} (${sourceSessionId})`,
    incident,
  )
  return incident
}

export const CATALOG_SIZE = CATALOG.length
