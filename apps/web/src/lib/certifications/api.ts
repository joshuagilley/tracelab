import { API_BASE } from '@/lib/api-base'
import { withDefaultCertifications } from '@/lib/certifications/defaults'

export interface CertificationOption {
  id: string
  title: string
  roleKey: string
  description: string
  imagePath: string
  trackTags?: string[]
  sortOrder: number
  active: boolean
}

export async function fetchCertifications(): Promise<CertificationOption[]> {
  const res = await fetch(`${API_BASE}/certifications`, {
    credentials: 'include',
  })
  if (!res.ok) return withDefaultCertifications([])
  const data = (await res.json()) as { certifications?: CertificationOption[] }
  return withDefaultCertifications(Array.isArray(data.certifications) ? data.certifications : [])
}
