import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { CrownIcon, MegaphoneIcon, ShieldIcon } from "./icons";

interface Reaction {
  name: string;
  role: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  grad: string;
  glow: string;
  quotes: string[];
}

const REACTIONS: Reaction[] = [
  {
    name: "Rei Aurelio",
    role: "Coroa da Arena",
    icon: CrownIcon,
    grad: "linear-gradient(135deg, #fde047, #b45309)",
    glow: "rgba(245, 158, 11, 0.4)",
    quotes: ["HIT 0 OU NADA!", "A COROA PESA, MAS BRILHA!", "EXECUÇÃO IMPECÁVEL!"],
  },
  {
    name: "Base Real",
    role: "Fundação do Stunt",
    icon: ShieldIcon,
    grad: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    glow: "rgba(59, 130, 246, 0.4)",
    quotes: ["SEGURA NO TOPO!", "BASE FORTE, VOO ALTO!", "NÃO SOLTA, NUNCA!"],
  },
  {
    name: "Torcida",
    role: "Voz do Castelo",
    icon: MegaphoneIcon,
    grad: "linear-gradient(135deg, #06b6d4, #0e7490)",
    glow: "rgba(6, 182, 212, 0.4)",
    quotes: ["LET'S GO ROYAL!", "MAIS ALTO, CORTE!", "O CASTELO TREME!"],
  },
];

interface CourtReactionsProps {
  hyped: boolean;
}

/** Balões da corte: avatares SVG + gritos que trocam durante o giro. */
export default function CourtReactions({ hyped }: CourtReactionsProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!hyped) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 850);
    return () => window.clearInterval(id);
  }, [hyped]);

  return (
    <section className="glass rise-in rounded-3xl p-4" style={{ animationDelay: "0.16s" }}>
      <h2 className="font-display mb-3 text-[12px] font-extrabold uppercase tracking-[1.5px] text-fog">
        A Corte Aclama
      </h2>

      <div className="space-y-2.5">
        {REACTIONS.map((r, i) => {
          const AvatarIcon = r.icon;
          const quote = r.quotes[hyped ? (tick + i) % r.quotes.length : 0];
          return (
            <div
              key={r.name}
              className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-2.5 transition-all duration-300"
              style={hyped ? { boxShadow: `0 0 18px ${r.glow}`, borderColor: "rgba(255,255,255,0.12)" } : undefined}
            >
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#050711] shadow-[0_4px_10px_rgba(0,0,0,0.4)] transition-transform duration-300 ${
                  hyped ? "scale-110" : ""
                }`}
                style={{ background: r.grad }}
                aria-hidden
              >
                <AvatarIcon size={18} strokeWidth={2.4} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="flex items-baseline gap-1.5">
                  <span className="font-num text-[11px] font-bold uppercase tracking-wide text-white/85">
                    {r.name}
                  </span>
                  <span className="truncate text-[9px] font-semibold uppercase tracking-wider text-white/35">
                    {r.role}
                  </span>
                </p>
                <p
                  key={`${tick}-${i}`}
                  className="animate-quote font-display truncate text-[13px] font-extrabold tracking-wide text-goldlight"
                  style={i === 2 ? { color: "#67e8f9" } : i === 1 ? { color: "#93c5fd" } : undefined}
                >
                  “{quote}”
                </p>
              </div>

              {hyped && (
                <span
                  className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full"
                  style={{ background: "#fde047", boxShadow: "0 0 8px #fde047" }}
                  aria-hidden
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
