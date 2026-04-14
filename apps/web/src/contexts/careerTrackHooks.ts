import { useCallback, useEffect, useState } from 'react'
import { fetchCertifications, type CertificationOption } from '@/lib/certifications/api'
import type { AuthUser } from '@/lib/auth/types'

const guestSelectionKey = 'tracelab_current_career_track'

export function useCertificationsQuery(): { certifications: CertificationOption[]; loading: boolean } {
  const [certifications, setCertifications] = useState<CertificationOption[]>([])
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

  return { certifications, loading }
}

export function useSyncedCareerTrackId(userCareerId: string | undefined): [string, (id: string) => void] {
  const [selectedTrackId, setSelectedTrackIdState] = useState('')

  useEffect(() => {
    if (userCareerId) {
      setSelectedTrackIdState(userCareerId)
      return
    }
    setSelectedTrackIdState(window.localStorage.getItem(guestSelectionKey) ?? '')
  }, [userCareerId])

  return [selectedTrackId, setSelectedTrackIdState]
}

export function useCareerTrackSetter(
  user: AuthUser | null,
  setCareerTrack: (id: string) => Promise<void>,
  setSelectedTrackIdState: (id: string) => void,
) {
  return useCallback(
    async (trackId: string) => {
      setSelectedTrackIdState(trackId)
      if (user) {
        await setCareerTrack(trackId)
        return
      }
      if (trackId) window.localStorage.setItem(guestSelectionKey, trackId)
      else window.localStorage.removeItem(guestSelectionKey)
    },
    [setCareerTrack, user, setSelectedTrackIdState],
  )
}
