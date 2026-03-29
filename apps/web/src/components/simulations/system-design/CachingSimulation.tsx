import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './CachingSimulation.module.css'

// ─── Packet animation types ────────────────────────────────────

type PacketType = 'hit' | 'miss'

// Each packet follows a path of named segments.
// hit path:  client→cache  then  cache→client
// miss path: client→cache  then  cache→db  then  db→cache  then  cache→client
type Segment = 'c2cache' | 'cache2db' | 'db2cache' | 'cache2client'

interface Packet {
  id: number
  type: PacketType
  segments: Segment[]
  segIdx: number
  progress: number  // 0 → 1 within current segment
}

export interface SimMetrics {
  hits: number
  misses: number
  total: number
}

interface Props {
  isRunning: boolean
  hitRate: number              // 0–1, e.g. 0.7 = 70% hit rate
  onMetrics: (m: SimMetrics) => void
  onToggleRun: () => void
}

// ─── SVG layout constants ──────────────────────────────────────

const SVG_W = 800
const SVG_H = 280

const NODES = {
  client: { x: 80,  y: 110, w: 90, h: 56, label: 'CLIENT',   sub: 'origin' },
  cache:  { x: 355, y: 110, w: 90, h: 56, label: 'L1 CACHE', sub: 'redis'  },
  db:     { x: 630, y: 110, w: 90, h: 56, label: 'DATABASE', sub: 'postgres' },
}

// y offsets: requests travel at y-4, responses at y+4
const REQ_Y = -6
const RES_Y = +6

function segPos(seg: Segment, t: number): { x: number; y: number } {
  const lerp = (a: number, b: number) => a + (b - a) * t
  const cx = (n: { x: number; w: number }) => n.x + n.w / 2
  const cy = (n: { y: number; h: number }) => n.y + n.h / 2

  switch (seg) {
    case 'c2cache':
      return { x: lerp(cx(NODES.client) + NODES.client.w / 2 - 5, cx(NODES.cache) - NODES.cache.w / 2 + 5), y: cy(NODES.client) + REQ_Y }
    case 'cache2db':
      return { x: lerp(cx(NODES.cache) + NODES.cache.w / 2 - 5, cx(NODES.db) - NODES.db.w / 2 + 5), y: cy(NODES.cache) + REQ_Y }
    case 'db2cache':
      return { x: lerp(cx(NODES.db) - NODES.db.w / 2 + 5, cx(NODES.cache) + NODES.cache.w / 2 - 5), y: cy(NODES.db) + RES_Y }
    case 'cache2client':
      return { x: lerp(cx(NODES.cache) - NODES.cache.w / 2 + 5, cx(NODES.client) + NODES.client.w / 2 - 5), y: cy(NODES.cache) + RES_Y }
  }
}

const HIT_PATH:  Segment[] = ['c2cache', 'cache2client']
const MISS_PATH: Segment[] = ['c2cache', 'cache2db', 'db2cache', 'cache2client']

const SEG_DURATION = 550  // ms per segment
const SPAWN_MS     = 900  // spawn a new packet every N ms

// ─── Component ────────────────────────────────────────────────

export default function CachingSimulation({ isRunning, hitRate, onMetrics, onToggleRun }: Props) {
  const [packets, setPackets]   = useState<Packet[]>([])
  const nextId   = useRef(0)
  const metrics  = useRef<SimMetrics>({ hits: 0, misses: 0, total: 0 })
  const onMetricsRef = useRef(onMetrics)
  onMetricsRef.current = onMetrics

  // Clear when simulation stops
  useEffect(() => {
    if (!isRunning) setPackets([])
  }, [isRunning])

  // Spawn packets
  const spawn = useCallback(() => {
    const isHit = Math.random() < hitRate
    setPackets(prev => [
      ...prev,
      {
        id:       nextId.current++,
        type:     isHit ? 'hit' : 'miss',
        segments: isHit ? HIT_PATH : MISS_PATH,
        segIdx:   0,
        progress: 0,
      },
    ])
  }, [hitRate])

  useEffect(() => {
    if (!isRunning) return
    spawn()
    const id = setInterval(spawn, SPAWN_MS)
    return () => clearInterval(id)
  }, [isRunning, spawn])

  // Animate packets via rAF — driven by isRunning only; reads/writes packets via
  // the setState updater so it always sees the latest state without restarting.
  useEffect(() => {
    if (!isRunning) return
    let last: number | null = null
    let raf: number

    const tick = (now: number) => {
      if (last === null) last = now
      const dt = now - last
      last = now

      setPackets(prev => {
        const next: Packet[] = []
        for (const p of prev) {
          const np = p.progress + dt / SEG_DURATION
          if (np >= 1) {
            const nextIdx = p.segIdx + 1
            if (nextIdx >= p.segments.length) {
              const m = metrics.current
              if (p.type === 'hit') m.hits++
              else m.misses++
              m.total++
              onMetricsRef.current({ ...m })
              continue
            }
            next.push({ ...p, segIdx: nextIdx, progress: np - 1 })
          } else {
            next.push({ ...p, progress: np })
          }
        }
        return next
      })

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isRunning])

  // Reset metrics when simulation restarts
  useEffect(() => {
    if (isRunning) {
      metrics.current = { hits: 0, misses: 0, total: 0 }
    }
  }, [isRunning])

  return (
    <div className={`panel ${styles.panel}`}>
      <div className="panel-header">
        <span className="panel-label">Architecture Visualizer</span>
        <div className={styles.headerRight}>
          <div className="status-dot">
            <span className={`dot ${isRunning ? 'live' : ''}`} />
            <span>{isRunning ? 'SIMULATION LIVE' : 'READY'}</span>
          </div>
          <button
            className={[styles.runBtn, isRunning ? styles.runBtnActive : ''].join(' ')}
            onClick={onToggleRun}
          >
            <span>{isRunning ? '■' : '▶'}</span>
            {isRunning ? 'STOP' : 'EXECUTE SIMULATION'}
          </button>
        </div>
      </div>

      <div className={styles.body}>
        <p className={styles.subtitle}>
          Live simulation of Distributed Cache architecture.
          Monitor cache hits, misses, and data flow in real-time.
        </p>

        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className={styles.svg}
          aria-label="Caching architecture visualizer"
        >
          <ConnLines />
          {Object.entries(NODES).map(([key, n]) => (
            <VisNode
              key={key}
              node={n}
              highlight={key === 'cache'}
            />
          ))}
          {packets.map(p => {
            const seg = p.segments[p.segIdx]
            const { x, y } = segPos(seg, p.progress)
            const color =
              p.type === 'hit'
                ? 'var(--accent)'
                : p.segIdx <= 1
                ? '#f04d4d'
                : '#f0a040'
            return (
              <circle
                key={p.id}
                cx={x}
                cy={y}
                r={5}
                fill={color}
                style={{ filter: `drop-shadow(0 0 4px ${color})` }}
              />
            )
          })}
        </svg>

        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: 'var(--accent)' }} />
            Cache Hit
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#f04d4d' }} />
            Cache Miss (request)
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#f0a040' }} />
            Cache Miss (return)
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── SVG sub-components ────────────────────────────────────────

function ConnLines() {
  const cx = (n: { x: number; w: number }) => n.x + n.w / 2
  const cy = (n: { y: number; h: number }) => n.y + n.h / 2

  const lines = [
    // request paths (top)
    { x1: cx(NODES.client) + NODES.client.w / 2, y1: cy(NODES.client) + REQ_Y, x2: cx(NODES.cache) - NODES.cache.w / 2, y2: cy(NODES.cache) + REQ_Y },
    { x1: cx(NODES.cache)  + NODES.cache.w  / 2, y1: cy(NODES.cache)  + REQ_Y, x2: cx(NODES.db)    - NODES.db.w    / 2, y2: cy(NODES.db)    + REQ_Y },
    // response paths (bottom)
    { x1: cx(NODES.cache) - NODES.cache.w / 2, y1: cy(NODES.cache) + RES_Y, x2: cx(NODES.client) + NODES.client.w / 2, y2: cy(NODES.client) + RES_Y },
    { x1: cx(NODES.db)    - NODES.db.w    / 2, y1: cy(NODES.db)    + RES_Y, x2: cx(NODES.cache)  + NODES.cache.w  / 2, y2: cy(NODES.cache)  + RES_Y },
  ]

  return (
    <>
      {lines.map((l, i) => (
        <line
          key={i}
          x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke="#1f2640"
          strokeWidth={2}
          strokeDasharray="5 4"
        />
      ))}
    </>
  )
}

interface VisNodeProps {
  node: { x: number; y: number; w: number; h: number; label: string; sub: string }
  highlight?: boolean
}

function VisNode({ node, highlight = false }: VisNodeProps) {
  const { x, y, w, h, label, sub } = node
  const border = highlight ? 'var(--accent)' : '#2a3254'
  const bg     = highlight ? 'rgba(61,232,200,0.06)' : 'var(--bg-elevated)'
  const color  = highlight ? 'var(--accent)' : 'var(--text-secondary)'

  return (
    <g>
      <rect
        x={x} y={y} width={w} height={h}
        rx={8}
        fill={bg}
        stroke={border}
        strokeWidth={highlight ? 1.5 : 1}
      />
      {highlight && (
        <rect
          x={x} y={y} width={w} height={h}
          rx={8}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={1}
          opacity={0.3}
          style={{ filter: 'blur(3px)' }}
        />
      )}
      <text
        x={x + w / 2} y={y + h / 2 - 8}
        textAnchor="middle"
        fill={color}
        fontSize={12}
        fontFamily="var(--font-mono)"
        fontWeight="600"
        letterSpacing="0.05em"
      >
        {label}
      </text>
      <text
        x={x + w / 2} y={y + h / 2 + 10}
        textAnchor="middle"
        fill="var(--text-muted)"
        fontSize={9}
        fontFamily="var(--font-mono)"
        letterSpacing="0.04em"
      >
        {sub.toUpperCase()}
      </text>
    </g>
  )
}
