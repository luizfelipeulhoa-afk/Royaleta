/**
 * Motor de áudio da arena (Web Audio API):
 * - ticks do ponteiro
 * - tema de tubarão durante o giro (motivo grave Mi–Fá acelerando + drone sombrio)
 * - chime de resultado e fanfarra de FULL OUT
 */

let ctx: AudioContext | null = null;
let enabled = true;

let suspenseOsc: OscillatorNode | null = null;
let suspenseGain: GainNode | null = null;
let drumTimer: number | null = null;
let suspenseActive = false;

export function setSoundEnabled(value: boolean): void {
  enabled = value;
  if (!value) stopSuspense();
}

export function initAudio(): void {
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    /* áudio indisponível */
  }
}

/* ---------- ticks ---------- */

export function playTick(): void {
  if (!enabled) return;
  initAudio();
  const c = ctx;
  if (!c) return;
  try {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(750, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, c.currentTime + 0.035);
    gain.gain.setValueAtTime(0.22, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.035);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.04);
  } catch {
    /* ignore */
  }
}

function playBassThump(): void {
  if (!enabled || !ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(90, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  } catch {
    /* ignore */
  }
}

/* ---------- suspense: o tema do tubarão ---------- */

/* O motivo clássico de tensão: Mi2 e Fá2 alternados (semitom ameaçador),
   tocados por um "tuba" de sawtooths desafinados + sub grave. */
const SHARK_E = 82.41; // Mi2
const SHARK_F = 87.31; // Fá2

function playSharkNote(freq: number, when: number, power: number): void {
  const c = ctx;
  if (!c) return;
  try {
    const t = c.currentTime + when;
    const growl1 = c.createOscillator();
    const growl2 = c.createOscillator();
    const sub = c.createOscillator();
    const gain = c.createGain();
    const filter = c.createBiquadFilter();

    growl1.type = "sawtooth";
    growl1.frequency.setValueAtTime(freq, t);
    growl2.type = "sawtooth";
    growl2.frequency.setValueAtTime(freq * 1.008, t);
    sub.type = "sine";
    sub.frequency.setValueAtTime(freq / 2, t);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(230, t);
    filter.frequency.exponentialRampToValueAtTime(430, t + 0.16);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(power, t + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

    growl1.connect(filter);
    growl2.connect(filter);
    filter.connect(gain);
    sub.connect(gain);
    gain.connect(c.destination);

    growl1.start(t);
    growl2.start(t);
    sub.start(t);
    growl1.stop(t + 0.38);
    growl2.stop(t + 0.38);
    sub.stop(t + 0.38);
  } catch {
    /* ignore */
  }
}

export function startSuspense(): void {
  if (!enabled || suspenseActive) return;
  initAudio();
  const c = ctx;
  if (!c) return;

  suspenseActive = true;

  try {
    suspenseOsc = c.createOscillator();
    suspenseGain = c.createGain();
    const filter = c.createBiquadFilter();

    suspenseOsc.type = "sawtooth";
    suspenseOsc.frequency.setValueAtTime(55, c.currentTime);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(150, c.currentTime);
    filter.frequency.linearRampToValueAtTime(360, c.currentTime + 5);

    suspenseGain.gain.setValueAtTime(0.01, c.currentTime);
    suspenseGain.gain.linearRampToValueAtTime(0.09, c.currentTime + 1.2);

    suspenseOsc.connect(filter);
    filter.connect(suspenseGain);
    suspenseGain.connect(c.destination);
    suspenseOsc.start();
  } catch {
    /* ignore */
  }

  /* o "tun-dun… tun-dun" que acelera e engrossa conforme o desfecho se aproxima */
  let pace = 880;
  let flip = false;
  let beats = 0;
  const pulse = () => {
    if (!suspenseActive) return;
    const power = Math.min(0.42, 0.28 + beats * 0.014);
    playSharkNote(flip ? SHARK_F : SHARK_E, 0, power);
    playSharkNote(flip ? SHARK_E : SHARK_F, 0.15, power);
    playBassThump();
    flip = !flip;
    beats += 1;
    pace = Math.max(170, pace * 0.925);
    drumTimer = window.setTimeout(pulse, pace);
  };
  pulse();
}

export function stopSuspense(): void {
  suspenseActive = false;
  if (drumTimer !== null) {
    window.clearTimeout(drumTimer);
    drumTimer = null;
  }
  const c = ctx;
  const gain = suspenseGain;
  const osc = suspenseOsc;
  if (c && gain && osc) {
    try {
      gain.gain.cancelScheduledValues(c.currentTime);
      gain.gain.setValueAtTime(gain.gain.value, c.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, c.currentTime + 0.3);
      window.setTimeout(() => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          /* ignore */
        }
      }, 350);
    } catch {
      /* ignore */
    }
  }
  suspenseOsc = null;
  suspenseGain = null;
}

/* ---------- resultados ---------- */

/** Fanfarra harmônica: acorde de Dó maior pleno + arpejo brilhante. */
export function playCheerChime(): void {
  if (!enabled) return;
  initAudio();
  const c = ctx;
  if (!c) return;
  try {
    /* acorde de vitória simultâneo (C4 E4 G4 C5) */
    [261.63, 329.63, 392.0, 523.25].forEach((freq) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, c.currentTime);
      gain.gain.setValueAtTime(0.0001, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.15, c.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.95);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + 1);
    });

    /* arpejo brilhante ascendente */
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const t = c.currentTime + 0.1 + i * 0.09;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(t);
      osc.stop(t + 0.55);
    });
  } catch {
    /* ignore */
  }
}

export function playFullOutFanfare(): void {
  if (!enabled) return;
  initAudio();
  const c = ctx;
  if (!c) return;
  try {
    [233, 293, 349, 466].forEach((freq) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, c.currentTime);
      gain.gain.setValueAtTime(0.16, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + 0.85);
    });

    window.setTimeout(() => {
      try {
        [440, 554, 659, 880, 1108].forEach((freq, i) => {
          const t = c.currentTime + i * 0.1;
          const osc = c.createOscillator();
          const gain = c.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.25, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
          osc.connect(gain);
          gain.connect(c.destination);
          osc.start(t);
          osc.stop(t + 0.55);
        });
      } catch {
        /* ignore */
      }
    }, 300);
  } catch {
    /* ignore */
  }
}

export function playBlip(): void {
  if (!enabled) return;
  initAudio();
  const c = ctx;
  if (!c) return;
  try {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, c.currentTime + 0.09);
    gain.gain.setValueAtTime(0.14, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.13);
  } catch {
    /* ignore */
  }
}
