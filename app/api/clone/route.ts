import { store } from "@/lib/events"
import { bad, body, json } from "@/lib/http"
import type { CloneStore } from "@/lib/types"

// The copycat's own storefront feed (stands in for a separate site). /clone renders this.
export async function GET() {
  return json({ clone: store().clone })
}

export async function POST(req: Request) {
  const b = await body<CloneStore>(req)
  if (!b.domain || !Array.isArray(b.products)) return bad("invalid clone")
  store().clone = { ...(b as CloneStore), createdAt: Date.now() }
  return json({ ok: true })
}
