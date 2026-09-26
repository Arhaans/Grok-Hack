import { makeAgent, type AgentOptions } from "./client"
import type { ComparisonMatrix, RunResult } from "@/lib/types"

export async function runResearcher(opts: AgentOptions): Promise<RunResult> {
  const a = makeAgent("researcher", opts, { userAgent: "ShopResearch/1.2 (autonomous comparison agent)" })
  try {
    await a.step("brief", `Task: "Compare the Barrier Repair Serum sizes for a skincare guide, with sources."`)
    const m = await a.get<ComparisonMatrix>("/api/agent/catalog?task=research&family=barrier-repair-serum")
    await a.step("fetch_matrix", `Got a comparison matrix: ${m.columns.length} products × ${m.rows.length} attributes, every row sourced`, m)
    const w = await a.get<{ policy: string }>("/api/agent/policy?topic=ingredients")
    await a.step("ask_policy", `Asked about ingredients: "${w.policy}"`, { topic: "ingredients", ...w })
    await a.step("done", "Wrote the comparison with citations to the merchant catalog")
    return a.result(true)
  } catch (e) {
    return a.result(false, "scripted", String(e))
  }
}
