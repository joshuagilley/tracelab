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
import { fetchCertifications, type CertificationOption } from '@/lib/certifications/api'

const guestSelectionKey = 'tracelab_current_career_track'

interface CareerTrackContextValue {
  certifications: CertificationOption[]
  selectedTrackId: string
  selectedTrack: CertificationOption | null
  selectedTrackTags: string[]
  loading: boolean
  setSelectedTrackId: (trackId: string) => Promise<void>
}

const CareerTrackContext = createContext<CareerTrackContextValue | null>(null)

export function CareerTrackProvider({ children }: { children: ReactNode }) {
  const { user, setCareerTrack } = useAuth()
  const [certifications, setCertifications] = useState<CertificationOption[]>([])
  const [selectedTrackId, setSelectedTrackIdState] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchCertifications()
      .then(items => {
        if (!cancelled) setCertifications(items)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (user?.currentCareerTrackId) {
      setSelectedTrackIdState(user.currentCareerTrackId)
      return
    }
    const local = window.localStorage.getItem(guestSelectionKey) ?? ''
    setSelectedTrackIdState(local)
  }, [user?.currentCareerTrackId])

  const setSelectedTrackId = useCallback(
    async (trackId: string) => {
      setSelectedTrackIdState(trackId)
      if (user) {
        await setCareerTrack(trackId)
        return
      }
      if (trackId) {
        window.localStorage.setItem(guestSelectionKey, trackId)
      } else {
        window.localStorage.removeItem(guestSelectionKey)
      }
    },
    [setCareerTrack, user],
  )

  const selectedTrack = useMemo(
    () => certifications.find(c => c.id === selectedTrackId) ?? null,
    [certifications, selectedTrackId],
  )
  const selectedTrackTags = useMemo(() => selectedTrack?.trackTags ?? [], [selectedTrack])

  const value = useMemo<CareerTrackContextValue>(
    () => ({
      certifications,
      selectedTrackId,
      selectedTrack,
      selectedTrackTags,
      loading,
      setSelectedTrackId,
    }),
    [certifications, selectedTrackId, selectedTrack, selectedTrackTags, loading, setSelectedTrackId],
  )

  return <CareerTrackContext.Provider value={value}>{children}</CareerTrackContext.Provider>
}

export function useCareerTrack(): CareerTrackContextValue {
  const ctx = useContext(CareerTrackContext)
  if (!ctx) throw new Error('useCareerTrack must be used within CareerTrackProvider')
  return ctx
}
