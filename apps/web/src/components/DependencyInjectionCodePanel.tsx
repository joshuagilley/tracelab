import { useMemo, useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { LabCodeFile } from '@/types/labConcept'
import baseStyles from './CodePanel.module.css'
import styles from './DependencyInjectionCodePanel.module.css'

const diHeader = [baseStyles.header, styles.diHeader].join(' ')

interface Props {
  files: LabCodeFile[]
}

type CodeKind = 'good' | 'bad'

export default function DependencyInjectionCodePanel({ files }: Props) {
  const { good, bad } = useMemo(() => {
    const g = files.find(f => f.name === 'present.go')
    const b = files.find(f => f.name === 'bad.go')
    return { good: g, bad: b }
  }, [files])

  const [kind, setKind] = useState<CodeKind>('good')
  const active = kind === 'good' ? good : bad
  const code = active?.code ?? '// (missing file)'
  const lang = active?.lang === 'markdown' ? 'markdown' : 'go'

  return (
    <div className={`panel ${baseStyles.panel}`}>
      <div className={`panel-header ${diHeader}`}>
        <span className="panel-label">Code</span>
        <div className={styles.modeSwitch} role="group" aria-label="Code example">
          <button
            type="button"
            className={[styles.modeBtn, kind === 'good' ? styles.modeBtnActive : ''].join(' ')}
            onClick={() => setKind('good')}
          >
            Good · DI
          </button>
          <button
            type="button"
            className={[styles.modeBtn, kind === 'bad' ? styles.modeBtnActive : ''].join(' ')}
            onClick={() => setKind('bad')}
          >
            Bad · sprawl
          </button>
        </div>
        <span className={styles.filePill}>{active?.name ?? '—'}</span>
        <div className={baseStyles.actions}>
          <button
            type="button"
            className={baseStyles.actionBtn}
            title="Copy code"
            onClick={() => navigator.clipboard.writeText(code)}
          >
            ⧉
          </button>
        </div>
      </div>
      {kind === 'bad' && (
        <p className={styles.warnBanner}>
          Anti-pattern: one config struct, <code>if/else</code> in the service, and every new transport pollutes the same type.
        </p>
      )}
      <div className={baseStyles.codeWrapper}>
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
