import { useEffect, useRef } from "react";
import { FlameIcon } from "./icons";

interface HypeMeterProps {
  spinning: boolean;
  /** incrementa a cada resultado — dispara pico de 100% */
  burst: number;
}

/**
 * Medidor de Fervor: sobe assintoticamente a 100% durante o giro
 * e decai suavemente após o decreto ser proclamado.
 */
export default function HypeMeter({ spinning, burst }: HypeMeterProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const valueRef = useRef(0);
  const spinningRef = useRef(spinning);
  const lastStatusRef = useRef("");

  useEffect(() => {
    spinningRef.current = spinning;
  }, [spinning]);

  useEffect(() => {
    if (burst > 0) valueRef.current = 100;
  }, [burst]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const hot = spinningRef.current;
      const v = valueRef.current;
      const next = hot
        ? Math.min(100, v + (100 - v) * 0.022 + 0.14)
        : Math.max(0, v + (0 - v) * 0.03);
      valueRef.current = next;

      if (barRef.current) barRef.current.style.width = `${next}%`;
      if (labelRef.current) labelRef.current.textContent = `${Math.round(next)}%`;

      const status =
        next >= 99.5
          ? "EXPLOSÃO REAL!"
          : hot
            ? "A CORTE FERVE..."
            : next > 30
              ? "ACALMANDO..."
              : "EM CALMARIA";
      if (status !== lastStatusRef.current && statusRef.current) {
        lastStatusRef.current = status;
        statusRef.current.textContent = status;
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="glass rise-in rounded-3xl p-4" style={{ animationDelay: "0.08s" }}>
      <header className="mb-3 flex items-center justify-between">
        <h2 className="font-display flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[1.5px] text-fog">
          <span className="text-gold">
            <FlameIcon size={14} strokeWidth={2.4} />
          </span>
          Medidor de Fervor
        </h2>
        <span
          ref={labelRef}
          className="font-num rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-[12px] font-bold tabular-nums text-goldlight"
        >
          0%
        </span>
      </header>

      <div className="relative h-4 overflow-hidden rounded-full border border-white/10 bg-white/5">
        {/* marcas de 25/50/75 */}
        {[25, 50, 75].map((m) => (
          <span
            key={m}
            className="absolute top-0.5 bottom-0.5 w-px bg-white/10"
            style={{ left: `${m}%` }}
          />
        ))}
        <div
          ref={barRef}
          className="relative h-full rounded-full"
          style={{
            width: "0%",
            background:
              "linear-gradient(90deg, #1d4ed8 0%, #06b6d4 38%, #f59e0b 72%, #fde047 100%)",
            boxShadow: "0 0 14px rgba(245, 158, 11, 0.55)",
            transition: "none",
          }}
        >
          <span className="hype-shine absolute inset-0 rounded-full" />
        </div>
      </div>

      <p
        ref={statusRef}
        className="font-num mt-2 text-center text-[10px] font-bold uppercase tracking-[2px] text-white/40"
      >
        EM CALMARIA
      </p>
    </section>
  );
}
