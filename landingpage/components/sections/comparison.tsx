'use client';

export function Comparison() {
  const features = [
    { name: 'Real-time Analysis', rugintel: true, manual: false, other: false },
    { name: '12-Layer Risk Assessment', rugintel: true, manual: false, other: false },
    { name: 'Developer Tracking', rugintel: true, manual: false, other: true },
    { name: 'Liquidity Analysis', rugintel: true, manual: true, other: true },
    { name: 'Machine Learning Detection', rugintel: true, manual: false, other: false },
    { name: 'Community Alerts', rugintel: true, manual: false, other: false },
    { name: 'Mobile App', rugintel: true, manual: false, other: true },
    { name: 'API Access', rugintel: true, manual: false, other: false },
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-black to-blue-950/10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold font-mono mb-4">
            <span className="text-lime-400">RugIntel vs. The Rest</span>
          </h2>
          <p className="text-xl text-gray-300">How we protect investors better than anyone else</p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto border border-cyan-500/30">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cyan-500/30 bg-black/50">
                <th className="text-left p-4 font-mono text-cyan-400">Feature</th>
                <th className="text-center p-4 font-mono text-lime-400">RugIntel</th>
                <th className="text-center p-4 font-mono text-gray-400">Manual Analysis</th>
                <th className="text-center p-4 font-mono text-gray-400">Other Tools</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, idx) => (
                <tr key={idx} className={`border-b border-cyan-500/20 ${idx % 2 === 0 ? 'bg-black/30' : 'bg-transparent'} hover:bg-cyan-500/10 transition`}>
                  <td className="p-4 font-mono text-white">{feature.name}</td>
                  <td className="text-center p-4">
                    {feature.rugintel ? (
                      <span className="text-2xl text-lime-400">✓</span>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                  <td className="text-center p-4">
                    {feature.manual ? (
                      <span className="text-2xl text-yellow-400">◐</span>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                  <td className="text-center p-4">
                    {feature.other ? (
                      <span className="text-2xl text-orange-400">◑</span>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-8 flex flex-wrap gap-6 justify-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl text-lime-400">✓</span>
            <span className="text-gray-300 text-sm">Fully Supported</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl text-yellow-400">◐</span>
            <span className="text-gray-300 text-sm">Partial Support</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl text-orange-400">◑</span>
            <span className="text-gray-300 text-sm">Limited Support</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">—</span>
            <span className="text-gray-300 text-sm">Not Supported</span>
          </div>
        </div>
      </div>
    </section>
  );
}
