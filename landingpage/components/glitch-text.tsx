"use client";

interface GlitchTextProps {
  children: string;
  className?: string;
}

export function GlitchText({ children, className = "" }: GlitchTextProps) {
  return (
    <div className={`relative inline-block ${className}`}>
      {/* Glitch layers */}
      <span
        className="absolute top-0 left-0 w-full"
        style={{
          color: "#00ffff",
          animation: "glitch1 3s infinite",
          clipPath: "polygon(0 0, 100% 0, 100% 33%, 0 33%)",
        }}
        aria-hidden="true"
      >
        {children}
      </span>
      <span
        className="absolute top-0 left-0 w-full"
        style={{
          color: "#ff2d95",
          animation: "glitch2 3s infinite",
          clipPath: "polygon(0 67%, 100% 67%, 100% 100%, 0 100%)",
        }}
        aria-hidden="true"
      >
        {children}
      </span>
      {/* Main text */}
      <span className="relative">{children}</span>

      <style jsx>{`
        @keyframes glitch1 {
          0%,
          100% {
            transform: translate(0);
          }
          20% {
            transform: translate(-3px, -1px);
          }
          40% {
            transform: translate(3px, 1px);
          }
          60% {
            transform: translate(-2px, 2px);
          }
          80% {
            transform: translate(1px, -1px);
          }
        }
        @keyframes glitch2 {
          0%,
          100% {
            transform: translate(0);
          }
          20% {
            transform: translate(3px, 1px);
          }
          40% {
            transform: translate(-3px, -1px);
          }
          60% {
            transform: translate(2px, -2px);
          }
          80% {
            transform: translate(-1px, 1px);
          }
        }
      `}</style>
    </div>
  );
}
