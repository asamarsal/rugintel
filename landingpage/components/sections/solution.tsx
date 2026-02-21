'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { NeonBorder } from '@/components/neon-border';

gsap.registerPlugin(ScrollTrigger);

export function Solution() {
  const sectionRef = useRef(null);
  const layersRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      layersRef.current.forEach((layer, index) => {
        gsap.from(layer, {
          opacity: 0,
          scale: 0.8,
          duration: 0.8,
          delay: index * 0.05,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            end: 'top 30%',
            scrub: 1,
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const layers = [
    { name: 'ML Risk Engine', color: 'from-cyan-500 to-blue-600' },
    { name: 'Pattern Recognition', color: 'from-blue-500 to-indigo-600' },
    { name: 'Contract Analysis', color: 'from-indigo-500 to-purple-600' },
    { name: 'Holder Distribution', color: 'from-purple-500 to-magenta-600' },
    { name: 'Developer Tracking', color: 'from-magenta-500 to-pink-600' },
    { name: 'Liquidity Analysis', color: 'from-pink-500 to-red-600' },
    { name: 'Market Behavior', color: 'from-red-500 to-orange-600' },
    { name: 'Social Signals', color: 'from-orange-500 to-yellow-600' },
    { name: 'Threat Detection', color: 'from-yellow-500 to-lime-600' },
    { name: 'Real-time Monitoring', color: 'from-lime-500 to-green-600' },
    { name: 'Risk Aggregation', color: 'from-green-500 to-cyan-600' },
    { name: 'Confidence Scoring', color: 'from-cyan-400 to-blue-500' },
  ];

  return (
    <section ref={sectionRef} id="solution" className="py-20 px-6 bg-black relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold font-mono mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-lime-400">
              12-Layer Fusion Analysis
            </span>
          </h2>
          <p className="text-xl text-gray-300">
            Our AI combines 12 independent risk layers into a single confidence score
          </p>
        </div>

        {/* 12-Layer Visualization */}
        <div className="flex justify-center mb-16">
          <div className="relative w-full max-w-md h-96 flex flex-col-reverse justify-center items-center gap-1">
            {layers.map((layer, index) => (
              <div
                key={index}
                ref={(el) => {
                  if (el) layersRef.current[index] = el;
                }}
                className={`relative w-full h-6 bg-gradient-to-r ${layer.color} rounded-sm flex items-center justify-center text-xs font-mono text-black font-bold shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group`}
                style={{
                  boxShadow: `0 0 20px ${index % 3 === 0 ? 'rgba(0, 255, 255, 0.5)' : index % 3 === 1 ? 'rgba(255, 0, 255, 0.5)' : 'rgba(0, 255, 136, 0.5)'}`,
                }}
              >
                <span className="opacity-0 group-hover:opacity-100 transition">{layer.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {[
            {
              title: 'Real-Time Analysis',
              description: 'Analyze any Solana token in seconds with our ML-powered risk engine',
              metrics: ['<200ms response', 'Live price data', 'Instant alerts'],
            },
            {
              title: 'Developer Intelligence',
              description: 'Track developers across wallets and identify repeat offenders',
              metrics: ['1M+ profiles tracked', 'Cross-chain detection', 'Risk history'],
            },
            {
              title: 'Community Protection',
              description: 'Community-driven threat intelligence powered by all users',
              metrics: ['Crowdsourced data', 'Voting system', 'Shared alerts'],
            },
          ].map((feature, idx) => (
            <NeonBorder
              key={idx}
              color={idx === 0 ? 'cyan' : idx === 1 ? 'magenta' : 'lime'}
              className="bg-black/60 backdrop-blur p-6 group hover:shadow-xl transition-all"
            >
              <h3 className="text-xl font-bold text-white mb-3 font-mono">{feature.title}</h3>
              <p className="text-gray-300 mb-4 text-sm">{feature.description}</p>
              <div className="space-y-2">
                {feature.metrics.map((metric, midx) => (
                  <div key={midx} className="text-xs text-cyan-400 font-mono">
                    ✓ {metric}
                  </div>
                ))}
              </div>
            </NeonBorder>
          ))}
        </div>
      </div>
    </section>
  );
}
