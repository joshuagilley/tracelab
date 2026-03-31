import { useEffect, useMemo, useState } from 'react'
import styles from './TakeTourButton.module.css'

type TourStep = {
  selector: string
  title: string
  description: string
}

const TOUR_STEPS: TourStep[] = [
  {
    selector: '[data-tour="lab-picker"]',
    title: 'Library Picker',
    description: 'Switch between TraceLab libraries here.',
  },
  {
    selector: '[data-tour="curriculum-filter"]',
    title: 'Curriculum Filter',
    description: 'Use All, Published, and Track to control which concepts are shown.',
  },
  {
    selector: '[data-tour="library-link"]',
    title: 'Library Home',
    description: 'Jump back to the current library overview page.',
  },
  {
    selector: '[data-tour="topic-section"]',
    title: 'Topics',
    description: 'Expand these topic groups to see the concepts inside each section.',
  },
  {
    selector: '[data-tour="concept-item"], [data-tour="topic-list"]',
    title: 'Concepts',
    description: 'These are the lesson concepts. Click any available concept to open its lesson page.',
  },
  {
    selector: '[data-tour="periodic-table"]',
    title: 'Periodic Table View',
    description: 'Open the curriculum map to browse all topics visually.',
  },
  {
    selector: '[data-tour="career-track"]',
    title: 'Career Track Badge',
    description: 'View metrics and change your certification track from this menu.',
  },
  {
    selector: '[data-tour="github-auth"]',
    title: 'GitHub Auth',
    description: 'Sign in with GitHub here, or sign out if you are already authenticated.',
  },
]

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

export default function TakeTourButton() {
  const [open, setOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)

  const step = TOUR_STEPS[stepIndex]
  const isLast = stepIndex >= TOUR_STEPS.length - 1

  useEffect(() => {
    if (!open) return
    const resolveTarget = () => {
      const node = document.querySelector(step.selector) as HTMLElement | null
      if (!node) {
        setRect(null)
        return
      }
      node.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      setRect(node.getBoundingClientRect())
    }
    resolveTarget()
    window.addEventListener('resize', resolveTarget)
    window.addEventListener('scroll', resolveTarget, true)
    return () => {
      window.removeEventListener('resize', resolveTarget)
      window.removeEventListener('scroll', resolveTarget, true)
    }
  }, [open, step.selector])

  const cardStyle = useMemo(() => {
    if (!rect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    const cardWidth = 320
    const gap = 14
    const viewportPadding = 12
    const placeRight = rect.right + gap + cardWidth <= window.innerWidth - viewportPadding
    const left = placeRight ? rect.right + gap : rect.left - gap - cardWidth
    const top = clamp(rect.top, viewportPadding, window.innerHeight - 220)
    return { top: `${top}px`, left: `${clamp(left, viewportPadding, window.innerWidth - cardWidth - viewportPadding)}px` }
  }, [rect])

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => {
          setStepIndex(0)
          setOpen(true)
        }}
      >
        Take a Tour
      </button>
      {open && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Feature tour">
          <button
            type="button"
            aria-label="Close tour"
            className={styles.backdrop}
            onClick={() => setOpen(false)}
          />
          {rect && (
            <div
              className={styles.spotlight}
              style={{
                top: `${rect.top - 6}px`,
                left: `${rect.left - 6}px`,
                width: `${rect.width + 12}px`,
                height: `${rect.height + 12}px`,
              }}
            />
          )}
          <div className={styles.card} style={cardStyle}>
            <div className={styles.kicker}>
              Step {stepIndex + 1} of {TOUR_STEPS.length}
            </div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondary}
                onClick={() => setStepIndex(i => Math.max(0, i - 1))}
                disabled={stepIndex === 0}
              >
                Back
              </button>
              {isLast ? (
                <button type="button" className={styles.primary} onClick={() => setOpen(false)}>
                  Finish
                </button>
              ) : (
                <button type="button" className={styles.primary} onClick={() => setStepIndex(i => i + 1)}>
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
