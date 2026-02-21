'use client';

import { NeonBorder } from '@/components/neon-border';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-cyan-500/30">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3 hover:opacity-80 transition">
          <img 
            src="/rugintel-icon.png" 
            alt="RugIntel Logo" 
            className="w-10 h-10"
          />
          <span className="text-xl font-bold text-white font-mono">RugIntel</span>
        </a>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#solution" className="text-gray-300 hover:text-cyan-400 transition text-sm">
            Solution
          </a>
          <a href="#how-it-works" className="text-gray-300 hover:text-cyan-400 transition text-sm">
            How It Works
          </a>
          <a href="#features" className="text-gray-300 hover:text-cyan-400 transition text-sm">
            Features
          </a>
          <a href="#faq" className="text-gray-300 hover:text-cyan-400 transition text-sm">
            FAQ
          </a>
        </div>

        {/* CTA Button */}
        <button className="relative px-6 py-2 bg-cyan-500/10 border border-cyan-400 text-cyan-400 font-mono text-sm hover:bg-cyan-500/20 transition overflow-hidden group">
          <span className="relative z-10">Launch App</span>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-magenta-500 opacity-0 group-hover:opacity-20 transition" />
        </button>
      </div>
    </nav>
  );
}
