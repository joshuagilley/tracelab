import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import AuthErrorBanner from './AuthErrorBanner'
import FooterLabProgress from './FooterLabProgress'
import GitHubAuthControl from './GitHubAuthControl'
import PeriodicTableNavButton from './PeriodicTableNavButton'
import Sidebar from './Sidebar'
import styles from './AppShell.module.css'

interface AppShellProps {
  children: ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const { pathname } = useLocation()
  const mainScrollable = pathname === '/cs-periodic-table'

  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.body}>
        <div className={styles.topBar}>
          <PeriodicTableNavButton />
        </div>
        <AuthErrorBanner />
        <main className={[styles.main, mainScrollable ? styles.mainScrollable : ''].join(' ')}>
          {children}
        </main>
        <footer className={styles.footer}>
          <span className={styles.footerLeft}>
            <span className={styles.statusDot} /> TERMINAL CONNECTION: ACTIVE.
          </span>
          <span className={styles.footerRight}>
            <FooterLabProgress />
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
