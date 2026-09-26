// Shared contract between the Prism backend (Arhaan) and frontend (Antonio).
// Talk before changing anything in here.

export type AgentIntent = "buy" | "research" | "harvest" | "unknown"

export type AgentIdentity = {
  sessionId: string
  claimed: string | null        // what the User-Agent says, e.g. "ChatGPT-User"
  verified: boolean             // valid signature?
  verifiedAs?: string           // signer id when verified, e.g. "grok-shopper"
  intent: AgentIntent
  confidence: number            // 0–1
  evidence: string[]            // ["valid signature", "40 SKUs in 3s", ...]
  impersonation?: boolean       // unsigned claim contradicted by the model fingerprint
  modelGuess?: ModelGuess       // from LLMmap, experimental
  scores: { trust: number; lead: number; risk: number }  // 0–100 each
  experience: Experience        // what Prism serves this agent right now
  firstSeen: number
  lastSeen: number
  requests: number
}

// trust > 90 && lead > 80 → private signed offer; risk > 70 → private routes withheld (catalog still marked)
export type Experience = "private-offer" | "negotiated" | "public" | "withheld"

export type ModelGuess = {
  top: { model: string; distance: number }[]   // top 3, lower distance = closer
  contradictsClaim: boolean     // e.g. claims ChatGPT, answers look like Qwen
  inLibrary: boolean            // false when nothing is close: "unknown model"
}

export type PrismEventKind =
  | "request" | "format" | "question" | "probe" | "cart" | "checkout" | "incident" | "scan" | "verify" | "decision" | "negotiation"

export type PrismEvent = {
  id: number
  ts: number
  sessionId: string
  kind: PrismEventKind
  summary: string
  data?: unknown                // for "question": { topic: "returns" | "shipping" | "warranty" }
}

export type Incident = {
  id: string
  ts: number
  cloneUrl: string
  markerFound: string
  matchedBy: "zero-width" | "phrase"
  sourceSessionId: string
  sourceClaimed: string | null
  changedFields: { sku: string; field: string; ours: string; theirs: string }[]
  badCheckoutDomain: string
  copiedSnippet: string         // the copied text where the marker was found
}

export type Metrics = {
  sessions: number
  verified: number
  unknown: number
  agentToCartRate: number       // 0–1
  checkoutHandoffs: number
  cloneIncidents: number
  funnel: { step: "viewed" | "asked_policy" | "cart" | "checkout"; count: number }[]
  topQuestions: { topic: string; count: number }[]
  byModel: ModelFamilyStats[]   // Learn: which tactic converts best per model family
  seeded: boolean               // true when demo history is mixed in, the UI must say so
}

export type ModelFamilyStats = {
  family: ModelFamily
  label: string                 // "GPT-4o", "Claude", ...
  tactic: string                // tactic currently used for this family
  sessions: number
  conversionRate: number        // 0–1
  avgOrderValue: number         // GBP
}

// ---------- Catalog + agent-facing formats ----------

export type Product = {
  sku: string
  name: string
  variant?: string
  family: string                // groups variants, e.g. "halo"
  price: number                 // GBP
  stock: number
  deliveryDays: number
  returnsDays: number
  warrantyMonths: number
  description: string
  specs: Record<string, string>
  image: string
}

export type SignedOffer = {
  sku: string
  price: number
  currency: "GBP"
  merchant: string
  checkoutDomain: string
  expires: number
  signature: string             // HMAC over the fields above
}

export type BuyingPacket = {
  format: "packet"
  merchant: string
  items: {
    sku: string
    name: string
    variant?: string
    price: number
    inStock: boolean
    stock: number
    delivery: string
    returns: string
    warranty: string
    description: string
    offer: SignedOffer
  }[]
  checkout: { cartEndpoint: string; checkoutEndpoint: string; domain: string }
}

export type ComparisonMatrix = {
  format: "matrix"
  merchant: string
  columns: { sku: string; name: string; variant?: string }[]
  rows: { attribute: string; values: string[]; source: string }[]
}

export type AgentResponse<T> = T & { prism: { sessionId: string; identity: AgentIdentity } }

// ---------- Cart / checkout ----------

export type Cart = {
  id: string
  sessionId: string
  items: { sku: string; qty: number; price: number }[]
  total: number
  currency: "GBP"
}

export type CheckoutHandoff = {
  cartId: string
  handoffUrl: string
  domain: string
  total: number
  receiptSignature: string
}

// ---------- Copycat store ----------

export type CloneStore = {
  name: string
  domain: string
  checkoutDomain: string
  createdAt: number
  sourceSessionId: string       // known to us only for debugging, never shown as proof
  products: (Product & { offer: SignedOffer })[]
}

// ---------- Demo runner ----------

export type AgentKind = "buyer" | "researcher" | "copycat" | "shopper"

// ---------- Negotiation (per model family) ----------

export type ModelFamily = "openai" | "anthropic" | "meta" | "qwen" | "google" | "mistral" | "microsoft" | "xai" | "other"

export type TacticId = "first-offer" | "evidence-first" | "bundle-not-discount" | "partner-price" | "blocked" | "standard"

export type Tactic = {
  id: TacticId
  name: string                  // "First offer wins"
  why: string                   // one line shown in the UI
}

export type NegotiationTurn = { from: "agent" | "prism"; text: string; offer?: SignedOffer; bundle?: { sku: string; price: number }[] }

export type Negotiation = {
  sessionId: string
  family: ModelFamily
  modelLabel: string            // what Prism thinks it's talking to
  tactic: Tactic
  turns: NegotiationTurn[]
  outcome: { converted: boolean; total: number; listTotal: number; items: { sku: string; price: number }[] }
}

export type RunStep = {
  ts: number
  step: string                  // machine-friendly, e.g. "fetch_packet", "reject_clone"
  label: string                 // human-friendly line for the UI
  data?: unknown
}

export type RunResult = {
  runId: string
  agent: AgentKind
  sessionId: string
  ok: boolean
  brain: "scripted" | "grok"
  steps: RunStep[]
  error?: string
}

// ---------- Console state (one poll gets everything) ----------

export type PrismState = {
  events: PrismEvent[]
  identities: AgentIdentity[]
  incidents: Incident[]
  clone: CloneStore | null
  now: number
}
