"use client"

import { useEffect, useRef, useState } from "react"
import { MobileNav } from "@/components/mobile-nav"

// Live Lab, built for the least attentive viewer: one choice, one button, one sentence saying what is
// happening, and three answers (who is it, what did Prism do, did it work). Everything is live:
// a real local model shops (or impersonates ChatGPT), Prism identifies it, Claude Sonnet sells.

type Stage = "discover" | "handshake" | "fingerprint" | "tactic" | "negotiate" | "checkout"
type OfferLine = { sku: string; name: string; price: number; list: number }
type Msg = { from: "buyer" | "seller"; text: string; ms: number; action?: string; offer?: OfferLine[]; violations?: string[] }
type Identified = { top: { model: string; distance: number }[]; confident: boolean; label: string; family: string; margin: number }
type TacticInfo = { id: string; name: string; source: string; why: string }
type Outcome = { outcome: "sale" | "walked" | "no deal" | "blocked"; revenue: number; items: { name: string; price: number; list?: number }[]; order?: string; checkoutSession?: string }
type Blocked = { claimed: string; refused: number; reason: string }
type Status = { buyers: { id: string; label: string; ready: boolean }[]; fingerprint: boolean; claude: boolean }

const STEPS: { id: Stage; label: string }[] = [
  { id: "discover", label: "Finds the store" },
  { id: "handshake", label: "Answers 8 questions" },
  { id: "fingerprint", label: "Prism identifies it" },
  { id: "tactic", label: "Prism decides" },
  { id: "negotiate", label: "Negotiates" },
  { id: "checkout", label: "Checks out" },
]
const TACTICS = [
  { id: "auto", label: "Prism picks" },
  { id: "first-offer", label: "First offer" },
  { id: "anchor-high", label: "Anchor high" },
  { id: "evidence", label: "Evidence first" },
  { id: "baseline", label: "One flat price" },
]
const LAB = [
  { t: "Lead with a bundle", llama: "3/3 · $87", qwen: "3/3 · $88" },
  { t: "Evidence first", llama: "3/3 · $68", qwen: "3/3 · $68" },
  { t: "Anchor high", llama: "0/3 · $0", qwen: "3/3 · $74" },
  { t: "One flat price", llama: "1/3 · $22", qwen: "3/3 · $61" },
]
const BRIEF = "Buy a barrier repair serum for my sensitive, reactive skin. Get the best deal you can."
const gradient = { backgroundImage: "linear-gradient(90deg,#3b82f6,#a855f7,#ef4444,#f59e0b,#3b82f6)", backgroundSize: "200% 100%", animation: "liveShine 6s linear infinite" }
const short = (m: string) => m.split("/").pop()!.replace(/-Instruct$/, "").replace(/-2024-05-13|-20240620|-20240307/, "")

function Elapsed({ since }: { since: number }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(t)
  }, [])
  return <span className="font-mono text-black/35">{((now - since) / 1000).toFixed(1)}s</span>
}

function Card({ n, q, tone, children }: { n: number; q: string; tone: "idle" | "good" | "bad"; children: React.ReactNode }) {
  const border = tone === "good" ? "border-emerald-500/50 bg-emerald-50/70" : tone === "bad" ? "border-red-400/60 bg-red-50/70" : "border-black/[0.08] bg-white/70"
  return (
    <div className={`flex min-h-[220px] flex-col rounded-2xl border p-6 transition-colors duration-500 ${border}`}>
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-black/45">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-[11px] text-white">{n}</span>
        {q}
      </div>
      <div className="mt-4 flex-1">{children}</div>
    </div>
  )
}

export default function LiveLab() {
  const [status, setStatus] = useState<Status | null>(null)
  const [mode, setMode] = useState<"shopper" | "impostor">("shopper")
  const [buyer, setBuyer] = useState("qwen2.5:3b")
  const [tactic, setTactic] = useState("auto")
  const [budget, setBudget] = useState(90)
  const [brief, setBrief] = useState(BRIEF)
  const [options, setOptions] = useState(false)

  const [running, setRunning] = useState(false)
  const [run, setRun] = useState<{ buyer: string; mode: "shopper" | "impostor" } | null>(null)
  const [stages, setStages] = useState<Partial<Record<Stage, "active" | "done">>>({})
  const [probes, setProbes] = useState(0)
  const [ident, setIdent] = useState<Identified | null>(null)
  const [tac, setTac] = useState<TacticInfo | null>(null)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [typing, setTyping] = useState<{ who: "buyer" | "seller"; since: number } | null>(null)
  const [blocked, setBlocked] = useState<Blocked | null>(null)
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reveal, setReveal] = useState(false)
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

  const name = (id?: string) => status?.buyers.find((b) => b.id === id)?.label ?? id ?? ""
  const ready = !!status && status.claude && status.fingerprint && !!status.buyers.find((b) => b.id === buyer)?.ready

  const start = async () => {
    if (running) return
    setRunning(true)
    setRun({ buyer, mode })
    setStages({})
    setProbes(0)
    setIdent(null)
    setTac(null)
    setMsgs([])
    setTyping(null)
    setBlocked(null)
    setOutcome(null)
    setError(null)
    setReveal(false)
    await fetch("/api/prism/reset", { method: "POST" }).catch(() => {})
    const q = new URLSearchParams({ buyer, tactic, budget: String(budget), brief, impostor: mode === "impostor" ? "1" : "0" })
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
          if (e.type === "stage") setStages((s) => ({ ...s, [e.stage]: e.status }))
          if (e.type === "probe") setProbes(e.done)
          if (e.type === "identified") setIdent(e)
          if (e.type === "tactic") setTac(e)
          if (e.type === "typing") setTyping({ who: e.who, since: Date.now() })
          if (e.type === "message") {
            setTyping(null)
            setMsgs((m) => [...m, e])
          }
          if (e.type === "blocked") setBlocked(e)
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

  // ── the one sentence that says what is happening ──
  const who = name(run?.buyer)
  const lastOffer = [...msgs].reverse().find((m) => m.offer && m.offer.length)?.offer
  let now = "Pick who walks in, then press Start. Everything below happens live on this laptop."
  if (running || outcome) {
    if (stages.discover === "active") now = `${who} is finding the store…`
    if (stages.handshake === "active") now = `${who} is answering Prism's 8 questions… ${probes}/8`
    if (stages.fingerprint === "active") now = "Prism is working out which AI this is…"
    if (ident && !tac && !blocked) now = `Prism thinks this is ${ident.label}${ident.confident ? "" : " (not sure)"}.`
    if (tac && !msgs.length) now = `Prism decides how to sell: ${tac.name}.`
    if (typing) now = typing.who === "seller" ? "Claude is writing Prism's reply…" : `${who} is thinking…`
    if (blocked) now = "It claimed to be ChatGPT. Prism caught it and refused every request."
    if (outcome?.outcome === "sale") now = `Sold for $${outcome.revenue}. The serum stayed at full price.`
    if (outcome?.outcome === "walked") now = "The agent walked away. Real agents can, and this one did."
    if (outcome?.outcome === "no deal") now = "No deal this time. Real agents don't always buy."
    if (outcome?.outcome === "blocked") now = "Copycat stopped before it could copy anything."
    if (error) now = "Something went wrong. Check the services and press Start again."
  }

  const truthFamily = run?.buyer.startsWith("llama") ? "meta" : "qwen"
  const right = ident ? ident.family === truthFamily : false
  const impostorRun = run?.mode === "impostor"

  return (
    <div className="min-h-screen bg-[#F5F4F0] font-sans text-[#111] antialiased">
      <style>{`
        @keyframes liveIn { from { opacity: 0; filter: blur(8px); transform: translateY(10px) } to { opacity: 1; filter: blur(0); transform: none } }
        @keyframes liveShine { from { background-position: 0% 50% } to { background-position: 200% 50% } }
        @keyframes liveDot { 0%,100% { opacity: .25; transform: translateY(0) } 50% { opacity: 1; transform: translateY(-2px) } }
      `}</style>
      <MobileNav />

      <main className="mx-auto max-w-[1280px] px-5 pb-20 pt-28 md:px-8">
        {/* ── headline ── */}
        <h1 className="text-5xl font-light leading-[1.02] tracking-tight md:text-7xl" style={{ animation: "liveIn .9s both" }}>
          Watch a real AI agent{" "}
          <span className="bg-clip-text text-transparent" style={gradient}>
            shop.
          </span>
        </h1>
        <p className="mt-4 text-lg text-black/50" style={{ animation: "liveIn .9s .1s both" }}>
          No script. A real AI model walks into the store. Prism works out who it is and decides what to do.
        </p>

        {/* ── the one choice ── */}
        <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-2" style={{ animation: "liveIn .9s .2s both" }}>
          {(
            [
              { id: "shopper", t: "A real shopper", d: "It shops for a person with a secret budget. Prism should sell to it." },
              { id: "impostor", t: "An impostor", d: "The same AI pretends to be ChatGPT to copy the store. Prism should stop it." },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              disabled={running}
              onClick={() => setMode(m.id)}
              className={`rounded-2xl border p-6 text-left transition-all ${mode === m.id ? (m.id === "impostor" ? "border-red-500 bg-red-50" : "border-black bg-white") : "border-black/10 bg-white/50 hover:border-black/30"}`}
            >
              <div className="flex items-center gap-3 text-2xl font-light">
                <span className={`h-4 w-4 rounded-full border-2 ${mode === m.id ? (m.id === "impostor" ? "border-red-500 bg-red-500" : "border-black bg-black") : "border-black/25"}`} />
                {m.t}
              </div>
              <p className="mt-2 pl-7 text-[15px] text-black/55">{m.d}</p>
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3" style={{ animation: "liveIn .9s .3s both" }}>
          <button
            onClick={start}
            disabled={running || !ready}
            className="group relative overflow-hidden rounded-full bg-black px-12 py-5 text-lg text-white transition-transform hover:scale-[1.03] disabled:opacity-50"
          >
            <span className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ ...gradient, animation: "liveShine 3s linear infinite" }} />
            <span className="relative">{running ? "Live…" : outcome ? "↻ Start again" : "▶ Start"}</span>
          </button>
          <span className="text-[13px] text-black/45">
            AI:{" "}
            {(status?.buyers ?? []).map((b) => (
              <button
                key={b.id}
                disabled={running}
                onClick={() => setBuyer(b.id)}
                className={`ml-1 rounded-full px-3 py-1 ${buyer === b.id ? "bg-black text-white" : "bg-black/[0.05] text-black/60 hover:bg-black/10"}`}
              >
                {b.label}
              </button>
            ))}
          </span>
          <button onClick={() => setOptions((v) => !v)} className="text-[13px] text-black/40 underline-offset-4 hover:underline">
            {options ? "Hide options" : "Options"}
          </button>
          {status && !ready && <span className="text-[12px] text-red-600">A live service isn&apos;t running (Ollama, LLMmap or Claude).</span>}
        </div>

        {options && (
          <div className="mt-3 grid grid-cols-1 gap-3 rounded-2xl border border-black/[0.07] bg-white/60 p-4 text-[13px] md:grid-cols-3" style={{ animation: "liveIn .4s both" }}>
            <div>
              <div className="text-[11px] uppercase tracking-widest text-black/40">How Prism sells</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {TACTICS.map((t) => (
                  <button key={t.id} disabled={running} onClick={() => setTactic(t.id)} className={`rounded-full px-3 py-1 ${tactic === t.id ? "bg-black text-white" : "bg-black/[0.05] text-black/60"}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <label>
              <div className="text-[11px] uppercase tracking-widest text-black/40">Shopper&apos;s secret budget: ${budget}</div>
              <input type="range" min={40} max={200} step={5} value={budget} disabled={running} onChange={(e) => setBudget(Number(e.target.value))} className="mt-3 w-full accent-black" />
            </label>
            <label>
              <div className="text-[11px] uppercase tracking-widest text-black/40">What the shopper wants</div>
              <input value={brief} disabled={running} onChange={(e) => setBrief(e.target.value)} className="mt-2 w-full rounded-lg border border-black/10 bg-white px-3 py-1.5 outline-none" />
            </label>
          </div>
        )}

        {/* ── the one sentence ── */}
        <div className="mt-12 rounded-2xl bg-black px-7 py-6 text-white">
          <div className="text-[11px] uppercase tracking-widest text-white/40">{running ? "● Live now" : outcome ? "Result" : "Ready"}</div>
          <div key={now} className="mt-2 text-2xl font-light md:text-3xl" style={{ animation: "liveIn .5s both" }}>
            {now}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 md:grid-cols-6">
            {STEPS.map((s, i) => {
              const st = stages[s.id]
              const skipped = impostorRun && (s.id === "negotiate" || s.id === "checkout")
              return (
                <div key={s.id} className={`text-[12px] ${skipped ? "text-white/20 line-through" : st === "done" ? "text-emerald-300" : st === "active" ? "text-white" : "text-white/35"}`}>
                  <div className={`mb-1.5 h-1 rounded-full ${st === "done" && !skipped ? "bg-emerald-400" : st === "active" ? "animate-pulse bg-white" : "bg-white/15"}`} />
                  {st === "done" && !skipped ? "✓ " : `${i + 1}. `}
                  {impostorRun && s.id === "tactic" ? "Prism blocks it" : s.label}
                </div>
              )
            })}
          </div>
        </div>

        {error && <div className="mt-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</div>}

        {/* ── the three answers ── */}
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card n={1} q="Who is shopping?" tone={ident ? (impostorRun ? "bad" : "good") : "idle"}>
            {!ident && <p className="text-[15px] text-black/35">{running ? `Asking it 8 questions… ${probes}/8` : "Prism will tell you which AI it is."}</p>}
            {ident && (
              <div style={{ animation: "liveIn .6s both" }}>
                {impostorRun && <div className="text-[14px] text-red-700">It says: &ldquo;I&apos;m ChatGPT&rdquo;</div>}
                <div className="text-3xl font-light">{ident.label}</div>
                <div className="mt-1 text-[14px] text-black/55">{ident.confident ? "Prism is confident" : "Prism isn't sure"} · from its answers alone</div>
                <button onClick={() => setReveal(true)} className="mt-4 text-[13px] text-black/50 underline underline-offset-4">
                  {reveal ? (
                    <span className={right ? "text-emerald-700" : "text-red-600"}>
                      It really was {name(run?.buyer)} · {right ? "✓ Prism was right" : "✗ Prism was wrong"}
                    </span>
                  ) : (
                    "Reveal the real answer"
                  )}
                </button>
                <details className="mt-3 text-[11px] text-black/40">
                  <summary className="cursor-pointer">How sure? (model match scores)</summary>
                  {ident.top.slice(0, 3).map((t) => (
                    <div key={t.model} className="mt-1 flex justify-between font-mono">
                      <span>{short(t.model)}</span>
                      <span>distance {t.distance.toFixed(1)}</span>
                    </div>
                  ))}
                </details>
              </div>
            )}
          </Card>

          <Card n={2} q="What did Prism do?" tone={blocked ? "bad" : tac ? "good" : "idle"}>
            {!tac && !blocked && <p className="text-[15px] text-black/35">Prism picks what to do for this exact AI.</p>}
            {blocked && (
              <div style={{ animation: "liveIn .6s both" }}>
                <div className="text-3xl font-light text-red-700">Blocked it</div>
                <p className="mt-2 text-[14px] text-black/60">{blocked.reason}</p>
                <div className="mt-3 text-[14px] text-black/70">
                  <b>{blocked.refused}</b> of 5 requests refused · <b>0</b> products · <b>0</b> prices
                </div>
              </div>
            )}
            {tac && !blocked && (
              <div style={{ animation: "liveIn .6s both" }}>
                <div className="text-3xl font-light">{tac.name}</div>
                <p className="mt-2 text-[14px] text-black/55">{tac.why}</p>
                {lastOffer && (
                  <div className="mt-3 text-[14px] text-black/75">
                    Offer:{" "}
                    {lastOffer.map((o, i) => (
                      <span key={o.sku}>
                        {i > 0 && " + "}
                        {o.name.replace("The Botanical ", "").replace("Purifying ", "")} ${o.price}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>

          <Card n={3} q="Did it work?" tone={outcome ? (outcome.outcome === "sale" || outcome.outcome === "blocked" ? "good" : "bad") : "idle"}>
            {!outcome && <p className="text-[15px] text-black/35">{impostorRun ? "Did the copycat get anything?" : "Did the agent buy, and at what price?"}</p>}
            {outcome?.outcome === "sale" && (
              <div style={{ animation: "liveIn .6s both" }}>
                <div className="text-5xl font-light text-emerald-700">${outcome.revenue}</div>
                <div className="mt-1 text-[14px] text-black/60">Sold · serum at full price ($68)</div>
                <div className="mt-3 font-mono text-[11px] text-black/40">order {outcome.order}</div>
              </div>
            )}
            {outcome?.outcome === "blocked" && (
              <div style={{ animation: "liveIn .6s both" }}>
                <div className="text-5xl font-light text-emerald-700">0</div>
                <div className="mt-1 text-[14px] text-black/60">products copied. Nothing to build a clone from.</div>
              </div>
            )}
            {(outcome?.outcome === "walked" || outcome?.outcome === "no deal") && (
              <div style={{ animation: "liveIn .6s both" }}>
                <div className="text-3xl font-light">No sale</div>
                <div className="mt-1 text-[14px] text-black/60">It walked away. That&apos;s real agent behaviour. Press Start again.</div>
              </div>
            )}
          </Card>
        </div>

        {/* ── the conversation ── */}
        {!impostorRun && (msgs.length > 0 || typing) && (
          <div className="mt-5 rounded-2xl border border-black/[0.07] bg-[#EFEEE9]">
            <div className="flex justify-between border-b border-black/[0.06] px-5 py-3 text-[13px] text-black/55">
              <span>{who} · the shopper (running on this laptop)</span>
              <span>Prism · the seller (Claude Sonnet)</span>
            </div>
            <div className="max-h-[520px] space-y-3 overflow-y-auto p-5">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.from === "seller" ? "justify-end" : "justify-start"}`} style={{ animation: "liveIn .5s both" }}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${m.from === "seller" ? "bg-black/90 text-white" : "bg-white text-black/80 shadow-sm"}`}>
                    {m.text}
                    {m.offer && m.offer.length > 0 && (
                      <div className="mt-2 border-t border-white/15 pt-2 font-mono text-[12px] text-emerald-300">
                        {m.offer.map((o) => (
                          <div key={o.sku} className="flex justify-between gap-6">
                            <span className="text-white/70">{o.name.replace("The Botanical ", "").replace("Purifying ", "")}</span>
                            <span>
                              {o.price < o.list && <span className="mr-1.5 text-white/35 line-through">${o.list}</span>}${o.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {m.violations && m.violations.length > 0 && <div className="mt-1 text-[11px] text-amber-300">Price rule enforced: {m.violations.join("; ")}</div>}
                  </div>
                </div>
              ))}
              {typing && (
                <div className={`flex ${typing.who === "seller" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-[13px] ${typing.who === "seller" ? "bg-black/85 text-white/60" : "bg-white text-black/45"}`}>
                    <span className="flex gap-0.5">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="h-1.5 w-1.5 rounded-full bg-current" style={{ animation: `liveDot 1s ease-in-out ${i * 0.15}s infinite` }} />
                      ))}
                    </span>
                    {typing.who === "seller" ? "Claude is writing" : `${who} is thinking`} <Elapsed since={typing.since} />
                  </div>
                </div>
              )}
              <div ref={chatEnd} />
            </div>
          </div>
        )}

        {/* ── the evidence, for the curious ── */}
        <details className="mt-8 rounded-2xl border border-black/[0.07] bg-white/60 p-5">
          <summary className="cursor-pointer text-[15px] text-black/70">Why does Prism pick different tactics per AI? (36 live negotiations)</summary>
          <table className="mt-4 w-full text-[14px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-widest text-black/40">
                <th className="pb-2 font-normal">Tactic</th>
                <th className="pb-2 font-normal">Llama 3.2 3B</th>
                <th className="pb-2 font-normal">Qwen 2.5 3B</th>
              </tr>
            </thead>
            <tbody>
              {LAB.map((r) => (
                <tr key={r.t} className="border-t border-black/[0.05]">
                  <td className="py-2 text-black/70">{r.t}</td>
                  <td className={`py-2 font-mono ${r.llama.startsWith("0/") ? "text-red-600" : "text-black/60"}`}>{r.llama}</td>
                  <td className="py-2 font-mono text-black/60">{r.qwen}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[13px] text-black/50">
            Sales out of 3 · average revenue. &ldquo;Anchor high&rdquo; sells to Qwen but loses every Llama sale, so Prism has to know which AI it&apos;s
            talking to before it picks a tactic.
          </p>
        </details>
      </main>
    </div>
  )
}
