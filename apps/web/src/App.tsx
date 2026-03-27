import { Routes, Route } from 'react-router-dom'
import AppShell from '@/components/AppShell'
import ConceptLibraryPage from '@/features/concepts/pages/ConceptLibraryPage'
import ConceptDetailPage from '@/features/concepts/pages/ConceptDetailPage'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<ConceptLibraryPage />} />
        <Route path="/concept/:slug" element={<ConceptDetailPage />} />
      </Routes>
    </AppShell>
  )
}
