import * as THREE from 'three';
import { roundRectPath } from './canvas.js';

// Vẽ chữ lên canvas → texture. Gọi sau khi document.fonts.load() xong để dấu tiếng Việt hiển thị đúng.
export function makeTextTexture(text, { font = "600 64px 'Be Vietnam Pro', sans-serif", color = '#ffffff', bg = null, width, height, padding = 24, shadow = null } = {}) {
  const probe = document.createElement('canvas').getContext('2d');
  probe.font = font;
  const m = probe.measureText(text);
  const px = parseInt(/(\d+)px/.exec(font)?.[1] || '64', 10);
  const w = width || Math.ceil(m.width + padding * 2);
  const h = height || Math.ceil(px * 1.5 + padding);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (bg) {
    ctx.fillStyle = bg;
    const r = Math.min(h / 2, 28);
    roundRectPath(ctx, 0, 0, w, h, r);
    ctx.fill();
  }
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (shadow) { ctx.shadowColor = shadow; ctx.shadowBlur = px * 0.35; }
  ctx.fillStyle = color;
  ctx.fillText(text, w / 2, h / 2 + px * 0.05);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.userData.aspect = w / h;
  return tex;
}

// Đốm sáng tròn mềm (dùng cho sao/đốm kiến thức/hào quang).
export function makeGlowTexture(color = '#ffffff', size = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.22, color);
  g.addColorStop(0.55, color + '55');
  g.addColorStop(1, color + '00');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Sprite chữ có tỉ lệ đúng; height = chiều cao theo đơn vị thế giới.
export function makeLabelSprite(text, height, opts) {
  const tex = makeTextTexture(text, opts);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false });
  const s = new THREE.Sprite(mat);
  s.scale.set(height * tex.userData.aspect, height, 1);
  s.userData.baseScale = s.scale.clone();
  return s;
}
