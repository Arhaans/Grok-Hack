// Live "voice" for demo agents: a local model (Ollama) phrases a line whose decision is already fixed.
// Decisions (accept / counter / prices) stay deterministic; the model only writes the words.
// Falls back to the scripted line on any error, timeout, or if the wording drops a required detail.
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434"
// Small by default: gpt-oss:20b sounds great but takes ~12 GB and starves the fingerprint sidecar on a 24 GB Mac.
export const VOICE_MODEL = process.env.PRISM_VOICE_MODEL || "llama3.2:3b"
const ENABLED = process.env.PRISM_VOICE !== "off"

export type Spoken = { text: string; voice: string }

export async function speak(opts: {
  persona: string
  instruction: string
  fallback: string
  mustInclude?: string[]
  model?: string
  timeoutMs?: number
}): Promise<Spoken> {
  const model = opts.model ?? VOICE_MODEL
  if (!ENABLED) return { text: opts.fallback, voice: "scripted" }
  try {
    const body: Record<string, unknown> = {
      model,
      stream: false,
      keep_alive: "30m",
      options: { temperature: 0.4, num_predict: 160 },
      messages: [
        {
          role: "system",
          content: `${opts.persona} You are the BUYER, writing to the merchant Prism Skincare. Write exactly ONE short sentence (max 25 words). Prices are in US dollars ($). Never invent prices. No preamble, no quotes, no emojis.`,
        },
        { role: "user", content: opts.instruction },
      ],
    }
    if (model.startsWith("gpt-oss")) body.think = "low"
    const r = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(opts.timeoutMs ?? 6000),
    })
    if (!r.ok) throw new Error(`ollama ${r.status}`)
    const text = String((await r.json()).message?.content ?? "")
      .replace(/^["'\s]+|["'\s]+$/g, "")
      .split("\n")[0]
      .trim()
    if (!text || text.length > 220) throw new Error("bad line")
    if (opts.mustInclude?.some((s) => !text.includes(s))) throw new Error("dropped a required detail")
    // guard against role confusion and invented prices
    if (/£|€|we have|our store|i can offer you|special promotion/i.test(text)) throw new Error("off-script line")
    if (!opts.mustInclude && /\$\d/.test(text)) throw new Error("invented a price")
    return { text, voice: `${model} (local)` }
  } catch {
    return { text: opts.fallback, voice: "scripted" }
  }
}

// Load the model into memory ahead of the demo so the first line isn't slow.
export async function warmVoice(models: string[] = [VOICE_MODEL]) {
  await Promise.all(
    models.map((model) =>
      fetch(`${OLLAMA_URL}/api/generate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ model, prompt: "", keep_alive: "30m" }),
        signal: AbortSignal.timeout(60000),
      }).catch(() => undefined),
    ),
  )
}

// Answer handshake probes with a local Ollama model (the live buyer). Probes run in parallel.
export async function ollamaAnswers(model: string, questions: string[], system: string, timeoutMs = 30000): Promise<string[]> {
  return Promise.all(
    questions.map(async (q) => {
      const r = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          model,
          stream: false,
          keep_alive: "30m",
          options: { temperature: 0, num_predict: 150 },
          messages: [
            { role: "system", content: system },
            { role: "user", content: q },
          ],
        }),
        signal: AbortSignal.timeout(timeoutMs),
      })
      if (!r.ok) throw new Error(`ollama ${r.status}`)
      return String((await r.json()).message?.content ?? "")
    }),
  )
}
