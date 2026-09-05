import type { DrawRecord } from "../lib/cheer";
import { CrownIcon, HistoryIcon } from "./icons";

interface HistoryListProps {
  history: DrawRecord[];
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Pergaminho de decretos: últimos 5 sorteios com horário. */
export default function HistoryList({ history }: HistoryListProps) {
  const visible = history.slice(0, 5);

  return (
    <section className="glass rise-in rounded-3xl p-4" style={{ animationDelay: "0.2s" }}>
      <h2 className="font-display mb-3 flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[1.5px] text-fog">
        <span className="text-cyanx">
          <HistoryIcon size={14} strokeWidth={2.4} />
        </span>
        Últimos Decretos
      </h2>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 px-3 py-5 text-center text-xs font-semibold text-white/30">
          Gire a roleta para registrar
          <br />
          os decretos da corte
        </div>
      ) : (
        <ul className="space-y-1.5">
          {visible.map((r, i) => (
            <li
              key={`${r.at}-${i}`}
              title={r.text}
              className={`flex items-center gap-2.5 rounded-xl border px-2.5 py-2 transition-all duration-200 ${
                i === 0
                  ? r.fullOut
                    ? "history-latest border-gold/60 bg-gold/10"
                    : "history-latest border-sky/50 bg-royal/15"
                  : "border-white/5 bg-white/[0.03] opacity-70"
              }`}
            >
              <span className="font-num w-10 shrink-0 text-[10px] font-bold tabular-nums text-fog">
                {formatTime(r.at)}
              </span>
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: r.color, boxShadow: `0 0 6px ${r.color}` }}
                aria-hidden
              />
              <span aria-hidden className="text-sm leading-none">👑</span>
              <span
                className={`min-w-0 flex-1 truncate text-xs font-bold ${
                  r.fullOut && i === 0 ? "text-goldlight" : "text-white/85"
                }`}
              >
                {r.text}
              </span>
              {r.fullOut && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-gold/50 bg-gold/15 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-goldlight">
                  <CrownIcon size={9} strokeWidth={2.8} />
                  Full Out
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
