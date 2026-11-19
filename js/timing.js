import { SCENES, WATCH_SECONDS } from './config.js';

export function totalDuration(scenes = SCENES) {
  const last = scenes[scenes.length - 1];
  return last.start + last.duration;
}

// Hệ số tốc độ phát để cả phim kết thúc trong WATCH_SECONDS giây thực.
export function playbackRate(scenes = SCENES, watch = WATCH_SECONDS) {
  return Math.max(1, totalDuration(scenes) / watch);
}

export function sceneAt(t, scenes = SCENES) {
  if (!(t > 0)) return { id: scenes[0].id, index: 0, local: 0 };
  for (let i = 0; i < scenes.length; i++) {
    const s = scenes[i];
    if (t < s.start + s.duration) return { id: s.id, index: i, local: t - s.start };
  }
  const i = scenes.length - 1;
  return { id: scenes[i].id, index: i, local: scenes[i].duration };
}

export function parseParams(search) {
  const p = new URLSearchParams(search || '');
  const tRaw = p.get('t');
  const t = tRaw === null || tRaw === '' ? NaN : Number(tRaw);
  const q = p.get('quality');
  return {
    seek: Number.isFinite(t) ? t : null,
    autostart: p.get('autostart') === '1',
    noWebGL: p.get('nowebgl') === '1',
    forceFail: p.get('forcefail') === '1',
    quality: q === 'low' || q === 'high' ? q : null,
  };
}
