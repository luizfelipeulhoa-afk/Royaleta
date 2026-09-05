import { useEffect, useRef, useState } from "react";
import type { CheerOption } from "../lib/cheer";
import { isFullOut, MAX_OPTIONS, MIN_OPTIONS } from "../lib/cheer";
import { CopyIcon, CrownIcon, PlusIcon, XIcon } from "./icons";

interface DecreesPanelProps {
  options: CheerOption[];
  disabled: boolean;
  onAdd: (text: string) => void;
  onRemove: (index: number) => void;
  onDuplicate: (index: number) => boolean;
}

/** Decretos de Treino: proclamação de novas rotinas + tags da corte. */
export default function DecreesPanel({
  options,
  disabled,
  onAdd,
  onRemove,
  onDuplicate,
}: DecreesPanelProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const errorTimer = useRef(0);

  useEffect(() => () => window.clearTimeout(errorTimer.current), []);

  const showError = (msg: string) => {
    setError(msg);
    window.clearTimeout(errorTimer.current);
    errorTimer.current = window.setTimeout(() => setError(null), 2400);
  };

  const submit = () => {
    const text = value.trim();
    if (!text) return;
    if (options.length >= MAX_OPTIONS) {
      showError(`Limite de ${MAX_OPTIONS} decretos no reinado`);
      return;
    }
    onAdd(text);
    setValue("");
    inputRef.current?.focus();
  };

  return (
    <section className="glass rise-in rounded-3xl p-4" style={{ animationDelay: "0.12s" }}>
      <header className="mb-3 flex items-center justify-between">
        <h2 className="font-display flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[1.5px] text-fog">
          <span className="text-gold">
            <CrownIcon size={14} strokeWidth={2.4} />
          </span>
          Decretos de Treino
        </h2>
        <span className="font-num rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-bold tabular-nums text-fog">
          {options.length}/{MAX_OPTIONS}
        </span>
      </header>

      <div className="mb-2.5 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          maxLength={25}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="Proclamar nova rotina..."
          aria-label="Nova rotina"
          className="h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-[rgba(5,7,17,0.6)] px-3.5 text-[13px] font-semibold text-white outline-none transition-all duration-150 placeholder:text-white/30 focus:border-gold/70 focus:shadow-[0_0_0_3px_rgba(245,158,11,0.15)] disabled:opacity-60"
        />
        <button
          type="button"
          onClick={submit}
          disabled={disabled}
          aria-label="Adicionar rotina"
          title="Adicionar rotina"
          className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-xl bg-gradient-to-b from-goldlight via-gold to-golddark text-[#1a1204] shadow-[0_6px_16px_rgba(245,158,11,0.4),inset_0_1px_0_rgba(255,255,255,0.5)] transition-all duration-150 hover:brightness-110 active:scale-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PlusIcon size={20} strokeWidth={2.8} />
        </button>
      </div>

      {error && (
        <p className="mb-2 text-[11px] font-bold text-[#fb7185]" role="alert">
          {error}
        </p>
      )}

      <div className="pills-scroll flex max-h-[190px] flex-wrap content-start gap-1.5 overflow-y-auto pr-1">
        {options.map((opt, idx) => {
          const fo = isFullOut(opt.text);
          return (
            <div
              key={`${opt.text}-${idx}`}
              className={`animate-pop inline-flex items-center gap-1.5 whitespace-nowrap rounded-full py-1.5 pl-2.5 pr-1.5 text-xs font-bold transition-all duration-200 ${
                fo
                  ? "border border-gold bg-gradient-to-r from-[#3d2f07] to-[#8a6d0b] text-goldlight shadow-[0_0_12px_rgba(245,158,11,0.45)]"
                  : "border border-white/10 bg-white/[0.05] text-white/85 hover:border-white/25"
              }`}
            >
              <span aria-hidden>👑</span>
              <span>{opt.text}</span>
              <button
                type="button"
                onClick={() => {
                  if (!onDuplicate(idx)) showError(`Limite de ${MAX_OPTIONS} decretos no reinado`);
                }}
                disabled={disabled}
                aria-label={`Duplicar ${opt.text}`}
                title="Duplicar"
                className={`grid h-[18px] w-[18px] shrink-0 cursor-pointer place-items-center rounded-full transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
                  fo
                    ? "bg-black/30 text-[#ffe9a8] hover:bg-goldlight hover:text-[#241a05]"
                    : "bg-white/10 text-white/70 hover:bg-goldlight hover:text-[#241a05]"
                }`}
              >
                <CopyIcon size={10} strokeWidth={2.4} />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (options.length <= MIN_OPTIONS) {
                    showError("A roleta precisa de pelo menos 2 decretos!");
                    return;
                  }
                  onRemove(idx);
                }}
                disabled={disabled}
                aria-label={`Remover ${opt.text}`}
                title="Remover"
                className={`grid h-[18px] w-[18px] shrink-0 cursor-pointer place-items-center rounded-full transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
                  fo
                    ? "bg-black/30 text-[#ffe9a8] hover:bg-[#e11d48] hover:text-white"
                    : "bg-white/10 text-white/70 hover:bg-[#e11d48] hover:text-white"
                }`}
              >
                <XIcon size={10} strokeWidth={2.8} />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
