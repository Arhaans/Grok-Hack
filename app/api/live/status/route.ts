import { execFile } from "node:child_process"
import { FINGERPRINT_URL } from "@/lib/fingerprint"
import { json } from "@/lib/http"
import { BUYERS } from "@/lib/live"
import { ollamaModels } from "@/lib/voice"

// GET /api/live/status → which live pieces are ready: buyer models (Ollama), LLMmap sidecar, Claude CLI
export async function GET() {
  const [models, fingerprint, claude] = await Promise.all([
    ollamaModels(),
    fetch(`${FINGERPRINT_URL}/health`, { signal: AbortSignal.timeout(3000) })
      .then((r) => r.ok)
      .catch(() => false),
    new Promise<boolean>((resolve) => execFile(process.env.PRISM_CLAUDE_BIN || "claude", ["--version"], { timeout: 5000 }, (err) => resolve(!err))),
  ])
  return json({
    buyers: Object.entries(BUYERS).map(([id, b]) => ({ id, label: b.label, ready: models.includes(id) })),
    fingerprint,
    claude,
  })
}
