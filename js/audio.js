// Nhạc nền: phát assets/music.mp3 nếu có, không thì tự chơi một giai điệu hộp nhạc vui tươi.
const BPM = 84;
const BEAT = 60 / BPM;
const N = {
  G3: 196.0, A3: 220.0, B3: 246.94, C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99,
};
// 8 ô nhịp 4/4, ngũ cung Đô trưởng. [nốt | null = lặng, số phách]
const TUNE = [
  ['E5', 1], ['D5', 0.5], ['C5', 0.5], ['G4', 1], ['C5', 1],
  ['D5', 1.5], ['E5', 0.5], ['D5', 1], ['G4', 1],
  ['C5', 1], ['E5', 1], ['A4', 0.5], ['C5', 0.5], ['E5', 1],
  ['D5', 1], ['C5', 1], ['A4', 2],
  ['E5', 0.5], ['G5', 0.5], ['E5', 1], ['D5', 1], ['C5', 1],
  ['D5', 1], ['G4', 1], ['A4', 1], ['D5', 1],
  ['C5', 1], ['A4', 0.5], ['C5', 0.5], ['D5', 1], ['E5', 1],
  ['C5', 3], [null, 1],
];
// Hợp âm nền mỗi ô nhịp: C G Am F C G F C
const PADS = [
  ['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['A3', 'C4', 'E4'], ['A3', 'C4', 'F4'],
  ['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['A3', 'C4', 'F4'], ['C4', 'E4', 'G4'],
];

export function loopSeconds() {
  return TUNE.reduce((s, [, b]) => s + b, 0) * BEAT;
}

export function melodyNotes() {
  const notes = [];
  let t = 0;
  for (const [name, beats] of TUNE) {
    if (name) notes.push({ freq: N[name], start: t, dur: beats * BEAT * 0.9 });
    t += beats * BEAT;
  }
  return notes;
}

export async function probeMusic(src = 'assets/music.mp3') {
  try {
    const r = await fetch(src, { method: 'HEAD', cache: 'no-store' });
    return r.ok && /audio|mpeg|octet/.test(r.headers.get('content-type') || '');
  } catch {
    return false;
  }
}

function fileMusic(src) {
  const el = new Audio(src);
  el.loop = true;
  el.volume = 0;
  let fade;
  const fadeTo = (target, ms) => {
    clearInterval(fade);
    const step = (target - el.volume) / (ms / 50);
    fade = setInterval(() => {
      const v = el.volume + step;
      if ((step >= 0 && v >= target) || (step < 0 && v <= target)) { el.volume = target; clearInterval(fade); }
      else el.volume = Math.min(1, Math.max(0, v));
    }, 50);
  };
  return {
    play() { el.play().catch(() => {}); fadeTo(0.8, 1500); },
    pause() { el.pause(); },
    restart() { el.currentTime = 0; this.play(); },
    get playing() { return !el.paused; },
  };
}

function synthMusic() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  const ctx = new Ctx();
  const master = ctx.createGain();
  master.gain.value = 0.22;
  // Tiếng vang nhẹ cho cảm giác hộp nhạc
  const delay = ctx.createDelay(1);
  delay.delayTime.value = BEAT * 0.75;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.28;
  const wet = ctx.createGain();
  wet.gain.value = 0.35;
  delay.connect(feedback).connect(delay);
  delay.connect(wet).connect(master);
  master.connect(ctx.destination);

  const melody = melodyNotes();
  const loopLen = loopSeconds();
  let origin = ctx.currentTime + 0.1;
  let scheduledUntil = origin;
  let timer = null;

  function tone(freq, at, dur, vol, type) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(vol, at + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0008, at + dur + 0.4);
    osc.connect(g);
    g.connect(master);
    g.connect(delay);
    osc.start(at);
    osc.stop(at + dur + 0.5);
  }

  function scheduleWindow() {
    const until = ctx.currentTime + 1.2;
    while (scheduledUntil < until) {
      const from = scheduledUntil;
      const to = Math.min(until, from + 0.5);
      const loopStartOf = (t) => origin + Math.floor((t - origin) / loopLen) * loopLen;
      for (let base = loopStartOf(from); base < to; base += loopLen) {
        for (const n of melody) {
          const at = base + n.start;
          if (at >= from && at < to) {
            tone(n.freq, at, n.dur, 0.5, 'triangle');
            tone(n.freq * 2, at, n.dur * 0.6, 0.08, 'sine');
          }
        }
        PADS.forEach((chord, bar) => {
          const at = base + bar * 4 * BEAT;
          if (at >= from && at < to) chord.forEach((nm) => tone(N[nm], at, 4 * BEAT * 0.95, 0.07, 'sine'));
        });
      }
      scheduledUntil = to;
    }
  }

  return {
    play() {
      ctx.resume();
      if (!timer) { scheduleWindow(); timer = setInterval(scheduleWindow, 250); }
    },
    pause() {
      ctx.suspend();
    },
    restart() {
      clearInterval(timer);
      timer = null;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.6);
      origin = ctx.currentTime + 0.15;
      scheduledUntil = origin;
      this.play();
    },
    get playing() { return ctx.state === 'running'; },
  };
}

// Gọi đồng bộ trong sự kiện bấm (chính sách tự phát âm thanh của trình duyệt).
export function createMusic({ src = 'assets/music.mp3', hasFile = false } = {}) {
  const m = hasFile ? fileMusic(src) : synthMusic();
  let on = false;
  let muted = false;
  return {
    play() { if (!muted) { m.play(); on = true; } },
    pause() { m.pause(); on = false; },
    restart() { if (!muted) { m.restart(); on = true; } },
    toggle() { muted = on; if (on) this.pause(); else this.play(); return on; },
    get playing() { return on; },
    get muted() { return muted; },
  };
}
