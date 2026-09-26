"use client"

import { useEffect, useState, useRef } from "react"

const AGENT_NAMES = [
  "grok-shopper ✓", "gpt-4o-shopper", "claude-shopper", "llama-shopper",
  "research-agent", "chatgpt-user?", "price-watcher", "catalog-crawler",
]

const TASKS = [
  "Buying packet served · Halo One £349",
  "Asked about returns · 30-day policy cited",
  "First offer accepted · £339 signed",
  "Evidence requested · warranty + returns sourced",
  "Haggled £299 → bundle £399",
  "Comparison matrix · 2 variants × 11 rows",
  "Fingerprint mismatch · claims ChatGPT, looks like Qwen",
  "Full-catalog burst · agent pricing withheld",
  "Clone offer failed signature check",
  "Checkout handoff · checkout.haloaudio.store",
]

const REGIONS = ["private-offer", "negotiated", "public", "withheld"]
const STATUSES = [
  { label: "buying",   color: "#4ade80" },
  { label: "buying",   color: "#4ade80" },
  { label: "research", color: "#60a5fa" },
  { label: "unknown",  color: "#facc15" },
  { label: "harvest",  color: "#f87171" },
]
const STATUS_BY_INTENT: Record<string, (typeof STATUSES)[number]> = {
  buy: STATUSES[0], research: STATUSES[2], unknown: STATUSES[3], harvest: STATUSES[4],
}

type AgentRow = {
  id: string
  name: string
  task: string
  region: string
  status: typeof STATUSES[number]
  progress: number
  elapsed: string
  key: number
}

function randomRow(key: number): AgentRow {
  return {
    id: Math.random().toString(36).slice(2, 8).toUpperCase(),
    name: AGENT_NAMES[Math.floor(Math.random() * AGENT_NAMES.length)],
    task: TASKS[Math.floor(Math.random() * TASKS.length)],
    region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
    status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
    progress: Math.floor(Math.random() * 85 + 10),
    elapsed: `${Math.floor(Math.random() * 14 + 1)}m ${Math.floor(Math.random() * 59)}s`,
    key,
  }
}

// Animated progress bar that slowly ticks forward
function ProgressBar({ initial }: { initial: number }) {
  const [pct, setPct] = useState(initial)
  const rafRef = useRef<number>(0)
  const pctRef = useRef(initial)

  useEffect(() => {
    const tick = () => {
      pctRef.current = Math.min(99, pctRef.current + 0.015)
      setPct(Math.round(pctRef.current))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div style={{ width: "100%", height: 2, background: "rgba(0,0,0,0.08)", borderRadius: 9 }}>
      <div style={{
        height: "100%", borderRadius: 9,
        width: `${pct}%`,
        background: "rgba(0,0,0,0.35)",
        transition: "width 0.5s linear",
      }} />
    </div>
  )
}

// Stable seed rows — same on server and client, no random values
const SEED_ROWS: AgentRow[] = [
  { id: "A1B2C3", name: "grok-shopper ✓",  task: "Buying packet served · Halo One £349",         region: "private-offer", status: STATUSES[0], progress: 42, elapsed: "3m 12s", key: 0 },
  { id: "D4E5F6", name: "gpt-4o-shopper",  task: "First offer accepted · £339 signed",            region: "negotiated",    status: STATUSES[0], progress: 67, elapsed: "7m 48s", key: 1 },
  { id: "G7H8I9", name: "chatgpt-user?",   task: "Fingerprint mismatch · claims ChatGPT, looks like Qwen", region: "withheld", status: STATUSES[4], progress: 18, elapsed: "1m 05s", key: 2 },
  { id: "J0K1L2", name: "claude-shopper",  task: "Evidence requested · warranty + returns sourced", region: "negotiated",  status: STATUSES[0], progress: 55, elapsed: "5m 30s", key: 3 },
  { id: "M3N4O5", name: "research-agent",  task: "Comparison matrix · 2 variants × 11 rows",      region: "public",        status: STATUSES[2], progress: 80, elapsed: "11m 22s", key: 4 },
  { id: "P6Q7R8", name: "llama-shopper",   task: "Haggled £299 → bundle £399",                    region: "negotiated",    status: STATUSES[0], progress: 99, elapsed: "14m 01s", key: 5 },
]

type LiveIdentity = {
  sessionId: string
  claimed: string | null
  verified: boolean
  intent: string
  experience?: string
  requests: number
  modelGuess?: { top: { model: string }[]; inLibrary: boolean }
}
type LiveEvent = { id: number; sessionId: string; summary: string }

function liveName(i: LiveIdentity) {
  const model = i.modelGuess?.inLibrary ? i.modelGuess.top[0].model.split("/").pop()!.split("-2024")[0] : null
  const base = (i.claimed ?? "agent").toLowerCase()
  return (model ? `${base} · ${model}` : base).slice(0, 26) + (i.verified ? " ✓" : "")
}

// Real sessions from the Prism backend (/api/prism/events). Empty until a demo agent has run.
function useLiveRows() {
  const [rows, setRows] = useState<AgentRow[] | null>(null)
  useEffect(() => {
    let lastSummary: Record<string, string> = {}
    let since = 0
    let stop = false
    const poll = async () => {
      try {
        const r = await fetch(`/api/prism/events?since=${since}`, { cache: "no-store" })
        if (!r.ok) return
        const s = (await r.json()) as { events: LiveEvent[]; identities: LiveIdentity[] }
        if (since > 0 && s.events.length === 0 && s.identities.length === 0) lastSummary = {}
        for (const e of s.events) {
          since = Math.max(since, e.id)
          if (e.sessionId !== "prism") lastSummary[e.sessionId] = e.summary
        }
        if (!stop && s.identities.length) {
          setRows(
            s.identities.slice(0, 6).map((i, k) => ({
              id: i.sessionId.slice(-6).toUpperCase(),
              name: liveName(i),
              task: lastSummary[i.sessionId] ?? `${i.requests} requests`,
              region: i.experience ?? "public",
              status: STATUS_BY_INTENT[i.intent] ?? STATUSES[3],
              progress: Math.min(99, 20 + i.requests * 8),
              elapsed: "",
              key: 10000 + k,
            })),
          )
        } else if (!stop && s.identities.length === 0) setRows(null)
      } catch {
        // backend not running: keep the illustrative rows
      }
    }
    poll()
    const t = setInterval(poll, 1500)
    return () => {
      stop = true
      clearInterval(t)
    }
  }, [])
  return rows
}

export function LiveAgentFeed() {
  const [demoRows, setRows] = useState<AgentRow[]>(SEED_ROWS)
  const liveRows = useLiveRows()
  const rows = liveRows ?? demoRows
  const [mounted, setMounted] = useState(false)
  const keyRef = useRef(100)

  useEffect(() => {
    // Hydrate with random data only after client mount
    setMounted(true)
    setRows(Array.from({ length: 6 }, (_, i) => randomRow(i)))

    const t = setInterval(() => {
      keyRef.current++
      setRows(prev => [...prev.slice(1), randomRow(keyRef.current)])
    }, 2800)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{
      border: "1px solid rgba(0,0,0,0.08)",
      borderRadius: 16,
      overflow: "hidden",
      background: "rgba(255,255,255,0.7)",
    }}>
      {/* Table header */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "110px 1fr 80px 70px",
        padding: "8px 16px",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        background: "rgba(0,0,0,0.03)",
      }}>
        {["AGENT", "ACTIVITY", "EXPERIENCE", "INTENT"].map(h => (
          <span key={h} style={{ fontSize: 8, letterSpacing: "0.16em", color: "rgba(0,0,0,0.30)", fontFamily: "monospace" }}>{h}</span>
        ))}
      </div>

      {/* Rows */}
      <div style={{ overflow: "hidden" }}>
        {rows.map((row, i) => (
          <div
            key={row.key}
            style={{
              display: "grid",
              gridTemplateColumns: "110px 1fr 80px 70px",
              padding: "10px 16px",
              borderBottom: "1px solid rgba(0,0,0,0.04)",
              gap: 8,
              alignItems: "center",
              animation: i === rows.length - 1 ? "rowSlideIn 0.4s cubic-bezier(0.16,1,0.3,1) both" : "none",
            }}
          >
            {/* Agent */}
            <div>
              <div style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(0,0,0,0.65)", marginBottom: 1 }}>{row.name}</div>
              <div style={{ fontSize: 7.5, fontFamily: "monospace", color: "rgba(0,0,0,0.25)" }}>#{row.id}</div>
            </div>

            {/* Task + progress */}
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 9, color: "rgba(0,0,0,0.50)", lineHeight: 1.35, marginBottom: 5,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{row.task}</div>
              <ProgressBar initial={row.progress} />
            </div>

            {/* Region */}
            <div style={{ fontSize: 8, fontFamily: "monospace", color: "rgba(0,0,0,0.30)" }}>{row.region}</div>

            {/* Status */}
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{
                width: 5, height: 5, borderRadius: "50%",
                background: row.status.color,
                boxShadow: row.status.label === "buying" ? `0 0 6px ${row.status.color}` : "none",
                animation: row.status.label === "buying" ? "statusPulse 2s ease-in-out infinite" : "none",
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 8, fontFamily: "monospace", color: "rgba(0,0,0,0.35)" }}>{row.status.label}</span>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes rowSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes statusPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}

export function LiveAgentCounter() {
  const [count, setCount] = useState(3847)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const t = setInterval(() => {
      setCount(v => v + Math.floor(Math.random() * 3 - 1))
    }, 1200)
    return () => clearInterval(t)
  }, [])

  return (
    <span style={{
      fontFamily: "monospace",
      fontSize: "clamp(3rem, 6vw, 5rem)",
      fontWeight: 300,
      color: "rgba(0,0,0,0.85)",
      lineHeight: 1,
      letterSpacing: "-0.02em",
      transition: "color 0.3s ease",
    }}>
      {mounted ? count.toLocaleString("en-US") : "3,847"}
    </span>
  )
}
