import { useEffect, useRef, useState } from "react";
import Wheel from "./components/Wheel";
import type { WheelHandle } from "./components/Wheel";
import ConfettiLayer from "./components/ConfettiLayer";
import type { ConfettiHandle } from "./components/ConfettiLayer";
import OptionsCard from "./components/OptionsCard";
import HistoryStrip from "./components/HistoryStrip";
import WinnerModal from "./components/WinnerModal";
import {
  BoltIcon,
  DiceIcon,
  HandIcon,
  ResetIcon,
  SoundOffIcon,
  SoundOnIcon,
  SparkleIcon,
} from "./components/icons";
import { DEFAULT_OPTIONS, MAX_OPTIONS, guessEmoji, nextColor } from "./lib/data";
import type { HistoryEntry, WheelOption } from "./lib/data";
import { initAudio, playBlip, playWin, setSoundEnabled } from "./lib/audio";

const LS_OPTIONS = "roleta_options";
const LS_HISTORY = "roleta_history";

function loadOptions(): WheelOption[] {
  try {
    const raw = localStorage.getItem(LS_OPTIONS);
    if (raw) {
      const parsed = JSON.parse(raw) as WheelOption[];
      if (
        Array.isArray(parsed) &&
        parsed.length >= 2 &&
        parsed.every(
          (o) =>
            o &&
            typeof o.text === "string" &&
            typeof o.icon === "string" &&
            typeof o.color === "string",
        )
      ) {
        return parsed.slice(0, MAX_OPTIONS);
      }
    }
  } catch {
    /* dados corrompidos — usa padrão */
  }
  return DEFAULT_OPTIONS.map((o) => ({ ...o }));
}

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(LS_HISTORY);
    if (raw) {
      const parsed = JSON.parse(raw) as HistoryEntry[];
      if (Array.isArray(parsed)) return parsed.slice(0, 12);
    }
  } catch {
    /* ignora */
  }
  return [];
}

export default function App() {
  const [options, setOptions] = useState<WheelOption[]>(loadOptions);
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const [isSpinning, setIsSpinning] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [winner, setWinner] = useState<WheelOption | null>(null);
  const [modalShown, setModalShown] = useState(false);
  const [lastWinnerIndex, setLastWinnerIndex] = useState(-1);

  const wheelRef = useRef<WheelHandle>(null);
  const confettiRef = useRef<ConfettiHandle>(null);
  const autoTimersRef = useRef<number[]>([]);
  const autoModeRef = useRef(autoMode);

  useEffect(() => {
    autoModeRef.current = autoMode;
  }, [autoMode]);

  /* persistência */
  useEffect(() => {
    try {
      localStorage.setItem(LS_OPTIONS, JSON.stringify(options));
    } catch {
      /* sem armazenamento */
    }
  }, [options]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_HISTORY, JSON.stringify(history));
    } catch {
      /* sem armazenamento */
    }
  }, [history]);

  const clearAutoTimers = () => {
    autoTimersRef.current.forEach((t) => window.clearTimeout(t));
    autoTimersRef.current = [];
  };

  useEffect(() => clearAutoTimers, []);

  /* ---------- ações ---------- */

  const openWinnerModal = (drawn: WheelOption) => {
    setWinner(drawn);
    window.setTimeout(() => setModalShown(true), 30);
  };

  const closeWinnerModal = () => {
    setModalShown(false);
    window.setTimeout(() => setWinner(null), 230);
  };

  const requestSpin = () => {
    clearAutoTimers();
    wheelRef.current?.spin();
  };

  const handleSpinStart = () => setIsSpinning(true);

  const handleSpinEnd = (index: number) => {
    const drawn = options[index];
    if (!drawn) {
      setIsSpinning(false);
      return;
    }

    setIsSpinning(false);
    setLastWinnerIndex(index);
    setHistory((h) =>
      [
        { text: drawn.text, icon: drawn.icon, color: drawn.color, at: Date.now() },
        ...h,
      ].slice(0, 12),
    );

    playWin();
    confettiRef.current?.launch();
    if ("vibrate" in navigator) navigator.vibrate([100, 50, 150]);
    openWinnerModal(drawn);

    if (autoModeRef.current) {
      autoTimersRef.current.push(
        window.setTimeout(() => {
          setModalShown(false);
          autoTimersRef.current.push(
            window.setTimeout(() => {
              setWinner(null);
              autoTimersRef.current.push(
                window.setTimeout(() => wheelRef.current?.spin(), 900),
              );
            }, 240),
          );
        }, 3000),
      );
    }
  };

  const handleAdd = (text: string) => {
    setOptions((opts) => {
      if (opts.length >= MAX_OPTIONS) return opts;
      return [...opts, { text, icon: guessEmoji(text), color: nextColor(opts.length) }];
    });
    playBlip();
  };

  const handleRemove = (index: number) => {
    setOptions((opts) => (opts.length > 2 ? opts.filter((_, i) => i !== index) : opts));
  };

  const handleSpinAgain = () => {
    clearAutoTimers();
    closeWinnerModal();
    window.setTimeout(() => wheelRef.current?.spin(), 320);
  };

  const handleRemoveWinner = () => {
    clearAutoTimers();
    closeWinnerModal();
    if (lastWinnerIndex >= 0 && options.length > 2) {
      setOptions((opts) => opts.filter((_, i) => i !== lastWinnerIndex));
    }
  };

  const handleCloseModal = () => {
    clearAutoTimers();
    closeWinnerModal();
  };

  const toggleAutoMode = () => {
    initAudio();
    const next = !autoMode;
    setAutoMode(next);
    if (!next) {
      clearAutoTimers();
      return;
    }
    playBlip();
    if (winner && modalShown) {
      /* modal aberto: retoma o loop automático */
      autoTimersRef.current.push(window.setTimeout(handleSpinAgain, 1200));
    } else if (!winner && !isSpinning) {
      window.setTimeout(() => wheelRef.current?.spin(), 250);
    }
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playBlip();
  };

  const handleReset = () => {
    if (!window.confirm("Restaurar as opções padrão da roleta?")) return;
    clearAutoTimers();
    setAutoMode(false);
    setModalShown(false);
    setWinner(null);
    setOptions(DEFAULT_OPTIONS.map((o) => ({ ...o })));
    setHistory([]);
    playBlip();
  };

  /* ---------- render ---------- */

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-3 py-6">
      {/* fundo ambiente */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="ambient-orb left-[4%] top-[6%] h-56 w-56 bg-primary" />
        <div
          className="ambient-orb left-[10%] bottom-[10%] h-48 w-48 bg-[#fbbf24]"
          style={{ animationDelay: "-7s" }}
        />
        <div
          className="ambient-orb right-[6%] top-[16%] h-52 w-52 bg-[#38bdf8]"
          style={{ animationDelay: "-13s" }}
        />
        <div
          className="ambient-orb right-[12%] bottom-[8%] h-44 w-44 bg-[#f472b6]"
          style={{ animationDelay: "-19s" }}
        />
        <span className="animate-sparkle absolute left-[16%] top-[22%] text-primary/40">
          <SparkleIcon size={22} />
        </span>
        <span
          className="animate-sparkle absolute right-[18%] top-[38%] text-[#fbbf24]/50"
          style={{ animationDelay: "-3s" }}
        >
          <SparkleIcon size={16} />
        </span>
        <span
          className="animate-sparkle absolute left-[22%] bottom-[18%] text-[#38bdf8]/40"
          style={{ animationDelay: "-6s" }}
        >
          <SparkleIcon size={18} />
        </span>
      </div>

      <ConfettiLayer ref={confettiRef} />

      <div className="rise-in relative flex w-full max-w-[440px] flex-col items-center rounded-[46px] border-8 border-white bg-paper/95 px-5 pb-7 pt-6 shadow-[20px_24px_50px_rgba(166,180,200,0.45),-16px_-16px_40px_rgba(255,255,255,0.9)]">
        {/* barra superior */}
        <div className="mb-2 flex w-full items-center justify-between px-1">
          <button
            type="button"
            onClick={toggleSound}
            title={soundOn ? "Desativar som" : "Ativar som"}
            aria-pressed={soundOn}
            className="grid h-10 w-10 place-items-center rounded-full border border-white bg-[#f0f4f9] text-ink-soft shadow-clay transition-all duration-150 hover:-translate-y-0.5 hover:text-ink active:scale-90 active:shadow-clay-inset"
          >
            {soundOn ? <SoundOnIcon size={17} /> : <SoundOffIcon size={17} />}
          </button>

          <div className="flex items-center gap-1.5 text-faint">
            <DiceIcon size={15} strokeWidth={2} />
            <span className="text-[11px] font-extrabold uppercase tracking-[1.2px]">
              Roleta interativa
            </span>
          </div>

          <button
            type="button"
            onClick={handleReset}
            title="Restaurar opções padrão"
            className="grid h-10 w-10 place-items-center rounded-full border border-white bg-[#f0f4f9] text-ink-soft shadow-clay transition-all duration-150 hover:-translate-y-0.5 hover:text-ink active:scale-90 active:shadow-clay-inset"
          >
            <ResetIcon size={16} />
          </button>
        </div>

        {/* cabeçalho */}
        <header className="rise-in mb-1.5 text-center" style={{ animationDelay: "70ms" }}>
          <h1 className="font-display text-[27px] font-bold leading-[1.05] tracking-[0.8px] text-[#2b3950]">
            ROLETA 3D
          </h1>
          <p className="font-display text-[17px] font-semibold uppercase tracking-[2px] text-ink-soft/90">
            Personalizada
          </p>
        </header>

        {/* roleta */}
        <div className="rise-in" style={{ animationDelay: "140ms" }}>
          <Wheel
            ref={wheelRef}
            options={options}
            onSpinStart={handleSpinStart}
            onSpinEnd={handleSpinEnd}
          />
        </div>

        {/* histórico */}
        <div className="rise-in mb-3 mt-2 w-full" style={{ animationDelay: "210ms" }}>
          <HistoryStrip history={history} />
        </div>

        {/* editor de opções */}
        <div className="rise-in mb-4 w-full" style={{ animationDelay: "280ms" }}>
          <OptionsCard
            options={options}
            disabled={isSpinning}
            onAdd={handleAdd}
            onRemove={handleRemove}
          />
        </div>

        {/* ações */}
        <div className="rise-in flex w-full gap-3" style={{ animationDelay: "350ms" }}>
          <button
            type="button"
            onClick={requestSpin}
            disabled={isSpinning}
            className="flex h-[52px] flex-[1.3] items-center justify-center gap-2 rounded-[28px] bg-gradient-to-b from-primary-bright to-primary-deep font-display text-lg font-bold uppercase tracking-wide text-white shadow-[0_8px_18px_rgba(37,164,128,0.42),inset_0_2px_0_rgba(255,255,255,0.4)] transition-all duration-150 hover:brightness-105 active:translate-y-0.5 active:shadow-[0_4px_8px_rgba(37,164,128,0.35)] disabled:cursor-not-allowed disabled:opacity-65"
          >
            <BoltIcon size={19} />
            {isSpinning ? "Girando…" : "Girar agora"}
          </button>

          <button
            type="button"
            onClick={toggleAutoMode}
            aria-pressed={autoMode}
            className={`flex h-[52px] flex-1 flex-col items-center justify-center rounded-[28px] font-display text-sm font-bold uppercase leading-[1.15] transition-all duration-200 ${
              autoMode
                ? "bg-ink text-white shadow-[0_8px_16px_rgba(43,57,80,0.35),inset_0_2px_0_rgba(255,255,255,0.12)]"
                : "border border-[#dce6f2] bg-white text-ink shadow-clay hover:-translate-y-0.5 active:translate-y-0.5"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  autoMode ? "animate-blink bg-primary-bright" : "bg-line"
                }`}
              />
              Modo
            </span>
            <span className="text-[11px] opacity-80">Automático</span>
          </button>
        </div>

        {/* dica */}
        <p
          className="rise-in mt-4 flex items-center gap-1.5 text-[11px] font-bold text-faint"
          style={{ animationDelay: "420ms" }}
        >
          <HandIcon size={14} strokeWidth={2} />
          Toque na roleta para girar · mínimo de 2 opções
        </p>
      </div>

      <WinnerModal
        open={modalShown}
        winner={winner}
        optionsCount={options.length}
        autoMode={autoMode}
        onSpinAgain={handleSpinAgain}
        onRemoveWinner={handleRemoveWinner}
        onClose={handleCloseModal}
      />
    </main>
  );
}
