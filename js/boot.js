// Khởi động: kiểm tra WebGL, tải thế giới 3D (có giới hạn thời gian), nút "Mở quà", thiệp dự phòng.
import { CARD, LIMITS } from './config.js';

const $ = (id) => document.getElementById(id);

export function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

export function fillCard(root, card = CARD) {
  root.querySelector('.greeting').textContent = card.greeting;
  root.querySelector('.body').textContent = card.body;
  root.querySelector('.signature').textContent = card.signature;
  root.querySelector('.footer code').textContent = card.footer;
}

export function showFallback() {
  window.__ready = true;
  if (window.__showFallback) window.__showFallback();
  else document.documentElement.classList.add('is-fallback');
}

function leave(el) {
  el.classList.add('leaving');
  setTimeout(() => { el.hidden = true; el.classList.remove('leaving'); }, 800);
}

export async function boot({ params, onStart, loadWorld }) {
  fillCard($('card'));
  if (params.noWebGL || !hasWebGL()) { showFallback(); return 'fallback'; }
  let timer;
  try {
    if (params.forceFail) throw new Error('forcefail');
    await Promise.race([
      loadWorld(),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), LIMITS.loadTimeoutMs); }),
    ]);
  } catch (err) {
    console.warn('[boot] chuyển sang thiệp 2D:', err && err.message);
    showFallback();
    return 'fallback';
  } finally {
    clearTimeout(timer);
  }
  window.__ready = true;
  $('loading').hidden = true;
  const start = $('start');
  const go = () => { leave(start); onStart(); };
  if (params.autostart) { start.hidden = true; onStart(); }
  else { start.hidden = false; $('open-gift').addEventListener('click', go, { once: true }); }
  return 'webgl';
}
