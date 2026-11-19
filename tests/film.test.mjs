import test from 'node:test'; import assert from 'node:assert/strict';
import { cameraKeys, boatKeys } from '../js/keys.js';
import { SCENES } from '../js/config.js';
const keys = cameraKeys();
test('camera keys sorted, start at 0, end within 95', () => {
  keys.slice(1).forEach((k, i) => assert.ok(k.t > keys[i].t));
  assert.equal(keys[0].t, 0);
  assert.ok(keys.at(-1).t <= 95);
});
test('a key at every scene start', () => SCENES.forEach((s) => assert.ok(keys.some((k) => k.t === s.start), s.id)));
test('aerial key during city scene', () => assert.ok(keys.some((k) => k.t >= 65 && k.t < 87 && k.pos[1] >= 80)));
test('boat keys sorted and docked before card', () => {
  const b = boatKeys();
  b.slice(1).forEach((k, i) => assert.ok(k.t > b[i].t));
  assert.ok(b.at(-1).t <= 87);
});
