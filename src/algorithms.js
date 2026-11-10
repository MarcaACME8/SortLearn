/** Estados independientes para avanzar, retroceder y reiniciar la visualización. */
export function traceSort(algorithm, input) {
  if (!Array.isArray(input) || input.length > 100 ||
      Array.from(input).some(x => typeof x !== 'number' || !Number.isFinite(x))) {
    throw new TypeError('Se requieren hasta 100 números finitos.');
  }
  const a = [...input], steps = [];
  const record = (kind, indices = [], description = '') =>
    steps.push({ values: [...a], kind, indices: [...indices], description,
      codeLine: kind === 'complete' ? null : ({
        bubble: {initial:0,compare:1,swap:2},
        insertion: {initial:0,compare:1,swap:2},
        merge: {initial:0,split:0,compare:2,write:3},
        quick: {initial:0,pivot:0,compare:1,swap:2}
      }[algorithm]?.[kind] ?? null) });
  const swap = (i, j) => {
    const left=a[i],right=a[j];
    [a[i], a[j]] = [a[j], a[i]];
    record('swap', [i, j], 'Intercambiar '+left+' (posición '+i+') con '+right+' (posición '+j+'). El arreglo queda ['+a.join(', ')+']. '+(algorithm==='quick'?'El intercambio organiza la partición alrededor del pivote.':'El menor queda antes del mayor.'));
  };
  const compare = (i, j) => record('compare', [i, j],
    algorithm==='quick'
    ? 'Comparar '+a[i]+' con el pivote '+a[j]+'. '+(a[i]<=a[j]?'Es menor o igual: pertenece a la zona izquierda.':'Es mayor: permanece en la zona derecha por ahora.')
    : 'Comparar '+a[i]+' (posición '+i+') con '+a[j]+' (posición '+j+'). '+(a[i]>a[j]?'El izquierdo es mayor: el siguiente paso los intercambia.':'Ya están en orden: no se intercambian.'));
  record('initial', [], 'Estado inicial: ['+a.join(', ')+']. Usa Paso siguiente para leer una operación a la vez. El objetivo es ordenar de menor a mayor.');
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
      record('split', [lo, mid, hi - 1], 'Dividir ['+a.slice(lo,hi).join(', ')+'] en ['+a.slice(lo,mid).join(', ')+'] y ['+a.slice(mid,hi).join(', ')+']. Ordenar cada mitad antes de mezclarlas.');
      merge(lo, mid); merge(mid, hi);
      const left = a.slice(lo, mid), right = a.slice(mid, hi);
      let i = 0, j = 0, k = lo;
      while (i < left.length || j < right.length) {
        if (i < left.length && j < right.length) {
          record('compare', [], 'Comparar ' + left[i] + ' y ' + right[j] + ' en las mitades auxiliares. Se copiará '+Math.min(left[i],right[j])+' por ser el menor disponible.');
        }
        const value = j >= right.length || (i < left.length && left[i] <= right[j])
          ? left[i++] : right[j++];
        a[k] = value;
        record('write', [k], 'Copiar ' + value + ' a la posición '+k+' desde la mitad auxiliar y avanzar en esa mitad. Los originales siguen en memoria auxiliar mientras se completa la mezcla.');k++;
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
  record('complete', [], 'Ordenamiento terminado: ['+a.join(', ')+']. Cada elemento es menor o igual que el siguiente. Puedes retroceder para repasar las decisiones.');
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
