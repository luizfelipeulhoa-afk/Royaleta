import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export type ConfettiMode = "standard" | "massive";

export interface ConfettiHandle {
  launch(mode?: ConfettiMode): void;
}

interface Particle {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  vx: number;
  vy: number;
  rot: number;
  rotSpeed: number;
  opacity: number;
  round: boolean;
}

const STANDARD_COLORS = ["#fde047", "#3b82f6", "#ffffff", "#06b6d4"];
const MASSIVE_COLORS = ["#f59e0b", "#fde047", "#fff7d6", "#3b82f6", "#b45309"];

function makeParticle(x: number, y: number, vx: number, vy: number, colors: string[]): Particle {
  return {
    x,
    y,
    w: Math.random() * 10 + 6,
    h: Math.random() * 7 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    vx,
    vy,
    rot: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 16,
    opacity: 1,
    round: Math.random() < 0.22,
  };
}

const ConfettiLayer = forwardRef<ConfettiHandle, object>(function ConfettiLayer(_props, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef(0);
  const runningRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
      runningRef.current = false;
    };
  }, []);

  const step = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const parts = particlesRef.current;
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.38;
      p.vx *= 0.992;
      p.rot += p.rotSpeed;
      p.opacity -= 0.008;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.fillStyle = p.color;
      if (p.round) {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2.6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();

      if (p.opacity <= 0 || p.y > canvas.height + 30) parts.splice(i, 1);
    }

    if (parts.length > 0) {
      rafRef.current = requestAnimationFrame(step);
    } else {
      runningRef.current = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  useImperativeHandle(ref, () => ({
    launch(mode: ConfettiMode = "standard") {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const parts = particlesRef.current;

      if (mode === "massive") {
        /* chuva dourada de FULL OUT */
        for (let i = 0; i < 150; i++) {
          parts.push(
            makeParticle(
              w / 2,
              h / 2 - 50,
              (Math.random() - 0.5) * 22,
              (Math.random() - 0.72) * 21,
              MASSIVE_COLORS,
            ),
          );
        }
        for (let i = 0; i < 35; i++) {
          parts.push(makeParticle(w * 0.05, h * 0.6, Math.random() * 13 + 4, -(Math.random() * 15 + 6), MASSIVE_COLORS));
          parts.push(makeParticle(w * 0.95, h * 0.6, -(Math.random() * 13 + 4), -(Math.random() * 15 + 6), MASSIVE_COLORS));
        }
      } else {
        for (let i = 0; i < 70; i++) {
          parts.push(
            makeParticle(
              w / 2,
              h / 2 - 50,
              (Math.random() - 0.5) * 19,
              (Math.random() - 0.7) * 19,
              STANDARD_COLORS,
            ),
          );
        }
      }

      if (!runningRef.current) {
        runningRef.current = true;
        rafRef.current = requestAnimationFrame(step);
      }
    },
  }));

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[150]" />;
});

export default ConfettiLayer;
