'use client';

export function AnimatedGradient() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Background base */}
      <div className="absolute inset-0 bg-black" />
      
      {/* Animated gradient blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-magenta-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-magenta-500/20 to-lime-500/20 rounded-full blur-3xl animate-pulse animation-delay-2000" />
      <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-gradient-to-r from-lime-500/15 to-cyan-500/15 rounded-full blur-3xl animate-pulse animation-delay-4000" />
      
      {/* Animated grid overlay */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
    </div>
  );
}
