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

export interface WheelHandle {
  spin(): void;
}

interface ArenaWheelProps {
  options: CheerOption[];
  onSpinStart: () => void;
  onSpinEnd: (index: number) => void;
}

const TAU = Math.PI * 2;
const BADGES = ["⚡", "🎀", "🤸", "🏆"];
const BADGE_POSITIONS = [
  "top-2.5 -left-2.5",
  "top-4 -right-2",
  "bottom-4 -left-2",
  "bottom-3.5 -right-2.5",
];

/** Palco da roleta: canvas + ponteiro dourado + badges flutuantes. */
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

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  /* loop de pintura contínuo (anel de energia liga/desliga suave) */
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
    lastTickIdxRef.current = -1;
    onSpinStart();
    startSuspense();

    let velocity = 0.32 + Math.random() * 0.22;
    const friction = 0.985 - Math.random() * 0.003;

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
        window.setTimeout(() => setKick(false), 55);
      }

      if (velocity < 0.0018) {
        spinningRef.current = false;
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
    <div className="relative mx-auto flex h-[330px] w-[330px] max-w-full items-center justify-center">
      {/* ponteiro dourado */}
      <div
        className={`cheer-pointer pointer-events-none absolute -top-3.5 left-1/2 z-30 h-[52px] w-10 ${
          kick ? "kicked" : ""
        }`}
      >
        <svg viewBox="0 0 38 48" className="h-full w-full">
          <path
            d="M19 46 L3 10 C0 4 5 0 11 0 L27 0 C33 0 38 4 35 10 Z"
            fill="#ffc72c"
            stroke="#ffffff"
            strokeWidth={2.5}
          />
          <circle cx={19} cy={12} r={5} fill="#ffffff" stroke="#ffc72c" strokeWidth={2} />
        </svg>
      </div>

      {/* badges flutuantes */}
      {BADGES.map((badge, i) => (
        <div
          key={badge}
          className={`animate-arena-float pointer-events-none absolute z-20 rounded-[18px] border-2 border-white/40 bg-[rgba(30,41,69,0.85)] px-2.5 py-1.5 text-xl shadow-[0_8px_18px_rgba(0,0,0,0.5),0_0_12px_rgba(0,240,255,0.3)] ${BADGE_POSITIONS[i]}`}
          style={{ animationDelay: `${i * 0.55}s` }}
          aria-hidden
        >
          {badge}
        </div>
      ))}

      <canvas
        ref={canvasRef}
        width={640}
        height={640}
        onClick={spinInternal}
        role="button"
        aria-label="Girar a roleta"
        className="wheel-canvas-glow h-[320px] w-[320px] max-w-full cursor-pointer rounded-full"
      />
    </div>
  );
});

export default ArenaWheel;
