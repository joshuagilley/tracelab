import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useAuth } from '@/contexts/auth'
import type { CertificationOption } from '@/lib/certifications/api'
import {
  useCareerTrackSetter,
  useCertificationsQuery,
  useSyncedCareerTrackId,
} from '@/contexts/careerTrackHooks'

interface CareerTrackContextValue {
  certifications: CertificationOption[]
  selectedTrackId: string
  selectedTrack: CertificationOption | null
  loading: boolean
  setSelectedTrackId: (trackId: string) => Promise<void>
}

const CareerTrackContext = createContext<CareerTrackContextValue | null>(null)

export function CareerTrackProvider({ children }: { children: ReactNode }) {
  const { user, setCareerTrack } = useAuth()
  const { certifications, loading } = useCertificationsQuery()
  const [selectedTrackId, setSelectedTrackIdState] = useSyncedCareerTrackId(user?.currentCareerTrackId)
  const setSelectedTrackId = useCareerTrackSetter(user, setCareerTrack, setSelectedTrackIdState)

  const selectedTrack = useMemo(
    () => certifications.find(c => c.id === selectedTrackId) ?? null,
    [certifications, selectedTrackId],
  )
  const value = useMemo<CareerTrackContextValue>(
    () => ({
      certifications,
      selectedTrackId,
      selectedTrack,
      loading,
      setSelectedTrackId,
    }),
    [certifications, selectedTrackId, selectedTrack, loading, setSelectedTrackId],
  )

  return <CareerTrackContext.Provider value={value}>{children}</CareerTrackContext.Provider>
}

export function useCareerTrack(): CareerTrackContextValue {
  const ctx = useContext(CareerTrackContext)
  if (!ctx) throw new Error('useCareerTrack must be used within CareerTrackProvider')
  return ctx
}
