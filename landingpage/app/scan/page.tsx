"use client";

import { useState } from "react";
import { Navbar } from "@/components/sections/navbar";
import { NeonBorder } from "@/components/neon-border";
import {
  Search,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Wallet,
  Bell,
  Zap,
  Terminal,
} from "lucide-react";

export default function ScanPage() {
  const [address, setAddress] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<null | "safe" | "risky">(null);

  const handleScan = () => {
    if (!address) return;
    setScanning(true);
    setResult(null);
    // Simulate complex scan
    setTimeout(() => {
      setScanning(false);
      setResult(address.length % 2 === 0 ? "safe" : "risky");
    }, 2500);
  };

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-12 px-6">
      <Navbar />

      {/* Search Section */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold font-mono mb-4">
            <span className="text-cyan-400">Token Scanner</span>
          </h1>
          <p className="text-gray-400">
            Enter Solana token address for deep 12-layer analysis
          </p>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-magenta-500 rounded-none opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 blur"></div>
          <div className="relative flex items-center">
            <div className="absolute left-4 text-cyan-400">
              <Search className="w-6 h-6" />
            </div>
            <input
              type="text"
              placeholder="Paste token address (e.g. 5p2W...)"
              className="w-full bg-black/90 border-2 border-cyan-400/50 p-6 pl-14 font-mono text-lg focus:border-cyan-400 focus:outline-none transition-all placeholder:text-gray-600"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <button
              onClick={handleScan}
              disabled={scanning}
              className="absolute right-4 bg-cyan-400 text-black px-8 py-3 font-bold font-mono hover:bg-white transition-all disabled:opacity-50"
            >
              {scanning ? "SCANNING..." : "SCAN"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Analysis Results */}
        <div className="lg:col-span-2 space-y-8">
          {scanning ? (
            <NeonBorder color="cyan" className="bg-black/80 p-12 text-center">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Activity className="w-16 h-16 text-cyan-400 animate-pulse" />
                <h2 className="text-2xl font-mono text-cyan-400">
                  Executing 12-Layer Fusion Engine...
                </h2>
                <div className="w-full max-w-md h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 animate-[progress_2.5s_ease-in-out]" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs font-mono text-gray-400 w-full mt-8">
                  <div className="animate-pulse">Checking LP Burn...</div>
                  <div className="animate-pulse flex-delay-100">
                    Scanning Top Holders...
                  </div>
                  <div className="animate-pulse flex-delay-200">
                    Social Sentiment Check...
                  </div>
                  <div className="animate-pulse flex-delay-300">
                    Contract Audit...
                  </div>
                </div>
              </div>
            </NeonBorder>
          ) : result ? (
            <NeonBorder
              color={result === "safe" ? "lime" : "magenta"}
              className="bg-black/80 p-8"
            >
              <div className="flex items-center gap-6 mb-8">
                {result === "safe" ? (
                  <ShieldCheck className="w-20 h-20 text-lime-400" />
                ) : (
                  <ShieldAlert className="w-20 h-20 text-magenta-400" />
                )}
                <div>
                  <h2
                    className={`text-4xl font-black font-mono ${result === "safe" ? "text-lime-400" : "text-magenta-400"}`}
                  >
                    {result === "safe" ? "SAFE ASSET" : "RUG DETECTED"}
                  </h2>
                  <p className="text-gray-400 font-mono tracking-widest mt-1">
                    Risk Score: {result === "safe" ? "0.12" : "0.94"} / 1.0
                  </p>
                </div>
              </div>

              {/* Layer Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    name: "Layer 02: Liquidity",
                    status: result === "safe" ? "PASSED" : "DRAINED",
                  },
                  {
                    name: "Layer 03: Wallet",
                    status: result === "safe" ? "ORGANIC" : "CLUSTERED",
                  },
                  {
                    name: "Layer 05: Contract",
                    status: result === "safe" ? "RENOUNCED" : "MINTABLE",
                  },
                  {
                    name: "Layer 07: Temporal",
                    status: result === "safe" ? "STABLE" : "PEAK FOMO",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-white/5 border border-white/10 p-4 flex justify-between items-center font-mono"
                  >
                    <span className="text-gray-400 text-sm">{item.name}</span>
                    <span
                      className={
                        result === "safe" ? "text-lime-400" : "text-magenta-400"
                      }
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </NeonBorder>
          ) : (
            <div className="h-[400px] border-2 border-dashed border-gray-800 flex items-center justify-center flex-col text-gray-600 space-y-4">
              <Zap className="w-12 h-12" />
              <p className="font-mono">Waiting for token input</p>
            </div>
          )}

          {/* Terminal Logs */}
          <div className="bg-[#0a0a0a] border border-cyan-400/30 p-4 font-mono text-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-cyan-400/30 pb-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400">SUBNET_LOGS_STREAM</span>
            </div>
            <div className="space-y-1 text-xs opacity-70">
              <p className="text-gray-500">
                [20:47:12] Subnet active: Netuid 143
              </p>
              <p className="text-cyan-400/60">
                [20:47:15] Miner 12 - synapse_forward: token_verify
              </p>
              <p className="text-magenta-400/60">
                [20:47:18] Warning: Sudden buy-tax modification detected
              </p>
              <p className="text-lime-400/60">
                [20:47:22] LP burn confirmed for 5p2W...
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Premium Features */}
        <div className="space-y-8">
          <NeonBorder color="cyan" className="bg-black/90 p-6">
            <h3 className="text-xl font-bold font-mono mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-cyan-400" />
              Auto Alerts
            </h3>
            <p className="text-sm text-gray-400 mb-6 font-mono leading-relaxed">
              Don&apos;t watch Chart manually. Activate real-time alerts for
              your portfolio.
            </p>
            <div className="space-y-4">
              <button className="w-full bg-white text-black font-bold py-3 font-mono hover:bg-cyan-400 transition-all flex items-center justify-center gap-2">
                UPGRADE TO PRO ($99/mo)
              </button>
              <div className="flex items-center gap-2 opacity-30 cursor-not-allowed">
                <input
                  type="checkbox"
                  disabled
                  checked
                  className="w-4 h-4 rounded bg-cyan-900 border-cyan-400"
                />
                <span className="text-xs font-mono">Telegram Alerts</span>
              </div>
              <div className="flex items-center gap-2 opacity-30 cursor-not-allowed">
                <input
                  type="checkbox"
                  disabled
                  className="w-4 h-4 rounded bg-cyan-900 border-cyan-400"
                />
                <span className="text-xs font-mono">Email Notifications</span>
              </div>
            </div>
          </NeonBorder>

          <div className="bg-gradient-to-br from-gray-900 to-black p-6 border border-white/10">
            <h3 className="text-lg font-bold font-mono mb-4 flex items-center gap-2 text-magenta-400">
              <Wallet className="w-5 h-5" />
              Connected Wallet
            </h3>
            <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded">
              <span className="text-xs font-mono text-gray-400">
                Not Connected
              </span>
              <button className="text-xs font-mono text-cyan-400 hover:underline">
                Connect
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
