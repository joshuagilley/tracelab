import type { DIStats, StorageBackend } from './DependencyInjectionVisualizer'
import styles from './SingletonPatternPanel.module.css'
import di from './DependencyInjectionPatternPanel.module.css'

interface Props {
  handlerCount: number
  spawnIntervalMs: number
  stressMode: boolean
  storageBackend: StorageBackend
  emphasizeIface: boolean
  stats: DIStats
  onHandlerCount: (n: number) => void
  onSpawnInterval: (ms: number) => void
  onStressMode: (v: boolean) => void
  onStorageBackend: (b: StorageBackend) => void
  onEmphasizeIface: (v: boolean) => void
}

export default function DependencyInjectionPatternPanel({
  handlerCount,
  spawnIntervalMs,
  stressMode,
  storageBackend,
  emphasizeIface,
  stats,
  onHandlerCount,
  onSpawnInterval,
  onStressMode,
  onStorageBackend,
  onEmphasizeIface,
}: Props) {
  return (
    <div className={`panel ${di.stripDi}`}>
      <div className={di.mainRow}>
        <div className={di.leftControls}>
          <div className={styles.kicker}>Simulation parameters</div>
          <label className={styles.field}>
            <span className={styles.lbl}>CONCURRENT UPLOAD JOBS</span>
            <div className={[styles.row, di.sliderRow].join(' ')}>
              <input
                type="range"
                min={1}
                max={8}
                value={handlerCount}
                onChange={e => onHandlerCount(Number(e.target.value))}
                className={[styles.slider, di.sliderNarrow].join(' ')}
              />
              <span className={styles.val}>{handlerCount}</span>
            </div>
          </label>
          <label className={styles.field}>
            <span className={styles.lbl}>SPAWN INTERVAL (ms)</span>
            <div className={[styles.row, di.sliderRow].join(' ')}>
              <input
                type="range"
                min={150}
                max={1200}
                step={50}
                value={spawnIntervalMs}
                onChange={e => onSpawnInterval(Number(e.target.value))}
                className={[styles.slider, di.sliderNarrow].join(' ')}
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
            <span>Stress mode (random sources, faster spawn)</span>
          </label>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={emphasizeIface}
              onChange={e => onEmphasizeIface(e.target.checked)}
            />
            <span>Highlight active S3 path</span>
          </label>
        </div>

        <div className={di.uploaderColumn}>
          <div className={di.uploaderLegend}>Inject uploader → bucket + creds</div>
          <label className={di.backendOption}>
            <input
              type="radio"
              name="di-backend"
              checked={storageBackend === 'sftp'}
              onChange={() => onStorageBackend('sftp')}
            />
            <span>
              <code>SFTPUploader</code>
              <span className={di.hint}> SSH key · bucket A</span>
            </span>
          </label>
          <label className={di.backendOption}>
            <input
              type="radio"
              name="di-backend"
              checked={storageBackend === 'webdav'}
              onChange={() => onStorageBackend('webdav')}
            />
            <span>
              <code>WebDAVUploader</code>
              <span className={di.hint}> bearer token · bucket B</span>
            </span>
          </label>
          <label className={di.backendOption}>
            <input
              type="radio"
              name="di-backend"
              checked={storageBackend === 'mock'}
              onChange={() => onStorageBackend('mock')}
            />
            <span>
              <code>MockUploader</code>
              <span className={di.hint}> no remote keys</span>
            </span>
          </label>
        </div>

        <div className={di.metricsInline}>
          <div className={styles.kicker}>Live metrics</div>
          <div className={di.metricRow}>
            <div className={di.metricCompact}>
              <span className={di.mLabelCompact}>SaveExport()</span>
              <span className={di.mValCompact}>{stats.uploadsCompleted}</span>
            </div>
            <div className={di.metricCompact}>
              <span className={di.mLabelCompact}>Put() iface</span>
              <span className={di.mValCompact}>{stats.putCalls}</span>
            </div>
            <div className={di.metricCompact}>
              <span className={di.mLabelCompact}>Wires</span>
              <span className={di.mValCompact}>{stats.wires}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
