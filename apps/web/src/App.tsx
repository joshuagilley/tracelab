import { Routes, Route } from 'react-router-dom'
import AppShell from '@/components/AppShell'
import { AuthProvider } from '@/contexts/auth'
import { GlobalConceptProgressProvider } from '@/contexts/globalConceptProgress'
import { LabCurriculumProgressProvider } from '@/contexts/labCurriculumProgress'
import { CurriculumVisibilityProvider } from '@/contexts/curriculumVisibility'
import { LabProvider } from '@/contexts/lab'
import ConceptLibraryPage from '@/features/concepts/pages/ConceptLibraryPage'
import ConceptDetailPage from '@/features/concepts/pages/ConceptDetailPage'
import CsPeriodicTablePage from '@/features/periodic-table/CsPeriodicTablePage'

export default function App() {
  return (
    <AuthProvider>
      <LabProvider>
        <CurriculumVisibilityProvider>
          <LabCurriculumProgressProvider>
            <GlobalConceptProgressProvider>
              <AppShell>
                <Routes>
                  <Route path="/" element={<ConceptLibraryPage />} />
                  <Route path="/cs-periodic-table" element={<CsPeriodicTablePage />} />
                  <Route path="/concept/:slug" element={<ConceptDetailPage />} />
                </Routes>
              </AppShell>
            </GlobalConceptProgressProvider>
          </LabCurriculumProgressProvider>
        </CurriculumVisibilityProvider>
      </LabProvider>
    </AuthProvider>
  )
}
