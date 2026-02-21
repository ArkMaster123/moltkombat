/**
 * Sound effect placeholders.
 * Replace these with actual audio files and Web Audio API playback.
 *
 * To enable real sounds:
 * 1. Add .mp3/.wav files to public/sounds/
 * 2. Uncomment the playSound implementation below
 * 3. Map each SoundEffect to its file
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

// const soundFiles: Record<SoundEffect, string> = {
//   select: '/sounds/select.mp3',
//   punch: '/sounds/punch.mp3',
//   kick: '/sounds/kick.mp3',
//   special: '/sounds/special.mp3',
//   finisher: '/sounds/finisher.mp3',
//   miss: '/sounds/miss.mp3',
//   critical: '/sounds/critical.mp3',
//   ko: '/sounds/ko.mp3',
//   round_start: '/sounds/round_start.mp3',
//   round_end: '/sounds/round_end.mp3',
//   victory: '/sounds/victory.mp3',
//   menu_hover: '/sounds/menu_hover.mp3',
//   menu_select: '/sounds/menu_select.mp3',
//   countdown: '/sounds/countdown.mp3',
// };

// const audioCache = new Map<string, HTMLAudioElement>();

export function playSound(_effect: SoundEffect): void {
  // Placeholder - uncomment below for real audio
  // const file = soundFiles[effect];
  // if (!file) return;
  // let audio = audioCache.get(file);
  // if (!audio) {
  //   audio = new Audio(file);
  //   audioCache.set(file, audio);
  // }
  // audio.currentTime = 0;
  // audio.volume = 0.5;
  // audio.play().catch(() => {});
  console.debug(`[SFX] ${_effect}`);
}
