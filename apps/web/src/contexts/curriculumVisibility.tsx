import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'tracelab-curriculum-published-only'

export interface CurriculumVisibilityValue {
  /** When true, sidebars and the concept library list only show lessons with `status: available`. */
  publishedOnly: boolean
  setPublishedOnly: (value: boolean) => void
}

const CurriculumVisibilityContext = createContext<CurriculumVisibilityValue | null>(null)

/** Default on first visit: published only. Persisted `0` / `1` overrides after the user toggles. */
function readStored(): boolean {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === '0') return false
    if (v === '1') return true
    return true
  } catch {
    return true
  }
}

export function CurriculumVisibilityProvider({ children }: { children: ReactNode }) {
  const [publishedOnly, setPublishedOnlyState] = useState(() => readStored())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, publishedOnly ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [publishedOnly])

  const setPublishedOnly = useCallback((value: boolean) => {
    setPublishedOnlyState(value)
  }, [])

  const value = useMemo(
    () => ({ publishedOnly, setPublishedOnly }),
    [publishedOnly, setPublishedOnly],
  )

  return (
    <CurriculumVisibilityContext.Provider value={value}>
      {children}
    </CurriculumVisibilityContext.Provider>
  )
}

export function useCurriculumVisibility(): CurriculumVisibilityValue {
  const ctx = useContext(CurriculumVisibilityContext)
  if (!ctx) {
    throw new Error('useCurriculumVisibility must be used within CurriculumVisibilityProvider')
  }
  return ctx
}
