"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function MemecoinPredictionsTicker() {
  const tickerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Mock data - memecoins with predictions and verification status
  const predictions = [
    {
      name: "PEPEDOG",
      symbol: "PEPE🐕",
      time: "5 min ago",
      verified: true,
      riskLevel: "CRITICAL",
    },
    {
      name: "MOONBOI",
      symbol: "MOON🚀",
      time: "12 min ago",
      verified: true,
      riskLevel: "HIGH",
    },
    {
      name: "SHITFLOKI",
      symbol: "SHIT🐺",
      time: "18 min ago",
      verified: true,
      riskLevel: "CRITICAL",
    },
    {
      name: "DIAMONDHANDS",
      symbol: "HANDS💎",
      time: "2h ago",
      verified: true,
      riskLevel: "HIGH",
    },
    {
      name: "RUGMASTER",
      symbol: "RUG🎭",
      time: "3h ago",
      verified: true,
      riskLevel: "CRITICAL",
    },
    {
      name: "SCAMCOIN",
      symbol: "SCAM💀",
      time: "5h ago",
      verified: true,
      riskLevel: "CRITICAL",
    },
    {
      name: "HONEYPOT",
      symbol: "HONEY🍯",
      time: "6h ago",
      verified: true,
      riskLevel: "HIGH",
    },
    {
      name: "DEVDRAIN",
      symbol: "DRAIN🔄",
      time: "8h ago",
      verified: true,
      riskLevel: "CRITICAL",
    },
  ];

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    // Clone items for infinite scroll
    const items = content.querySelectorAll(".ticker-item");
    items.forEach((item) => {
      const clone = item.cloneNode(true);
      content.appendChild(clone);
    });

    const totalWidth = content.scrollWidth / 2;

    gsap.to(content, {
      x: -totalWidth,
      duration: 40,
      ease: "none",
      repeat: -1,
      onRepeat: () => {
        gsap.set(content, { x: 0 });
      },
    });

    return () => {
      gsap.killTweensOf(content);
    };
  }, []);

  return (
    <div className="w-full bg-gradient-to-r from-black via-cyan-950/20 to-black py-6 border-y border-cyan-500/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-full bg-lime-400 animate-pulse" />
          <span className="text-sm font-mono text-cyan-400 uppercase tracking-widest">
            Live Predictions from Bittensor Network
          </span>
        </div>
      </div>

      <div ref={tickerRef} className="overflow-hidden">
        <div ref={contentRef} className="flex gap-4 whitespace-nowrap">
          {predictions.map((pred, idx) => (
            <div
              key={`pred-${idx}`}
              className="ticker-item flex-shrink-0 px-4 py-3 border border-cyan-500/30 bg-black/40 backdrop-blur-sm rounded-lg hover:border-cyan-400/60 hover:bg-cyan-500/10 transition group min-w-max"
            >
              <div className="flex items-center gap-3">
                {/* Token info */}
                <div className="flex items-center gap-2">
                  <div className="text-sm">
                    <div className="font-bold text-white font-mono">
                      {pred.symbol}
                    </div>
                    <div className="text-xs text-gray-400">{pred.name}</div>
                  </div>
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-cyan-500/20" />

                {/* Risk level */}
                <div className="text-center">
                  <div
                    className={`text-xs font-bold px-2 py-1 rounded font-mono ${
                      pred.riskLevel === "CRITICAL"
                        ? "bg-red-500/20 text-red-400 border border-red-500/50"
                        : "bg-orange-500/20 text-orange-400 border border-orange-500/50"
                    }`}
                  >
                    {pred.riskLevel}
                  </div>
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-cyan-500/20" />

                {/* Status & time */}
                <div className="text-right">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="w-2 h-2 rounded-full bg-lime-400 group-hover:animate-pulse" />
                    <span className="text-lime-400">DETECTED</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{pred.time}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom accent */}
      <div className="mt-4 max-w-7xl mx-auto px-6">
        <div className="text-xs text-gray-500 text-center font-mono">
          ✓ All predictions verified against 24h post-detection outcomes | 94.7%
          accuracy rate
        </div>
      </div>
    </div>
  );
}
