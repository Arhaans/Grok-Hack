import type { Metrics } from "./types"
import { store } from "./events"

// Clearly labelled demo history so the Learn panel isn't "3 sessions". Live traffic is added on top.
const SEED = {
  sessions: 214,
  verified: 81,
  viewed: 198,
  asked_policy: 121,
  cart: 47,
  checkout: 31,
  cloneIncidents: 2,
  questions: { returns: 88, shipping: 64, warranty: 23 } as Record<string, number>,
}

export function computeMetrics(includeSeed = true): Metrics {
  const s = store()
  const sessions = [...s.sessions.values()].filter((t) => t.sessionId !== "prism")
  const live = {
    sessions: sessions.length,
    verified: sessions.filter((t) => t.verifiedAs).length,
    viewed: sessions.filter((t) => t.skusSeen.size > 0).length,
    asked_policy: sessions.filter((t) => t.topics.size > 0).length,
    cart: sessions.filter((t) => t.paths.has("/api/agent/cart")).length,
    checkout: s.events.filter((e) => e.kind === "checkout").length,
  }
  const questions: Record<string, number> = {}
  for (const e of s.events)
    if (e.kind === "question") {
      const topic = (e.data as { topic?: string })?.topic ?? "other"
      questions[topic] = (questions[topic] ?? 0) + 1
    }

  const k = includeSeed ? 1 : 0
  const total = live.sessions + k * SEED.sessions
  const verified = live.verified + k * SEED.verified
  const cart = live.cart + k * SEED.cart
  if (includeSeed) for (const [t, n] of Object.entries(SEED.questions)) questions[t] = (questions[t] ?? 0) + n

  return {
    sessions: total,
    verified,
    unknown: total - verified,
    agentToCartRate: total ? Math.round((cart / total) * 1000) / 1000 : 0,
    checkoutHandoffs: live.checkout + k * SEED.checkout,
    cloneIncidents: s.incidents.length + k * SEED.cloneIncidents,
    funnel: [
      { step: "viewed", count: live.viewed + k * SEED.viewed },
      { step: "asked_policy", count: live.asked_policy + k * SEED.asked_policy },
      { step: "cart", count: cart },
      { step: "checkout", count: live.checkout + k * SEED.checkout },
    ],
    topQuestions: Object.entries(questions)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count),
    seeded: includeSeed,
  }
}
