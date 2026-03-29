import type { LabParameter } from '@/types/labConcept'
import type { NumpyFn } from '@/lib/numpyDemo'
import styles from './LabBottomPanels.module.css'

interface Props {
  parameters: LabParameter[]
  numpyFn: NumpyFn
  arrayLen: number
  onNumpyFn: (v: NumpyFn) => void
  onArrayLen: (v: number) => void
}

export default function DataScienceLabPanel({
  parameters,
  numpyFn,
  arrayLen,
  onNumpyFn,
  onArrayLen,
}: Props) {
  const fnParam = parameters.find(p => p.id === 'numpy_fn')
  const lenParam = parameters.find(p => p.id === 'array_len')

  return (
    <div className={`panel ${styles.strip}`}>
      <div className={styles.group}>
        <div className={styles.groupLabel}>SIMULATION PARAMETERS</div>
        <div className={styles.controls}>
          {fnParam?.type === 'select' && (
            <label className={styles.field}>
              <span className={styles.fieldLabel}>{fnParam.label}</span>
              <select
                className={styles.select}
                value={numpyFn}
                onChange={e => onNumpyFn(e.target.value as NumpyFn)}
              >
                {(fnParam.options ?? []).map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </label>
          )}
          {lenParam?.type === 'slider' && (
            <label className={styles.fieldGrow}>
              <div className={styles.sliderTop}>
                <span className={styles.fieldLabel}>{lenParam.label}</span>
                <span className={styles.sliderValue}>{arrayLen}</span>
              </div>
              <input
                type="range"
                min={lenParam.min ?? 4}
                max={lenParam.max ?? 32}
                step={lenParam.step ?? 1}
                value={arrayLen}
                onChange={e => onArrayLen(Number(e.target.value))}
                className={styles.slider}
              />
            </label>
          )}
        </div>
      </div>
      <div className={styles.divider} />
      <div className={styles.group}>
        <div className={styles.groupLabel}>LESSON MODE</div>
        <p className={styles.text}>
          Sliders drive the chart above; numbers match the embedded lesson’s Python semantics in the code panel,
          rendered in the browser for TraceLab (no separate Python service).
        </p>
      </div>
    </div>
  )
}
