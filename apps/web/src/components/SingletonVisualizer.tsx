import { useId } from 'react'
import styles from './SingletonVisualizer.module.css'

interface Props {
  isRunning: boolean
  onToggleRun: () => void
}

export default function SingletonVisualizer({ isRunning, onToggleRun }: Props) {
  const uid = useId().replace(/:/g, '')
  const m1 = `${uid}-arr`
  const m2 = `${uid}-arr2`

  return (
    <div className={`panel ${styles.panel}`}>
      <div className="panel-header">
        <span className="panel-label">Pattern Visualizer</span>
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
        <p className={styles.subtitle}>
          Only one <code>Database</code> instance exists. Every caller receives the same shared object via{' '}
          <code>GetInstance()</code>.
        </p>

        <svg viewBox="0 0 720 260" className={styles.svg} aria-hidden>
          <defs>
            <marker id={m1} markerWidth={6} markerHeight={6} refX={5} refY={3} orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="var(--text-muted)" />
            </marker>
            <marker id={m2} markerWidth={8} markerHeight={8} refX={7} refY={4} orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="var(--accent)" />
            </marker>
          </defs>
          {/* Callers */}
          <g className={isRunning ? styles.pulse : ''}>
            <rect x={40} y={40} width={100} height={44} rx={8} fill="var(--bg-elevated)" stroke="var(--border)" />
            <text x={90} y={68} textAnchor="middle" fill="var(--text-secondary)" fontSize={11} fontFamily="var(--font-mono)">
              HandlerA
            </text>
            <rect x={40} y={108} width={100} height={44} rx={8} fill="var(--bg-elevated)" stroke="var(--border)" />
            <text x={90} y={136} textAnchor="middle" fill="var(--text-secondary)" fontSize={11} fontFamily="var(--font-mono)">
              HandlerB
            </text>
            <rect x={40} y={176} width={100} height={44} rx={8} fill="var(--bg-elevated)" stroke="var(--border)" />
            <text x={90} y={204} textAnchor="middle" fill="var(--text-secondary)" fontSize={11} fontFamily="var(--font-mono)">
              HandlerC
            </text>
          </g>

          {/* Arrows to sync.Once / instance */}
          <path d="M 150 62 L 280 120" stroke="var(--text-muted)" strokeWidth={1.5} strokeDasharray="4 3" fill="none" markerEnd={`url(#${m1})`} />
          <path d="M 150 130 L 280 125" stroke="var(--text-muted)" strokeWidth={1.5} strokeDasharray="4 3" fill="none" markerEnd={`url(#${m1})`} />
          <path d="M 150 198 L 280 130" stroke="var(--text-muted)" strokeWidth={1.5} strokeDasharray="4 3" fill="none" markerEnd={`url(#${m1})`} />

          <rect x={280} y={95} width={120} height={70} rx={8} fill="var(--accent-dim)" stroke="var(--accent)" strokeWidth={1.5} />
          <text x={340} y={128} textAnchor="middle" fill="var(--accent)" fontSize={11} fontFamily="var(--font-mono)" fontWeight={600}>
            sync.Once
          </text>
          <text x={340} y={148} textAnchor="middle" fill="var(--text-muted)" fontSize={9} fontFamily="var(--font-mono)">
            init once
          </text>

          <path d="M 410 130 L 500 130" stroke="var(--accent)" strokeWidth={2} fill="none" markerEnd={`url(#${m2})`} />

          <rect x={500} y={88} width={180} height={84} rx={10} fill="var(--bg-elevated)" stroke="var(--accent)" strokeWidth={2} />
          <text x={590} y={118} textAnchor="middle" fill="var(--accent)" fontSize={12} fontFamily="var(--font-mono)" fontWeight={600}>
            SINGLETON
          </text>
          <text x={590} y={138} textAnchor="middle" fill="var(--text-secondary)" fontSize={10} fontFamily="var(--font-mono)">
            *Database
          </text>
          <text x={590} y={158} textAnchor="middle" fill="var(--text-muted)" fontSize={9} fontFamily="var(--font-mono)">
            one shared instance
          </text>
        </svg>
      </div>
    </div>
  )
}
