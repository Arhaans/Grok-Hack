"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { AgentIdentity, Incident, NegotiationTurn, PrismState, RunResult, Tactic } from "@/lib/types"

// Live demo: the Prism Skincare store (with Prism installed) in an iframe, driven by demo agents.
// Everything shown here comes from the Prism backend (/api/demo/run, /api/prism/events).

type Chat = { model: string; label: string; tactic?: Tactic; lines: { from: "agent" | "prism"; text: string }[]; total?: number }

const SHOPPERS = [
  { model: "gpt-4o", label: "ChatGPT agent" },
  { model: "claude-3.5-sonnet", label: "Claude agent" },
  { model: "llama-3.1-8b", label: "Self-hosted Llama agent" },
]

const EXPERIENCE_STYLE: Record<string, string> = {
  "private-offer": "bg-emerald-500/10 text-emerald-700",
  negotiated: "bg-sky-500/10 text-sky-700",
  public: "bg-black/5 text-black/50",
  withheld: "bg-red-500/10 text-red-700",
}

function chatFromRun(run: RunResult, label: string): Chat {
  const tactic = run.steps.find((s) => s.step === "tactic")?.data as Tactic | undefined
  const lines = run.steps
    .filter((s) => s.step === "negotiate")
    .map((s) => {
      const d = s.data as NegotiationTurn | { from: "agent" }
      return { from: d.from, text: s.label.replace(/^(Agent|Prism): "/, "").replace(/"$/, "") }
    })
  const cart = run.steps.find((s) => s.step === "cart")?.data as { total?: number } | undefined
  return { model: run.sessionId, label, tactic, lines, total: cart?.total }
}

function Meter({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-10 text-[9px] uppercase tracking-widest text-black/35">{label}</span>
      <div className="h-1 flex-1 rounded-full bg-black/[0.06]">
        <div className={`h-1 rounded-full ${tone} transition-all duration-700`} style={{ width: `${value}%` }} />
      </div>
      <span className="w-6 text-right font-mono text-[10px] text-black/45">{value}</span>
    </div>
  )
}

function AgentCard({ id }: { id: AgentIdentity }) {
  const best = id.modelGuess?.inLibrary ? id.modelGuess.top[0] : undefined
  return (
    <div
      className={`rounded-xl border p-4 bg-white/70 backdrop-blur ${id.impersonation ? "border-red-400/60" : "border-black/[0.07]"}`}
      style={{ animation: "demoIn 0.5s cubic-bezier(0.16,1,0.3,1) both" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm text-black/80">
            {id.claimed ?? "Unknown agent"} {id.verified && <span className="text-emerald-600">✓ signed</span>}
          </div>
          <div className="mt-0.5 truncate font-mono text-[10px] text-black/35">
            {best ? `fingerprint: ${best.model.split("/").pop()} (d ${best.distance.toFixed(1)})` : id.verified ? `signer: ${id.verifiedAs}` : "no fingerprint"}
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] tracking-wide ${EXPERIENCE_STYLE[id.experience] ?? ""}`}>
          {id.experience}
        </span>
      </div>
      {id.impersonation && (
        <div className="mt-2 rounded-md bg-red-500/10 px-2 py-1 text-[11px] text-red-700">Impersonation: claim contradicted by fingerprint</div>
      )}
      <div className="mt-3 space-y-1.5">
        <Meter label="trust" value={id.scores.trust} tone="bg-emerald-500/70" />
        <Meter label="lead" value={id.scores.lead} tone="bg-sky-500/70" />
        <Meter label="risk" value={id.scores.risk} tone="bg-red-500/70" />
      </div>
    </div>
  )
}

function ChatCard({ chat }: { chat: Chat }) {
  return (
    <div className="rounded-xl border border-black/[0.07] bg-white/70 p-4 backdrop-blur" style={{ animation: "demoIn 0.5s both" }}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs text-black/60">{chat.label}</span>
        {chat.tactic && <span className="rounded-full bg-black/[0.05] px-2 py-0.5 text-[10px] text-black/55">{chat.tactic.name}</span>}
      </div>
      <div className="space-y-2">
        {chat.lines.map((l, i) => (
          <div key={i} className={`flex ${l.from === "prism" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[88%] rounded-2xl px-3 py-2 text-[11px] leading-snug ${
                l.from === "prism" ? "bg-black/80 text-white" : "bg-black/[0.05] text-black/70"
              }`}
            >
              {l.text}
            </div>
          </div>
        ))}
      </div>
      {chat.total !== undefined && <div className="mt-3 text-right font-mono text-[11px] text-black/50">checked out ${chat.total}</div>}
    </div>
  )
}

function IncidentCard({ inc }: { inc: Incident }) {
  return (
    <div className="rounded-xl border border-red-400/50 bg-red-50/70 p-4" style={{ animation: "demoIn 0.5s both" }}>
      <div className="text-[10px] uppercase tracking-widest text-red-700/80">Copycat traced</div>
      <div className="mt-1 text-sm text-black/75">{inc.cloneUrl.replace("https://", "")}</div>
      <div className="mt-2 text-[11px] leading-relaxed text-black/60">
        Hidden marker <span className="font-mono text-red-700">{inc.markerFound}</span> in the copied text leads back to session{" "}
        <span className="font-mono">{inc.sourceSessionId}</span> ({inc.sourceClaimed ?? "unknown agent"}).
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {inc.changedFields.slice(0, 3).map((f, i) => (
          <span key={i} className="rounded-md bg-white/80 px-2 py-0.5 font-mono text-[10px] text-black/55">
            {f.field}: {f.ours} → {f.theirs}
          </span>
        ))}
        <span className="rounded-md bg-white/80 px-2 py-0.5 font-mono text-[10px] text-red-700">checkout: {inc.badCheckoutDomain}</span>
      </div>
    </div>
  )
}

export function DemoStage() {
  const [state, setState] = useState<PrismState | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [busy, setBusy] = useState<string | null>(null)
  const [frameKey, setFrameKey] = useState(0)
  const [log, setLog] = useState<string[]>([])
  const since = useRef(0)

  useEffect(() => {
    fetch("/api/demo/warmup", { method: "POST" }).catch(() => {})
    const poll = async () => {
      try {
        const s = (await (await fetch(`/api/prism/events?since=${since.current}`, { cache: "no-store" })).json()) as PrismState
        if (s.identities.length === 0 && s.events.length === 0) since.current = 0
        for (const e of s.events) since.current = Math.max(since.current, e.id)
        setState(s)
        if (s.events.length)
          setLog((prev) => [...prev, ...s.events.filter((e) => e.kind !== "request").map((e) => e.summary)].slice(-6))
      } catch {
        // backend not reachable
      }
    }
    poll()
    const t = setInterval(poll, 1000)
    return () => clearInterval(t)
  }, [])

  const run = useCallback(async (q: string) => {
    const r = await fetch(`/api/demo/run?${q}`, { method: "POST" })
    return (await r.json()) as RunResult
  }, [])

  const lineup = async () => {
    setBusy("lineup")
    setChats([])
    const runs = await Promise.all(SHOPPERS.map((s) => run(`agent=shopper&model=${s.model}&pace=700`)))
    setChats(runs.map((r, i) => chatFromRun(r, SHOPPERS[i].label)))
    setBusy(null)
  }
  const copycat = async () => {
    setBusy("copycat")
    await run("agent=copycat&probeAnswers=recorded&pace=600")
    setFrameKey((k) => k + 1)
    setBusy(null)
  }
  const buyer = async () => {
    setBusy("buyer")
    await run("agent=buyer&pace=600")
    setBusy(null)
  }
  const reset = async () => {
    await fetch("/api/prism/reset", { method: "POST" })
    since.current = 0
    setChats([])
    setLog([])
    setFrameKey((k) => k + 1)
  }

  const identities = state?.identities ?? []
  const incidents = state?.incidents ?? []
  const hasClone = !!state?.clone

  const btn = "rounded-full border px-4 py-2 text-xs tracking-wide transition-colors disabled:opacity-40"
  return (
    <section id="demo" className="border-t border-black/[0.06] px-6 py-24 md:px-12 lg:px-20">
      <style>{`@keyframes demoIn { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }`}</style>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="rounded-full bg-black/[0.05] px-3 py-1 text-[10px] tracking-widest text-black/45">LIVE DEMO</span>
            <h2 className="mt-5 text-4xl font-light leading-[1.05] tracking-tight md:text-5xl">
              One store. Every agent
              <br />
              gets its own experience.
            </h2>
            <p className="mt-4 max-w-xl text-sm text-black/45">
              Prism Skincare added one line to install Prism. Send agents at it and watch Prism identify them, negotiate per model, and trace copycats.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={lineup} disabled={!!busy} className={`${btn} border-black/80 bg-black text-white hover:bg-black/80`}>
              {busy === "lineup" ? "Negotiating…" : "Send 3 shopping agents"}
            </button>
            <button onClick={copycat} disabled={!!busy} className={`${btn} border-red-500/40 text-red-700 hover:bg-red-50`}>
              {busy === "copycat" ? "Scraping…" : "Send a copycat"}
            </button>
            <button onClick={buyer} disabled={!!busy} className={`${btn} border-black/15 text-black/70 hover:bg-black/[0.04]`}>
              {busy === "buyer" ? "Buying…" : "Send verified buyer"}
            </button>
            <button onClick={reset} disabled={!!busy} className={`${btn} border-black/10 text-black/40 hover:bg-black/[0.04]`}>
              Reset
            </button>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Store(s) */}
          <div className={`grid gap-4 self-start lg:sticky lg:top-24 lg:col-span-7 ${hasClone ? "grid-cols-2" : "grid-cols-1"}`}>
            {[false, ...(hasClone ? [true] : [])].map((clone) => (
              <div key={String(clone)} className={`overflow-hidden rounded-2xl border ${clone ? "border-red-400/60" : "border-black/[0.08]"} bg-white`}>
                <div className="flex items-center gap-2 border-b border-black/[0.06] px-4 py-2">
                  <span className={`h-2 w-2 rounded-full ${clone ? "bg-red-500" : "bg-emerald-500"}`} />
                  <span className="font-mono text-[11px] text-black/50">
                    {clone ? state?.clone?.domain : "prismskincare.com"} {clone ? "· copycat" : "· Prism installed"}
                  </span>
                </div>
                <iframe
                  key={`${frameKey}-${clone}`}
                  src={clone ? "/store?clone=1" : "/store"}
                  title={clone ? "Copycat outlet" : "Prism Skincare store"}
                  className="h-[560px] w-full"
                />
              </div>
            ))}
          </div>

          {/* Prism's view */}
          <div className="space-y-3 lg:col-span-5">
            <div className="text-[10px] uppercase tracking-widest text-black/35">Prism sees</div>
            {incidents.map((inc) => (
              <IncidentCard key={inc.id} inc={inc} />
            ))}
            {identities.length === 0 && (
              <div className="rounded-xl border border-dashed border-black/10 p-6 text-center text-xs text-black/35">
                No agents yet. Send some at the store.
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {identities.slice(0, 6).map((id) => (
                <AgentCard key={id.sessionId} id={id} />
              ))}
            </div>
            {chats.map((c) => (
              <ChatCard key={c.model} chat={c} />
            ))}
            {log.length > 0 && (
              <div className="rounded-xl border border-black/[0.06] bg-black/[0.02] p-3">
                {log.map((l, i) => (
                  <div key={i} className="truncate font-mono text-[10px] leading-5 text-black/45" title={l}>
                    {l}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
