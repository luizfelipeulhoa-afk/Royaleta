import type { CheerOption } from "../lib/cheer";
import { isFullOut } from "../lib/cheer";
import CoachSvg from "./CoachSvg";
import { BoltIcon, TrophyIcon } from "./icons";

interface ArenaModalProps {
  open: boolean;
  winner: CheerOption | null;
  autoMode: boolean;
  onSpinAgain: () => void;
  onClose: () => void;
}

/** Modal de resultado: versão padrão e versão especial de FULL OUT. */
export default function ArenaModal({
  open,
  winner,
  autoMode,
  onSpinAgain,
  onClose,
}: ArenaModalProps) {
  const fullOut = !!winner && isFullOut(winner.text);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(5,7,15,0.82)] p-4 backdrop-blur-[8px] transition-opacity duration-300 ${
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
            ? "border-gold bg-[radial-gradient(circle_at_50%_20%,#2e1d05_0%,#151c2e_80%)] shadow-[0_0_50px_rgba(255,199,44,0.6),0_25px_70px_rgba(0,0,0,0.9)]"
            : "border-white/15 bg-panel shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}
      >
        {winner && !fullOut && (
          <div>
            <div
              key={winner.text + String(open)}
              className={`mx-auto grid h-24 w-24 place-items-center rounded-full border-4 bg-white/5 text-5xl ${
                open ? "animate-pop" : ""
              }`}
              style={{
                borderColor: winner.color,
                boxShadow: `0 0 30px ${winner.color}66`,
              }}
              aria-hidden
            >
              {winner.icon}
            </div>

            <p className="mt-3 text-[13px] font-extrabold uppercase tracking-[1px] text-neon">
              Sorteado para o treino
            </p>
            <p className="font-display mt-1 break-words text-[26px] font-black leading-tight text-white">
              {winner.text}
            </p>

            {autoMode && (
              <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-white/40">
                Próxima rotina em instantes…
              </p>
            )}

            <button
              type="button"
              onClick={onSpinAgain}
              className="font-display mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-br from-gold to-[#ff9900] text-[15px] font-black uppercase tracking-wide text-[#10141f] shadow-[0_6px_20px_rgba(255,199,44,0.4)] transition-all duration-150 hover:brightness-110 active:scale-[0.97]"
            >
              <BoltIcon size={17} strokeWidth={2.8} />
              Girar novamente
            </button>
          </div>
        )}

        {winner && fullOut && (
          <div>
            <p className="font-display text-[28px] font-black leading-tight tracking-wide text-[#ffd700] [text-shadow:0_0_15px_#ffaa00,0_0_30px_#ffea00]">
              🔥 FULL OUT! 🔥
            </p>
            <p className="font-display mx-auto mt-1.5 inline-block rounded-xl bg-neon px-3 py-1 text-[13px] font-black text-night shadow-[0_0_12px_rgba(0,240,255,0.6)]">
              HIT ZERO! EXECUÇÃO PERFEITA!
            </p>

            <div className={`relative mx-auto my-1 h-[170px] w-[170px] ${open ? "animate-coach" : ""}`}>
              <CoachSvg />
            </div>

            <p className="text-sm font-bold text-[#e2e8f0]">
              “O treinador tá maluco de felicidade! Bora cravar esse full out!”
            </p>

            {autoMode && (
              <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-white/40">
                Próxima rotina em instantes…
              </p>
            )}

            <button
              type="button"
              onClick={onSpinAgain}
              className="font-display mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-br from-gold to-[#ff9900] text-[15px] font-black uppercase tracking-wide text-[#10141f] shadow-[0_6px_20px_rgba(255,199,44,0.4)] transition-all duration-150 hover:brightness-110 active:scale-[0.97]"
            >
              <TrophyIcon size={17} strokeWidth={2.6} />
              Bora pra mais uma!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
