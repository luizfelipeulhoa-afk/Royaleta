import type { WheelOption } from "../lib/data";
import { MIN_OPTIONS } from "../lib/data";
import { BoltIcon, XIcon } from "./icons";

interface WinnerModalProps {
  open: boolean;
  winner: WheelOption | null;
  optionsCount: number;
  autoMode: boolean;
  onSpinAgain: () => void;
  onRemoveWinner: () => void;
  onClose: () => void;
}

export default function WinnerModal({
  open,
  winner,
  optionsCount,
  autoMode,
  onSpinAgain,
  onRemoveWinner,
  onClose,
}: WinnerModalProps) {
  const canRemove = optionsCount > MIN_OPTIONS;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(30,41,59,0.55)] p-5 backdrop-blur-[6px] transition-opacity duration-250 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Resultado do sorteio"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-[350px] rounded-[34px] bg-white px-6 pb-6 pt-8 text-center shadow-[0_24px_50px_rgba(0,0,0,0.25)] transition-transform duration-300 ${
          open ? "scale-100" : "scale-[0.82]"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}
      >
        {winner && (
          <>
            <div
              key={winner.text + String(open)}
              className={`mx-auto mb-3 grid h-24 w-24 place-items-center rounded-full border-4 text-5xl ${
                open ? "animate-pop" : ""
              }`}
              style={{
                background: `${winner.color}22`,
                borderColor: winner.color,
                boxShadow: `0 10px 24px ${winner.color}44`,
              }}
            >
              <span aria-hidden>{winner.icon}</span>
            </div>

            <p className="font-display text-[13px] font-semibold uppercase tracking-[1.5px] text-mist">
              Opção sorteada
            </p>
            <p className="font-display mt-1 break-words text-[30px] font-bold leading-tight text-ink">
              {winner.text}
            </p>

            {autoMode && (
              <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-faint">
                Girando de novo em instantes…
              </p>
            )}

            <div className="mt-5 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={onSpinAgain}
                className="flex h-[46px] items-center justify-center gap-2 rounded-3xl bg-primary font-display text-base font-bold uppercase tracking-wide text-white shadow-[0_6px_14px_rgba(37,164,128,0.4)] transition-all duration-150 hover:bg-primary-deep active:translate-y-0.5"
              >
                <BoltIcon size={17} />
                Girar novamente
              </button>

              <button
                type="button"
                onClick={onRemoveWinner}
                disabled={!canRemove}
                title={canRemove ? "Remover esta opção" : "Mínimo de 2 opções na roleta"}
                className="flex h-[42px] items-center justify-center gap-1.5 rounded-3xl bg-[#f1f5f9] font-display text-[13px] font-semibold text-ink-soft transition-all duration-150 hover:bg-[#e8edf4] active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <XIcon size={13} strokeWidth={2.6} />
                Remover esta opção da roleta
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
