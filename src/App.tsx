import { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { HubPage } from '@/pages/HubPage'
import { RequestTypePage } from '@/pages/RequestTypePage'
import { SpostaDataPage } from '@/pages/SpostaDataPage'
import { TicketListPage } from '@/pages/TicketListPage'
import { TicketDetailPage } from '@/pages/TicketDetailPage'
import { EditTicketPage } from '@/pages/EditTicketPage'
import { NewTicketPage } from '@/pages/NewTicketPage'
import { TicketReviewPage } from '@/pages/TicketReviewPage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { NotificationDetailPage } from '@/pages/NotificationDetailPage'

function ScrollToTopOnDesktop() {
  const location = useLocation()

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }
  }, [location.pathname, location.search, location.hash])

  return null
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-8 text-center">Inizializzazione sessione SSO in corso...</div>
  // Se non c'e' l'utente, lo rimandiamo al Key Hub per fare il login
  if (!user) {
    window.location.href = '/'
    return null
  }
  return <>{children}</>
}

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <ScrollToTopOnDesktop />
        <Routes>
          {/* Pagine senza TopNav */}
          <Route path="/hub" element={<RequireAuth><HubPage /></RequireAuth>} />
          <Route path="/request-type" element={<RequireAuth><RequestTypePage /></RequireAuth>} />

          {/* Pagine con TopNav */}
          <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route path="/richieste/sposta-data" element={<SpostaDataPage />} />
            <Route path="/richieste/non-conformita" element={<SpostaDataPage />} />
            <Route path="/richieste/sollecito" element={<SpostaDataPage />} />
            <Route path="/richieste/giacenza-articolo" element={<SpostaDataPage />} />
            <Route path="/richieste/reso-merce" element={<SpostaDataPage />} />
            <Route path="/richieste/variazione-prezzo" element={<SpostaDataPage />} />
            <Route path="/richieste/blocco-ordine" element={<SpostaDataPage />} />
            <Route path="/richieste/sblocco-ordine" element={<SpostaDataPage />} />
            <Route path="/richieste/verifica-pagamento" element={<SpostaDataPage />} />
            <Route path="/richieste/aggiornamento-anagrafica" element={<SpostaDataPage />} />
            <Route path="/richieste/richiesta-fattura" element={<SpostaDataPage />} />
            <Route path="/richieste/reclamo-trasporto" element={<SpostaDataPage />} />
            <Route path="/richieste/priorita-consegna" element={<SpostaDataPage />} />
            <Route path="/richieste/richiesta-documenti" element={<SpostaDataPage />} />
            <Route path="/richieste/cambio-vettore" element={<SpostaDataPage />} />
            <Route path="/dashboard" element={<Navigate to="/tickets?status=open" replace />} />
            <Route path="/tickets" element={<TicketListPage />} />
            <Route path="/tickets/new" element={<NewTicketPage />} />
            <Route path="/tickets/new/review" element={<TicketReviewPage />} />
            <Route path="/tickets/:id" element={<TicketDetailPage />} />
            <Route path="/tickets/:id/edit" element={<EditTicketPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/notifications/:id" element={<NotificationDetailPage />} />
            <Route path="/settings" element={<div className="p-8 text-[#605E5C]">Impostazioni (coming soon)</div>} />
          </Route>

          {/* Redirect radice e fallbacks - Rimosso il login finto */}
          <Route path="/" element={<Navigate to="/hub" replace />} />
          <Route path="/login" element={<Navigate to="/hub" replace />} />
          <Route path="*" element={<Navigate to="/hub" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}

export default App

