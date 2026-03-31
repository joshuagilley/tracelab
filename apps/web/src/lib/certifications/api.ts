import { API_BASE } from '@/lib/api-base'

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
  if (!res.ok) return []
  const data = (await res.json()) as { certifications?: CertificationOption[] }
  return Array.isArray(data.certifications) ? data.certifications : []
}
