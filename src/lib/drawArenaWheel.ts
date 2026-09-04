import type { CheerOption } from "./cheer";
import { isFullOut, truncateLabel } from "./cheer";

const TAU = Math.PI * 2;
const EMOJI_FONT = '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';

/**
 * Roleta da arena: base escura com halo ciano, anel de campeonato
 * (ouro → branco → rosa → ciano), fatias neon e a fatia dourada
 * especial de FULL OUT. Durante o giro, um anel de energia brilha.
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

  /* ---- base escura com halo ---- */
  ctx.save();
  ctx.beginPath();
  ctx.arc(center, center, radius + 18, 0, TAU);
  ctx.fillStyle = "#0f172a";
  ctx.shadowColor = `rgba(0, 240, 255, ${0.4 + glow * 0.35})`;
  ctx.shadowBlur = 24 + glow * 26;
  ctx.fill();
  ctx.restore();

  /* ---- anel de campeonato ---- */
  const rimGrad = ctx.createLinearGradient(0, 0, size, size);
  rimGrad.addColorStop(0, "#ffd700");
  rimGrad.addColorStop(0.3, "#ffffff");
  rimGrad.addColorStop(0.7, "#ff2a85");
  rimGrad.addColorStop(1, "#00f0ff");
  ctx.beginPath();
  ctx.arc(center, center, radius + 12, 0, TAU);
  ctx.lineWidth = 10;
  ctx.strokeStyle = rimGrad;
  ctx.stroke();

  /* ---- anéis de energia durante o giro ---- */
  if (glow > 0.03) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius + 20, 0, TAU);
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = `rgba(0, 240, 255, ${0.55 * glow})`;
    ctx.shadowColor = "rgba(0, 240, 255, 0.9)";
    ctx.shadowBlur = 24 * glow;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(center, center, radius + 25, 0, TAU);
    ctx.lineWidth = 2;
    ctx.strokeStyle = `rgba(255, 42, 133, ${0.4 * glow})`;
    ctx.shadowColor = "rgba(255, 42, 133, 0.8)";
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

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, start, end);
      ctx.closePath();

      const sliceGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, radius);
      if (special) {
        sliceGrad.addColorStop(0, "#fffbe8");
        sliceGrad.addColorStop(0.2, "#ffd700");
        sliceGrad.addColorStop(0.8, "#d97706");
        sliceGrad.addColorStop(1, "#78350f");
      } else {
        sliceGrad.addColorStop(0, "#ffffff");
        sliceGrad.addColorStop(0.25, opt.color);
        sliceGrad.addColorStop(1, opt.color);
      }
      ctx.fillStyle = sliceGrad;
      ctx.fill();

      ctx.lineWidth = special ? 4 : 2.5;
      ctx.strokeStyle = special ? "#ffffff" : "rgba(255, 255, 255, 0.65)";
      ctx.stroke();

      /* rótulo da fatia */
      ctx.save();
      ctx.rotate(start + slice / 2);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";

      ctx.font = `30px ${EMOJI_FONT}`;
      ctx.fillText(opt.icon || "⚡", radius - 20, 2);

      ctx.font = special
        ? `900 ${total > 8 ? 26 : 30}px Montserrat, sans-serif`
        : `800 ${total > 8 ? 22 : 26}px Montserrat, sans-serif`;
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;
      ctx.fillText(truncateLabel(opt.text), radius - 60, 0);
      ctx.restore();
    }

    /* profundidade: sombra interna sutil */
    const innerShade = ctx.createRadialGradient(0, 0, radius - 30, 0, 0, radius);
    innerShade.addColorStop(0, "rgba(0,0,0,0)");
    innerShade.addColorStop(1, "rgba(0,0,0,0.22)");
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, TAU);
    ctx.fillStyle = innerShade;
    ctx.fill();

    ctx.restore();
  }

  /* ---- cubo central em formato de troféu ---- */
  const hubRing = ctx.createLinearGradient(center - 42, center - 42, center + 42, center + 42);
  hubRing.addColorStop(0, "#ffd700");
  hubRing.addColorStop(0.5, "#b45309");
  hubRing.addColorStop(1, "#ffd700");
  ctx.beginPath();
  ctx.arc(center, center, 42, 0, TAU);
  ctx.fillStyle = hubRing;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(center, center, 32, 0, TAU);
  ctx.fillStyle = "#0f172a";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#ffd700";
  ctx.stroke();

  ctx.font = `22px ${EMOJI_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🏆", center, center + 1);
}
