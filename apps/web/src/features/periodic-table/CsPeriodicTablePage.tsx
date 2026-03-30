import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/auth'
import { LAB_OPTIONS, type LabId } from '@/contexts/lab'

type PublicationFilter = 'all' | 'published' | 'soon'
type ProgressFilter = 'all' | 'complete' | 'incomplete'
import { labTracksConceptProgress } from '@/features/concepts/conceptSectionExpectations'
import { TRACELAB_COMPLETED_EVENT, fetchLabCompleted } from '@/features/concepts/completedApi'
import { getAllCatalogTiles, tileSymbol, type CatalogTile } from '@/lib/catalogTiles'
import { LAB_ACCENT_HEX } from '@/lib/labAccentHex'
import styles from './CsPeriodicTablePage.module.css'

// byLab maps labId → Set of completed slugs
type ByLab = Partial<Record<LabId, Set<string>>>

function isTileComplete(tile: CatalogTile, byLab: ByLab): boolean {
  if (tile.status !== 'available') return false
  if (!labTracksConceptProgress(tile.labId)) return false
  return byLab[tile.labId]?.has(tile.slug) ?? false
}

function tileMatchesFilters(
  tile: CatalogTile,
  labId: LabId | 'all',
  publication: PublicationFilter,
  progress: ProgressFilter,
  byLab: ByLab,
): boolean {
  if (labId !== 'all' && tile.labId !== labId) return false
  if (publication === 'published' && tile.status !== 'available') return false
  if (publication === 'soon' && tile.status !== 'coming-soon') return false

  const done = isTileComplete(tile, byLab)
  if (progress === 'complete' && !done) return false
  if (progress === 'incomplete' && done) return false
  return true
}

function TileView({
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
  const popover = (
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

  const classForState = [
    styles.tile,
    tile.status === 'coming-soon' ? styles.tileSoon
    : complete ? styles.tileComplete
    : styles.tileAvailable,
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

export default function CsPeriodicTablePage() {
  const { user } = useAuth()
  const [byLab, setByLab] = useState<ByLab>({})
  const [labFilter, setLabFilter] = useState<LabId | 'all'>('all')
  const [publicationFilter, setPublicationFilter] = useState<PublicationFilter>('all')
  const [progressFilter, setProgressFilter] = useState<ProgressFilter>('all')

  const reload = useMemo(
    () => async () => {
      if (!user) {
        setByLab({})
        return
      }
      const entries = await Promise.all(
        LAB_OPTIONS.map(async ({ id }) => {
          if (!labTracksConceptProgress(id)) return [id, new Set<string>()] as const
          try {
            const slugs = await fetchLabCompleted(id)
            return [id, new Set(slugs)] as const
          } catch {
            return [id, new Set<string>()] as const
          }
        }),
      )
      setByLab(Object.fromEntries(entries) as ByLab)
    },
    [user],
  )

  useEffect(() => {
    void reload()
  }, [reload])

  useEffect(() => {
    const onUpd = () => void reload()
    window.addEventListener(TRACELAB_COMPLETED_EVENT, onUpd)
    return () => window.removeEventListener(TRACELAB_COMPLETED_EVENT, onUpd)
  }, [reload])

  const tiles = useMemo(() => {
    const raw = getAllCatalogTiles()
    return [...raw].sort((a, b) => {
      const la = LAB_OPTIONS.findIndex(o => o.id === a.labId)
      const lb = LAB_OPTIONS.findIndex(o => o.id === b.labId)
      if (la !== lb) return la - lb
      return a.title.localeCompare(b.title)
    })
  }, [])

  const doneCount = useMemo(
    () => tiles.filter(t => isTileComplete(t, byLab)).length,
    [tiles, byLab],
  )
  const availCount = useMemo(() => tiles.filter(t => t.status === 'available').length, [tiles])

  const filteredTiles = useMemo(
    () =>
      tiles.filter(t =>
        tileMatchesFilters(t, labFilter, publicationFilter, progressFilter, byLab),
      ),
    [tiles, labFilter, publicationFilter, progressFilter, byLab],
  )

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.back}>
          ← Library
        </Link>
        <div className={styles.titleBlock}>
          <h1>Curriculum table</h1>
          <p>
            Every catalog topic as a tile — color follows its library. Completed lessons glow; the rest stay
            muted. Hover a tile for details.
          </p>
        </div>
        <div className={styles.legend}>
          <span>
            <span className={styles.swatch} style={{ background: '#3de8a0', opacity: 0.9 }} /> Done
          </span>
          <span>
            <span className={styles.swatch} style={{ background: '#3de8a0', opacity: 0.35 }} /> Published
          </span>
          <span>
            <span className={styles.swatch} style={{ background: '#2a2f3d', opacity: 1 }} /> Soon
          </span>
          <span>
            {user ? `${doneCount} / ${availCount} done` : 'Sign in to track completion'}
          </span>
        </div>
      </header>

      <section className={styles.filters} aria-label="Filter topics">
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="pt-filter-lab">
            Library
          </label>
          <select
            id="pt-filter-lab"
            className={styles.filterSelect}
            value={labFilter}
            onChange={e => setLabFilter(e.target.value as LabId | 'all')}
          >
            <option value="all">All libraries</option>
            {LAB_OPTIONS.map(({ id, label }) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="pt-filter-pub">
            Availability
          </label>
          <select
            id="pt-filter-pub"
            className={styles.filterSelect}
            value={publicationFilter}
            onChange={e => setPublicationFilter(e.target.value as PublicationFilter)}
          >
            <option value="all">All topics</option>
            <option value="published">Published only</option>
            <option value="soon">Coming soon only</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="pt-filter-prog">
            Progress
          </label>
          <select
            id="pt-filter-prog"
            className={styles.filterSelect}
            value={progressFilter}
            onChange={e => setProgressFilter(e.target.value as ProgressFilter)}
          >
            <option value="all">Any progress</option>
            <option value="complete">Completed only</option>
            <option value="incomplete">Not completed</option>
          </select>
        </div>
        <p className={styles.filterMeta}>
          Showing <strong>{filteredTiles.length}</strong> of {tiles.length}
          {(labFilter !== 'all' || publicationFilter !== 'all' || progressFilter !== 'all') && (
            <button type="button" className={styles.filterReset} onClick={() => {
              setLabFilter('all')
              setPublicationFilter('all')
              setProgressFilter('all')
            }}>
              Reset filters
            </button>
          )}
        </p>
      </section>

      {filteredTiles.length === 0 ? (
        <p className={styles.emptyFilters} role="status">
          No topics match these filters. Try widening availability or progress, or choose another library.
        </p>
      ) : (
        <div className={styles.grid}>
          {filteredTiles.map((tile, i) => (
            <TileView
              key={`${tile.labId}-${tile.slug}`}
              tile={tile}
              index={i}
              complete={isTileComplete(tile, byLab)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
