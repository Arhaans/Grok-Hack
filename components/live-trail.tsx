"use client"

import { useEffect, useState } from "react"

type Row = { time: string; action: string; tone: "ok" | "warn" | "bad" }

// Shown until the Prism backend has events (e.g. before any demo agent has run).
const FALLBACK: Row[] = [
  { time: "12:34:21", action: "signed_offer_served", tone: "ok" },
  { time: "12:34:18", action: "lead_value_maximized", tone: "ok" },
  { time: "12:34:15", action: "fingerprint_mismatch", tone: "bad" },
  { time: "12:34:12", action: "copycat_marker_planted", tone: "warn" },
  { time: "12:34:09", action: "checkout_domain_verified", tone: "ok" },
]

type PrismEvent = { id: number; ts: number; kind: string; summary: string }

const TONE: Record<string, Row["tone"]> = {
  incident: "bad",
  probe: "warn",
  verify: "warn",
  scan: "warn",
  negotiation: "ok",
  checkout: "ok",
  cart: "ok",
  decision: "ok",
  format: "ok",
  question: "ok",
}
const DOT = { ok: "bg-green-500/60", warn: "bg-amber-500/70", bad: "bg-red-500/70" }

export function LiveTrail() {
  const [rows, setRows] = useState<Row[]>(FALLBACK)
  useEffect(() => {
    let live: PrismEvent[] = []
    let since = 0
    const poll = async () => {
      try {
        const r = await fetch(`/api/prism/events?since=${since}`, { cache: "no-store" })
        if (!r.ok) return
        const s = (await r.json()) as { events: PrismEvent[]; identities: unknown[] }
        if (s.identities.length === 0 && s.events.length === 0 && since > 0) {
          live = [] // backend was reset
          since = 0
          setRows(FALLBACK)
          return
        }
        for (const e of s.events) since = Math.max(since, e.id)
        live = [...live, ...s.events.filter((e) => e.kind !== "request")].slice(-5)
        if (live.length)
          setRows(
            [...live].reverse().map((e) => ({
              time: new Date(e.ts).toLocaleTimeString("en-GB", { hour12: false }),
              action: e.summary,
              tone: TONE[e.kind] ?? "ok",
            })),
          )
      } catch {
        // backend not running: keep the fallback
      }
    }
    poll()
    const t = setInterval(poll, 1500)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="space-y-2">
      {rows.map((log, i) => (
        <div
          key={`${log.time}-${i}-${log.action}`}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-black/[0.02] hover:bg-black/[0.04] transition-colors border border-black/[0.04] group cursor-pointer"
          style={{ animation: `fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms both` }}
        >
          <span className="text-[10px] text-black/25 font-mono min-w-[60px]">{log.time}</span>
          <span className="text-[11px] text-black/50 font-light flex-1 truncate" title={log.action}>
            {log.action}
          </span>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOT[log.tone]}`} />
        </div>
      ))}
    </div>
  )
}
