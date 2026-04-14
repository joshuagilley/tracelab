import type { CatalogTile } from '@/lib/catalog-tiles'
import styles from './cs-periodic-table-page.module.css'

export function CsPeriodicTablePopover({ tile, complete }: { tile: CatalogTile; complete: boolean }) {
  return (
    <div className={styles.popover} role="tooltip">
      <p className={styles.popoverTitle}>{tile.title}</p>
      <p className={styles.popoverMeta}>
        <span>
          <strong>{tile.labLabel}</strong>
        </span>
        <span>{tile.difficulty}</span>
        <span>{tile.status === 'available' ? 'Published' : 'Soon'}</span>
        {complete && <span>Done</span>}
      </p>
      <p className={styles.popoverSummary}>{tile.summary}</p>
      <p className={styles.popoverCta}>
        {tile.status === 'available' ? 'Click to open lesson' : 'Coming soon'}
      </p>
    </div>
  )
}
