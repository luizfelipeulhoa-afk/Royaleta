import type { ArenaStats, DrawRecord } from "../lib/cheer";
import { CrownIcon, HistoryIcon, TrophyIcon } from "./icons";

interface ScoreboardProps {
  history: DrawRecord[];
  stats: ArenaStats;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Placar da corte: estatísticas do reinado + últimos decretos. */
export default function Scoreboard({ history, stats }: ScoreboardProps) {
  const visible = history.slice(0, 6);

  return (
    <section className="w-full px-1">
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-white/40">
          <HistoryIcon size={13} strokeWidth={2.6} />
          <span className="font-display text-[11px] font-extrabold uppercase tracking-[1px]">
            Placar da corte
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide text-fog">
            GIROS <span className="text-sapphire">{stats.spins}</span>
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide transition-all duration-300 ${
              stats.fullOuts > 0
                ? "border-gold/60 bg-gold/10 text-gold shadow-[0_0_10px_rgba(245,197,66,0.35)]"
                : "border-white/10 bg-white/5 text-fog"
            }`}
          >
            <TrophyIcon size={11} strokeWidth={2.6} />
            FULL OUTS <span>{stats.fullOuts}</span>
          </span>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border-[1.5px] border-dashed border-[rgba(245,197,66,0.2)] px-3 py-2 text-center text-xs font-semibold text-white/35">
          Gire a roleta para registrar os decretos reais
        </div>
      ) : (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visible.map((r, i) => (
            <span
              key={`${r.at}-${i}`}
              title={`${r.text} — ${formatTime(r.at)}`}
              className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border py-1 pl-2 pr-2.5 text-xs font-bold transition-all duration-200 ${
                i === 0
                  ? r.fullOut
                    ? "history-latest border-gold bg-gold/15 text-gold"
                    : "history-latest border-sapphire/70 bg-[rgba(30,58,138,0.3)] text-[#bcd0ff]"
                  : "border-white/10 bg-white/5 text-white/70 opacity-75"
              }`}
              style={
                i === 0 && !r.fullOut
                  ? { boxShadow: `0 3px 12px ${r.color}55` }
                  : undefined
              }
            >
              <span aria-hidden>{r.icon}</span>
              {r.text}
              {r.fullOut && <CrownIcon size={11} strokeWidth={2.8} />}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
