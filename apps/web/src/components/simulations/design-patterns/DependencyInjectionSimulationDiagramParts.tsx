import {
  particleDoneColor,
  posAlongPolyline,
  routePoints,
  type BlackGeom,
  type DiParticle,
  type S3Geom,
  type StorageBackend,
  type UplGeom,
} from '@/components/simulations/design-patterns/dependencyInjectionSimulationRoute'
import { buildDiStorageExitEdges, type DiStorageExitEdgesInput } from '@/components/simulations/design-patterns/dependencyInjectionDiagramExitEdges'
import styles from './DependencyInjectionSimulation.module.css'

export function DiDiagramDefs({ uid, m2 }: { uid: string; m2: string }) {
  return (
    <defs>
      <marker id={m2} markerWidth={8} markerHeight={8} refX={7} refY={4} orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="var(--accent)" />
      </marker>
      <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <linearGradient id={`${uid}-s3top`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--color-info)" stopOpacity="0.35" />
        <stop offset="100%" stopColor="var(--color-info)" stopOpacity="0.08" />
      </linearGradient>
      <linearGradient id={`${uid}-s3bot`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--color-easy)" stopOpacity="0.35" />
        <stop offset="100%" stopColor="var(--color-easy)" stopOpacity="0.08" />
      </linearGradient>
    </defs>
  )
}

export function DiDiagramJobsColumn({
  n,
  isRunning,
  handlerY,
  labels,
}: {
  n: number
  isRunning: boolean
  handlerY: (i: number) => number
  labels: string[]
}) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <g key={`job-${i}`}>
          <rect
            x={32}
            y={handlerY(i) - 22}
            width={92}
            height={44}
            rx={8}
            fill="var(--bg-elevated)"
            stroke="var(--border)"
            className={isRunning ? styles.handlerGlow : ''}
          />
          <text
            x={78}
            y={handlerY(i) + 5}
            textAnchor="middle"
            fill="var(--text-secondary)"
            fontSize={11}
            fontFamily="var(--font-mono)"
          >
            {labels[i] ?? `Job ${i + 1}`}
          </text>
        </g>
      ))}
    </>
  )
}

export function DiJobIngressPaths({
  n,
  leftCx,
  handlerY,
  black,
  midY,
}: {
  n: number
  leftCx: number
  handlerY: (i: number) => number
  black: BlackGeom
  midY: number
}) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <path
          key={`in-${i}`}
          d={`M ${leftCx + 48} ${handlerY(i)} L ${black.x} ${midY}`}
          stroke="var(--border)"
          strokeWidth={1}
          strokeDasharray="5 4"
          fill="none"
          opacity={0.35}
        />
      ))}
    </>
  )
}

export function DiIngestServiceShell({ black, midY }: { black: BlackGeom; midY: number }) {
  return (
    <>
      <rect
        x={black.x}
        y={black.y}
        width={black.w}
        height={black.h}
        rx={14}
        className={styles.blackBox}
        stroke="var(--accent)"
        strokeWidth={2}
      />
      <text
        x={black.cx}
        y={black.y + 22}
        textAnchor="middle"
        fill="var(--text-primary)"
        fontSize={12}
        fontFamily="var(--font-mono)"
        fontWeight={700}
      >
        IngestService
      </text>
      <text
        x={black.x + 14}
        y={midY + 5}
        textAnchor="start"
        fill="var(--text-secondary)"
        fontSize={9}
        fontFamily="var(--font-mono)"
        fontWeight={600}
      >
        uploader ObjectUploader
      </text>
    </>
  )
}

export function DiUploaderChip({
  upl,
  wirePulse,
  activeSftp,
  activeWebdav,
  storageBackend,
}: {
  upl: UplGeom
  wirePulse: boolean
  activeSftp: boolean
  activeWebdav: boolean
  storageBackend: StorageBackend
}) {
  return (
    <>
      <rect
        x={upl.x}
        y={upl.y}
        width={upl.w}
        height={upl.h}
        rx={8}
        fill="var(--bg-elevated)"
        stroke={
          wirePulse ? 'var(--color-medium)' : activeSftp ? 'var(--color-info)' : activeWebdav ? 'var(--color-easy)' : 'var(--color-medium)'
        }
        strokeWidth={wirePulse ? 2.5 : 2}
        className={wirePulse ? styles.boxFlash : ''}
      />
      <text
        x={upl.cx}
        y={upl.y + 19}
        textAnchor="middle"
        fill={activeSftp ? 'var(--color-info)' : activeWebdav ? 'var(--color-easy)' : 'var(--color-medium)'}
        fontSize={10}
        fontFamily="var(--font-mono)"
        fontWeight={600}
      >
        {activeSftp ? 'SFTPUploader' : activeWebdav ? 'WebDAVUploader' : 'MockUploader'}
      </text>
      <text x={upl.cx} y={upl.y + 34} textAnchor="middle" fill="var(--text-muted)" fontSize={7} fontFamily="var(--font-mono)">
        {storageBackend === 'sftp' ? 'SSH · bucket A' : storageBackend === 'webdav' ? 'token · bucket B' : 'no remote keys'}
      </text>
    </>
  )
}

export function DiStorageExitPaths(p: DiStorageExitEdgesInput) {
  const edges = buildDiStorageExitEdges(p)
  return (
    <>
      {edges.map((e, i) => (
        <path
          key={i}
          d={e.d}
          stroke={e.stroke}
          strokeWidth={e.strokeWidth}
          opacity={e.opacity}
          fill="none"
          strokeDasharray={e.dash}
          markerEnd={e.markerEnd}
        />
      ))}
      <text
        x={p.mockSink.x + 36}
        y={p.midY + 4}
        textAnchor="middle"
        fill="var(--color-medium)"
        fontSize={9}
        fontFamily="var(--font-mono)"
        opacity={p.activeMock ? 1 : 0.3}
      >
        mock: RAM only
      </text>
    </>
  )
}

export function DiParticlesLayer({
  particles,
  storageBackend,
  leftCx,
  midY,
  handlerY,
  black,
  upl,
  s3Top,
  s3Bot,
  mockSink,
}: {
  particles: DiParticle[]
  storageBackend: StorageBackend
  leftCx: number
  midY: number
  handlerY: (i: number) => number
  black: BlackGeom
  upl: UplGeom
  s3Top: S3Geom
  s3Bot: S3Geom
  mockSink: { x: number; y: number }
}) {
  const doneCol = particleDoneColor(storageBackend)
  return (
    <>
      {particles.map((p) => {
        const pts = routePoints(storageBackend, p.handlerIndex, leftCx, midY, handlerY, black, upl, s3Top, s3Bot, mockSink)
        const { x, y } = posAlongPolyline(pts, p.t)
        const phase = p.t
        let col = 'var(--accent)'
        if (phase >= 0.35 && phase < 0.72) col = 'var(--text-secondary)'
        if (phase >= 0.72) col = doneCol
        return <circle key={p.id} cx={x} cy={y} r={5} fill={col} style={{ filter: `drop-shadow(0 0 5px ${col})` }} />
      })}
    </>
  )
}
