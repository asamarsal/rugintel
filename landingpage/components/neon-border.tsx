'use client';

interface NeonBorderProps {
  children: React.ReactNode;
  color?: 'cyan' | 'magenta' | 'lime';
  className?: string;
}

export function NeonBorder({ children, color = 'cyan', className = '' }: NeonBorderProps) {
  const colorMap = {
    cyan: 'border-cyan-500 shadow-[0_0_20px_rgba(0,255,255,0.5)]',
    magenta: 'border-magenta-500 shadow-[0_0_20px_rgba(255,0,255,0.5)]',
    lime: 'border-lime-500 shadow-[0_0_20px_rgba(0,255,136,0.5)]',
  };

  return (
    <div className={`border-2 ${colorMap[color]} ${className}`}>
      {children}
    </div>
  );
}
