import { downloadPracticeZip } from '@/lib/practiceZip'
import type { PracticeConfig } from '@/types/labConcept'
import styles from '@/components/code/CodePanel.module.css'

interface Props {
  practice: PracticeConfig
}

/**
 * Generic practice scaffold download button — rendered inside the CodePanel header.
 * All content (files, folder name, zip name) comes from the concept's JSON config.
 */
export default function PracticeDownloadButton({ practice }: Props) {
  return (
    <button
      type="button"
      className={styles.actionBtn}
      title={`Download a local practice scaffold for this concept (${practice.zipName})`}
      onClick={() => downloadPracticeZip(practice)}
    >
      ⬇
    </button>
  )
}
