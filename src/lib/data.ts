export interface WheelOption {
  text: string;
  icon: string;
  color: string;
}

export interface HistoryEntry {
  text: string;
  icon: string;
  color: string;
  at: number;
}

export const MAX_OPTIONS = 16;
export const MIN_OPTIONS = 2;

export const DEFAULT_OPTIONS: WheelOption[] = [
  { text: "Pizza", icon: "🍕", color: "#f87171" },
  { text: "Filme", icon: "🍿", color: "#fbbf24" },
  { text: "Passeio no Parque", icon: "🌲", color: "#34d399" },
  { text: "Jogos", icon: "🎮", color: "#38bdf8" },
  { text: "Ler Livro", icon: "📖", color: "#818cf8" },
  { text: "Cozinhar", icon: "🍳", color: "#a7f3d0" },
  { text: "Chamada de Vídeo", icon: "📹", color: "#fb923c" },
  { text: "Estudar", icon: "📚", color: "#c084fc" },
];

export const PALETTE = [
  "#f87171",
  "#fb923c",
  "#fbbf24",
  "#34d399",
  "#2dd4bf",
  "#38bdf8",
  "#818cf8",
  "#c084fc",
  "#f472b6",
  "#a3e635",
];

const EMOJI_MAP: Record<string, string> = {
  pizza: "🍕",
  filme: "🍿",
  cinema: "🎬",
  serie: "📺",
  parque: "🌲",
  passeio: "🚶",
  jogos: "🎮",
  game: "🕹️",
  videogame: "🕹️",
  ler: "📖",
  livro: "📚",
  cozinhar: "🍳",
  comida: "🍲",
  almoco: "🍽️",
  jantar: "🍽️",
  estudar: "📝",
  estudo: "📝",
  video: "📹",
  chamada: "📞",
  dormir: "😴",
  soneca: "😴",
  treino: "💪",
  academia: "🏋️",
  exercicio: "🏃",
  corrida: "🏃",
  musica: "🎵",
  cantar: "🎤",
  compras: "🛍️",
  praia: "🏖️",
  piscina: "🏊",
  festa: "🎉",
  cafe: "☕",
  churrasco: "🍖",
  sorvete: "🍦",
  doce: "🍫",
  futebol: "⚽",
  bike: "🚴",
  bicicleta: "🚴",
  viagem: "✈️",
  foto: "📸",
  selfie: "🤳",
  dancar: "💃",
  karaok: "🎤",
  pintar: "🎨",
  desenhar: "✏️",
  jardin: "🪴",
  pet: "🐶",
  cachorro: "🐶",
  gato: "🐱",
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function guessEmoji(text: string): string {
  const lower = normalize(text);
  for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
    if (lower.includes(key)) return emoji;
  }
  return "🎯";
}

export function nextColor(index: number): string {
  return PALETTE[index % PALETTE.length];
}

export function truncateLabel(text: string, max = 15): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}
