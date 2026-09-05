import { useEffect, useRef, useState } from "react";
import type { ArenaStats } from "../lib/cheer";
import { CrownIcon, DiceIcon } from "./icons";

/** Anima a contagem do valor anterior até o novo (easing cúbico). */
function useCountUp(value: number): number {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    if (from === to) return;
    prevRef.current = to;

    const start = performance.now();
    const dur = 650;
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return display;
}

interface RoyalStatsProps {
  stats: ArenaStats;
}

/** Placar Real: KPIs numéricos do reinado. */
export default function RoyalStats({ stats }: RoyalStatsProps) {
  const spins = useCountUp(stats.spins);
  const fullOuts = useCountUp(stats.fullOuts);

  return (
    <section className="grid grid-cols-2 gap-3">
      <div
        className="glass rise-in group rounded-3xl p-4 transition-colors duration-300 hover:border-[rgba(6,182,212,0.35)]"
        style={{ animationDelay: "0.24s" }}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="font-num text-[10px] font-bold uppercase tracking-[1.5px] text-fog">
            Giros Totais
          </span>
          <span className="text-cyanx transition-transform duration-300 group-hover:rotate-12">
            <DiceIcon size={16} strokeWidth={2.2} />
          </span>
        </div>
        <p className="font-num text-[32px] font-bold leading-none tabular-nums text-white [text-shadow:0_0_18px_rgba(6,182,212,0.5)]">
          {spins}
        </p>
        <span className="mt-2 block h-1 w-10 rounded-full bg-gradient-to-r from-cyanx to-royal" />
      </div>

      <div
        className="glass rise-in group rounded-3xl p-4 transition-colors duration-300 hover:border-[rgba(245,158,11,0.45)]"
        style={{ animationDelay: "0.3s" }}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="font-num text-[10px] font-bold uppercase tracking-[1.5px] text-fog">
            Full Outs 👑
          </span>
          <span className="text-gold transition-transform duration-300 group-hover:-rotate-12">
            <CrownIcon size={16} strokeWidth={2.2} />
          </span>
        </div>
        <p className="font-num text-[32px] font-bold leading-none tabular-nums text-goldlight [text-shadow:0_0_18px_rgba(245,158,11,0.55)]">
          {fullOuts}
        </p>
        <span className="mt-2 block h-1 w-10 rounded-full bg-gradient-to-r from-gold to-goldlight" />
      </div>
    </section>
  );
}
