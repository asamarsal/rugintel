'use client';

export function Ticker() {
  const alerts = [
    { token: 'PUMP', risk: 'CRITICAL', change: '-82%', action: '⚠️ RUGPULL DETECTED' },
    { token: 'MEME', risk: 'HIGH', change: '-45%', action: '🚨 SUSPICIOUS' },
    { token: 'SOL', risk: 'LOW', change: '+12%', action: '✓ SAFE' },
    { token: 'BONK', risk: 'MEDIUM', change: '+5%', action: '◐ MONITOR' },
    { token: 'RAY', risk: 'LOW', change: '+8%', action: '✓ SAFE' },
  ];

  return (
    <section className="py-20 px-6 bg-black relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-bold font-mono mb-4">
            <span className="text-magenta-400">Live Risk Alerts</span>
          </h2>
          <p className="text-xl text-gray-300">Real-time monitoring of Solana token activity</p>
        </div>

        {/* Ticker */}
        <div className="border-2 border-magenta-500/30 bg-black/80 backdrop-blur overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-5 gap-4 p-4 bg-gradient-to-r from-magenta-500/20 to-transparent border-b border-magenta-500/30 font-mono text-magenta-400 font-bold text-sm">
            <div>TOKEN</div>
            <div>RISK LEVEL</div>
            <div>24H CHANGE</div>
            <div>STATUS</div>
            <div>ACTION</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-magenta-500/20">
            {alerts.map((alert, idx) => (
              <div
                key={idx}
                className="grid grid-cols-5 gap-4 p-4 hover:bg-magenta-500/10 transition font-mono text-sm border-l-4 border-transparent hover:border-magenta-500"
              >
                <div className="font-bold text-white">{alert.token}</div>
                <div className={`font-bold ${
                  alert.risk === 'CRITICAL' ? 'text-red-400' :
                  alert.risk === 'HIGH' ? 'text-orange-400' :
                  alert.risk === 'MEDIUM' ? 'text-yellow-400' :
                  'text-lime-400'
                }`}>
                  {alert.risk}
                </div>
                <div className={alert.change.startsWith('-') ? 'text-red-400' : 'text-lime-400'}>
                  {alert.change}
                </div>
                <div className="text-gray-400">{alert.action}</div>
                <div>
                  <button className="px-3 py-1 bg-magenta-500/20 border border-magenta-400 text-magenta-400 hover:bg-magenta-500/30 transition text-xs">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Footer */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-magenta-400 font-mono">847</div>
            <p className="text-gray-400 text-sm">Tokens Analyzed Today</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400 font-mono">23</div>
            <p className="text-gray-400 text-sm">Critical Alerts</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-lime-400 font-mono">412</div>
            <p className="text-gray-400 text-sm">Investors Protected</p>
          </div>
        </div>
      </div>
    </section>
  );
}
