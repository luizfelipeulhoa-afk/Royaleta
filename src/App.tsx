import { useEffect, useMemo, useRef, useState } from "react";
import ArenaWheel, { type WheelHandle } from "./components/ArenaWheel";
import OptionsCard from "./components/OptionsCard";
import CrowdSection from "./components/CrowdSection";
import ArenaModal from "./components/ArenaModal";
import ConfettiLayer, { type ConfettiHandle } from "./components/ConfettiLayer";
import Scoreboard from "./components/Scoreboard";
import ArenaBackground from "./components/ArenaBackground";
import {
  BoltIcon,
  CrownIcon,
  DiceIcon,
  HandIcon,
  RotateCcwIcon,
  Volume2Icon,
  VolumeXIcon,
} from "./components/icons";
import type { ArenaStats, CheerOption, DrawRecord } from "./lib/cheer";
import {
  DEFAULT_CHEER_OPTIONS,
  guessCheerIcon,
  isFullOut,
  MAX_OPTIONS,
  nextCheerColor,
} from "./lib/cheer";
import {
  initAudio,
  playBlip,
  playCheerChime,
  playFullOutFanfare,
  setSoundEnabled,
} from "./lib/arenaAudio";

const LS_OPTIONS = "cheer_fullout_options";
const LS_STATS = "cheer_fullout_stats";
const LS_HISTORY = "cheer_fullout_history";

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function sanitizeOptions(raw: unknown): CheerOption[] | null {
  if (!Array.isArray(raw) || raw.length < 2) return null;
  const clean = (raw as Array<Partial<CheerOption>>)
    .filter((o) => o && typeof o.text === "string" && o.text.trim().length > 0)
    .slice(0, MAX_OPTIONS)
    .map((o, i) => ({
      text: String(o.text).slice(0, 25),
      icon: typeof o.icon === "string" && o.icon ? o.icon : guessCheerIcon(String(o.text), i),
      color: typeof o.color === "string" && /^#[0-9a-fA-F]{6}$/.test(o.color) ? o.color : nextCheerColor(),
    }));
  return clean.length >= 2 ? clean : null;
}

function sanitizeStats(raw: unknown): ArenaStats {
  const r = raw as Partial<ArenaStats> | null;
  return {
    spins: typeof r?.spins === "number" && r.spins >= 0 ? r.spins : 0,
    fullOuts: typeof r?.fullOuts === "number" && r.fullOuts >= 0 ? r.fullOuts : 0,
  };
}

function sanitizeHistory(raw: unknown): DrawRecord[] {
  if (!Array.isArray(raw)) return [];
  return (raw as Array<Partial<DrawRecord>>)
    .filter((r) => r && typeof r.text === "string")
    .slice(0, 12)
    .map((r) => ({
      text: String(r.text),
      icon: typeof r.icon === "string" ? r.icon : "🙌🏽",
      color: typeof r.color === "string" ? r.color : "#3557c4",
      fullOut: !!r.fullOut,
      at: typeof r.at === "number" ? r.at : Date.now(),
    }));
}

export default function App() {
  const [options, setOptions] = useState<CheerOption[]>(
    () => sanitizeOptions(loadJSON<unknown>(LS_OPTIONS, null)) ?? DEFAULT_CHEER_OPTIONS.map((o) => ({ ...o })),
  );
  const [history, setHistory] = useState<DrawRecord[]>(() => sanitizeHistory(loadJSON<unknown>(LS_HISTORY, null)));
  const [stats, setStats] = useState<ArenaStats>(() => sanitizeStats(loadJSON<unknown>(LS_STATS, null)));
  const [isSpinning, setIsSpinning] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [winner, setWinner] = useState<CheerOption | null>(null);
  const [modalShown, setModalShown] = useState(false);

  const wheelRef = useRef<WheelHandle>(null);
  const confettiRef = useRef<ConfettiHandle>(null);
  const autoModeRef = useRef(false);
  const autoTimersRef = useRef<number[]>([]);

  useEffect(() => {
    autoModeRef.current = autoMode;
  }, [autoMode]);

  useEffect(() => {
    localStorage.setItem(LS_OPTIONS, JSON.stringify(options));
  }, [options]);

  useEffect(() => {
    localStorage.setItem(LS_STATS, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem(LS_HISTORY, JSON.stringify(history));
  }, [history]);

  /* modo competição: acende as luzes do castelo e a festa da corte */
  useEffect(() => {
    document.body.classList.toggle("in-competition", isSpinning);
    return () => document.body.classList.remove("in-competition");
  }, [isSpinning]);

  const clearAutoTimers = () => {
    autoTimersRef.current.forEach((t) => window.clearTimeout(t));
    autoTimersRef.current = [];
  };

  useEffect(() => clearAutoTimers, []);

  /* ---------- ações ---------- */

  const openWinnerModal = (drawn: CheerOption) => {
    setWinner(drawn);
    window.setTimeout(() => setModalShown(true), 30);
  };

  const closeWinnerModal = () => {
    setModalShown(false);
    window.setTimeout(() => setWinner(null), 230);
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
        { text: drawn.text, icon: drawn.icon, color: drawn.color, fullOut, at: Date.now() },
        ...h,
      ].slice(0, 12),
    );
    setStats((s) => ({ spins: s.spins + 1, fullOuts: s.fullOuts + (fullOut ? 1 : 0) }));

    if (fullOut) {
      playFullOutFanfare();
      confettiRef.current?.launch("massive");
      if ("vibrate" in navigator) navigator.vibrate([200, 100, 300, 100, 400]);
    } else {
      playCheerChime();
      confettiRef.current?.launch("standard");
      if ("vibrate" in navigator) navigator.vibrate([100, 50, 150]);
    }
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
        }, 4000),
      );
    }
  };

  const handleSpinAgain = () => {
    clearAutoTimers();
    closeWinnerModal();
    window.setTimeout(() => wheelRef.current?.spin(), 320);
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
      autoTimersRef.current.push(window.setTimeout(handleSpinAgain, 1200));
    } else if (!winner && !isSpinning) {
      window.setTimeout(() => wheelRef.current?.spin(), 250);
    }
  };

  const addOption = (text: string) => {
    playBlip();
    setOptions((opts) => [
      ...opts,
      { text, icon: guessCheerIcon(text, opts.length), color: nextCheerColor() },
    ]);
  };

  const removeOption = (index: number) => {
    setOptions((opts) => opts.filter((_, i) => i !== index));
  };

  const toggleSound = () => {
    initAudio();
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playBlip();
  };

  const resetDefaults = () => {
    if (!window.confirm("Restaurar os decretos padrão da corte?")) return;
    clearAutoTimers();
    setAutoMode(false);
    setModalShown(false);
    setWinner(null);
    setOptions(DEFAULT_CHEER_OPTIONS.map((o) => ({ ...o })));
  };

  const iconBtn = useMemo(
    () =>
      "grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-[rgba(245,197,66,0.25)] bg-white/10 text-white transition-all duration-150 hover:scale-110 hover:bg-white/15 hover:shadow-[0_0_12px_rgba(245,197,66,0.35)] active:scale-95",
    [],
  );

  return (
    <div className="relative flex min-h-screen items-start justify-center overflow-x-hidden px-2.5 py-4 sm:items-center sm:px-4">
      <ArenaBackground />
      <ConfettiLayer ref={confettiRef} />

      <main
        className="rise-in relative z-10 flex w-full max-w-[440px] flex-col items-center overflow-hidden rounded-[44px] border border-white/10 bg-[rgba(13,22,48,0.88)] px-4 pb-6 pt-5 shadow-[0_20px_60px_rgba(0,0,0,0.75),0_0_0_2px_rgba(245,197,66,0.18)] backdrop-blur-[14px]"
        aria-label="Roleta Real"
      >
        {/* cabeçalho da corte */}
        <header className="relative mb-2 w-full text-center">
          <span className="font-display mx-auto mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#f9d976] to-[#b8860b] px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-[1.5px] text-[#241a05] shadow-[0_3px_10px_rgba(245,197,66,0.4)]">
            <CrownIcon size={12} strokeWidth={2.8} />
            Realeza Antiga
          </span>

          <div className="absolute right-0 top-0 flex gap-1.5">
            <button type="button" className={iconBtn} onClick={toggleSound} title={soundOn ? "Desativar som" : "Ativar som"} aria-label="Som">
              {soundOn ? <Volume2Icon size={16} /> : <VolumeXIcon size={16} />}
            </button>
            <button type="button" className={iconBtn} onClick={resetDefaults} title="Restaurar padrão" aria-label="Restaurar padrão">
              <RotateCcwIcon size={15} />
            </button>
          </div>

          <h1 className="font-display text-[24px] font-black uppercase leading-[1.1] tracking-wide text-white [text-shadow:0_0_22px_rgba(245,197,66,0.45)]">
            Roleta Real
          </h1>
          <p className="font-display text-[13px] font-extrabold uppercase tracking-[3px] text-gold [text-shadow:0_0_12px_rgba(245,197,66,0.6)]">
            A corte decide
          </p>

          <div className="mt-1.5 flex items-center justify-center gap-1.5 text-[10px] font-extrabold tracking-[0.5px] text-white/45">
            <DiceIcon size={12} />
            <span>
              {isSpinning
                ? "A CORTE PRENDE A RESPIRAÇÃO..."
                : "TOQUE NA ROLETA PARA GIRAR"}
            </span>
            <HandIcon size={12} />
          </div>
        </header>

        <ArenaWheel ref={wheelRef} options={options} onSpinStart={handleSpinStart} onSpinEnd={handleSpinEnd} />

        <CrowdSection hyped={isSpinning} />

        <div className="h-3" />

        <Scoreboard history={history} stats={stats} />

        <div className="h-3" />

        <OptionsCard options={options} disabled={isSpinning} onAdd={addOption} onRemove={removeOption} />

        <div className="mt-3.5 flex w-full gap-2.5">
          <button
            type="button"
            onClick={() => wheelRef.current?.spin()}
            disabled={isSpinning || options.length < 2}
            className="font-display h-[52px] flex-[1.4] cursor-pointer rounded-[26px] bg-gradient-to-br from-[#f9d976] via-[#f5c542] to-[#b8860b] text-[15px] font-black uppercase tracking-wide text-[#101d42] shadow-[0_8px_24px_rgba(245,197,66,0.45)] transition-all duration-150 hover:brightness-110 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {isSpinning ? "GIRANDO..." : "Girar agora"}
          </button>
          <button
            type="button"
            onClick={toggleAutoMode}
            aria-pressed={autoMode}
            className={`font-display relative h-[52px] flex-1 cursor-pointer overflow-hidden rounded-[26px] border text-[12px] font-extrabold uppercase leading-[1.15] transition-all duration-200 ${
              autoMode
                ? "border-gold bg-gradient-to-br from-[#1e3a8a] to-[#0f1d4d] text-white shadow-[0_0_18px_rgba(245,197,66,0.4)]"
                : "border-white/20 bg-white/10 text-white hover:bg-white/15"
            }`}
          >
            {autoMode && (
              <span className="animate-blink absolute right-3 top-2.5 h-2 w-2 rounded-full bg-gold shadow-[0_0_8px_rgba(245,197,66,0.9)]" />
            )}
            <span>Modo</span>
            <br />
            <span className="text-[11px] opacity-85">Corte Real</span>
          </button>
        </div>

        <p className="mt-2.5 flex items-center gap-1 text-center text-[10px] font-semibold text-white/35">
          <BoltIcon size={11} />
          A fatia com moldura de ouro guarda o Full Out lendário
        </p>
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
