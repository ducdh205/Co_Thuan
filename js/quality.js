import { LIMITS } from './config.js';

export function pickQuality({ width, dpr, cores, forced }) {
  const low = forced === 'low' ||
    (forced !== 'high' && ((width < 600 && cores <= 4) || cores <= 2));
  return low
    ? { tier: 'low', pixelRatio: Math.min(dpr, 1.5), bloom: false, sparkCount: 30 }
    : { tier: 'high', pixelRatio: Math.min(dpr, LIMITS.maxPixelRatio), bloom: true, sparkCount: 60 };
}
