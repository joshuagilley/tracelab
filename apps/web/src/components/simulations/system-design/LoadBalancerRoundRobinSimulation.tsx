import { useEffect, useRef, useState } from 'react'
import cachingStyles from './CachingSimulation.module.css'
import styles from './LoadBalancerRoundRobinSimulation.module.css'

const LABELS = ['A', 'B', 'C'] as const
const INTERVAL_MS = 650
/** ms to travel each leg (client→LB, LB→backend) */
const SEG_DURATION = 480

// Connection points (match SVG layout)
const CLIENT_OUT = { x: 112, y: 98 }
const LB_IN = { x: 200, y: 98 }
const LB_OUT = { x: 300, y: 98 }
const backendCx = (idx: number) => 360 + 23 + idx * 58
const BACKEND_Y = 100

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

interface Packet {
  id: number
  segIdx: 0 | 1
  progress: number
  target: 0 | 1 | 2
}

interface Props {
  isRunning: boolean
  onToggleRun: () => void
  onMetrics: (m: Record<string, string>) => void
}

function advancePackets(prev: Packet[], dt: number): { next: Packet[]; completed: number[] } {
  const next: Packet[] = []
  const completed: number[] = []

  for (const p of prev) {
    const np = p.progress + dt / SEG_DURATION
    if (np >= 1) {
      if (p.segIdx === 0) {
        next.push({ ...p, segIdx: 1, progress: np - 1 })
      } else {
        completed.push(p.target)
      }
    } else {
      next.push({ ...p, progress: np })
    }
  }

  return { next, completed }
}

function packetPos(p: Packet): { x: number; y: number } {
  const t = p.progress
  if (p.segIdx === 0) {
    return { x: lerp(CLIENT_OUT.x, LB_IN.x, t), y: CLIENT_OUT.y }
  }
  const cx = backendCx(p.target)
  return { x: lerp(LB_OUT.x, cx, t), y: lerp(LB_OUT.y, BACKEND_Y, t) }
}

export default function LoadBalancerRoundRobinSimulation({ isRunning, onToggleRun, onMetrics }: Props) {
  const packetsRef = useRef<Packet[]>([])
  const [, setFrame] = useState(0)
  const rrRef = useRef(0)
  const nextIdRef = useRef(0)
  const countsRef = useRef([0, 0, 0])
  const onMetricsRef = useRef(onMetrics)
  onMetricsRef.current = onMetrics

  const bump = () => setFrame(n => n + 1)

  useEffect(() => {
    if (!isRunning) {
      packetsRef.current = []
      rrRef.current = 0
      nextIdRef.current = 0
      countsRef.current = [0, 0, 0]
      onMetricsRef.current({
        current: '--',
        total: '--',
        reqA: '--',
        reqB: '--',
        reqC: '--',
      })
      bump()
    }
  }, [isRunning])

  useEffect(() => {
    if (!isRunning) return

    let last: number | null = null
    let raf: number

    const tick = (now: number) => {
      if (last === null) last = now
      const dt = Math.min(now - last, 48)
      last = now

      const { next, completed } = advancePackets(packetsRef.current, dt)
      packetsRef.current = next

      if (completed.length) {
        for (const t of completed) {
          countsRef.current[t]++
        }
        const c = countsRef.current
        const lastT = completed[completed.length - 1]!
        onMetricsRef.current({
          current: LABELS[lastT],
          total: String(c[0] + c[1] + c[2]),
          reqA: String(c[0]),
          reqB: String(c[1]),
          reqC: String(c[2]),
        })
      }

      bump()
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isRunning])

  useEffect(() => {
    if (!isRunning) return

    rrRef.current = 0
    countsRef.current = [0, 0, 0]
    nextIdRef.current = 0

    const spawn = () => {
      const target = rrRef.current % LABELS.length
      rrRef.current++
      packetsRef.current = [
        ...packetsRef.current,
        { id: nextIdRef.current++, segIdx: 0, progress: 0, target: target as 0 | 1 | 2 },
      ]
      bump()
    }

    spawn()
    const id = setInterval(spawn, INTERVAL_MS)
    return () => clearInterval(id)
  }, [isRunning])

  const packets = packetsRef.current

  const backendHot = (idx: number) =>
    isRunning && packets.some(p => p.segIdx === 1 && p.target === idx)

  return (
    <div className={`panel ${cachingStyles.panel}`}>
      <div className="panel-header">
        <span className="panel-label">Architecture Visualizer</span>
        <div className={cachingStyles.headerRight}>
          <div className="status-dot">
            <span className={`dot ${isRunning ? 'live' : ''}`} />
            <span>{isRunning ? 'SIMULATION LIVE' : 'READY'}</span>
          </div>
          <button
            type="button"
            className={[cachingStyles.runBtn, isRunning ? cachingStyles.runBtnActive : ''].join(' ')}
            onClick={onToggleRun}
          >
            <span>{isRunning ? '■' : '▶'}</span>
            {isRunning ? 'STOP' : 'EXECUTE SIMULATION'}
          </button>
        </div>
      </div>

      <div className={cachingStyles.body}>
        <p className={cachingStyles.subtitle}>
          Round-robin load balancing: each request is assigned to backends A, B, C in order. Use parameters and
          metrics below while the simulation runs.
        </p>

        <svg viewBox="0 0 560 220" className={styles.svg} aria-label="Client, load balancer, three backends">
          <defs>
            <marker id="lbrr-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="var(--accent)" />
            </marker>
          </defs>

          <line
            x1={CLIENT_OUT.x}
            y1={CLIENT_OUT.y}
            x2={LB_IN.x}
            y2={LB_IN.y}
            className={styles.edge}
            markerEnd="url(#lbrr-arrow)"
          />
          {LABELS.map((_, idx) => (
            <line
              key={idx}
              x1={LB_OUT.x}
              y1={LB_OUT.y}
              x2={backendCx(idx)}
              y2={BACKEND_Y}
              className={styles.edgeDim}
              markerEnd="url(#lbrr-arrow)"
            />
          ))}

          <rect x="24" y="72" width="88" height="52" rx="8" className={styles.node} />
          <text x="68" y="102" textAnchor="middle" className={styles.nodeLabel}>
            Client
          </text>

          <rect x="200" y="64" width="100" height="68" rx="10" className={styles.nodeAccent} />
          <text x="250" y="98" textAnchor="middle" className={styles.nodeTitle}>
            LB
          </text>
          <text x="250" y="116" textAnchor="middle" className={styles.nodeSub}>
            round-robin
          </text>

          {LABELS.map((label, idx) => {
            const x = 360 + idx * 58
            const hot = backendHot(idx)
            return (
              <g key={label}>
                <rect
                  x={x}
                  y="78"
                  width="46"
                  height="44"
                  rx="6"
                  className={hot ? styles.backendHot : styles.backend}
                />
                <text x={x + 23} y="104" textAnchor="middle" className={styles.backendLabel}>
                  {label}
                </text>
              </g>
            )
          })}

          {packets.map(p => {
            const { x, y } = packetPos(p)
            const color = 'var(--accent)'
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
            Request
          </span>
        </div>
      </div>
    </div>
  )
}
