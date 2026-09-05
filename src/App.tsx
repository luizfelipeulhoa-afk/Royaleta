import { useEffect, useMemo, useRef, useState } from "react";
import ArenaWheel, { type WheelHandle } from "./components/ArenaWheel";
import DecreesPanel from "./components/DecreesPanel";
import HistoryList from "./components/HistoryList";
import HypeMeter from "./components/HypeMeter";
import CourtReactions from "./components/CourtReactions";
import RoyalStats from "./components/RoyalStats";
import ArenaModal from "./components/ArenaModal";
import ConfettiLayer, { type ConfettiHandle } from "./components/ConfettiLayer";
import ArenaBackground from "./components/ArenaBackground";
import {
  BoltIcon,
  CrownIcon,
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
      color:
        typeof o.color === "string" && /^#[0-9a-fA-F]{6}$/.test(o.color)
          ? o.color
          : nextCheerColor(),
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
      icon: typeof r.icon === "string" ? r.icon : "👑",
      color: typeof r.color === "string" ? r.color : "#3b82f6",
      fullOut: !!r.fullOut,
      at: typeof r.at === "number" ? r.at : Date.now(),
    }));
}

export default function App() {
  const [options, setOptions] = useState<CheerOption[]>(
    () =>
      sanitizeOptions(loadJSON<unknown>(LS_OPTIONS, null)) ??
      DEFAULT_CHEER_OPTIONS.map((o) => ({ ...o })),
  );
  const [history, setHistory] = useState<DrawRecord[]>(() =>
    sanitizeHistory(loadJSON<unknown>(LS_HISTORY, null)),
  );
  const [stats, setStats] = useState<ArenaStats>(() =>
    sanitizeStats(loadJSON<unknown>(LS_STATS, null)),
  );
  const [isSpinning, setIsSpinning] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [winner, setWinner] = useState<CheerOption | null>(null);
  const [modalShown, setModalShown] = useState(false);
  const [burst, setBurst] = useState(0);

  const wheelRef = useRef<WheelHandle>(null);
  const confettiRef = useRef<ConfettiHandle>(null);

  useEffect(() => {
    localStorage.setItem(LS_OPTIONS, JSON.stringify(options));
  }, [options]);

  useEffect(() => {
    localStorage.setItem(LS_STATS, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem(LS_HISTORY, JSON.stringify(history));
  }, [history]);

  /* ---------- fluxo de giro ---------- */

  const handleSpinStart = () => setIsSpinning(true);

  const handleSpinEnd = (index: number) => {
    const drawn = options[index];
    if (!drawn) {
      setIsSpinning(false);
      return;
    }

    const fullOut = isFullOut(drawn.text);
    setIsSpinning(false);
    setBurst((b) => b + 1);
    setHistory((h) =>
      [{ text: drawn.text, icon: drawn.icon, color: drawn.color, fullOut, at: Date.now() }, ...h].slice(0, 12),
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

    setWinner(drawn);
    window.setTimeout(() => setModalShown(true), 30);
  };

  const handleSpinAgain = () => {
    setModalShown(false);
    window.setTimeout(() => setWinner(null), 230);
    window.setTimeout(() => wheelRef.current?.spin(), 320);
  };

  const handleCloseModal = () => {
    setModalShown(false);
    window.setTimeout(() => setWinner(null), 230);
  };

  /* ---------- decretos ---------- */

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

  const duplicateOption = (index: number): boolean => {
    if (options.length >= MAX_OPTIONS) return false;
    playBlip();
    setOptions((opts) => {
      const next = [...opts];
      next.splice(index + 1, 0, { ...opts[index] });
      return next;
    });
    return true;
  };

  /* ---------- controles ---------- */

  const toggleSound = () => {
    initAudio();
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playBlip();
  };

  const resetDefaults = () => {
    if (!window.confirm("Restaurar os decretos padrão da corte?")) return;
    setModalShown(false);
    setWinner(null);
    setOptions(DEFAULT_CHEER_OPTIONS.map((o) => ({ ...o })));
  };

  const iconBtn = useMemo(
    () =>
      "glass grid h-10 w-10 cursor-pointer place-items-center rounded-full text-white/80 transition-all duration-150 hover:scale-110 hover:text-goldlight hover:shadow-[0_0_14px_rgba(245,158,11,0.35)] active:scale-95",
    [],
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden px-3 py-5 sm:px-5 lg:py-7">
      <ArenaBackground />
      <ConfettiLayer ref={confettiRef} />

      <div className="relative z-10 mx-auto w-full max-w-[1440px]">
        {/* ---------- topo: brasão + controles ---------- */}
        <header className="rise-in mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-goldlight/60 bg-[radial-gradient(circle_at_35%_30%,#1c2541,#0b132b_70%)] text-goldlight shadow-[0_6px_18px_rgba(0,0,0,0.5),0_0_16px_rgba(245,158,11,0.35)]">
              <CrownIcon size={22} strokeWidth={2} />
            </span>
            <div>
              <h1 className="font-display text-xl font-black uppercase leading-none tracking-[0.08em] text-white [text-shadow:0_0_24px_rgba(245,158,11,0.4)] sm:text-2xl">
                Roleta Real
              </h1>
              <p className="font-num mt-1 text-[10px] font-bold uppercase tracking-[0.4em] text-gold">
                A corte decide
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className={iconBtn}
              onClick={toggleSound}
              title={soundOn ? "Desativar som" : "Ativar som"}
              aria-label="Som"
            >
              {soundOn ? <Volume2Icon size={17} /> : <VolumeXIcon size={17} />}
            </button>
            <button
              type="button"
              className={iconBtn}
              onClick={resetDefaults}
              title="Restaurar padrão"
              aria-label="Restaurar padrão"
            >
              <RotateCcwIcon size={16} />
            </button>
          </div>
        </header>

        {/* ---------- Bento Grid ---------- */}
        <main className="grid items-start gap-5 lg:grid-cols-[minmax(280px,330px)_minmax(0,1fr)_minmax(300px,350px)]">
          {/* Coluna esquerda: fervor + corte + placar */}
          <aside className="order-3 space-y-5 lg:order-1">
            <HypeMeter spinning={isSpinning} burst={burst} />
            <CourtReactions hyped={isSpinning} />
            <RoyalStats stats={stats} />
          </aside>

          {/* Coluna central: arena da roleta */}
          <section
            className="order-1 flex flex-col items-center gap-6 lg:order-2"
            aria-label="Arena da roleta"
          >
            <div className="rise-in w-full px-4 pt-2 sm:px-8" style={{ animationDelay: "0.05s" }}>
              <ArenaWheel
                ref={wheelRef}
                options={options}
                onSpinStart={handleSpinStart}
                onSpinEnd={handleSpinEnd}
              />
            </div>

            <button
              type="button"
              onClick={() => wheelRef.current?.spin()}
              disabled={isSpinning || options.length < 2}
              className="rise-in font-display relative h-14 w-full max-w-[330px] cursor-pointer overflow-hidden rounded-full bg-gradient-to-b from-goldlight via-gold to-golddark text-lg font-black uppercase tracking-[0.14em] text-[#1a1204] shadow-[0_12px_32px_rgba(245,158,11,0.45),inset_0_2px_0_rgba(255,255,255,0.55)] transition-all duration-150 hover:brightness-110 active:translate-y-0.5 active:shadow-[0_6px_16px_rgba(245,158,11,0.4)] disabled:cursor-not-allowed disabled:opacity-50 disabled:saturate-50"
              style={{ animationDelay: "0.15s" }}
            >
              <span className="hype-shine pointer-events-none absolute inset-0" aria-hidden />
              <span className="relative flex items-center justify-center gap-2">
                <BoltIcon size={19} strokeWidth={2.6} />
                {isSpinning ? "Girando..." : "Girar agora"}
              </span>
            </button>

            <p className="rise-in font-num text-center text-[10px] font-bold uppercase tracking-[2px] text-white/35" style={{ animationDelay: "0.25s" }}>
              A fatia dourada guarda o Full Out lendário
            </p>
          </section>

          {/* Coluna direita: decretos + histórico */}
          <aside className="order-2 space-y-5 lg:order-3">
            <DecreesPanel
              options={options}
              disabled={isSpinning}
              onAdd={addOption}
              onRemove={removeOption}
              onDuplicate={duplicateOption}
            />
            <HistoryList history={history} />
          </aside>
        </main>
      </div>

      <ArenaModal
        open={modalShown}
        winner={winner}
        onSpinAgain={handleSpinAgain}
        onClose={handleCloseModal}
      />
    </div>
  );
}
