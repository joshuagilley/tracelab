import { useEffect } from 'react'
import styles from '@/components/design-patterns/_shared/InfoModal.module.css'

interface Props {
  open: boolean
  onClose: () => void
}

export default function DependencyInjectionInfoModal({ open, onClose }: Props) {
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
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="di-info-title">
      <div className={styles.backdrop} onClick={onClose} aria-hidden />
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 id="di-info-title" className={styles.title}>
            Dependency injection (this lesson)
          </h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className={styles.body}>
          <section className={styles.section}>
            <h3 className={styles.kicker}>Idea</h3>
            <p className={styles.lead}>
              <strong>IngestService</strong> is a struct with a field <code>uploader ObjectUploader</code>. Its method{' '}
              <code>SaveExport</code> calls <code>s.uploader.Put</code> — it never knows which concrete uploader it has.{' '}
              <code>NewIngestService(u)</code> constructs the struct and injects whichever uploader you pass in (e.g.{' '}
              <code>NoopUploader</code> in <code>present.go</code>). The diagram's toggle shows swapping implementations.
            </p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.kicker}>What you see</h3>
            <p className={styles.p}>
              The center box is the <strong>IngestService</strong> struct. The <code>uploader ObjectUploader</code> row and
              chip show the injected field and the concrete uploader wired in. Jobs come from the left; data exits toward
              storage on the right.
            </p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.kicker}>Code panel</h3>
            <p className={styles.p}>
              <strong>Good · DI</strong> (<code>present.go</code>): <code>IngestService</code> struct,{' '}
              <code>NewIngestService</code> injects an <code>ObjectUploader</code>, <code>SaveExport</code> uses it.{' '}
              <strong>Bad · sprawl</strong> (<code>bad.go</code>): same <code>SaveExport</code> name, but no interface
              — one fat <code>SprawlConfig</code> and switch branches instead of an injected uploader.
            </p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.kicker}>Why bother</h3>
            <p className={styles.p}>
              Method bodies stay free of transport-specific logic; you change behavior by what you pass into{' '}
              <code>NewIngestService</code>, which is easy to test and to evolve without growing{' '}
              <code>switch</code> branches in <code>SaveExport</code>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
