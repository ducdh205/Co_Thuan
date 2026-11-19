import test from 'node:test'; import assert from 'node:assert/strict';
import { melodyNotes, loopSeconds } from '../js/audio.js';
test('melody has notes', () => assert.ok(melodyNotes().length > 16));
test('notes in gentle range', () => melodyNotes().forEach((n) => assert.ok(n.freq >= 196 && n.freq <= 1047, String(n.freq))));
test('notes fit the loop', () => melodyNotes().forEach((n) => assert.ok(n.start >= 0 && n.start + n.dur <= loopSeconds() + 1e-9)));
test('notes sorted by start', () => { const s = melodyNotes().map((n) => n.start); assert.deepEqual(s, [...s].sort((a, b) => a - b)); });
