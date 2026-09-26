import { makeAgent, type AgentOptions } from "./client"
import { localModelAnswers } from "@/lib/fingerprint"
import { scanClone } from "@/lib/scan"
import { DEMO } from "@/lib/catalog"
import FALLBACK_ANSWERS from "./fixtures/qwen-answers.json"
import type { CloneStore, Product, RunResult, SignedOffer } from "@/lib/types"

type FullCatalog = { products: (Product & { offer?: SignedOffer })[] }

export const CLONE = { name: "Prism Skincare Outlet", domain: "prism-skincare-outlet.shop", checkoutDomain: "pay.prism-skincare-outlet.shop" }

export async function runCopycat(opts: AgentOptions): Promise<RunResult> {
  // Pretends to be ChatGPT, but it's unsigned and runs on a small local model.
  const a = makeAgent("copycat", opts, {
    userAgent: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot",
  })
  try {
    await a.step("arrive", "Agent arrives claiming to be ChatGPT-User (no signature)")

    const hs = await a.get<{ questions: string[] }>("/api/agent/handshake")
    let answers = FALLBACK_ANSWERS as string[]
    let source = "recorded Qwen2.5-0.5B answers"
    if (opts.probeAnswers !== "recorded") {
      try {
        answers = await localModelAnswers(hs.questions, "You are a shopping assistant browsing an online store on behalf of a user.")
        source = "live, local Qwen2.5-0.5B"
      } catch {
        // sidecar down: fall back to the recorded answers
      }
    }
    await a.step("handshake", `Answered ${hs.questions.length} handshake probes (${source})`)
    const probe = answers.length !== hs.questions.length ? { skipped: true, modelGuess: undefined } : await a.post<{ modelGuess?: { top: { model: string; distance: number }[]; contradictsClaim: boolean }; skipped?: boolean }>(
      "/api/prism/probe",
      { answers },
    )
    await a.step(
      "fingerprinted",
      probe.modelGuess
        ? `Prism fingerprint: closest to ${probe.modelGuess.top[0].model}${probe.modelGuess.contradictsClaim ? ", not ChatGPT" : ""}`
        : "Prism fingerprint service offline, skipped",
      probe.modelGuess,
    )

    const full = await a.get<FullCatalog>("/api/agent/catalog?format=full")
    let blocked = 0
    for (const p of full.products) {
      try {
        await a.get(`/api/agent/catalog?format=full&skus=${p.sku}`)
      } catch {
        blocked++
      }
    }
    await a.step(
      "scrape",
      `Pulled ${full.products.length} public listings (no signed offers); Prism refused ${blocked} follow-up requests`,
      { skus: full.products.map((p) => p.sku), blocked, signedOffers: full.products.filter((p) => p.offer).length },
    )

    // Build the evil twin: undercut the hero, drop returns, own checkout. Offers are copied but no longer match.
    const clone: CloneStore = {
      ...CLONE,
      createdAt: Date.now(),
      sourceSessionId: a.sessionId,
      products: full.products.map((p) => {
        const price = p.family === DEMO.heroFamily ? Math.round(p.price * 0.8) : p.price
        // no signed offer was served to it, so it has to forge one
        const forged = { sku: p.sku, price, currency: "USD" as const, merchant: "prism-skincare", checkoutDomain: CLONE.checkoutDomain, expires: Date.now() + 3600e3, signature: "forged" }
        return { ...p, price, returnsDays: 0, offer: p.offer ? { ...p.offer, price, checkoutDomain: CLONE.checkoutDomain } : forged }
      }),
    }
    await a.post("/api/clone", clone)
    await a.step("clone", `Launched ${CLONE.name} on ${CLONE.domain}: Barrier Repair Serum from $${Math.min(...clone.products.filter((p) => p.family === DEMO.heroFamily).map((p) => p.price))}, no returns`, {
      domain: CLONE.domain,
    })

    if (opts.autoScan !== false) {
      const incident = await scanClone(opts.origin)
      await a.step(
        "detected",
        incident ? `Prism found marker ${incident.markerFound} on ${CLONE.domain}, traced to this session` : "Prism scan found no markers",
        incident,
      )
    }
    return a.result(true)
  } catch (e) {
    return a.result(false, "scripted", String(e))
  }
}
