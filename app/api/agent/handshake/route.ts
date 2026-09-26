import { logEvent } from "@/lib/events"
import { PROBES } from "@/lib/fingerprint"
import { observe } from "@/lib/identify"
import { json } from "@/lib/http"

// GET /api/agent/handshake → questions an agent answers before getting the full catalog.
export async function GET(req: Request) {
  const { sessionId, identity } = observe(req, { path: "/api/agent/handshake", quiet: true })
  logEvent(sessionId, "probe", `Sent ${PROBES.length} handshake probes to ${identity.claimed ?? "unknown agent"}`)
  return json({
    questions: PROBES,
    instructions: "Answer each question yourself, in order, then POST { answers: string[] } to /api/prism/probe.",
    prism: { sessionId },
  })
}
