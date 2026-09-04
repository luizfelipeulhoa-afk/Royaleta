import type { WheelOption } from "./data";
import { truncateLabel } from "./data";

const TAU = Math.PI * 2;
const EMOJI_FONT = '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';

/**
 * Desenha a roleta em estilo 3D: aro de madeira com rebites,
 * fatias com gradiente radial, pino central dourado e brilho
 * suave que aumenta enquanto a roleta está girando.
 */
export function drawWheel(
  ctx: CanvasRenderingContext2D,
  size: number,
  options: WheelOption[],
  rotation: number,
  glow: number,
): void {
  const center = size / 2;
  const radius = center - 34;

  ctx.clearRect(0, 0, size, size);

  /* ---- base + sombra projetada ---- */
  ctx.save();
  ctx.beginPath();
  ctx.arc(center, center, radius + 18, 0, TAU);
  ctx.fillStyle = "#b77943";
  ctx.shadowColor = `rgba(52, 66, 92, ${0.3 + glow * 0.18})`;
  ctx.shadowBlur = 20 + glow * 30;
  ctx.shadowOffsetY = 13;
  ctx.fill();
  ctx.restore();

  /* ---- aro de madeira ---- */
  const rimGrad = ctx.createRadialGradient(center, center, radius - 8, center, center, radius + 20);
  rimGrad.addColorStop(0, "#8c532b");
  rimGrad.addColorStop(0.5, "#c98a58");
  rimGrad.addColorStop(1, "#683b1a");
  ctx.beginPath();
  ctx.arc(center, center, radius + 13, 0, TAU);
  ctx.lineWidth = 16;
  ctx.strokeStyle = rimGrad;
  ctx.stroke();

  /* ---- rebites metálicos ---- */
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * TAU;
    const rx = center + Math.cos(a) * (radius + 13);
    const ry = center + Math.sin(a) * (radius + 13);
    ctx.beginPath();
    ctx.arc(rx, ry, 3.4, 0, TAU);
    ctx.fillStyle = "#fce7d2";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(rx - 0.8, ry - 0.8, 1.3, 0, TAU);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
  }

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

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, start, end);
      ctx.closePath();

      const sliceGrad = ctx.createRadialGradient(0, 0, 20, 0, 0, radius);
      sliceGrad.addColorStop(0, "#ffffff");
      sliceGrad.addColorStop(0.26, opt.color);
      sliceGrad.addColorStop(1, opt.color);
      ctx.fillStyle = sliceGrad;
      ctx.fill();

      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
      ctx.stroke();

      /* rótulo da fatia */
      ctx.save();
      ctx.rotate(start + slice / 2);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";

      ctx.font = `44px ${EMOJI_FONT}`;
      ctx.fillText(opt.icon || "🎯", radius - 30, 2);

      ctx.font = `600 ${total > 12 ? 26 : 32}px Fredoka, sans-serif`;
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0, 0, 0, 0.42)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 1.5;
      ctx.fillText(truncateLabel(opt.text), radius - 86, 0);
      ctx.restore();
    }

    /* sombra interna sutil para profundidade */
    const innerShade = ctx.createRadialGradient(0, 0, radius - 26, 0, 0, radius);
    innerShade.addColorStop(0, "rgba(0,0,0,0)");
    innerShade.addColorStop(1, "rgba(0,0,0,0.14)");
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, TAU);
    ctx.fillStyle = innerShade;
    ctx.fill();

    ctx.restore();
  }

  /* ---- brilho de giro (anel teal) ---- */
  if (glow > 0.03) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius + 22, 0, TAU);
    ctx.lineWidth = 5;
    ctx.strokeStyle = `rgba(45, 179, 141, ${0.5 * glow})`;
    ctx.shadowColor = "rgba(45, 179, 141, 0.8)";
    ctx.shadowBlur = 26 * glow;
    ctx.stroke();
    ctx.restore();
  }

  /* ---- pino central 3D ---- */
  const hubRing = ctx.createLinearGradient(center - 44, center - 44, center + 44, center + 44);
  hubRing.addColorStop(0, "#ffd166");
  hubRing.addColorStop(1, "#9e621b");
  ctx.beginPath();
  ctx.arc(center, center, 44, 0, TAU);
  ctx.fillStyle = hubRing;
  ctx.fill();

  const hubCap = ctx.createRadialGradient(center - 9, center - 9, 4, center, center, 34);
  hubCap.addColorStop(0, "#ffffff");
  hubCap.addColorStop(0.35, "#f5deb3");
  hubCap.addColorStop(1, "#c49767");
  ctx.beginPath();
  ctx.arc(center, center, 35, 0, TAU);
  ctx.fillStyle = hubCap;
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();

  ctx.font = `24px ${EMOJI_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("⭐", center, center + 2);
}
