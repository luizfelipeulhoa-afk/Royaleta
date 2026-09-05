import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { CheerOption } from "../lib/cheer";
import { drawArenaWheel } from "../lib/drawArenaWheel";
import { initAudio, playTick, startSuspense, stopSuspense } from "../lib/arenaAudio";
import { CrownIcon } from "./icons";

export interface WheelHandle {
  spin(): void;
}

interface ArenaWheelProps {
  options: CheerOption[];
  onSpinStart: () => void;
  onSpinEnd: (index: number) => void;
}

const TAU = Math.PI * 2;

const CORNERS = [
  "-top-2 -left-2",
  "-top-2 -right-2",
  "-bottom-2 -left-2",
  "-bottom-2 -right-2",
];

/** Medalhão real com coroa para os cantos da moldura. */
function CornerBadge() {
  return (
    <span className="grid h-11 w-11 place-items-center rounded-full border border-[#fde047]/70 bg-[radial-gradient(circle_at_35%_30%,#1c2541,#0b132b_70%)] text-goldlight shadow-[0_6px_14px_rgba(0,0,0,0.6),0_0_10px_rgba(245,158,11,0.35),inset_0_1px_0_rgba(255,255,255,0.25)]">
      <CrownIcon size={17} strokeWidth={2.2} />
    </span>
  );
}

/** Arena da roleta: halo cônico, aro chanfrado, ponteiro e hub 3D. */
const ArenaWheel = forwardRef<WheelHandle, ArenaWheelProps>(function ArenaWheel(
  { options, onSpinStart, onSpinEnd },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const optionsRef = useRef(options);
  const rotationRef = useRef(0);
  const velocityRef = useRef(0);
  const glowRef = useRef(0);
  const spinningRef = useRef(false);
  const rafRef = useRef(0);
  const lastTickIdxRef = useRef(-1);
  const [kick, setKick] = useState(false);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  /* pintura contínua: anéis de energia com liga/desliga suave */
  useEffect(() => {
    let mounted = true;
    const loop = () => {
      if (!mounted) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        const target = spinningRef.current
          ? Math.min(1, velocityRef.current / 0.16)
          : 0;
        glowRef.current += (target - glowRef.current) * 0.14;
        drawArenaWheel(ctx, canvas.width, optionsRef.current, rotationRef.current, glowRef.current);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      mounted = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const spinInternal = useCallback(() => {
    if (spinningRef.current || optionsRef.current.length < 2) return;
    initAudio();
    spinningRef.current = true;
    setSpinning(true);
    lastTickIdxRef.current = -1;
    onSpinStart();
    startSuspense();

    /* impulso aleatório + atrito exponencial suave */
    let velocity = 0.3 + Math.random() * 0.2;
    const friction = 0.987;

    const animate = () => {
      if (!spinningRef.current) return;
      rotationRef.current = (rotationRef.current + velocity) % TAU;
      velocity *= friction;
      velocityRef.current = velocity;

      const opts = optionsRef.current;
      const slice = TAU / opts.length;
      let norm = (1.5 * Math.PI - rotationRef.current) % TAU;
      if (norm < 0) norm += TAU;
      const idx = Math.floor(norm / slice) % opts.length;

      if (idx !== lastTickIdxRef.current) {
        lastTickIdxRef.current = idx;
        playTick();
        setKick(true);
        window.setTimeout(() => setKick(false), 60);
      }

      if (velocity < 0.0018) {
        spinningRef.current = false;
        setSpinning(false);
        velocityRef.current = 0;
        stopSuspense();
        onSpinEnd(idx);
        return;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
  }, [onSpinStart, onSpinEnd]);

  useImperativeHandle(ref, () => ({ spin: spinInternal }), [spinInternal]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[480px]">
      {/* halo cônico giratório */}
      <div
        className={`absolute -inset-4 rounded-full blur-[10px] transition-opacity duration-700 ${
          spinning ? "opacity-80" : "opacity-45"
        }`}
        style={{
          background:
            "conic-gradient(from 0deg, #1d4ed8, #f59e0b, #06b6d4, #fde047, #b45309, #3b82f6, #1d4ed8)",
          animation: `halo-spin ${spinning ? 4 : 18}s linear infinite`,
        }}
        aria-hidden
      />

      {/* brasões reais nos quatro cantos */}
      {CORNERS.map((pos) => (
        <span key={pos} className={`absolute z-30 ${pos}`} aria-hidden>
          <CornerBadge />
        </span>
      ))}

      {/* ponteiro metálico às 12h */}
      <div
        className={`cheer-pointer pointer-events-none absolute -top-3 left-1/2 z-30 h-[54px] w-[42px] ${
          kick ? "kicked" : ""
        }`}
      >
        <svg viewBox="0 0 38 48" className="h-full w-full">
          <defs>
            <linearGradient id="ptr-metal" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f8fafc" />
              <stop offset="0.45" stopColor="#94a3b8" />
              <stop offset="1" stopColor="#475569" />
            </linearGradient>
          </defs>
          <path
            d="M19 46 L3 10 C0 4 5 0 11 0 L27 0 C33 0 38 4 35 10 Z"
            fill="url(#ptr-metal)"
            stroke="#fde047"
            strokeWidth={2.2}
          />
          <circle cx={19} cy={12} r={5} fill="#f59e0b" stroke="#fff7d6" strokeWidth={1.8} />
        </svg>
      </div>

      {/* disco */}
      <canvas
        ref={canvasRef}
        width={640}
        height={640}
        onClick={spinInternal}
        role="button"
        aria-label="Girar a roleta"
        className="wheel-canvas-glow absolute inset-0 h-full w-full cursor-pointer"
      />

      {/* hub central 3D — botão GIRAR */}
      <button
        type="button"
        onClick={spinInternal}
        disabled={spinning || options.length < 2}
        aria-label="Girar a roleta"
        className="group absolute left-1/2 top-1/2 z-20 aspect-square h-[24%] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full disabled:cursor-not-allowed"
      >
        <span
          className="absolute inset-0 rounded-full"
          style={
            spinning ? undefined : { animation: "pulse-ring-gold 2.2s ease-out infinite" }
          }
          aria-hidden
        />
        <span
          className={`absolute inset-0 rounded-full p-[7%] transition-transform duration-150 group-hover:scale-105 group-active:scale-95 ${
            spinning ? "opacity-80" : ""
          }`}
          style={{
            background: "conic-gradient(from 40deg, #fde047, #b45309, #f59e0b, #7c3f06, #fde047)",
            boxShadow:
              "0 10px 26px rgba(0,0,0,0.65), 0 0 22px rgba(245,158,11,0.45), inset 0 2px 3px rgba(255,255,255,0.55)",
          }}
          aria-hidden
        >
          <span className="flex h-full w-full flex-col items-center justify-center gap-[4%] rounded-full border border-[#f59e0b]/60 bg-[radial-gradient(circle_at_32%_28%,#1c2541,#0b132b_72%)] text-goldlight">
            <svg
              viewBox="0 0 24 24"
              className="h-[30%] w-[30%] drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.1}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.735H5.81a1 1 0 0 1-.957-.735L2.02 6.02a.5.5 0 0 1 .798-.52l4.276 3.664a1 1 0 0 0 1.516-.294z" />
              <path d="M5 21h14" />
            </svg>
            <span className="font-display text-[clamp(8px,1.4vw,11px)] font-black uppercase tracking-[0.25em]">
              {spinning ? "…" : "Girar"}
            </span>
          </span>
        </span>
      </button>
    </div>
  );
});

export default ArenaWheel;
