import { body, json, originOf } from "@/lib/http"
import { scanClone } from "@/lib/scan"

// POST /api/prism/scan { url? } → { incident } (null when no markers are found)
export async function POST(req: Request) {
  const b = await body<{ url: string }>(req)
  const incident = await scanClone(originOf(req), b.url)
  return json({ incident })
}
