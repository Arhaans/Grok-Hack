"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { AgentIdentity, Incident, ModelGuess, PrismState, RunResult, RunStep, Tactic } from "@/lib/types"

// The demo as a slideshow built around three problems Prism solves:
//   ① you can't see who's shopping  ② every agent gets the same offer  ③ copycats clone you
// Start runs every agent once (slide 1-2 stream live, the rest is computed in the background).
// It auto-plays; any interaction switches it to manual. Everything shown comes from the Prism backend.

type Line = { from: "agent" | "prism"; text: string; voice?: string }
type Shopper = {
  model: string
  label: string
  claimed: string
  live: boolean
  fingerprint?: string
  distance?: number
  tactic?: Tactic
  lines: Line[]
  waiting?: "agent" | "prism"
  total?: number
  protocol: string[]
}
type Story = {
  shoppers: Shopper[]
  copycat?: { claimed: string; fingerprint?: string; distance?: number; scraped?: number; identity?: AgentIdentity }
  incident?: Incident
  buyer?: { outletPrice?: number; reasons: string[]; total?: number }
  stop?: { blocked: number; signedOffers: number; listings: number }
}

const PROBLEMS = [
  { n: 1, short: "Who's shopping?", solved: "Every agent identified" },
  { n: 2, short: "One offer for everyone", solved: "A deal per model" },
  { n: 3, short: "Copycats", solved: "Stopped and traced" },
]

const CHAPTERS = [
  {
    id: "identify",
    problem: 1,
    title: "You can't see who's shopping",
    fix: "Prism fingerprints every agent",
    line: "A signature only names the operator. Prism's 8-question handshake reveals the model behind each agent, including a Llama running on this laptop.",
  },
  {
    id: "negotiate",
    problem: 2,
    title: "Every agent gets the same offer",
    fix: "Prism negotiates per model",
    line: "One flat price loses the haggler and under-serves the careful buyer. Prism picks the tactic that converts each model and signs the price.",
  },
  {
    id: "copycat",
    problem: 3,
    title: "A copycat walks in",
    fix: "Exposed and blocked at the door",
    line: "It claims to be ChatGPT; its answers say Qwen. No prices, no signed offers, and its scraping burst is refused. What it grabbed first is secretly marked.",
  },
  { id: "clone", problem: 3, title: "It clones your store anyway", fix: "…and Prism is watching", line: "An outlet appears: same shop, lower prices, no returns, its own checkout." },
  {
    id: "trace",
    problem: 3,
    title: "Prism traces it",
    fix: "Back to the exact visit",
    line: "Every description Prism served carried an invisible marker. The clone copied it, and it leads straight back to the visit.",
  },
  {
    id: "stop",
    problem: 3,
    title: "Prism stops it",
    fix: "Three walls, one click to take it down",
    line: "Blocked at the door, nothing signed to sell with, and its domain flagged to every agent that checks.",
  },
  {
    id: "buyer",
    problem: 3,
    title: "Real buyers can't be fooled",
    fix: "The clone makes $0",
    line: "A signed agent finds the cheaper outlet, checks its offer with the merchant, and buys from the real store.",
  },
  { id: "results", problem: 0, title: "Three problems, solved", fix: "One line to install", line: "" },
] as const
type ChapterId = (typeof CHAPTERS)[number]["id"]

const SHOPPERS = [
  { model: "gpt-4o", label: "ChatGPT agent", claimed: "ChatGPT-User", live: false },
  { model: "claude-3.5-sonnet", label: "Claude agent", claimed: "Claude-User", live: false },
  { model: "llama-3.2-3b-live", label: "Llama agent", claimed: "ShopPilot", live: true },
]
const FLAT_PRICE = 68

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const short = (m?: string) => m?.split("/").pop()?.replace(/-Instruct$/, "").replace(/-2024-05-13|-20240620/, "")

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

function Counter({ to, prefix = "", suffix = "", delay = 0 }: { to: number; prefix?: string; suffix?: string; delay?: number }) {
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
      {suffix}
    </span>
  )
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

function Waiting({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-dashed border-black/10 p-5 text-[11px] tracking-widest text-black/35">
      <span className="h-2 w-2 animate-pulse rounded-full bg-black/30" />
      {label}
    </div>
  )
}

// The glowing trace: copied text on the outlet → the visit that took it.
function Trace({ incident, copycat }: { incident: Incident; copycat: Story["copycat"] }) {
  return (
    <div className="relative">
      <Appear>
        <div className="rounded-xl border border-red-400/50 bg-red-50/80 p-4">
          <div className="text-[9px] uppercase tracking-widest text-red-700/70">Found on {incident.cloneUrl.replace("https://", "")}</div>
          <div className="mt-1.5 text-[12px] leading-snug text-black/65">
            “{incident.copiedSnippet.slice(0, 110)}…”
            <span className="ml-1 rounded bg-red-600 px-1 font-mono text-[9px] text-white" style={{ animation: "storyPulse 1.6s ease-in-out infinite" }}>
              {incident.markerFound}
            </span>
          </div>
        </div>
      </Appear>
      <svg className="mx-auto block h-20 w-12 overflow-visible" viewBox="0 0 40 64">
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
        <div className="rounded-xl border border-black/10 bg-white/85 p-4 shadow-[0_0_30px_rgba(168,85,247,0.25)]">
          <div className="text-[9px] uppercase tracking-widest text-black/40">Traced to visit</div>
          <div className="mt-1 font-mono text-sm text-black/75">{incident.sourceSessionId}</div>
          <div className="mt-1 text-[12px] text-black/55">
            claimed <b>{incident.sourceClaimed}</b>, fingerprint <b className="text-red-700">{short(copycat?.fingerprint)}</b>
          </div>
        </div>
      </Appear>
    </div>
  )
}

// ─── main component ──────────────────────────────────────────────────────────
export function DemoStory() {
  const [chapter, setChapter] = useState(-1) // -1 before start
  const [live, setLive] = useState(false) // replay (default): recorded + instant; live: Claude seller + Llama on this laptop
  const [auto, setAuto] = useState(true) // auto-plays until the user touches the controls
  const [preparing, setPreparing] = useState(false)
  const [story, setStory] = useState<Story>({ shoppers: [] })
  const [frameKey, setFrameKey] = useState(0)
  const [status, setStatus] = useState<{ fingerprint?: boolean; ok: boolean } | null>(null)
  const identities = useRef<AgentIdentity[]>([])
  const [ids, setIds] = useState<AgentIdentity[]>([])
  const started = chapter >= 0
  const last = CHAPTERS.length - 1
  const at = (id: ChapterId) => CHAPTERS.findIndex((c) => c.id === id)

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
    if (st.step === "fingerprinted") {
      const g = d as unknown as ModelGuess
      updateShopper(i, (x) => ({ ...x, fingerprint: g.top?.[0]?.model, distance: g.top?.[0]?.distance }))
    }
    if (st.step === "tactic") updateShopper(i, (x) => ({ ...x, tactic: d as unknown as Tactic, waiting: "agent" }))
    if (st.step === "negotiate") {
      const from = d.from as "agent" | "prism"
      const text = st.label.replace(/^(Agent|Prism): "/, "").replace(/"$/, "")
      updateShopper(i, (x) => ({ ...x, lines: [...x.lines, { from, text, voice: d.voice as string | undefined }], waiting: from === "agent" ? "prism" : "agent" }))
    }
    if (st.step === "cart") updateShopper(i, (x) => ({ ...x, waiting: undefined }))
    if (st.step === "checkout") updateShopper(i, (x) => ({ ...x, waiting: undefined, total: (d.handoff as { total?: number } | undefined)?.total }))
  }

  // Start: run every agent once. Shoppers stream; the copycat, trace and buyer run in the background.
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
      await sleep(900) // let the identity poll catch up so the copycat card shows its scores
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
      setStory((st) => ({ ...st, buyer: { outletPrice: cheapest?.price, reasons: cheapest?.problems ?? [], total: hand?.total } }))
    })()
    await Promise.all([shoppersDone, background])
    setPreparing(false)
  }

  // Manual controls: any of them turns auto-play off
  const goTo = (i: number) => {
    setAuto(false)
    setChapter(Math.max(0, Math.min(last, i)))
  }
  const next = () => goTo(chapter + 1)
  const back = () => goTo(chapter - 1)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (chapter < 0) return
      if (e.key === "ArrowRight") {
        setAuto(false)
        setChapter((c) => Math.min(last, c + 1))
      }
      if (e.key === "ArrowLeft") {
        setAuto(false)
        setChapter((c) => Math.max(0, c - 1))
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [chapter, last])

  // Is the current slide's data in? Auto-play waits for it before moving on.
  const s = story
  const ready: Record<ChapterId, boolean> = {
    identify: s.shoppers.length > 0 && s.shoppers.every((x) => x.fingerprint && x.tactic),
    negotiate: s.shoppers.length > 0 && s.shoppers.every((x) => x.total !== undefined),
    copycat: !!s.copycat,
    clone: !!s.copycat,
    trace: !!s.incident,
    stop: !!s.incident && !!s.stop,
    buyer: !!s.buyer,
    results: !!s.buyer,
  }
  const current = started ? CHAPTERS[chapter] : null
  const currentReady = current ? ready[current.id] : false
  useEffect(() => {
    if (!auto || !current || chapter >= last || !currentReady) return
    const dwell = current.id === "identify" ? 3500 : current.id === "negotiate" ? 4000 : 5500
    const t = setTimeout(() => setChapter((c) => Math.min(last, c + 1)), dwell)
    return () => clearTimeout(t)
  }, [auto, current, chapter, last, currentReady])

  // The frame shows the copycat outlet on the clone / trace / stop slides
  const clone = !!current && ["clone", "trace", "stop"].includes(current.id) && !!s.copycat

  const revenue = s.shoppers.reduce((a, x) => a + (x.total ?? 0), 0)
  // at one flat price, the haggler (asked $55) walks; the others pay $68
  const flatRevenue = s.shoppers.filter((x) => x.model !== "llama-3.2-3b-live").length * FLAT_PRICE
  const solved = (n: number) =>
    started && (n === 1 ? chapter >= at("identify") && ready.identify : n === 2 ? chapter >= at("negotiate") && ready.negotiate : chapter >= at("stop") && ready.stop)

  const downloadEvidence = () => {
    const blob = new Blob([JSON.stringify({ incident: s.incident, copycat: s.copycat, stopped: s.stop }, null, 2)], { type: "application/json" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `prism-evidence-${s.incident?.id ?? "incident"}.json`
    a.click()
  }

  const idFor = (claimed: string) => ids.find((i) => i.claimed === claimed)

  return (
    <section id="demo" className="relative px-4 pb-24 pt-24 md:px-8">
      <style>{`
        @keyframes storyIn { from { opacity: 0; filter: blur(10px); transform: translateY(14px) } to { opacity: 1; filter: blur(0); transform: none } }
        @keyframes storyDraw { to { stroke-dashoffset: 0 } }
        @keyframes storyPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(220,38,38,.6) } 50% { box-shadow: 0 0 0 6px rgba(220,38,38,0) } }
        @keyframes storyShine { from { background-position: 0% 50% } to { background-position: 200% 50% } }
        @keyframes storyDot { 0%,100% { opacity: .25; transform: translateY(0) } 50% { opacity: 1; transform: translateY(-2px) } }
        @keyframes storyTick { from { transform: scale(0) } 60% { transform: scale(1.25) } to { transform: scale(1) } }
      `}</style>

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {/* ── LEFT: the slideshow ─────────────────────────────────────────── */}
        <div className="flex min-h-[calc(100vh-150px)] flex-col">
          <div className="text-[10px] uppercase tracking-[0.3em] text-black/40">Live demo · three problems, one install</div>
          <h2 className="mt-3 text-4xl font-light leading-[1.02] tracking-tight md:text-5xl">
            Watch Prism{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(90deg,#3b82f6,#a855f7,#ef4444,#f59e0b,#3b82f6)", backgroundSize: "200% 100%", animation: "storyShine 6s linear infinite" }}
            >
              solve agentic commerce.
            </span>
          </h2>

          {/* Problem tracker */}
          <div className="mt-6 grid grid-cols-3 gap-2">
            {PROBLEMS.map((p) => {
              const active = current?.problem === p.n
              const done = solved(p.n)
              return (
                <button
                  key={p.n}
                  disabled={!started}
                  onClick={() => goTo(CHAPTERS.findIndex((c) => c.problem === p.n))}
                  className={`rounded-xl border px-3 py-2.5 text-left transition-all duration-500 ${
                    done ? "border-emerald-500/40 bg-emerald-50" : active ? "border-black/60 bg-white" : "border-black/[0.07] bg-white/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${done ? "bg-emerald-500 text-white" : "bg-black/[0.07] text-black/50"}`}
                      style={done ? { animation: "storyTick .5s cubic-bezier(0.16,1,0.3,1)" } : undefined}
                    >
                      {done ? "✓" : p.n}
                    </span>
                    <span className="text-[12px] text-black/80">{done ? p.solved : p.short}</span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Controls */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
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
              <>
                <button onClick={back} disabled={chapter <= 0} className="rounded-full border border-black/15 px-5 py-3 text-sm text-black/70 transition-colors hover:bg-black/[0.04] disabled:opacity-30">
                  ◀ Back
                </button>
                <button onClick={next} disabled={chapter >= last} className="rounded-full bg-black px-6 py-3 text-sm text-white transition-transform hover:scale-[1.03] disabled:opacity-40">
                  Next ▶
                </button>
                <button
                  onClick={() => setAuto((v) => !v)}
                  title="Auto-play advances every few seconds; touching Back / Next / a tab / an arrow key switches to manual"
                  className={`rounded-full border px-3 py-2 text-[10px] tracking-widest ${auto ? "border-emerald-500/50 bg-emerald-50 text-emerald-700" : "border-black/10 text-black/45"}`}
                >
                  {auto ? "● AUTO" : "MANUAL · ▷ resume"}
                </button>
                <button
                  onClick={() => {
                    setAuto(true)
                    start()
                  }}
                  disabled={preparing}
                  className="rounded-full border border-black/10 px-3 py-2 text-[10px] tracking-widest text-black/45 disabled:opacity-30"
                >
                  ↻ RESTART
                </button>
              </>
            )}
            <button
              onClick={() => !preparing && setLive((v) => !v)}
              disabled={preparing}
              title="Replay uses recorded answers and replies (instant). Live runs Claude Sonnet as the seller and Llama 3.2 on this laptop as a buyer."
              className={`ml-auto rounded-full border px-3 py-2 text-[10px] tracking-widest ${live ? "border-emerald-500/50 bg-emerald-50 text-emerald-700" : "border-black/10 text-black/45"}`}
            >
              {live ? "● LIVE MODELS" : "○ REPLAY"}
            </button>
            {status && (
              <span className="hidden text-[10px] tracking-widest text-black/30 xl:inline">
                {status.ok ? "● BACKEND" : "○ BACKEND"} · {status.fingerprint ? "● LLMMAP" : "○ LLMMAP"}
              </span>
            )}
          </div>

          {/* Slide dots */}
          <div className="mt-5 flex gap-1.5">
            {CHAPTERS.map((c, i) => (
              <button
                key={c.id}
                onClick={() => started && goTo(i)}
                disabled={!started}
                title={c.title}
                className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/[0.07]"
              >
                <div
                  className="h-1.5 rounded-full"
                  style={{
                    width: i <= chapter ? "100%" : "0%",
                    transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
                    background: c.problem === 1 ? "#3b82f6" : c.problem === 2 ? "#a855f7" : c.problem === 3 ? (c.id === "stop" || c.id === "buyer" ? "#10b981" : "#ef4444") : "#111",
                  }}
                />
              </button>
            ))}
          </div>

          {/* ── The slide ── */}
          <div className="mt-5 flex-1">
            {!current && (
              <Appear>
                <div className="rounded-2xl border border-black/[0.07] bg-white/70 p-7">
                  <div className="text-[10px] uppercase tracking-widest text-black/35">The problem</div>
                  <p className="mt-3 text-2xl font-light leading-snug text-black/85">Your next customer is an AI agent. So is your next copycat.</p>
                  <ol className="mt-5 space-y-2 text-[14px] text-black/55">
                    <li>
                      <b className="text-black/75">① You can&apos;t see who&apos;s shopping.</b> A Web Bot Auth signature names the operator (&ldquo;chatgpt.com&rdquo;), never the model.
                    </li>
                    <li>
                      <b className="text-black/75">② Every agent gets the same offer.</b> UCP / ACP checkouts have no way to tailor the deal to the agent.
                    </li>
                    <li>
                      <b className="text-black/75">③ Copycats clone you.</b> Scrapers copy the catalog and open a cheaper outlet, and nothing traces them.
                    </li>
                  </ol>
                  <p className="mt-5 text-[13px] text-black/40">
                    Press <b className="text-black/65">Start the story</b>. It plays itself; take over any time with Next, Back or the arrow keys. The store on the right is real and
                    usable.
                  </p>
                </div>
              </Appear>
            )}

            {current && (
              <Appear key={current.id}>
                <div className="mb-4">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-black/40">
                    {current.problem ? `Problem ${current.problem} · slide ${chapter + 1} of ${CHAPTERS.length}` : `Slide ${chapter + 1} of ${CHAPTERS.length}`}
                  </div>
                  <div className="mt-2 text-3xl font-light tracking-tight text-black/90">{current.title}</div>
                  <div className="mt-1 text-lg font-light text-emerald-700">→ {current.fix}</div>
                  {current.line && <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-black/50">{current.line}</p>}
                </div>
              </Appear>
            )}

            {/* ① identify */}
            {current?.id === "identify" && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {s.shoppers.map((x, i) => {
                  const id = idFor(x.claimed)
                  return (
                    <Appear key={x.model} delay={i * 150}>
                      <div className={`h-full rounded-xl border bg-white/85 p-4 ${x.live ? "border-emerald-400/60 shadow-[0_0_24px_rgba(16,185,129,0.15)]" : "border-black/[0.07]"}`}>
                        <div className="text-sm text-black/80">
                          {x.live && <span className="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />}
                          {x.label}
                        </div>
                        <div className="mt-2 space-y-1 text-[11px] text-black/50">
                          <div>
                            claims <b className="text-black/70">{x.claimed}</b> · <span className="text-amber-700">unsigned</span>
                          </div>
                          {x.fingerprint ? (
                            <div style={{ animation: "storyIn .6s both" }}>
                              fingerprint <b className="font-mono text-black/80">{short(x.fingerprint)}</b>
                              <span className="text-black/35"> (distance {x.distance?.toFixed(1)})</span>
                            </div>
                          ) : (
                            <div className="text-black/35">{x.live && live ? "answering 8 probes live on this laptop…" : "running the 8-probe handshake…"}</div>
                          )}
                        </div>
                        {id && x.fingerprint && (
                          <div className="mt-3 space-y-1.5">
                            <Meter label="trust" value={id.scores.trust} tone="bg-emerald-500/70" />
                            <Meter label="lead" value={id.scores.lead} tone="bg-sky-500/70" delay={100} />
                            <Meter label="risk" value={id.scores.risk} tone="bg-red-500/70" delay={200} />
                          </div>
                        )}
                        {x.tactic && (
                          <div className="mt-3 rounded-lg bg-sky-500/10 px-2.5 py-1.5 text-[11px] text-sky-800" style={{ animation: "storyIn .6s both" }}>
                            Tactic: <b>{x.tactic.name}</b>
                          </div>
                        )}
                      </div>
                    </Appear>
                  )
                })}
              </div>
            )}

            {/* ② negotiate */}
            {current?.id === "negotiate" && (
              <>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {s.shoppers.map((x, i) => (
                    <Appear key={x.model} delay={i * 150}>
                      <div className="flex h-full flex-col rounded-xl border border-black/[0.07] bg-white/85 p-3.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[13px] text-black/80">{x.label}</span>
                          {x.total !== undefined && <span className="font-mono text-sm text-emerald-700">✓ ${x.total}</span>}
                        </div>
                        {x.tactic && <div className="mt-1 text-[10px] text-sky-700">{x.tactic.name}</div>}
                        <div className="mt-2.5 flex-1 space-y-1.5">
                          {x.lines.map((l, k) => (
                            <div key={k} className={`flex ${l.from === "prism" ? "justify-end" : "justify-start"}`} style={{ animation: "storyIn .5s both" }}>
                              <div className={`max-w-[92%] rounded-2xl px-2.5 py-1.5 text-[11px] leading-snug ${l.from === "prism" ? "bg-black/85 text-white" : "bg-black/[0.05] text-black/70"}`}>
                                {l.text}
                                {l.voice && l.voice !== "template" && l.voice !== "scripted" && (
                                  <span className={`mt-0.5 block text-[8px] uppercase tracking-widest ${l.from === "prism" ? "text-white/40" : "text-black/30"}`}>
                                    {(l.voice.includes("recorded") ? "recorded · " : "live · ") + (l.voice.startsWith("claude") ? "Claude Sonnet" : l.voice.replace(/ \((local|recorded)\)/, ""))}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                          {x.waiting === "prism" && <Typing who={live ? "Prism · Claude is writing" : "Prism is replying"} dark />}
                          {x.waiting === "agent" && x.live && live && <Typing who="Llama is typing" />}
                        </div>
                        {x.protocol.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap items-center gap-1 border-t border-black/[0.05] pt-2 font-mono text-[9px] text-black/40">
                            {x.protocol.map((c, k) => (
                              <span key={k} className="flex items-center gap-1">
                                {k > 0 && <span className="text-black/20">→</span>}
                                <span className={c.startsWith("Prism") ? "text-violet-600" : ""}>{c}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Appear>
                  ))}
                </div>
                {ready.negotiate && (
                  <Appear delay={300}>
                    <div className="mt-3 flex flex-wrap items-center gap-x-8 gap-y-2 rounded-xl bg-black px-5 py-4 text-white">
                      <div>
                        <div className="text-2xl font-light">
                          <Counter to={revenue} prefix="$" />
                        </div>
                        <div className="text-[10px] uppercase tracking-widest text-white/45">with Prism · 3 of 3 bought</div>
                      </div>
                      <div>
                        <div className="text-2xl font-light text-white/50">${flatRevenue}</div>
                        <div className="text-[10px] uppercase tracking-widest text-white/35">one flat ${FLAT_PRICE} price · the haggler walks</div>
                      </div>
                      <div className="text-2xl font-light text-emerald-400">
                        +<Counter to={revenue - flatRevenue} prefix="$" />
                      </div>
                    </div>
                  </Appear>
                )}
              </>
            )}

            {/* ③ copycat */}
            {current?.id === "copycat" &&
              (s.copycat ? (
                <Appear>
                  <div className="rounded-xl border border-red-400/60 bg-white/85 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-black/80">Claims: ChatGPT-User</span>
                      <span className="rounded-full bg-black/[0.05] px-2 py-0.5 text-[10px] text-black/45">unsigned</span>
                    </div>
                    <Appear delay={200}>
                      <div className="mt-3 rounded-lg bg-red-500/10 px-3 py-2.5 text-[13px] text-red-700">
                        Fingerprint: <b>{short(s.copycat.fingerprint)}</b> (distance {s.copycat.distance?.toFixed(1)}), not ChatGPT → <b>impostor</b>
                      </div>
                    </Appear>
                    <Appear delay={450}>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                        {[
                          { v: "$0", l: "prices shown" },
                          { v: String(s.stop?.signedOffers ?? 0), l: "signed offers" },
                          { v: String(s.stop?.blocked ?? 0), l: "requests refused" },
                        ].map((k) => (
                          <div key={k.l} className="rounded-lg bg-black/[0.04] py-2.5">
                            <div className="text-xl font-light">{k.v}</div>
                            <div className="text-[9px] uppercase tracking-widest text-black/40">{k.l}</div>
                          </div>
                        ))}
                      </div>
                    </Appear>
                    {s.copycat.identity && (
                      <div className="mt-4 space-y-1.5">
                        <Meter label="trust" value={s.copycat.identity.scores.trust} tone="bg-emerald-500/70" delay={600} />
                        <Meter label="lead" value={s.copycat.identity.scores.lead} tone="bg-sky-500/70" delay={700} />
                        <Meter label="risk" value={s.copycat.identity.scores.risk} tone="bg-red-500/80" delay={800} />
                      </div>
                    )}
                    <p className="mt-3 text-[11px] text-black/45">
                      It grabbed {s.copycat.scraped} public listings before the block. Every one carries an invisible marker tied to this visit.
                    </p>
                  </div>
                </Appear>
              ) : (
                <Waiting label="THE COPYCAT IS RUNNING ITS HANDSHAKE…" />
              ))}

            {current?.id === "clone" &&
              (s.copycat ? (
                <Appear>
                  <div className="rounded-xl border border-red-400/60 bg-red-50/80 p-5 text-[13px] leading-relaxed text-black/65">
                    <div className="text-[10px] uppercase tracking-widest text-red-700/70">prism-skincare-outlet.shop · see it on the right</div>
                    <div className="mt-2">
                      Serum 50ml: $68 → <b className="text-red-700">$54</b>
                    </div>
                    <div>
                      Returns: 30 days → <b className="text-red-700">all sales final</b>
                    </div>
                    <div>
                      Checkout: <b className="text-red-700">pay.prism-skincare-outlet.shop</b>
                    </div>
                    <div>
                      Offers: <b className="text-red-700">forged</b> (it was never given a signed one)
                    </div>
                  </div>
                </Appear>
              ) : (
                <Waiting label="WAITING FOR THE CLONE…" />
              ))}

            {current?.id === "trace" && (s.incident ? <Trace incident={s.incident} copycat={s.copycat} /> : <Waiting label="SCANNING THE OUTLET…" />)}

            {current?.id === "stop" &&
              (s.incident && s.stop ? (
                <div className="space-y-3">
                  {[
                    { t: "Blocked at the door", d: `Withheld: $0 prices, ${s.stop.signedOffers} signed offers, ${s.stop.blocked} scraping requests refused.` },
                    { t: "Nothing to sell with", d: "Every offer on the outlet is forged. Agents verify offers with the merchant, so the clone can't close a single agent sale." },
                    { t: "Flagged to every agent", d: `${s.incident.cloneUrl.replace("https://", "")} is flagged: any agent that checks an offer from it is told it's a traced copycat.` },
                  ].map((k, i) => (
                    <Appear key={k.t} delay={i * 180}>
                      <div className="rounded-xl border border-emerald-500/30 bg-white/85 p-4">
                        <div className="flex items-center gap-2 text-sm text-black/80">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[11px] text-white" style={{ animation: "storyTick .5s both" }}>
                            ✓
                          </span>
                          {k.t}
                        </div>
                        <p className="mt-1.5 text-[12px] leading-relaxed text-black/55">{k.d}</p>
                      </div>
                    </Appear>
                  ))}
                  <Appear delay={600}>
                    <button onClick={downloadEvidence} className="w-full rounded-xl bg-black px-5 py-3.5 text-left text-[13px] text-white transition-transform hover:scale-[1.01]">
                      ⬇ Download takedown evidence
                      <span className="mt-0.5 block text-[10px] text-white/50">marker, visit, claimed vs fingerprinted model, copied text, price changes, fake checkout</span>
                    </button>
                  </Appear>
                </div>
              ) : (
                <Waiting label="PREPARING…" />
              ))}

            {current?.id === "buyer" &&
              (s.buyer ? (
                <Appear>
                  <div className="rounded-xl border border-black/[0.07] bg-white/85 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-black/80">Grok Shopper</span>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-700">✓ Web Bot Auth signature · private offer</span>
                    </div>
                    <div className="mt-3 text-[13px] text-black/60">
                      Found the outlet at <b>${s.buyer.outletPrice}</b>. Checked the offer with Prism Skincare:
                    </div>
                    <div className="mt-2 space-y-1">
                      {s.buyer.reasons.map((r, i) => (
                        <Appear key={r} delay={250 + i * 150}>
                          <div className="rounded-md bg-red-500/10 px-2.5 py-1.5 text-[12px] text-red-700">✗ {r}</div>
                        </Appear>
                      ))}
                    </div>
                    <Appear delay={900}>
                      <div className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2.5 text-[13px] text-emerald-800">
                        ✓ Bought from prismskincare.com for <b>${s.buyer.total}</b>. The clone made <b>$0</b>.
                      </div>
                    </Appear>
                  </div>
                </Appear>
              ) : (
                <Waiting label="THE BUYER IS SHOPPING…" />
              ))}

            {current?.id === "results" && (
              <div className="space-y-3">
                {[
                  {
                    n: 1,
                    t: "Every agent identified",
                    k: [
                      { v: 4, l: "models fingerprinted" },
                      { v: 1, l: "impostor exposed" },
                    ],
                  },
                  {
                    n: 2,
                    t: "A deal per model",
                    k: [
                      { v: revenue, l: "revenue from agents", prefix: "$" },
                      { v: revenue - flatRevenue, l: "vs one flat price", prefix: "+$" },
                    ],
                  },
                  {
                    n: 3,
                    t: "Copycat stopped and traced",
                    k: [
                      { v: s.stop?.blocked ?? 0, l: "scraping requests refused" },
                      { v: 0, l: "sales made by the clone", prefix: "$" },
                    ],
                  },
                ].map((r, i) => (
                  <Appear key={r.n} delay={i * 180}>
                    <div className="flex items-center gap-5 rounded-xl border border-emerald-500/30 bg-white/85 p-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm text-white" style={{ animation: "storyTick .5s both" }}>
                        ✓
                      </span>
                      <div className="min-w-[180px] text-[15px] text-black/80">{r.t}</div>
                      {r.k.map((k) => (
                        <div key={k.l}>
                          <div className="text-2xl font-light tracking-tight">
                            <Counter to={k.v} prefix={k.prefix} delay={i * 180} />
                          </div>
                          <div className="text-[9px] uppercase tracking-widest text-black/40">{k.l}</div>
                        </div>
                      ))}
                    </div>
                  </Appear>
                ))}
                <Appear delay={700}>
                  <div className="rounded-xl bg-black px-5 py-4 text-[14px] text-white/80">
                    All of it from one line on the store: <span className="font-mono text-emerald-300">&lt;script src=&quot;/prism.js&quot;&gt;</span>
                  </div>
                </Appear>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: the real store ─────────────────────────────────────── */}
        <div className="lg:sticky lg:top-24 lg:self-start">
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
            <iframe key={`${frameKey}-${clone}`} src={clone ? "/store?clone=1" : "/store"} title="Prism Skincare" className="h-[calc(100vh-150px)] min-h-[600px] w-full" />
          </div>
        </div>
      </div>
    </section>
  )
}
