import { getState } from "@/lib/events"
import { json } from "@/lib/http"

// GET /api/prism/events?since=<last event id> → PrismState (events, identities, incidents, clone). Poll every 1s.
export async function GET(req: Request) {
  const since = Number(new URL(req.url).searchParams.get("since") || 0)
  return json(getState(since))
}
