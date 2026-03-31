import { useEffect, useState, type ReactNode } from 'react'
import { Routes, Route } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import { AuthProvider } from '@/contexts/auth'
import { CareerTrackProvider } from '@/contexts/careerTrack'
import { GlobalConceptProgressProvider } from '@/contexts/globalConceptProgress'
import { LabCurriculumProgressProvider } from '@/contexts/labCurriculumProgress'
import { CurriculumVisibilityProvider } from '@/contexts/curriculumVisibility'
import { LabProvider } from '@/contexts/lab'
import LibraryPage from '@/features/learning/pages/library-page'
import LessonPage from '@/features/learning/pages/lesson-page'
import CsPeriodicTablePage from '@/features/learning/pages/cs-periodic-table-page'
import { fetchLabsCatalogIntoCache } from '@/features/curriculum/catalog-cache'

function CatalogGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    fetchLabsCatalogIntoCache()
      .then(() => setReady(true))
      .catch(e => setErr(e instanceof Error ? e.message : String(e)))
  }, [])

  if (err) {
    return (
      <div style={{ padding: '2rem', maxWidth: 520, fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Curriculum unavailable</h1>
        <p style={{ color: '#a8b0c4', marginBottom: '1rem' }}>{err}</p>
        <p style={{ color: '#a8b0c4', fontSize: '0.9rem' }}>
          Start the API with MongoDB and ensure the <strong>Labs</strong> collection is populated (e.g. import lab
          JSON into Mongo).
        </p>
      </div>
    )
  }

  if (!ready) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', color: '#a8b0c4' }}>
        Loading curriculum…
      </div>
    )
  }

  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <CareerTrackProvider>
        <CatalogGate>
          <LabProvider>
            <CurriculumVisibilityProvider>
              <LabCurriculumProgressProvider>
                <GlobalConceptProgressProvider>
                  <AppShell>
                    <Routes>
                      <Route path="/" element={<LibraryPage />} />
                      <Route path="/cs-periodic-table" element={<CsPeriodicTablePage />} />
                      <Route path="/concept/:slug" element={<LessonPage />} />
                    </Routes>
                  </AppShell>
                </GlobalConceptProgressProvider>
              </LabCurriculumProgressProvider>
            </CurriculumVisibilityProvider>
          </LabProvider>
        </CatalogGate>
      </CareerTrackProvider>
    </AuthProvider>
  )
}
