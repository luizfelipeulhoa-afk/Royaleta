import { ARM_TONES } from "../lib/cheer";
import { CrownIcon } from "./icons";

interface CrowdSectionProps {
  hyped: boolean;
}

interface Person {
  tone: string;
  size: number;
  delay: number;
  dur: number;
}

/* 30 súditos deterministicamente variados */
const PEOPLE: Person[] = Array.from({ length: 30 }, (_, i) => ({
  tone: ARM_TONES[i % ARM_TONES.length],
  size: 16 + ((i * 7) % 4) * 4,
  delay: ((i * 37) % 50) / 100,
  dur: 0.3 + ((i * 13) % 20) / 100,
}));

const IDLE_COUNT = 9;

/**
 * A corte: pessoas com os braços para cima que balançam em calma.
 * Durante o giro, elas se multiplicam e ocupam todo o espaço
 * inferior da roleta, pulando em festa.
 */
export default function CrowdSection({ hyped }: CrowdSectionProps) {
  const visible = hyped ? PEOPLE : PEOPLE.slice(0, IDLE_COUNT);

  return (
    <section
      className="relative h-[120px] w-full overflow-hidden rounded-[20px] border border-white/10 bg-gradient-to-b from-[rgba(20,28,52,0.5)] to-[rgba(8,13,30,0.95)]"
      aria-label="A corte aclamando"
    >
      <span className="absolute left-3 top-2 z-10 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[1px] text-white/40">
        <CrownIcon size={12} strokeWidth={2.4} />
        A corte aclama
      </span>

      {/* medidor de aclamação */}
      <span className={`absolute right-3 top-2 z-10 flex h-3.5 items-end gap-0.5 ${hyped ? "crowd-hyped" : "crowd-idle"}`} aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="meter-bar w-1 rounded-full"
            style={{
              height: 5 + i * 2,
              background: hyped ? "#f5c542" : "#2a4191",
              animationDelay: `${i * 0.07}s`,
              transition: "background 0.4s ease",
            }}
          />
        ))}
      </span>

      {/* placas da corte */}
      <span
        className="absolute bottom-1.5 left-2 z-10 rounded-md border border-[#fff3c4] bg-gold px-1.5 py-0.5 text-[9px] font-black tracking-wide text-[#241a05] shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
        aria-hidden
      >
        HIT 0!
      </span>
      <span
        className="absolute bottom-1.5 right-2 z-10 rounded-md border border-[#cdd9ff] bg-sapphire px-1.5 py-0.5 text-[9px] font-black tracking-wide text-[#0a1128] shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
        aria-hidden
      >
        VIVA O REI!
      </span>

      {/* multidão de braços para cima */}
      <div className="absolute inset-x-2 bottom-1 top-6 flex flex-wrap content-end items-end justify-around gap-x-0.5 overflow-hidden">
        {visible.map((p, i) => (
          <span
            key={i}
            className="leading-none"
            style={{
              fontSize: p.size,
              animation: hyped
                ? `pop-in 0.25s ${i * 0.02}s both, cheer-jump ${p.dur}s ${p.delay}s ease-in-out infinite alternate`
                : `crowd-bob 2.6s ${p.delay * 2}s ease-in-out infinite`,
            }}
            aria-hidden
          >
            {p.tone}
          </span>
        ))}
      </div>

      {/* brilho de festa no chão */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-9 bg-gradient-to-t from-[rgba(245,197,66,0.16)] to-transparent transition-opacity duration-500 ${
          hyped ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden
      />
    </section>
  );
}
