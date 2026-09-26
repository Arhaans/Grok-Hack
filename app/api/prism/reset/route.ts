import { resetStore } from "@/lib/events"
import { json } from "@/lib/http"

// POST /api/prism/reset → wipe all sessions, events, incidents and the clone. Use between demo runs.
export async function POST() {
  resetStore()
  return json({ ok: true })
}
