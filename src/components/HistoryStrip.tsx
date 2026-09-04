import type { HistoryEntry } from "../lib/data";
import { HistoryIcon } from "./icons";

interface HistoryStripProps {
  history: HistoryEntry[];
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryStrip({ history }: HistoryStripProps) {
  const visible = history.slice(0, 6);

  return (
    <section className="w-full px-1">
      <div className="mb-1.5 flex items-center gap-1.5 text-faint">
        <HistoryIcon size={13} strokeWidth={2.4} />
        <span className="text-[11px] font-extrabold uppercase tracking-[1px]">
          Últimos sorteios
        </span>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border-[1.5px] border-dashed border-[#c9d5e4] px-3 py-2 text-center text-xs font-semibold text-faint">
          Gire a roleta para ver os resultados aqui
        </div>
      ) : (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visible.map((entry, i) => (
            <span
              key={`${entry.at}-${i}`}
              title={`${entry.text} — ${formatTime(entry.at)}`}
              className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border py-1 pl-1.5 pr-2.5 text-xs font-bold transition-all duration-200 ${
                i === 0
                  ? "history-latest border-primary/50 bg-white text-ink"
                  : "border-transparent bg-white/70 text-ink-soft opacity-75"
              }`}
              style={
                i === 0
                  ? { boxShadow: `0 3px 10px ${entry.color}55, 0 0 0 2px #ffffff` }
                  : undefined
              }
            >
              <span
                className="grid h-5 w-5 place-items-center rounded-full text-[11px]"
                style={{ background: `${entry.color}30` }}
                aria-hidden
              >
                {entry.icon}
              </span>
              {entry.text}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
