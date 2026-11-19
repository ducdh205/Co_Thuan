import test from 'node:test'; import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { roundRectPath } from '../js/canvas.js';
import { fontsReady } from '../js/fonts.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

// Icon: SVG nhúng sẵn, không còn emoji (hiển thị khác nhau giữa các máy)
test('buttons use inline svg icons, not emoji', () => {
  for (const id of ['gift', 'replay', 'volume-on', 'volume-off', 'sparkles']) assert.match(html, new RegExp(`<symbol id="i-${id}"`));
  assert.match(html, /id="open-gift"[\s\S]*?<use href="#i-gift"/);
  assert.match(html, /id="replay"[\s\S]*?<use href="#i-replay"/);
  assert.doesNotMatch(html, /[🎁🔇🔊↻★]/u);
});
test('favicon is a real svg file', () => {
  assert.match(html, /<link rel="icon" href="assets\/icon\.svg" type="image\/svg\+xml">/);
  assert.match(readFileSync(new URL('../assets/icon.svg', import.meta.url), 'utf8'), /^<svg/);
});
test('music button starts off and announces its state', () => {
  assert.match(html, /id="music"[^>]*aria-pressed="false"/);
});

// Safari < 16 không có ctx.roundRect → không được ném lỗi
test('roundRectPath works without ctx.roundRect', () => {
  const calls = [];
  const plain = { beginPath() { calls.push(['beginPath']); }, moveTo() { calls.push(['moveTo']); }, arcTo() { calls.push(['arcTo']); }, closePath() { calls.push(['closePath']); } };
  roundRectPath(plain, 0, 0, 100, 40, 28);
  assert.equal(calls.filter((c) => c[0] === 'arcTo').length, 4);
  assert.equal(calls.at(-1)[0], 'closePath');
});
test('roundRectPath uses native roundRect when present', () => {
  let used = null;
  roundRectPath({ beginPath() {}, roundRect(...a) { used = a; } }, 1, 2, 3, 4, 5);
  assert.deepEqual(used, [1, 2, 3, 4, 5]);
});

// Font: phải chờ stylesheet Google Fonts nạp xong rồi mới fonts.load
function fakeDoc({ media = 'print', loadsAfter = 10 } = {}) {
  const order = [];
  const link = {
    media, listeners: {},
    addEventListener(ev, fn) { this.listeners[ev] = fn; },
  };
  if (loadsAfter !== null) setTimeout(() => { link.media = 'all'; order.push('css'); link.listeners.load && link.listeners.load(); }, loadsAfter);
  return {
    order,
    querySelector: () => link,
    fonts: { load: async (f) => { order.push(`load:${f}`); return []; } },
  };
}
test('fontsReady waits for the stylesheet before loading faces', async () => {
  const doc = fakeDoc();
  await fontsReady(doc, { faces: ['700 64px X'], timeoutMs: 500 });
  assert.deepEqual(doc.order, ['css', 'load:700 64px X']);
});
test('fontsReady gives up on a stuck stylesheet', async () => {
  const doc = fakeDoc({ loadsAfter: null });
  const t0 = Date.now();
  await fontsReady(doc, { faces: ['700 64px X'], timeoutMs: 60 });
  assert.ok(Date.now() - t0 < 400);
});
test('fontsReady skips waiting when stylesheet already applied', async () => {
  const doc = fakeDoc({ media: 'all', loadsAfter: null });
  await fontsReady(doc, { faces: ['a'], timeoutMs: 5000 });
  assert.deepEqual(doc.order, ['load:a']);
});
