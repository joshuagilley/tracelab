import { strToU8, zipSync } from 'fflate'
import { API_BASE } from '@/lib/api-base'
import type { PracticeConfig } from '@/types/lab-concept'

export function practiceUsesGcsStorage(config: PracticeConfig): boolean {
  return String(config.storage ?? '').trim().toLowerCase() === 'gcs'
}

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
export function resolvePracticeFiles(config: PracticeConfig, languageType?: string) {
  const selected = languageType?.trim().toLowerCase()
  if (selected && Array.isArray(config.languages) && config.languages.length > 0) {
    const match = config.languages.find(bundle => bundle.type.trim().toLowerCase() === selected)
    if (match?.files) return match.files
  }
  if (Array.isArray(config.files)) return config.files
  if (Array.isArray(config.languages) && config.languages.length > 0) {
    const first = config.languages[0].files
    if (Array.isArray(first)) return first
  }
  return []
}

/** Build a ZIP archive from a PracticeConfig and return the raw bytes. */
export function buildPracticeZip(config: PracticeConfig, languageType?: string): Uint8Array {
  const entries: Record<string, Uint8Array> = {}
  for (const file of resolvePracticeFiles(config, languageType)) {
    const zipPath = practiceZipEntryPath(config.folder, file.name)
    entries[zipPath] = strToU8(file.content)
  }
  return zipSync(entries)
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

async function downloadPracticeZipFromGcs(
  practice: PracticeConfig,
  ctx: { labId: string; slug: string; language?: string },
): Promise<void> {
  const lang = (ctx.language ?? 'go').trim().toLowerCase() || 'go'
  const q = new URLSearchParams({ lab: ctx.labId, slug: ctx.slug, language: lang })
  const res = await fetch(`${API_BASE}/labs/practice.zip?${q}`, { credentials: 'include' })
  if (!res.ok) {
    throw new Error(`practice.zip failed (${res.status})`)
  }
  const blob = await res.blob()
  const name = (practice.zipName && practice.zipName.trim()) || 'tracelab-lab.zip'
  triggerBlobDownload(blob, name)
}

/**
 * Download the practice ZIP: embedded labs are zipped client-side; `storage: gcs` labs
 * are fetched from `GET /api/labs/practice.zip`.
 */
export async function downloadPracticeZip(
  practice: PracticeConfig,
  ctx: { labId: string; slug: string; language?: string },
): Promise<void> {
  if (practiceUsesGcsStorage(practice)) {
    await downloadPracticeZipFromGcs(practice, ctx)
    return
  }
  const bytes = buildPracticeZip(practice, ctx.language)
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/zip' })
  triggerBlobDownload(blob, practice.zipName)
}
