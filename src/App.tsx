import { useEffect, useRef, useState } from "react";
import ArenaWheel, { type WheelHandle } from "./components/ArenaWheel";
import ConfettiLayer, { type ConfettiHandle } from "./components/ConfettiLayer";
import ArenaModal from "./components/ArenaModal";
import OptionsCard from "./components/OptionsCard";
import Scoreboard from "./components/Scoreboard";
import CrowdSection from "./components/CrowdSection";
import ArenaBackground from "./components/ArenaBackground";
import {
  BoltIcon,
  RepeatIcon,
  RotateCcwIcon,
  TrophyIcon,
  Volume2Icon,
  VolumeXIcon,
} from "./components/icons";
import {
  DEFAULT_CHEER_OPTIONS,
  MAX_OPTIONS,
  guessCheerIcon,
  isFullOut,
  nextCheerColor,
  type ArenaStats,
  type CheerOption,
  type DrawRecord,
} from "./lib/cheer";
import {
  initAudio,
  playBlip,
  playCheerChime,
  playFullOutFanfare,
  setSoundEnabled,
  stopSuspense,
} from "./lib/arenaAudio";

const STORAGE_OPTIONS = "cheer_fullout_options";
const STORAGE_HISTORY = "cheer_fullout_history";
const STORAGE_STATS = "cheer_fullout_stats";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    /* armazenamento indisponível */
  }
  return fallback;
}

export default function App() {
  const [options, setOptions] = useState<CheerOption[]>(() =>
    load(STORAGE_OPTIONS, DEFAULT_CHEER_OPTIONS),
  );
  const [history, setHistory] = useState<DrawRecord[]>(() => load(STORAGE_HISTORY, []));
  const [stats, setStats] = useState<ArenaStats>(() =>
    load(STORAGE_STATS, { spins: 0, fullOuts: 0 }),
  );
  const [isSpinning, setIsSpinning] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [winner, setWinner] = useState<CheerOption | null>(null);
  const [modalShown, setModalShown] = useState(false);

  const wheelRef = useRef<WheelHandle>(null);
  const confettiRef = useRef<ConfettiHandle>(null);
  const autoModeRef = useRef(autoMode);
  const autoTimersRef = useRef<number[]>([]);

  useEffect(() => {
    autoModeRef.current = autoMode;
  }, [autoMode]);

  /* persistência */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_OPTIONS, JSON.stringify(options));
    } catch {
      /* ignore */
    }
  }, [options]);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_HISTORY, JSON.stringify(history));
    } catch {
      /* ignore */
    }
  }, [history]);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_STATS, JSON.stringify(stats));
    } catch {
      /* ignore */
    }
  }, [stats]);

  /* luzes de arena durante o giro */
  useEffect(() => {
    document.body.classList.toggle("in-competition", isSpinning);
    return () => document.body.classList.remove("in-competition");
  }, [isSpinning]);

  const clearAutoTimers = () => {
    autoTimersRef.current.forEach((t) => window.clearTimeout(t));
    autoTimersRef.current = [];
  };

  useEffect(
    () => () => {
      clearAutoTimers();
      stopSuspense();
    },
    [],
  );

  /* ---------- ações ---------- */

  const openWinnerModal = (drawn: CheerOption) => {
    setWinner(drawn);
    window.setTimeout(() => setModalShown(true), 30);
  };

  const closeWinnerModal = () => {
    setModalShown(false);
    window.setTimeout(() => setWinner(null), 240);
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

    const fullOut = isFullOut(drawn.text);
    setIsSpinning(false);
    setHistory((h) =>
      [
        {
          text: drawn.text,
          icon: drawn.icon,
          color: drawn.color,
          fullOut,
          at: Date.now(),
        },
        ...h,
      ].slice(0, 12),
    );
    setStats((s) => ({
      spins: s.spins + 1,
      fullOuts: s.fullOuts + (fullOut ? 1 : 0),
    }));

    if (fullOut) {
      playFullOutFanfare();
      confettiRef.current?.launch("massive");
    } else {
      playCheerChime();
      confettiRef.current?.launch("standard");
    }
    if ("vibrate" in navigator) {
      navigator.vibrate(fullOut ? [200, 100, 300, 100, 400] : [100, 50, 150]);
    }
    openWinnerModal(drawn);

    /* modo competição: continua o show sozinho */
    if (autoModeRef.current) {
      autoTimersRef.current.push(
        window.setTimeout(() => {
          setModalShown(false);
          autoTimersRef.current.push(
            window.setTimeout(() => {
              setWinner(null);
              autoTimersRef.current.push(
                window.setTimeout(() => wheelRef.current?.spin(), 1000),
              );
            }, 260),
          );
        }, 4000),
      );
    }
  };

  const handleSpinAgain = () => {
    clearAutoTimers();
    closeWinnerModal();
    window.setTimeout(() => wheelRef.current?.spin(), 340);
  };

  const handleCloseModal = () => {
    clearAutoTimers();
    closeWinnerModal();
  };

  const handleAdd = (text: string) => {
    initAudio();
    playBlip();
    setOptions((opts) =>
      opts.length >= MAX_OPTIONS
        ? opts
        : [...opts, { text, icon: guessCheerIcon(text), color: nextCheerColor() }],
    );
  };

  const handleRemove = (index: number) => {
    setOptions((opts) => opts.filter((_, i) => i !== index));
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) {
      initAudio();
      playBlip();
    }
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
      /* modal aberto: retoma a sequência de competição */
      autoTimersRef.current.push(window.setTimeout(handleSpinAgain, 1200));
    } else if (!winner && !isSpinning) {
      window.setTimeout(() => wheelRef.current?.spin(), 250);
    }
  };

  const handleReset = () => {
    if (!window.confirm("Restaurar as rotinas padrão de cheerleading?")) return;
    clearAutoTimers();
    setAutoMode(false);
    setModalShown(false);
    setWinner(null);
    setOptions(DEFAULT_CHEER_OPTIONS.map((o) => ({ ...o })));
  };

  /* ---------- layout ---------- */

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-2.5 py-5">
      <ArenaBackground />
      <ConfettiLayer ref={confettiRef} />

      <main className="relative z-10 flex w-full max-w-[440px] flex-col items-center overflow-hidden rounded-[44px] border-2 border-white/15 bg-[rgba(18,24,43,0.88)] px-4 pb-6 pt-5 shadow-[0_20px_60px_rgba(0,0,0,0.75)] backdrop-blur-[14px]">
        {/* cabeçalho */}
        <header className="rise-in relative mb-2 w-full text-center" style={{ animationDelay: "0.03s" }}>
          <div className="absolute right-0 top-0 flex gap-1.5">
            <button
              type="button"
              onClick={toggleSound}
              aria-label={soundOn ? "Desativar som" : "Ativar som"}
              title={soundOn ? "Desativar som" : "Ativar som"}
              className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-white/20 bg-white/10 text-white transition-transform duration-150 hover:scale-110 active:scale-90"
            >
              {soundOn ? <Volume2Icon size={16} /> : <VolumeXIcon size={16} />}
            </button>
            <button
              type="button"
              onClick={handleReset}
              aria-label="Restaurar padrão"
              title="Restaurar padrão"
              className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-white/20 bg-white/10 text-white transition-transform duration-150 hover:scale-110 active:scale-90"
            >
              <RotateCcwIcon size={15} />
            </button>
          </div>

          <span className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-punch to-grape px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-[1.2px] text-white shadow-[0_3px_10px_rgba(255,42,133,0.4)]">
            <TrophyIcon size={12} strokeWidth={2.6} />
            Cheerleading Championship
          </span>
          <h1 className="font-display text-2xl font-black uppercase leading-tight tracking-wide text-white [text-shadow:0_0_20px_rgba(0,240,255,0.45)]">
            Full Outs Arena
          </h1>
          <p className="font-display text-[15px] font-extrabold uppercase tracking-[2.5px] text-gold [text-shadow:0_0_12px_rgba(255,199,44,0.6)]">
            Roleta de Rotina
          </p>
        </header>

        {/* roleta */}
        <div className="rise-in" style={{ animationDelay: "0.08s" }}>
          <ArenaWheel
            ref={wheelRef}
            options={options}
            onSpinStart={handleSpinStart}
            onSpinEnd={handleSpinEnd}
          />
        </div>

        {/* torcida */}
        <div className="rise-in mb-3 mt-1 w-full" style={{ animationDelay: "0.13s" }}>
          <CrowdSection hyped={isSpinning} />
        </div>

        {/* opções de treino */}
        <div className="rise-in mb-3 w-full" style={{ animationDelay: "0.18s" }}>
          <OptionsCard
            options={options}
            disabled={isSpinning}
            onAdd={handleAdd}
            onRemove={handleRemove}
          />
        </div>

        {/* jumbotron / placar */}
        <div className="rise-in mb-4 w-full" style={{ animationDelay: "0.22s" }}>
          <Scoreboard history={history} stats={stats} />
        </div>

        {/* ações */}
        <div className="rise-in flex w-full gap-2.5" style={{ animationDelay: "0.26s" }}>
          <button
            type="button"
            onClick={requestSpin}
            disabled={isSpinning || options.length < 2}
            className="font-display flex h-[52px] flex-[1.4] cursor-pointer items-center justify-center gap-2 rounded-[26px] bg-gradient-to-br from-neon to-[#0072ff] text-base font-black uppercase tracking-wide text-night shadow-[0_8px_24px_rgba(0,240,255,0.45)] transition-all duration-150 hover:brightness-110 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-55"
          >
            <BoltIcon size={18} strokeWidth={2.8} />
            {isSpinning ? "Girando..." : "Girar agora"}
          </button>
          <button
            type="button"
            onClick={toggleAutoMode}
            aria-pressed={autoMode}
            title={autoMode ? "Desativar modo competição" : "Ativar modo competição"}
            className={`font-display flex h-[52px] flex-1 cursor-pointer flex-col items-center justify-center rounded-[26px] border text-xs font-extrabold uppercase leading-tight transition-all duration-200 ${
              autoMode
                ? "border-punch bg-gradient-to-br from-punch to-[#ff7300] text-white shadow-[0_0_16px_rgba(255,42,133,0.5)]"
                : "border-white/20 bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <span className="flex items-center gap-1.5">
              {autoMode ? (
                <RepeatIcon size={13} strokeWidth={2.8} />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-neon animate-blink" />
              )}
              Modo
            </span>
            <span className="text-[11px] opacity-85">Competição</span>
          </button>
        </div>
      </main>

      <ArenaModal
        open={modalShown}
        winner={winner}
        autoMode={autoMode}
        onSpinAgain={handleSpinAgain}
        onClose={handleCloseModal}
      />
    </div>
  );
}
