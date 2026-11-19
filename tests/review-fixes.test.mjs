import test from 'node:test'; import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../css/style.css', import.meta.url), 'utf8');

// Important 1: chậm Google Fonts không được chặn watchdog / gây màn trắng
test('watchdog runs before any stylesheet', () => {
  assert.ok(html.indexOf('window.__ready') < html.indexOf('rel="stylesheet"'));
});
test('google fonts stylesheet is non-blocking', () => {
  assert.match(html, /<link[^>]+fonts\.googleapis\.com\/css2[^>]+media="print"[^>]+onload="this\.media='all'"/);
});

// Important 4: nút nhạc không được nói dối là đang phát
test('music button starts in the off state', () => {
  assert.match(html, /id="music"[^>]*>🔇</);
});

// Important 6: màn ngang thấp — thiệp không bị nút che
test('short landscape viewport keeps card above controls', () => {
  assert.match(css, /@media \(max-height: 520px\)[\s\S]*#card[\s\S]*max-height: calc\(100dvh - 96px\)/);
});

// Important 3: quay lại tab ở thiệp cuối → nhạc chạy tiếp nếu không tắt tiếng
import { visibilityActions } from '../js/visibility.js';
test('return to tab on the end card resumes music', () => {
  assert.deepEqual(visibilityActions({ hidden: false, started: true, ended: true, muted: false, frozen: false }), { film: null, music: 'play' });
});
test('return to tab mid-film resumes both', () => {
  assert.deepEqual(visibilityActions({ hidden: false, started: true, ended: false, muted: false, frozen: false }), { film: 'resume', music: 'play' });
});
test('muted stays muted on return', () => {
  assert.deepEqual(visibilityActions({ hidden: false, started: true, ended: false, muted: true, frozen: false }), { film: 'resume', music: null });
});
test('hide pauses both', () => {
  assert.deepEqual(visibilityActions({ hidden: true, started: true, ended: true, muted: false, frozen: false }), { film: 'pause', music: 'pause' });
});
test('not started or frozen does nothing', () => {
  assert.deepEqual(visibilityActions({ hidden: false, started: false, ended: false, muted: false, frozen: false }), { film: null, music: null });
  assert.deepEqual(visibilityActions({ hidden: false, started: true, ended: false, muted: false, frozen: true }), { film: null, music: null });
});
