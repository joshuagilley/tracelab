import type { ReactNode } from 'react'
import AuthErrorBanner from './AuthErrorBanner'
import GitHubAuthControl from './GitHubAuthControl'
import Sidebar from './Sidebar'
import styles from './AppShell.module.css'

interface AppShellProps {
  children: ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.body}>
        <AuthErrorBanner />
        <main className={styles.main}>{children}</main>
        <footer className={styles.footer}>
          <span className={styles.footerLeft}>
            <span className={styles.statusDot} /> TERMINAL CONNECTION: ACTIVE.
          </span>
          <span className={styles.footerRight}>
            <GitHubAuthControl />
            <span className={styles.footerCopyright}>
              © {new Date().getFullYear()} TRACELAB SYSTEMS GROUP.
            </span>
          </span>
        </footer>
      </div>
    </div>
  )
}
