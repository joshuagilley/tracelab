import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { buildPracticeZip } from '@/lib/practiceZip'
import type { PracticeConfig } from '@/types/labConcept'
import { validateConceptDocument, validateLabDocument, validatePracticeConfig } from './validate'

const here = path.dirname(fileURLToPath(import.meta.url))
// here = apps/web/src/curriculum-config → four levels up to repo root
const repoRoot = path.resolve(here, '../../../..')
const testdataRoot = path.join(
  repoRoot,
  'services/api/internal/curriculumconfig/testdata',
)

function loadJson(rel: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path.join(testdataRoot, rel), 'utf8')) as Record<string, unknown>
}

describe('lab fixtures (shared with Go)', () => {
  const dir = path.join(testdataRoot, 'labs')
  for (const name of readdirSync(dir).filter(f => f.endsWith('.json'))) {
    it(name, () => {
      const raw = JSON.parse(readFileSync(path.join(dir, name), 'utf8')) as Record<string, unknown>
      const errs = validateLabDocument(raw)
      if (name.startsWith('ok_')) {
        expect(errs, errs.join('\n')).toEqual([])
      } else if (name.startsWith('err_')) {
        expect(errs.length).toBeGreaterThan(0)
      } else {
        throw new Error('fixture name must start with ok_ or err_')
      }
    })
  }
})

describe('concept fixtures (shared with Go)', () => {
  const dir = path.join(testdataRoot, 'concepts')
  for (const name of readdirSync(dir).filter(f => f.endsWith('.json'))) {
    it(name, () => {
      const raw = JSON.parse(readFileSync(path.join(dir, name), 'utf8')) as Record<string, unknown>
      const errs = validateConceptDocument(raw)
      if (name.startsWith('ok_')) {
        expect(errs, errs.join('\n')).toEqual([])
      } else if (name.startsWith('err_')) {
        expect(errs.length).toBeGreaterThan(0)
      } else {
        throw new Error('fixture name must start with ok_ or err_')
      }
    })
  }
})

describe('practice + zip integration', () => {
  it('ok_practice builds a ZIP without throwing', () => {
    const doc = loadJson('concepts/ok_practice.json')
    const errs = validateConceptDocument(doc)
    expect(errs).toEqual([])
    const p = doc.practice as PracticeConfig
    const bytes = buildPracticeZip(p)
    expect(bytes.length).toBeGreaterThan(0)
  })

  it('validatePracticeConfig matches empty-files rule', () => {
    const errs = validatePracticeConfig({
      zipName: 'x.zip',
      folder: 'lab',
      files: [],
    })
    expect(errs.some(e => e.includes('at least one file'))).toBe(true)
  })
})
