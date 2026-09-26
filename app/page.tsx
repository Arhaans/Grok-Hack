"use client"

import React, { useRef, useEffect, useState, useCallback } from "react"
import { IntroAnimation, INTRO_DURATION_MS, HERO_REVEAL_MS } from "@/components/intro-animation"
import { PixelIcon } from "@/components/pixel-icon"
import { LiveAgentFeed, LiveAgentCounter } from "@/components/live-agent-feed"
import { LiveTrail } from "@/components/live-trail"
import { RevealText } from "@/components/reveal-text"
import { StackingAgentCards } from "@/components/stacking-agent-cards"
import { MobileNav } from "@/components/mobile-nav"

const OUTCOMES = [
  {
    label: "Verified buyer",
    request: "Best checkout-ready offer",
    prism: "Identity verified · Lead 91",
    response: "Signed offer",
    result: "+£21 lead value over baseline",
    tone: "blue",
    delay: "0s",
  },
  {
    label: "Research agent",
    request: "Compare variants and policies",
    prism: "Identity known · Lead 58",
    response: "Comparison packet",
    result: "Lead captured, margin intact",
    tone: "violet",
    delay: "1.8s",
  },
  {
    label: "Unknown crawler",
    request: "Full catalog and lowest price",
    prism: "Identity weak · Lead 12",
    response: "Public price only",
    result: "No private path leaked",
    tone: "stone",
    delay: "3.6s",
  },
  {
    label: "Copycat",
    request: "Claims ChatGPT, harvests SKUs",
    prism: "Identity spoofed · LLMmap mismatch",
    response: "Offer blocked",
    result: "Copycat stopped: C-1842",
    tone: "red",
    delay: "5.4s",
  },
]

// ─── Intersection Observer hook ──────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

// ─── Animated counter ────────────────────────────────────────────────────────
function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const { ref, inView } = useInView()
  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 1800
    const step = 16
    const increment = end / (duration / step)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, step)
    return () => clearInterval(timer)
  }, [inView, end])
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

// ─── Bento card ──────────────────────────────────────────────────────────────
function BentoCard({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, inView } = useInView(0.1)
  return (
    <div
      ref={ref}
      className={`group relative rounded-2xl border border-black/[0.07] bg-white overflow-hidden transition-all duration-700 hover:border-black/[0.15] hover:bg-[#fafaf8] ${className}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms, border-color 0.3s ease, background-color 0.3s ease`,
      }}
    >
      {/* Hover glow spot */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: "radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0,0,0,0.03), transparent 60%)" }}
      />
      {children}
    </div>
  )
}

// ─── Pill tag ─────────────────────────────────────────────────────────────────
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] tracking-widest font-sans text-black/40 bg-black/[0.04]">
      {children}
    </span>
  )
}

function AgentOutcomeSection() {
  const tone = {
    blue: {
      chip: "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-500",
      glow: "rgba(37,99,235,0.22)",
    },
    violet: {
      chip: "bg-violet-50 text-violet-700 border-violet-200",
      dot: "bg-violet-500",
      glow: "rgba(124,58,237,0.18)",
    },
    stone: {
      chip: "bg-stone-100 text-stone-650 border-stone-200",
      dot: "bg-stone-500",
      glow: "rgba(120,113,108,0.18)",
    },
    red: {
      chip: "bg-red-50 text-red-700 border-red-200",
      dot: "bg-red-500",
      glow: "rgba(220,38,38,0.22)",
    },
  } as const

  return (
    <section id="agent-outcomes" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06] overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
          <div>
            <PixelIcon type="workflow" size={40} />
            <div className="mt-4"><Tag>LIVE OUTCOMES</Tag></div>
            <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
              {"Every agent gets\na unique experience."}
            </RevealText>
          </div>
          <p className="text-sm text-black/45 leading-relaxed max-w-sm">
            Prism gives each agent an identity, creates the right experience, maximizes lead value, and stops copycats.
          </p>
        </div>

        <BentoCard className="p-4 md:p-6" delay={0}>
          <div className="relative min-h-[620px] overflow-hidden rounded-2xl border border-black/[0.06] bg-[#faf9f7] md:min-h-[520px]">
            <img
              src="/images/arc.png"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover opacity-70"
              style={{ objectPosition: "center 70%" }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(250,249,247,0.94)_0%,rgba(250,249,247,0.82)_42%,rgba(250,249,247,0.94)_100%)]" />

            <svg className="absolute inset-0 hidden h-full w-full md:block" viewBox="0 0 1100 520" fill="none" preserveAspectRatio="none" aria-hidden="true">
              <path d="M210 260 C330 260 390 260 510 260" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" />
              <path d="M590 260 C710 120 780 92 930 88" stroke="rgba(37,99,235,0.34)" strokeWidth="1.5" />
              <path d="M590 260 C710 210 780 196 930 194" stroke="rgba(124,58,237,0.3)" strokeWidth="1.5" />
              <path d="M590 260 C710 315 780 322 930 326" stroke="rgba(120,113,108,0.28)" strokeWidth="1.5" />
              <path d="M590 260 C710 420 780 432 930 438" stroke="rgba(220,38,38,0.34)" strokeWidth="1.5" />
            </svg>

            <div className="absolute left-1/2 top-1/2 z-10 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl border border-white/70 bg-white/70 text-sm tracking-widest text-black/55 shadow-xl" style={{ backdropFilter: "blur(22px)" }}>
              PRISM
            </div>

            <div className="relative z-10 grid min-h-[620px] grid-cols-1 gap-5 p-5 md:min-h-[520px] md:grid-cols-[230px_1fr_310px] md:p-8">
              <div className="flex items-center">
                <div className="w-full rounded-2xl border border-black/[0.07] bg-white/75 p-5 shadow-lg shadow-black/5" style={{ backdropFilter: "blur(18px)" }}>
                  <div className="text-[10px] tracking-widest text-black/30 uppercase">Incoming</div>
                  <h3 className="mt-3 text-2xl font-light">Agent traffic</h3>
                  <p className="mt-3 text-sm leading-6 text-black/42">Same product. Different identity, intent, and risk.</p>
                  <div className="mt-5 flex -space-x-2">
                    {OUTCOMES.map((item) => {
                      const style = tone[item.tone as keyof typeof tone]
                      return <span key={item.label} className={`h-8 w-8 rounded-full border-2 border-white ${style.dot}`} />
                    })}
                  </div>
                </div>
              </div>

              <div className="relative hidden md:block">
                {OUTCOMES.map((item, index) => {
                  const style = tone[item.tone as keyof typeof tone]
                  const positions = [
                    { left: "15%", top: "49%", x: "360px", y: "-172px" },
                    { left: "15%", top: "49%", x: "360px", y: "-66px" },
                    { left: "15%", top: "49%", x: "360px", y: "66px" },
                    { left: "15%", top: "49%", x: "360px", y: "178px" },
                  ][index]
                  return (
                    <span
                      key={item.label}
                      className={`absolute h-3 w-3 rounded-full ${style.dot} shadow-lg`}
                      style={{
                        left: positions.left,
                        top: positions.top,
                        animation: "edgePulse 4.8s cubic-bezier(0.16,1,0.3,1) infinite",
                        animationDelay: item.delay,
                        "--pulse-x": positions.x,
                        "--pulse-y": positions.y,
                      } as React.CSSProperties}
                    />
                  )
                })}
              </div>

              <div className="grid gap-3 md:grid-rows-4">
                {OUTCOMES.map((item) => {
                  const style = tone[item.tone as keyof typeof tone]
                  return (
                    <div
                      key={item.label}
                      className="relative overflow-hidden rounded-2xl border border-black/[0.06] bg-white/76 p-4 shadow-lg shadow-black/5"
                      style={{
                        background: `radial-gradient(circle at 100% 0%, ${style.glow}, transparent 38%), rgba(255,255,255,0.72)`,
                        backdropFilter: "blur(18px)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className={`inline-flex rounded-lg border px-2.5 py-1 text-[10px] tracking-widest ${style.chip}`}>
                            {item.response}
                          </div>
                          <h3 className="mt-2 text-lg font-light">{item.label}</h3>
                          <p className="mt-1 text-xs leading-5 text-black/38">{item.prism}</p>
                        </div>
                        <span className={`mt-1 h-2.5 w-2.5 rounded-full ${style.dot}`} />
                      </div>
                      <div className="mt-3 rounded-xl border border-black/[0.05] bg-black/[0.025] px-3 py-2">
                        <div className="text-[10px] tracking-widest text-black/25 uppercase">Ending</div>
                        <div className="mt-1 text-sm font-light text-black/70">{item.result}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <style>{`
              @keyframes edgePulse {
                0% { opacity: 0; transform: translate(0, 0) scale(0.75); filter: blur(4px); }
                12% { opacity: 1; filter: blur(0); }
                62% { opacity: 1; transform: translate(var(--pulse-x), var(--pulse-y)) scale(1); filter: blur(0); }
                100% { opacity: 0; transform: translate(var(--pulse-x), var(--pulse-y)) scale(0.75); filter: blur(4px); }
              }
            `}</style>
          </div>
        </BentoCard>
      </div>
    </section>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AgenticPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [heroReady, setHeroReady] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const handleIntroDone = useCallback(() => {
    setHeroReady(true)
  }, [])

  // Start video zoom slightly before hero content reveals, for seamless overlap
  useEffect(() => {
    const t = setTimeout(() => setVideoReady(true), HERO_REVEAL_MS)
    return () => clearTimeout(t)
  }, [])

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`)
    el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`)
  }

  return (
    <div className="bg-[#F5F4F0] text-[#111] min-h-screen font-sans antialiased">

      {/* ── INTRO ANIMATION ───────────────────────────────────────────────── */}
      <IntroAnimation onDone={handleIntroDone} />

      {/* ── STICKY NAV ────────────────────────────────────────────────────── */}
      <MobileNav />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative h-screen overflow-hidden">

        {/* Video background — zooms in once intro is done */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/agentic-hero-9yW3wnTNMfn2U6lsVhTTZSJFEvAoSj.mp4"
          style={{
            transform: videoReady ? "scale(1.05)" : "scale(0.85)",
            transition: "transform 2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />



        {/* Progressive blur + light gradient rising from bottom */}
        <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none" style={{ height: "65%", background: "linear-gradient(to top, #F5F4F0 0%, #F5F4F0 18%, rgba(245,244,240,0.85) 35%, rgba(245,244,240,0.5) 55%, rgba(245,244,240,0.15) 75%, transparent 100%)" }} />
        {/* Backdrop blur layers — progressively lighter toward top */}
        <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none" style={{ height: "20%", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", maskImage: "linear-gradient(to top, black 0%, transparent 100%)", WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none" style={{ height: "38%", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", maskImage: "linear-gradient(to top, black 0%, transparent 100%)", WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none" style={{ height: "55%", backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)", maskImage: "linear-gradient(to top, black 0%, transparent 100%)", WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)" }} />

        {/* Spacer so hero content doesn't sit under the fixed nav */}
        <div className="h-20" />

        {/* Title + metrics — anchored to bottom left */}
        <div className="absolute inset-x-0 bottom-0 z-30 flex flex-col px-6 md:px-12 pb-12 max-w-3xl">
          {/* Title */}
          <h1
            className="text-6xl sm:text-7xl md:text-8xl font-light text-[#111] leading-[1.0] tracking-tight mb-10"
            style={{
              fontFamily: '"IBM Plex Sans", sans-serif',
              opacity: heroReady ? 1 : 0,
              filter: heroReady ? "blur(0px)" : "blur(24px)",
              transform: heroReady ? "translateY(0px)" : "translateY(32px)",
              transition: "opacity 1s cubic-bezier(0.16,1,0.3,1) 0ms, filter 1s cubic-bezier(0.16,1,0.3,1) 0ms, transform 1s cubic-bezier(0.16,1,0.3,1) 0ms",
            }}
          >
            Every agent<br />gets its own<br />experience.
          </h1>

          {/* 3 metrics — staggered after title */}
          <div className="flex gap-8 sm:gap-12">
            {[
              { value: "4", label: "Agent identities" },
              { value: "+£21", label: "Uplift / buyer" },
              { value: "0", label: "Copycats paid" },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  opacity: heroReady ? 1 : 0,
                  filter: heroReady ? "blur(0px)" : "blur(16px)",
                  transform: heroReady ? "translateY(0px)" : "translateY(20px)",
                  transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${120 + i * 80}ms, filter 0.8s cubic-bezier(0.16,1,0.3,1) ${120 + i * 80}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${120 + i * 80}ms`,
                }}
              >
                <div className="text-3xl sm:text-4xl text-[#111] font-light tracking-tight" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>{stat.value}</div>
                <div className="text-xs text-black/40 tracking-widest uppercase mt-1" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORM OVERVIEW (bento) ──────────────────────────────────────── */}
      <section id="platform" className="py-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <PixelIcon type="platform" size={40} />
            <div className="mt-4"><Tag>PRISM</Tag></div>
            <RevealText className="mt-5 text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05]">
              {"Identify agents.\nMaximize leads."}
            </RevealText>
          </div>

          <div className="grid grid-cols-12 grid-rows-auto gap-3" onMouseMove={handleMouse}>
            {/* Big left card — full width now that multi-agent is removed */}
            <BentoCard className="col-span-12 p-8 min-h-[200px] flex flex-col justify-between relative overflow-hidden" delay={0}>
              {/* Arc background image — always fills container, objects pushed to bottom third */}
              <img
                src="/images/arc.png"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: "center 70%" }}
              />
              {/* Progressive blur layer — blurs from 45% downward */}
              <div className="absolute inset-0" style={{
                maskImage: "linear-gradient(to bottom, transparent 45%, black 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, transparent 45%, black 100%)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
              }} />
              {/* Fade-to-background gradient — matches site bg color #f5f4f0 */}
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(to bottom, transparent 35%, rgba(245,244,240,0.3) 50%, rgba(245,244,240,0.75) 65%, rgba(245,244,240,0.95) 80%, rgb(245,244,240) 100%)",
                }}
              />
              {/* Content */}
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl border border-black/10 bg-white/60 flex items-center justify-center mb-6" style={{ backdropFilter: "blur(8px)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><path d="m4.93 4.93 2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/></svg>
                </div>
                <h3 className="text-xl font-light mb-3">Agent Identity Layer</h3>
                <p className="text-sm text-black/45 leading-relaxed max-w-sm">
                  Give every AI shopper an identity, then serve the experience most likely to convert without helping copycats.
                </p>
              </div>
            </BentoCard>

            {/* Bottom row */}
            <BentoCard className="col-span-12 md:col-span-4 p-8 min-h-[200px]" delay={120}>
              <div className="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center mb-5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <h3 className="text-lg font-light mb-2">Identify</h3>
              <p className="text-sm text-black/45 leading-relaxed">Use signatures, behaviour, and model fingerprints to tell which agent is visiting.</p>
            </BentoCard>

            <BentoCard className="col-span-12 md:col-span-4 p-8 min-h-[200px]" delay={160}>
              <div className="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center mb-5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10h8M8 14h5"/></svg>
              </div>
              <h3 className="text-lg font-light mb-2">Maximize Leads</h3>
              <p className="text-sm text-black/45 leading-relaxed">Give buyers offers, researchers evidence, and high-intent agents fewer reasons to drop.</p>
            </BentoCard>

            <BentoCard className="col-span-12 md:col-span-4 p-8 min-h-[200px]" delay={200}>
              <div className="w-10 h-10 rounded-xl border border-black/10 flex items-center justify-center mb-5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3 className="text-lg font-light mb-2">Stop Copycats</h3>
              <p className="text-sm text-black/45 leading-relaxed">Withhold private routes from risky agents and trace copied catalog data.</p>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* ── BUILD YOUR AGENTS (4 cards) ───────────────────────────────────── */}
      <section id="agents" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
            <div>
              <PixelIcon type="agents" size={40} />
              <div className="mt-4"><Tag>AGENT TRAFFIC</Tag></div>
              <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
                {"Buyers, researchers,\nand copycats split."}
              </RevealText>
            </div>
            <p className="text-sm text-black/45 leading-relaxed max-w-xs">
              Each agent gets an identity. Valuable agents get the path most likely to convert. Copycats get blocked, marked, and traced.
            </p>
          </div>

          <StackingAgentCards />
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section id="workflow" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06] overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <PixelIcon type="workflow" size={40} />
            <div className="mt-4"><Tag>ROUTING RULES</Tag></div>
            <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
              {"From agent identity\nto lead outcome."}
            </RevealText>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3" onMouseMove={handleMouse}>
            {[
              { n: "01", title: "Identify",  desc: "Recognize signed buyers, research agents, unknown crawlers, and spoofed claims.", delay: 0,   img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/define-5aafAmGBrxZpOqJ3XLHY3n3qzC2I5K.png" },
              { n: "02", title: "Score", desc: "Combine identity, buying intent, margin rules, and LLMmap-style behavioural fingerprints.", delay: 80,  img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/compose-5RT5VR4f1Y3GoFmovqTKLTG4UXp3g2.png" },
              { n: "03", title: "Personalize",    desc: "Serve a signed discount, comparison packet, public price, or withheld response.", delay: 140, img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/test-zm8guZwxJHtwWsJ7XO4B0CF7GzlNK8.png" },
              { n: "04", title: "Optimize",  desc: "Measure which agents reach cart, accept offers, drop off, or expose clone risk.", delay: 200, img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/deploy-an8fgHSLzniojkcmRyGGIFQUJF9T5J.png" },
            ].map((step) => (
              <BentoCard key={step.n} className="relative overflow-hidden flex flex-col min-h-[320px]" delay={step.delay}>
                {/* Image at top — mask fades it out strongly before the bottom edge */}
                <div className="absolute inset-x-0 top-0 h-56 pointer-events-none">
                  <img
                    src={step.img}
                    alt={step.title}
                    className="w-full h-full object-cover object-top"
                    style={{
                      maskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 80%)",
                      WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 80%)",
                    }}
                  />
                </div>
                {/* Number top-left */}
                <div className="relative z-10 p-7">
                  <span className="font-pixel text-[11px] text-black/20 tracking-widest block">{step.n}</span>
                </div>
                {/* Text pushed further down */}
                <div className="relative z-10 px-7 pb-7 mt-auto pt-16">
                  <h3 className="text-2xl font-light mb-3">{step.title}</h3>
                  <p className="text-sm text-black/45 leading-relaxed">{step.desc}</p>
                </div>
              </BentoCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTEGRATIONS ──────────────────────────────────────────────────── */}
      <section id="integrations" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
            <div>
              <PixelIcon type="integrations" size={40} />
              <div className="mt-4"><Tag>CONSOLE</Tag></div>
              <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
                {"See every identity.\nGrow every lead."}
              </RevealText>
            </div>
            <p className="text-sm text-black/45 leading-relaxed max-w-xs">
              Merchant analytics for agent commerce: identity, lead score, experience served, margin rule, and checkout result.
            </p>
          </div>

          {/* Full-width image block with glass cards */}
          {/* Mobile: flex-col, image + cards stacked. Desktop: image fills block, cards absolute */}
          <div className="rounded-2xl overflow-hidden border border-black/[0.07] flex flex-col md:block md:relative" onMouseMove={handleMouse}>
            {/* Image */}
            <div className="relative w-full h-[280px] md:h-[480px] shrink-0">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Org%20Arc%20-%20Upscaled-Sk90jShfu7nltLnhoQbaMJC1YaQKuU.png"
                alt="Agent orchestration architecture"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            </div>

            {/* Cards — flex row on mobile (equal spacing), absolute on desktop */}
            <div className="flex flex-col gap-3 p-4 md:absolute md:bottom-4 md:right-4 md:p-0 md:w-72">
              <div
                className="rounded-xl border border-white/50 p-6"
                style={{
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  background: "rgba(255,255,255,0.60)",
                }}
              >
                <Tag>RULE</Tag>
                <h3 className="mt-3 text-lg font-light mb-2">Personalize by identity</h3>
                <p className="text-xs text-black/45 leading-relaxed mb-4">Only identified, high-intent agents receive private pricing and checkout handoffs.</p>
                <div className="bg-black/[0.05] rounded-lg border border-black/[0.07] p-3 font-mono text-[11px] text-black/50 leading-relaxed">
                  <span className="text-black/25">// experience decision</span><br />
                  <span className="text-blue-600/70">if</span>{" (trust > 90 && lead > 80) {"}<br />
                  {"  "}experience = <span className="text-green-700/70">&apos;private-offer&apos;</span><br />
                  {"} else if (risk > 70) {"}<br />
                  {"  "}experience = <span className="text-green-700/70">&apos;withheld&apos;</span><br />
                  {"})"}
                </div>
              </div>

              <div
                className="rounded-xl border border-white/50 p-6"
                style={{
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  background: "rgba(255,255,255,0.60)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
                  <span className="text-xs text-black/40 tracking-widest">LIVE SIGNAL</span>
                </div>
                <p className="text-sm text-black/45">Verified buyer received a high-value path. Copycat was stopped and traced.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECURITY & OBSERVABILITY ──────────────────────────────────��──── */}
      <section id="security" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <PixelIcon type="platform" size={40} />
            <div className="mt-4"><Tag>PROTECTION</Tag></div>
            <RevealText className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
              {"Copycats never\nget the good path."}
            </RevealText>
          </div>

          {/* Asymmetric grid: left text + title, right interactive audit log */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left side — descriptions */}
            <div className="space-y-6">
              <p className="text-sm text-black/45 leading-relaxed">
                Prism withholds premium experiences from suspicious agents, watermarks responses, and traces copied catalog data back to the exact session.
              </p>

              <div className="space-y-4">
                {[
                  { label: "Identity-Gated Offers", desc: "Signed prices and checkout links cannot be forged by clone stores" },
                  { label: "Fingerprint Evidence", desc: "LLMmap-style probes flag model-family mismatches and spoofed claims" },
                  { label: "Clone Provenance", desc: "Invisible response markers connect copied listings to source sessions" },
                ].map((item) => (
                  <div key={item.label} className="flex gap-4">
                    <div className="w-1 bg-black/10 rounded-full shrink-0" />
                    <div>
                      <h3 className="text-sm font-light mb-1">{item.label}</h3>
                      <p className="text-xs text-black/35">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Compliance badges — vertical stack */}
              <div className="pt-4 flex flex-col gap-2">
                {["SIGNED OFFERS", "MODEL HINTS", "SESSION MARKERS", "BAD DOMAIN CHECK"].map((badge) => (
                  <div key={badge} className="flex items-center gap-2 text-xs text-black/25">
                    <span className="w-1 h-1 rounded-full bg-black/25" />
                    {badge}
                  </div>
                ))}
              </div>
            </div>

            {/* Right side — live audit log visualization */}
            <BentoCard className="p-6 lg:row-span-1" delay={0}>
              <div className="text-xs text-black/30 tracking-widest uppercase mb-4">Live Agent Trail</div>
              <LiveTrail />
              <style>{`
                @keyframes fadeInUp {
                  from { opacity: 0; transform: translateY(8px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}</style>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* ── AGENT OUTCOMES ────────────────────────────────────────────────── */}
      <AgentOutcomeSection />

      {/* ── MARQUEE CAPABILITIES ──────────────────────────────────────────── */}
      <section className="py-0 border-t border-black/[0.06] overflow-hidden select-none">
        <div className="flex border-b border-black/[0.06]" style={{ animation: "marqueeLeft 28s linear infinite" }}>
          {[...Array(3)].map((_, rep) => (
            <div key={rep} className="flex shrink-0">
              {["Verified Buyer", "Research Agent", "Unknown Crawler", "Copycat", "Identity Score", "Lead Score", "Signed Offer", "Public Price", "Clone Scan", "Checkout Handoff"].map((cap) => (
                <div key={cap} className="flex items-center gap-6 px-10 py-5 border-r border-black/[0.06] shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-black/20 shrink-0" />
                  <span className="text-sm text-black/45 whitespace-nowrap tracking-wide">{cap}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex" style={{ animation: "marqueeRight 22s linear infinite" }}>
          {[...Array(3)].map((_, rep) => (
            <div key={rep} className="flex shrink-0">
              {["Returns Asked", "Shipping Asked", "Cart Built", "Offer Accepted", "Offer Withheld", "Fingerprint Mismatch", "Marker Planted", "Bad Domain", "Margin Rule", "Agent Funnel"].map((cap) => (
                <div key={cap} className="flex items-center gap-6 px-10 py-5 border-r border-black/[0.06] shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-black/12 shrink-0" />
                  <span className="text-sm text-black/30 whitespace-nowrap tracking-wide">{cap}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── LIVE AGENTS ��──────────────────────────────────────────────────── */}
      <section id="live" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <PixelIcon type="agents" size={40} />
              <div className="mt-4"><Tag>LIVE DEMO</Tag></div>
              <RevealText className="mt-5 text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05]">
                {"Agents arrive.\nPrism personalizes."}
              </RevealText>
              <p className="mt-6 text-base text-black/40 leading-relaxed max-w-sm">
                Send a buyer, researcher, or copycat. Watch Prism assign identity, maximize the lead, or stop the clone.
              </p>
              <div className="mt-10 flex items-end gap-2">
                <LiveAgentCounter />
                <span className="text-black/30 text-sm mb-1 tracking-wide">agent sessions scored</span>
              </div>
            </div>
            <div className="relative">
              <LiveAgentFeed />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="relative py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06] overflow-hidden">
        {/* Glass panels image — anchored to bottom center */}
        <img
          src="/images/footer.png"
          alt=""
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-full object-cover object-bottom pointer-events-none select-none"
          style={{ opacity: 0.85 }}
        />
        {/* Progressive blur from bottom — blends into site bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            maskImage: "linear-gradient(to top, transparent 0%, black 55%)",
            WebkitMaskImage: "linear-gradient(to top, transparent 0%, black 55%)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
        />
        {/* Colour fade from bottom to site bg #f5f4f0 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgb(245,244,240) 0%, rgba(245,244,240,0.92) 18%, rgba(245,244,240,0.55) 35%, transparent 55%)",
          }}
        />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05] mb-6">
            Identify every agent.<br />Maximize every lead.
          </h2>
          <p className="text-sm text-black/45 leading-relaxed mb-10">
            Prism helps stores personalize each agent journey while stopping copycats before they steal the sale.
          </p>
          {!submitted ? (
            <form
              onSubmit={e => { e.preventDefault(); if (email) setSubmitted(true) }}
              className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="flex-1 bg-white border border-black/10 rounded-xl px-4 py-3 text-sm text-[#111] placeholder:text-black/25 focus:outline-none focus:border-black/25 transition-colors"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-[#111] text-white text-sm rounded-xl hover:bg-[#333] transition-colors tracking-widest font-medium"
              >
                JOIN
              </button>
            </form>
          ) : (
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-emerald-600/20 bg-emerald-50 text-emerald-700 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {"You're on the list. We'll be in touch."}
            </div>
          )}
        </div>
      </section>


      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="py-10 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <span className="font-pixel text-xs tracking-[0.25em] text-black/50">PRISM</span>

          {/* Nav sections */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {[
              { label: "System",       href: "#platform" },
              { label: "Agents",       href: "#agents" },
              { label: "Routes",       href: "#workflow" },
              { label: "Console",      href: "#integrations" },
              { label: "Outcomes",     href: "#agent-outcomes" },
              { label: "Live",         href: "#live" },
            ].map(l => (
              <a key={l.label} href={l.href} className="text-xs text-black/35 hover:text-black/70 transition-colors tracking-widest">{l.label}</a>
            ))}
          </div>

          {/* Legal links */}
          <div className="flex items-center gap-6">
            {[
              { label: "Privacy", href: "#" },
              { label: "Terms",   href: "#" },
              { label: "Docs",    href: "#" },
              { label: "GitHub",  href: "#" },
            ].map(l => (
              <a key={l.label} href={l.href} className="text-xs text-black/25 hover:text-black/55 transition-colors tracking-widest">{l.label}</a>
            ))}
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-black/[0.04]">
          <span className="text-xs text-black/20">© 2026 Prism. Built at Grok Bot Commerce London Hackathon.</span>
        </div>
      </footer>
    </div>
  )
}
