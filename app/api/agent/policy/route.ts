import { POLICIES, type PolicyTopic } from "@/lib/catalog"
import { logEvent } from "@/lib/events"
import { observe } from "@/lib/identify"
import { bad, json } from "@/lib/http"

// GET /api/agent/policy?topic=returns|shipping|warranty (logged as a "question" for Learn)
export async function GET(req: Request) {
  const topic = new URL(req.url).searchParams.get("topic") as PolicyTopic | null
  if (!topic || !(topic in POLICIES)) return bad(`topic must be one of ${Object.keys(POLICIES).join(", ")}`)
  const { sessionId, identity } = observe(req, { path: "/api/agent/policy", topic, quiet: true })
  logEvent(sessionId, "question", `${identity.claimed ?? "Unknown agent"} asked about ${topic}`, { topic })
  return json({ topic, policy: POLICIES[topic], source: "Halo Audio policy page", prism: { sessionId } })
}
