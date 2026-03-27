import styles from './LabBottomPanels.module.css'

export default function DesignPatternBottomPanel() {
  return (
    <div className={`panel ${styles.strip}`}>
      <div className={styles.group}>
        <div className={styles.groupLabel}>INTENT</div>
        <p className={styles.text}>
          Guarantee exactly one instance of a type and a single global access point — useful for shared config, logging, or DB pools.
        </p>
      </div>
      <div className={styles.divider} />
      <div className={styles.group}>
        <div className={styles.groupLabel}>IN GO</div>
        <p className={styles.text}>
          Prefer <code>sync.Once</code> inside the package over init-time globals so construction is lazy and concurrency-safe.
        </p>
      </div>
      <div className={styles.divider} />
      <div className={styles.group}>
        <div className={styles.groupLabel}>TRADEOFFS</div>
        <p className={styles.text}>
          Hidden global state complicates testing; consider interfaces + dependency injection for larger services.
        </p>
      </div>
    </div>
  )
}
