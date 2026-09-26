import type { AgentContext, Product } from "./types"
import { CATALOG, DEMO, getProduct } from "./catalog"

// Turn an agent's search text into a context profile (the demo's lightweight parser).
export function contextFrom(query: string): AgentContext {
  const q = query.toLowerCase()
  const needs: string[] = []
  if (/sensitive|reactive|redness|gentle/.test(q)) needs.push("sensitive skin")
  if (/evidence|clinical|proof|study/.test(q)) needs.push("clinical evidence")
  if (/return/.test(q)) needs.push("easy returns")
  if (/fast|quick|asap|tomorrow|days?\b/.test(q)) needs.push("fast delivery")
  if (/cheap|lowest|deal|discount/.test(q)) needs.push("price-sensitive")
  if (/gift/.test(q)) needs.push("gift")
  const budget = Number(q.match(/\$\s?(\d+)/)?.[1]) || undefined
  return { query, budget, needs }
}

// Rank what to show this agent first, with a reason for each pick.
export function recommend(ctx: AgentContext | undefined, products: Product[]): { sku: string; why: string }[] {
  const picks: { sku: string; why: string }[] = []
  const hero = getProduct(DEMO.hero)
  if (hero) picks.push({ sku: hero.sku, why: ctx?.needs.includes("sensitive skin") ? "made for sensitive, reactive skin" : "best seller" })
  if (ctx?.needs.includes("sensitive skin")) picks.push({ sku: "cloud-foam-cleanser", why: "gentle cleanser that pairs with the serum" })
  if (ctx?.needs.includes("price-sensitive")) picks.push({ sku: DEMO.bundleAddOn, why: "best value when bundled" })
  if (ctx?.needs.includes("clinical evidence")) picks.push({ sku: DEMO.gift, why: "try-before-you-commit samples" })
  const inCatalog = new Set(products.map((p) => p.sku).concat(CATALOG.map((p) => p.sku)))
  return picks.filter((p, i, a) => inCatalog.has(p.sku) && a.findIndex((x) => x.sku === p.sku) === i)
}
