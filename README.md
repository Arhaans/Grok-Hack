# Prism

**The agent-facing layer for every store.**

> *Your next customer may be an agent. So may your next copycat.*

Prism identifies the AI agents visiting your store, gives legitimate buyers the format they need to purchase, and shows you when an agent impersonates another or copies your catalog.

A merchant connects their catalog and installs Prism. The human storefront stays exactly as it is. Prism adds an **agent storefront** and an **agent intelligence console** on top.

Built at the **[Grok Bot Commerce London Hackathon](https://luma.com/cursor-td9f)** · 26 Sep 2026 · Fleek HQ, London.

---

## What Prism does

| Capability | Merchant outcome |
|---|---|
| **Recognize** | See which agents are visiting. Verified identities where a signature exists; for the rest, a best guess at intent (buying, researching, harvesting) with a confidence score and the evidence behind it. |
| **Sell** | Serve the same approved catalog facts in the shape each agent needs: a short **buying packet** for buyers, a **comparison matrix** for researchers. Prices and policies always come from the merchant catalog. |
| **Protect** | Flag agents impersonating other agents, catalog harvesting and copycat stores. Invisible per-session markers in served content prove *which visit* a clone copied from. |
| **Learn** | See which agents ask about returns, drop off on shipping, compare competitors or reach checkout. Improve your agent offer like you'd improve a landing page. |

Identification is a **spectrum, not a magic bot ID**. A valid signature is strong evidence. Request patterns are weaker evidence. Prism always shows which is which.

**Business model:** SaaS subscription for merchants, with usage tiers for agent interactions and a copycat-protection tier. Prism sits on top of existing commerce infrastructure (e.g. Shopify) instead of rebuilding checkout.

## The demo

A beam of light enters a prism and splits into agent spectra.

| Lane | Visitor | What happens |
|---|---|---|
| ⚪ White | Human | A gorgeous editorial storefront |
| 🔵 Blue | Buying agent | The product breaks apart into a buying packet (SKU, stock, delivery, returns). The agent compares two variants and builds a real cart. |
| 🟣 Violet | Research agent | The *same* catalog becomes a side-by-side evidence matrix |
| 🔴 Red | Copycat | A harvesting agent scrapes the catalog, and an evil-twin store appears with a changed price. Prism draws a glowing line from the copied marker back to the exact session that took it. |

**The finale:** the buying agent checks both stores, sees that the clone's offers aren't signed by the merchant and its checkout is on the wrong domain, rejects it, and completes checkout with the real store.

**The last screen:** the Prism merchant console with **two stores connected**. Prism is the company; the store is the proof.

---

## Running locally

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

Env vars (in `.env.local`, never commit):

```bash
XAI_API_KEY=...            # Grok, for the live buyer agent (optional, scripted fallback works without it)
PRISM_SIGNING_SECRET=...   # signs merchant offers + the verified buyer agent's requests
```

## Architecture

Everything lives in this Next.js app. No database: events are kept in memory on the server.

```
Pages
  /              human storefront (white lane)
  /demo          prism stage: 4 lanes + "Send buyer / researcher / copycat" buttons
  /console       merchant console: agent traffic, identity cards, incidents, 2nd store integration
  /clone         the copycat store (renders scraped data with a changed price)

API
  GET  /api/agent/catalog      format adapts to the agent: buying packet or comparison matrix
  POST /api/agent/cart         build a cart
  POST /api/agent/checkout     checkout handoff: legit URL + signed offer
  GET  /api/prism/events       live event feed (console polls every 1s)
  POST /api/prism/scan         scan /clone for our markers → provenance incident
  POST /api/demo/run?agent=    start a bot run: buyer | researcher | copycat

lib/
  types.ts       shared contract (see below). Talk before changing it.
  catalog.ts     demo products
  identify.ts    request → AgentIdentity (signature, user agent, rate, breadth, cart/checkout hits)
  formats.ts     buying packet + comparison matrix
  watermark.ts   hide / find per-session markers in descriptions
  sign.ts        HMAC signing for offers and the verified agent
  events.ts      in-memory event log (on globalThis so dev reloads don't wipe it)

agents/
  buyer.ts       Grok-powered buyer with a scripted fallback
  researcher.ts  scripted research agent
  copycat.ts     spoofs "ChatGPT-User", no signature, scrapes everything, writes clone data
```

### Shared contract: `lib/types.ts`

```ts
export type AgentIntent = "buy" | "research" | "harvest" | "unknown"

export type AgentIdentity = {
  sessionId: string
  claimed: string | null        // what the User-Agent says, e.g. "ChatGPT-User"
  verified: boolean             // valid signature?
  intent: AgentIntent
  confidence: number            // 0–1
  evidence: string[]            // ["valid signature", "40 SKUs in 3s", ...]
  impersonation?: boolean       // claims a known agent but has no valid signature
}

export type PrismEvent = {
  ts: number
  sessionId: string
  kind: "request" | "format" | "cart" | "checkout" | "incident" | "scan"
  summary: string
  data?: unknown
}

export type Incident = {
  cloneUrl: string
  markerFound: string
  sourceSessionId: string
  changedFields: { field: string; ours: string; theirs: string }[]
  badCheckoutDomain: string
}
```

### Scope cuts for the hackathon

| Instead of… | We do… |
|---|---|
| Real Shopify | Local JSON catalog, about 6 products |
| Real Web Bot Auth | HMAC-signed header from the buyer agent = "verified" |
| Model fingerprinting | Request-pattern rules, shown with confidence + evidence |
| A database | In-memory event log (Supabase only if time allows) |
| Real payments | Checkout handoff that returns the legit checkout URL |
| Relying on a live LLM on stage | Grok buyer **plus** a scripted fallback |

---

## Task board

**Arhaan: backend and agents** · **Antonio: frontend and story**

Only edit files in your own area. The one shared file is `lib/types.ts`, so message each other before changing it. Commit small, pull before you push. Flip ⬜ → ✅ as you finish tasks.

### Together (T+0:00 → T+0:20)

- [ ] Agree on `lib/types.ts` (above) and commit it
- [ ] Pick the hero product + catalog (about 6 SKUs, 2 variants of the hero)
- [ ] Write down the exact demo click-path in order

### 🛠 Arhaan: backend and agents

| | # | Task | Pri | Est |
|---|---|---|---|---|
| ⬜ | A1 | `lib/catalog.ts`: 6 products with price, stock, delivery, returns | P0 | 15m |
| ⬜ | A2 | `lib/events.ts` + `GET /api/prism/events` | P0 | 15m |
| ⬜ | A3 | `lib/identify.ts`: request → `AgentIdentity` with confidence + evidence | P0 | 30m |
| ⬜ | A4 | `lib/formats.ts` + `GET /api/agent/catalog`: buying packet / comparison matrix | P0 | 30m |
| ⬜ | A5 | `lib/watermark.ts`: per-session marker (invisible characters + reworded-phrase backup) | P0 | 25m |
| ⬜ | A6 | `agents/copycat.ts`: spoofed user agent, scrape, write clone data with a changed price + fake checkout domain | P0 ⭐ | 20m |
| ⬜ | A7 | `POST /api/prism/scan`: find markers on `/clone` → `Incident` | P0 ⭐ | 25m |
| ⬜ | A8 | `lib/sign.ts` + `/api/agent/cart` + `/api/agent/checkout` with signed offers | P0 | 20m |
| ⬜ | A9 | `agents/buyer.ts` scripted: packet → compare variants → check real vs clone → reject clone → checkout | P0 | 25m |
| ⬜ | A10 | `agents/researcher.ts` scripted | P1 | 10m |
| ⬜ | A11 | `POST /api/demo/run?agent=` to trigger bots from the UI | P0 | 10m |
| ⬜ | A12 | Grok (xAI API) as the buyer's brain, tools call our API, scripted fallback behind a flag | P1 | 40m |
| ⬜ | A13 | Supabase for events | P2 | 30m |

### 🎨 Antonio: frontend and story

Reuse the existing glass images, fonts and components. Build against mock data shaped like `lib/types.ts` until Arhaan's API is ready.

| | # | Task | Pri | Est |
|---|---|---|---|---|
| ⬜ | B1 | Strip the "Agentic" marketing copy + metadata; keep the layout, glass assets, fonts | P0 | 15m |
| ⬜ | B2 | `/`: human storefront, one stunning hero product page | P0 | 40m |
| ⬜ | B3 | `/demo`: beam → prism → 4 lanes, with "Send buyer / researcher / copycat" buttons | P0 | 40m |
| ⬜ | B4 | Blue lane: product breaks apart into packet cards → cart → checkout | P0 | 30m |
| ⬜ | B5 | Violet lane: comparison matrix | P1 | 20m |
| ⬜ | B6 | Red lane + `/clone`: evil twin grows out of the store; **glowing provenance line** back to the source session | P0 ⭐ | 45m |
| ⬜ | B7 | `/console`: live event feed, identity cards (confidence + evidence), incident card | P0 | 40m |
| ⬜ | B8 | `/console`: second store integration panel (catalog source, agent endpoint, event intake, snippet) | P0 | 20m |
| ⬜ | B9 | Pitch outline + 15-second hook | P1 | 15m |

⭐ **A5–A7 + B6 are the moment that wins.** Protect them above everything else.

### Timeline

| When | Milestone |
|---|---|
| **T+0:20** | Contract agreed, split up |
| **T+1:30** | ✅ Checkpoint 1: API returns real packets; storefront + `/demo` layout render with mock data |
| **T+2:30** | ✅ Checkpoint 2: UI wired to the real API; copycat → scan → incident works end-to-end |
| **T+3:15** | 🧊 Feature freeze. Polish and bug fixes only. |
| **T+3:15–3:40** | Run the full demo 3×, fix flakiness, **record a backup video** |
| **T+3:40–4:00** | Pitch rehearsal (3 min), end on the console with 2 stores |
| **4:45 PM** | Hard code freeze |

### If we're behind, cut in this order

1. Grok live buyer (A12): scripted buyer is fine
2. Violet research lane (A10, B5): mention it in the pitch
3. Supabase (A13)
4. Storefront polish (B2): one strong hero section is enough

**Never cut:** the copycat provenance line, the buyer rejecting the clone, the console with 2 stores.

---

## Team

- **Arhaan**: backend and agents
- **Antonio**: frontend and story
