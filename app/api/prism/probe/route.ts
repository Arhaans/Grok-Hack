import { logEvent } from "@/lib/events"
import { fingerprint, PROBES } from "@/lib/fingerprint"
import { annotate, observe } from "@/lib/identify"
import { bad, body, json } from "@/lib/http"
import { SIGNING_OPERATORS } from "@/lib/sign"

// POST /api/prism/probe { answers: string[8] } → LLMmap sidecar → modelGuess on the agent's identity.
export async function POST(req: Request) {
  const b = await body<{ answers: string[] }>(req)
  if (!Array.isArray(b.answers) || b.answers.length !== PROBES.length) return bad(`answers must be ${PROBES.length} strings`)
  const { sessionId, trace } = observe(req, { path: "/api/prism/probe", quiet: true })
  const claimedFamily = SIGNING_OPERATORS.find((o) => o.match.test(trace.userAgent))?.family
  try {
    const modelGuess = await fingerprint(b.answers.map(String), claimedFamily)
    const identity = annotate(sessionId, { modelGuess })
    const best = modelGuess.top[0]
    logEvent(
      sessionId,
      "probe",
      !modelGuess.inLibrary
        ? "Fingerprint: no close match in the known-model library"
        : `Fingerprint: answers closest to ${best.model} (distance ${best.distance.toFixed(1)})${modelGuess.contradictsClaim ? `, contradicting its claim to be ${identity?.claimed}` : ""}`,
      modelGuess,
    )
    return json({ modelGuess, identity })
  } catch (e) {
    logEvent(sessionId, "probe", "Fingerprint service offline, skipped model check")
    return json({ skipped: true, error: String(e) }, { status: 503 })
  }
}
