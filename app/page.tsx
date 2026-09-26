"use client"

import React, { useCallback, useEffect, useState } from "react"
import { IntroAnimation, HERO_REVEAL_MS } from "@/components/intro-animation"
import { MobileNav } from "@/components/mobile-nav"
import { DemoStory } from "@/components/demo-story"

// Blur-up reveal used for every hero element, staggered by `delay` (ms).
function reveal(ready: boolean, delay = 0, blur = 24, y = 32): React.CSSProperties {
  const t = `cubic-bezier(0.16,1,0.3,1) ${delay}ms`
  return {
    opacity: ready ? 1 : 0,
    filter: ready ? "blur(0px)" : `blur(${blur}px)`,
    transform: ready ? "translateY(0px)" : `translateY(${y}px)`,
    transition: `opacity 1s ${t}, filter 1s ${t}, transform 1s ${t}`,
  }
}

const FACTS = [
  { value: "52", label: "AI models it can fingerprint" },
  { value: "1", label: "line to install" },
  { value: "0", label: "sales lost to copycats" },
]

export default function PrismPage() {
  const [heroReady, setHeroReady] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const handleIntroDone = useCallback(() => setHeroReady(true), [])

  // Start the video zoom slightly before the hero content reveals
  useEffect(() => {
    const t = setTimeout(() => setVideoReady(true), HERO_REVEAL_MS)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen bg-[#F5F4F0] font-sans text-[#111] antialiased">
      <IntroAnimation onDone={handleIntroDone} />
      <MobileNav />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative h-screen overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 z-0 h-full w-full object-cover"
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/agentic-hero-9yW3wnTNMfn2U6lsVhTTZSJFEvAoSj.mp4"
          style={{ transform: videoReady ? "scale(1.05)" : "scale(0.85)", transition: "transform 2s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
        {/* light rising from the bottom + progressive blur */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          style={{
            height: "70%",
            background:
              "linear-gradient(to top, #F5F4F0 0%, #F5F4F0 20%, rgba(245,244,240,0.85) 38%, rgba(245,244,240,0.5) 58%, rgba(245,244,240,0.15) 78%, transparent 100%)",
          }}
        />
        {[20, 38, 55].map((h, i) => (
          <div
            key={h}
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
            style={{
              height: `${h}%`,
              backdropFilter: `blur(${[12, 6, 2][i]}px)`,
              WebkitBackdropFilter: `blur(${[12, 6, 2][i]}px)`,
              maskImage: "linear-gradient(to top, black 0%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)",
            }}
          />
        ))}

        <div className="absolute inset-x-0 bottom-0 z-30 flex max-w-5xl flex-col px-6 pb-14 md:px-12">
          <h1
            className="text-6xl font-light leading-[0.98] tracking-tight sm:text-7xl md:text-8xl"
            style={{ fontFamily: '"IBM Plex Sans", sans-serif', ...reveal(heroReady) }}
          >
            Every agent
            <br />
            gets its own{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(90deg,#3b82f6,#a855f7,#ef4444,#f59e0b,#3b82f6)",
                backgroundSize: "200% 100%",
                animation: "heroShine 7s linear infinite",
              }}
            >
              experience.
            </span>
          </h1>

          <p
            className="mt-6 max-w-2xl text-lg font-light leading-relaxed text-black/60 md:text-xl"
            style={{ fontFamily: '"IBM Plex Sans", sans-serif', ...reveal(heroReady, 140, 16, 20) }}
          >
            Prism tells your store which AI model is shopping, offers each one the deal that converts it, and traces the copycats that clone
            you.
          </p>

          <div className="mt-8 flex flex-wrap items-end gap-10" style={reveal(heroReady, 260, 16, 20)}>
            <a
              href="#demo"
              className="group relative overflow-hidden rounded-full bg-black px-7 py-4 text-sm tracking-wide text-white transition-transform hover:scale-[1.03]"
            >
              <span
                className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                style={{ backgroundImage: "linear-gradient(90deg,#3b82f6,#a855f7,#ef4444,#3b82f6)", backgroundSize: "200% 100%", animation: "heroShine 3s linear infinite" }}
              />
              <span className="relative">Watch it work ↓</span>
            </a>
            {FACTS.map((f, i) => (
              <div key={f.label} style={reveal(heroReady, 320 + i * 90, 16, 20)}>
                <div className="text-3xl font-light tracking-tight sm:text-4xl" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                  {f.value}
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-widest text-black/40">{f.label}</div>
              </div>
            ))}
          </div>
        </div>
        <style>{`@keyframes heroShine { from { background-position: 0% 50% } to { background-position: 200% 50% } }`}</style>
      </section>

      {/* ── THE DEMO: one store, one button ─────────────────────────────── */}
      <DemoStory />

      <footer className="border-t border-black/[0.06] px-6 py-8 md:px-12">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between text-xs text-black/30">
          <span className="font-pixel tracking-[0.25em] text-black/50">PRISM</span>
          <span>Built at the Grok Bot Commerce London Hackathon · 2026</span>
        </div>
      </footer>
    </div>
  )
}
