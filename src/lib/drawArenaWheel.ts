import type { CheerOption } from "./cheer";
import { ARM_TONES, isFullOut, truncateLabel } from "./cheer";

const TAU = Math.PI * 2;
const EMOJI_FONT = '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';

/** Tons de azul escuro (claro → base → sombra) para as fatias reais. */
const ROYAL_SLICES = [
  { light: "#3b5cc9", base: "#1e3a8a", dark: "#14275e" },
  { light: "#2e4aa5", base: "#16275c", dark: "#0d1a41" },
  { light: "#4a72e8", base: "#1d4ed8", dark: "#153a9e" },
  { light: "#31579f", base: "#122a63", dark: "#0b1c47" },
];

const SPECIAL_SLICE = { light: "#5b84f0", base: "#2456d6", dark: "#123a9e" };

function drawCrown(ctx: CanvasRenderingContext2D, scale = 1): void {
  ctx.save();
  ctx.scale(scale, scale);
  const grad = ctx.createLinearGradient(0, -16, 0, 10);
  grad.addColorStop(0, "#fde68a");
  grad.addColorStop(1, "#b8860b");
  ctx.beginPath();
  ctx.moveTo(-16, 10);
  ctx.lineTo(-16, -2);
  ctx.lineTo(-8, -12);
  ctx.lineTo(-3, -2);
  ctx.lineTo(0, -15);
  ctx.lineTo(3, -2);
  ctx.lineTo(8, -12);
  ctx.lineTo(16, -2);
  ctx.lineTo(16, 10);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#7a5200";
  ctx.stroke();

  [-8, 0, 8].forEach((x) => {
    ctx.beginPath();
    ctx.arc(x, 3, 2.2, 0, TAU);
    ctx.fillStyle = "#1e3a8a";
    ctx.fill();
  });
  ctx.restore();
}

/**
 * Roleta da realeza antiga: fatias em azul escuro, aro de ouro
 * ornamental com rebites, separadores dourados, fatia especial
 * com moldura de ouro e coroa real desenhada no centro.
 */
export function drawArenaWheel(
  ctx: CanvasRenderingContext2D,
  size: number,
  options: CheerOption[],
  rotation: number,
  glow: number,
): void {
  const center = size / 2;
  const radius = center - 30;

  ctx.clearRect(0, 0, size, size);

  /* ---- base azul-noite com halo dourado ---- */
  ctx.save();
  ctx.beginPath();
  ctx.arc(center, center, radius + 18, 0, TAU);
  ctx.fillStyle = "#0d1b3d";
  ctx.shadowColor = `rgba(245, 197, 66, ${0.32 + glow * 0.3})`;
  ctx.shadowBlur = 24 + glow * 26;
  ctx.fill();
  ctx.restore();

  /* ---- aro de ouro real ---- */
  const rimGrad = ctx.createLinearGradient(0, 0, size, size);
  rimGrad.addColorStop(0, "#fde68a");
  rimGrad.addColorStop(0.3, "#b8860b");
  rimGrad.addColorStop(0.65, "#f5c542");
  rimGrad.addColorStop(1, "#8a6508");
  ctx.beginPath();
  ctx.arc(center, center, radius + 12, 0, TAU);
  ctx.lineWidth = 13;
  ctx.strokeStyle = rimGrad;
  ctx.stroke();

  /* sulco azul entre o aro e as fatias */
  ctx.beginPath();
  ctx.arc(center, center, radius + 4.5, 0, TAU);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#0a1128";
  ctx.stroke();

  /* ---- rebites dourados no aro ---- */
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * TAU;
    const rx = center + Math.cos(a) * (radius + 12);
    const ry = center + Math.sin(a) * (radius + 12);
    ctx.beginPath();
    ctx.arc(rx, ry, 3.6, 0, TAU);
    ctx.fillStyle = "#f9d976";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(rx - 0.9, ry - 0.9, 1.4, 0, TAU);
    ctx.fillStyle = "#fff7d6";
    ctx.fill();
  }

  /* ---- anéis de energia durante o giro ---- */
  if (glow > 0.03) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius + 20, 0, TAU);
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = `rgba(245, 197, 66, ${0.55 * glow})`;
    ctx.shadowColor = "rgba(245, 197, 66, 0.9)";
    ctx.shadowBlur = 24 * glow;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(center, center, radius + 25, 0, TAU);
    ctx.lineWidth = 2;
    ctx.strokeStyle = `rgba(74, 110, 224, ${0.45 * glow})`;
    ctx.shadowColor = "rgba(74, 110, 224, 0.8)";
    ctx.stroke();
    ctx.restore();
  }

  /* ---- fatias ---- */
  const total = options.length;
  if (total > 0) {
    const slice = TAU / total;

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(rotation);

    for (let i = 0; i < total; i++) {
      const start = i * slice;
      const end = start + slice;
      const opt = options[i];
      const special = isFullOut(opt.text);
      const tone = special ? SPECIAL_SLICE : ROYAL_SLICES[i % ROYAL_SLICES.length];

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, start, end);
      ctx.closePath();

      const sliceGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, radius);
      sliceGrad.addColorStop(0, tone.light);
      sliceGrad.addColorStop(0.35, tone.base);
      sliceGrad.addColorStop(1, tone.dark);
      ctx.fillStyle = sliceGrad;
      ctx.fill();

      ctx.lineWidth = special ? 4.5 : 1.8;
      ctx.strokeStyle = special ? "#f5c542" : "rgba(245, 197, 66, 0.35)";
      ctx.stroke();

      /* lantejoulas de ouro na fatia real */
      if (special) {
        const mid = start + slice / 2;
        [0.45, 0.62, 0.8].forEach((rr, k) => {
          const wob = (k - 1) * 0.06;
          ctx.beginPath();
          ctx.arc(Math.cos(mid + wob) * radius * rr, Math.sin(mid + wob) * radius * rr, 3.2, 0, TAU);
          ctx.fillStyle = "rgba(253, 230, 138, 0.9)";
          ctx.fill();
        });
      }

      /* rótulo da fatia */
      ctx.save();
      ctx.rotate(start + slice / 2);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";

      ctx.font = `30px ${EMOJI_FONT}`;
      ctx.fillText(ARM_TONES[i % ARM_TONES.length], radius - 20, 2);

      ctx.font = special
        ? `900 ${total > 8 ? 26 : 30}px Cinzel, Georgia, serif`
        : `800 ${total > 8 ? 22 : 26}px Cinzel, Georgia, serif`;
      ctx.fillStyle = special ? "#ffe9a8" : "#ffffff";
      ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;
      ctx.fillText(truncateLabel(opt.text), radius - 60, 0);
      ctx.restore();
    }

    /* profundidade: sombra interna sutil */
    const innerShade = ctx.createRadialGradient(0, 0, radius - 30, 0, 0, radius);
    innerShade.addColorStop(0, "rgba(0,0,0,0)");
    innerShade.addColorStop(1, "rgba(0,0,0,0.28)");
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, TAU);
    ctx.fillStyle = innerShade;
    ctx.fill();

    ctx.restore();
  }

  /* ---- cubo central: ouro + coroa real ---- */
  const hubRing = ctx.createLinearGradient(center - 42, center - 42, center + 42, center + 42);
  hubRing.addColorStop(0, "#fde68a");
  hubRing.addColorStop(0.5, "#b8860b");
  hubRing.addColorStop(1, "#f5c542");
  ctx.beginPath();
  ctx.arc(center, center, 42, 0, TAU);
  ctx.fillStyle = hubRing;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(center, center, 32, 0, TAU);
  ctx.fillStyle = "#0d1b3d";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#f5c542";
  ctx.stroke();

  ctx.save();
  ctx.translate(center, center + 2);
  drawCrown(ctx, 1.05);
  ctx.restore();
}
