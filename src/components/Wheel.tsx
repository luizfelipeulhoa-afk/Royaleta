import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { WheelOption } from "../lib/data";
import { drawWheel } from "../lib/drawWheel";
import { initAudio, playTick } from "../lib/audio";

const TAU = Math.PI * 2;
const CANVAS_SIZE = 640;

export interface WheelHandle {
  spin(): boolean;
  isSpinning(): boolean;
}

interface WheelProps {
  options: WheelOption[];
  onSpinStart: () => void;
  onSpinEnd: (winnerIndex: number) => void;
}

const BADGE_FALLBACK = ["🍕", "🍿", "🎮", "💖"];

const BADGE_POSITIONS = [
  { top: "8px", left: "-16px" },
  { top: "18px", right: "-14px" },
  { bottom: "24px", left: "-16px" },
  { bottom: "14px", right: "-12px" },
] as const;

const Wheel = forwardRef<WheelHandle, WheelProps>(function Wheel(
  { options, onSpinStart, onSpinEnd },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const optionsRef = useRef(options);
  const rotationRef = useRef(Math.random() * TAU);
  const velocityRef = useRef(0);
  const frictionRef = useRef(0.984);
  const spinningRef = useRef(false);
  const lastTickRef = useRef(-1);
  const glowRef = useRef(0);
  const kickTimerRef = useRef<number | undefined>(undefined);
  const callbacksRef = useRef({ onSpinStart, onSpinEnd });

  const [kicked, setKicked] = useState(false);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    callbacksRef.current = { onSpinStart, onSpinEnd };
  }, [onSpinStart, onSpinEnd]);

  /* loop de física + desenho */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;

    const kickPointer = () => {
      setKicked(true);
      window.clearTimeout(kickTimerRef.current);
      kickTimerRef.current = window.setTimeout(() => setKicked(false), 75);
    };

    const loop = () => {
      const opts = optionsRef.current;

      if (spinningRef.current) {
        rotationRef.current = (rotationRef.current + velocityRef.current) % TAU;
        velocityRef.current *= frictionRef.current;
        glowRef.current += (1 - glowRef.current) * 0.07;

        const total = opts.length;
        if (total >= 2) {
          const slice = TAU / total;
          let norm = (1.5 * Math.PI - rotationRef.current) % TAU;
          if (norm < 0) norm += TAU;
          const idx = Math.floor(norm / slice) % total;
          if (idx !== lastTickRef.current) {
            lastTickRef.current = idx;
            playTick();
            kickPointer();
          }
        }

        if (velocityRef.current < 0.0018) {
          spinningRef.current = false;
          velocityRef.current = 0;
          callbacksRef.current.onSpinEnd(lastTickRef.current);
        }
      } else {
        glowRef.current += (0 - glowRef.current) * 0.06;
      }

      drawWheel(ctx, CANVAS_SIZE, opts, rotationRef.current, glowRef.current);
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(kickTimerRef.current);
    };
  }, []);

  const spinInternal = () => {
    if (spinningRef.current || optionsRef.current.length < 2) return false;
    initAudio();
    spinningRef.current = true;
    velocityRef.current = 0.28 + Math.random() * 0.22;
    frictionRef.current = 0.984 - Math.random() * 0.003;
    callbacksRef.current.onSpinStart();
    return true;
  };

  useImperativeHandle(ref, () => ({
    spin: spinInternal,
    isSpinning() {
      return spinningRef.current;
    },
  }));

  const badgeIcons = BADGE_POSITIONS.map(
    (_, i) => options[i]?.icon ?? BADGE_FALLBACK[i],
  );

  return (
    <div className="relative mx-auto flex h-[320px] w-[320px] items-center justify-center">
      {/* ponteiro */}
      <div
        className={`wheel-pointer absolute -top-2.5 left-1/2 z-30 h-[46px] w-9 ${kicked ? "kicked" : ""}`}
      >
        <svg viewBox="0 0 38 48" className="h-full w-full">
          <path
            d="M19 46 L3 10 C0 4 5 0 11 0 L27 0 C33 0 38 4 35 10 Z"
            fill="#2d3748"
            stroke="#ffffff"
            strokeWidth="2.5"
          />
          <circle cx="19" cy="12" r="5" fill="#f6ad55" stroke="#ffffff" strokeWidth="1.5" />
        </svg>
      </div>

      {/* badges flutuantes com ícones das opções */}
      {badgeIcons.map((icon, i) => (
        <div
          key={i}
          className="animate-float-badge pointer-events-none absolute z-10 grid h-10 w-10 place-items-center rounded-2xl border-2 border-white bg-[#f7f9fd] text-lg shadow-[6px_8px_16px_rgba(160,175,195,0.35),-4px_-4px_8px_#ffffff]"
          style={{
            ...BADGE_POSITIONS[i],
            animationDelay: `${i * 0.85}s`,
          }}
        >
          <span aria-hidden>{icon}</span>
        </div>
      ))}

      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        onClick={spinInternal}
        className="h-[310px] w-[310px] cursor-pointer rounded-full transition-transform duration-150 active:scale-[0.985]"
        role="button"
        aria-label="Girar a roleta"
      />
    </div>
  );
});

export default Wheel;
