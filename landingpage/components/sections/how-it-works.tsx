'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { NeonBorder } from '@/components/neon-border';

gsap.registerPlugin(ScrollTrigger);

export function HowItWorks() {
  const sectionRef = useRef(null);
  const stepsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      stepsRef.current.forEach((step, index) => {
        gsap.from(step, {
          opacity: 0,
          x: index % 2 === 0 ? -50 : 50,
          duration: 0.8,
          scrollTrigger: {
            trigger: step,
            start: 'top 80%',
            end: 'top 50%',
            scrub: 1,
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const steps = [
    {
      number: '01',
      title: 'Connect Wallet',
      description: 'Link your Solana wallet to start analyzing tokens you hold or want to buy.',
      color: 'cyan',
    },
    {
      number: '02',
      title: 'Upload Token Address',
      description: 'Paste the token contract address or select from trending tokens on Solana.',
      color: 'magenta',
    },
    {
      number: '03',
      title: 'AI Analysis Runs',
      description: 'Our 12-layer fusion engine analyzes the token in real-time across multiple risk factors.',
      color: 'lime',
    },
  ];

  return (
    <section ref={sectionRef} id="how-it-works" className="py-20 px-6 bg-black relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold font-mono mb-4">
            <span className="text-cyan-400">How It Works</span>
          </h2>
          <p className="text-xl text-gray-300">
            Protect your portfolio in three simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-12">
          {steps.map((step, idx) => (
            <div
              key={idx}
              ref={(el) => {
                if (el) stepsRef.current[idx] = el;
              }}
              className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center`}
            >
              {/* Step Number & Icon */}
              <div className="flex-shrink-0">
                <div className={`relative w-32 h-32 flex items-center justify-center border-2 border-${step.color === 'cyan' ? 'cyan' : step.color === 'magenta' ? 'magenta' : 'lime'}-400`}
                  style={{
                    boxShadow: step.color === 'cyan' ? '0 0 30px rgba(0,255,255,0.6)' : step.color === 'magenta' ? '0 0 30px rgba(255,0,255,0.6)' : '0 0 30px rgba(0,255,136,0.6)',
                  }}
                >
                  <span className={`text-5xl font-bold font-mono text-${step.color === 'cyan' ? 'cyan' : step.color === 'magenta' ? 'magenta' : 'lime'}-400`}>
                    {step.number}
                  </span>
                </div>
              </div>

              {/* Step Content */}
              <div className="flex-1">
                <NeonBorder color={step.color as any} className="bg-black/60 p-8">
                  <h3 className="text-2xl font-bold text-white mb-3 font-mono">{step.title}</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">{step.description}</p>
                </NeonBorder>
              </div>

              {/* Arrow Connector */}
              {idx < steps.length - 1 && (
                <div className="md:block hidden absolute left-1/2 -translate-x-1/2 h-20 w-1 bg-gradient-to-b from-cyan-500 to-magenta-500" style={{ top: '100%' }} />
              )}
            </div>
          ))}
        </div>

        {/* Result */}
        <div className="mt-20 text-center">
          <NeonBorder color="lime" className="bg-gradient-to-r from-lime-500/10 to-cyan-500/10 p-8 inline-block">
            <div className="space-y-2">
              <p className="text-gray-300 text-sm">RESULT</p>
              <h3 className="text-3xl font-bold text-lime-400 font-mono">Instant Risk Score</h3>
              <p className="text-gray-300 mt-2">See if token is safe, suspicious, or dangerous</p>
            </div>
          </NeonBorder>
        </div>
      </div>
    </section>
  );
}
