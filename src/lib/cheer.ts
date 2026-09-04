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

export const DEFAULT_CHEER_OPTIONS: CheerOption[] = [
  { text: "Stunt Full Out", icon: "⚡", color: "#00b4d8" },
  { text: "Tumbling Full Out", icon: "🌪️", color: "#9d4edd" },
  { text: "Jumps + Over all", icon: "🎀", color: "#ff2a85" },
  { text: "Half out 1", icon: "⏱️", color: "#2563eb" },
  { text: "Half out 2", icon: "⏱️", color: "#059669" },
  { text: "FULL OUT", icon: "🏆", color: "#eab308" },
];

/** Cores vibrantes que funcionam bem sobre o fundo escuro da arena. */
export const NEON_PALETTE = [
  "#00b4d8",
  "#9d4edd",
  "#ff2a85",
  "#2563eb",
  "#059669",
  "#eab308",
  "#f97316",
  "#00f0ff",
  "#a3e635",
  "#f43f5e",
];

const ICON_MAP: Record<string, string> = {
  stunt: "⚡",
  full: "🏆",
  tumbling: "🌪️",
  salto: "🌪️",
  mortal: "🌪️",
  jumps: "🤸",
  jump: "🤸",
  overall: "🎀",
  dance: "💃",
  danc: "💃",
  piramide: "🔺",
  pyramid: "🔺",
  basket: "🧺",
  flex: "💪",
  half: "⏱️",
  warm: "🔥",
  aquec: "🔥",
  coreo: "🎶",
  musica: "🎶",
  stretch: "🧘",
  along: "🧘",
  flyer: "🪽",
  base: "🏋️",
  grit: "📣",
  grito: "📣",
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function guessCheerIcon(text: string): string {
  const lower = normalize(text);
  for (const [key, icon] of Object.entries(ICON_MAP)) {
    if (lower.includes(key)) return icon;
  }
  return "⚡";
}

/** A fatia dourada especial é identificada pelo texto exato "FULL OUT". */
export function isFullOut(text: string): boolean {
  return text.trim().toUpperCase() === "FULL OUT";
}

export function nextCheerColor(): string {
  return NEON_PALETTE[Math.floor(Math.random() * NEON_PALETTE.length)];
}

export function truncateLabel(text: string, max = 15): string {
  return text.length > max ? `${text.slice(0, max - 2).trimEnd()}..` : text;
}
