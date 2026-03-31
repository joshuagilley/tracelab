import { useCareerTrack } from '@/contexts/careerTrack'
import { useNavigate } from 'react-router-dom'
import styles from './CareerTrackBadge.module.css'

export default function CareerTrackBadge() {
  const { selectedTrack, certifications, selectedTrackId, loading, setSelectedTrackId } = useCareerTrack()
  const navigate = useNavigate()
  const title = selectedTrack?.title ?? 'Career Track'

  return (
    <div className={styles.wrap} data-tour="career-track">
      {selectedTrack ? (
        <img
          className={styles.badge}
          src={selectedTrack.imagePath}
          alt={`${selectedTrack.title} certification`}
          title={selectedTrack.title}
          loading="lazy"
        />
      ) : (
        <button type="button" className={styles.placeholder} title="Select Career Track">
          Career
        </button>
      )}
      <div className={styles.menu}>
        <button type="button" className={styles.action} onClick={() => navigate('/metrics')}>
          View Metrics
        </button>
        <label className={styles.changeWrap}>
          <span className={styles.changeLabel}>Change Career Track</span>
          <select
            className={styles.select}
            value={selectedTrackId}
            disabled={loading || certifications.length === 0}
            onChange={e => void setSelectedTrackId(e.target.value)}
          >
            {certifications.map(option => (
              <option key={option.id} value={option.id}>
                {option.title}
              </option>
            ))}
          </select>
        </label>
        <p className={styles.current}>Current: {title}</p>
      </div>
    </div>
  )
}
