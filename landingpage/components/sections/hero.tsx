"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { NeonBorder } from "@/components/neon-border";

const TERMINAL_LINES = [
  {
    text: "$ rugintel analyze --token 7xKp...mPqR",
    color: "text-cyan-400",
    delay: 0,
  },
  {
    text: "> Connecting to Bittensor subnet...",
    color: "text-gray-500",
    delay: 0.3,
  },
  {
    text: "> ✓ Connected — querying 42 active miners",
    color: "text-green-400",
    delay: 0.8,
  },
  { text: "", color: "", delay: 1.0 },
  {
    text: "─── 12-Layer Intelligence Scan ───",
    color: "text-cyan-400/70",
    delay: 1.2,
  },
  { text: "", color: "", delay: 1.3 },
  {
    text: "Layer 1: Social      ████████░░ 0.72",
    color: "text-gray-300",
    delay: 1.5,
  },
  {
    text: "Layer 2: Liquidity   █████████░ 0.91 ⚠️",
    color: "text-red-400",
    delay: 1.8,
  },
  {
    text: "Layer 3: Wallet      ████████░░ 0.83",
    color: "text-orange-400",
    delay: 2.1,
  },
  {
    text: "Layer 4: Market      █████████░ 0.94 🔴",
    color: "text-red-400",
    delay: 2.4,
  },
  {
    text: "Layer 5: Contract    ███████░░░ 0.68",
    color: "text-yellow-400",
    delay: 2.7,
  },
  {
    text: "Layer 6: Visual      ██░░░░░░░░ 0.15",
    color: "text-green-400",
    delay: 3.0,
  },
  {
    text: "Layer 7: Temporal    █████████░ 0.92 ⚠️",
    color: "text-red-400",
    delay: 3.3,
  },
  { text: "", color: "", delay: 3.5 },
  {
    text: "═══════════════════════════════════",
    color: "text-cyan-500/50",
    delay: 3.7,
  },
  {
    text: "FUSED RISK SCORE: 0.87 — HIGH RISK",
    color: "text-red-400 font-bold",
    delay: 3.9,
  },
  {
    text: "⚠️  RUGPULL PROBABILITY: 94%",
    color: "text-red-500 font-bold",
    delay: 4.2,
  },
  {
    text: "⏱️  Estimated time to rug: ~8 min",
    color: "text-orange-400",
    delay: 4.5,
  },
  {
    text: "═══════════════════════════════════",
    color: "text-cyan-500/50",
    delay: 4.7,
  },
  { text: "", color: "", delay: 4.8 },
  {
    text: "> [!] Alert broadcasted to validators",
    color: "text-cyan-400",
    delay: 5.0,
  },
  {
    text: "> ✓ 23 validators confirmed alert",
    color: "text-green-400",
    delay: 5.5,
  },
];

export function Hero() {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const terminalRef = useRef(null);
  const statsRef = useRef(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [visibleLines, setVisibleLines] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline();

      timeline.from(
        titleRef.current,
        {
          opacity: 0,
          y: 30,
          duration: 1,
          ease: "power3.out",
        },
        0,
      );

      timeline.from(
        subtitleRef.current,
        {
          opacity: 0,
          y: 20,
          duration: 0.8,
          ease: "power3.out",
        },
        0.3,
      );

      timeline.from(
        statsRef.current,
        {
          opacity: 0,
          y: 20,
          duration: 0.8,
          ease: "power3.out",
        },
        0.5,
      );

      timeline.from(
        terminalRef.current,
        {
          opacity: 0,
          y: 30,
          scale: 0.97,
          duration: 1,
          ease: "power3.out",
        },
        0.6,
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Auto-scroll terminal body as lines appear
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [visibleLines]);

  // Terminal typing effect
  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleLines((prev) => {
        if (prev >= TERMINAL_LINES.length) {
          // Reset after a pause
          setTimeout(() => setVisibleLines(0), 3000);
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 350);

    return () => clearInterval(interval);
  }, [visibleLines]);

  // Blinking cursor
  useEffect(() => {
    const blink = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(blink);
  }, []);

  return (
    <section
      ref={containerRef}
      className="min-h-screen pt-28 pb-20 px-6 flex flex-col items-center justify-center relative overflow-hidden"
    >
      {/* Hero bg accents */}
      <div
        className="absolute top-20 left-5 w-[500px] h-[500px] rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(0,255,255,0.2), transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute bottom-20 right-5 w-[450px] h-[450px] rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(168,85,247,0.2), transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <div className="max-w-5xl mx-auto z-10 w-full">
        {/* Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 border border-cyan-500/40 px-4 py-1.5 text-xs font-mono text-cyan-400 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            BITTENSOR SUBNET — RUGPULL INTELLIGENCE
          </div>
        </div>

        {/* Headline */}
        <div ref={titleRef} className="text-center mb-6">
          <h1 className="text-5xl md:text-7xl font-bold font-mono leading-tight">
            <span
              className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400"
              style={{ textShadow: "0 0 60px rgba(0,255,255,0.15)" }}
            >
              Stop Rugpulls
            </span>
            <br />
            <span className="text-white">Before They Happen.</span>
          </h1>
        </div>

        {/* Subtitle */}
        <div ref={subtitleRef} className="text-center mb-10">
          <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed font-mono">
            Decentralized AI subnet on Bittensor that predicts rugpulls on
            Solana — before victims lose funds. 12-layer intelligence fusion.
            Verified by validators. Free for everyone.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <button
            className="group relative px-8 py-3.5 font-mono font-bold text-sm tracking-wide text-black bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 transition-all duration-300"
            style={{ boxShadow: "0 0 20px rgba(0,255,255,0.3)" }}
          >
            Start Mining TAO →
          </button>
          <button className="px-8 py-3.5 font-mono font-bold text-sm tracking-wide text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300">
            Read the Docs
          </button>
        </div>

        {/* Stats Strip */}
        <div
          ref={statsRef}
          className="grid grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto"
        >
          {[
            { value: "68%", label: "rugpulls in <12 min" },
            { value: "<8%", label: "false positive target" },
            { value: "4.2M", label: "wallets protected" },
          ].map((stat, i) => (
            <div
              key={i}
              className="text-center p-4 border border-cyan-500/20 bg-black/40 backdrop-blur-sm"
            >
              <div
                className="text-2xl md:text-3xl font-bold font-mono text-cyan-400 mb-1"
                style={{ textShadow: "0 0 15px rgba(0,255,255,0.4)" }}
              >
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 font-mono">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Terminal */}
        <div ref={terminalRef} className="w-full max-w-3xl mx-auto">
          <NeonBorder color="cyan" className="bg-black/90 backdrop-blur-md">
            <div className="p-5">
              {/* Terminal header */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-cyan-500/20">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-[10px] text-gray-600 ml-2 font-mono">
                  rugintel@subnet — analysis
                </span>
              </div>

              {/* Terminal body — fixed height, scrolls up */}
              <div
                ref={bodyRef}
                className="font-mono text-xs md:text-sm space-y-0.5 h-[320px] overflow-y-hidden flex flex-col justify-end"
              >
                {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
                  <div
                    key={i}
                    className={`${line.color} leading-relaxed ${line.text === "" ? "h-3" : ""}`}
                    style={{
                      animation: "fadeInLine 0.15s ease-out",
                    }}
                  >
                    {line.text}
                  </div>
                ))}
                {/* Blinking cursor */}
                <span
                  className="inline-block w-2 h-4 bg-cyan-400 ml-0.5 align-middle"
                  style={{ opacity: cursorVisible ? 1 : 0 }}
                />
              </div>
            </div>
          </NeonBorder>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInLine {
          from {
            opacity: 0;
            transform: translateX(-5px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  );
}
