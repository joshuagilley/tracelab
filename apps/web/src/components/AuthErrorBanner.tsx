import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import styles from './AuthErrorBanner.module.css'

const LABELS: Record<string, string> = {
  invalid_state: 'Sign-in was cancelled or expired. Try again.',
  missing_code: 'GitHub did not return an authorization code.',
  token_exchange: 'Could not complete GitHub sign-in.',
  github_user: 'Could not load your GitHub profile.',
  github_api: 'GitHub API error.',
  parse_user: 'Unexpected GitHub profile response.',
  db: 'Could not save your account. Check the API and database.',
  session: 'Could not create a session.',
}

export default function AuthErrorBanner() {
  const [params, setParams] = useSearchParams()
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    const code = params.get('auth_error')
    if (!code) return
    setMsg(LABELS[code] ?? `Sign-in failed (${code}).`)
    const next = new URLSearchParams(params)
    next.delete('auth_error')
    setParams(next, { replace: true })
  }, [params, setParams])

  if (!msg) return null

  return (
    <div className={styles.banner} role="status">
      {msg}
    </div>
  )
}
