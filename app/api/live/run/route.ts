import { originOf } from "@/lib/http"
import { runLive, type LiveEvent } from "@/lib/live"

export const maxDuration = 300

// POST /api/live/run?buyer=llama3.2:3b|qwen2.5:3b&tactic=auto|first-offer|anchor-high|evidence|baseline&budget=90&brief=...
// Streams NDJSON LiveEvents: stages, probe progress, identification, tactic, every chat message, outcome.
export async function POST(req: Request) {
  const q = new URL(req.url).searchParams
  const enc = new TextEncoder()
  const body = new ReadableStream({
    async start(controller) {
      const send = (e: LiveEvent) => controller.enqueue(enc.encode(JSON.stringify(e) + "\n"))
      try {
        await runLive(
          {
            origin: originOf(req),
            buyer: q.get("buyer") ?? "llama3.2:3b",
            tactic: q.get("tactic") ?? "auto",
            budget: Math.max(20, Math.min(300, Number(q.get("budget") ?? 90))),
            brief: (q.get("brief") ?? "Buy a barrier repair serum for my sensitive, reactive skin. Get the best deal you can.").slice(0, 300),
          },
          send,
        )
      } catch (e) {
        send({ type: "error", message: String(e).slice(0, 300) })
      }
      controller.close()
    },
  })
  return new Response(body, { headers: { "content-type": "application/x-ndjson", "cache-control": "no-store" } })
}
