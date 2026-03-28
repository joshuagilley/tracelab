import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type LabId =
  | 'system-design'
  | 'api-design'
  | 'concurrency'
  | 'database-design'
  | 'cloud-architecture'
  | 'networking'
  | 'security'
  | 'software-architecture'
  | 'testing'
  | 'devops'
  | 'low-level-systems'
  | 'algorithms'
  | 'ai-systems'
  | 'design-patterns'
  | 'data-science'

export interface LabOption {
  id: LabId
  label: string
  slug: string
}

export interface LabGroup {
  heading: string
  options: LabOption[]
}

/** Grouped picker: core engineering → supporting layers → specialized tracks */
export const LAB_GROUPS: LabGroup[] = [
  {
    heading: 'Core engineering',
    options: [
      { id: 'system-design', label: 'System Design', slug: 'system-design' },
      { id: 'api-design', label: 'API Design', slug: 'api-design' },
      { id: 'concurrency', label: 'Concurrency', slug: 'concurrency' },
      { id: 'database-design', label: 'Database Design', slug: 'database-design' },
      { id: 'cloud-architecture', label: 'Cloud Architecture', slug: 'cloud-architecture' },
    ],
  },
  {
    heading: 'Supporting layers',
    options: [
      { id: 'networking', label: 'Networking', slug: 'networking' },
      { id: 'security', label: 'Security', slug: 'security' },
      { id: 'software-architecture', label: 'Software Architecture', slug: 'software-architecture' },
      { id: 'testing', label: 'Testing', slug: 'testing' },
      { id: 'devops', label: 'DevOps', slug: 'devops' },
      { id: 'low-level-systems', label: 'Low-Level Systems', slug: 'low-level-systems' },
    ],
  },
  {
    heading: 'Specialized',
    options: [
      { id: 'design-patterns', label: 'Design Patterns', slug: 'design-patterns' },
      { id: 'data-science', label: 'Data Science', slug: 'data-science' },
      { id: 'algorithms', label: 'Algorithms & Data Structures', slug: 'algorithms' },
      { id: 'ai-systems', label: 'AI Systems', slug: 'ai-systems' },
    ],
  },
]

export const LAB_OPTIONS: LabOption[] = LAB_GROUPS.flatMap(g => g.options)

const STORAGE_KEY = 'tracelab-lab'

interface LabContextValue {
  labId: LabId
  setLabId: (id: LabId) => void
  current: LabOption
}

const LabContext = createContext<LabContextValue | null>(null)

function readStoredLab(): LabId {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw && LAB_OPTIONS.some(o => o.id === raw)) return raw as LabId
  } catch {
    /* ignore */
  }
  return 'system-design'
}

export function LabProvider({ children }: { children: ReactNode }) {
  const [labId, setLabIdState] = useState<LabId>(() => readStoredLab())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, labId)
    } catch {
      /* ignore */
    }
  }, [labId])

  const setLabId = useCallback((id: LabId) => {
    setLabIdState(id)
  }, [])

  const current = useMemo(
    () => LAB_OPTIONS.find(o => o.id === labId) ?? LAB_OPTIONS[0],
    [labId],
  )

  const value = useMemo(
    () => ({ labId, setLabId, current }),
    [labId, setLabId, current],
  )

  return (
    <LabContext.Provider value={value}>
      <div className={`lab-root lab-theme-${labId}`}>{children}</div>
    </LabContext.Provider>
  )
}

export function useLab(): LabContextValue {
  const ctx = useContext(LabContext)
  if (!ctx) throw new Error('useLab must be used within LabProvider')
  return ctx
}
