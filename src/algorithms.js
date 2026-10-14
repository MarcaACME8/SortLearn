/** Estados independientes para avanzar, retroceder y reiniciar la visualización. */
export function traceSort(algorithm, input) {
  if (!Array.isArray(input) || input.length > 100 ||
      Array.from(input).some(x => typeof x !== 'number' || !Number.isFinite(x))) {
    throw new TypeError('Se requieren hasta 100 números finitos.');
  }
  const a = [...input], steps = [];
  const record = (kind, indices = [], description = '') =>
    steps.push({ values: [...a], kind, indices: [...indices], description });
  const swap = (i, j) => {
    [a[i], a[j]] = [a[j], a[i]];
    record('swap', [i, j], 'Intercambiar los elementos señalados.');
  };
  const compare = (i, j) => record('compare', [i, j], 'Comparar los elementos señalados.');
  record('initial', [], 'Estado inicial.');
  if (algorithm === 'bubble') {
    for (let end = a.length - 1; end > 0; end--) {
      let changed = false;
      for (let j = 0; j < end; j++) {
        compare(j, j + 1);
        if (a[j] > a[j + 1]) { swap(j, j + 1); changed = true; }
      }
      if (!changed) break;
    }
  } else if (algorithm === 'insertion') {
    for (let i = 1; i < a.length; i++) {
      for (let j = i; j > 0; j--) {
        compare(j - 1, j);
        if (a[j - 1] <= a[j]) break;
        swap(j - 1, j);
      }
    }
  } else if (algorithm === 'merge') {
    const merge = (lo, hi) => {
      if (hi - lo < 2) return;
      const mid = Math.floor((lo + hi) / 2);
      record('split', [lo, mid, hi - 1], 'Dividir el intervalo en dos mitades.');
      merge(lo, mid); merge(mid, hi);
      const left = a.slice(lo, mid), right = a.slice(mid, hi);
      let i = 0, j = 0, k = lo;
      while (i < left.length || j < right.length) {
        if (i < left.length && j < right.length) {
          record('compare', [], 'Comparar ' + left[i] + ' y ' + right[j] + ' en las mitades auxiliares.');
        }
        const value = j >= right.length || (i < left.length && left[i] <= right[j])
          ? left[i++] : right[j++];
        a[k] = value;
        record('write', [k++], 'Copiar ' + value + ' desde la mitad auxiliar.');
      }
    };
    merge(0, a.length);
  } else if (algorithm === 'quick') {
    const quick = (lo, hi) => {
      if (lo >= hi) return;
      const pivot = a[hi];
      record('pivot', [hi], 'Seleccionar ' + pivot + ' como pivote.');
      let i = lo;
      for (let j = lo; j < hi; j++) {
        compare(j, hi);
        if (a[j] <= pivot) { if (i !== j) swap(i, j); i++; }
      }
      if (i !== hi) swap(i, hi);
      quick(lo, i - 1); quick(i + 1, hi);
    };
    quick(0, a.length - 1);
  } else {
    throw new RangeError('Algoritmo desconocido.');
  }
  record('complete', [], 'Ordenamiento terminado.');
  return steps;
}

export class Playback {
  constructor(steps) {
    if (!Array.isArray(steps) || !steps.length) throw new TypeError('Faltan los pasos.');
    this.steps = steps;
    this.index = 0;
  }
  get current() { return this.steps[this.index]; }
  next() { this.index = Math.min(this.index + 1, this.steps.length - 1); return this.current; }
  previous() { this.index = Math.max(0, this.index - 1); return this.current; }
  reset() { this.index = 0; return this.current; }
}
