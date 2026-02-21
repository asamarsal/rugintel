"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function AnimatedGradient() {
  const blob1 = useRef<HTMLDivElement>(null);
  const blob2 = useRef<HTMLDivElement>(null);
  const blob3 = useRef<HTMLDivElement>(null);
  const blob4 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const blobs = [blob1.current, blob2.current, blob3.current, blob4.current];

    blobs.forEach((blob, i) => {
      if (!blob) return;
      gsap.to(blob, {
        x: () => `${(Math.random() - 0.5) * 300}`,
        y: () => `${(Math.random() - 0.5) * 200}`,
        scale: () => 0.8 + Math.random() * 0.6,
        duration: 12 + i * 4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: i * 1.5,
      });
    });
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Deep void background */}
      <div className="absolute inset-0 bg-[#060611]" />

      {/* Blob 1 — Cyan top-left */}
      <div
        ref={blob1}
        className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(0,255,255,0.12) 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />

      {/* Blob 2 — Purple center-right */}
      <div
        ref={blob2}
        className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(168,85,247,0.14) 0%, transparent 70%)",
          filter: "blur(120px)",
        }}
      />

      {/* Blob 3 — Pink bottom */}
      <div
        ref={blob3}
        className="absolute -bottom-40 left-1/4 w-[500px] h-[500px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,45,149,0.10) 0%, transparent 70%)",
          filter: "blur(110px)",
        }}
      />

      {/* Blob 4 — Lime mid-left */}
      <div
        ref={blob4}
        className="absolute top-2/3 left-10 w-[400px] h-[400px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(57,255,20,0.08) 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />

      {/* Moving cyber grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          animation: "gridDrift 40s linear infinite",
        }}
      />

      {/* Floating particles */}
      {Array.from({ length: 25 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${2 + Math.random() * 3}px`,
            height: `${2 + Math.random() * 3}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: ["#00ffff", "#a855f7", "#39ff14", "#ff2d95"][i % 4],
            opacity: 0.15 + Math.random() * 0.2,
            animation: `floatParticle ${15 + Math.random() * 20}s ease-in-out infinite`,
            animationDelay: `${-Math.random() * 20}s`,
          }}
        />
      ))}

      {/* Radial vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(6,6,17,0.8) 100%)",
        }}
      />

      <style jsx>{`
        @keyframes gridDrift {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 60px 60px;
          }
        }
        @keyframes floatParticle {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-40px) translateX(20px);
          }
          50% {
            transform: translateY(-10px) translateX(-15px);
          }
          75% {
            transform: translateY(-60px) translateX(10px);
          }
        }
      `}</style>
    </div>
  );
}
