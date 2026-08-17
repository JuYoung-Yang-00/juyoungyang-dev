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
    master.gain.value = 1.0;
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

// ─── Knight Crossing ─────────────────────────────────────────────────────

/** One hop: a bright tick with a soft landing thump right behind it. */
export function playHop() {
  if (muted) return;
  const c = ensureCtx();
  if (!c || !master) return;
  const t = c.currentTime;
  tick(c, t, 2100 + Math.random() * 500, 0.05);

  const thump = c.createOscillator();
  thump.type = "sine";
  thump.frequency.setValueAtTime(190, t + 0.05);
  thump.frequency.exponentialRampToValueAtTime(70, t + 0.12);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t + 0.05);
  g.gain.exponentialRampToValueAtTime(0.12, t + 0.06);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
  thump.connect(g);
  g.connect(master);
  thump.start(t + 0.05);
  thump.stop(t + 0.15);
}

/** Hop refused (edge, prop, back limit): a dull knock, no pitch lift. */
export function playRefused() {
  if (muted) return;
  const c = ensureCtx();
  if (!c || !master) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  o.type = "square";
  o.frequency.value = 130;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.05, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + 0.08);
}

/** Squashed by traffic: an angry two-tone horn over a flattening thud. */
export function playSquash() {
  if (muted) return;
  const c = ensureCtx();
  if (!c || !master) return;
  const t = c.currentTime;

  for (const [freq, delay] of [
    [330, 0],
    [277, 0.02],
  ] as const) {
    const o = c.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = freq;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t + delay);
    g.gain.exponentialRampToValueAtTime(0.09, t + delay + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.35);
    o.connect(g);
    g.connect(master);
    o.start(t + delay);
    o.stop(t + delay + 0.4);
  }

  const thud = c.createOscillator();
  thud.type = "sine";
  thud.frequency.setValueAtTime(160, t);
  thud.frequency.exponentialRampToValueAtTime(40, t + 0.22);
  const tg = c.createGain();
  tg.gain.setValueAtTime(0.0001, t);
  tg.gain.exponentialRampToValueAtTime(0.3, t + 0.012);
  tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
  thud.connect(tg);
  tg.connect(master);
  thud.start(t);
  thud.stop(t + 0.3);
}

/** Near-miss: a fast traffic whoosh capped with a reward chime. */
export function playBrush() {
  if (muted) return;
  const c = ensureCtx();
  if (!c || !master) return;
  const t = c.currentTime;

  const src = c.createBufferSource();
  src.buffer = noise(c);
  src.loop = true;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 1.4;
  bp.frequency.setValueAtTime(2600, t);
  bp.frequency.exponentialRampToValueAtTime(500, t + 0.22);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.2, t + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
  src.connect(bp);
  bp.connect(g);
  g.connect(master);
  src.start(t);
  src.stop(t + 0.26);

  chime(c, t + 0.1, 1046.5, 0.1); // C6
  chime(c, t + 0.17, 1318.5, 0.12); // E6
}

/** Storm closing in: a long low rumble that reads as "hurry up". */
export function playThunder() {
  if (muted) return;
  const c = ensureCtx();
  if (!c || !master) return;
  const t = c.currentTime;
  const src = c.createBufferSource();
  src.buffer = noise(c);
  src.loop = true;
  src.playbackRate.value = 0.3;
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(90, t);
  lp.frequency.exponentialRampToValueAtTime(220, t + 0.8);
  lp.Q.value = 1.2;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.26, t + 0.5);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.7);
  src.connect(lp);
  lp.connect(g);
  g.connect(master);
  src.start(t);
  src.stop(t + 1.8);
}

/** The zap: a sharp crack, a falling scream of a sawtooth, and crackle. */
export function playZap() {
  if (muted) return;
  const c = ensureCtx();
  if (!c || !master) return;
  const t = c.currentTime;

  tick(c, t, 4200, 0.22);

  const o = c.createOscillator();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(1900, t);
  o.frequency.exponentialRampToValueAtTime(90, t + 0.3);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.16, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + 0.35);

  const src = c.createBufferSource();
  src.buffer = noise(c);
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 1800;
  const ng = c.createGain();
  ng.gain.setValueAtTime(0.14, t);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  src.connect(hp);
  hp.connect(ng);
  ng.connect(master);
  src.start(t);
  src.stop(t + 0.22);
}

/** Falling through a sky rift: a long slide-whistle down, then a poof. */
export function playFall() {
  if (muted) return;
  const c = ensureCtx();
  if (!c || !master) return;
  const t = c.currentTime;

  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(1100, t);
  o.frequency.exponentialRampToValueAtTime(180, t + 0.7);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.1, t + 0.04);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.72);
  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + 0.75);

  const src = c.createBufferSource();
  src.buffer = noise(c);
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 900;
  const ng = c.createGain();
  ng.gain.setValueAtTime(0.0001, t + 0.66);
  ng.gain.exponentialRampToValueAtTime(0.16, t + 0.7);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);
  src.connect(lp);
  lp.connect(ng);
  ng.connect(master);
  src.start(t + 0.66);
  src.stop(t + 0.9);
}

/** New best on the death card: a small proud arpeggio. */
export function playNewBest() {
  if (muted) return;
  const c = ensureCtx();
  if (!c || !master) return;
  const t = c.currentTime;
  chime(c, t, 523.25, 0.09); // C5
  chime(c, t + 0.09, 659.25, 0.1); // E5
  chime(c, t + 0.18, 783.99, 0.11); // G5
  chime(c, t + 0.3, 1046.5, 0.13); // C6
}
