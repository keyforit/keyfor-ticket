import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, ChevronLeft, Save, X } from 'lucide-react'
import { StatusBadge } from '@/components/ui/badges'
import type { Status } from '@/data/mock-tickets'
import { BackButton } from '@/components/ui/back-button'
import { CancelConfirmDialog } from '@/components/ui/CancelConfirmDialog'
import { createTicketViaApi } from '@/services/api'
import { useAuth } from '@/context/AuthContext'

interface TicketDraft {
  title: string
  description: string
  status: Status
  tags: string
}

const statusLabel: Record<Status, string> = {
  open: 'Aperto',
  in_progress: 'In lavorazione',
  resolved: 'Risolto',
  closed: 'Chiuso',
}

export function TicketReviewPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const draft = location.state?.ticket as TicketDraft | undefined
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false)

  useEffect(() => {
    if (!draft) navigate('/tickets/new', { replace: true })
  }, [draft, navigate])

  if (!draft) return null

  const tags = draft.tags
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  const now = new Date().toLocaleString('it-IT')
  const newId = `KFT-00${Math.floor(Math.random() * 90) + 10}`

  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSave = async () => {
    if (!user?.tenantId) {
      setErrorMsg('Impossibile recuperare il Tenant ID dal profilo utente.')
      return
    }
    
    setIsSaving(true)
    setErrorMsg('')
    try {
      const payload = {
        createdBy: 'user@keyfor.it', // mock user per ora
        creationDate: new Date().toISOString(),
        templateHeaderCode: 'WEB', // codice template
        departmentCode: 'IT',
        fields: [
          { fieldName: 'Subject', fieldValue: draft.title },
          { fieldName: 'Description', fieldValue: draft.description },
          { fieldName: 'Tags', fieldValue: draft.tags }
        ]
      }
      await createTicketViaApi(payload, user.tenantId)
      navigate('/tickets', { replace: true })
    } catch (err: any) {
      setErrorMsg(err.message || 'Errore durante il salvataggio su Business Central')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsCancelConfirmOpen(true)
  }

  const handleConfirmCancel = () => {
    setIsCancelConfirmOpen(false)
    navigate('/tickets')
  }

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-[#EDEBE9] pb-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <BackButton className="mt-1 shrink-0" />
          <div className="min-w-0 space-y-1">
            <h1 className="truncate text-3xl font-light leading-tight text-[#323130]">Conferma ticket</h1>
            <p className="text-sm leading-5 text-[#605E5C]">Nuovo documento</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-[#EDEBE9] px-4 py-2 text-sm leading-none text-[#605E5C] hover:bg-[#F3F2F1]"
          >
            <ChevronLeft className="h-4 w-4 shrink-0" />
            Modifica
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-[#F3D6D8] px-4 py-2 text-sm leading-none text-[#A4262C] hover:bg-[#FDF3F4]"
          >
            <X className="h-4 w-4 shrink-0" />
            Annulla
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-md bg-[#009B9B] px-4 py-2 text-sm font-medium leading-none text-white hover:bg-[#007575] disabled:opacity-50"
          >
            <Save className="h-4 w-4 shrink-0" />
            {isSaving ? 'Salvataggio...' : 'Salva'}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#FDF3F4] px-4 py-3 text-sm text-[#A4262C]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      <CancelConfirmDialog
        open={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        onConfirm={handleConfirmCancel}
      />

      <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#E6F5F5] px-4 py-3 text-sm text-[#323130]">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#009B9B]" />
        <p>Verifica i dati del ticket prima di completare il salvataggio.</p>
      </div>

      <div className="mt-6 space-y-8">
        <section className="border-b border-dotted border-[#EDEBE9] pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm text-[#605E5C]">{newId} · Bozza</div>
              <div className="mt-1 text-xl font-medium text-[#323130]">{draft.title || '—'}</div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={draft.status} />
            </div>
          </div>
        </section>
        <section>
          <div className="grid gap-x-8 gap-y-1 md:grid-cols-2">
            <ReviewField label="ID assegnato" value={newId} />
            <ReviewField label="Data creazione" value={now} />
            <ReviewField label="Stato iniziale" value={statusLabel[draft.status]} />
            <ReviewField label="Segnalato da" value="Marco Rossi" />
            <ReviewField label="Tag" value={tags.length > 0 ? tags.join(', ') : '—'} />
            <ReviewField label="Descrizione" value={draft.description || '—'} />
          </div>
        </section>
      </div>
    </div>
  )
}

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-dotted border-[#EDEBE9] py-2 sm:flex-row sm:items-center">
      <span className="w-32 shrink-0 text-sm font-semibold text-[#201F1E] md:w-48">{label}</span>
      <span className="text-sm text-[#323130]">{value}</span>
    </div>
  )
}
