import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import AuthErrorBanner from '@/components/auth/AuthErrorBanner'
import FooterLabProgress from '@/components/layout/FooterLabProgress'
import GitHubAuthControl from '@/components/auth/GitHubAuthControl'
import PeriodicTableNavButton from '@/components/layout/PeriodicTableNavButton'
import Sidebar from '@/components/sidebar/Sidebar'
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
