import type { CheerOption } from "./cheer";
import { CROWN, isFullOut, truncateLabel } from "./cheer";

const TAU = Math.PI * 2;
const EMOJI_FONT = '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';

/* Fatias alternando azul-marinho profundo (#1C2541 / #0B132B) */
const NAVY_A = { light: "#2a3b6f", base: "#1c2541", dark: "#10182f" };
const NAVY_B = { light: "#1b2750", base: "#0b132b", dark: "#060b1c" };

/* Fatia especial FULL OUT: ouro real luminoso */
const SPECIAL = { light: "#fff3c4", mid: "#fde047", gold: "#f59e0b", dark: "#b45309" };

/**
 * Disco da roleta: aro metálico chanfrado com rebites dourados,
 * fatias navy alternadas, fatia especial em ouro luminoso e
 * anéis de energia durante o giro. O hub central é um botão DOM.
 */
export function drawArenaWheel(
  ctx: CanvasRenderingContext2D,
  size: number,
  options: CheerOption[],
  rotation: number,
  glow: number,
): void {
  const center = size / 2;
  const radius = center - 32;

  ctx.clearRect(0, 0, size, size);

  /* ---- base com halo dourado ---- */
  ctx.save();
  ctx.beginPath();
  ctx.arc(center, center, radius + 20, 0, TAU);
  ctx.fillStyle = "#050711";
  ctx.shadowColor = `rgba(245, 158, 11, ${0.3 + glow * 0.35})`;
  ctx.shadowBlur = 26 + glow * 30;
  ctx.fill();
  ctx.restore();

  /* ---- aro metálico chanfrado em ouro ---- */
  const rimGrad = ctx.createLinearGradient(0, 0, size, size);
  rimGrad.addColorStop(0, "#fde047");
  rimGrad.addColorStop(0.3, "#b45309");
  rimGrad.addColorStop(0.62, "#f59e0b");
  rimGrad.addColorStop(1, "#7c3f06");
  ctx.beginPath();
  ctx.arc(center, center, radius + 13, 0, TAU);
  ctx.lineWidth = 15;
  ctx.strokeStyle = rimGrad;
  ctx.stroke();

  /* chanfro interno (sulco escuro) */
  ctx.beginPath();
  ctx.arc(center, center, radius + 4.5, 0, TAU);
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = "#050711";
  ctx.stroke();

  /* filete de luz no topo do aro */
  ctx.beginPath();
  ctx.arc(center, center, radius + 19.5, Math.PI * 1.05, Math.PI * 1.95);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255, 244, 200, 0.65)";
  ctx.stroke();

  /* ---- rebites dourados perimetrais ---- */
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * TAU;
    const rx = center + Math.cos(a) * (radius + 13);
    const ry = center + Math.sin(a) * (radius + 13);
    ctx.beginPath();
    ctx.arc(rx, ry, 3.8, 0, TAU);
    ctx.fillStyle = "#f9d976";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(rx - 1, ry - 1, 1.5, 0, TAU);
    ctx.fillStyle = "#fff7d6";
    ctx.fill();
  }

  /* ---- anéis de energia durante o giro ---- */
  if (glow > 0.03) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius + 23, 0, TAU);
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = `rgba(245, 158, 11, ${0.55 * glow})`;
    ctx.shadowColor = "rgba(245, 158, 11, 0.9)";
    ctx.shadowBlur = 26 * glow;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(center, center, radius + 28, 0, TAU);
    ctx.lineWidth = 2;
    ctx.strokeStyle = `rgba(6, 182, 212, ${0.45 * glow})`;
    ctx.shadowColor = "rgba(6, 182, 212, 0.8)";
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
      const tone = i % 2 === 0 ? NAVY_A : NAVY_B;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, start, end);
      ctx.closePath();

      const sliceGrad = ctx.createRadialGradient(0, 0, 12, 0, 0, radius);
      if (special) {
        sliceGrad.addColorStop(0, SPECIAL.light);
        sliceGrad.addColorStop(0.25, SPECIAL.mid);
        sliceGrad.addColorStop(0.72, SPECIAL.gold);
        sliceGrad.addColorStop(1, SPECIAL.dark);
      } else {
        sliceGrad.addColorStop(0, tone.light);
        sliceGrad.addColorStop(0.35, tone.base);
        sliceGrad.addColorStop(1, tone.dark);
      }
      ctx.fillStyle = sliceGrad;
      ctx.fill();

      if (special) {
        ctx.save();
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#fde047";
        ctx.shadowColor = "rgba(253, 224, 71, 0.95)";
        ctx.shadowBlur = 20;
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = "rgba(245, 158, 11, 0.35)";
        ctx.stroke();
      }

      /* lantejoulas de ouro na fatia real */
      if (special) {
        const mid = start + slice / 2;
        [0.45, 0.63, 0.8].forEach((rr, k) => {
          const wob = (k - 1) * 0.07;
          ctx.beginPath();
          ctx.arc(
            Math.cos(mid + wob) * radius * rr,
            Math.sin(mid + wob) * radius * rr,
            3.4,
            0,
            TAU,
          );
          ctx.fillStyle = "rgba(255, 247, 214, 0.95)";
          ctx.fill();
        });
      }

      /* rótulo da fatia */
      ctx.save();
      ctx.rotate(start + slice / 2);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";

      ctx.font = `30px ${EMOJI_FONT}`;
      ctx.fillText(CROWN, radius - 22, 2);

      ctx.font = special
        ? `900 ${total > 8 ? 26 : 30}px Cinzel, Georgia, serif`
        : `800 ${total > 8 ? 22 : 26}px Cinzel, Georgia, serif`;
      ctx.fillStyle = special ? "#451a03" : "#f1f5f9";
      ctx.shadowColor = special ? "rgba(255, 244, 200, 0.55)" : "rgba(0, 0, 0, 0.75)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;
      ctx.fillText(truncateLabel(opt.text), radius - 62, 0);
      ctx.restore();
    }

    /* profundidade: sombra interna sutil */
    const innerShade = ctx.createRadialGradient(0, 0, radius - 32, 0, 0, radius);
    innerShade.addColorStop(0, "rgba(0,0,0,0)");
    innerShade.addColorStop(1, "rgba(0,0,0,0.3)");
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, TAU);
    ctx.fillStyle = innerShade;
    ctx.fill();

    ctx.restore();
  }
}
