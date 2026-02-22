/**
 * Sound effects system using Web Audio API.
 * Generates synthesized arcade-style sounds — no external audio files needed.
 */

export type SoundEffect =
  | 'select'
  | 'punch'
  | 'kick'
  | 'special'
  | 'finisher'
  | 'miss'
  | 'critical'
  | 'ko'
  | 'round_start'
  | 'round_end'
  | 'victory'
  | 'menu_hover'
  | 'menu_select'
  | 'countdown';

let audioCtx: AudioContext | null = null;
let _muted = false;
let _volume = 0.4;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setMuted(muted: boolean) {
  _muted = muted;
}

export function isMuted(): boolean {
  return _muted;
}

export function setVolume(vol: number) {
  _volume = Math.max(0, Math.min(1, vol));
}

// Helper: play a tone with envelope
function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'square',
  gainVal = _volume,
  detune = 0,
) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = detune;
  gain.gain.setValueAtTime(gainVal, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

// Helper: noise burst (for percussive sounds)
function playNoise(duration: number, gainVal = _volume) {
  const ctx = getCtx();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(gainVal, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  // Bandpass filter for less harsh noise
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1000;
  filter.Q.value = 1;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
  source.stop(ctx.currentTime + duration);
}

// Sound generators per effect
const soundGenerators: Record<SoundEffect, () => void> = {
  punch() {
    playNoise(0.08, _volume * 0.6);
    playTone(150, 0.1, 'sawtooth', _volume * 0.5);
    playTone(80, 0.15, 'sine', _volume * 0.4);
  },

  kick() {
    playTone(200, 0.08, 'square', _volume * 0.5);
    playTone(100, 0.15, 'sine', _volume * 0.6);
    playNoise(0.06, _volume * 0.4);
  },

  special() {
    // Rising energy beam
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(_volume * 0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
    playNoise(0.1, _volume * 0.3);
  },

  finisher() {
    // Massive explosion-like effect
    playNoise(0.4, _volume * 0.7);
    playTone(60, 0.5, 'sine', _volume * 0.6);
    setTimeout(() => {
      playTone(40, 0.4, 'sine', _volume * 0.5);
      playNoise(0.2, _volume * 0.4);
    }, 100);
    setTimeout(() => {
      playTone(800, 0.3, 'square', _volume * 0.3);
    }, 50);
  },

  miss() {
    // Whoosh
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(_volume * 0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  },

  critical() {
    // Heavy impact with flash
    playNoise(0.12, _volume * 0.7);
    playTone(120, 0.2, 'sawtooth', _volume * 0.6);
    playTone(60, 0.25, 'sine', _volume * 0.5);
    setTimeout(() => {
      playTone(800, 0.15, 'square', _volume * 0.3);
    }, 50);
  },

  ko() {
    // Dramatic KO
    playNoise(0.3, _volume * 0.8);
    playTone(80, 0.4, 'sine', _volume * 0.7);
    setTimeout(() => {
      playTone(60, 0.5, 'sine', _volume * 0.6);
      playNoise(0.2, _volume * 0.5);
    }, 150);
    setTimeout(() => {
      playTone(40, 0.6, 'sine', _volume * 0.4);
    }, 300);
  },

  round_start() {
    // Ascending arpeggio
    playTone(440, 0.15, 'square', _volume * 0.3);
    setTimeout(() => playTone(554, 0.15, 'square', _volume * 0.3), 100);
    setTimeout(() => playTone(659, 0.2, 'square', _volume * 0.4), 200);
  },

  round_end() {
    // Descending tones
    playTone(659, 0.15, 'square', _volume * 0.3);
    setTimeout(() => playTone(554, 0.15, 'square', _volume * 0.3), 100);
    setTimeout(() => playTone(440, 0.25, 'square', _volume * 0.3), 200);
  },

  victory() {
    // Triumphant fanfare
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        playTone(freq, 0.25, 'square', _volume * 0.35);
        playTone(freq * 0.5, 0.25, 'sine', _volume * 0.2);
      }, i * 120);
    });
    setTimeout(() => {
      playTone(1047, 0.5, 'square', _volume * 0.4);
      playTone(523, 0.5, 'sine', _volume * 0.3);
    }, 500);
  },

  select() {
    playTone(600, 0.08, 'square', _volume * 0.25);
    playTone(900, 0.1, 'square', _volume * 0.2);
  },

  menu_hover() {
    playTone(400, 0.05, 'sine', _volume * 0.15);
  },

  menu_select() {
    playTone(500, 0.06, 'square', _volume * 0.25);
    setTimeout(() => playTone(700, 0.08, 'square', _volume * 0.25), 60);
  },

  countdown() {
    // Fight announcement
    playTone(880, 0.12, 'square', _volume * 0.4);
    setTimeout(() => playTone(1100, 0.15, 'square', _volume * 0.5), 80);
    setTimeout(() => playTone(1320, 0.2, 'sawtooth', _volume * 0.4), 160);
  },
};

export function playSound(effect: SoundEffect): void {
  if (_muted) return;
  try {
    soundGenerators[effect]();
  } catch {
    // Audio context may not be available
  }
}
