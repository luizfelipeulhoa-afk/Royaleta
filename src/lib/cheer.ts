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

/** Pessoas com os braços para cima, em diferentes tons de pele. */
export const ARM_TONES = ["🙌🏻", "🙌🏼", "🙌🏽", "🙌🏾", "🙌🏿"];

export function cheerIcon(index: number): string {
  return ARM_TONES[index % ARM_TONES.length];
}

/** Azuis escuros e reais para as fatias da roleta. */
export const ROYAL_BLUE_POOL = [
  "#3557c4",
  "#2f5fd0",
  "#4a6ee0",
  "#274b9f",
  "#5b7ff0",
  "#3f6ae8",
];

export const DEFAULT_CHEER_OPTIONS: CheerOption[] = [
  { text: "Stunt Full Out", icon: "🙌🏻", color: "#3557c4" },
  { text: "Tumbling Full Out", icon: "🙌🏼", color: "#274b9f" },
  { text: "Jumps + Over all", icon: "🙌🏽", color: "#4a6ee0" },
  { text: "Half out 1", icon: "🙌🏾", color: "#2f5fd0" },
  { text: "Half out 2", icon: "🙌🏿", color: "#5b7ff0" },
  { text: "FULL OUT", icon: "🙌🏽", color: "#eab308" },
];

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function guessCheerIcon(text: string, index: number): string {
  void normalize(text);
  return cheerIcon(index);
}

/** A fatia dourada especial é identificada pelo texto exato "FULL OUT". */
export function isFullOut(text: string): boolean {
  return text.trim().toUpperCase() === "FULL OUT";
}

export function nextCheerColor(): string {
  return ROYAL_BLUE_POOL[Math.floor(Math.random() * ROYAL_BLUE_POOL.length)];
}

export function truncateLabel(text: string, max = 15): string {
  return text.length > max ? `${text.slice(0, max - 2).trimEnd()}..` : text;
}
