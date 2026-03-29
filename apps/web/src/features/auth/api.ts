import { API_BASE } from '@/lib/apiBase'
import type { AuthUser } from './types'

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

export function githubLoginHref(): string {
  const base = API_BASE.replace(/\/$/, '')
  return `${base}/auth/github`
}
