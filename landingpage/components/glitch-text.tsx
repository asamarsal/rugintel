'use client';

interface GlitchTextProps {
  children: string;
  className?: string;
}

export function GlitchText({ children, className = '' }: GlitchTextProps) {
  return (
    <div className={`relative inline-block ${className}`}>
      <span className="relative">
        {children}
        <span 
          className="absolute top-0 left-0 w-full opacity-80 text-cyan-400"
          style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.6)' }}
        >
          {children}
        </span>
      </span>
    </div>
  );
}
