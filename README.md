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
| **Recognize** | See which agents are visiting. Verified identities where a signature exists; for the rest, a best guess at intent (buying, researching, harvesting) with a confidence score and the evidence behind it. Agents that talk back get a short probe handshake, and [LLMmap](https://github.com/pasquini-dario/LLMmap) estimates which model family is behind them (experimental). |
| **Sell** | Serve the same approved catalog facts in the shape each agent needs: a short **buying packet** for buyers, a **comparison matrix** for researchers. Prices and policies always come from the merchant catalog. |
| **Protect** | Flag agents impersonating other agents, catalog harvesting and copycat stores. Invisible per-session markers in served content prove *which visit* a clone copied from. |
| **Negotiate** | Once Prism knows the model family, it picks the negotiation tactic that converts best for it: a clean first offer for GPT-4o, evidence first for Claude, a bundle instead of a discount for Llama. Every negotiated price is a signed offer the cart honours, never below 90% of list. |
| **Learn** | See which agents ask about returns, drop off on shipping, compare competitors or reach checkout, and **which tactic converts best per model family**. Improve your agent offer like you'd improve a landing page. |

Identification is a **spectrum, not a magic bot ID**. A valid signature is strong evidence. Model fingerprints and request patterns are weaker evidence. Prism always shows which is which.

**Business model:** SaaS subscription for merchants, with usage tiers for agent interactions and a copycat-protection tier. Prism sits on top of existing commerce infrastructure (e.g. Shopify) instead of rebuilding checkout.

## The demo

A beam of light enters a prism and splits into agent spectra.

| Lane | Visitor | What happens |
|---|---|---|
| ⚪ White | Human | A gorgeous editorial storefront |
| 🔵 Blue | Buying agent | The product breaks apart into a buying packet (SKU, stock, delivery, returns). The agent compares two variants and builds a real cart. |
| 🟣 Violet | Research agent | The *same* catalog becomes a side-by-side evidence matrix |
| 🔴 Red | Copycat | A harvesting agent claims to be ChatGPT, but has no signature and its probe answers fingerprint as a different model. It scrapes the catalog, and an evil-twin store appears with a changed price. Prism draws a glowing line from the copied marker back to the exact session that took it. |
| 🤝 Lineup | Three shopping agents: GPT-4o, Claude, Llama | Prism fingerprints each one and negotiates differently: GPT-4o takes a £339 first offer, Claude gets sourced evidence and a free case at £349, Llama haggles and leaves with a £399 bundle. |

**The finale:** the buying agent checks both stores, sees that the clone's offers aren't signed by the merchant and its checkout is on the wrong domain, rejects it, and completes checkout with the real store.

**The last screen:** the Prism merchant console with **two stores connected** and a **Learn** panel: agent-to-cart rate, verified vs unknown traffic, checkout handoffs, clone incidents, and where agents drop off. Prism is the company; the store is the proof.

---

## Running locally

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

Env vars: copy `.env.example` to `.env.local` (never commit it). Everything works without them; Grok just falls back to the scripted buyer.

```bash
XAI_API_KEY=...                         # Grok makes the buyer's final decision (scripted fallback without it)
XAI_MODEL=                              # optional, auto-picked from your xAI account if empty
PRISM_SIGNING_SECRET=...                # signs merchant offers
FINGERPRINT_URL=http://localhost:8765   # LLMmap sidecar (optional)
```

### LLMmap fingerprint sidecar (optional)

A small Python service wrapping [LLMmap](https://github.com/pasquini-dario/LLMmap). It fingerprints agents from their handshake answers and runs the copycat's "brain" (Qwen2.5-0.5B). Needs Python 3.11 and [uv](https://docs.astral.sh/uv/); the first start downloads ~2 GB of models.

```bash
./fingerprint/setup.sh                                                   # once
fingerprint/.venv/bin/uvicorn --app-dir fingerprint server:app --port 8765
```

Without the sidecar the demo still runs: the fingerprint row is simply skipped.

## Architecture

Everything lives in this Next.js app, plus one optional Python sidecar for model fingerprinting. No database: events are kept in memory on the server.

```
Pages
  /              human storefront (white lane)
  /demo          prism stage: 4 lanes + "Send buyer / researcher / copycat" buttons
  /console       merchant console: agent traffic, identity cards, incidents, Learn metrics, 2nd store integration
  /clone         the copycat store (renders scraped data with a changed price)

API
  GET  /api/agent/catalog      format adapts to the agent: buying packet or comparison matrix
  GET  /api/agent/policy?topic=  returns | shipping | warranty (logged as a "question" for Learn)
  GET  /api/agent/handshake    8 probe questions for agents that talk back
  POST /api/agent/negotiate    Prism's reply, tactic chosen by model family (signed offers)
  POST /api/agent/cart         build a cart
  POST /api/agent/checkout     checkout handoff: legit URL + signed offer
  GET  /api/prism/events       live event feed (console polls every 1s)
  GET  /api/prism/metrics      Learn panel numbers + drop-off funnel
  POST /api/prism/probe        agent's handshake answers → sidecar → modelGuess on the identity
  POST /api/prism/scan         scan /clone for our markers → provenance incident
  POST /api/demo/run?agent=    start a bot run: buyer | researcher | copycat | shopper&model=…

lib/
  types.ts       shared contract (see below). Talk before changing it.
  catalog.ts     demo products
  identify.ts    request → AgentIdentity (signature, user agent, rate, breadth, cart/checkout hits)
  formats.ts     buying packet + comparison matrix
  watermark.ts   hide / find per-session markers in descriptions
  sign.ts        HMAC signing for offers and the verified agent
  events.ts      in-memory event log (on globalThis so dev reloads don't wipe it)
  metrics.ts     events → Learn numbers (+ seeded, clearly labelled demo history)
  playbook.ts    negotiation tactic per model family
  fingerprint.ts LLMmap probes + sidecar client

agents/
  buyer.ts       Grok-powered buyer with a scripted fallback
  researcher.ts  scripted research agent
  copycat.ts     spoofs "ChatGPT-User", no signature, scrapes everything, writes clone data
  shopper.ts     GPT-4o / Claude / Llama shoppers (recorded handshakes, scripted negotiation)

fingerprint/     Python sidecar (FastAPI + LLMmap)
  server.py      POST /fingerprint {answers: string[8]} → top-3 model guesses + distances
                 POST /answer {questions} → answers from a small local model (the copycat's "brain")
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
  modelGuess?: {                // from LLMmap, experimental
    top: { model: string; distance: number }[]   // top 3, lower distance = closer
    contradictsClaim: boolean   // e.g. claims ChatGPT, answers look like Qwen
  }
}

export type PrismEvent = {
  ts: number
  sessionId: string
  kind: "request" | "format" | "question" | "probe" | "cart" | "checkout" | "incident" | "scan"
  summary: string
  data?: unknown                // for "question": { topic: "returns" | "shipping" | "warranty" }
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
  seeded: boolean               // true when demo history is mixed in, the UI must say so
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
| Proving which model runs an agent | [LLMmap](https://github.com/pasquini-dario/LLMmap)'s pretrained model on 8 probe answers, shown as *experimental* evidence next to request-pattern rules |
| A database | In-memory event log (Supabase only if time allows) |
| Real payments | Checkout handoff that returns the legit checkout URL |
| Relying on a live LLM on stage | Grok buyer **plus** a scripted fallback |

---

## Research behind it

- **Agents negotiate differently and can be steered.** "LLM agents can significantly boost their negotiation outcomes by employing certain behavioral tactics", e.g. +20% payoff against GPT-4 ([NegotiationArena, arXiv:2402.05863](https://arxiv.org/abs/2402.05863)).
- **First offers win.** "All models exhibit severe first-proposal bias" in agentic marketplaces ([Magentic Marketplace, arXiv:2510.25779](https://arxiv.org/abs/2510.25779)).
- **Outcomes depend on the agent.** "Different agents achieve significantly different outcomes for their users", including overspending and accepting unreasonable deals ([arXiv:2506.00073](https://arxiv.org/abs/2506.00073)).
- **Models can be fingerprinted.** LLMmap ([USENIX Security 2025](https://github.com/pasquini-dario/LLMmap)). On its held-out test set, our sidecar identifies Claude 3.5 Sonnet 67/68, Llama 3.1 8B 64/68, GPT-4o 62/68 and Qwen2.5-0.5B 58/68 (top-1).

The papers show that model behaviour differs and tactics matter; they don't publish a tactic per model family. The per-family playbook in `lib/playbook.ts` is Prism's starting policy, which the Learn panel then measures per family.

**How the demo agents work:** the GPT-4o, Claude and Llama shoppers replay real handshake answers recorded from those models (LLMmap's test set), which LLMmap fingerprints live. Their negotiation lines are scripted re-enactments. The copycat's answers come from Qwen2.5-0.5B running locally (or a recording of it).

---

## API guide for the frontend

All of this is live on `main`. Types are in `lib/types.ts`.

**Running the demo from the UI**

```ts
await fetch("/api/prism/reset", { method: "POST" })                                    // clean slate
const copycat: RunResult = await (await fetch("/api/demo/run?agent=copycat&probeAnswers=recorded", { method: "POST" })).json()
const buyer: RunResult   = await (await fetch("/api/demo/run?agent=buyer", { method: "POST" })).json()
const research: RunResult = await (await fetch("/api/demo/run?agent=researcher", { method: "POST" })).json()
```

- A run returns when the bot finishes. `steps[]` has a `label` for each line to show in a lane, plus `data` (packet, matrix, incident, ...).
- `pace=600` (default) waits 600 ms between steps so the console feed fills in live. Use `pace=0` for instant runs.
- Copycat: `probeAnswers=recorded` uses pre-recorded Qwen answers (~2 s). Without it, Qwen answers live (~15 s, needs the sidecar). LLMmap's fingerprint is computed live either way.
- Copycat: `autoScan=0` stops Prism scanning automatically at the end, so you can trigger `POST /api/prism/scan` yourself for the reveal.
- Buyer: `brain=scripted` forces the scripted decision even with a Grok key. `RunResult.brain` says which one decided.
- **Lineup:** `agent=shopper&model=gpt-4o`, `model=claude-3.5-sonnet` and `model=llama-3.1-8b`. Fire all three at once for the lineup: each gets its own session. Steps: `arrive`, `handshake`, `fingerprinted`, `fetch_packet`, `tactic` (a `Tactic` in `data`), several `negotiate` (agent/Prism lines, Prism's turn has `offer` or `bundle`), `cart`, `checkout`. The `checkout` step's `data.negotiation` is a full `Negotiation` (turns + outcome) for a chat-style replay.

**Console polling**

| Endpoint | Returns | Use for |
|---|---|---|
| `GET /api/prism/events?since=<lastEventId>` | `PrismState`: new `events`, all `identities`, `incidents`, `clone` | Live feed, identity cards, incident card. Poll every 1 s. |
| `GET /api/prism/metrics` | `Metrics` (`seeded: true`, show an "includes demo history" tag) | Learn panel. `byModel[]` = one row per model family: tactic, sessions, conversion rate, average order value. `?live=1` for live-only numbers. |
| `GET /api/clone` | `{ clone: CloneStore \| null }` | The `/clone` evil-twin page. **Render `description` exactly as returned**: it carries the invisible marker Prism finds. |
| `POST /api/prism/scan` | `{ incident: Incident \| null }` | Manual "scan the clone" button |

**What to draw where**

- **Identity card:** `claimed`, `verified` (+ `verifiedAs`), `intent` + `confidence`, the `evidence[]` lines, a red flag when `impersonation` (only set when the fingerprint contradicts an unsigned claim; a plain unsigned claim is "unverified", not an impostor).
- **Negotiation chat:** `negotiation` events in the feed, or the shopper's `negotiate` steps. Show the tactic name + `why` as a chip above the chat. When `modelGuess` exists: top-3 `model` + `distance` bars (lower = closer), "experimental" label, red badge if `contradictsClaim`, "unknown model" if `!inLibrary`.
- **Provenance line:** `incident.copiedSnippet` on the clone → `incident.sourceSessionId` identity card, labelled with `incident.markerFound`. `changedFields` lists price/returns differences; `badCheckoutDomain` is the fake checkout.
- **Blue lane:** buyer steps `fetch_packet` (packet in `data`), `ask_policy`, `compare`, `check_clone`, `reject_clone`, `decide`, `cart`, `checkout`.
- **Red lane:** copycat steps `arrive`, `handshake`, `fingerprinted`, `scrape`, `clone`, `detected` (incident in `data`).
- **Violet lane:** researcher step `fetch_matrix` has the `ComparisonMatrix` in `data`.

**Agent-facing API** (what bots call; you mostly won't need these directly)

`GET /api/agent/catalog?task=buy|research&format=packet|matrix|full&family=halo&skus=A,B` · `GET /api/agent/policy?topic=returns|shipping|warranty` · `GET /api/agent/handshake` · `POST /api/prism/probe` · `POST /api/agent/cart` · `POST /api/agent/checkout` · `POST /api/agent/verify-offer`

**Demo store:** Halo Audio (`haloaudio.store`), hero product **Halo One** in *Liquid Silver* (£349, 2-day delivery) and *Graphite* (£329, 4-day, 3 left), plus buds, case, stand and cable. Edit `lib/catalog.ts` to change it. The clone is **Halo Audio Outlet** (`halo-audio-outlet.shop`), 20% cheaper with no returns.

---

## Task board

**Arhaan: backend and agents** · **Antonio: frontend and story**

Only edit files in your own area. The one shared file is `lib/types.ts`, so message each other before changing it. Commit small, pull before you push. Flip ⬜ → ✅ as you finish tasks (🟡 = built, needs a check).

Estimates are for coding with AI help. P0 alone fills most of the time, so **finish every P0 before touching any P1**.

### Together (T+0:00 → T+0:20)

- [ ] **Arhaan, first thing:** start the LLMmap sidecar install so the ~2 GB of models download while you plan (see *LLMmap fingerprint sidecar* above)
- [ ] Agree on `lib/types.ts` (above) and commit it
- [ ] Pick the hero product + catalog (about 6 SKUs, 2 variants of the hero)
- [ ] Write down the exact demo click-path in order

### 🛠 Arhaan: backend and agents

| | # | Task | Pri | Est |
|---|---|---|---|---|
| ✅ | A1 | `lib/catalog.ts`: 6 products with price, stock, delivery, returns | P0 | 15m |
| ✅ | A2 | `lib/events.ts` + `GET /api/prism/events` | P0 | 15m |
| ✅ | A3 | `lib/identify.ts`: request → `AgentIdentity` with confidence + evidence | P0 | 30m |
| ✅ | A4 | `lib/formats.ts` + `GET /api/agent/catalog`: buying packet / comparison matrix | P0 | 30m |
| ✅ | A5 | `lib/watermark.ts`: per-session marker (invisible characters + reworded-phrase backup) | P0 ⭐ | 25m |
| ✅ | A6 | `agents/copycat.ts`: spoofed user agent, scrape, write clone data with a changed price + fake checkout domain | P0 ⭐ | 20m |
| ✅ | A7 | `POST /api/prism/scan`: find markers on `/clone` → `Incident` | P0 ⭐ | 25m |
| ✅ | A8 | `lib/sign.ts` + `/api/agent/cart` + `/api/agent/checkout` with signed offers | P0 | 20m |
| ✅ | A9 | `agents/buyer.ts` scripted: packet → ask returns/shipping → compare variants → check real vs clone → reject clone → checkout | P0 | 25m |
| ✅ | A10 | `POST /api/demo/run?agent=` to trigger bots from the UI | P0 | 10m |
| ✅ | A11 | **Learn:** `/api/agent/policy?topic=` logs `question` events; `lib/metrics.ts` + `GET /api/prism/metrics` → `Metrics`; seed ~200 clearly-labelled demo sessions so the numbers aren't 3/3 | P1 | 20m |
| ✅ | A12 | **Fingerprint sidecar:** `fingerprint/server.py` (FastAPI) wrapping LLMmap: `POST /fingerprint` + `POST /answer` with Qwen2.5-0.5B-Instruct as the copycat's brain | P1 | 30m |
| ✅ | A13 | **Probe handshake:** `GET /api/agent/handshake` + `POST /api/prism/probe` → sidecar → `modelGuess` + evidence line on the identity; copycat answers via `/answer`; skip gracefully if the sidecar is down | P1 | 25m |
| 🟡 | A14 | Grok (xAI API) makes the buyer's final decision, scripted fallback. **Built, not yet tested with a real key**: add `XAI_API_KEY` to `.env.local` and run the buyer | P1 | 40m |
| ✅ | A15 | `agents/researcher.ts` scripted | P1 | 10m |
| ⬜ | A16 | Supabase for events | P2 | 30m |
| ✅ | A17 | **Negotiate:** `lib/playbook.ts` tactics per model family, `POST /api/agent/negotiate`, signed negotiated prices in the cart, shopper lineup (GPT-4o / Claude / Llama replays), `Metrics.byModel` | P0 | – |

### 🎨 Antonio: frontend and story

Reuse the existing glass images, fonts and components. Build against mock data shaped like `lib/types.ts` until Arhaan's API is ready.

| | # | Task | Pri | Est |
|---|---|---|---|---|
| ⬜ | B1 | Strip the "Agentic" marketing copy + metadata; keep the layout, glass assets, fonts | P0 | 15m |
| ⬜ | B2 | `/`: human storefront, one stunning hero product page | P0 | 40m |
| ⬜ | B3 | `/demo`: beam → prism → 4 lanes, with "Send buyer / researcher / copycat" buttons | P0 | 40m |
| ⬜ | B4 | Blue lane: product breaks apart into packet cards → cart → checkout | P0 | 30m |
| ⬜ | B5 | Red lane + `/clone`: evil twin grows out of the store; **glowing provenance line** back to the source session | P0 ⭐ | 45m |
| ⬜ | B6 | `/console`: live event feed, identity cards (confidence + evidence), incident card | P0 | 40m |
| ⬜ | B7 | `/console`: second store integration panel (catalog source, agent endpoint, event intake, snippet) | P0 | 20m |
| ⬜ | B8 | **Learn panel** on `/console`: 4 stat tiles (agent-to-cart, verified vs unknown, checkout handoffs, clone incidents) + drop-off funnel + top questions; show a "includes demo history" tag when `seeded` | P1 | 25m |
| ⬜ | B9 | **Model fingerprint row** on identity cards: top-3 guesses with distance bars, "experimental" label, red "contradicts claim" badge. Show "8 probes sent", **never the raw probe text** (LLMmap's probes include jailbreak and unsafe questions) | P1 | 15m |
| ⬜ | B10 | Violet lane: comparison matrix | P1 | 20m |
| ⬜ | B11 | Pitch outline + 15-second hook | P1 | 15m |
| ⬜ | B12 | **Lineup + negotiation:** three agent cards side by side, each flips to its fingerprint, then a chat bubble replay of its negotiation with the tactic chip and final price | P0 | 40m |
| ⬜ | B13 | **Learn by model:** table/bars from `metrics.byModel` (family, tactic, conversion, AOV) | P1 | 15m |

⭐ **A5–A7 + B5 are the moment that wins.** Protect them above everything else.

### About LLMmap

[LLMmap](https://github.com/pasquini-dario/LLMmap) (MIT, USENIX Security 2025) sends 8 fixed questions to an LLM and matches the answers against behavioural templates for 52 known models. We tested it on a MacBook: first run downloads ~1.1 GB and takes ~5 min, after that it **loads in ~4 s and answers in ~0.1 s**. Its `requirements.txt` is missing `accelerate`, so install that as well.

Tested with the exact demo setup: Qwen2.5-0.5B-Instruct running locally as the copycat's brain, with a shopping-assistant system prompt. LLMmap ranked **Qwen2.5-0.5B #1** (distance 26.3, next best 33.0), and GPT-style answers came back as gpt-4o. Generating the 8 answers locally takes ~12 s, so start the handshake as soon as the copycat lane opens or cache the answers per run.

How we use it: an agent that wants the full catalog is asked to complete a short "handshake" first, and its answers go to LLMmap. In the demo, the copycat claims to be ChatGPT, but its answers match a different model. That mismatch is one more piece of impersonation evidence next to the missing signature.

Limits to be honest about (on stage too):
- **Grok isn't one of the 52 known models**, so LLMmap can only name the closest known model for our Grok buyer. Show that as "unknown model" rather than a wrong name. The buyer is identified by its signature anyway.
- It only works on agents that answer questions. A plain scraper that never talks back gets no fingerprint.
- It's *evidence*, not proof, so label it "experimental" with a distance score.

### Timeline

| When | Milestone |
|---|---|
| **T+0:20** | Contract agreed, split up |
| **T+1:30** | ✅ Checkpoint 1: API returns real packets; storefront + `/demo` layout render with mock data |
| **T+2:30** | ✅ Checkpoint 2: UI wired to the real API; copycat → scan → incident works end-to-end |
| **T+3:15** | 🧊 Feature freeze. Polish and bug fixes only. |
| **T+3:15–3:40** | Run the full demo 3×, fix flakiness, **record a backup video** |
| **T+3:40–4:00** | Pitch rehearsal (3 min), end on the console with 2 stores + Learn panel |
| **4:45 PM** | Hard code freeze |

### If we're behind, cut in this order

1. Supabase (A16)
2. Violet research lane (A15, B10): mention it in the pitch
3. LLMmap fingerprint (A12, A13, B9): the identity card still has signature + behaviour evidence
4. Grok live buyer (A14): scripted buyer is fine
5. Storefront polish (B2): one strong hero section is enough
6. Learn panel down to just the 4 stat tiles (drop the funnel)

**Never cut:** the copycat provenance line, the buyer rejecting the clone, the console with 2 stores.

---

## Team

- **Arhaan**: backend and agents
- **Antonio**: frontend and story

## Credits

- [LLMmap: Fingerprinting for Large Language Models](https://github.com/pasquini-dario/LLMmap), Pasquini, Kornaropoulos & Ateniese, USENIX Security 2025 (MIT licence)
