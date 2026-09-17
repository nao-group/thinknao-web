/**
 * Short two-note "ding" played on XP gain, synthesized via Web Audio API —
 * no audio asset needed. Fails silently if audio is blocked/unsupported.
 */

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!ctx) ctx = new AudioCtx();
  return ctx;
}

function tone(audioCtx: AudioContext, freq: number, startTime: number, duration: number) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;

  // Quick attack, smooth decay — avoids a click at the edges.
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.18, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

export function playXpChime(): void {
  try {
    const audioCtx = getContext();
    if (!audioCtx) return;
    if (audioCtx.state === "suspended") void audioCtx.resume();

    const now = audioCtx.currentTime;
    tone(audioCtx, 880, now, 0.12); // A5
    tone(audioCtx, 1318.5, now + 0.09, 0.18); // E6 — short ascending interval, Duolingo-ish
  } catch {
    // audio is a nice-to-have, never let it break the submit flow
  }
}
