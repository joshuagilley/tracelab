import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type LabId = 'system-design' | 'design-patterns' | 'data-science'

export interface LabOption {
  id: LabId
  label: string
  slug: string
}

export const LAB_OPTIONS: LabOption[] = [
  { id: 'system-design', label: 'System Design', slug: 'system-design' },
  { id: 'design-patterns', label: 'Design Patterns', slug: 'design-patterns' },
  { id: 'data-science', label: 'Data Science', slug: 'data-science' },
]

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
