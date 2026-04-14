import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { DependencyInjectionSimulationDiagram } from './DependencyInjectionSimulationDiagram'
import DependencyInjectionInfoModal from './DependencyInjectionInfoModal'
import {
  DI_PATH_SPEED,
  type BlackGeom,
  type DiParticle,
  type DIStats,
  type S3Geom,
  type StorageBackend,
  type UplGeom,
} from './dependencyInjectionSimulationRoute'
import styles from './DependencyInjectionSimulation.module.css'

export type { DIStats, StorageBackend } from './dependencyInjectionSimulationRoute'

interface Props {
  isRunning: boolean
  onToggleRun: () => void
  handlerCount: number
  spawnIntervalMs: number
  storageBackend: StorageBackend
  stressMode: boolean
  emphasizeIface: boolean
  onStatsChange: (s: DIStats) => void
}

export default function DependencyInjectionSimulation({
  isRunning,
  onToggleRun,
  handlerCount,
  spawnIntervalMs,
  storageBackend,
  stressMode,
  emphasizeIface,
  onStatsChange,
}: Props) {
  const uid = useId().replace(/:/g, '')
  const m2 = `${uid}-di-arr`

  const [particles, setParticles] = useState<DiParticle[]>([])
  const [wirePulse, setWirePulse] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)

  const nextId = useRef(0)
  const statsRef = useRef<DIStats>({ uploadsCompleted: 0, putCalls: 0, wires: 0 })
  const spawnIntervalRef = useRef(spawnIntervalMs)
  const stressRef = useRef(stressMode)
  const nRef = useRef(Math.max(1, Math.min(8, Math.round(handlerCount))))
  const prevBackendRef = useRef<StorageBackend>(storageBackend)
  const rafRef = useRef<number>(0)

  spawnIntervalRef.current = Math.max(120, spawnIntervalMs)
  stressRef.current = stressMode
  nRef.current = Math.max(1, Math.min(8, Math.round(handlerCount)))

  const resetStats = useCallback(() => {
    statsRef.current = { uploadsCompleted: 0, putCalls: 0, wires: 0 }
    setParticles([])
    onStatsChange({ ...statsRef.current })
  }, [onStatsChange])

  useEffect(() => {
    if (!isRunning) {
      prevBackendRef.current = storageBackend
      return
    }
    if (prevBackendRef.current === storageBackend) return
    prevBackendRef.current = storageBackend
    statsRef.current.wires++
    onStatsChange({ ...statsRef.current })
    setWirePulse(true)
    const tid = window.setTimeout(() => setWirePulse(false), 420)
    return () => clearTimeout(tid)
  }, [storageBackend, isRunning, onStatsChange])

  useEffect(() => {
    if (!isRunning) {
      resetStats()
      return
    }

    resetStats()
    statsRef.current.wires = 1
    onStatsChange({ ...statsRef.current })

    let last = performance.now()
    let spawnAcc = 0

    const tick = (now: number) => {
      const dt = Math.min(0.045, (now - last) / 1000)
      last = now
      const n = nRef.current
      const interval = spawnIntervalRef.current * (stressRef.current ? 0.52 : 1)

      setParticles((prev) => {
        const completed: DiParticle[] = []
        const moved = prev
          .map((p) => {
            const nt = p.t + DI_PATH_SPEED * dt
            if (nt >= 1) {
              completed.push(p)
              return null
            }
            return { ...p, t: nt }
          })
          .filter((x): x is DiParticle => x !== null)

        for (const _ of completed) {
          statsRef.current.uploadsCompleted++
          statsRef.current.putCalls++
          onStatsChange({ ...statsRef.current })
        }

        spawnAcc += dt * 1000
        const extra: DiParticle[] = []
        while (spawnAcc >= interval) {
          spawnAcc -= interval
          const hi = stressRef.current ? Math.floor(Math.random() * n) : Math.floor((now / 260) % n)
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
  }, [isRunning, resetStats, onStatsChange])

  const n = nRef.current
  const vbH = Math.max(360, 56 + n * 48 + 72)
  const vbW = 900
  const midY = vbH / 2 + 6
  const leftCx = 72

  const handlerY = (i: number) => {
    if (n <= 1) return midY
    const top = 60
    const bot = vbH - 60
    return top + (i / (n - 1)) * (bot - top)
  }

  const labels = ['Job A', 'Job B', 'Job C', 'Job D', 'Job E', 'Job F', 'Job G', 'Job H']

  const blackH = 120
  const blackY = midY - blackH / 2
  const black: BlackGeom = {
    x: 198,
    y: blackY,
    w: 312,
    h: blackH,
    cx: 198 + 312 / 2,
    right: 198 + 312,
  }
  const upl: UplGeom = {
    w: 132,
    h: 44,
    x: black.x + 166,
    y: midY - 22,
    cx: black.x + 166 + 66,
    cy: midY,
  }
  const s3Top: S3Geom = { x: 668, y: midY - 122, w: 112, h: 106 }
  const s3Bot: S3Geom = { x: 668, y: midY + 22, w: 112, h: 106 }
  const mockSink = { x: 712, y: midY }

  return (
    <div className={`panel ${styles.panel}`}>
      <DependencyInjectionInfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
      <div className="panel-header">
        <div className={styles.headerLeft}>
          <span className="panel-label">Pattern Visualizer</span>
          <button
            type="button"
            className={styles.infoBtn}
            onClick={() => setInfoOpen(true)}
            title="About this lesson: IngestService struct, injected ObjectUploader, SaveExport"
            aria-label="About Dependency Injection"
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
          <DependencyInjectionSimulationDiagram
            uid={uid}
            m2={m2}
            vbW={vbW}
            vbH={vbH}
            n={n}
            isRunning={isRunning}
            handlerY={handlerY}
            labels={labels}
            particles={particles}
            storageBackend={storageBackend}
            emphasizeIface={emphasizeIface}
            wirePulse={wirePulse}
            black={black}
            upl={upl}
            s3Top={s3Top}
            s3Bot={s3Bot}
            mockSink={mockSink}
            midY={midY}
            leftCx={leftCx}
          />
        </div>
        <p className={styles.diagramNote}>
          <code>IngestService</code> holds an <code>uploader ObjectUploader</code> field; <code>SaveExport</code> calls{' '}
          <code>s.uploader.Put</code>. <code>NewIngestService(u)</code> injects the concrete uploader. Good:{' '}
          <code>present.go</code>. Bad: <code>bad.go</code>.
        </p>
      </div>
    </div>
  )
}
