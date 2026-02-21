'use client';

import { NeonBorder } from '@/components/neon-border';

export function Miners() {
  const minerBenefits = [
    {
      title: 'Earn from Analysis',
      description: 'Get rewarded in tokens for running analysis nodes',
      icon: '💰',
    },
    {
      title: 'Decentralized Network',
      description: 'Join thousands of independent miners securing the network',
      icon: '🔗',
    },
    {
      title: 'Passive Income',
      description: 'Run nodes while you sleep and earn continuous rewards',
      icon: '😴',
    },
    {
      title: 'Open Source',
      description: 'Contribute to the project and earn community tokens',
      icon: '🔓',
    },
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-black via-purple-950/10 to-black">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold font-mono mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-magenta-400 to-purple-400">
              Become a RugIntel Miner
            </span>
          </h2>
          <p className="text-xl text-gray-300">
            Run nodes. Analyze tokens. Get rewarded in tokens.
          </p>
        </div>

        {/* Mining Overview */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <NeonBorder color="magenta" className="bg-black/60 p-8">
            <h3 className="text-2xl font-bold text-magenta-400 mb-4 font-mono">How Mining Works</h3>
            <ol className="space-y-3">
              {[
                'Download RugIntel node software',
                'Stake minimum 1000 RUIN tokens',
                'Node analyzes tokens 24/7',
                'Earn tokens for correct predictions',
                'Reputation score increases rewards',
              ].map((step, idx) => (
                <li key={idx} className="flex gap-3 text-gray-300">
                  <span className="text-magenta-400 font-bold flex-shrink-0">{idx + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </NeonBorder>

          {/* Stats */}
          <div className="space-y-4">
            <NeonBorder color="cyan" className="bg-cyan-500/5 p-6">
              <div className="text-sm text-cyan-400 font-mono mb-1">APY</div>
              <div className="text-4xl font-bold text-cyan-400 font-mono">24-38%</div>
              <p className="text-gray-400 text-sm mt-2">Average annual return for nodes</p>
            </NeonBorder>
            <NeonBorder color="lime" className="bg-lime-500/5 p-6">
              <div className="text-sm text-lime-400 font-mono mb-1">MINIMUM STAKE</div>
              <div className="text-4xl font-bold text-lime-400 font-mono">1,000 RUIN</div>
              <p className="text-gray-400 text-sm mt-2">Start mining with minimal investment</p>
            </NeonBorder>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {minerBenefits.map((benefit, idx) => (
            <NeonBorder
              key={idx}
              color={idx % 3 === 0 ? 'cyan' : idx % 3 === 1 ? 'magenta' : 'lime'}
              className="bg-black/60 p-6 text-center hover:scale-105 transition"
            >
              <div className="text-4xl mb-3">{benefit.icon}</div>
              <h4 className="font-bold text-white mb-2 font-mono">{benefit.title}</h4>
              <p className="text-gray-300 text-sm">{benefit.description}</p>
            </NeonBorder>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <button className="px-8 py-4 bg-magenta-500/20 border-2 border-magenta-400 text-magenta-400 font-mono font-bold hover:bg-magenta-500/30 transition text-lg">
            Start Mining →
          </button>
        </div>
      </div>
    </section>
  );
}
