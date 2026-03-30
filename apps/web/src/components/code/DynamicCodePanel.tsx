import { useMemo, useState, useEffect, type ReactNode } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { LabCodeFile } from '@/types/labConcept'
import styles from './CodePanel.module.css'

function inferLangFromFileName(name: string): string {
  if (name.endsWith('.go')) return 'go'
  if (name.endsWith('.md')) return 'markdown'
  if (name.endsWith('.mod')) return 'go'
  return 'text'
}

function resolvedCode(f: LabCodeFile): string {
  if (f.code != null && f.code !== '') return f.code
  if (f.content != null && f.content !== '') return f.content
  return ''
}

function resolvedLang(f: LabCodeFile): string {
  if (f.lang && f.lang.trim() !== '') {
    return f.lang === 'markdown' ? 'markdown' : f.lang
  }
  return inferLangFromFileName(f.name)
}

interface Props {
  files: LabCodeFile[]
  /** Extra header controls (e.g. practice sandbox download for specific concepts). */
  extraActions?: ReactNode
}

export default function DynamicCodePanel({ files, extraActions }: Props) {
  const map = useMemo(() => {
    const m: Record<string, { lang: string; code: string }> = {}
    for (const f of files) {
      m[f.name] = { lang: resolvedLang(f), code: resolvedCode(f) }
    }
    return m
  }, [files])

  const names = Object.keys(map)
  const [active, setActive] = useState(names[0] ?? '')

  useEffect(() => {
    if (!names.includes(active)) setActive(names[0] ?? '')
  }, [names, active])

  if (!names.length) {
    return (
      <div className={`panel ${styles.panel}`}>
        <div className="panel-header">
          <span className="panel-label">Code</span>
        </div>
        <p className={styles.empty}>No files</p>
      </div>
    )
  }

  const cur = map[active] ?? map[names[0]]
  const code = cur.code
  const lang = cur.lang

  return (
    <div className={`panel ${styles.panel}`}>
      <div className={`panel-header ${styles.header}`}>
        <span className="panel-label">Implementation Editor</span>
        <div className={styles.tabs}>
          {names.map(name => (
            <button
              key={name}
              type="button"
              className={[styles.tab, active === name ? styles.tabActive : ''].join(' ')}
              onClick={() => setActive(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <div className={styles.actions}>
          {extraActions}
          <button
            type="button"
            className={styles.actionBtn}
            title="Copy active file"
            onClick={() => {
              navigator.clipboard.writeText(code).catch(() => {})
            }}
          >
            ⧉
          </button>
        </div>
      </div>

      <div className={styles.codeWrapper}>
        <SyntaxHighlighter
          language={lang}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '16px',
            background: 'transparent',
            fontSize: '12px',
            lineHeight: '1.6',
            fontFamily: 'var(--font-mono)',
          }}
          showLineNumbers
          lineNumberStyle={{
            color: 'var(--text-muted)',
            minWidth: '2.5em',
            paddingRight: '1em',
            userSelect: 'none',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}
