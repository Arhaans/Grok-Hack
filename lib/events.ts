import type { AgentContext, AgentIdentity, Cart, CheckoutSession, CloneStore, Incident, ModelGuess, PrismEvent, PrismEventKind, PrismState } from "./types"

// Per-session behaviour Prism has observed. Identity is derived from this in identify.ts.
export type SessionTrace = {
  sessionId: string
  userAgent: string
  firstSeen: number
  lastSeen: number
  requestTimes: number[]
  skusSeen: Set<string>
  paths: Set<string>
  topics: Set<string>
  formats: Set<string>
  verifiedAs?: string
  signatureReason?: string
  identity?: AgentIdentity
  modelGuess?: ModelGuess
  copiedTo?: string // domain where content served to this session was found
  context?: AgentContext
  // what we served, so copied content can be traced back
  servedDescriptions: Map<string, string>
}

type Store = {
  nextId: number
  events: PrismEvent[]
  sessions: Map<string, SessionTrace>
  incidents: Incident[]
  carts: Map<string, Cart>
  checkouts: Map<string, CheckoutSession>
  clone: CloneStore | null
  markers: Map<string, string> // marker id → sessionId
  flaggedDomains: Map<string, string> // traced clone domain → incident id
  blocked: Map<string, number> // sessionId → requests Prism refused
}

// globalThis so dev reloads and separate route bundles share one store.
const g = globalThis as unknown as { __prism?: Store }

function fresh(): Store {
  return {
    nextId: 1,
    events: [],
    sessions: new Map(),
    incidents: [],
    carts: new Map(),
    checkouts: new Map(),
    clone: null,
    markers: new Map(),
    flaggedDomains: new Map(),
    blocked: new Map(),
  }
}

export function store(): Store {
  if (!g.__prism) g.__prism = fresh()
  return g.__prism
}

export function resetStore() {
  g.__prism = fresh()
}

export function logEvent(sessionId: string, kind: PrismEventKind, summary: string, data?: unknown) {
  const s = store()
  const ev: PrismEvent = { id: s.nextId++, ts: Date.now(), sessionId, kind, summary, data }
  s.events.push(ev)
  if (s.events.length > 2000) s.events.splice(0, s.events.length - 2000)
  return ev
}

export function getState(since = 0): PrismState {
  const s = store()
  return {
    events: s.events.filter((e) => e.id > since),
    identities: [...s.sessions.values()]
      .map((t) => t.identity)
      .filter((i): i is AgentIdentity => !!i)
      .sort((a, b) => b.lastSeen - a.lastSeen),
    incidents: s.incidents,
    clone: s.clone,
    now: Date.now(),
  }
}
