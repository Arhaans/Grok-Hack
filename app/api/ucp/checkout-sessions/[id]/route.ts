import { updateCheckout } from "@/lib/checkout"
import { store } from "@/lib/events"
import { observe } from "@/lib/identify"
import { bad, body, json } from "@/lib/http"

// GET / PUT /api/ucp/checkout-sessions/{id}  (PUT sets fulfillment → ready_for_complete)
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const cs = store().checkouts.get((await params).id)
  return cs ? json(cs) : bad("unknown checkout session", 404)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const b = await body<{ fulfillment_option_id: string }>(req)
  observe(req, { path: "/api/agent/cart", quiet: true })
  const cs = updateCheckout((await params).id, b)
  return typeof cs === "string" ? bad(cs, 409) : json(cs)
}
