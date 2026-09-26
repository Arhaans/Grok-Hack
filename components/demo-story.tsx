"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { AgentIdentity, Incident, ModelGuess, PrismState, RunResult, RunStep, Tactic } from "@/lib/types"

// One-button story: normal agents → copycat → trace → real buyer → results.
// Deterministic: fixed agents, recorded buyer lines, signed prices. Everything shown comes from the Prism backend.

type Line = { from: "agent" | "prism"; text: string; voice?: string }
type Shopper = {
  model: string
  label: string
  claimed: string
  live: boolean
  fingerprint?: string
  handshake?: string
  tactic?: Tactic
  lines: Line[]
  waiting?: "agent" | "prism"
  total?: number
  protocol: string[] // the real agentic-commerce calls this agent made, in order
}
type Story = {
  shoppers: Shopper[]
  copycat?: { claimed: string; fingerprint?: string; distance?: number; scraped?: number; identity?: AgentIdentity }
  incident?: Incident
  buyer?: { outletPrice?: number; reasons: string[]; total?: number; verifiedAs?: string }
  stop?: { blocked: number; signedOffers: number; listings: number }
}

const CHAPTERS = [
  { id: "shoppers", title: "Real shoppers arrive", line: "Three AI agents shop the store. Prism fingerprints each model and offers the deal that converts it." },
  { id: "copycat", title: "A copycat arrives", line: "It claims to be ChatGPT. Its answers say otherwise. Prism withholds prices and signed offers and refuses its scraping burst. The public listings it grabbed first are secretly marked." },
  { id: "clone", title: "It clones the store", line: "Minutes later an outlet appears: same store, lower prices, no returns, its own checkout." },
  { id: "trace", title: "Prism traces it", line: "Every description Prism served carried an invisible marker. The clone copied it, and it leads straight back to the visit." },
  { id: "stop", title: "Prism stops it", line: "Blocked at the door, nothing signed to sell with, and its domain flagged to every agent that checks. The evidence is ready for a takedown." },
  { id: "buyer", title: "The real buyer can't be fooled", line: "A signed agent finds the cheaper outlet, checks its offer with the merchant, and buys from the real store." },
  { id: "results", title: "Results", line: "Every agent identified, every buyer served on its own terms, and the copycat never gets paid." },
] as const

const SHOPPERS = [
  { model: "gpt-4o", label: "ChatGPT agent", claimed: "ChatGPT-User", live: false, lines: [] as Line[], protocol: [] as string[] },
  { model: "claude-3.5-sonnet", label: "Claude agent", claimed: "Claude-User", live: false, lines: [] as Line[], protocol: [] as string[] },
  { model: "llama-3.2-3b-live", label: "Llama agent · live on this laptop", claimed: "ShopPilot", live: true, lines: [] as Line[], protocol: [] as string[] },
]

type StreamMsg = { type: "step"; step: RunStep } | { type: "done"; result: RunResult } | { type: "error"; error: string }

// Read an NDJSON demo run, calling onStep as each step arrives.
async function runStream(q: string, onStep: (s: RunStep) => void): Promise<RunResult | undefined> {
  const r = await fetch(`/api/demo/run?${q}&stream=1`, { method: "POST" })
  const reader = r.body!.getReader()
  const dec = new TextDecoder()
  let buf = ""
  let result: RunResult | undefined
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    buf += dec.decode(value, { stream: true })
    let nl: number
    while ((nl = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, nl)
      buf = buf.slice(nl + 1)
      if (!line) continue
      const m = JSON.parse(line) as StreamMsg
      if (m.type === "step") onStep(m.step)
      else if (m.type === "done") result = m.result
    }
  }
  return result
}

function Typing({ who, dark }: { who: string; dark?: boolean }) {
  return (
    <div className={`flex ${dark ? "justify-end" : "justify-start"}`}>
      <div className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-[10px] ${dark ? "bg-black/80 text-white/60" : "bg-black/[0.05] text-black/45"}`}>
        <span className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-1 w-1 rounded-full bg-current" style={{ animation: `storyDot 1s ease-in-out ${i * 0.15}s infinite` }} />
          ))}
        </span>
        {who}
      </div>
    </div>
  )
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const short = (m?: string) => m?.split("/").pop()?.replace(/-Instruct$/, "").replace(/-2024-05-13|-20240620/, "")

// ─── small animated pieces ───────────────────────────────────────────────────
function Appear({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <div className={className} style={{ animation: `storyIn 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms both` }}>
      {children}
    </div>
  )
}

function Meter({ label, value, tone, delay = 0 }: { label: string; value: number; tone: string; delay?: number }) {
  const [w, setW] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setW(value), 150 + delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return (
    <div className="flex items-center gap-2">
      <span className="w-9 text-[9px] uppercase tracking-widest text-black/35">{label}</span>
      <div className="h-1.5 flex-1 rounded-full bg-black/[0.06]">
        <div className={`h-1.5 rounded-full ${tone}`} style={{ width: `${w}%`, transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)" }} />
      </div>
      <span className="w-7 text-right font-mono text-[10px] text-black/45">{value}</span>
    </div>
  )
}

function Counter({ to, prefix = "", delay = 0 }: { to: number; prefix?: string; delay?: number }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    let raf = 0
    const start = performance.now() + delay
    const tick = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - start) / 1100))
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, delay])
  return (
    <span>
      {prefix}
      {v}
    </span>
  )
}

// The glowing trace: copied text on the outlet → the visit that took it.
function Trace({ incident, copycat }: { incident: Incident; copycat: Story["copycat"] }) {
  return (
    <div className="relative">
      <Appear>
        <div className="rounded-xl border border-red-400/50 bg-red-50/80 p-3">
          <div className="text-[9px] uppercase tracking-widest text-red-700/70">Found on {incident.cloneUrl.replace("https://", "")}</div>
          <div className="mt-1 text-[11px] leading-snug text-black/65">
            “{incident.copiedSnippet.slice(0, 90)}…”
            <span className="ml-1 rounded bg-red-600 px-1 font-mono text-[9px] text-white" style={{ animation: "storyPulse 1.6s ease-in-out infinite" }}>
              {incident.markerFound}
            </span>
          </div>
        </div>
      </Appear>
      <svg className="mx-auto block h-16 w-10 overflow-visible" viewBox="0 0 40 64">
        <defs>
          <linearGradient id="traceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <filter id="traceGlow" x="-200%" y="-50%" width="500%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M20 0 C 36 20, 4 44, 20 64"
          fill="none"
          stroke="url(#traceGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          filter="url(#traceGlow)"
          style={{ strokeDasharray: 90, strokeDashoffset: 90, animation: "storyDraw 1.4s cubic-bezier(0.65,0,0.35,1) 0.5s forwards" }}
        />
      </svg>
      <Appear delay={1700}>
        <div className="rounded-xl border border-black/10 bg-white/80 p-3 shadow-[0_0_30px_rgba(168,85,247,0.25)]">
          <div className="text-[9px] uppercase tracking-widest text-black/40">Traced to visit</div>
          <div className="mt-1 font-mono text-xs text-black/75">{incident.sourceSessionId}</div>
          <div className="mt-1 text-[11px] text-black/55">
            claimed <b>{incident.sourceClaimed}</b>, fingerprint <b className="text-red-700">{short(copycat?.fingerprint)}</b>
          </div>
        </div>
      </Appear>
    </div>
  )
}

// ─── main component ──────────────────────────────────────────────────────────
export function DemoStory() {
  const [chapter, setChapter] = useState(-1) // -1 idle, 0..5 playing/finished
  const [live, setLive] = useState(false) // replay (default): recorded + instant; live: Claude seller + Llama on this laptop
  const [story, setStory] = useState<Story>({ shoppers: [] })
  const [frameKey, setFrameKey] = useState(0)
  const [status, setStatus] = useState<{ fingerprint?: boolean; ok: boolean } | null>(null)
  const identities = useRef<AgentIdentity[]>([])
  const [ids, setIds] = useState<AgentIdentity[]>([])

  useEffect(() => {
    fetch("/api/demo/warmup", { method: "POST" })
      .then((r) => r.json())
      .then((w) => setStatus({ ok: true, fingerprint: w.fingerprintSidecar }))
      .catch(() => setStatus({ ok: false }))
    const poll = async () => {
      try {
        const s = (await (await fetch("/api/prism/events?since=999999999", { cache: "no-store" })).json()) as PrismState
        identities.current = s.identities
        setIds(s.identities)
      } catch {
        /* backend down */
      }
    }
    const t = setInterval(poll, 800)
    return () => clearInterval(t)
  }, [])

  const run = useCallback(async (q: string) => (await (await fetch(`/api/demo/run?${q}`, { method: "POST" })).json()) as RunResult, [])

  const updateShopper = (i: number, fn: (x: Shopper) => Shopper) =>
    setStory((st) => ({ ...st, shoppers: st.shoppers.map((x, j) => (j === i ? fn(x) : x)) }))

  const onShopperStep = (i: number) => (st: RunStep) => {
    const d = (st.data ?? {}) as Record<string, unknown>
    const call = ({ handshake: "Prism handshake", fetch_packet: "get_product", cart: "POST /checkout-sessions", checkout: "complete · spt_… · order_created" } as Record<string, string>)[st.step]
    if (call) updateShopper(i, (x) => ({ ...x, protocol: [...x.protocol, call] }))
    if (st.step === "handshake") updateShopper(i, (x) => ({ ...x, handshake: st.label.replace(/^Answered 8 handshake probes /, "") }))
    if (st.step === "fingerprinted") updateShopper(i, (x) => ({ ...x, fingerprint: (d as unknown as ModelGuess).top?.[0]?.model }))
    if (st.step === "tactic") updateShopper(i, (x) => ({ ...x, tactic: d as unknown as Tactic, waiting: "agent" }))
    if (st.step === "negotiate") {
      const from = d.from as "agent" | "prism"
      const text = st.label.replace(/^(Agent|Prism): "/, "").replace(/"$/, "")
      updateShopper(i, (x) => ({ ...x, lines: [...x.lines, { from, text, voice: d.voice as string | undefined }], waiting: from === "agent" ? "prism" : "agent" }))
    }
    if (st.step === "cart") updateShopper(i, (x) => ({ ...x, waiting: undefined }))
    if (st.step === "checkout")
      updateShopper(i, (x) => ({ ...x, waiting: undefined, total: (d.handoff as { total?: number } | undefined)?.total }))
  }

  const [auto, setAuto] = useState(false)
  const [preparing, setPreparing] = useState(false)
  const started = chapter >= 0
  const last = CHAPTERS.length - 1

  // Start: run the agents once. Chapter 1 streams live; everything later is computed in the background,
  // so every other slide is instant and you can go back and forth freely.
  const start = async () => {
    if (preparing) return
    setPreparing(true)
    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth", block: "start" })
    setStory({ shoppers: SHOPPERS.map((x) => ({ ...x, lines: [], protocol: [] })) })
    await fetch("/api/prism/reset", { method: "POST" })
    setFrameKey((k) => k + 1)
    setChapter(0)

    const mode = live ? "live" : "replay"
    const shoppersDone = Promise.all(SHOPPERS.map((x, i) => runStream(`agent=shopper&model=${x.model}&mode=${mode}&pace=${live ? 250 : 420}`, onShopperStep(i))))
    const background = (async () => {
      const cc = await run("agent=copycat&probeAnswers=recorded&autoScan=0&pace=0")
      const ccGuess = cc.steps.find((x) => x.step === "fingerprinted")?.data as ModelGuess | undefined
      const scrape = cc.steps.find((x) => x.step === "scrape")?.data as { skus?: string[]; blocked?: number; signedOffers?: number } | undefined
      setStory((st) => ({
        ...st,
        copycat: {
          claimed: "ChatGPT-User",
          fingerprint: ccGuess?.top[0]?.model,
          distance: ccGuess?.top[0]?.distance,
          scraped: scrape?.skus?.length,
          identity: identities.current.find((id) => id.sessionId === cc.sessionId),
        },
        stop: { blocked: scrape?.blocked ?? 0, signedOffers: scrape?.signedOffers ?? 0, listings: scrape?.skus?.length ?? 0 },
      }))
      const scan = (await (await fetch("/api/prism/scan", { method: "POST", body: "{}" })).json()) as { incident: Incident | null }
      setStory((st) => ({ ...st, incident: scan.incident ?? undefined }))
      const buyer = await run("agent=buyer&brain=scripted&pace=0")
      const outlet = (buyer.steps.find((x) => x.step === "check_clone")?.data as { price: number; problems: string[] }[] | undefined) ?? []
      const cheapest = [...outlet].sort((x, y) => x.price - y.price)[0]
      const hand = buyer.steps.find((x) => x.step === "checkout")?.data as { total?: number } | undefined
      setStory((st) => ({ ...st, buyer: { outletPrice: cheapest?.price, reasons: cheapest?.problems ?? [], total: hand?.total, verifiedAs: "grok-shopper" } }))
    })()
    await Promise.all([shoppersDone, background])
    setPreparing(false)
  }

  const goTo = useCallback((i: number) => setChapter(Math.max(0, Math.min(last, i))), [last])
  const next = useCallback(() => setChapter((c) => (c < 0 ? c : Math.min(last, c + 1))), [last])
  const back = useCallback(() => setChapter((c) => (c <= 0 ? c : c - 1)), [])

  // ← / → keys step through the slides
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!started) return
      if (e.key === "ArrowRight") next()
      if (e.key === "ArrowLeft") back()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [started, next, back])

  // Optional auto-play: 5 s per slide (the first slide waits for the shoppers to finish)
  useEffect(() => {
    if (!auto || !started || chapter >= last) return
    if (chapter === 0 && story.shoppers.some((x) => x.total === undefined)) return
    const t = setTimeout(next, chapter === 0 ? 2500 : 5000)
    return () => clearTimeout(t)
  }, [auto, started, chapter, last, next, story.shoppers])

  // The frame shows the copycat outlet on the clone / trace / stop slides
  const clone = ["clone", "trace", "stop"].includes(CHAPTERS[chapter]?.id ?? "") && !!story.copycat
  const playing = preparing

  const downloadEvidence = () => {
    const blob = new Blob([JSON.stringify({ incident: story.incident, copycat: story.copycat, stopped: story.stop }, null, 2)], { type: "application/json" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `prism-evidence-${story.incident?.id ?? "incident"}.json`
    a.click()
  }

  const s = story
  const revenue = s.shoppers.reduce((a, x) => a + (x.total ?? 0), 0) + (s.buyer?.total ?? 0)
  const current = chapter >= 0 ? CHAPTERS[chapter] : null

  return (
    <section id="demo" className="relative scroll-mt-0 px-4 pb-24 pt-24 md:px-8">
      <style>{`
        @keyframes storyIn { from { opacity: 0; filter: blur(10px); transform: translateY(14px) } to { opacity: 1; filter: blur(0); transform: none } }
        @keyframes storyDraw { to { stroke-dashoffset: 0 } }
        @keyframes storyPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(220,38,38,.6) } 50% { box-shadow: 0 0 0 6px rgba(220,38,38,0) } }
        @keyframes storyShine { from { background-position: 0% 50% } to { background-position: 200% 50% } }
        @keyframes storyDot { 0%,100% { opacity: .25; transform: translateY(0) } 50% { opacity: 1; transform: translateY(-2px) } }
      `}</style>

      {/* Header + the one button */}
      <div className="mx-auto flex max-w-[1500px] flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-black/40">Live demo · prismskincare.com</div>
          <h2 className="mt-3 text-4xl font-light leading-[1.02] tracking-tight md:text-6xl">
            Watch Prism{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(90deg,#3b82f6,#a855f7,#ef4444,#f59e0b,#3b82f6)", backgroundSize: "200% 100%", animation: "storyShine 6s linear infinite" }}
            >
              see every agent.
            </span>
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {!started ? (
            <button
              onClick={start}
              className="group relative overflow-hidden rounded-full bg-black px-7 py-4 text-sm tracking-wide text-white transition-transform hover:scale-[1.03]"
            >
              <span
                className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                style={{ backgroundImage: "linear-gradient(90deg,#3b82f6,#a855f7,#ef4444,#3b82f6)", backgroundSize: "200% 100%", animation: "storyShine 3s linear infinite" }}
              />
              <span className="relative">▶ Start the story</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={back} disabled={chapter <= 0} className="rounded-full border border-black/15 px-5 py-3.5 text-sm text-black/70 transition-colors hover:bg-black/[0.04] disabled:opacity-30">
                ◀ Back
              </button>
              <button
                onClick={next}
                disabled={chapter >= last}
                className="group relative overflow-hidden rounded-full bg-black px-7 py-3.5 text-sm tracking-wide text-white transition-transform hover:scale-[1.03] disabled:opacity-40"
              >
                <span
                  className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ backgroundImage: "linear-gradient(90deg,#3b82f6,#a855f7,#ef4444,#3b82f6)", backgroundSize: "200% 100%", animation: "storyShine 3s linear infinite" }}
                />
                <span className="relative">Next ▶</span>
              </button>
              <button
                onClick={() => setAuto((v) => !v)}
                className={`rounded-full border px-3 py-2 text-[10px] tracking-widest ${auto ? "border-black/60 bg-black/[0.06] text-black/80" : "border-black/10 text-black/45"}`}
              >
                {auto ? "❚❚ AUTO" : "▷ AUTO"}
              </button>
              <button onClick={start} disabled={preparing} className="rounded-full border border-black/10 px-3 py-2 text-[10px] tracking-widest text-black/45 disabled:opacity-30">
                ↻ RESTART
              </button>
            </div>
          )}
          <button
            onClick={() => !playing && setLive((v) => !v)}
            disabled={playing}
            title="Replay uses recorded answers and replies (instant). Live runs Claude Sonnet as the seller and Llama 3.2 on this laptop as a buyer."
            className={`rounded-full border px-3 py-2 text-[10px] tracking-widest transition-colors ${live ? "border-emerald-500/50 bg-emerald-50 text-emerald-700" : "border-black/10 text-black/45"}`}
          >
            {live ? "● LIVE MODELS" : "○ REPLAY"}
          </button>
          {status && (
            <span className="hidden text-[10px] tracking-widest text-black/35 md:inline">
              {status.ok ? "● BACKEND" : "○ BACKEND"} · {status.fingerprint ? "● LLMMAP" : "○ LLMMAP (recorded)"}
            </span>
          )}
        </div>
      </div>

      {/* Chapter tabs: click to jump */}
      <div className="mx-auto mt-8 flex max-w-[1500px] gap-2">
        {CHAPTERS.map((c, i) => (
          <button key={c.id} onClick={() => started && goTo(i)} disabled={!started} className="group flex-1 text-left disabled:cursor-default">
            <div className="h-1 overflow-hidden rounded-full bg-black/[0.07]">
              <div
                className="h-1 rounded-full"
                style={{
                  width: i <= chapter ? "100%" : "0%",
                  transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
                  background: c.id === "copycat" || c.id === "clone" ? "#ef4444" : c.id === "trace" ? "#a855f7" : c.id === "stop" ? "#10b981" : "#111",
                }}
              />
            </div>
            <div className={`mt-2 hidden text-[10px] tracking-wide transition-colors md:block ${i === chapter ? "text-black/85" : "text-black/30 group-hover:text-black/55"}`}>
              {i + 1}. {c.title}
            </div>
          </button>
        ))}
      </div>

      {/* Store + Prism's view */}
      <div className="mx-auto mt-6 grid max-w-[1500px] grid-cols-1 gap-5 lg:grid-cols-[1fr_400px]">
        {/* The one iframe */}
        <div
          className={`overflow-hidden rounded-2xl border bg-white transition-all duration-700 ${clone ? "border-red-500/70 shadow-[0_0_60px_rgba(239,68,68,0.25)]" : "border-black/10 shadow-[0_20px_80px_rgba(0,0,0,0.08)]"}`}
        >
          <div className={`flex items-center gap-3 border-b px-4 py-2.5 transition-colors duration-700 ${clone ? "border-red-200 bg-red-50" : "border-black/[0.06] bg-[#fafaf8]"}`}>
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
            </div>
            <div className={`flex-1 rounded-md px-3 py-1 font-mono text-[11px] ${clone ? "bg-white text-red-700" : "bg-black/[0.04] text-black/50"}`}>
              {clone ? "⚠ prism-skincare-outlet.shop" : "🔒 prismskincare.com"}
            </div>
            <span className={`text-[10px] tracking-widest ${clone ? "text-red-600" : "text-emerald-600"}`}>{clone ? "COPYCAT" : "PRISM INSTALLED"}</span>
          </div>
          <iframe key={`${frameKey}-${clone}`} src={clone ? "/store?clone=1" : "/store"} title="Prism Skincare" className="h-[calc(100vh-190px)] min-h-[620px] w-full" />
        </div>

        {/* Prism sees */}
        <div className="flex flex-col gap-3">
          {!current && (
            <Appear>
              <div className="rounded-2xl border border-black/[0.07] bg-white/70 p-6">
                <div className="text-[10px] uppercase tracking-widest text-black/35">The problem</div>
                <p className="mt-3 text-lg font-light leading-snug text-black/80">
                  Your next customer is an AI agent. So is your next copycat. Today your store can&apos;t tell them apart.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-black/45">
                  Agents already shop through UCP and ACP checkout sessions and sign their requests with Web Bot Auth. But a signature only says{" "}
                  <i>who runs</i> the agent (ChatGPT&apos;s just says &ldquo;chatgpt.com&rdquo;), never which model, and nothing in the protocols lets
                  a store tailor its offer or trace a scraper.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-black/45">
                  Press <b className="text-black/70">Start the story</b>, then step through with <b className="text-black/70">Next</b> or the arrow keys, to watch Prism identify every agent, sell to each one on its own terms, and stop
                  the one that clones the store. Or just use the shop.
                </p>
              </div>
            </Appear>
          )}

          {current && (
            <Appear key={current.id}>
              <div className="rounded-2xl bg-black p-5 text-white">
                <div className="text-[10px] uppercase tracking-widest text-white/40">
                  Chapter {chapter + 1} / {CHAPTERS.length}
                </div>
                <div className="mt-1 text-xl font-light">{current.title}</div>
                <p className="mt-2 text-[13px] leading-relaxed text-white/60">{current.line}</p>
              </div>
            </Appear>
          )}

          {/* 1. shoppers */}
          {chapter === 0 &&
            s.shoppers.map((x, i) => (
              <Appear key={x.model} delay={i * 200}>
                <div className={`rounded-xl border bg-white/85 p-3.5 ${x.live ? "border-emerald-400/60 shadow-[0_0_24px_rgba(16,185,129,0.15)]" : "border-black/[0.07]"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-black/80">
                      {x.live && <span className="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />}
                      {x.label}
                    </span>
                    {x.total !== undefined ? (
                      <span className="font-mono text-sm text-emerald-700" style={{ animation: "storyIn .6s both" }}>
                        ✓ ${x.total}
                      </span>
                    ) : (
                      <span className="text-[9px] tracking-widest text-black/30">{x.fingerprint ? "NEGOTIATING" : "HANDSHAKE"}</span>
                    )}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px]">
                    {x.fingerprint ? (
                      <span className="rounded-full bg-black/[0.05] px-2 py-0.5 font-mono text-black/55" style={{ animation: "storyIn .6s both" }}>
                        fingerprint · {short(x.fingerprint)}
                      </span>
                    ) : (
                      <span className="text-black/35">{x.live && live ? "answering 8 probes live on this laptop…" : "answering 8 probes…"}</span>
                    )}
                    {x.tactic && (
                      <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-sky-700" style={{ animation: "storyIn .6s both" }}>
                        {x.tactic.name}
                      </span>
                    )}
                  </div>
                  {(x.lines.length > 0 || x.waiting) && (
                    <div className="mt-2.5 space-y-1.5">
                      {x.lines.map((l, k) => (
                        <div key={k} className={`flex ${l.from === "prism" ? "justify-end" : "justify-start"}`} style={{ animation: "storyIn .5s both" }}>
                          <div
                            className={`max-w-[90%] rounded-2xl px-2.5 py-1.5 text-[11px] leading-snug ${l.from === "prism" ? "bg-black/85 text-white" : "bg-black/[0.05] text-black/70"}`}
                          >
                            {l.text}
                            {l.voice && l.voice !== "template" && l.voice !== "scripted" && (
                              <span className={`mt-0.5 block text-[8px] uppercase tracking-widest ${l.from === "prism" ? "text-white/40" : "text-black/30"}`}>
                                {(l.voice.includes("recorded") ? "recorded · " : "live · ") +
                                  (l.voice.startsWith("claude") ? "Claude Sonnet" : l.voice.replace(/ \((local|recorded)\)/, ""))}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {x.waiting === "prism" && <Typing who={live ? "Prism · Claude is writing" : "Prism is replying"} dark />}
                      {x.waiting === "agent" && x.live && live && <Typing who="Llama is typing" />}
                    </div>
                  )}
                  {x.protocol.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-1 border-t border-black/[0.05] pt-2 font-mono text-[9px] text-black/40">
                      {x.protocol.map((c, k) => (
                        <span key={k} className="flex items-center gap-1" style={{ animation: "storyIn .5s both" }}>
                          {k > 0 && <span className="text-black/20">→</span>}
                          <span className={c.startsWith("Prism") ? "text-violet-600" : ""}>{c}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Appear>
            ))}

          {/* 2. copycat */}
          {chapter === 1 && (
            <Appear>
              <div className="rounded-xl border border-red-400/60 bg-white/85 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-black/80">Claims: ChatGPT-User</span>
                  <span className="rounded-full bg-black/[0.05] px-2 py-0.5 text-[10px] text-black/45">unsigned</span>
                </div>
                {s.copycat?.fingerprint ? (
                  <>
                    <Appear delay={200}>
                      <div className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-[12px] text-red-700">
                        Fingerprint: <b>{short(s.copycat.fingerprint)}</b> (distance {s.copycat.distance?.toFixed(1)}), not ChatGPT → <b>impostor</b>
                      </div>
                    </Appear>
                    <Appear delay={500}>
                      <div className="mt-2 text-[11px] text-black/55">Withheld: no prices, no signed offers · grabbed {s.copycat.scraped} public listings, then Prism refused {s.stop?.blocked ?? 0} more requests</div>
                    </Appear>
                    {s.copycat.identity && (
                      <div className="mt-3 space-y-1.5">
                        <Meter label="trust" value={s.copycat.identity.scores.trust} tone="bg-emerald-500/70" delay={600} />
                        <Meter label="lead" value={s.copycat.identity.scores.lead} tone="bg-sky-500/70" delay={700} />
                        <Meter label="risk" value={s.copycat.identity.scores.risk} tone="bg-red-500/80" delay={800} />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="mt-3 text-[11px] tracking-widest text-black/35">RUNNING HANDSHAKE…</div>
                )}
              </div>
            </Appear>
          )}

          {/* 3. clone */}
          {chapter === 2 && (
            <Appear>
              <div className="rounded-xl border border-red-400/60 bg-red-50/80 p-4 text-[12px] leading-relaxed text-black/65">
                <div className="text-[10px] uppercase tracking-widest text-red-700/70">prism-skincare-outlet.shop</div>
                <div className="mt-2">Serum 50ml: $68 → <b className="text-red-700">$54</b></div>
                <div>Returns: 30 days → <b className="text-red-700">all sales final</b></div>
                <div>Checkout: <b className="text-red-700">pay.prism-skincare-outlet.shop</b></div>
              </div>
            </Appear>
          )}

          {/* 4. trace */}
          {chapter === 3 && (s.incident ? <Trace incident={s.incident} copycat={s.copycat} /> : <div className="text-[11px] tracking-widest text-black/35">SCANNING THE OUTLET…</div>)}

          {/* 5. stop */}
          {chapter === 4 && (
            <div className="space-y-3">
              {[
                {
                  t: "Blocked at the door",
                  d: s.stop
                    ? `Withheld agent: 0 prices, ${s.stop.signedOffers} signed offers. It grabbed ${s.stop.listings} public listings (all marked); Prism refused its next ${s.stop.blocked} requests.`
                    : "…",
                },
                { t: "Nothing to sell with", d: "Every offer on the outlet is forged. Agents verify offers with the merchant, so the clone can't close a single agent sale." },
                {
                  t: "Flagged to every agent",
                  d: s.incident ? `${s.incident.cloneUrl.replace("https://", "")} is now flagged: any agent that checks an offer from it is told it's a traced copycat.` : "…",
                },
              ].map((k, i) => (
                <Appear key={k.t} delay={i * 180}>
                  <div className="rounded-xl border border-emerald-500/30 bg-white/85 p-3.5">
                    <div className="flex items-center gap-2 text-sm text-black/80">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[11px] text-white">✓</span>
                      {k.t}
                    </div>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-black/55">{k.d}</p>
                  </div>
                </Appear>
              ))}
              <Appear delay={600}>
                <button
                  onClick={downloadEvidence}
                  disabled={!s.incident}
                  className="w-full rounded-xl border border-black/10 bg-black px-4 py-3 text-left text-[12px] text-white transition-transform hover:scale-[1.01] disabled:opacity-40"
                >
                  ⬇ Download takedown evidence
                  <span className="mt-0.5 block text-[10px] text-white/50">marker, visit, claimed vs fingerprinted model, copied text, price changes, fake checkout</span>
                </button>
              </Appear>
            </div>
          )}

          {/* 5. real buyer */}
          {chapter === 5 && (
            <Appear>
              <div className="rounded-xl border border-black/[0.07] bg-white/85 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-black/80">Grok Shopper</span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-700">✓ Web Bot Auth signature · private offer</span>
                </div>
                {s.buyer ? (
                  <>
                    <Appear delay={150}>
                      <div className="mt-3 text-[12px] text-black/60">
                        Found the outlet at <b>${s.buyer.outletPrice}</b>. Checked the offer with Prism Skincare:
                      </div>
                    </Appear>
                    <Appear delay={450}>
                      <div className="mt-2 space-y-1">
                        {s.buyer.reasons.map((r) => (
                          <div key={r} className="rounded-md bg-red-500/10 px-2 py-1 text-[11px] text-red-700">
                            ✗ {r}
                          </div>
                        ))}
                      </div>
                    </Appear>
                    <Appear delay={900}>
                      <div className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-[12px] text-emerald-800">
                        ✓ Bought from prismskincare.com for <b>${s.buyer.total}</b>
                      </div>
                    </Appear>
                  </>
                ) : (
                  <div className="mt-3 text-[11px] tracking-widest text-black/35">SHOPPING…</div>
                )}
              </div>
            </Appear>
          )}

          {/* 6. results */}
          {chapter === 6 && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { v: s.shoppers.length + 2, l: "agents identified" },
                { v: 4, l: "models fingerprinted" },
                { v: revenue, l: "revenue from agents", prefix: "$" },
                { v: 1, l: "copycat traced and flagged" },
                { v: s.stop?.blocked ?? 0, l: "scraping requests refused" },
                { v: 0, l: "sales lost to the clone" },
              ].map((k, i) => (
                <Appear key={k.l} delay={i * 120}>
                  <div className="rounded-xl border border-black/[0.07] bg-white/80 p-4">
                    <div className="text-3xl font-light tracking-tight">
                      <Counter to={k.v} prefix={k.prefix} delay={i * 120} />
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-widest text-black/40">{k.l}</div>
                  </div>
                </Appear>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
