export interface CheerOption {
  text: string;
  icon: string;
  color: string;
}

export interface DrawRecord {
  text: string;
  icon: string;
  color: string;
  fullOut: boolean;
  at: number;
}

export interface ArenaStats {
  spins: number;
  fullOuts: number;
}

export const MAX_OPTIONS = 16;
export const MIN_OPTIONS = 2;

/** O símbolo único da corte: coroa. */
export const CROWN = "👑";

export const DEFAULT_CHEER_OPTIONS: CheerOption[] = [
  { text: "Stunt Full Out", icon: CROWN, color: "#1e3a8a" },
  { text: "Tumbling Full Out", icon: CROWN, color: "#274690" },
  { text: "Jumps + Over all", icon: CROWN, color: "#3557c4" },
  { text: "Half out 1", icon: CROWN, color: "#1a2f6e" },
  { text: "Half out 2", icon: CROWN, color: "#2f4fae" },
  { text: "FULL OUT", icon: CROWN, color: "#eab308" },
];

/** Azuis reais para as novas rotinas (a fatia especial é detectada pelo texto). */
export const ROYAL_PALETTE = [
  "#1e3a8a",
  "#274690",
  "#1a2f6e",
  "#3557c4",
  "#2f4fae",
  "#14275e",
  "#3b5cc9",
  "#0f2057",
];

/** Todas as opções carregam a coroa da corte. */
export function guessCheerIcon(_text: string, _index = 0): string {
  return CROWN;
}

/** A fatia dourada especial é identificada pelo texto exato "FULL OUT". */
export function isFullOut(text: string): boolean {
  return text.trim().toUpperCase() === "FULL OUT";
}

export function nextCheerColor(): string {
  return ROYAL_PALETTE[Math.floor(Math.random() * ROYAL_PALETTE.length)];
}

export function truncateLabel(text: string, max = 15): string {
  return text.length > max ? `${text.slice(0, max - 2).trimEnd()}..` : text;
}
