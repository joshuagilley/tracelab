import { practiceZipEntryPath } from '@/lib/practiceZip'

/** Mongo `practice` object for downloadable ZIPs. Paths must match `practiceZipEntryPath` rules. */
export function validatePracticeConfig(raw: unknown): string[] {
  if (raw === null || raw === undefined) {
    return []
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    return ['practice: must be an object']
  }
  const m = raw as Record<string, unknown>
  const out: string[] = []

  const zipName = m.zipName
  if (typeof zipName !== 'string' || zipName.trim() === '') {
    out.push('practice.zipName: required non-empty string')
  }

  const folder = m.folder
  if (typeof folder !== 'string' || folder.trim() === '') {
    out.push('practice.folder: required non-empty string')
  } else {
    try {
      practiceZipEntryPath(folder, 'x')
    } catch (e) {
      out.push(`practice.folder: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  const filesRaw = m.files
  if (filesRaw === undefined) {
    out.push('practice.files: required array')
    return out
  }
  if (!Array.isArray(filesRaw)) {
    out.push('practice.files: must be an array')
    return out
  }
  if (filesRaw.length === 0) {
    out.push('practice.files: must contain at least one file')
  }

  if (typeof folder === 'string' && folder.trim() !== '') {
    for (let i = 0; i < filesRaw.length; i++) {
      const item = filesRaw[i]
      if (typeof item !== 'object' || item === null || Array.isArray(item)) {
        out.push(`practice.files[${i}]: must be an object`)
        continue
      }
      const fm = item as Record<string, unknown>
      const name = fm.name
      if (typeof name !== 'string' || name.trim() === '') {
        out.push(`practice.files[${i}].name: required non-empty string`)
      } else {
        try {
          practiceZipEntryPath(folder, name)
        } catch (e) {
          out.push(
            `practice.files[${i}].name: ${e instanceof Error ? e.message : String(e)}`,
          )
        }
      }
      if (typeof fm.content !== 'string') {
        out.push(`practice.files[${i}].content: must be a string`)
      }
    }
  }

  return out
}

export function validateLabDocument(raw: Record<string, unknown>): string[] {
  const out: string[] = []

  const id = raw._id
  if (typeof id !== 'string' || id.trim() === '') {
    out.push('lab._id: required non-empty string (lab id)')
  }

  if ('practice' in raw) {
    out.push(
      'lab document must not contain top-level practice (put practice on the Concepts collection document for that slug)',
    )
  }

  const conceptsRaw = raw.concepts
  if (conceptsRaw === null || conceptsRaw === undefined) {
    out.push('lab.concepts: required array')
    return out
  }
  if (!Array.isArray(conceptsRaw)) {
    out.push('lab.concepts: must be an array')
    return out
  }
  if (conceptsRaw.length === 0) {
    out.push('lab.concepts: must contain at least one concept')
  }

  const slugCounts = new Map<string, number>()
  for (let i = 0; i < conceptsRaw.length; i++) {
    const item = conceptsRaw[i]
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      out.push(`lab.concepts[${i}]: must be an object`)
      continue
    }
    out.push(...validateConceptRow(item as Record<string, unknown>, i, typeof id === 'string' ? id : ''))
    const slug = (item as Record<string, unknown>).slug
    if (typeof slug === 'string' && slug.trim() !== '') {
      slugCounts.set(slug, (slugCounts.get(slug) ?? 0) + 1)
    }
  }
  for (const [slug, n] of slugCounts) {
    if (n > 1) {
      out.push(`lab.concepts: duplicate slug ${JSON.stringify(slug)} (${n} rows)`)
    }
  }

  const navRaw = raw.navSections
  if (navRaw === null || navRaw === undefined) {
    return out
  }
  if (!Array.isArray(navRaw)) {
    out.push('lab.navSections: must be an array when present')
    return out
  }

  const known = new Set(slugCounts.keys())
  for (let si = 0; si < navRaw.length; si++) {
    const sec = navRaw[si]
    if (typeof sec !== 'object' || sec === null || Array.isArray(sec)) {
      out.push(`lab.navSections[${si}]: must be an object`)
      continue
    }
    const sm = sec as Record<string, unknown>
    if (typeof sm.id !== 'string' || sm.id.trim() === '') {
      out.push(`lab.navSections[${si}].id: required non-empty string`)
    }
    if (typeof sm.title !== 'string') {
      out.push(`lab.navSections[${si}].title: required string`)
    }
    if (typeof sm.blurb !== 'string') {
      out.push(`lab.navSections[${si}].blurb: required string`)
    }
    const itemsRaw = sm.items
    if (itemsRaw === null || itemsRaw === undefined) {
      out.push(`lab.navSections[${si}].items: required array`)
      continue
    }
    if (!Array.isArray(itemsRaw)) {
      out.push(`lab.navSections[${si}].items: must be an array`)
      continue
    }
    for (let ii = 0; ii < itemsRaw.length; ii++) {
      const it = itemsRaw[ii]
      if (typeof it !== 'object' || it === null || Array.isArray(it)) {
        out.push(`lab.navSections[${si}].items[${ii}]: must be an object`)
        continue
      }
      const im = it as Record<string, unknown>
      if (typeof im.label !== 'string' || im.label.trim() === '') {
        out.push(`lab.navSections[${si}].items[${ii}].label: required non-empty string`)
      }
      const ns = im.slug
      if (typeof ns !== 'string' || ns.trim() === '') {
        continue
      }
      if (!known.has(ns)) {
        out.push(
          `lab.navSections[${si}].items[${ii}]: slug ${JSON.stringify(ns)} has no matching lab.concepts[].slug`,
        )
      }
    }
  }

  return out
}

export function validateConceptDocument(raw: Record<string, unknown>): string[] {
  const out: string[] = []
  if (raw.practice != null) {
    out.push(...validatePracticeConfig(raw.practice))
  }
  const cf = raw.codeFiles
  if (cf === null || cf === undefined) {
    return out
  }
  if (!Array.isArray(cf)) {
    return [...out, 'codeFiles: must be an array when present']
  }
  for (let i = 0; i < cf.length; i++) {
    const item = cf[i]
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      out.push(`codeFiles[${i}]: must be an object`)
      continue
    }
    const cm = item as Record<string, unknown>
    if (typeof cm.name !== 'string' || cm.name.trim() === '') {
      out.push(`codeFiles[${i}].name: required non-empty string`)
    }
    if (typeof cm.lang !== 'string' || cm.lang.trim() === '') {
      out.push(`codeFiles[${i}].lang: required non-empty string`)
    }
    if (cm.code != null && typeof cm.code !== 'string') {
      out.push(`codeFiles[${i}].code: must be a string when present`)
    }
  }
  return out
}

function validateConceptRow(cm: Record<string, unknown>, index: number, labID: string): string[] {
  const p = (msg: string) => `lab.concepts[${index}].${msg}`
  const out: string[] = []

  if (typeof cm.slug !== 'string' || cm.slug.trim() === '') {
    out.push(p('slug: required non-empty string'))
  }
  if (typeof cm.id !== 'string' || cm.id.trim() === '') {
    out.push(p('id: required non-empty string'))
  }
  if (typeof cm.title !== 'string' || cm.title.trim() === '') {
    out.push(p('title: required non-empty string'))
  }
  if (typeof cm.summary !== 'string') {
    out.push(p('summary: required string'))
  }
  if (!isDifficulty(cm.difficulty)) {
    out.push(p('difficulty: must be one of easy, medium, hard'))
  }
  if (!Array.isArray(cm.tags)) {
    out.push(p('tags: required array (may be empty)'))
  }
  if (cm.status !== 'available' && cm.status !== 'coming-soon') {
    out.push(p('status: must be "available" or "coming-soon"'))
  }
  if (typeof cm.labKind !== 'string' || cm.labKind.trim() === '') {
    out.push(p('labKind: required non-empty string'))
  } else if (labID !== '' && cm.labKind !== labID) {
    out.push(p(`labKind: expected ${JSON.stringify(labID)} to match lab._id`))
  }
  if (typeof cm.vizType !== 'string' || cm.vizType.trim() === '') {
    out.push(p('vizType: required non-empty string'))
  }

  const cf = cm.codeFiles
  if (cf !== null && cf !== undefined) {
    if (!Array.isArray(cf)) {
      out.push(p('codeFiles: must be an array when present'))
    } else {
      for (let fi = 0; fi < cf.length; fi++) {
        const item = cf[fi]
        if (typeof item !== 'object' || item === null || Array.isArray(item)) {
          out.push(p(`codeFiles[${fi}]: must be an object`))
          continue
        }
        const fm = item as Record<string, unknown>
        if (typeof fm.name !== 'string' || fm.name.trim() === '') {
          out.push(p(`codeFiles[${fi}].name: required non-empty string`))
        }
        if (typeof fm.lang !== 'string' || fm.lang.trim() === '') {
          out.push(p(`codeFiles[${fi}].lang: required non-empty string`))
        }
      }
    }
  }

  return out
}

function isDifficulty(v: unknown): v is string {
  return v === 'easy' || v === 'medium' || v === 'hard'
}
