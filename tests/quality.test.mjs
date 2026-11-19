import test from 'node:test'; import assert from 'node:assert/strict';
import { pickQuality } from '../js/quality.js';
test('laptop high', () => assert.deepEqual(pickQuality({width:1440,dpr:2,cores:8,forced:null}), {tier:'high',pixelRatio:2,bloom:true,sparkCount:60}));
test('weak phone low', () => assert.deepEqual(pickQuality({width:390,dpr:3,cores:4,forced:null}), {tier:'low',pixelRatio:1.5,bloom:false,sparkCount:30}));
test('dpr capped at 2', () => assert.equal(pickQuality({width:390,dpr:3,cores:8,forced:null}).pixelRatio, 2));
test('forced high wins', () => assert.equal(pickQuality({width:390,dpr:1,cores:2,forced:'high'}).tier,'high'));
