import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useCareerTrack } from '@/contexts/careerTrack'
import type { CurriculumFilterMode } from '@/lib/track-filter'

const STORAGE_KEY = 'tracelab-curriculum-filter-mode'

export interface CurriculumVisibilityValue {
  filterMode: CurriculumFilterMode
  setFilterMode: (value: CurriculumFilterMode) => void
}

const CurriculumVisibilityContext = createContext<CurriculumVisibilityValue | null>(null)

function readStored(hasTrack: boolean): CurriculumFilterMode {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'all' || v === 'published' || v === 'track') {
      if (v === 'track' && !hasTrack) return 'published'
      return v
    }
    return hasTrack ? 'track' : 'published'
  } catch {
    return hasTrack ? 'track' : 'published'
  }
}

export function CurriculumVisibilityProvider({ children }: { children: ReactNode }) {
  const { selectedTrackId } = useCareerTrack()
  const hasTrack = !!selectedTrackId
  const [filterMode, setFilterModeState] = useState<CurriculumFilterMode>(() => readStored(hasTrack))

  useEffect(() => {
    let hasStored = false
    try {
      hasStored = !!localStorage.getItem(STORAGE_KEY)
    } catch {
      hasStored = false
    }
    setFilterModeState(prev => {
      if (prev === 'track' && !hasTrack) return 'published'
      if (!hasTrack && (prev === 'all' || prev === 'published')) return prev
      if (hasTrack && prev !== 'track' && !hasStored) return 'track'
      return prev
    })
  }, [hasTrack])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, filterMode)
    } catch {
      /* ignore */
    }
  }, [filterMode])

  const setFilterMode = useCallback((value: CurriculumFilterMode) => {
    setFilterModeState(value)
  }, [])

  const value = useMemo(
    () => ({ filterMode, setFilterMode }),
    [filterMode, setFilterMode],
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
