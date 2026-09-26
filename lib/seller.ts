import { execFile } from "node:child_process"
import type { NegotiationTurn, Tactic } from "./types"
import RECORDED from "@/agents/fixtures/seller-lines.json"

// Prism's seller voice: Claude Sonnet via headless Claude Code (`claude -p`), using the logged-in
// subscription, so no API key is needed for the local demo. Prices are decided in code (playbook.ts)
// and signed; Claude only writes the words, and must state the exact price or we use the template.
const CLAUDE_BIN = process.env.PRISM_CLAUDE_BIN || "claude"
const MODEL = process.env.PRISM_SELLER_MODEL || "sonnet"
const ENABLED = process.env.PRISM_SELLER !== "off"
const TIMEOUT_MS = Number(process.env.PRISM_SELLER_TIMEOUT_MS || 12000)

function ask(system: string, prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      CLAUDE_BIN,
      ["-p", "--model", MODEL, "--no-session-persistence", "--strict-mcp-config", "--setting-sources", "", "--tools", "", "--system-prompt", system, prompt],
      { timeout: TIMEOUT_MS, cwd: "/tmp", env: { ...process.env, CLAUDE_CODE_ENTRYPOINT: "prism-seller" } },
      (err, stdout) => (err ? reject(err) : resolve(stdout.trim())),
    )
  })
}

export async function sellerSay(opts: {
  turn: NegotiationTurn
  tactic: Tactic
  modelLabel: string
  agentMessage?: string
  round?: number
  live?: boolean // replay mode (default) uses Claude's recorded replies: instant and deterministic
}): Promise<{ text: string; voice: string }> {
  const { turn, tactic } = opts
  const fallback = { text: turn.text, voice: "template" }
  if (!ENABLED || tactic.id === "blocked") return fallback
  const price = turn.bundle ? turn.bundle.reduce((s, l) => s + l.price, 0) : turn.offer?.price
  if (price === undefined) return fallback
  if (!opts.live) {
    const rec = (RECORDED.lines as Record<string, string>)[`${tactic.id}:${opts.round ?? 0}`]
    return rec && rec.includes(`$${price}`) ? { text: rec, voice: `claude ${MODEL} (recorded)` } : fallback
  }
  const system =
    `You are Prism, the sales agent for the skincare store Prism Skincare, replying to an AI shopping agent (${opts.modelLabel}). ` +
    `Negotiation tactic: ${tactic.name}. ${tactic.why} ` +
    `Facts you may use, and nothing else: ${turn.text} ` +
    `Write 1-2 short sentences (max 40 words), warm and confident. You MUST state exactly this total price: $${price}. ` +
    `Never invent other prices, discounts, products or policies. No emojis, no markdown.`
  try {
    const text = (await ask(system, `Shopping agent said: "${opts.agentMessage ?? "Hello"}"`)).split("\n").filter(Boolean).join(" ")
    if (!text || text.length > 320 || !text.includes(`$${price}`)) return fallback
    return { text, voice: `claude ${MODEL} (subscription)` }
  } catch {
    return fallback
  }
}
