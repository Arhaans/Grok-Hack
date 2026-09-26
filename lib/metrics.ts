import type { Metrics, ModelFamily, ModelFamilyStats } from "./types"
import { familyOfModel } from "./fingerprint"
import { pickTactic } from "./playbook"
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
  questions: { returns: 88, shipping: 64, ingredients: 41 } as Record<string, number>,
  // per model family: sessions, conversions, revenue (labelled demo history)
  byModel: {
    openai: { label: "GPT-4o", sessions: 64, converted: 21, revenue: 1344 },
    anthropic: { label: "Claude", sessions: 41, converted: 15, revenue: 1020 },
    meta: { label: "Llama", sessions: 27, converted: 6, revenue: 600 },
    xai: { label: "Grok Shopper (verified)", sessions: 38, converted: 17, revenue: 1156 },
    other: { label: "Unknown model", sessions: 44, converted: 3, revenue: 204 },
  } as Partial<Record<ModelFamily, { label: string; sessions: number; converted: number; revenue: number }>>,
}

const TACTIC_BY_FAMILY: Partial<Record<ModelFamily, string>> = {
  openai: "First offer wins",
  anthropic: "Evidence first",
  meta: "Bundle, don't discount",
  xai: "Verified partner price",
  qwen: "No negotiation",
  other: "Standard offer",
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
    byModel: byModel(includeSeed),
    topQuestions: Object.entries(questions)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count),
    seeded: includeSeed,
  }
}

function byModel(includeSeed: boolean): ModelFamilyStats[] {
  const s = store()
  const acc = new Map<ModelFamily, { label: string; sessions: number; converted: number; revenue: number }>()
  if (includeSeed) for (const [f, v] of Object.entries(SEED.byModel)) acc.set(f as ModelFamily, { ...v! })
  const checkedOut = new Map<string, number>()
  for (const e of s.events) if (e.kind === "checkout") checkedOut.set(e.sessionId, (e.data as { total?: number })?.total ?? 0)
  for (const t of s.sessions.values()) {
    const g = t.modelGuess?.inLibrary ? t.modelGuess.top[0].model : undefined
    const family: ModelFamily = g ? familyOfModel(g) : t.verifiedAs === "grok-shopper" ? "xai" : "other"
    const row = acc.get(family) ?? { label: pickTactic(t.identity).modelLabel, sessions: 0, converted: 0, revenue: 0 }
    row.sessions++
    if (checkedOut.has(t.sessionId)) {
      row.converted++
      row.revenue += checkedOut.get(t.sessionId)!
    }
    acc.set(family, row)
  }
  return [...acc.entries()]
    .map(([family, v]) => ({
      family,
      label: v.label,
      tactic: TACTIC_BY_FAMILY[family] ?? "Standard offer",
      sessions: v.sessions,
      conversionRate: v.sessions ? Math.round((v.converted / v.sessions) * 1000) / 1000 : 0,
      avgOrderValue: v.converted ? Math.round(v.revenue / v.converted) : 0,
    }))
    .sort((a, b) => b.sessions - a.sessions)
}
