"use client";

import { useEffect, useRef, useState } from "react";

const FEATURES = [
  {
    icon: "⚡",
    title: "Pre-Rug Detection",
    description:
      "Detects rugpull signals BEFORE LP is drained. 68% of rugpulls happen within 12 minutes of launch — RugIntel gives you the warning window.",
    color: "from-cyan-500 to-blue-500",
    glow: "rgba(0,255,255,0.15)",
    border: "border-cyan-500/30",
    tag: "Core",
    stat: "<3s",
    statLabel: "analysis time",
  },
  {
    icon: "🧠",
    title: "12-Layer AI Fusion",
    description:
      "Social, liquidity, wallet, market, contract, visual, temporal — 7 active Phase 1 layers fused into a single weighted risk score via Bittensor miners.",
    color: "from-purple-500 to-pink-500",
    glow: "rgba(168,85,247,0.15)",
    border: "border-purple-500/30",
    tag: "Intelligence",
    stat: "12",
    statLabel: "analysis layers",
  },
  {
    icon: "🎯",
    title: "<8% False Positive Rate",
    description:
      "Validator consensus cross-verifies predictions against 24-hour ground truth. Significantly better accuracy than RugCheck (22%) or TokenSniffer (18%).",
    color: "from-lime-500 to-green-500",
    glow: "rgba(132,204,22,0.15)",
    border: "border-lime-500/30",
    tag: "Accuracy",
    stat: "<8%",
    statLabel: "false positive rate",
  },
  {
    icon: "🆓",
    title: "Free for Retail",
    description:
      "Zero cost for individual users. Protecting 4.2M Solana retail wallets — because getting rugged is expensive enough.",
    color: "from-orange-500 to-red-500",
    glow: "rgba(249,115,22,0.15)",
    border: "border-orange-500/30",
    tag: "Access",
    stat: "$0",
    statLabel: "for retail users",
  },
  {
    icon: "🔄",
    title: "Self-Improving Network",
    description:
      "Layer 12 adversarial learning analyzes every missed rugpull. Miners are economically incentivized to discover new scam patterns — evolves faster than scammers adapt.",
    color: "from-cyan-400 to-purple-500",
    glow: "rgba(0,255,255,0.15)",
    border: "border-cyan-400/30",
    tag: "AI",
    stat: "24h",
    statLabel: "update cycle",
  },
  {
    icon: "💰",
    title: "Earn TAO by Mining",
    description:
      "Run a miner node on Bittensor Subnet. Accurate rugpull predictions earn TAO via Yuma Consensus. Top 10% miners earn $567–$1,133/month.",
    color: "from-yellow-500 to-orange-500",
    glow: "rgba(234,179,8,0.15)",
    border: "border-yellow-500/30",
    tag: "Earn",
    stat: "~$567+",
    statLabel: "monthly (top miners)",
  },
];

const COMPARISON = [
  {
    feature: "Real-time detection",
    rugintel: true,
    rugcheck: false,
    tokensniffer: false,
  },
  {
    feature: "Pre-rug warning (before LP drain)",
    rugintel: true,
    rugcheck: false,
    tokensniffer: false,
  },
  {
    feature: "False positive rate",
    rugintel: "<8%",
    rugcheck: "22%",
    tokensniffer: "18%",
  },
  {
    feature: "Social signal analysis",
    rugintel: true,
    rugcheck: false,
    tokensniffer: false,
  },
  {
    feature: "Wallet / dev fingerprinting",
    rugintel: true,
    rugcheck: false,
    tokensniffer: false,
  },
  {
    feature: "Temporal pattern modeling",
    rugintel: true,
    rugcheck: false,
    tokensniffer: false,
  },
  {
    feature: "Decentralized & censorship-resistant",
    rugintel: true,
    rugcheck: false,
    tokensniffer: false,
  },
  {
    feature: "Self-improving (adversarial AI)",
    rugintel: true,
    rugcheck: false,
    tokensniffer: false,
  },
  {
    feature: "Free for retail users",
    rugintel: true,
    rugcheck: true,
    tokensniffer: true,
  },
  {
    feature: "Open source",
    rugintel: true,
    rugcheck: false,
    tokensniffer: false,
  },
];

const USE_CASES = [
  {
    icon: "👛",
    audience: "Traders",
    headline: "Check before you ape in",
    description:
      "Paste any Solana token address and get a risk score + evidence breakdown in <3 seconds. Know if it's a rug before you lose your SOL.",
    cta: "Try Free →",
  },
  {
    icon: "🔌",
    audience: "Wallet Providers",
    headline: "Protect your users by default",
    description:
      "Integrate via REST API or Bittensor Synapse. Show a risk warning before users confirm a token buy. One API call prevents loss for millions.",
    cta: "View API Docs →",
  },
  {
    icon: "🤖",
    audience: "Trading Bots",
    headline: "Filter rugs automatically",
    description:
      "Add RugIntel as a pre-trade filter. If risk score > threshold, skip the token. Protect your capital without manual monitoring.",
    cta: "API Reference →",
  },
  {
    icon: "⛏️",
    audience: "Miners / Validators",
    headline: "Earn TAO on Bittensor",
    description:
      "Run a RugIntel miner node. Compete to produce the most accurate rugpull predictions. Yuma Consensus auto-distributes TAO to top performers.",
    cta: "Start Mining →",
  },
];

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <span className="text-green-400 font-bold text-lg">✓</span>
    ) : (
      <span className="text-gray-700 font-bold text-lg">✗</span>
    );
  }
  return (
    <span
      className={`font-mono text-sm font-bold ${value.startsWith("<8") ? "text-green-400" : "text-red-400"}`}
    >
      {value}
    </span>
  );
}

export function Features() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.05 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="py-24 px-6 bg-black relative"
    >
      <div className="max-w-6xl mx-auto">
        {/* ── Header ── */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 border border-cyan-500/30 px-4 py-1.5 text-xs font-mono text-cyan-400 tracking-widest uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            PLATFORM FEATURES
          </div>
          <h2 className="text-4xl md:text-6xl font-bold font-mono mb-4">
            <span className="text-white">Everything you need to </span>
            <span
              className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-lime-400"
              style={{ textShadow: undefined }}
            >
              Stay Safe
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Built on Bittensor's decentralized incentive layer — accuracy is
            enforced by economics, not trust.
          </p>
        </div>

        {/* ── Feature Cards ── */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-24">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="border border-white/10 bg-white/[0.02] p-6 group hover:border-white/25 transition-all duration-300 cursor-default flex flex-col gap-4"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.6s ease ${i * 0.08}s, transform 0.6s ease ${i * 0.08}s`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  `0 0 30px ${f.glow}`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 0 0 transparent";
              }}
            >
              {/* Top row: icon on left, stat on right */}
              <div className="flex items-start justify-between mb-5">
                <span className="text-4xl leading-none">{f.icon}</span>
                <div className="text-right flex flex-col items-end gap-1">
                  <div
                    className={`text-2xl font-bold font-mono bg-gradient-to-r ${f.color} bg-clip-text text-transparent leading-none`}
                  >
                    {f.stat}
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono">
                    {f.statLabel}
                  </div>
                </div>
              </div>

              {/* Accent bar */}
              <div
                className={`h-px bg-gradient-to-r ${f.color} w-8 group-hover:w-full transition-all duration-500`}
              />

              {/* Text */}
              <div>
                <h3 className="text-base font-bold text-white font-mono mb-2">
                  {f.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
