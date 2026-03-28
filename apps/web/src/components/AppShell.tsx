import type { ReactNode } from 'react'
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
        <main className={styles.main}>{children}</main>
        <footer className={styles.footer}>
          <span className={styles.footerLeft}>
            <span className={styles.statusDot} /> TERMINAL CONNECTION: ACTIVE.
          </span>
          <span className={styles.footerRight}>© {new Date().getFullYear()} TRACELAB SYSTEMS GROUP.</span>
        </footer>
      </div>
    </div>
  )
}
