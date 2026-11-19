import test from 'node:test'; import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
test('pinned CDN versions', () => {
  for (const v of ['three@0.160.0', 'gsap@3.12.5', 'es-module-shims@1.10.0']) assert.ok(html.includes(v), v);
});
test('link preview tags', () => {
  assert.match(html, /property="og:title"/);
  assert.match(html, /property="og:image"\s+content="assets\/og\.png"/);
});
test('relative paths only', () => {
  assert.doesNotMatch(html, /(src|href)="\/(?!\/)/);
});
test('required element ids', () => {
  for (const id of ['loading','start','open-gift','caption','card','controls','replay','music','fallback','scene'])
    assert.match(html, new RegExp(`id="${id}"`), id);
});
test('vietnamese lang and fonts', () => {
  assert.match(html, /<html lang="vi">/);
  assert.match(html, /Be\+Vietnam\+Pro/);
  assert.match(html, /Dancing\+Script/);
  assert.match(html, /display=swap/);
});
import { CARD } from '../js/config.js';
test('card copy is in static HTML (works even when JS modules fail)', () => {
  for (const k of ['greeting','body','signature','footer']) assert.ok(html.includes(CARD[k]), k);
});
test('watchdog falls back without modules', () => {
  assert.match(html, /<script nomodule>/);
  assert.match(html, /__ready/);
});
