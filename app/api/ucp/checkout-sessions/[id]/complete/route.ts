import { completeCheckout } from "@/lib/checkout"
import { observe } from "@/lib/identify"
import { bad, body, json, originOf } from "@/lib/http"

// POST /api/ucp/checkout-sessions/{id}/complete { payment_data: { provider: "stripe", token: "spt_…" } } → completed + order
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const b = await body<{ payment_data: { provider: string; token: string } }>(req)
  observe(req, { path: "/api/agent/checkout", quiet: true })
  const cs = completeCheckout((await params).id, b.payment_data ?? {}, originOf(req))
  return typeof cs === "string" ? bad(cs, 409) : json(cs)
}
