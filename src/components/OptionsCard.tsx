import { useEffect, useRef, useState } from "react";
import type { CheerOption } from "../lib/cheer";
import { isFullOut, MAX_OPTIONS, MIN_OPTIONS } from "../lib/cheer";
import { CopyIcon, CrownIcon, PlusIcon, XIcon } from "./icons";

interface OptionsCardProps {
  options: CheerOption[];
  disabled: boolean;
  onAdd: (text: string) => void;
  onRemove: (index: number) => void;
  onDuplicate: (index: number) => boolean;
}

/** Card de rotinas da corte: input + brasões (chips) duplicáveis e removíveis. */
export default function OptionsCard({ options, disabled, onAdd, onRemove, onDuplicate }: OptionsCardProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
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
      showError(`Limite de ${MAX_OPTIONS} rotinas no reinado`);
      return;
    }
    onAdd(text);
    setValue("");
    inputRef.current?.focus();
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
  }, [options.length]);

  return (
    <section className="w-full rounded-[22px] border border-[rgba(245,197,66,0.16)] bg-white/5 px-3.5 py-3">
      <div className="font-display mb-2 flex items-center justify-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[1px] text-fog">
        <CrownIcon size={13} strokeWidth={2.4} />
        Decretos de treino
      </div>

      <div className="mb-1.5 flex gap-2">
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
          className="h-10 min-w-0 flex-1 rounded-xl border border-white/15 bg-[rgba(10,17,40,0.75)] px-3 text-[13px] font-semibold text-white outline-none transition-colors duration-150 placeholder:text-white/35 focus:border-gold disabled:opacity-60"
        />
        <button
          type="button"
          onClick={submit}
          disabled={disabled}
          aria-label="Adicionar rotina"
          title="Adicionar rotina"
          className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl bg-gradient-to-br from-[#f9d976] to-[#b8860b] text-[#101d42] shadow-[0_4px_12px_rgba(245,197,66,0.4)] transition-all duration-150 hover:brightness-110 active:scale-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <PlusIcon size={18} strokeWidth={2.8} />
        </button>
      </div>

      {error && (
        <p className="mb-1 text-[11px] font-bold text-[#ff6b81]" role="alert">
          {error}
        </p>
      )}

      <div ref={scrollRef} className="pills-scroll flex gap-1.5 overflow-x-auto py-0.5">
        {options.map((opt, idx) => {
          const fo = isFullOut(opt.text);
          return (
            <div
              key={`${opt.text}-${idx}`}
              className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-2xl border px-2.5 py-1.5 text-xs font-bold text-white transition-all duration-200 ${
                fo
                  ? "border-gold/80 bg-gradient-to-r from-[#3d2f07] to-[#8a6d0b] shadow-[0_0_10px_rgba(245,197,66,0.5)]"
                  : "border-[rgba(245,197,66,0.2)] bg-[rgba(13,27,61,0.9)]"
              }`}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: opt.color, boxShadow: `0 0 6px ${opt.color}` }}
              />
              <span aria-hidden>{opt.icon}</span>
              <span>{opt.text}</span>
              <button
                type="button"
                onClick={() => {
                  if (!onDuplicate(idx)) showError(`Limite de ${MAX_OPTIONS} rotinas no reinado`);
                }}
                disabled={disabled}
                aria-label={`Duplicar ${opt.text}`}
                title="Duplicar"
                className={`grid h-4 w-4 shrink-0 cursor-pointer place-items-center rounded-full transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
                  fo ? "bg-black/30 text-[#ffe9a8] hover:bg-gold hover:text-[#241a05]" : "bg-white/15 hover:bg-gold hover:text-[#241a05]"
                }`}
              >
                <CopyIcon size={9} strokeWidth={2.6} />
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
                className={`grid h-4 w-4 shrink-0 cursor-pointer place-items-center rounded-full transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
                  fo ? "bg-black/30 text-white hover:bg-[#c0392b]" : "bg-white/15 hover:bg-[#c0392b]"
                }`}
              >
                <XIcon size={9} strokeWidth={3.2} />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
