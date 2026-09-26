import { createHash } from "node:crypto"
import { store } from "./events"

// Two independent markers per session:
// 1. zero-width: an invisible bit string (U+200B = 0, U+200C = 1) between two word joiners (U+2060)
// 2. phrase: small word swaps chosen by the session's hash, so even stripped text can be traced
const ZW0 = "​"
const ZW1 = "‌"
const EDGE = "⁠"
const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789" // 32 symbols → 5 bits each
const MARKER_LEN = 6

export function markerFor(sessionId: string) {
  const h = createHash("sha256").update("marker|" + sessionId).digest()
  let id = ""
  for (let i = 0; i < MARKER_LEN; i++) id += ALPHABET[h[i] % 32]
  store().markers.set(id, sessionId)
  return id
}

function toBits(id: string) {
  return [...id].map((c) => ALPHABET.indexOf(c).toString(2).padStart(5, "0")).join("")
}

function fromBits(bits: string) {
  let id = ""
  for (let i = 0; i + 5 <= bits.length; i += 5) id += ALPHABET[parseInt(bits.slice(i, i + 5), 2)] ?? "?"
  return id
}

const SWAPS: [RegExp, string][] = [
  [/ with /, " featuring "],
  [/ and /, " plus "],
]

// 1..3, never 0: every session's wording differs from the original catalog text
function phraseBits(sessionId: string) {
  return (createHash("sha256").update("phrase|" + sessionId).digest()[0] % 3) + 1
}

export function watermark(text: string, sessionId: string) {
  const id = markerFor(sessionId)
  let out = text
  const bits = phraseBits(sessionId)
  SWAPS.forEach(([re, to], i) => {
    if (bits & (1 << i)) out = out.replace(re, to)
  })
  const zw = EDGE + [...toBits(id)].map((b) => (b === "1" ? ZW1 : ZW0)).join("") + EDGE
  const firstSpace = out.indexOf(" ")
  return firstSpace > 0 ? out.slice(0, firstSpace) + zw + out.slice(firstSpace) : out + zw
}

export function stripMarkers(text: string) {
  return text.replace(/[​‌⁠]/g, "")
}

// Find zero-width markers in arbitrary text (HTML, JSON, ...).
export function findZeroWidthMarkers(text: string) {
  const found: { markerId: string; sessionId?: string; index: number }[] = []
  const re = new RegExp(`${EDGE}([${ZW0}${ZW1}]{${MARKER_LEN * 5}})${EDGE}`, "g")
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    const markerId = fromBits([...m[1]].map((c) => (c === ZW1 ? "1" : "0")).join(""))
    found.push({ markerId, sessionId: store().markers.get(markerId), index: m.index })
  }
  return found
}

// Backup: match stripped copied text against what each session was served.
export function matchByPhrase(copied: string) {
  const target = stripMarkers(copied).trim()
  const hits: { sessionId: string; harvest: boolean }[] = []
  for (const t of store().sessions.values()) {
    for (const served of t.servedDescriptions.values()) {
      if (stripMarkers(served).trim() === target) {
        hits.push({ sessionId: t.sessionId, harvest: t.identity?.intent === "harvest" })
        break
      }
    }
  }
  // most likely source last: harvesters win ties
  return hits.sort((a, b) => Number(a.harvest) - Number(b.harvest)).map((h) => h.sessionId)
}
