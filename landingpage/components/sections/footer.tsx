"use client";

import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-black border-t border-cyan-500/20 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/rugintel-icon.png"
                alt="RugIntel Logo"
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="font-bold text-white font-mono">RugIntel</span>
            </div>
            <p className="text-gray-400 text-sm">
              AI-powered rugpull detection for Solana. Protect your investments.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-white mb-4 font-mono">Product</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="#" className="hover:text-cyan-400 transition">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400 transition">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400 transition">
                  API
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400 transition">
                  Security
                </a>
              </li>
            </ul>
          </div>

          {/* Developers */}
          <div>
            <h4 className="font-bold text-white mb-4 font-mono">Developers</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="#" className="hover:text-cyan-400 transition">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400 transition">
                  API Docs
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400 transition">
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400 transition">
                  Community
                </a>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-bold text-white mb-4 font-mono">Community</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="#" className="hover:text-cyan-400 transition">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400 transition">
                  Discord
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400 transition">
                  Telegram
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400 transition">
                  Blog
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-cyan-500/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2026 RugIntel. All rights reserved.
            </p>
            <div className="flex gap-6 text-gray-500 text-sm">
              <a href="#" className="hover:text-cyan-400 transition">
                Privacy
              </a>
              <a href="#" className="hover:text-cyan-400 transition">
                Terms
              </a>
              <a href="#" className="hover:text-cyan-400 transition">
                Status
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
