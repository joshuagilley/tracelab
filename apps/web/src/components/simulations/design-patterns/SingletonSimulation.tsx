import { useCallback, useEffect, useId, useRef, useState } from 'react'
import SingletonInfoModal from './SingletonInfoModal'
import styles from './SingletonSimulation.module.css'

export interface SingletonStats {
  getInstanceCalls: number
  initRuns: number
  fastPathReturns: number
}

interface Props {
  isRunning: boolean
  onToggleRun: () => void
  handlerCount: number
  spawnIntervalMs: number
  emphasizeOnce: boolean
  stressMode: boolean
  onStatsChange: (s: SingletonStats) => void
}

interface Particle {
  id: number
  t: number
  handlerIndex: number
}

const PATH_SPEED = 0.85 // full path per second

export default function SingletonSimulation({
  isRunning,
  onToggleRun,
  handlerCount,
  spawnIntervalMs,
  emphasizeOnce,
  stressMode,
  onStatsChange,
}: Props) {
  const uid = useId().replace(/:/g, '')
  const m2 = `${uid}-arr2`

  const [particles, setParticles] = useState<Particle[]>([])
  const [oncePulse, setOncePulse] = useState(false)
  const [onceDone, setOnceDone] = useState(false)
  const [callCount, setCallCount] = useState(0)
  const [infoOpen, setInfoOpen] = useState(false)

  const nextId = useRef(0)
  const initDoneRef = useRef(false)
  const statsRef = useRef<SingletonStats>({
    getInstanceCalls: 0,
    initRuns: 0,
    fastPathReturns: 0,
  })
  const spawnIntervalRef = useRef(spawnIntervalMs)
  const stressRef = useRef(stressMode)
  const nRef = useRef(Math.max(1, Math.min(8, Math.round(handlerCount))))
  const rafRef = useRef<number>(0)

  spawnIntervalRef.current = Math.max(120, spawnIntervalMs)
  stressRef.current = stressMode
  nRef.current = Math.max(1, Math.min(8, Math.round(handlerCount)))

  const resetStats = useCallback(() => {
    initDoneRef.current = false
    statsRef.current = { getInstanceCalls: 0, initRuns: 0, fastPathReturns: 0 }
    setParticles([])
    setOnceDone(false)
    setCallCount(0)
    onStatsChange({ ...statsRef.current })
  }, [onStatsChange])

  useEffect(() => {
    if (!isRunning) {
      resetStats()
      return
    }

    resetStats()

    let last = performance.now()
    let spawnAcc = 0

    const tick = (now: number) => {
      const dt = Math.min(0.045, (now - last) / 1000)
      last = now
      const n = nRef.current
      const interval = spawnIntervalRef.current * (stressRef.current ? 0.5 : 1)

      setParticles(prev => {
        const completed: Particle[] = []
        const moved = prev
          .map(p => {
            const nt = p.t + PATH_SPEED * dt
            if (nt >= 1) {
              completed.push(p)
              return null
            }
            return { ...p, t: nt }
          })
          .filter((x): x is Particle => x !== null)

        for (const _ of completed) {
          if (!initDoneRef.current) {
            initDoneRef.current = true
            statsRef.current.getInstanceCalls++
            statsRef.current.initRuns = 1
            setOnceDone(true)
            setOncePulse(true)
            window.setTimeout(() => setOncePulse(false), 380)
          } else {
            statsRef.current.getInstanceCalls++
            statsRef.current.fastPathReturns++
          }
          setCallCount(statsRef.current.getInstanceCalls)
          onStatsChange({ ...statsRef.current })
        }

        spawnAcc += dt * 1000
        let extra: Particle[] = []
        while (spawnAcc >= interval) {
          spawnAcc -= interval
          const hi = stressRef.current
            ? Math.floor(Math.random() * n)
            : Math.floor((now / 250) % n)
          extra.push({
            id: nextId.current++,
            t: 0,
            handlerIndex: hi,
          })
        }

        return [...moved, ...extra]
      })

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isRunning, resetStats])

  const n = nRef.current
  const vbH = Math.max(260, 36 + n * 48 + 40)
  const vbW = 720
  const midY = vbH / 2
  const onceX = 300
  const singX = 540
  const leftCx = 90

  const handlerY = (i: number) => {
    if (n <= 1) return midY
    const top = 48
    const bot = vbH - 48
    return top + (i / (n - 1)) * (bot - top)
  }

  const posOnPath = (i: number, t: number) => {
    const iSafe = Math.min(Math.max(0, i), n - 1)
    const y0 = handlerY(iSafe)
    const x0 = leftCx + 50
    const x1 = onceX
    const y1 = midY
    const x2 = singX
    const y2 = midY
    if (t < 0.45) {
      const u = t / 0.45
      return { x: x0 + (x1 - x0) * u, y: y0 + (y1 - y0) * u }
    }
    const u = (t - 0.45) / 0.55
    return { x: x1 + (x2 - x1) * u, y: y1 + (y2 - y1) * u }
  }

  const labels = ['ServiceA', 'ServiceB', 'ServiceC', 'ServiceD', 'ServiceE', 'ServiceF', 'ServiceG', 'ServiceH']

  return (
    <div className={`panel ${styles.panel}`}>
      <SingletonInfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
      <div className="panel-header">
        <div className={styles.headerLeft}>
          <span className="panel-label">Pattern Visualizer</span>
          <button
            type="button"
            className={styles.infoBtn}
            onClick={() => setInfoOpen(true)}
            title="Intent, Go idioms, trade-offs"
            aria-label="About the Singleton pattern"
          >
            i
          </button>
        </div>
        <div className={styles.headerRight}>
          <div className="status-dot">
            <span className={`dot ${isRunning ? 'live' : ''}`} />
            <span>{isRunning ? 'SIMULATION LIVE' : 'READY'}</span>
          </div>
          <button
            type="button"
            className={[styles.runBtn, isRunning ? styles.runBtnActive : ''].join(' ')}
            onClick={onToggleRun}
          >
            <span>{isRunning ? '■' : '▶'}</span>
            {isRunning ? 'STOP' : 'EXECUTE SIMULATION'}
          </button>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.vizViewport}>
        <svg viewBox={`0 0 ${vbW} ${vbH}`} className={styles.svg} aria-hidden>
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
          </defs>

          {Array.from({ length: n }, (_, i) => (
            <g key={i}>
              <rect
                x={40}
                y={handlerY(i) - 22}
                width={100}
                height={44}
                rx={8}
                fill="var(--bg-elevated)"
                stroke="var(--border)"
                className={isRunning ? styles.handlerGlow : ''}
              />
              <text
                x={90}
                y={handlerY(i) + 4}
                textAnchor="middle"
                fill="var(--text-secondary)"
                fontSize={11}
                fontFamily="var(--font-mono)"
              >
                {labels[i] ?? `Caller ${i + 1}`}
              </text>
            </g>
          ))}

          {Array.from({ length: n }, (_, i) => (
            <path
              key={`p-${i}`}
              d={`M ${leftCx + 50} ${handlerY(i)} L ${onceX} ${midY} L ${singX} ${midY}`}
              stroke="var(--border)"
              strokeWidth={1.2}
              strokeDasharray="5 4"
              fill="none"
              opacity={0.45}
            />
          ))}

          <rect
            x={onceX - 60}
            y={midY - 36}
            width={120}
            height={72}
            rx={8}
            fill="var(--accent-dim)"
            stroke="var(--accent)"
            strokeWidth={emphasizeOnce || oncePulse ? 2.4 : 1.5}
            filter={emphasizeOnce || oncePulse ? `url(#${uid}-glow)` : undefined}
            className={oncePulse ? styles.boxFlash : ''}
          />
          <text
            x={onceX}
            y={midY - 6}
            textAnchor="middle"
            fill="var(--accent)"
            fontSize={11}
            fontFamily="var(--font-mono)"
            fontWeight={600}
          >
            sync.Once
          </text>
          <text x={onceX} y={midY + 12} textAnchor="middle" fill="var(--text-muted)" fontSize={9} fontFamily="var(--font-mono)">
            {onceDone ? 'done ✓' : 'init pending'}
          </text>

          <path
            d={`M ${onceX + 60} ${midY} L ${singX - 40} ${midY}`}
            stroke="var(--accent)"
            strokeWidth={2}
            fill="none"
            markerEnd={`url(#${m2})`}
          />

          <rect
            x={singX - 40}
            y={midY - 42}
            width={180}
            height={84}
            rx={10}
            fill="var(--bg-elevated)"
            stroke="var(--accent)"
            strokeWidth={2}
            className={styles.singletonBox}
          />
          <text
            x={singX + 50}
            y={midY - 12}
            textAnchor="middle"
            fill="var(--accent)"
            fontSize={12}
            fontFamily="var(--font-mono)"
            fontWeight={600}
          >
            SINGLETON
          </text>
          <text
            x={singX + 50}
            y={midY + 10}
            textAnchor="middle"
            fill="var(--text-secondary)"
            fontSize={10}
            fontFamily="var(--font-mono)"
          >
            *Logger
          </text>
          <text
            x={singX + 50}
            y={midY + 28}
            textAnchor="middle"
            fill="var(--text-muted)"
            fontSize={9}
            fontFamily="var(--font-mono)"
          >
            shared instance · GetLogger() {callCount}
          </text>

          {particles.map(p => {
            const { x, y } = posOnPath(Math.min(p.handlerIndex, n - 1), p.t)
            const firstWave = p.t < 0.5
            const col = firstWave ? 'var(--accent)' : 'var(--color-info)'
            return (
              <circle
                key={p.id}
                cx={x}
                cy={y}
                r={5}
                fill={col}
                style={{ filter: `drop-shadow(0 0 5px ${col})` }}
              />
            )
          })}
        </svg>
        </div>
      </div>
    </div>
  )
}
