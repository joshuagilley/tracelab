import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@/contexts/auth'
import { TRACELAB_CONCEPT_PROGRESS_EVENT } from '@/features/concepts/conceptProgressApi'
import { fetchGlobalConceptTotals } from '@/features/concepts/globalProgressAggregation'

export interface GlobalConceptProgressValue {
  completed: number
  total: number
  loading: boolean
  reload: () => Promise<void>
}

const GlobalConceptProgressContext = createContext<GlobalConceptProgressValue | null>(null)

export function GlobalConceptProgressProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [completed, setCompleted] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const next = await fetchGlobalConceptTotals(user)
      setCompleted(next.completed)
      setTotal(next.total)
    } catch {
      setCompleted(0)
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (authLoading) return
    void reload()
  }, [authLoading, reload])

  useEffect(() => {
    const onUpdate = () => void reload()
    window.addEventListener(TRACELAB_CONCEPT_PROGRESS_EVENT, onUpdate)
    return () => window.removeEventListener(TRACELAB_CONCEPT_PROGRESS_EVENT, onUpdate)
  }, [reload])

  const value = useMemo(
    () => ({
      completed,
      total,
      loading,
      reload,
    }),
    [completed, total, loading, reload],
  )

  return (
    <GlobalConceptProgressContext.Provider value={value}>
      {children}
    </GlobalConceptProgressContext.Provider>
  )
}

export function useGlobalConceptProgress(): GlobalConceptProgressValue {
  const ctx = useContext(GlobalConceptProgressContext)
  if (!ctx) throw new Error('useGlobalConceptProgress must be used within GlobalConceptProgressProvider')
  return ctx
}
