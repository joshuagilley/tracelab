import type { LabParameter } from '@/types/lab-concept'
import styles from './ParametersPanel.module.css'

interface Props {
  parameters: LabParameter[]
  values: Record<string, number | boolean | string>
  onChange: (id: string, value: number | boolean | string) => void
}

/**
 * Generic simulation parameters panel — driven entirely by the concept's JSON config.
 * Renders sliders, toggles, and selects from the `parameters` array.
 */
export default function ParametersPanel({ parameters, values, onChange }: Props) {
  if (!parameters.length) return null

  return (
    <div className={`panel ${styles.panel}`}>
      <div className={styles.groupLabel}>SIMULATION PARAMETERS</div>
      <div className={styles.controls}>
        {parameters.map(p => {
          if (p.type === 'slider') {
            const val = typeof values[p.id] === 'number'
              ? (values[p.id] as number)
              : (p.default ?? p.min ?? 0)
            return (
              <SliderParam
                key={p.id}
                label={p.label}
                value={val}
                unit={p.unit ?? ''}
                min={p.min ?? 0}
                max={p.max ?? 100}
                step={p.step}
                readOnly={p.readOnly}
                onChange={v => onChange(p.id, v)}
              />
            )
          }

          if (p.type === 'toggle') {
            const checked = typeof values[p.id] === 'boolean'
              ? (values[p.id] as boolean)
              : (p.defaultBool ?? false)
            return (
              <label key={p.id} className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={e => onChange(p.id, e.target.checked)}
                />
                <span>{p.label}</span>
              </label>
            )
          }

          if (p.type === 'select' && p.options) {
            const selected = typeof values[p.id] === 'string'
              ? (values[p.id] as string)
              : (p.defaultOption ?? p.options[0])
            return (
              <label key={p.id} className={styles.selectField}>
                <span className={styles.selectLabel}>{p.label}</span>
                <select
                  className={styles.select}
                  value={selected}
                  onChange={e => onChange(p.id, e.target.value)}
                >
                  {p.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </label>
            )
          }

          return null
        })}
      </div>
    </div>
  )
}

interface SliderProps {
  label: string
  value: number
  unit: string
  min: number
  max: number
  step?: number
  readOnly?: boolean
  onChange: (v: number) => void
}

function SliderParam({ label, value, unit, min, max, step, readOnly, onChange }: SliderProps) {
  return (
    <div className={styles.sliderItem}>
      <div className={styles.sliderTop}>
        <span className={styles.sliderLabel}>{label}</span>
        <span className={styles.sliderValue}>{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={readOnly}
        onChange={e => onChange(Number(e.target.value))}
        className={styles.slider}
      />
    </div>
  )
}
