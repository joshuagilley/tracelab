import type { SingletonStats } from './SingletonVisualizer'
import styles from './SingletonPatternPanel.module.css'

interface Props {
  handlerCount: number
  spawnIntervalMs: number
  stressMode: boolean
  emphasizeOnce: boolean
  stats: SingletonStats
  onHandlerCount: (n: number) => void
  onSpawnInterval: (ms: number) => void
  onStressMode: (v: boolean) => void
  onEmphasizeOnce: (v: boolean) => void
}

export default function SingletonPatternPanel({
  handlerCount,
  spawnIntervalMs,
  stressMode,
  emphasizeOnce,
  stats,
  onHandlerCount,
  onSpawnInterval,
  onStressMode,
  onEmphasizeOnce,
}: Props) {
  return (
    <div className={`panel ${styles.strip}`}>
      <div className={styles.controls}>
        <div className={styles.kicker}>Simulation parameters</div>
        <label className={styles.field}>
          <span className={styles.lbl}>CONCURRENT HANDLERS</span>
          <div className={styles.row}>
            <input
              type="range"
              min={1}
              max={8}
              value={handlerCount}
              onChange={e => onHandlerCount(Number(e.target.value))}
              className={styles.slider}
            />
            <span className={styles.val}>{handlerCount}</span>
          </div>
        </label>
        <label className={styles.field}>
          <span className={styles.lbl}>SPAWN INTERVAL (ms)</span>
          <div className={styles.row}>
            <input
              type="range"
              min={150}
              max={1200}
              step={50}
              value={spawnIntervalMs}
              onChange={e => onSpawnInterval(Number(e.target.value))}
              className={styles.slider}
            />
            <span className={styles.val}>{spawnIntervalMs}</span>
          </div>
        </label>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={stressMode}
            onChange={e => onStressMode(e.target.checked)}
          />
          <span>Stress mode (random handlers, faster spawn)</span>
        </label>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={emphasizeOnce}
            onChange={e => onEmphasizeOnce(e.target.checked)}
          />
          <span>Highlight <code>sync.Once</code> gate</span>
        </label>
      </div>

      <div className={styles.divider} />

      <div className={styles.metrics}>
        <div className={styles.kicker}>Live metrics</div>
        <div className={styles.metricGrid}>
          <div className={styles.metric}>
            <span className={styles.mLabel}>GetLogger()</span>
            <span className={styles.mVal}>{stats.getInstanceCalls}</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.mLabel}>Once.Do runs</span>
            <span className={styles.mVal}>{stats.initRuns}</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.mLabel}>Fast-path returns</span>
            <span className={styles.mVal}>{stats.fastPathReturns}</span>
          </div>
        </div>
        <p className={styles.hint}>
          First completion runs init (<strong>Once.Do = 1</strong>). Later calls reuse the same instance —{' '}
          <strong>fast-path</strong> increases while <strong>Once.Do</strong> stays at 1.
        </p>
      </div>
    </div>
  )
}
