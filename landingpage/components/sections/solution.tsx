"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ChevronDown } from "lucide-react";

const LAYERS = [
  {
    id: 1,
    name: "Social Intelligence",
    short: "Twitter/Telegram pump coordination detection",
    color: "from-cyan-500 to-blue-500",
    borderColor: "border-cyan-500/50",
    glowColor: "rgba(0,255,255,0.3)",
    textColor: "text-cyan-400",
    badgeColor: "bg-cyan-500/15 border-cyan-500/40",
    weight: 0.07,
    phase: "Phase 1",
    signals: [
      "Mass new accounts posting simultaneously about a token",
      "Coordinated pump keywords across Telegram groups",
      "Influencer wallet correlation with launch timing",
    ],
    detail:
      "Monitors Twitter/X and Telegram for coordinated pump campaigns. Many new accounts posting the same token simultaneously is a strong indicator of artificial hype meant to attract retail buyers before a dump. Correlated with influencer wallet activity to detect paid promotions from insiders.",
    api: "Twitter API v2 (Basic)",
    threshold: "Many new accounts posting simultaneously",
  },
  {
    id: 2,
    name: "Liquidity Intelligence",
    short: "Real-time LP drain pattern analysis",
    color: "from-blue-500 to-indigo-500",
    borderColor: "border-blue-500/50",
    glowColor: "rgba(99,102,241,0.3)",
    textColor: "text-blue-400",
    badgeColor: "bg-blue-500/15 border-blue-500/40",
    weight: 0.25,
    phase: "Phase 1",
    signals: [
      "LP unlock detection via on-chain vesting contract events",
      "LP ratio decline >15% in <5 minutes",
      "Developer wallet receiving LP tokens shortly after launch",
    ],
    detail:
      "The highest-weight layer (0.25). Tracks liquidity pool composition in real time via Solana RPC. LP drain is the most direct rugpull signal — when the developer removes liquidity, price crashes instantly. Detects LP unlock events, rapid LP ratio decline, and dev wallet receiving LP tokens.",
    api: "DexScreener API, Solana RPC",
    threshold: "LP unlock detection, LP ratio decline",
  },
  {
    id: 3,
    name: "Wallet Intelligence",
    short: "Holder concentration & deployer history fingerprinting",
    color: "from-indigo-500 to-purple-500",
    borderColor: "border-indigo-500/50",
    glowColor: "rgba(129,140,248,0.3)",
    textColor: "text-indigo-400",
    badgeColor: "bg-indigo-500/15 border-indigo-500/40",
    weight: 0.2,
    phase: "Phase 1",
    signals: [
      "Top wallet holds >50% of supply",
      "Developer sells >20% of holdings within 5 minutes",
      "Deployer address linked to previous rugpulls",
    ],
    detail:
      "Second highest weight (0.20). Analyzes token holder distribution and developer wallet history. Extreme supply concentration means one entity can crash the market instantly. Developer fingerprinting cross-references deployer addresses across historical rugpulls — repeat offenders are flagged even with new wallets.",
    api: "Solana RPC, RugCheck.xyz",
    threshold: "Top wallet >50% supply; dev sells >20% in 5 min",
  },
  {
    id: 4,
    name: "Market Intelligence",
    short: "Volume spike & wash trading detection",
    color: "from-purple-500 to-pink-500",
    borderColor: "border-purple-500/50",
    glowColor: "rgba(168,85,247,0.3)",
    textColor: "text-purple-400",
    badgeColor: "bg-purple-500/15 border-purple-500/40",
    weight: 0.1,
    phase: "Phase 1",
    signals: [
      "Volume >100× normal in under 2 minutes",
      "Circular transaction patterns indicating wash trading",
      "Price-volume divergence (price up, real volume flat)",
    ],
    detail:
      "Detects artificial market activity. A 100× volume spike in 2 minutes has a 94% pump-and-dump correlation. Wash trading — circular transactions between related wallets — creates fake trading volume to lure momentum traders. DexScreener OHLCV data is cross-referenced with on-chain transaction graphs.",
    api: "DexScreener API",
    threshold: "Volume >100× in 2 min = 94% pump&dump",
  },
  {
    id: 5,
    name: "Contract Intelligence",
    short: "RugCheck/TokenSniffer API integration",
    color: "from-pink-500 to-rose-500",
    borderColor: "border-pink-500/50",
    glowColor: "rgba(236,72,153,0.3)",
    textColor: "text-pink-400",
    badgeColor: "bg-pink-500/15 border-pink-500/40",
    weight: 0.15,
    phase: "Phase 1",
    signals: [
      "Mint authority not revoked (dev can print infinite tokens)",
      "Freeze authority active (dev can freeze holder wallets)",
      "Honeypot pattern: can buy but not sell",
    ],
    detail:
      "Integrates RugCheck.xyz and TokenSniffer APIs to audit smart contract code. Dangerous patterns include non-revoked mint authority (allowing infinite token creation), freeze authority (locking victims' funds), and honeypot mechanics that prevent holders from selling. Weight: 0.15 — necessary but not sufficient alone.",
    api: "RugCheck.xyz API, TokenSniffer",
    threshold: "Mint authority, freeze authority, honeypot",
  },
  {
    id: 6,
    name: "Visual Intelligence",
    short: "AI-generated logo & typosquatting detection",
    color: "from-rose-500 to-orange-500",
    borderColor: "border-rose-500/50",
    glowColor: "rgba(244,63,94,0.3)",
    textColor: "text-rose-400",
    badgeColor: "bg-rose-500/15 border-rose-500/40",
    weight: 0.03,
    phase: "Phase 1",
    signals: [
      "Token name similarity to top tokens (PEPE→PEPE2)",
      "AI-generated logo detected via CLIP embedding distance",
      "Website template reuse from known scam projects",
    ],
    detail:
      "Lowest weight (0.03) — weakest signal alone but valuable when correlated with others. Detects copycat tokens that impersonate established projects via similar names and logos. Uses CLIP embedding similarity to detect AI-generated or copied artwork. Typosquatting patterns (WIF→WIF2, BONK→B0NK) are flagged.",
    api: "CLIP Model, Levenshtein distance",
    threshold: "Name similarity to top tokens",
  },
  {
    id: 7,
    name: "Temporal Intelligence",
    short: "FOMO peak & behavioral economics modeling",
    color: "from-orange-500 to-yellow-500",
    borderColor: "border-orange-500/50",
    glowColor: "rgba(249,115,22,0.3)",
    textColor: "text-orange-400",
    badgeColor: "bg-orange-500/15 border-orange-500/40",
    weight: 0.2,
    phase: "Phase 1",
    signals: [
      "68% of rugpulls occur within 12 minutes of launch",
      "FOMO velocity: price acceleration without consolidation",
      "Time-to-peak pattern matching historical rugs",
    ],
    detail:
      'High weight (0.20). Applies behavioral economics to token timing. 68% of rugpulls happen within 12 minutes of launch — the "FOMO window" where retail FOMO is highest. Models pump trajectory shape against historical rugpull patterns. Predicts estimated time-to-rugpull from current momentum slope.',
    api: "Internal temporal model",
    threshold: "68% rugpulls within 12 min of launch",
  },
  {
    id: 8,
    name: "Cross-Chain Intelligence",
    short: "Multi-chain rugpull pattern detection",
    color: "from-yellow-500 to-lime-500",
    borderColor: "border-yellow-500/50",
    glowColor: "rgba(234,179,8,0.3)",
    textColor: "text-yellow-400",
    badgeColor: "bg-yellow-500/15 border-yellow-500/40",
    weight: null,
    phase: "Phase 2",
    signals: [
      "Same deployer across Solana, Ethereum, Base",
      "Cross-chain fund laundering via bridges",
      "Serial rugpullers switching chains to evade detection",
    ],
    detail:
      "Phase 2 feature. Tracks deployer identities across EVM chains and Solana. Many serial rugpullers move between chains after being flagged — this layer connects their on-chain fingerprints across ecosystems. Bridge transaction monitoring identifies fund laundering after rug events.",
    api: "Multi-chain RPC (Phase 2)",
    threshold: "Phase 2 — cross-chain identity matching",
  },
  {
    id: 9,
    name: "Exchange Flow Intelligence",
    short: "CEX deposit/withdrawal coordination",
    color: "from-lime-500 to-green-500",
    borderColor: "border-lime-500/50",
    glowColor: "rgba(132,204,22,0.3)",
    textColor: "text-lime-400",
    badgeColor: "bg-lime-500/15 border-lime-500/40",
    weight: null,
    phase: "Phase 2",
    signals: [
      "Large deposits to Binance/OKX shortly before launch",
      "Immediate sell-side pressure after launch from exchange wallets",
      "Developer receiving tokens from known exchange wallets",
    ],
    detail:
      "Phase 2 feature. Monitors known Centralized Exchange (CEX) deposit addresses for coordinated pre-launch positioning. When a developer deposits early tokens to Binance before the public launch, it signals intent to dump into retail buyers. Works by tracking known CEX hot wallet addresses.",
    api: "CEX wallet databases (Phase 2)",
    threshold: "Phase 2 — CEX deposit/withdrawal patterns",
  },
  {
    id: 10,
    name: "MEV/Bot Intelligence",
    short: "Sandwich attacks & frontrunning detection",
    color: "from-green-500 to-teal-500",
    borderColor: "border-green-500/50",
    glowColor: "rgba(34,197,94,0.3)",
    textColor: "text-green-400",
    badgeColor: "bg-green-500/15 border-green-500/40",
    weight: null,
    phase: "Phase 2",
    signals: [
      "MEV bots sandwiching all retail buys at launch",
      "Frontrunning bots with insider timing knowledge",
      "Bot-to-dev wallet fund flows post-launch",
    ],
    detail:
      "Phase 2 feature. Identifies MEV bot collusion with token developers. Insider-connected MEV bots typically receive tip payments and have suspiciously accurate timing. When the same MEV bot consistently extracts value from a developer's token launches, it indicates insider coordination.",
    api: "Jito MEV data (Phase 2)",
    threshold: "Phase 2 — MEV bot collusion patterns",
  },
  {
    id: 11,
    name: "Tokenomics Intelligence",
    short: "Hidden mint functions & tax abuse",
    color: "from-teal-500 to-cyan-500",
    borderColor: "border-teal-500/50",
    glowColor: "rgba(20,184,166,0.3)",
    textColor: "text-teal-400",
    badgeColor: "bg-teal-500/15 border-teal-500/40",
    weight: null,
    phase: "Phase 2",
    signals: [
      "Buy/sell tax asymmetry (0% buy, 30% sell)",
      "Hidden mint functions activated post-launch",
      "Abnormal token distribution in genesis transaction",
    ],
    detail:
      "Phase 2 feature. Deep tokenomics analysis beyond basic contract audits. Detects asymmetric tax structures (0% buy, 30% sell trapping victims), hidden mint functions that activate after initial audits, and genesis transaction distribution anomalies where development wallets receive disproportionate allocations.",
    api: "Solana program analysis (Phase 2)",
    threshold: "Phase 2 — tokenomics manipulation patterns",
  },
  {
    id: 12,
    name: "Adversarial Learning",
    short: "Self-improving network via missed rugpull analysis",
    color: "from-cyan-400 to-purple-500",
    borderColor: "border-cyan-400/50",
    glowColor: "rgba(0,255,255,0.4)",
    textColor: "text-cyan-300",
    badgeColor: "bg-cyan-400/15 border-cyan-400/40",
    weight: null,
    phase: "Phase 1",
    signals: [
      "Analyzes every missed rugpull for novel evasion patterns",
      "Patterns 85%+ different from historical = new attack vector",
      "Continuously updates miner model weights via validator feedback",
    ],
    detail:
      "The self-improving layer. After each 24-hour validation cycle, missed rugpulls are analyzed for novel evasion patterns. When a pattern is ≥85% different from all historical patterns, it's classified as a new attack vector and distributed to miners as a model update. This is how RugIntel evolves faster than scammers can adapt.",
    api: "Internal — validator ground truth loop",
    threshold: "Patterns 85%+ different from historical = new vector",
  },
];

const PHASE1_WEIGHT_TOTAL = LAYERS.filter((l) => l.weight !== null).reduce(
  (s, l) => s + (l.weight ?? 0),
  0,
);

export function Solution() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const bodyRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Trigger entrance animation once section scrolls into view
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

  // Accordion open/close animation
  const toggle = (id: number) => {
    const isOpening = openId !== id;
    const prevId = openId;
    setOpenId(isOpening ? id : null);

    // Close previous
    if (prevId !== null) {
      const prevBody = bodyRefs.current.get(prevId);
      if (prevBody) {
        gsap.to(prevBody, {
          height: 0,
          opacity: 0,
          duration: 0.25,
          ease: "power2.in",
        });
      }
    }

    // Open new
    if (isOpening) {
      const body = bodyRefs.current.get(id);
      if (body) {
        const naturalH = body.scrollHeight;
        gsap.fromTo(
          body,
          { height: 0, opacity: 0 },
          { height: naturalH, opacity: 1, duration: 0.4, ease: "power3.out" },
        );
      }
    }
  };

  return (
    <section
      ref={sectionRef}
      id="solution"
      className="py-24 px-6 bg-black relative overflow-hidden"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 border border-cyan-500/30 px-4 py-1.5 text-xs font-mono text-cyan-400 tracking-widest uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            INTELLIGENCE ARCHITECTURE
          </div>
          <h2 className="text-4xl md:text-6xl font-bold font-mono mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400">
              12-Layer Fusion Analysis
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Click any layer to explore how each intelligence signal contributes
            to the final rugpull risk score
          </p>
        </div>

        {/* Fusion weight legend */}
        <div className="flex items-center gap-4 mb-6 px-2">
          <span className="text-xs text-gray-600 font-mono uppercase tracking-widest">
            Weight
          </span>
          <div className="flex-1 flex items-center gap-1">
            {LAYERS.map((l) => (
              <div
                key={l.id}
                className={`h-1.5 rounded-full bg-gradient-to-r ${l.color} transition-all duration-300`}
                style={{ flex: l.weight ? l.weight * 10 : 0.3 }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-600 font-mono">
            ← signal power →
          </span>
        </div>

        {/* Layer list */}
        <div className="space-y-1.5">
          {LAYERS.map((layer, idx) => {
            const isOpen = openId === layer.id;
            return (
              <div
                key={layer.id}
                className={`border transition-colors duration-200 cursor-pointer
                  ${isOpen ? `${layer.borderColor} bg-black/80` : "border-white/60 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/80"}`}
                style={{
                  boxShadow: isOpen ? `0 0 24px ${layer.glowColor}` : "none",
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateX(0)" : "translateX(-20px)",
                  transition: `opacity 0.5s ease ${idx * 0.04}s, transform 0.5s ease ${idx * 0.04}s, colors 0.2s`,
                }}
                onClick={() => toggle(layer.id)}
              >
                {/* Row header */}
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Layer number */}
                  <span
                    className={`flex-shrink-0 w-8 h-8 flex items-center justify-center text-xs font-mono font-bold border ${layer.badgeColor} ${layer.textColor}`}
                  >
                    {String(layer.id).padStart(2, "0")}
                  </span>

                  {/* Color bar */}
                  <div
                    className={`flex-shrink-0 w-3 h-8 rounded-sm bg-gradient-to-b ${layer.color}`}
                  />

                  {/* Name + short desc */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className={`font-bold font-mono text-sm ${isOpen ? layer.textColor : "text-white"}`}
                      >
                        {layer.name}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 border rounded-none uppercase tracking-wide ${
                          layer.phase === "Phase 2"
                            ? "border-yellow-500/40 text-yellow-500/70 bg-yellow-500/5"
                            : "border-green-500/30 text-green-500/70 bg-green-500/5"
                        }`}
                      >
                        {layer.phase}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs font-mono mt-0.5 truncate">
                      {layer.short}
                    </p>
                  </div>

                  {/* Weight bar */}
                  {layer.weight !== null ? (
                    <div className="hidden md:flex flex-col items-end gap-1 flex-shrink-0 w-28">
                      <span
                        className={`text-xs font-mono font-bold ${layer.textColor}`}
                      >
                        {(layer.weight * 100).toFixed(0)}% weight
                      </span>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${layer.color} rounded-full`}
                          style={{ width: `${(layer.weight / 0.25) * 100}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="hidden md:flex flex-shrink-0 w-28 justify-end">
                      <span className="text-[10px] font-mono text-yellow-500/60">
                        — Phase 2 —
                      </span>
                    </div>
                  )}

                  {/* Chevron */}
                  <ChevronDown
                    size={16}
                    className={`flex-shrink-0 ${layer.textColor} transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  />
                </div>

                {/* Expandable detail panel */}
                <div
                  ref={(el) => {
                    if (el) bodyRefs.current.set(layer.id, el);
                  }}
                  className="overflow-hidden h-0 opacity-0"
                >
                  <div
                    className={`px-5 pb-5 border-t ${layer.borderColor} mt-0`}
                  >
                    <div className="grid md:grid-cols-2 gap-6 pt-5">
                      {/* Left: detail text */}
                      <div>
                        <h4
                          className={`text-xs font-mono uppercase tracking-widest ${layer.textColor} mb-3`}
                        >
                          How it works
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {layer.detail}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-3">
                          <div className="text-xs font-mono bg-white/5 px-3 py-1.5 border border-white/10">
                            <span className="text-gray-500">API: </span>
                            <span className="text-gray-300">{layer.api}</span>
                          </div>
                          {layer.weight !== null && (
                            <div
                              className={`text-xs font-mono px-3 py-1.5 border ${layer.badgeColor} ${layer.textColor}`}
                            >
                              Fusion weight: {(layer.weight * 100).toFixed(0)}%
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: key signals */}
                      <div>
                        <h4
                          className={`text-xs font-mono uppercase tracking-widest ${layer.textColor} mb-3`}
                        >
                          Key signals
                        </h4>
                        <ul className="space-y-2">
                          {layer.signals.map((signal, si) => (
                            <li
                              key={si}
                              className="flex items-start gap-2 text-sm text-gray-300"
                            >
                              <span
                                className={`mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gradient-to-br ${layer.color}`}
                              />
                              {signal}
                            </li>
                          ))}
                        </ul>

                        <div className="mt-4 p-3 bg-black/60 border border-white/5 font-mono text-xs">
                          <span className="text-gray-500">⚡ Threshold: </span>
                          <span className="text-gray-300">
                            {layer.threshold}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fusion formula */}
        <div className="mt-10 border border-cyan-500/20 bg-black/60 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
              Weighted Fusion Engine
            </span>
          </div>
          <div className="font-mono text-xs text-gray-300 leading-relaxed bg-black/80 p-4 border border-white/5 overflow-x-auto">
            <div className="text-cyan-400">
              def fuse_intelligence_layers(layer_scores):
            </div>
            <div className="text-gray-500 ml-4">weights = {"{"}</div>
            {LAYERS.filter((l) => l.weight !== null).map((l) => (
              <div key={l.id} className="ml-8">
                <span className={l.textColor}>
                  "{l.name.toLowerCase().split(" ")[0]}"
                </span>
                <span className="text-gray-500">: </span>
                <span className="text-yellow-400">{l.weight?.toFixed(2)}</span>
                <span className="text-gray-600">, # {l.short}</span>
              </div>
            ))}
            <div className="text-gray-500 ml-4">{"}"}</div>
            <div className="text-gray-400 ml-4 mt-2">
              fused_score = <span className="text-cyan-400">sum</span>
              (weights.get(layer, 0) * score
            </div>
            <div className="text-gray-400 ml-20">
              for layer, score in layer_scores.items())
            </div>
            <div className="text-gray-500 ml-4 mt-2">
              return fused_score{" "}
              <span className="text-gray-600"># → 0.0 to 1.0 risk score</span>
            </div>
          </div>
          <div className="flex gap-6 mt-4 text-xs font-mono">
            <div className="text-gray-500">
              7 active Phase 1 weights ·{" "}
              <span className="text-cyan-400">
                total: {PHASE1_WEIGHT_TOTAL.toFixed(2)}
              </span>
            </div>
            <div className="text-gray-500">
              Phase 2 layers: 5 planned ·{" "}
              <span className="text-yellow-400">coming soon</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
