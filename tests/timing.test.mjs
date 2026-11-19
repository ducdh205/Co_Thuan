import test from 'node:test'; import assert from 'node:assert/strict';
import { SCENES, CARD } from '../js/config.js';
import { totalDuration, sceneAt, parseParams, playbackRate } from '../js/timing.js';
test('watch time at most 60s', () => assert.ok(totalDuration() / playbackRate() <= 60));
test('total is 95s', () => assert.equal(totalDuration(), 95));
test('scenes contiguous', () => SCENES.slice(1).forEach((s,i)=>assert.equal(s.start, SCENES[i].start+SCENES[i].duration)));
test('sceneAt inside', () => assert.deepEqual(sceneAt(30), { id:'island', index:2, local:3 }));
test('sceneAt boundary goes to next', () => assert.equal(sceneAt(12).id, 'launch'));
test('sceneAt clamps', () => { assert.equal(sceneAt(-5).id,'sea'); assert.deepEqual(sceneAt(500), { id:'card', index:5, local:8 }); });
test('card copy verbatim', () => { assert.equal(CARD.greeting,'Kính gửi cô Thuận'); assert.equal(CARD.signature,'Em, Thu Phương'); assert.match(CARD.body, /ngọn hải đăng của bao thế hệ học trò\.$/); });
test('parseParams', () => {
  assert.deepEqual(parseParams('?t=30&autostart=1&quality=low'), { seek:30, autostart:true, noWebGL:false, forceFail:false, quality:'low' });
  assert.deepEqual(parseParams(''), { seek:null, autostart:false, noWebGL:false, forceFail:false, quality:null });
  assert.equal(parseParams('?t=abc').seek, null);
});
