import { strToU8, zipSync } from 'fflate'
import type { PracticeConfig } from '@/types/labConcept'

/** Build a ZIP archive from a PracticeConfig and return the raw bytes. */
export function buildPracticeZip(config: PracticeConfig): Uint8Array {
  const entries: Record<string, Uint8Array> = {}
  for (const file of config.files) {
    entries[`${config.folder}/${file.name}`] = strToU8(file.content)
  }
  return zipSync(entries)
}

/** Trigger a browser download of the practice ZIP. */
export function downloadPracticeZip(config: PracticeConfig): void {
  const bytes = buildPracticeZip(config)
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/zip' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = config.zipName
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
