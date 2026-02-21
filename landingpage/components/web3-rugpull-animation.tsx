'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function Web3RugpullAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    // Animation state
    const state = {
      progress: 0,
      protectedY: height * 0.35,
      unprotectedY: height * 0.65,
      particleAlpha: 0,
    };

    // Particles
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      color: string;
    }> = [];

    // Create particles
    const createParticles = (x: number, y: number, color: string, count: number) => {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * (2 + Math.random() * 3),
          vy: Math.sin(angle) * (2 + Math.random() * 3),
          life: 1,
          color,
        });
      }
    };

    // Animation timeline
    const timeline = gsap.timeline();

    timeline.to(
      state,
      {
        progress: 1,
        duration: 6,
        ease: 'power1.inOut',
        onUpdate: () => {
          const p = state.progress;

          // Clear canvas with fade
          ctx!.fillStyle = 'rgba(10, 14, 39, 0.15)';
          ctx!.fillRect(0, 0, width, height);

          // Draw grid background
          ctx!.strokeStyle = 'rgba(0, 255, 255, 0.05)';
          ctx!.lineWidth = 1;
          const gridSize = 40;
          for (let i = 0; i < width; i += gridSize) {
            ctx!.beginPath();
            ctx!.moveTo(i, 0);
            ctx!.lineTo(i, height);
            ctx!.stroke();
          }
          for (let i = 0; i < height; i += gridSize) {
            ctx!.beginPath();
            ctx!.moveTo(0, i);
            ctx!.lineTo(width, i);
            ctx!.stroke();
          }

          // Protected token line (stable)
          ctx!.strokeStyle = `rgba(0, 255, 136, ${0.8 - p * 0.1})`;
          ctx!.lineWidth = 3;
          ctx!.lineCap = 'round';
          ctx!.lineJoin = 'round';
          ctx!.beginPath();
          const protectedPoints = 50;
          for (let i = 0; i < protectedPoints; i++) {
            const x = (width / protectedPoints) * i;
            const noise = Math.sin(i * 0.3 + p * 2) * 3;
            const y = state.protectedY + noise + Math.sin(p * 2) * 2;
            if (i === 0) ctx!.moveTo(x, y);
            else ctx!.lineTo(x, y);
          }
          ctx!.stroke();

          // Protected glow
          ctx!.shadowColor = 'rgba(0, 255, 136, 0.5)';
          ctx!.shadowBlur = 20;
          ctx!.strokeStyle = 'rgba(0, 255, 136, 0.3)';
          ctx!.lineWidth = 1;
          ctx!.stroke();
          ctx!.shadowColor = 'transparent';

          // Unprotected token line (rugpull) - DRAMATIC CRASH
          const rugpullStart = 0.2;
          if (p >= rugpullStart) {
            const rugP = (p - rugpullStart) / (1 - rugpullStart);
            
            // Crash point at 65% progress
            const crashPoint = 0.65;
            const crashX = width * crashPoint;
            
            ctx!.strokeStyle = `rgba(255, 0, 85, ${0.9 + rugP * 0.1})`;
            ctx!.lineWidth = 3;
            ctx!.lineCap = 'round';
            ctx!.lineJoin = 'round';
            ctx!.beginPath();
            
            for (let i = 0; i < protectedPoints; i++) {
              const x = (width / protectedPoints) * i;
              let y: number;
              const xProgress = (x / width);

              if (xProgress < crashPoint) {
                // Gradual decline before crash
                y = state.unprotectedY + Math.sin(i * 0.2) * 3 - (xProgress * 20);
              } else if (rugP > 0.4) {
                // Explosive crash downward
                const afterCrash = (xProgress - crashPoint) / (1 - crashPoint);
                const crashIntensity = Math.pow(Math.min(rugP - 0.4, 0.6) / 0.6, 2);
                y = state.unprotectedY - 20 + (height * 0.4 * afterCrash * afterCrash * crashIntensity);
              } else {
                // Before crash happens
                y = state.unprotectedY + Math.sin(i * 0.2) * 3 - (xProgress * 20);
              }

              if (i === 0) ctx!.moveTo(x, y);
              else ctx!.lineTo(x, y);
            }
            ctx!.stroke();

            // Intense glow at crash zone
            if (rugP > 0.3) {
              const glowIntensity = Math.min((rugP - 0.3) / 0.4, 1);
              ctx!.shadowColor = `rgba(255, 0, 85, ${0.8 * glowIntensity})`;
              ctx!.shadowBlur = 50;
              ctx!.lineWidth = 1;
              ctx!.stroke();
              ctx!.shadowColor = 'transparent';
            }

            // PARTICLE EXPLOSION at crash zone
            if (rugP > 0.4 && particles.length < 300) {
              const explosionIntensity = Math.min((rugP - 0.4) * 2, 1);
              const particleCount = Math.floor(8 * explosionIntensity);
              
              // Radial explosion
              for (let angle = 0; angle < Math.PI * 2; angle += (Math.PI * 2) / particleCount) {
                const distance = 20 + Math.random() * 40;
                particles.push({
                  x: crashX + Math.cos(angle) * distance * 0.3,
                  y: state.unprotectedY - 20 + height * 0.2 + Math.sin(angle) * distance * 0.3,
                  vx: Math.cos(angle) * (3 + Math.random() * 5),
                  vy: Math.sin(angle) * (3 + Math.random() * 5) + 1,
                  life: 1,
                  color: 'rgba(255, 0, 85, ',
                });
              }
            }

            // Impact flash at crash point
            if (rugP > 0.35) {
              const flashIntensity = Math.max(0, Math.sin((rugP - 0.35) * Math.PI * 4) * 0.3);
              ctx!.fillStyle = `rgba(255, 150, 150, ${flashIntensity})`;
              ctx!.beginPath();
              ctx!.arc(crashX, state.unprotectedY - 20 + height * 0.15, 40 + flashIntensity * 20, 0, Math.PI * 2);
              ctx!.fill();
            }
          } else {
            // Initial flat line before crash
            ctx!.strokeStyle = `rgba(255, 0, 85, ${0.4})`;
            ctx!.lineWidth = 2;
            ctx!.beginPath();
            for (let i = 0; i < protectedPoints; i++) {
              const x = (width / protectedPoints) * i;
              const y = state.unprotectedY;
              if (i === 0) ctx!.moveTo(x, y);
              else ctx!.lineTo(x, y);
            }
            ctx!.stroke();
          }

          // Draw and update particles
          for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // gravity
            particle.life -= 0.02;

            if (particle.life <= 0) {
              particles.splice(i, 1);
              continue;
            }

            ctx!.fillStyle = particle.color.replace('0.8', String(particle.life * 0.8));
            ctx!.beginPath();
            ctx!.arc(particle.x, particle.y, 2 + Math.random() * 2, 0, Math.PI * 2);
            ctx!.fill();
          }

          // Draw labels
          ctx!.font = 'bold 14px Space Grotesk, sans-serif';
          ctx!.fillStyle = 'rgba(0, 255, 136, 0.9)';
          ctx!.textAlign = 'left';
          ctx!.fillText('🛡️ PROTECTED', 20, state.protectedY - 20);

          ctx!.fillStyle = `rgba(255, 0, 85, ${0.5 + (p - rugpullStart > 0 ? 0.5 : 0)})`;
          ctx!.fillText('⚠️ RUGPULL DETECTED', 20, state.unprotectedY + 30);

          // Progress indicator
          ctx!.fillStyle = 'rgba(0, 255, 255, 0.3)';
          ctx!.fillRect(0, height - 4, width * p, 4);
        },
      },
      0
    );

    // Restart animation on scroll
    ScrollTrigger.create({
      trigger: containerRef.current,
      onEnter: () => {
        timeline.restart();
      },
    });

    return () => {
      timeline.kill();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-96 relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full border border-cyan-500/30 bg-gradient-to-b from-black/50 to-cyan-950/20"
      />
    </div>
  );
}
