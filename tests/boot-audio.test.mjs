import test from 'node:test'; import assert from 'node:assert/strict';

function fakeDom() {
  const classes = new Set();
  const el = () => ({ hidden: false, textContent: '', classList: { add() {}, remove() {} }, addEventListener() {}, querySelector: () => ({ textContent: '' }) });
  const els = {};
  globalThis.window = { WebGLRenderingContext: function () {}, __ready: false, __showFallback: () => classes.add('is-fallback') };
  globalThis.document = {
    getElementById: (id) => (els[id] ||= el()),
    documentElement: { classList: { add: (c) => classes.add(c), contains: (c) => classes.has(c) } },
    createElement: () => ({ getContext: () => ({}) }),
  };
  return { classes };
}
const params = { noWebGL: false, forceFail: false, autostart: false };

// Important 5: thế giới tải xong muộn (sau khi đã sang thiệp 2D) không được chạy ngầm
test('late world load after timeout never calls onReady', async () => {
  fakeDom();
  const { boot } = await import('../js/boot.js');
  let ready = false;
  const slow = () => new Promise((r) => setTimeout(r, 80));
  const res = await boot({ params, loadWorld: slow, onStart() {}, onReady: () => (ready = true), timeoutMs: 20 });
  assert.equal(res, 'fallback');
  await new Promise((r) => setTimeout(r, 120));
  assert.equal(ready, false);
});
test('watchdog fallback already shown → world not started', async () => {
  const { classes } = fakeDom();
  const { boot } = await import('../js/boot.js');
  let ready = false;
  const load = async () => { classes.add('is-fallback'); };
  const res = await boot({ params, loadWorld: load, onStart() {}, onReady: () => (ready = true), timeoutMs: 1000 });
  assert.equal(res, 'fallback');
  assert.equal(ready, false);
});
test('normal load calls onReady', async () => {
  fakeDom();
  const { boot } = await import('../js/boot.js');
  let ready = false;
  const res = await boot({ params, loadWorld: async () => {}, onStart() {}, onReady: () => (ready = true), timeoutMs: 1000 });
  assert.equal(res, 'webgl');
  assert.equal(ready, true);
});

// Important 2: iOS — Web Audio phải phát cả khi gạt nút im lặng
test('synth music requests playback audio session', async () => {
  class Node { connect(n) { return n; } }
  class Ctx {
    constructor() { this.currentTime = 0; this.state = 'suspended'; this.destination = new Node(); }
    createGain() { const n = new Node(); n.gain = { value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, cancelScheduledValues() {} }; return n; }
    createDelay() { const n = new Node(); n.delayTime = { value: 0 }; return n; }
  }
  globalThis.window = { AudioContext: Ctx };
  Object.defineProperty(globalThis.navigator, 'audioSession', { value: { type: 'auto' }, configurable: true });
  const { createMusic } = await import('../js/audio.js');
  createMusic({ hasFile: false });
  assert.equal(navigator.audioSession.type, 'playback');
});
