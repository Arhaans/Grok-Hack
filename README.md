# Prism

**Every agent gets its own experience.**

Prism tells your store which AI model is shopping, offers each one the deal that converts it, and traces the copycats that clone you.

Built at the **[Grok Bot Commerce London Hackathon](https://luma.com/cursor-td9f)** · 26 Sep 2026 · Fleek HQ, London.

---

## The problem

AI agents already shop for people. They discover products through catalogs, check out through **UCP** (Google + Shopify) or **ACP** (OpenAI + Stripe) checkout sessions, pay with delegated tokens, and sign their requests with **Web Bot Auth** (`Signature-Agent`, `Signature-Input`, `Signature`).

But a signature only says *who runs* the agent. ChatGPT's key directory says `chatgpt.com, purpose ai`. It never says which model, what it wants, or whether it's lying. Nothing in the protocols lets a store tailor its offer to the agent, or trace the scraper that copies the catalog and opens a cheaper clone.

## What Prism adds

| | |
|---|---|
| **Recognize** | Web Bot Auth signature check, then an 8-question handshake that [LLMmap](https://github.com/pasquini-dario/LLMmap) turns into a model fingerprint (52 known models). Behaviour (catalog coverage, bursts, cart/checkout) gives intent. Every agent gets **trust / lead / risk** scores and an experience: `private-offer`, `negotiated`, `public` or `withheld`. |
| **Negotiate** | The model family picks the tactic: a clean first offer for GPT, evidence first for Claude, a bundle instead of a discount for Llama. Prism's seller replies are written by **Claude Sonnet**; prices are decided in code and **signed**, so the checkout session honours them and nobody can forge one. Never below 90% of list. |
| **Protect** | **Stop what it can:** impostors and scrapers get no prices and no signed offers, and their scraping bursts are refused. **Trace what it can't:** every description Prism serves carries an invisible per-visit marker, so a clone built from it leads back to the exact visit. Then the clone's domain is flagged, and every agent that checks an offer from it is told it's a traced copycat. Its forged offers fail verification, so it can't close a sale. |
| **Learn** | Conversion and order value per model family, drop-off funnel, top questions (`GET /api/prism/metrics`). |

## The demo

`/` is the Prism site: an animated hero, then the demo. On the left, a slideshow built around the **three problems** (a tracker ticks each one off); on the right, the real **Prism Skincare** store, which has Prism installed with one line (`<script src="/prism.js">`) and turns into the red copycat outlet on the copycat slides.

Press **▶ Start the story**. It **auto-plays**; the moment you touch **◀ Back / Next ▶**, a slide dot, a problem tab or an arrow key, it switches to **manual** (click "resume" to go back to auto).

| # | Problem | Slide | What Prism does |
|---|---|---|---|
| 1 | ① You can't see who's shopping | Every agent identified | Fingerprints GPT-4o, Claude 3.5 Sonnet and a Llama 3.2 running on this laptop; trust / lead / risk per agent |
| 2 | ② Every agent gets the same offer | A deal per model | GPT takes a signed $64 first offer, Claude gets evidence + a free gift at $68, Llama haggles for $55 and takes a $100 bundle: **$232 vs $136 at one flat price** |
| 3 | ③ Copycats | A copycat walks in | Claims ChatGPT, fingerprint says Qwen → impostor: $0 prices, 0 signed offers, 10 scraping requests refused |
| 4 | ③ | It clones your store anyway | The store frame turns into *prism-skincare-outlet.shop*: lower prices, all sales final, forged offers |
| 5 | ③ | Prism traces it | A glowing line from the copied text to the exact visit |
| 6 | ③ | Prism stops it | Blocked at the door, nothing signed to sell with, domain flagged to every agent; download the takedown evidence |
| 7 | ③ | Real buyers can't be fooled | A signed Grok Shopper rejects the outlet ("flagged by Prism as a traced copycat") and buys from the real store. The clone makes $0 |
| 8 | ✓ | Three problems, solved | One row per problem, all from one line of install |

Start runs every agent once: slides 1–2 stream live, and everything else is computed in the background, so you can move back and forth freely.

**Two modes** (switch next to the Play button):
- **Replay (default):** recorded answers and replies. Instant, the same every time, and each chapter lasts 5 seconds at most.
- **Live:** Prism's seller replies are written live by **Claude Sonnet**, and the Llama agent is **Llama 3.2 3B running on this laptop**. It answers the handshake live, LLMmap identifies it as `Llama-3.2-3B-Instruct`, and it haggles live.

Every step streams to the page as it happens. Each chat line is labelled live or recorded, and each agent card shows the protocol calls it made: `Prism handshake → get_product → POST /checkout-sessions → complete · spt_… · order_created`.

## How a purchase flows (real protocols + Prism)

```
agent ── Web Bot Auth signature ──▶ Prism verifies operator              (Signature-Agent / Signature-Input / Signature)
agent ── handshake (8 probes) ────▶ LLMmap fingerprint → model family   ← Prism
agent ── get_product ─────────────▶ buying packet, descriptions marked  ← Prism watermark
agent ◀─ negotiation ─────────────  tactic per family, signed offers    ← Prism (Claude Sonnet writes the words)
agent ── POST /checkout-sessions ─▶ incomplete (prices from signed offers)          (UCP)
agent ── PUT  /checkout-sessions/{id} ▶ ready_for_complete (fulfillment chosen)     (UCP)
agent ── POST /checkout-sessions/{id}/complete {spt_…} ▶ completed, order_created   (UCP + Stripe Shared Payment Token)
```

---

## Running it

```bash
pnpm install
pnpm dev                      # http://localhost:3000  (the store is at /store)
```

That's all you need for **Replay** mode. For **Live** mode and live fingerprinting:

```bash
# LLMmap fingerprint sidecar (Python 3.11 + uv; first run downloads ~2 GB)
./fingerprint/setup.sh
fingerprint/.venv/bin/uvicorn --app-dir fingerprint server:app --port 8765

# Local buyer agent
ollama pull llama3.2:3b

# Claude seller: uses your logged-in Claude Code (`claude -p`), no API key needed
claude --version
```

Before presenting: keep big local models unloaded (`ollama stop gpt-oss:20b`). They starve the fingerprint sidecar on a 24 GB Mac.

Optional env (`.env.local`):

```bash
PRISM_SELLER=off                 # disable the Claude seller (templates only)
PRISM_SELLER_MODEL=sonnet        # model alias passed to `claude -p --model`
FINGERPRINT_URL=http://localhost:8765
PRISM_SIGNING_SECRET=...         # signs merchant offers
XAI_API_KEY=...                  # optional: Grok makes the verified buyer's decision
```

The store (`stores/prism-skincare`, React + Vite) is built into `public/store`. After changing it, run `pnpm store:build`.

## Architecture

```
app/page.tsx                 hero + the demo story
components/demo-story.tsx    one-button story: store frame, "Prism sees" panel, streamed chats, trace, results
public/prism.js              the one-line storefront install (badge + live agent count)
stores/prism-skincare/       the demo store (catalog source of truth); /store?clone=1 = copycat outlet

app/api/agent/*              agent-facing API: catalog, policy, handshake, negotiate, verify-offer
app/api/ucp/checkout-sessions   UCP-style checkout: create → PUT → /complete (Shared Payment Token)
app/api/prism/*              events (poll), metrics, probe, scan, reset
app/api/demo/run             runs a demo agent (?agent=shopper|copycat|buyer|researcher&mode=live&stream=1)

lib/identify.ts   signatures, behaviour, fingerprint → identity, scores, experience
lib/sign.ts       Web Bot Auth-style request signatures + signed offers
lib/playbook.ts   tactic per model family, signed prices
lib/seller.ts     Claude Sonnet seller voice (headless Claude Code) with price guard + recorded fallback
lib/voice.ts      local Ollama voice + live handshake answers
lib/watermark.ts  per-visit markers;  lib/scan.ts  clone → incident
lib/checkout.ts   checkout sessions;  lib/metrics.ts  Learn numbers
agents/           shopper (GPT / Claude / live Llama), copycat, buyer, researcher; fixtures/ = recordings
fingerprint/      LLMmap sidecar (FastAPI): /fingerprint, /answer (Qwen copycat brain)
```

## Research

- Agents negotiate differently and can be steered: "LLM agents can significantly boost their negotiation outcomes by employing certain behavioral tactics" ([NegotiationArena, arXiv:2402.05863](https://arxiv.org/abs/2402.05863)).
- First offers win: "all models exhibit severe first-proposal bias" ([Magentic Marketplace, arXiv:2510.25779](https://arxiv.org/abs/2510.25779)).
- "Different agents achieve significantly different outcomes for their users" ([arXiv:2506.00073](https://arxiv.org/abs/2506.00073)).
- Real protocols: [UCP](https://ucp.dev/), [ACP checkout spec](https://developers.openai.com/commerce/specs/checkout), [Stripe Shared Payment Tokens](https://docs.stripe.com/agentic-commerce/concepts/shared-payment-tokens), [AP2](https://ap2-protocol.org/ap2/specification/), [Web Bot Auth](https://developers.cloudflare.com/bots/reference/bot-verification/web-bot-auth/), [Visa Trusted Agent Protocol](https://developer.visa.com/capabilities/trusted-agent-protocol/trusted-agent-protocol-specifications).
- On LLMmap's held-out test set our sidecar identifies Claude 3.5 Sonnet 67/68, Llama 3.1 8B 64/68, GPT-4o 62/68, Qwen2.5-0.5B 58/68. Live Llama 3.2 3B on this laptop: identified at distance 16.9 (next best 46.7).

The papers show that model behaviour differs and tactics matter; they don't publish a tactic per model. The playbook is Prism's starting policy, measured per family in Learn.

**Honest demo notes:** agent signatures use an HMAC stand-in with real Web Bot Auth header shapes; payments use simulated `spt_…` tokens; GPT-4o and Claude buyers replay real recorded LLMmap answers; Learn numbers include clearly labelled demo history.

## Team

- **Arhaan**
- **Antonio**

## Credits

- [LLMmap: Fingerprinting for Large Language Models](https://github.com/pasquini-dario/LLMmap), Pasquini, Kornaropoulos & Ateniese, USENIX Security 2025 (MIT)
