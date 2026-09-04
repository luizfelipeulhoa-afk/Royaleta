import { useEffect, useRef, useState } from "react";
import type { WheelOption } from "../lib/data";
import { MAX_OPTIONS, MIN_OPTIONS } from "../lib/data";
import { PlusIcon, XIcon } from "./icons";

interface OptionsCardProps {
  options: WheelOption[];
  disabled: boolean;
  onAdd: (text: string) => void;
  onRemove: (index: number) => void;
}

export default function OptionsCard({ options, disabled, onAdd, onRemove }: OptionsCardProps) {
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(options.length);

  /* rola até a última opção quando uma nova é adicionada */
  useEffect(() => {
    if (options.length > prevCount.current && scrollRef.current) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({
          left: scrollRef.current.scrollWidth,
          behavior: "smooth",
        });
      });
    }
    prevCount.current = options.length;
  }, [options.length]);

  const atLimit = options.length >= MAX_OPTIONS;

  const submit = () => {
    const value = text.trim();
    if (!value || atLimit) return;
    onAdd(value);
    setText("");
  };

  return (
    <section className="w-full rounded-3xl border border-[#ebf1fa] bg-white p-4 shadow-[8px_12px_22px_rgba(180,195,215,0.3),-6px_-6px_14px_#ffffff]">
      <header className="mb-2.5 flex items-center justify-between px-1">
        <h2 className="font-display text-[13px] font-bold uppercase tracking-[0.8px] text-[#314259]">
          Adicionar opções
        </h2>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
            atLimit ? "bg-[#ffe3e3] text-[#d64545]" : "bg-well text-mist"
          }`}
        >
          {options.length}/{MAX_OPTIONS}
        </span>
      </header>

      <div className="mb-2.5 flex items-center gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={disabled || atLimit || text.trim().length === 0}
          title="Adicionar opção"
          className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-[14px] bg-ink text-white shadow-[0_4px_10px_rgba(43,57,80,0.3)] transition-all duration-150 hover:bg-[#35465f] active:scale-90 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <PlusIcon size={20} strokeWidth={2.6} />
        </button>
        <input
          type="text"
          value={text}
          maxLength={25}
          disabled={disabled || atLimit}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder={atLimit ? "Limite de opções atingido" : "Digite uma nova opção..."}
          className="h-[42px] min-w-0 flex-1 rounded-[14px] border-[1.5px] border-line bg-[#f9fbfe] px-3.5 text-sm font-semibold text-ink outline-none transition-all placeholder:font-medium placeholder:text-faint focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(45,179,141,0.15)] disabled:opacity-60"
        />
      </div>

      <div ref={scrollRef} className="pills-scroll flex gap-2 overflow-x-auto px-0.5 pb-1.5 pt-1">
        {options.map((opt, idx) => (
          <span
            key={`${opt.text}-${idx}`}
            className="animate-pop inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-white bg-well py-1.5 pl-3 pr-1.5 text-[13px] font-bold text-[#33435c] shadow-[2px_3px_6px_rgba(180,195,215,0.4),-2px_-2px_4px_#ffffff] transition-transform duration-150 hover:-translate-y-0.5"
          >
            <span className="h-2 w-2 rounded-full" style={{ background: opt.color }} />
            <span aria-hidden>{opt.icon}</span>
            <span>{opt.text}</span>
            <button
              type="button"
              title="Remover"
              disabled={disabled || options.length <= MIN_OPTIONS}
              onClick={() => onRemove(idx)}
              className="grid h-[18px] w-[18px] place-items-center rounded-full bg-[rgba(43,57,80,0.12)] text-ink transition-colors duration-150 hover:bg-[#ff5252] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[rgba(43,57,80,0.12)] disabled:hover:text-ink"
            >
              <XIcon size={10} strokeWidth={3} />
            </button>
          </span>
        ))}
      </div>
    </section>
  );
}
