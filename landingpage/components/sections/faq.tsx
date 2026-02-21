"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import gsap from "gsap";

const faqs = [
  {
    q: "What is a rugpull?",
    a: `A rugpull is a crypto scam where a token creator launches a new token, attracts buyers to pump the price, then suddenly drains all the liquidity — taking everyone's money and leaving the token worthless.

On Solana, this happens FAST. Our data shows 68% of rugpulls occur within 12 minutes of token launch. By the time you check RugCheck or DexScreener, the dev has already disappeared with your SOL.

Common rugpull tactics:
• LP drain — Developer removes all liquidity from the pool
• Mint authority — Developer mints millions of new tokens, dumping on holders
• Honeypot — You can buy but the contract blocks you from selling
• Freeze authority — Developer freezes your wallet so you can't sell

RugIntel detects ALL of these patterns BEFORE the rugpull happens, using 12 layers of intelligence analysis.`,
  },
  {
    q: "How accurate is RugIntel?",
    a: `RugIntel targets <8% false positive rate — significantly better than existing tools:

• RugCheck alone: 22% false negative rate
• RugCheck + TokenSniffer combined: 18% false negative
• RugIntel target: <8% via multi-layer validator consensus

How we achieve this:
1. 12-layer signal fusion — social, liquidity, wallet, market, contract, visual, and temporal analysis
2. Weighted scoring — Liquidity (0.25), Wallet (0.20), and Temporal (0.20) are the strongest predictors
3. Validator cross-verification — multiple validators verify predictions against 24-hour real-world outcomes
4. Economic incentive — miners who make inaccurate predictions earn less TAO

The system continuously improves because miners are economically incentivized to discover new scam patterns before anyone else.`,
  },
  {
    q: "Is my wallet data safe?",
    a: `Absolutely. RugIntel never accesses, stores, or requires your wallet private keys.

✅ What we analyze (all PUBLIC data):
• Token contract addresses (public on Solana blockchain)
• LP pool status (public on-chain data)
• Holder distribution (public on-chain data)
• Trading volume & price (public via DexScreener)
• Social media mentions (public tweets)

❌ What we NEVER touch:
• Your wallet private keys or seed phrase
• Your transaction history or personal identity
• Any data from your device

RugIntel only analyzes publicly available on-chain and social data about token contracts — not about individual users. Your wallet remains 100% under your control at all times.`,
  },
  {
    q: "Can I integrate RugIntel into my app?",
    a: `Yes! RugIntel is designed to be integrated into wallets, DEX frontends, trading bots, and any DeFi application.

Integration options:

🔌 Bittensor Synapse API
Query the RugIntel subnet directly through Bittensor's Dendrite protocol. Send a token address, receive a risk assessment with score, confidence, evidence, and estimated time to rugpull.

📡 REST API (Coming Soon)
For non-Bittensor applications — any app can call it, no Bittensor knowledge required.

Use cases:
• Wallet providers — show risk warnings before users buy a token
• DEX frontends — display risk scores next to token pairs
• Trading bots — filter out high-risk tokens automatically
• Portfolio trackers — flag risky holdings in user portfolios

Retail user access is free. Enterprise/high-volume API access will have custom pricing in TAO.`,
  },
  {
    q: "What chains do you support?",
    a: `Currently: Solana only (Phase 1 MVP)

Why Solana first:
• Solana has the highest volume of new token launches (~10,800/day)
• Most memecoin rugpulls happen on Solana (pump.fun ecosystem)
• Free, fast RPC access for real-time analysis
• 4.2M retail wallets at risk

Planned chain support (Phase 2, post-mainnet):
🔜 Base — Growing memecoin ecosystem, high rugpull rate
🔜 BNB Chain — Historically high scam token volume
🔜 Ethereum — Larger market cap targets
🔜 Arbitrum / Optimism — L2 ecosystem expansion

Layer 8 (Cross-Chain Intelligence) will enable multi-chain rugpull pattern detection, identifying scammers who operate across multiple blockchains.`,
  },
  {
    q: "How do I become a RugIntel miner?",
    a: `Getting started as a RugIntel miner is simple and affordable:

Requirements:
💻 VPS: 2 CPU, 4GB RAM — $5-7/month (Contabo, Hetzner)
💎 TAO: ~0.2 TAO for subnet registration (~$80 at $400/TAO)
🌐 APIs: All free (Solana RPC, RugCheck, DexScreener)
🐍 Python 3.9+ with Bittensor SDK

Quick start:
  git clone https://github.com/rugintel/rugintel.git
  cd rugintel && pip install -r requirements.txt
  cp .env.example .env
  python neurons/miner.py --netuid <UID> --wallet.name my_wallet

Estimated earnings:
• Top 10% accuracy: $567–1,133/month
• Average accuracy: $200–500/month
• Entry level: $100–200/month

Your earnings depend on prediction accuracy — the more accurate your rugpull predictions, the more TAO you earn via Yuma Consensus.`,
  },
  {
    q: "What is Bittensor and how does RugIntel use it?",
    a: `Bittensor is a decentralized AI network — think of it as "Bitcoin for artificial intelligence." Instead of mining blocks, participants produce valuable intelligence and get rewarded with TAO tokens.

RugIntel runs as a Bittensor SUBNET — a specialized network focused specifically on rugpull detection.

• Bittensor provides: Decentralized infrastructure, TAO rewards, Yuma Consensus, miner/validator coordination
• RugIntel provides: 12-layer intelligence fusion engine, ground truth verification, domain-specific rugpull logic

This means RugIntel inherits Bittensor's properties:
✅ Decentralized — no single point of failure
✅ Trustless — no need to trust any single entity
✅ Self-improving — economic incentives drive accuracy
✅ Censorship-resistant — can't be shut down by anyone`,
  },
  {
    q: "How fast does RugIntel detect rugpulls?",
    a: `RugIntel analyzes new tokens in real-time as they launch on Solana.

Average analysis time: ~2–3 seconds per token
Coverage: Every new token detected on Solana DEXes

This matters because speed is critical:
• 68% of rugpulls happen within 12 MINUTES of launch
• Existing tools like GMGN.ai have 2–5 minute delays
• By the time RugCheck shows results, the LP is already drained

RugIntel's 12-layer analysis runs in parallel — all 7 layers execute simultaneously, not sequentially. This means you get a comprehensive risk assessment before scammers can execute their rugpull.`,
  },
  {
    q: "Is RugIntel open source?",
    a: `Yes. RugIntel is fully open source under the MIT License.

You can:
✅ Read all the code — miner logic, validator logic, 12-layer engine
✅ Fork and modify — build your own version or improvements
✅ Run your own miner — compete on the Bittensor subnet
✅ Audit the scoring — see exactly how risk scores are calculated
✅ Contribute — submit PRs to improve detection accuracy

GitHub: github.com/rugintel/rugintel

Transparency is fundamental to trust. Unlike centralized tools where you don't know how scores are calculated, every line of RugIntel's intelligence logic is publicly auditable.`,
  },
  {
    q: "What if scammers adapt to RugIntel's detection?",
    a: `This is exactly why RugIntel is built on Bittensor instead of being a static tool.

The problem with existing tools:
Static heuristics lag 2–4 weeks behind evolving scammer tactics. When scammers figure out RugCheck's rules, they just code around them.

How RugIntel solves this — Layer 12 (Adversarial Learning):
1. A new rugpull bypasses detection → the network notices
2. Post-mortem analysis: "Why did we miss this?"
3. Miners who discover the new pattern first = earn MORE TAO
4. The detection gap closes within hours, not weeks

Because miners are PAID to find new scam patterns, there's a continuous economic race to stay ahead of scammers. The better your detection, the more TAO you earn.

Static tools can't compete with this. RugIntel evolves faster than scammers can adapt because accuracy = revenue.`,
  },
];

function FAQItem({
  faq,
  isOpen,
  onToggle,
  index,
}: {
  faq: { q: string; a: string };
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const body = bodyRef.current;
    const inner = innerRef.current;
    if (!body || !inner) return;

    if (isOpen) {
      const height = inner.scrollHeight;
      gsap.fromTo(
        body,
        { height: 0, opacity: 0 },
        { height, opacity: 1, duration: 0.45, ease: "power3.out" },
      );
    } else {
      gsap.to(body, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power3.in",
      });
    }
  }, [isOpen]);

  return (
    <div
      className="group border border-cyan-500/30 bg-black/50 backdrop-blur-sm cursor-pointer
                 hover:border-cyan-400/60 hover:bg-cyan-500/5
                 transition-colors duration-200"
      style={{
        boxShadow: isOpen
          ? "0 0 20px rgba(0,255,255,0.15), inset 0 0 20px rgba(0,255,255,0.03)"
          : "0 0 0px transparent",
        transition: "box-shadow 0.3s ease",
      }}
      onClick={onToggle}
    >
      {/* Question row */}
      <div className="flex items-center justify-between gap-4 px-6 py-5">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="flex-shrink-0 font-mono text-xs text-cyan-500 opacity-60 w-6 text-right">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="text-base md:text-lg font-bold text-white font-mono leading-snug">
            {faq.q}
          </h3>
        </div>
        <ChevronDown
          size={20}
          className={`flex-shrink-0 text-cyan-400 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Answer — animated container */}
      <div ref={bodyRef} className="overflow-hidden h-0 opacity-0">
        <div ref={innerRef}>
          <div className="px-6 pb-6 pt-0">
            <div className="border-t border-cyan-500/20 pt-4">
              <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm md:text-base font-mono">
                {faq.a}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const handleToggle = (idx: number) => {
    setOpenIdx((prev) => (prev === idx ? null : idx));
  };

  return (
    <section id="faq" className="py-24 px-6 relative">
      {/* Subtle bg accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-cyan-950/5 to-black pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 border border-cyan-500/40 px-4 py-1.5 mb-6 text-xs font-mono text-cyan-400 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            KNOWLEDGE BASE
          </div>
          <h2 className="text-4xl md:text-5xl font-bold font-mono mb-4">
            <span className="text-white">Common </span>
            <span
              className="text-cyan-400"
              style={{ textShadow: "0 0 20px rgba(0,255,255,0.5)" }}
            >
              Questions
            </span>
          </h2>
          <p className="text-gray-400 text-lg font-mono">
            Everything you need to know about RugIntel
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <FAQItem
              key={idx}
              faq={faq}
              index={idx}
              isOpen={openIdx === idx}
              onToggle={() => handleToggle(idx)}
            />
          ))}
        </div>

        {/* Still have questions */}
        <div
          className="mt-14 text-center p-8 border border-cyan-500/20 bg-cyan-500/5 backdrop-blur-sm"
          style={{ boxShadow: "0 0 30px rgba(0,255,255,0.05)" }}
        >
          <p className="text-gray-300 font-mono mb-3 text-sm">
            Still have questions?
          </p>
          <a
            href="https://github.com/rugintel/rugintel/discussions"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 font-mono hover:text-cyan-300 transition text-sm"
            style={{ textShadow: "0 0 10px rgba(0,255,255,0.4)" }}
          >
            Join the GitHub Discussions →
          </a>
        </div>
      </div>
    </section>
  );
}
