import type { VizProps } from './types'

export function getNumber(
  params: VizProps['paramValues'],
  key: string,
  fallback: number,
): number {
  const value = params[key]
  return typeof value === 'number' ? value : fallback
}

export function getBoolean(
  params: VizProps['paramValues'],
  key: string,
  fallback: boolean,
): boolean {
  const value = params[key]
  return typeof value === 'boolean' ? value : fallback
}

export function getString<T extends string>(
  params: VizProps['paramValues'],
  key: string,
  fallback: T,
): T {
  const value = params[key]
  return typeof value === 'string' ? (value as T) : fallback
}
