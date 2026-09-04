/**
 * Motor de áudio da arena (Web Audio API):
 * - ticks do ponteiro
 * - trilha de suspense durante o giro (sawtooth ascendente + bumbos acelerando)
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

/* ---------- suspense ---------- */

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
    suspenseOsc.frequency.setValueAtTime(65, c.currentTime);
    suspenseOsc.frequency.exponentialRampToValueAtTime(140, c.currentTime + 4.5);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(220, c.currentTime);
    filter.frequency.exponentialRampToValueAtTime(600, c.currentTime + 4.5);

    suspenseGain.gain.setValueAtTime(0.01, c.currentTime);
    suspenseGain.gain.linearRampToValueAtTime(0.18, c.currentTime + 1.0);

    suspenseOsc.connect(filter);
    filter.connect(suspenseGain);
    suspenseGain.connect(c.destination);
    suspenseOsc.start();
  } catch {
    /* ignore */
  }

  /* bumbos acelerando até o fim do giro */
  let drumSpeed = 160;
  const pulse = () => {
    if (!suspenseActive) return;
    playBassThump();
    drumSpeed = Math.max(70, drumSpeed * 0.94);
    drumTimer = window.setTimeout(pulse, drumSpeed);
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

export function playCheerChime(): void {
  if (!enabled) return;
  initAudio();
  const c = ctx;
  if (!c) return;
  try {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const t = c.currentTime + i * 0.08;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(t);
      osc.stop(t + 0.45);
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
