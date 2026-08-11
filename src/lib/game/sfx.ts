// Procedural sound effects — Web Audio only, no asset files. Everything is
// synthesized from one shared noise buffer plus oscillators, so effects play
// with zero fetch latency and the repo stays license-free (same policy as the
// CC0 models and music).

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;
let muted = true;
let stepParity = 0;

export function setSfxMuted(m: boolean) {
  muted = m;
}

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
  }
  // Contexts start suspended until the page has seen a user gesture. Every
  // trigger here follows one (a key, click, or tap), so resume freely.
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function noise(c: AudioContext): AudioBuffer {
  if (!noiseBuf) {
    const len = Math.floor(c.sampleRate * 0.25);
    noiseBuf = c.createBuffer(1, len, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}

/** Short triangle note with a fast attack and soft tail. */
function chime(c: AudioContext, t: number, freq: number, vol: number) {
  const o = c.createOscillator();
  o.type = "triangle";
  o.frequency.value = freq;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
  o.connect(g);
  g.connect(master!);
  o.start(t);
  o.stop(t + 0.45);
}

/** Tiny high-passed noise click — the "touch" in a UI sound. */
function tick(c: AudioContext, t: number, freq: number, vol: number) {
  const src = c.createBufferSource();
  src.buffer = noise(c);
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = freq;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  src.connect(hp);
  hp.connect(g);
  g.connect(master!);
  src.start(t);
  src.stop(t + 0.06);
}

/** One footfall: a filtered noise scuff over a low thump. Alternating filter
 *  color per step reads as left/right feet; slight random pitch keeps a long
 *  walk from sounding like a loop. */
export function playFootstep(running: boolean) {
  if (muted) return;
  const c = ensureCtx();
  if (!c || !master) return;
  const t = c.currentTime;
  const peak = running ? 0.22 : 0.15;

  stepParity ^= 1;
  const scuff = c.createBufferSource();
  scuff.buffer = noise(c);
  scuff.playbackRate.value = 0.9 + Math.random() * 0.25;
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value =
    (running ? 900 : 700) + (stepParity ? 90 : -60) + Math.random() * 80;
  lp.Q.value = 0.7;
  const sg = c.createGain();
  sg.gain.setValueAtTime(0.0001, t);
  sg.gain.exponentialRampToValueAtTime(peak, t + 0.008);
  sg.gain.exponentialRampToValueAtTime(0.0001, t + (running ? 0.1 : 0.085));
  scuff.connect(lp);
  lp.connect(sg);
  sg.connect(master);
  scuff.start(t);
  scuff.stop(t + 0.12);

  const thump = c.createOscillator();
  thump.type = "sine";
  thump.frequency.setValueAtTime(running ? 130 : 110, t);
  thump.frequency.exponentialRampToValueAtTime(55, t + 0.07);
  const tg = c.createGain();
  tg.gain.setValueAtTime(0.0001, t);
  tg.gain.exponentialRampToValueAtTime(peak * 0.8, t + 0.006);
  tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
  thump.connect(tg);
  tg.connect(master);
  thump.start(t);
  thump.stop(t + 0.09);
}

/** Entering a world: an airy rising sweep under a small two-note chime. */
export function playEnterWorld() {
  if (muted) return;
  const c = ensureCtx();
  if (!c || !master) return;
  const t = c.currentTime;

  const src = c.createBufferSource();
  src.buffer = noise(c);
  src.loop = true;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 1.1;
  bp.frequency.setValueAtTime(260, t);
  bp.frequency.exponentialRampToValueAtTime(2100, t + 0.5);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.16, t + 0.16);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
  src.connect(bp);
  bp.connect(g);
  g.connect(master);
  src.start(t);
  src.stop(t + 0.6);

  chime(c, t + 0.05, 392, 0.1); // G4
  chime(c, t + 0.2, 587.33, 0.12); // D5
}

/** Opening a board: click + two quick notes up. */
export function playBoardOpen() {
  if (muted) return;
  const c = ensureCtx();
  if (!c || !master) return;
  const t = c.currentTime;
  tick(c, t, 1600, 0.06);
  chime(c, t, 523.25, 0.09); // C5
  chime(c, t + 0.07, 783.99, 0.11); // G5
}

/** Closing a board: click + a settling note down. */
export function playBoardClose() {
  if (muted) return;
  const c = ensureCtx();
  if (!c || !master) return;
  const t = c.currentTime;
  tick(c, t, 1200, 0.05);
  chime(c, t, 659.25, 0.08); // E5
  chime(c, t + 0.06, 440, 0.09); // A4
}
