/** Client-side stand-in for NumPy demos (matches static prod; no Python execution). */
export type NumpyFn = 'ones' | 'zeros' | 'arange' | 'linspace'

export function computeArray(fn: NumpyFn, n: number): number[] {
  const len = Math.max(1, Math.min(64, Math.round(n)))
  switch (fn) {
    case 'ones':
      return Array.from({ length: len }, () => 1)
    case 'zeros':
      return Array.from({ length: len }, () => 0)
    case 'arange':
      return Array.from({ length: len }, (_, i) => i)
    case 'linspace':
      if (len === 1) return [0]
      return Array.from({ length: len }, (_, i) => i / (len - 1))
  }
}

export function stats(values: number[]) {
  if (!values.length) return { sum: 0, mean: 0, min: 0, max: 0 }
  const sum = values.reduce((a, b) => a + b, 0)
  return {
    sum,
    mean: sum / values.length,
    min: Math.min(...values),
    max: Math.max(...values),
  }
}
