import { json } from "@/lib/http"
import { computeMetrics } from "@/lib/metrics"

// GET /api/prism/metrics[?live=1] → Metrics. Default mixes in labelled demo history (seeded: true).
export async function GET(req: Request) {
  const live = new URL(req.url).searchParams.get("live") === "1"
  return json(computeMetrics(!live))
}
