'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { NeonBorder } from '@/components/neon-border';
import gsap from 'gsap';

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const answerRefs = useRef<(HTMLDivElement | null)[]>([]);

  const faqs = [
    {
      q: 'What is a rugpull?',
      a: 'A rugpull is a crypto scam where a token creator launches a new token, attracts buyers to pump the price, then suddenly drains all the liquidity — taking everyone\'s money and leaving the token worthless.\n\nOn Solana, this happens FAST. Our data shows 68% of rugpulls occur within 12 minutes of token launch. By the time you check RugCheck or DexScreener, the dev has already disappeared with your SOL.\n\nCommon rugpull tactics:\n• LP drain — Developer removes all liquidity from the pool\n• Mint authority — Developer mints millions of new tokens, dumping on holders\n• Honeypot — You can buy but the contract blocks you from selling\n• Freeze authority — Developer freezes your wallet so you can\'t sell\n\nRugIntel detects ALL of these patterns BEFORE the rugpull happens, using 12 layers of intelligence analysis.',
    },
    {
      q: 'How accurate is RugIntel?',
      a: 'RugIntel targets <8% false positive rate — significantly better than existing tools:\n\n• RugCheck alone: 22% false negative rate\n• RugCheck + TokenSniffer combined: 18% false negative\n• RugIntel target: <8% via multi-layer validator consensus\n\nHow we achieve this:\n1. 12-layer signal fusion — not just one data source, but social, liquidity, wallet, market, contract, visual, and temporal analysis\n2. Weighted scoring — Liquidity (0.25), Wallet (0.20), and Temporal (0.20) are the strongest predictors\n3. Validator cross-verification — multiple validators independently verify predictions against 24-hour real-world outcomes\n4. Economic incentive — miners who make inaccurate predictions earn less TAO, so accuracy is directly tied to revenue\n\nThe system continuously improves because miners are economically incentivized to discover new scam patterns before anyone else.',
    },
    {
      q: 'Is my wallet data safe?',
      a: 'Absolutely. RugIntel never accesses, stores, or requires your wallet private keys.\n\nHere\'s what RugIntel DOES and DOES NOT do:\n\n✅ What we analyze (all PUBLIC data):\n• Token contract addresses (public on Solana blockchain)\n• LP pool status (public on-chain data)\n• Holder distribution (public on-chain data)\n• Trading volume & price (public via DexScreener)\n• Social media mentions (public tweets)\n\n❌ What we NEVER touch:\n• Your wallet private keys\n• Your wallet seed phrase\n• Your transaction history\n• Your personal identity\n• Any data from your device\n\nRugIntel only analyzes publicly available on-chain and social data about token contracts — not about individual users. Your wallet remains 100% under your control at all times.',
    },
    {
      q: 'Can I integrate RugIntel into my app?',
      a: 'Yes! RugIntel is designed to be integrated into wallets, DEX frontends, trading bots, and any DeFi application.\n\nIntegration options:\n\n🔌 Bittensor Synapse API\nQuery the RugIntel subnet directly through Bittensor\'s Dendrite protocol. Send a token address, receive a risk assessment with score, confidence, evidence, and estimated time to rugpull.\n\n📡 REST API (Coming Soon)\nFor non-Bittensor applications, we\'re building a REST API wrapper that any app can call — no Bittensor knowledge required.\n\nUse cases:\n• Wallet providers — show risk warnings before users buy a token\n• DEX frontends — display risk scores next to token pairs\n• Trading bots — filter out high-risk tokens automatically\n• Portfolio trackers — flag risky holdings in user portfolios\n• Compliance tools — enterprise-grade risk assessment\n\nRetail user access is free. Enterprise/high-volume API access will have custom pricing in TAO.',
    },
    {
      q: 'What chains do you support?',
      a: 'Currently: Solana only (Phase 1 MVP)\n\nWhy Solana first:\n• Solana has the highest volume of new token launches (~10,800/day)\n• Most memecoin rugpulls happen on Solana (pump.fun ecosystem)\n• Free, fast RPC access for real-time analysis\n• 4.2M retail wallets at risk\n\nPlanned chain support (Phase 2, post-mainnet):\n\n🔜 Base — Growing memecoin ecosystem, high rugpull rate\n🔜 BNB Chain — Historically high scam token volume\n🔜 Ethereum — Larger market cap targets\n🔜 Arbitrum / Optimism — L2 ecosystem expansion\n\nLayer 8 (Cross-Chain Intelligence) will enable multi-chain rugpull pattern detection, identifying scammers who operate across multiple blockchains using similar tactics.',
    },
    {
      q: 'How do I become a RugIntel miner?',
      a: 'Getting started as a RugIntel miner is simple and affordable:\n\nRequirements:\n💻 VPS: 2 CPU, 4GB RAM — $5-7/month (Contabo, Hetzner)\n💎 TAO: ~0.2 TAO for subnet registration (~$80 at $400/TAO)\n🌐 APIs: All free (Solana RPC, RugCheck, DexScreener)\n🐍 Python 3.9+ with Bittensor SDK\n\nQuick start:\n  git clone https://github.com/rugintel/rugintel.git\n  cd rugintel && pip install -r requirements.txt\n  cp .env.example .env\n  python neurons/miner.py --netuid <UID> --wallet.name my_wallet\n\nEstimated earnings:\n• Top 10% accuracy: $567-1,133/month\n• Average accuracy: $200-500/month\n• Entry level: $100-200/month\n\nYour earnings depend on prediction accuracy — the more accurate your rugpull predictions, the more TAO you earn via Yuma Consensus.',
    },
    {
      q: 'What is Bittensor and how does RugIntel use it?',
      a: 'Bittensor is a decentralized AI network — think of it as "Bitcoin for artificial intelligence." Instead of mining blocks, participants produce valuable intelligence and get rewarded with TAO tokens.\n\nRugIntel runs as a Bittensor SUBNET — a specialized network within Bittensor focused specifically on rugpull detection. Here\'s how the pieces fit together:\n\n• Bittensor provides: Decentralized infrastructure, TAO rewards, Yuma Consensus algorithm, miner/validator coordination\n• RugIntel provides: Domain-specific rugpull detection logic, 12-layer intelligence fusion engine, ground truth verification\n\nThis means RugIntel inherits Bittensor\'s properties:\n✅ Decentralized — no single point of failure\n✅ Trustless — no need to trust any single entity\n✅ Self-improving — economic incentives drive accuracy\n✅ Censorship-resistant — can\'t be shut down by anyone',
    },
    {
      q: 'How fast does RugIntel detect rugpulls?',
      a: 'RugIntel analyzes new tokens in real-time as they launch on Solana.\n\nAverage analysis time: ~2-3 seconds per token\nCoverage: Every new token detected on Solana DEXes\n\nThis matters because speed is critical:\n• 68% of rugpulls happen within 12 MINUTES of launch\n• Existing tools like GMGN.ai have 2-5 minute delays\n• By the time RugCheck shows results, the LP is already drained\n\nRugIntel\'s 12-layer analysis runs in parallel — all 7 layers execute simultaneously, not sequentially. This means you get a comprehensive risk assessment before scammers can execute their rugpull.',
    },
    {
      q: 'Is RugIntel open source?',
      a: 'Yes. RugIntel is fully open source under the MIT License.\n\nYou can:\n✅ Read all the code — miner logic, validator logic, 12-layer engine\n✅ Fork and modify — build your own version or improvements\n✅ Run your own miner — compete on the Bittensor subnet\n✅ Audit the scoring — see exactly how risk scores are calculated\n✅ Contribute — submit PRs to improve detection accuracy\n\nGitHub: github.com/rugintel/rugintel\n\nTransparency is fundamental to trust. Unlike centralized tools where you don\'t know how scores are calculated, every line of RugIntel\'s intelligence logic is publicly auditable.',
    },
    {
      q: 'What if scammers adapt to RugIntel\'s detection?',
      a: 'This is exactly why RugIntel is built on Bittensor instead of being a static tool.\n\nThe problem with existing tools:\nStatic heuristics lag 2-4 weeks behind evolving scammer tactics. When scammers figure out RugCheck\'s rules, they just code around them.\n\nHow RugIntel solves this:\nLayer 12 (Adversarial Learning) creates a self-improving loop:\n\n1. A new rugpull bypasses detection → the network notices\n2. Post-mortem analysis: "Why did we miss this?"\n3. Miners who discover the new pattern first = earn MORE TAO\n4. The detection gap closes within hours, not weeks\n\nBecause miners are PAID to find new scam patterns, there\'s a continuous economic race to stay ahead of scammers. The better your detection, the more TAO you earn.\n\nStatic tools can\'t compete with this. RugIntel evolves faster than scammers can adapt because accuracy = revenue.',
    },
  ];

  useEffect(() => {
    faqs.forEach((_, idx) => {
      const answerEl = answerRefs.current[idx];
      if (!answerEl) return;

      if (openIdx === idx) {
        gsap.to(answerEl, {
          height: 'auto',
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out',
        });
      } else {
        gsap.to(answerEl, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
        });
      }
    });
  }, [openIdx, faqs]);

  const handleToggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 px-6 bg-gradient-to-b from-black to-cyan-950/10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold font-mono mb-4">
            <span className="text-cyan-400">FAQ</span>
          </h2>
          <p className="text-xl text-gray-300">
            Common questions about RugIntel
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <NeonBorder
              key={idx}
              color="cyan"
              className="bg-black/60 cursor-pointer hover:bg-cyan-500/10 transition"
              onClick={() => handleToggle(idx)}
            >
              <div className="p-6">
                {/* Question */}
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-bold text-white font-mono flex-1 text-left">{faq.q}</h3>
                  <ChevronDown 
                    className={`flex-shrink-0 text-cyan-400 transition-transform duration-300 ${
                      openIdx === idx ? 'rotate-180' : ''
                    }`}
                    size={24}
                  />
                </div>

                {/* Answer */}
                <div 
                  ref={(el) => { answerRefs.current[idx] = el; }}
                  className="h-0 opacity-0 overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-cyan-500/20 text-gray-300 leading-relaxed whitespace-pre-line">
                    {faq.a}
                  </div>
                </div>
              </div>
            </NeonBorder>
          ))}
        </div>

        {/* Still have questions */}
        <div className="mt-16 text-center p-8 border-2 border-cyan-500/30 bg-cyan-500/5">
          <p className="text-gray-300 mb-4">Still have questions?</p>
          <a href="#" className="text-cyan-400 font-mono hover:text-cyan-300 transition">
            Contact our support team →
          </a>
        </div>
      </div>
    </section>
  );
}
