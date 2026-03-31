import { API_BASE } from '@/lib/api-base'
import type { AuthUser } from '@/lib/auth/types'

export async function fetchAuthMe(): Promise<AuthUser | null> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    credentials: 'include',
  })
  if (!res.ok) return null
  const data = (await res.json()) as { user: AuthUser | null }
  return data.user ?? null
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })
}

export async function updateCareerTrack(careerTrackId: string): Promise<AuthUser | null> {
  const res = await fetch(`${API_BASE}/auth/me/career-track`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ careerTrackId }),
  })
  if (!res.ok) return null
  const data = (await res.json()) as { user: AuthUser | null }
  return data.user ?? null
}

export function githubLoginHref(): string {
  const base = API_BASE.replace(/\/$/, '')
  return `${base}/auth/github`
}
