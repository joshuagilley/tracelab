import type { BlackGeom, S3Geom } from '@/components/simulations/design-patterns/dependencyInjectionSimulationRoute'

export type DiStorageExitEdgesInput = {
  black: BlackGeom
  midY: number
  s3Top: S3Geom
  s3Bot: S3Geom
  mockSink: { x: number; y: number }
  m2: string
  activeSftp: boolean
  activeWebdav: boolean
  activeMock: boolean
}

export type ExitEdge = {
  d: string
  stroke: string
  strokeWidth: number
  opacity: number
  dash?: string
  markerEnd?: string
}

export function buildDiStorageExitEdges(p: DiStorageExitEdgesInput): ExitEdge[] {
  return [
    {
      d: `M ${p.black.right} ${p.midY} L ${p.s3Top.x} ${p.s3Top.y + 48}`,
      stroke: 'var(--color-info)',
      strokeWidth: p.activeSftp ? 2 : 1,
      opacity: p.activeSftp ? 0.85 : 0.15,
      markerEnd: p.activeSftp ? `url(#${p.m2})` : undefined,
    },
    {
      d: `M ${p.black.right} ${p.midY} L ${p.s3Bot.x} ${p.s3Bot.y + 48}`,
      stroke: 'var(--color-easy)',
      strokeWidth: p.activeWebdav ? 2 : 1,
      opacity: p.activeWebdav ? 0.85 : 0.15,
      markerEnd: p.activeWebdav ? `url(#${p.m2})` : undefined,
    },
    {
      d: `M ${p.black.right} ${p.midY} L ${p.mockSink.x} ${p.mockSink.y}`,
      stroke: 'var(--color-medium)',
      strokeWidth: p.activeMock ? 2 : 1,
      opacity: p.activeMock ? 0.85 : 0.18,
      dash: '6 4',
    },
  ]
}
