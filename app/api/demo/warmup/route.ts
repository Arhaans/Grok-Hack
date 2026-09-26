import { json } from "@/lib/http"
import { FINGERPRINT_URL } from "@/lib/fingerprint"
import REPLAYS from "@/agents/fixtures/replays.json"
import { VOICE_MODEL, warmVoice } from "@/lib/voice"

// POST /api/demo/warmup → primes the fingerprint sidecar and the local voice model. Call once before the demo.
export async function POST() {
  const t = Date.now()
  const models = [VOICE_MODEL]
  // one real fingerprint call pages the embedding model into memory
  const sidecar = fetch(`${FINGERPRINT_URL}/fingerprint`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ answers: REPLAYS.answers["gpt-4o"] }),
    signal: AbortSignal.timeout(30000),
  })
    .then((r) => r.ok)
    .catch(() => false)
  await warmVoice(models)
  const fingerprintSidecar = await sidecar
  return json({ ok: true, voiceModels: models, fingerprintSidecar, ms: Date.now() - t })
}
