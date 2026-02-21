"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
}

export function Web3RugpullAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Responsive sizing
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const particles: Particle[] = [];
    let time = 0;
    let scanX = 0;
    let phase: "pump" | "peak" | "crash" | "aftermath" = "pump";
    let phaseTime = 0;

    // Color palette
    const CYAN = "#00ffff";
    const GREEN = "#39ff14";
    const RED = "#ff2d95";
    const ORANGE = "#ffaa00";
    const PURPLE = "#a855f7";

    // Chart data — price curve
    const generatePricePath = (
      progress: number,
    ): { x: number; y: number }[] => {
      const points: { x: number; y: number }[] = [];
      const steps = 120;

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = t * W;
        let y: number;

        if (t < 0.15) {
          // Slow accumulation (flat-ish entry)
          y = H * 0.7 - t * 60 + Math.sin(t * 40) * 3;
        } else if (t < 0.45) {
          // Pump phase — exponential rise
          const pumpT = (t - 0.15) / 0.3;
          const expo = Math.pow(pumpT, 1.8);
          y = H * 0.65 - expo * H * 0.48 + Math.sin(t * 30) * (2 + pumpT * 5);
        } else if (t < 0.55) {
          // Peak — wobbly top
          const peakT = (t - 0.45) / 0.1;
          y = H * 0.15 + Math.sin(peakT * Math.PI * 4) * 12 + peakT * 15;
        } else {
          // Crash — violent fall
          const crashT = (t - 0.55) / 0.45;
          const fall = Math.pow(crashT, 0.6);
          y =
            H * 0.18 +
            fall * H * 0.68 +
            Math.sin(crashT * 20) * (8 * (1 - crashT));
        }

        // Only reveal up to progress
        if (t <= progress) {
          points.push({ x, y: Math.max(H * 0.08, Math.min(H * 0.92, y)) });
        }
      }
      return points;
    };

    // Draw neon grid
    const drawGrid = () => {
      ctx.strokeStyle = "rgba(0, 255, 255, 0.04)";
      ctx.lineWidth = 0.5;
      const gridSize = 30;
      const offsetY = (time * 0.3) % gridSize;
      const offsetX = (time * 0.15) % gridSize;

      for (let x = -gridSize + offsetX; x < W + gridSize; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = -gridSize + offsetY; y < H + gridSize; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
    };

    // Draw price chart line with gradient
    const drawChart = (points: { x: number; y: number }[]) => {
      if (points.length < 2) return;

      // Gradient fill under the curve
      const gradient = ctx.createLinearGradient(0, 0, W, 0);
      gradient.addColorStop(0, "rgba(57, 255, 20, 0.08)");
      gradient.addColorStop(0.4, "rgba(57, 255, 20, 0.12)");
      gradient.addColorStop(0.5, "rgba(255, 170, 0, 0.08)");
      gradient.addColorStop(0.6, "rgba(255, 45, 149, 0.12)");
      gradient.addColorStop(1, "rgba(255, 45, 149, 0.04)");

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        const xc = (points[i].x + points[i - 1].x) / 2;
        const yc = (points[i].y + points[i - 1].y) / 2;
        ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
      }
      const last = points[points.length - 1];
      ctx.lineTo(last.x, H);
      ctx.lineTo(points[0].x, H);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Main price line
      const lineGrad = ctx.createLinearGradient(0, 0, W, 0);
      lineGrad.addColorStop(0, GREEN);
      lineGrad.addColorStop(0.35, GREEN);
      lineGrad.addColorStop(0.48, ORANGE);
      lineGrad.addColorStop(0.55, RED);
      lineGrad.addColorStop(1, RED);

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        const xc = (points[i].x + points[i - 1].x) / 2;
        const yc = (points[i].y + points[i - 1].y) / 2;
        ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
      }
      ctx.strokeStyle = lineGrad;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      // Glow effect
      ctx.shadowColor = "rgba(0, 255, 255, 0.5)";
      ctx.shadowBlur = 15;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    // Scanning vertical line
    const drawScanLine = (x: number, progress: number) => {
      const alpha = 0.3 + Math.sin(time * 3) * 0.15;
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, `rgba(0, 255, 255, 0)`);
      grad.addColorStop(0.2, `rgba(0, 255, 255, ${alpha})`);
      grad.addColorStop(0.8, `rgba(0, 255, 255, ${alpha})`);
      grad.addColorStop(1, `rgba(0, 255, 255, 0)`);

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();

      // Scan glow zone
      const glowGrad = ctx.createLinearGradient(x - 30, 0, x + 30, 0);
      glowGrad.addColorStop(0, "rgba(0, 255, 255, 0)");
      glowGrad.addColorStop(
        0.5,
        `rgba(0, 255, 255, ${0.03 + Math.sin(time * 2) * 0.02})`,
      );
      glowGrad.addColorStop(1, "rgba(0, 255, 255, 0)");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(x - 30, 0, 60, H);

      // Crosshair dot on scan line
      if (progress > 0.05) {
        const points = generatePricePath(progress);
        if (points.length > 0) {
          const nearest = points.reduce((prev, curr) =>
            Math.abs(curr.x - x) < Math.abs(prev.x - x) ? curr : prev,
          );
          const dist = Math.abs(nearest.x - x);
          if (dist < 15) {
            // Pulsing dot
            const pulse = 4 + Math.sin(time * 5) * 2;
            ctx.beginPath();
            ctx.arc(nearest.x, nearest.y, pulse, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 255, 255, ${0.6 + Math.sin(time * 5) * 0.3})`;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(nearest.x, nearest.y, pulse + 8, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0, 255, 255, 0.2)`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    };

    // Spawn particles at crash zone
    const spawnCrashParticles = (progress: number) => {
      if (progress < 0.56 || progress > 0.9) return;
      const intensity = Math.min((progress - 0.56) / 0.15, 1);
      const count = Math.floor(intensity * 4);
      const crashX = W * (0.5 + (progress - 0.55) * 0.8);
      const crashY = H * (0.2 + (progress - 0.55) * 1.3);

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 4;
        particles.push({
          x: crashX + (Math.random() - 0.5) * 20,
          y: Math.min(crashY, H * 0.85) + (Math.random() - 0.5) * 20,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          life: 1,
          maxLife: 1,
          size: 1 + Math.random() * 3,
          hue: 330 + Math.random() * 30, // pink-red
        });
      }
    };

    // Draw and update particles
    const drawParticles = () => {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // subtle gravity
        p.life -= 0.015;
        p.vx *= 0.99;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const alpha = p.life * 0.8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${alpha})`;
        ctx.fill();
      }
    };

    // Draw labels and alerts
    const drawLabels = (progress: number) => {
      ctx.font = 'bold 11px "JetBrains Mono", monospace';

      // Price label at latest point
      const points = generatePricePath(progress);
      if (points.length > 2) {
        const tip = points[points.length - 1];
        const prevTip = points[points.length - 3];
        const priceDir = tip.y < prevTip.y ? "▲" : "▼";

        // Determine which phase we're in
        const t = tip.x / W;
        let label: string;
        let color: string;

        if (t < 0.15) {
          label = `${priceDir} $0.0034`;
          color = "rgba(57, 255, 20, 0.9)";
        } else if (t < 0.45) {
          const pump = (t - 0.15) / 0.3;
          const price = (0.0034 + pump * 0.15).toFixed(4);
          label = `${priceDir} $${price}`;
          color = "rgba(57, 255, 20, 0.9)";
        } else if (t < 0.55) {
          label = "▲ $0.1547 — ATH";
          color = "rgba(255, 170, 0, 0.9)";
        } else {
          const crash = (t - 0.55) / 0.45;
          const price = Math.max(0.0001, 0.1547 * (1 - crash * 0.998)).toFixed(
            4,
          );
          label = `▼ $${price}`;
          color = "rgba(255, 45, 149, 0.9)";
        }

        // Label bg
        const labelW = ctx.measureText(label).width + 16;
        const lx = Math.min(tip.x + 12, W - labelW - 10);
        const ly = Math.max(tip.y - 20, 20);

        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(lx - 4, ly - 10, labelW, 18);
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(lx - 4, ly - 10, labelW, 18);

        ctx.fillStyle = color;
        ctx.textAlign = "left";
        ctx.fillText(label, lx + 4, ly + 3);
      }

      // Time axis labels
      ctx.fillStyle = "rgba(107, 114, 128, 0.5)";
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = "center";
      const times = ["0m", "2m", "5m", "8m", "12m", "15m"];
      times.forEach((t, i) => {
        ctx.fillText(t, (W / (times.length - 1)) * i, H - 8);
      });

      // "RUGPULL" flash
      if (progress > 0.58) {
        const flashAlpha = Math.min((progress - 0.58) / 0.1, 1);
        const blink = Math.sin(time * 6) > 0 ? 1 : 0.6;

        ctx.font = 'bold 16px "JetBrains Mono", monospace';
        ctx.textAlign = "center";
        ctx.fillStyle = `rgba(255, 45, 149, ${flashAlpha * blink})`;
        ctx.shadowColor = `rgba(255, 45, 149, ${flashAlpha * 0.6})`;
        ctx.shadowBlur = 20;
        ctx.fillText("⚠ LP DRAINED — RUGPULL", W * 0.72, H * 0.3);
        ctx.shadowBlur = 0;

        // Amount
        ctx.font = '12px "JetBrains Mono", monospace';
        ctx.fillStyle = `rgba(255, 45, 149, ${flashAlpha * 0.7})`;
        ctx.fillText("$2.3M liquidity removed", W * 0.72, H * 0.3 + 22);
      }

      // Safe zone label
      if (progress < 0.4 && progress > 0.1) {
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.textAlign = "left";
        ctx.fillStyle = `rgba(57, 255, 20, ${0.5 + Math.sin(time * 3) * 0.2})`;
        ctx.fillText("🟢 SCANNING...", 15, 30);
      }

      if (progress > 0.4 && progress < 0.56) {
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.textAlign = "left";
        ctx.fillStyle = `rgba(255, 170, 0, ${0.7 + Math.sin(time * 4) * 0.2})`;
        ctx.fillText("🟡 RISK ELEVATED — Score: 0.67", 15, 30);
      }

      if (progress >= 0.56) {
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.textAlign = "left";
        const blink2 = Math.sin(time * 8) > 0 ? 1 : 0.5;
        ctx.fillStyle = `rgba(255, 45, 149, ${blink2})`;
        ctx.shadowColor = "rgba(255, 45, 149, 0.4)";
        ctx.shadowBlur = 10;
        ctx.fillText("🔴 RUGPULL DETECTED — Score: 0.94", 15, 30);
        ctx.shadowBlur = 0;
      }
    };

    // Main animation state
    const state = { progress: 0 };

    const timeline = gsap.timeline({ repeat: -1, repeatDelay: 2 });

    // Phase 1: Scan line sweeps, chart draws
    timeline.to(state, {
      progress: 1,
      duration: 8,
      ease: "power1.inOut",
    });

    // Phase 2: Hold on aftermath
    timeline.to(state, {
      progress: 1,
      duration: 3,
    });

    // Phase 3: Reset
    timeline.set(state, { progress: 0 });

    // Render loop
    const tick = () => {
      time += 0.016;
      scanX = state.progress * W;

      // Clear
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = "rgba(6, 6, 17, 1)";
      ctx.fillRect(0, 0, W, H);

      drawGrid();

      const points = generatePricePath(state.progress);
      drawChart(points);
      drawScanLine(scanX, state.progress);
      spawnCrashParticles(state.progress);
      drawParticles();
      drawLabels(state.progress);

      // Border glow
      const borderAlpha = state.progress > 0.55 ? 0.4 : 0.15;
      const borderColor =
        state.progress > 0.55
          ? `rgba(255, 45, 149, ${borderAlpha + Math.sin(time * 4) * 0.1})`
          : `rgba(0, 255, 255, ${borderAlpha})`;
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

      animRef.current = requestAnimationFrame(tick);
    };

    // Start on scroll enter
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top 80%",
      onEnter: () => {
        timeline.restart();
      },
    });

    tick();

    return () => {
      cancelAnimationFrame(animRef.current);
      timeline.kill();
    };
  }, []);

  useEffect(() => {
    draw();

    const handleResize = () => {
      cancelAnimationFrame(animRef.current);
      draw();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [draw]);

  return (
    <div
      ref={containerRef}
      className="w-full aspect-[2.5/1] min-h-[280px] max-h-[400px] relative"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ imageRendering: "auto" }}
      />
    </div>
  );
}
