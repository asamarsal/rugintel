"use client";

import { NeonBorder } from "@/components/neon-border";

export function Miners() {
  const minerBenefits = [
    {
      title: "Earn from Analysis",
      description: "Get rewarded in TAO for accurate rugpull predictions on Solana. Miners earn:",
      bullets: [
        "Top 10%: 32.5 TAO/month ($11,375)",
        "Mid-tier: 9.75 TAO/month ($3,413)",
        "Bottom-tier: 3.25 TAO/month ($1,133)",
        "Runs on $5/month CPU VPS",
      ],
      icon: "💰",
    },
    {
      title: "Decentralized Network",
      description: "Join thousands of independent miners securing the RugIntel network. Your node:",
      bullets: [
        "Runs lightweight analysis (no GPU)",
        "Uses free public APIs",
        "Contributes to 12-layer intelligence fusion",
      ],
      icon: "🔗",
    },
    {
      title: "Passive Income",
      description: "Run nodes while you sleep and earn continuous rewards. Your node:",
      bullets: [
        "Analyzes tokens 24/7",
        "Predicts rugpulls 5-15 mins early",
        "Earns TAO for accurate predictions",
      ],
      icon: "😴",
    },
    {
      title: "Open Source",
      description: "Contribute to the project and earn community tokens. As an open-source project:",
      bullets: [
        "All code is publicly auditable",
        "Improvement driven by community",
        "Economic alignment rewards intelligence",
      ],
      icon: "🔓",
    },
  ];

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-black via-purple-950/20 to-black border-t border-purple-900/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold font-mono mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-magenta-400">
            Become a RugIntel Miner
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Run intelligence nodes. Predict rugpulls. Get rewarded in TAO.
          </p>
        </div>

        {/* Mining Overview */}
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-3xl font-bold text-magenta-400 font-mono mb-8 flex items-center">
              <span className="bg-magenta-500/20 p-2 rounded mr-4">⚙️</span>
              How RugIntel Mining Works
            </h3>

            <div className="space-y-6">
              <NeonBorder color="magenta" className="bg-black/80 p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="text-magenta-400 font-bold text-2xl font-mono shrink-0">01</div>
                  <div className="flex-1 w-full min-w-0">
                    <h4 className="text-xl font-bold text-white mb-2">Download Subnet Software</h4>
                    <p className="text-gray-400 text-sm mb-4">Clone the repository and install requirements.</p>
                    <div className="bg-black border border-gray-800 rounded p-3 font-mono text-xs sm:text-sm text-green-400 overflow-x-auto whitespace-pre-wrap sm:whitespace-nowrap break-words">
                      <div className="mb-2"><span className="text-gray-500 select-none">$</span> git clone https://github.com/your-repo/rugintel-subnet.git</div>
                      <div><span className="text-gray-500 select-none">$</span> pip install -r requirements.txt</div>
                    </div>
                  </div>
                </div>
              </NeonBorder>

              <NeonBorder color="magenta" className="bg-black/80 p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="text-magenta-400 font-bold text-2xl font-mono shrink-0">02</div>
                  <div className="flex-1 w-full min-w-0">
                    <h4 className="text-xl font-bold text-white mb-2">Stake Minimum 1,000 TAO</h4>
                    <p className="text-gray-400 text-sm mb-4">Register as a miner on netuid 199 (RugIntel subnet) and stake.</p>
                    <div className="bg-black border border-gray-800 rounded p-3 font-mono text-xs sm:text-sm text-green-400 overflow-x-auto whitespace-pre-wrap sm:whitespace-nowrap break-words">
                      <div className="mb-2"><span className="text-gray-500 select-none">$</span> btcli register --netuid 199 --wallet.name your-wallet</div>
                      <div><span className="text-gray-500 select-none">$</span> btcli stake --amount 1000 --wallet.name your-wallet</div>
                    </div>
                  </div>
                </div>
              </NeonBorder>

              <NeonBorder color="magenta" className="bg-black/80 p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="text-magenta-400 font-bold text-2xl font-mono shrink-0">03</div>
                  <div className="flex-1 w-full min-w-0">
                    <h4 className="text-xl font-bold text-white mb-2">Node Analyzes Tokens 24/7</h4>
                    <p className="text-gray-400 text-sm mb-4">Run the miner to automatically query Solana RPC, analyze tokens via 12 layers, and submit risk scores.</p>
                    <div className="bg-black border border-gray-800 rounded p-3 font-mono text-xs sm:text-sm text-green-400 overflow-hidden leading-relaxed break-words whitespace-pre-wrap">
                      <span className="text-gray-500 select-none block sm:inline mb-1 sm:mb-0">$ </span>python neurons/miner.py --netuid 199 --wallet.name your-wallet --wallet.hotkey your-hotkey
                    </div>
                  </div>
                </div>
              </NeonBorder>

              <div className="grid md:grid-cols-2 gap-6">
                <NeonBorder color="cyan" className="bg-black/80 p-6">
                  <h4 className="text-xl font-bold text-white mb-4 flex items-center">
                    <span className="text-cyan-400 font-mono mr-3">04</span>
                    Earn TAO Rewards
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex justify-between items-center"><span className="flex items-center"><span className="w-1.5 h-1.5 bg-cyan-500 rounded-full mr-2"></span>Accuracy</span> <span className="font-mono text-cyan-400">60%</span></li>
                    <li className="flex justify-between items-center"><span className="flex items-center"><span className="w-1.5 h-1.5 bg-cyan-500 rounded-full mr-2"></span>Timeliness</span> <span className="font-mono text-cyan-400">20%</span></li>
                    <li className="flex justify-between items-center"><span className="flex items-center"><span className="w-1.5 h-1.5 bg-cyan-500 rounded-full mr-2"></span>Evidence Quality</span> <span className="font-mono text-cyan-400">15%</span></li>
                    <li className="flex justify-between items-center"><span className="flex items-center"><span className="w-1.5 h-1.5 bg-cyan-500 rounded-full mr-2"></span>Consensus</span> <span className="font-mono text-cyan-400">5%</span></li>
                  </ul>
                  <div className="mt-4 p-2 bg-cyan-900/30 border border-cyan-800/50 rounded text-xs text-cyan-300 text-center font-medium">
                    +30% Bonus for detecting ≥5 mins early
                  </div>
                </NeonBorder>

                <NeonBorder color="lime" className="bg-black/80 p-6">
                  <h4 className="text-xl font-bold text-white mb-4 flex items-center">
                    <span className="text-lime-400 font-mono mr-3">05</span>
                    Reputation Multiplier
                  </h4>
                  <p className="text-gray-400 text-sm mb-4">Rewards scale based on 30-day accuracy performance.</p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">New Miner</span>
                      <span className="font-mono text-lime-400 font-bold">0.5x</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5">
                      <div className="bg-gradient-to-r from-gray-500 to-lime-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">Elite Miner</span>
                      <span className="font-mono text-lime-400 font-bold">1.5x</span>
                    </div>
                  </div>
                  <p className="text-xs text-lime-500/80 mt-4 text-center">
                    Top 10% miners receive 50% of emissions
                  </p>
                </NeonBorder>
              </div>
            </div>
          </div>

          {/* Stats Column */}
          <div className="space-y-6 lg:mt-20">
            <NeonBorder color="cyan" className="bg-cyan-950/20 p-8 flex flex-col items-center justify-center text-center h-48">
              <div className="text-sm text-cyan-400 font-mono mb-2 tracking-wider uppercase">Average Yield</div>
              <div className="text-5xl font-bold text-cyan-400 font-mono mb-2">
                24-38<span className="text-3xl">%</span>
              </div>
              <p className="text-gray-400 text-sm">
                Annual return for accurate miners
              </p>
            </NeonBorder>

            <NeonBorder color="lime" className="bg-lime-950/20 p-8 flex flex-col items-center justify-center text-center h-48">
              <div className="text-sm text-lime-400 font-mono mb-2 tracking-wider uppercase">
                MINIMUM STAKE
              </div>
              <div className="text-5xl font-bold text-lime-400 font-mono mb-2">
                1,000
              </div>
              <p className="text-gray-400 text-sm">
                TAO tokens to start mining
              </p>
            </NeonBorder>

            <NeonBorder color="magenta" className="bg-magenta-950/20 p-8 flex flex-col items-center justify-center text-center h-48">
              <div className="text-sm text-magenta-400 font-mono mb-2 tracking-wider uppercase">
                NETWORK
              </div>
              <div className="text-5xl font-bold text-magenta-400 font-mono mb-2">
                Netuid 199
              </div>
              <p className="text-gray-400 text-sm">
                RugIntel official subnet
              </p>
            </NeonBorder>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-white mb-10 font-mono">Why Mine on RugIntel?</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {minerBenefits.map((benefit, idx) => (
              <NeonBorder
                key={idx}
                color={
                  idx % 4 === 0 ? "cyan" : idx % 4 === 1 ? "magenta" : idx % 4 === 2 ? "lime" : "cyan"
                }
                className="bg-black/60 p-6 flex flex-col h-full hover:-translate-y-1 transition duration-300"
              >
                <div className="text-4xl mb-4 bg-gray-900 w-16 h-16 rounded-full flex items-center justify-center border border-gray-800 shrink-0">
                  {benefit.icon}
                </div>
                <h4 className="font-bold text-xl text-white mb-3 font-mono">
                  {benefit.title}
                </h4>
                <p className="text-gray-400 text-sm mb-6 flex-grow">{benefit.description}</p>
                <ul className="space-y-2 mt-auto">
                  {benefit.bullets.map((bullet, i) => (
                    <li key={i} className="flex items-start text-xs text-gray-300">
                      <span className="text-purple-500 mr-2 mt-0.5">▹</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </NeonBorder>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gray-900/50 border border-gray-800 p-10 rounded-2xl relative overflow-hidden mt-12">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-magenta-500/10 to-lime-500/10 opacity-50"></div>
          <div className="relative z-10 flex flex-col items-center">
            <h3 className="text-3xl font-bold text-white mb-4">Ready to become a RugIntel miner?</h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join the decentralized intelligence network. Secure the ecosystem. Earn continuous rewards.
            </p>
            <a
              href="https://github.com/asamarsal/rugintel/blob/main/README.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-transparent border-2 border-magenta-500 text-magenta-400 font-mono font-bold hover:bg-magenta-500 hover:text-white transition-all duration-300 text-lg shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:shadow-[0_0_25px_rgba(236,72,153,0.6)] rounded"
            >
              RugIntel Miner Setup Guide →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
