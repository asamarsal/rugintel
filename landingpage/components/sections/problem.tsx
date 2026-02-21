'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function Problem() {
  const sectionRef = useRef(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, index) => {
        gsap.from(card, {
          opacity: 0,
          y: 30,
          duration: 0.6,
          scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            end: 'top 50%',
            scrub: 1,
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const problems = [
    {
      title: 'Hidden Risks',
      description: 'Most rugpulls go undetected until its too late. Scammers hide their true intentions in complex smart contracts.',
      icon: '⚠️',
    },
    {
      title: 'Whale Concentration',
      description: 'Tokens with extreme holder concentration are prime targets for rugpulls. Hard to spot manually across thousands of tokens.',
      icon: '🐋',
    },
    {
      title: 'Developer History',
      description: 'Serial scammers reuse techniques. Tracking developer patterns across chains is nearly impossible without AI.',
      icon: '👤',
    },
    {
      title: 'Speed of Fraud',
      description: 'New tokens launch every minute. Manual analysis cannot keep pace with the speed of market innovation and fraud.',
      icon: '⚡',
    },
  ];

  return (
    <section ref={sectionRef} className="py-20 px-6 bg-gradient-to-b from-black via-blue-950/5 to-black">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold font-mono mb-4">
            <span className="text-magenta-400">The Problem</span>
          </h2>
          <p className="text-xl text-gray-300">
            Solana rugpulls cost investors billions. Without AI detection, everyone is vulnerable.
          </p>
        </div>

        {/* Problem Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {problems.map((problem, idx) => (
            <div
              key={idx}
              ref={(el) => {
                if (el) cardsRef.current[idx] = el;
              }}
              className="group p-6 bg-gradient-to-br from-red-950/20 to-transparent border-2 border-red-500/30 hover:border-red-400/60 transition-all duration-300 cursor-pointer overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-magenta-500/0 group-hover:from-red-500/10 group-hover:to-magenta-500/10 transition" />
              
              <div className="relative z-10">
                <div className="text-4xl mb-3">{problem.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3 font-mono">{problem.title}</h3>
                <p className="text-gray-300 leading-relaxed">{problem.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Impact Stats */}
        <div className="mt-20 grid grid-cols-3 gap-4 md:gap-8">
          <div className="text-center p-6 border border-cyan-500/30 bg-cyan-500/5">
            <div className="text-4xl font-bold text-cyan-400 mb-2">$14B+</div>
            <p className="text-sm text-gray-400">Lost to rugpulls in 2024</p>
          </div>
          <div className="text-center p-6 border border-magenta-500/30 bg-magenta-500/5">
            <div className="text-4xl font-bold text-magenta-400 mb-2">95%</div>
            <p className="text-sm text-gray-400">Go undetected before attack</p>
          </div>
          <div className="text-center p-6 border border-lime-500/30 bg-lime-500/5">
            <div className="text-4xl font-bold text-lime-400 mb-2">1.2K+</div>
            <p className="text-sm text-gray-400">New tokens launch daily</p>
          </div>
        </div>
      </div>
    </section>
  );
}
