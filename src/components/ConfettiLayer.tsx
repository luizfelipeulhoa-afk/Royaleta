import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export interface ConfettiHandle {
  launch(): void;
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

const COLORS = [
  "#f87171",
  "#fbbf24",
  "#34d399",
  "#38bdf8",
  "#818cf8",
  "#f472b6",
  "#2dd4bf",
  "#fb923c",
];

function makeParticle(x: number, y: number, vx: number, vy: number): Particle {
  return {
    x,
    y,
    w: Math.random() * 9 + 5,
    h: Math.random() * 6 + 3,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    vx,
    vy,
    rot: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 14,
    opacity: 1,
    round: Math.random() < 0.25,
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
      p.vy += 0.32;
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
    launch() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const parts = particlesRef.current;

      /* explosão central atrás do modal */
      for (let i = 0; i < 70; i++) {
        parts.push(
          makeParticle(
            w / 2,
            h / 2 - 60,
            (Math.random() - 0.5) * 17,
            (Math.random() - 0.72) * 17,
          ),
        );
      }
      /* canhões laterais */
      for (let i = 0; i < 30; i++) {
        parts.push(makeParticle(w * 0.06, h * 0.62, Math.random() * 11 + 4, -(Math.random() * 13 + 5)));
        parts.push(makeParticle(w * 0.94, h * 0.62, -(Math.random() * 11 + 4), -(Math.random() * 13 + 5)));
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
