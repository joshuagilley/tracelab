import { useNavigate } from 'react-router-dom'
import type { Concept } from '@/types/concept'
import styles from './ConceptCard.module.css'

interface Props {
  concept: Concept
}

export default function ConceptCard({ concept }: Props) {
  const navigate = useNavigate()
  const available = concept.status === 'available'

  return (
    <button
      className={[styles.card, !available ? styles.cardDisabled : ''].join(' ')}
      onClick={() => available && navigate(`/concept/${concept.slug}`)}
      disabled={!available}
    >
      <div className={styles.top}>
        <h3 className={styles.title}>{concept.title}</h3>
        <span className={`badge badge--${concept.difficulty}`}>{concept.difficulty}</span>
      </div>

      <p className={styles.summary}>{concept.summary}</p>

      <div className={styles.bottom}>
        <div className={styles.tags}>
          {concept.tags.slice(0, 3).map(tag => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
        {!available && <span className={styles.comingSoon}>Coming Soon</span>}
      </div>
    </button>
  )
}
