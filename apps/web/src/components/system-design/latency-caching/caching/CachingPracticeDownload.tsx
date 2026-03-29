import { downloadCachingPracticeZip } from './cachingPracticeZip'
import styles from '@/components/code/CodePanel.module.css'

/** Local practice ZIP for the caching concept (co-located with SimulationPanel / MetricsPanel). */
export default function CachingPracticeDownload() {
  return (
    <button
      type="button"
      className={styles.actionBtn}
      title="Download a small Go sandbox (README + go.mod + main.go) to practice caching locally"
      onClick={() => downloadCachingPracticeZip()}
    >
      ⬇
    </button>
  )
}
