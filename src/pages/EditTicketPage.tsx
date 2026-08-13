import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Ticket } from '@/data/mock-tickets'
import { BackButton } from '@/components/ui/back-button'
import { CancelConfirmDialog } from '@/components/ui/CancelConfirmDialog'

export function EditTicketPage() {
  const { id: _id } = useParams()
  const navigate = useNavigate()
  const [ticket] = useState<Ticket | null>(null) // TODO: fetch ticket by id from API

  const [form, setForm] = useState({
    title: ticket?.title ?? '',
    description: ticket?.description ?? '',
  })
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false)

  if (!ticket) {
    return (
      <div className="p-8 text-center">
        <p className="text-[#605E5C]">Ticket non trovato.</p>
      </div>
    )
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    navigate(`/tickets/${ticket.id}`)
  }

  const handleCancel = () => {
    setIsCancelConfirmOpen(true)
  }

  const handleConfirmCancel = () => {
    setIsCancelConfirmOpen(false)
    navigate(`/tickets/${ticket.id}`)
  }

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-start gap-3 border-b border-[#EDEBE9] pb-4">
        <BackButton to={`/tickets/${ticket.id}`} className="mt-1 shrink-0" />
        <div className="min-w-0 space-y-1">
          <h1 className="truncate text-3xl font-light leading-tight text-[#323130]">Modifica Ticket</h1>
          <p className="text-sm leading-5 text-[#605E5C]">{ticket.id}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[#201F1E] mb-2">Titolo</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full border border-[#EDEBE9] px-3 py-2 text-sm text-[#323130] outline-none focus:border-[#009B9B]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#201F1E] mb-2">Descrizione</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={8}
            className="w-full border border-[#EDEBE9] px-3 py-2 text-sm text-[#323130] outline-none focus:border-[#009B9B]"
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-[#EDEBE9] pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-[#EDEBE9] px-4 py-2 text-sm font-medium leading-none text-[#323130] hover:bg-[#F3F2F1]"
          >
            Annulla
          </button>
          <button
            type="submit"
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-[#009B9B] px-4 py-2 text-sm font-medium leading-none text-white hover:bg-[#007575]"
          >
            Salva
          </button>
        </div>
      </form>

      <CancelConfirmDialog
        open={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        onConfirm={handleConfirmCancel}
      />
    </div>
  )
}
