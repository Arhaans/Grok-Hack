// Minimal xAI (Grok) client. OpenAI-compatible chat completions.
const BASE = process.env.XAI_BASE_URL || "https://api.x.ai/v1"
let cachedModel: string | undefined

export function grokAvailable() {
  return !!process.env.XAI_API_KEY
}

async function model() {
  if (process.env.XAI_MODEL) return process.env.XAI_MODEL
  if (cachedModel) return cachedModel
  // No model configured: pick one from the account's model list.
  const r = await fetch(`${BASE}/models`, { headers: { authorization: `Bearer ${process.env.XAI_API_KEY}` } })
  const ids: string[] = r.ok ? ((await r.json()).data ?? []).map((m: { id: string }) => m.id) : []
  const grok = ids.filter((id) => id.startsWith("grok") && !/image|vision|imagine|video/.test(id))
  cachedModel = grok.find((id) => /fast/.test(id)) ?? grok[0] ?? "grok-4"
  return cachedModel
}

export async function grokJSON<T>(system: string, user: string): Promise<{ data: T; model: string }> {
  const m = await model()
  const r = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${process.env.XAI_API_KEY}` },
    body: JSON.stringify({
      model: m,
      temperature: 0,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
    signal: AbortSignal.timeout(30000),
  })
  if (!r.ok) throw new Error(`xAI ${r.status}: ${(await r.text()).slice(0, 200)}`)
  const content: string = (await r.json()).choices?.[0]?.message?.content ?? ""
  const match = content.match(/\{[\s\S]*\}/)
  if (!match) throw new Error("Grok did not return JSON")
  return { data: JSON.parse(match[0]) as T, model: m }
}
