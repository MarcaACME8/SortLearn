import { test } from 'node:test';
import assert from 'node:assert/strict';
import { traceSort, Playback } from '../src/algorithms.js';

for (const algorithm of ['bubble', 'insertion', 'merge', 'quick']) {
  test(algorithm + ': resultado correcto y entrada intacta', () => {
    const samples = [[], [1], [3, 2, 1], [1, 2, 3], [2, 2, 1], [-3, 0, -1, 2.5]];
    // Casos deterministas adicionales con duplicados y negativos.
    for (let n = 2; n <= 30; n++) samples.push(Array.from({length:n}, (_, i) => (i * 17 + n * 7) % 23 - 11));
    for (const input of samples) {
      const original = [...input];
      const steps = traceSort(algorithm, input);
      assert.deepEqual(steps.at(-1).values, [...input].sort((a,b) => a-b));
      assert.deepEqual(input, original);
      assert.deepEqual(steps[0].values, original);
      assert.equal(steps.at(-1).kind, 'complete');
      for (const step of steps) {
        assert.equal(step.values.length, input.length);
        assert.ok(step.indices.every(i => Number.isInteger(i) && i >= 0 && i < input.length));
      }
      if (input.length) {
        steps.at(-1).values[0] = 9999;
        assert.deepEqual(steps[0].values, original);
      }
    }
  });
}
test('rechaza entradas inválidas y algoritmos desconocidos', () => {
  for (const input of [null, '1,2', [NaN], [Infinity], ['2'], Array(2), Array(101).fill(0)]) {
    assert.throws(() => traceSort('bubble', input), TypeError);
  }
  assert.throws(() => traceSort('unknown', []), RangeError);
});
test('reproducción respeta límites, retroceso y reinicio', () => {
  const steps = traceSort('bubble', [3, 1, 2]);
  const player = new Playback(steps);
  assert.equal(player.previous(), steps[0]);
  player.next(); player.next();
  assert.equal(player.previous(), steps[1]);
  for (let i=0; i<steps.length+2; i++) player.next();
  assert.equal(player.current, steps.at(-1));
  assert.equal(player.reset(), steps[0]);
  assert.throws(() => new Playback([]), TypeError);
});
