import type { CheerOption } from "../lib/cheer";
import { isFullOut } from "../lib/cheer";
import KingSvg from "./KingSvg";
import { BoltIcon, CrownIcon, SparklesIcon } from "./icons";

interface ArenaModalProps {
  open: boolean;
  winner: CheerOption | null;
  onSpinAgain: () => void;
  onClose: () => void;
}

/** Decreto real: resultado comum e a celebração máxima do FULL OUT. */
export default function ArenaModal({
  open,
  winner,
  onSpinAgain,
  onClose,
}: ArenaModalProps) {
  const fullOut = !!winner && isFullOut(winner.text);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(4,6,15,0.82)] p-4 backdrop-blur-[8px] transition-opacity duration-300 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Resultado do sorteio"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-[360px] rounded-[34px] border-2 p-6 text-center transition-transform duration-300 ${
          open ? "scale-100" : "scale-[0.82]"
        } ${
          fullOut
            ? "border-gold bg-[radial-gradient(circle_at_50%_20%,#2c2206_0%,#101b3f_78%)] shadow-[0_0_50px_rgba(245,197,66,0.55),0_25px_70px_rgba(0,0,0,0.9)]"
            : "border-[rgba(245,197,66,0.25)] bg-panel shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}
      >
        {winner && !fullOut && (
          <div>
            <div
              key={winner.text + String(open)}
              className={`mx-auto grid h-24 w-24 place-items-center rounded-full border-4 bg-[rgba(30,58,138,0.25)] text-5xl ${
                open ? "animate-pop" : ""
              }`}
              style={{
                borderColor: winner.color,
                boxShadow: `0 0 30px ${winner.color}66, inset 0 0 18px rgba(245,197,66,0.12)`,
              }}
              aria-hidden
            >
              {winner.icon}
            </div>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-[13px] font-extrabold uppercase tracking-[1.5px] text-gold">
              <SparklesIcon size={14} strokeWidth={2.4} />
              Decreto da corte
            </p>
            <p className="font-display mt-1 break-words text-[26px] font-black leading-tight text-white">
              {winner.text}
            </p>

            <button
              type="button"
              onClick={onSpinAgain}
              className="font-display mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-br from-[#f9d976] via-gold to-[#b8860b] text-[15px] font-black uppercase tracking-wide text-[#101d42] shadow-[0_6px_20px_rgba(245,197,66,0.4)] transition-all duration-150 hover:brightness-110 active:scale-[0.97]"
            >
              <BoltIcon size={17} strokeWidth={2.8} />
              Girar novamente
            </button>
          </div>
        )}

        {winner && fullOut && (
          <div>
            <p className="flex items-center justify-center gap-2 text-gold">
              <SparklesIcon size={16} strokeWidth={2.4} />
              <SparklesIcon size={22} strokeWidth={2.4} />
              <SparklesIcon size={16} strokeWidth={2.4} />
            </p>
            <p className="font-display text-[28px] font-black leading-tight tracking-wide text-[#ffd700] [text-shadow:0_0_15px_#ffaa00,0_0_30px_#ffea00]">
              FULL OUT!
            </p>
            <p className="font-display mx-auto mt-1.5 inline-block rounded-xl bg-gradient-to-r from-[#fde68a] to-gold px-3 py-1 text-[13px] font-black text-[#101d42] shadow-[0_0_12px_rgba(245,197,66,0.6)]">
              HIT ZERO! EXECUÇÃO PERFEITA!
            </p>

            <div className={`relative mx-auto my-1 h-[170px] w-[170px] ${open ? "animate-coach" : ""}`}>
              <KingSvg />
            </div>

            <p className="text-sm font-bold text-[#e2e8f0]">
              “A corte está em êxtase! Bora cravar esse full out!”
            </p>

            <button
              type="button"
              onClick={onSpinAgain}
              className="font-display mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-br from-[#f9d976] via-gold to-[#b8860b] text-[15px] font-black uppercase tracking-wide text-[#101d42] shadow-[0_6px_20px_rgba(245,197,66,0.4)] transition-all duration-150 hover:brightness-110 active:scale-[0.97]"
            >
              <CrownIcon size={17} strokeWidth={2.4} />
              Bora pra mais uma!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
