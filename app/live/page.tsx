"use client"

import { useEffect, useRef, useState } from "react"
import { MobileNav } from "@/components/mobile-nav"

// Live Lab: a real, unscripted AI agent (Llama or Qwen, running on this laptop) shops Prism Skincare.
// Prism identifies it, picks a tactic from measured results, and Claude Sonnet negotiates as the seller,
// knowing only Prism's prediction. Everything below streams from /api/live/run as it happens.

type Stage = "discover" | "handshake" | "fingerprint" | "tactic" | "negotiate" | "checkout"
type OfferLine = { sku: string; name: string; price: number; list: number }
type Msg = { from: "buyer" | "seller"; text: string; ms: number; action?: string; offer?: OfferLine[]; violations?: string[] }
type Identified = { top: { model: string; distance: number }[]; confident: boolean; label: string; family: string; margin: number }
type TacticInfo = { id: string; name: string; source: string; why: string; results?: Record<string, string> }
type Outcome = { outcome: "sale" | "walked" | "no deal"; revenue: number; list: number; items: { name: string; price: number }[]; order?: string; checkoutSession?: string }
type Status = { buyers: { id: string; label: string; ready: boolean }[]; fingerprint: boolean; claude: boolean }

const STAGES: { id: Stage; label: string; how: string }[] = [
  { id: "discover", label: "Discover", how: "The agent looks the store up at /.well-known/ucp, which points to Prism." },
  { id: "handshake", label: "Handshake", how: "Prism asks 8 short questions. The agent's own model answers them." },
  { id: "fingerprint", label: "Fingerprint", how: "LLMmap compares the answers with 52 known models and predicts which one it is." },
  { id: "tactic", label: "Tactic", how: "Prism picks the tactic that converted best for that model in live runs." },
  { id: "negotiate", label: "Negotiate", how: "Claude Sonnet sells, knowing only the prediction. Prices are checked against hard rules." },
  { id: "checkout", label: "Checkout", how: "The deal completes through a UCP checkout session with signed prices." },
]
const TACTICS = [
  { id: "auto", label: "Prism picks (learned)" },
  { id: "first-offer", label: "First offer" },
  { id: "anchor-high", label: "Anchor high" },
  { id: "evidence", label: "Evidence first" },
  { id: "baseline", label: "One flat price" },
]
const LAB = [
  { t: "First offer (bundle)", llama: "3/3 · $87", qwen: "3/3 · $88" },
  { t: "Evidence first", llama: "3/3 · $68", qwen: "3/3 · $68" },
  { t: "Anchor high ($185 set)", llama: "0/3 · $0", qwen: "3/3 · $74" },
  { t: "One flat price", llama: "1/3 · $22", qwen: "3/3 · $61" },
]
const DEFAULT_BRIEF = "Buy a barrier repair serum for my sensitive, reactive skin. Get the best deal you can."

const shortModel = (m: string) => m.split("/").pop()!.replace(/-Instruct$/, "").replace(/-2024-05-13|-20240620|-20240307/, "")
const gradient = { backgroundImage: "linear-gradient(90deg,#3b82f6,#a855f7,#ef4444,#f59e0b,#3b82f6)", backgroundSize: "200% 100%", animation: "liveShine 6s linear infinite" }

function Elapsed({ since }: { since: number }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(t)
  }, [])
  return <span className="font-mono">{((now - since) / 1000).toFixed(1)}s</span>
}

function Typing({ who, dark, since }: { who: string; dark?: boolean; since: number }) {
  return (
    <div className={`flex ${dark ? "justify-end" : "justify-start"}`} style={{ animation: "liveIn .4s both" }}>
      <div className={`flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-[11px] ${dark ? "bg-black/85 text-white/60" : "bg-white text-black/45 shadow-sm"}`}>
        <span className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-1.5 w-1.5 rounded-full bg-current" style={{ animation: `liveDot 1s ease-in-out ${i * 0.15}s infinite` }} />
          ))}
        </span>
        {who} · <Elapsed since={since} />
      </div>
    </div>
  )
}

export default function LiveLab() {
  const [status, setStatus] = useState<Status | null>(null)
  const [buyer, setBuyer] = useState("llama3.2:3b")
  const [tactic, setTactic] = useState("auto")
  const [budget, setBudget] = useState(90)
  const [brief, setBrief] = useState(DEFAULT_BRIEF)
  const [running, setRunning] = useState(false)
  const [stages, setStages] = useState<Partial<Record<Stage, { status: "active" | "done"; detail?: string }>>>({})
  const [probes, setProbes] = useState({ done: 0, of: 8 })
  const [ident, setIdent] = useState<Identified | null>(null)
  const [tac, setTac] = useState<TacticInfo | null>(null)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [typing, setTyping] = useState<{ who: "buyer" | "seller"; since: number } | null>(null)
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reveal, setReveal] = useState(false)
  const [runBuyer, setRunBuyer] = useState("llama3.2:3b")
  const chatEnd = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/live/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus(null))
  }, [])
  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [msgs, typing])

  const buyerLabel = (id: string) => status?.buyers.find((b) => b.id === id)?.label ?? id

  const go = async () => {
    if (running) return
    setRunning(true)
    setStages({})
    setProbes({ done: 0, of: 8 })
    setIdent(null)
    setTac(null)
    setMsgs([])
    setTyping(null)
    setOutcome(null)
    setError(null)
    setReveal(false)
    setRunBuyer(buyer)
    await fetch("/api/prism/reset", { method: "POST" }).catch(() => {})
    const q = new URLSearchParams({ buyer, tactic, budget: String(budget), brief })
    try {
      const r = await fetch(`/api/live/run?${q}`, { method: "POST" })
      const reader = r.body!.getReader()
      const dec = new TextDecoder()
      let buf = ""
      for (;;) {
        const { value, done } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })
        let nl: number
        while ((nl = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, nl)
          buf = buf.slice(nl + 1)
          if (!line) continue
          const e = JSON.parse(line)
          if (e.type === "stage") setStages((s) => ({ ...s, [e.stage]: { status: e.status, detail: e.detail } }))
          if (e.type === "probe") setProbes({ done: e.done, of: e.of })
          if (e.type === "identified") setIdent(e)
          if (e.type === "tactic") setTac(e)
          if (e.type === "typing") setTyping({ who: e.who, since: Date.now() })
          if (e.type === "message") {
            setTyping(null)
            setMsgs((m) => [...m, e])
          }
          if (e.type === "outcome") {
            setTyping(null)
            setOutcome(e)
          }
          if (e.type === "error") setError(e.message)
        }
      }
    } catch (e) {
      setError(String(e))
    }
    setTyping(null)
    setRunning(false)
  }

  const truthFamily = runBuyer.startsWith("llama") ? "meta" : runBuyer.startsWith("qwen") ? "qwen" : "other"
  const predictedRight = ident ? ident.family === truthFamily : false
  const ready = !!status && status.claude && status.fingerprint && !!status.buyers.find((b) => b.id === buyer)?.ready

  return (
    <div className="min-h-screen bg-[#F5F4F0] font-sans text-[#111] antialiased">
      <style>{`
        @keyframes liveIn { from { opacity: 0; filter: blur(8px); transform: translateY(10px) } to { opacity: 1; filter: blur(0); transform: none } }
        @keyframes liveShine { from { background-position: 0% 50% } to { background-position: 200% 50% } }
        @keyframes liveDot { 0%,100% { opacity: .25; transform: translateY(0) } 50% { opacity: 1; transform: translateY(-2px) } }
        @keyframes livePulse { 0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,.5) } 50% { box-shadow: 0 0 0 6px rgba(16,185,129,0) } }
      `}</style>
      <MobileNav />

      <section className="px-4 pb-10 pt-28 md:px-8">
        <div className="mx-auto max-w-[1500px]">
          {/* Header */}
          <div className="text-[10px] uppercase tracking-[0.3em] text-black/40">Live lab · real models · nothing scripted</div>
          <h1 className="mt-3 text-4xl font-light leading-[1.02] tracking-tight md:text-6xl" style={{ animation: "liveIn .9s both" }}>
            Watch a real AI agent{" "}
            <span className="bg-clip-text text-transparent" style={gradient}>
              shop your store.
            </span>
          </h1>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-black/55" style={{ animation: "liveIn .9s .15s both" }}>
            A local model runs the buyer agent with its own brief and a budget it keeps secret. Prism identifies it from its answers, picks the tactic
            that converted best for that model, and Claude Sonnet negotiates as the seller, seeing only Prism&apos;s prediction.
          </p>

          {/* Controls */}
          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_auto]" style={{ animation: "liveIn .9s .25s both" }}>
            <div className="rounded-2xl border border-black/[0.07] bg-white/70 p-4">
              <div className="text-[10px] uppercase tracking-widest text-black/40">1 · The buyer agent (runs on this laptop)</div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {(status?.buyers ?? [
                  { id: "llama3.2:3b", label: "Llama 3.2 3B", ready: false },
                  { id: "qwen2.5:3b", label: "Qwen 2.5 3B", ready: false },
                ]).map((b) => (
                  <button
                    key={b.id}
                    disabled={running}
                    onClick={() => setBuyer(b.id)}
                    className={`rounded-xl border px-3 py-3 text-left transition-all ${buyer === b.id ? "border-black bg-black text-white" : "border-black/10 bg-white hover:border-black/30"}`}
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <span className={`h-2 w-2 rounded-full ${b.ready ? "bg-emerald-500" : "bg-black/20"}`} />
                      {b.label}
                    </div>
                    <div className={`mt-0.5 font-mono text-[10px] ${buyer === b.id ? "text-white/50" : "text-black/35"}`}>ollama · {b.id}</div>
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-3 text-[11px] text-black/55">
                <span className="w-28 shrink-0">Secret budget</span>
                <input type="range" min={40} max={200} step={5} value={budget} disabled={running} onChange={(e) => setBudget(Number(e.target.value))} className="flex-1 accent-black" />
                <span className="w-10 font-mono text-black/80">${budget}</span>
              </div>
              <input
                value={brief}
                disabled={running}
                onChange={(e) => setBrief(e.target.value)}
                className="mt-2 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[12px] text-black/70 outline-none focus:border-black/30"
              />
            </div>

            <div className="rounded-2xl border border-black/[0.07] bg-white/70 p-4">
              <div className="text-[10px] uppercase tracking-widest text-black/40">2 · How Prism sells</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {TACTICS.map((t) => (
                  <button
                    key={t.id}
                    disabled={running}
                    onClick={() => setTactic(t.id)}
                    className={`rounded-full border px-3.5 py-2 text-[12px] transition-all ${tactic === t.id ? "border-black bg-black text-white" : "border-black/10 bg-white text-black/65 hover:border-black/30"}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-black/45">
                &ldquo;Prism picks&rdquo; uses the prediction and the lab results below. Force a tactic to test it live, e.g. <b>Anchor high on Llama</b> (it walked
                every time in the lab).
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-[10px] tracking-widest text-black/40">
                <span>{status?.claude ? "● CLAUDE SONNET" : "○ CLAUDE SONNET"}</span>
                <span>{status?.fingerprint ? "● LLMMAP" : "○ LLMMAP"}</span>
              </div>
            </div>

            <button
              onClick={go}
              disabled={running || !ready}
              className="group relative min-h-[88px] overflow-hidden rounded-2xl bg-black px-10 text-white transition-transform hover:scale-[1.02] disabled:opacity-50 lg:min-w-[220px]"
            >
              <span className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ ...gradient, animation: "liveShine 3s linear infinite" }} />
              <span className="relative text-lg">{running ? "Live…" : outcome ? "↻ Run again" : "▶ Go live"}</span>
              {!ready && status && <span className="relative mt-1 block text-[10px] text-white/60">a service isn&apos;t ready</span>}
            </button>
          </div>

          {/* Pipeline */}
          <div className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-6">
            {STAGES.map((st, i) => {
              const s = stages[st.id]
              return (
                <div
                  key={st.id}
                  className={`rounded-xl border p-3 transition-all duration-500 ${s?.status === "done" ? "border-emerald-500/40 bg-emerald-50" : s?.status === "active" ? "border-black/60 bg-white" : "border-black/[0.06] bg-white/40"}`}
                  style={s?.status === "active" ? { animation: "livePulse 1.4s infinite" } : undefined}
                >
                  <div className="flex items-center gap-2 text-[12px] text-black/80">
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${s?.status === "done" ? "bg-emerald-500 text-white" : s?.status === "active" ? "bg-black text-white" : "bg-black/[0.06] text-black/40"}`}>
                      {s?.status === "done" ? "✓" : i + 1}
                    </span>
                    {st.label}
                  </div>
                  <div className="mt-1.5 min-h-[28px] text-[10px] leading-snug text-black/45">{s?.detail ?? st.how}</div>
                </div>
              )
            })}
          </div>

          {error && <div className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-[12px] text-red-700">{error}</div>}

          {/* Chat + Prism's view */}
          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <div className="flex min-h-[520px] flex-col overflow-hidden rounded-2xl border border-black/[0.07] bg-[#EFEEE9]">
              <div className="flex items-center justify-between border-b border-black/[0.06] bg-white/70 px-5 py-3 text-[12px]">
                <span className="flex items-center gap-2 text-black/70">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> {buyerLabel(runBuyer)} · buyer agent · local
                </span>
                <span className="flex items-center gap-2 text-black/70">
                  Prism · seller · Claude Sonnet <span className="h-2 w-2 rounded-full bg-black" />
                </span>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-5">
                {!msgs.length && !typing && (
                  <div className="flex h-full items-center justify-center text-center text-[13px] text-black/35">
                    {running ? `The agent is doing the handshake… ${probes.done}/${probes.of} answers` : "Press Go live. The conversation appears here as it happens."}
                  </div>
                )}
                {msgs.map((m, i) => (
                  <div key={i} className={`flex ${m.from === "seller" ? "justify-end" : "justify-start"}`} style={{ animation: "liveIn .5s both" }}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${m.from === "seller" ? "bg-black/90 text-white" : "bg-white text-black/80 shadow-sm"}`}>
                      <div className={`mb-1 flex items-center gap-2 text-[9px] uppercase tracking-widest ${m.from === "seller" ? "text-white/40" : "text-black/35"}`}>
                        {m.from === "seller" ? "Prism · Claude Sonnet" : buyerLabel(runBuyer)}
                        {m.action && <span className="rounded bg-black/[0.06] px-1.5 py-0.5 text-black/55">{m.action}</span>}
                        <span className="font-mono normal-case tracking-normal">{(m.ms / 1000).toFixed(1)}s</span>
                      </div>
                      <div className="text-[14px] leading-relaxed">{m.text}</div>
                      {m.offer && m.offer.length > 0 && (
                        <div className="mt-2.5 space-y-1 rounded-lg bg-white/10 p-2.5">
                          {m.offer.map((o) => (
                            <div key={o.sku} className="flex justify-between gap-4 text-[12px]">
                              <span className="text-white/80">{o.name}</span>
                              <span className="font-mono">
                                {o.price < o.list && <span className="mr-1.5 text-white/35 line-through">${o.list}</span>}${o.price}
                              </span>
                            </div>
                          ))}
                          <div className="flex justify-between border-t border-white/10 pt-1 text-[12px] text-emerald-300">
                            <span>Offer on the table</span>
                            <span className="font-mono">${m.offer.reduce((s, o) => s + o.price, 0)}</span>
                          </div>
                        </div>
                      )}
                      {m.violations && m.violations.length > 0 && (
                        <div className="mt-2 text-[10px] text-amber-300">Rule guard corrected: {m.violations.join("; ")}</div>
                      )}
                    </div>
                  </div>
                ))}
                {typing && (
                  <Typing who={typing.who === "seller" ? "Claude is writing" : `${buyerLabel(runBuyer)} is thinking`} dark={typing.who === "seller"} since={typing.since} />
                )}
                {outcome && (
                  <div className="flex justify-center pt-2" style={{ animation: "liveIn .6s both" }}>
                    <div className={`rounded-full px-5 py-2 text-[13px] ${outcome.outcome === "sale" ? "bg-emerald-600 text-white" : "bg-black/10 text-black/60"}`}>
                      {outcome.outcome === "sale" ? `✓ Sold for $${outcome.revenue} · ${outcome.order}` : outcome.outcome === "walked" ? "The agent walked away" : "No deal"}
                    </div>
                  </div>
                )}
                <div ref={chatEnd} />
              </div>
            </div>

            {/* What Prism sees */}
            <div className="space-y-3">
              <div className="text-[10px] uppercase tracking-widest text-black/40">What Prism sees</div>

              <div className="rounded-2xl border border-black/[0.07] bg-white/80 p-4">
                <div className="flex items-center justify-between text-[12px] text-black/70">
                  <span>Handshake answers</span>
                  <span className="font-mono text-black/50">
                    {probes.done}/{probes.of}
                  </span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-black/[0.06]">
                  <div className="h-1.5 rounded-full bg-black/70 transition-all duration-300" style={{ width: `${(probes.done / probes.of) * 100}%` }} />
                </div>
              </div>

              <div className="rounded-2xl border border-black/[0.07] bg-white/80 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-black/70">Model prediction (LLMmap)</span>
                  {ident && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${ident.confident ? "bg-emerald-500/10 text-emerald-700" : "bg-amber-500/15 text-amber-700"}`}>
                      {ident.confident ? `confident · margin ${ident.margin}` : `unsure · margin ${ident.margin}`}
                    </span>
                  )}
                </div>
                {!ident && <div className="mt-3 text-[11px] text-black/35">Waiting for the handshake…</div>}
                {ident && (
                  <div className="mt-3 space-y-2" style={{ animation: "liveIn .6s both" }}>
                    {ident.top.slice(0, 3).map((t, i) => (
                      <div key={t.model}>
                        <div className="flex justify-between text-[11px]">
                          <span className={i === 0 ? "text-black/85" : "text-black/45"}>{shortModel(t.model)}</span>
                          <span className="font-mono text-black/40">distance {t.distance.toFixed(1)}</span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-black/[0.06]">
                          <div
                            className={`h-1.5 rounded-full ${i === 0 ? "bg-violet-500" : "bg-black/20"}`}
                            style={{ width: `${Math.max(4, Math.min(100, ((60 - t.distance) / 45) * 100))}%`, transition: "width 1s cubic-bezier(0.16,1,0.3,1)" }}
                          />
                        </div>
                      </div>
                    ))}
                    <button onClick={() => setReveal(true)} className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-left text-[11px] text-black/55 hover:bg-black/[0.03]">
                      {reveal ? (
                        <>
                          Actual buyer: <b className="text-black/80">{buyerLabel(runBuyer)}</b> ·{" "}
                          <b className={predictedRight ? "text-emerald-700" : "text-red-600"}>{predictedRight ? "✓ Prism was right" : "✗ Prism was wrong"}</b>
                        </>
                      ) : (
                        "Reveal which model was really shopping →"
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-black/[0.07] bg-white/80 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-black/70">Tactic</span>
                  {tac && <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] text-sky-700">{tac.source}</span>}
                </div>
                {!tac && <div className="mt-3 text-[11px] text-black/35">Chosen after the fingerprint.</div>}
                {tac && (
                  <div style={{ animation: "liveIn .6s both" }}>
                    <div className="mt-2 text-lg font-light">{tac.name}</div>
                    <p className="mt-1 text-[11px] leading-relaxed text-black/50">{tac.why}</p>
                  </div>
                )}
              </div>

              <div className={`rounded-2xl border p-4 ${outcome?.outcome === "sale" ? "border-emerald-500/40 bg-emerald-50" : "border-black/[0.07] bg-white/80"}`}>
                <div className="text-[12px] text-black/70">Outcome</div>
                {!outcome && <div className="mt-3 text-[11px] text-black/35">Revenue, items and the order appear here.</div>}
                {outcome && (
                  <div style={{ animation: "liveIn .6s both" }}>
                    <div className="mt-2 text-3xl font-light tracking-tight">{outcome.outcome === "sale" ? `$${outcome.revenue}` : "$0"}</div>
                    {outcome.outcome === "sale" && (
                      <>
                        <div className="mt-1 text-[11px] text-black/50">
                          {outcome.items.map((i) => `${i.name} $${i.price}`).join(" + ")} · serum at full price
                        </div>
                        <div className="mt-2 font-mono text-[10px] text-black/40">
                          UCP {outcome.checkoutSession} → completed → {outcome.order}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* How it works + learned playbook */}
          <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-black/[0.07] bg-white/70 p-6">
              <div className="text-[10px] uppercase tracking-widest text-black/40">How it works</div>
              <ol className="mt-4 space-y-3">
                {STAGES.map((s, i) => (
                  <li key={s.id} className="flex gap-3 text-[13px] leading-relaxed text-black/60">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-[11px] text-white">{i + 1}</span>
                    <span>
                      <b className="text-black/80">{s.label}.</b> {s.how}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-2xl border border-black/[0.07] bg-white/70 p-6">
              <div className="text-[10px] uppercase tracking-widest text-black/40">What Prism learned · 36 live negotiations</div>
              <table className="mt-4 w-full text-[13px]">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-widest text-black/40">
                    <th className="pb-2 font-normal">Tactic</th>
                    <th className="pb-2 font-normal">Llama 3.2 3B</th>
                    <th className="pb-2 font-normal">Qwen 2.5 3B</th>
                  </tr>
                </thead>
                <tbody>
                  {LAB.map((r) => (
                    <tr key={r.t} className="border-t border-black/[0.05]">
                      <td className="py-2 text-black/70">{r.t}</td>
                      <td className={`py-2 font-mono ${r.llama.startsWith("0/") ? "text-red-600" : "text-black/65"}`}>{r.llama}</td>
                      <td className="py-2 font-mono text-black/65">{r.qwen}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-4 text-[12px] leading-relaxed text-black/50">
                Sales out of 3 runs · average revenue. The same tactic can win on one model and lose every sale on another, which is why Prism identifies the
                model first. List price of the serum is $68; Prism never discounts it.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-black/[0.06] px-6 py-8 md:px-12">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between text-xs text-black/30">
          <a href="/" className="font-pixel tracking-[0.25em] text-black/50">
            PRISM
          </a>
          <span>Built at the Grok Bot Commerce London Hackathon · 2026</span>
        </div>
      </footer>
    </div>
  )
}
