"use client";

import { Web3RugpullAnimation } from "@/components/web3-rugpull-animation";
import { MemecoinPredictionsTicker } from "@/components/memecoin-predictions-ticker";

export function RugpullChart() {
  return (
    <div className="py-16 bg-gradient-to-b from-black to-slate-900/20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 via-magenta-400 to-cyan-400 bg-clip-text text-transparent">
              Real-Time Detection in Action
            </span>
          </h2>
          <p className="text-gray-400 text-lg">
            Watch how RugIntel catches rugpulls before they happen
          </p>
        </div>

        {/* Web3 Animation */}
        <div className="border border-cyan-500/30 rounded-lg overflow-hidden bg-black/40 backdrop-blur p-6 mb-8">
          <Web3RugpullAnimation />
        </div>
      </div>

      {/* Live Predictions Ticker — full width, outside max-w container */}
      <div className="mt-12">
        <MemecoinPredictionsTicker />
      </div>

      <div className="max-w-6xl mx-auto px-6">
        {/* Info cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-lime-500/30 bg-lime-500/5 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-lime-400 rounded-full" />
              <span className="text-lime-400 font-mono font-bold uppercase tracking-wide">
                Protected
              </span>
            </div>
            <p className="text-gray-300">
              Stable price action with early alert detection before any
              suspicious movement. RugIntel identifies protective indicators
              across all 12 analysis layers.
            </p>
          </div>

          <div className="border border-red-500/30 bg-red-500/5 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-red-400 rounded-full" />
              <span className="text-red-400 font-mono font-bold uppercase tracking-wide">
                Rugpull Detected
              </span>
            </div>
            <p className="text-gray-300">
              Sudden price collapse with catastrophic drop pattern. Classic
              rugpull signature detected by RugIntel within seconds of
              execution, before most traders react.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
