'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { NeonBorder } from '@/components/neon-border';
import { GlitchText } from '@/components/glitch-text';

export function Hero() {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const terminalRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline();

      // Fade in and stagger elements
      timeline.from(titleRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
      }, 0);

      timeline.from(subtitleRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
      }, 0.2);

      timeline.from(terminalRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.8,
      }, 0.4);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="min-h-screen pt-32 pb-20 px-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-40 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-40 right-10 w-80 h-80 bg-magenta-500/10 rounded-full blur-3xl" />

      <div className="max-w-4xl mx-auto z-10">
        {/* Main Title */}
        <div ref={titleRef} className="text-center mb-6">
          <h1 className="text-6xl md:text-7xl font-bold font-mono mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-magenta-400 to-lime-400">
              Rugpull Detection
            </span>
            <br />
            <span className="text-white">for Solana</span>
          </h1>
        </div>

        {/* Subtitle */}
        <div ref={subtitleRef} className="text-center mb-12">
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            AI-powered risk assessment that protects investors from rugpull scams. 
            Real-time analysis of token contracts, holder distribution, and developer patterns.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button className="px-8 py-3 bg-cyan-500/20 border-2 border-cyan-400 text-cyan-400 font-mono hover:bg-cyan-500/30 transition">
            Start Analyzing →
          </button>
          <button className="px-8 py-3 bg-transparent border-2 border-magenta-400 text-magenta-400 font-mono hover:bg-magenta-500/10 transition">
            View Docs
          </button>
        </div>

        {/* Terminal Mock */}
        <div ref={terminalRef} className="w-full">
          <NeonBorder color="cyan" className="bg-black/80 backdrop-blur">
            <div className="p-6">
              {/* Terminal Header */}
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-cyan-500/30">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                  <div className="w-3 h-3 bg-green-400 rounded-full" />
                </div>
                <span className="text-xs text-cyan-400 ml-2 font-mono">rugintell.ai/analyze</span>
              </div>

              {/* Terminal Content */}
              <div className="font-mono text-sm text-green-400 space-y-2">
                <div>
                  <span className="text-cyan-400">$</span>
                  <span className="ml-2">rugintel analyze --token EPjFWaJrgxaffEifVoEfx7jkxK9...</span>
                </div>
                <div className="text-gray-400">Scanning token contract...</div>
                <div className="text-gray-400">Analyzing holder distribution...</div>
                <div className="text-gray-400">Checking developer history...</div>
                <div className="mt-4">
                  <div className="text-cyan-400">Risk Assessment:</div>
                  <div className="mt-2 space-y-1 text-yellow-400">
                    <div>• Contract Risk: <span className="text-lime-400">LOW</span></div>
                    <div>• Holder Distribution: <span className="text-lime-400">HEALTHY</span></div>
                    <div>• Developer Score: <span className="text-magenta-400">MEDIUM</span></div>
                  </div>
                  <div className="mt-2 text-lime-400">✓ Safe to trade</div>
                </div>
              </div>
            </div>
          </NeonBorder>
        </div>
      </div>
    </section>
  );
}
