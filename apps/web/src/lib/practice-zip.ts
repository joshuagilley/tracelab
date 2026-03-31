import { strToU8, zipSync } from 'fflate'
import type { PracticeConfig } from '@/types/lab-concept'

/** Zip entry path inside the archive: "<folder>/<relative path>". Rejects ".." and other unsafe segments. */
export function practiceZipEntryPath(folder: string, fileName: string): string {
  const normFolder = folder.trim().replace(/\\/g, '/')
  const folderParts = normFolder.split('/').filter(Boolean)
  if (!normFolder || folderParts.some(p => p === '..' || p === '.')) {
    throw new Error(`Invalid practice folder: ${JSON.stringify(folder)}`)
  }

  const rel = fileName.replace(/\\/g, '/')
  const fileParts = rel.split('/').filter(Boolean)
  if (fileParts.length === 0) {
    throw new Error(`Invalid practice file name: ${JSON.stringify(fileName)}`)
  }
  if (fileParts.some(p => p === '..' || p === '.')) {
    throw new Error(`Invalid practice file name: ${JSON.stringify(fileName)}`)
  }

  return [...folderParts, ...fileParts].join('/')
}

/** Build a ZIP archive from a PracticeConfig and return the raw bytes. */
export function buildPracticeZip(config: PracticeConfig): Uint8Array {
  const entries: Record<string, Uint8Array> = {}
  for (const file of config.files) {
    const zipPath = practiceZipEntryPath(config.folder, file.name)
    entries[zipPath] = strToU8(file.content)
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
