export type StorageBackend = 'sftp' | 'webdav' | 'mock'

export interface DIStats {
  uploadsCompleted: number
  putCalls: number
  wires: number
}

export interface DiParticle {
  id: number
  t: number
  handlerIndex: number
}

export const DI_PATH_SPEED = 0.78

export type BlackGeom = { x: number; y: number; w: number; h: number; cx: number; right: number }
export type UplGeom = { x: number; y: number; w: number; h: number; cx: number; cy: number }
export type S3Geom = { x: number; y: number; w: number; h: number }

function lerp(a: number, b: number, u: number) {
  return a + (b - a) * u
}

export function posAlongPolyline(points: { x: number; y: number }[], t: number): { x: number; y: number } {
  if (points.length === 0) return { x: 0, y: 0 }
  if (points.length === 1) return points[0]
  const n = points.length
  const floatSeg = Math.min(Math.max(t, 0), 1) * (n - 1)
  const seg = Math.min(Math.floor(floatSeg), n - 2)
  const u = floatSeg - seg
  return {
    x: lerp(points[seg].x, points[seg + 1].x, u),
    y: lerp(points[seg].y, points[seg + 1].y, u),
  }
}

export function particleDoneColor(b: StorageBackend): string {
  switch (b) {
    case 'mock':
      return 'var(--color-medium)'
    case 'webdav':
      return 'var(--color-easy)'
    default:
      return 'var(--color-info)'
  }
}

/** Build route: jobs → IngestService (left edge) → injected uploader (inside) → exit → destination */
export function routePoints(
  backend: StorageBackend,
  handlerIndex: number,
  leftCx: number,
  midY: number,
  handlerY: (i: number) => number,
  black: BlackGeom,
  upl: UplGeom,
  s3Top: S3Geom,
  s3Bot: S3Geom,
  mockSink: { x: number; y: number },
): { x: number; y: number }[] {
  const iSafe = Math.min(Math.max(0, handlerIndex), 7)
  const p0 = { x: leftCx + 48, y: handlerY(iSafe) }
  const pEnter = { x: black.x, y: midY }
  const pInUpl = { x: upl.cx, y: upl.cy }
  const pExit = { x: black.right, y: midY }

  if (backend === 'mock') {
    return [p0, pEnter, pInUpl, pExit, mockSink]
  }
  if (backend === 'webdav') {
    const dest = { x: s3Bot.x + s3Bot.w / 2, y: s3Bot.y + 48 }
    return [p0, pEnter, pInUpl, pExit, dest]
  }
  const dest = { x: s3Top.x + s3Top.w / 2, y: s3Top.y + 48 }
  return [p0, pEnter, pInUpl, pExit, dest]
}
