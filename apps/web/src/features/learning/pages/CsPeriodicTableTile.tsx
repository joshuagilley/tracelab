import { type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { CsPeriodicTablePopover } from '@/features/learning/pages/CsPeriodicTablePopover'
import { tileSymbol, type CatalogTile } from '@/lib/catalog-tiles'
import { LAB_ACCENT_HEX } from '@/lib/lab-accent-hex'
import styles from './cs-periodic-table-page.module.css'

export function CsPeriodicTableTile({
  tile,
  index,
  complete,
}: {
  tile: CatalogTile
  index: number
  complete: boolean
}) {
  const accent = LAB_ACCENT_HEX[tile.labId] ?? '#9aa3b5'
  const sym = tileSymbol(tile.title, tile.slug)
  const popover = <CsPeriodicTablePopover tile={tile} complete={complete} />
  const classForState = [
    styles.tile,
    tile.status === 'coming-soon' ? styles.tileSoon : complete ? styles.tileComplete : styles.tileAvailable,
    tile.status === 'available' ? styles.tileInteractive : '',
  ].join(' ')
  const style = { '--tile-accent': accent } as CSSProperties

  if (tile.status === 'available') {
    return (
      <Link
        to={`/concept/${encodeURIComponent(tile.slug)}?lab=${encodeURIComponent(tile.labId)}`}
        className={classForState}
        style={style}
      >
        {popover}
        <span className={styles.atomic}>{index + 1}</span>
        <span className={styles.symbol}>{sym}</span>
      </Link>
    )
  }

  return (
    <div className={classForState} style={style}>
      {popover}
      <span className={styles.atomic}>{index + 1}</span>
      <span className={styles.symbol}>{sym}</span>
    </div>
  )
}
