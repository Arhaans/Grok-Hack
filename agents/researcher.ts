import { makeAgent, type AgentOptions } from "./client"
import type { ComparisonMatrix, RunResult } from "@/lib/types"

export async function runResearcher(opts: AgentOptions): Promise<RunResult> {
  const a = makeAgent("researcher", opts, { userAgent: "ShopResearch/1.2 (autonomous comparison agent)" })
  try {
    await a.step("brief", `Task: "Compare the Halo One variants for a buying guide, with sources."`)
    const m = await a.get<ComparisonMatrix>("/api/agent/catalog?task=research&family=halo")
    await a.step("fetch_matrix", `Got a comparison matrix: ${m.columns.length} products × ${m.rows.length} attributes, every row sourced`, m)
    const w = await a.get<{ policy: string }>("/api/agent/policy?topic=warranty")
    await a.step("ask_policy", `Asked about warranty: "${w.policy}"`, { topic: "warranty", ...w })
    await a.step("done", "Wrote the comparison with citations to the merchant catalog")
    return a.result(true)
  } catch (e) {
    return a.result(false, "scripted", String(e))
  }
}
