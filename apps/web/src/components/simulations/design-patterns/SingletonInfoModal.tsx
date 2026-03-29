import { useEffect } from 'react'
import styles from './InfoModal.module.css'

interface Props {
  open: boolean
  onClose: () => void
}

export default function SingletonInfoModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="singleton-info-title">
      <div className={styles.backdrop} onClick={onClose} aria-hidden />
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 id="singleton-info-title" className={styles.title}>
            Singleton pattern
          </h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className={styles.body}>
          <section className={styles.section}>
            <h3 className={styles.kicker}>What it is</h3>
            <p className={styles.lead}>
              The <strong>Singleton</strong> creational pattern ensures a type has <strong>at most one</strong> instance
              and provides a single global access point (Gamma et al., <em>Design Patterns</em>).
            </p>
            <p className={styles.p}>
              Use it when exactly one shared object coordinates behavior across the system — a logger, a connection pool,
              or a config registry — and you need controlled access instead of scattered globals.
            </p>
          </section>
          <section className={styles.section}>
            <h3 className={styles.kicker}>In Go</h3>
            <p className={styles.p}>
              Prefer <code>sync.Once</code> for <strong>lazy, thread-safe</strong> one-time initialization. The first
              concurrent caller runs the initializer; everyone else waits and receives the same instance — no
              double-checked locking bugs by hand.
            </p>
          </section>
          <section className={styles.section}>
            <h3 className={styles.kicker}>Example</h3>
            <p className={styles.p}>
              <strong>Shared Logger:</strong> A process creates one <code>Logger</code> with a timestamp prefix and every
              service calls <code>GetLogger()</code> to reuse it. You want a single writer so log lines share the same
              prefix and output stream — that is a real single-resource rule, not convenience.
            </p>
            <p className={styles.p}>
              <strong>Bad:</strong> Each caller does <code>NewLogger()</code> and gets a separate instance with its own
              prefix. Duplicate setup, inconsistent output, wasted resources.
            </p>
          </section>
          <section className={styles.section}>
            <h3 className={styles.kicker}>Trade-offs</h3>
            <p className={styles.p}>
              Hidden global state hurts testability and hides dependencies. For larger services, prefer explicit
              dependency injection — use Singleton sparingly where a true single resource is a domain rule, not a
              shortcut.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
