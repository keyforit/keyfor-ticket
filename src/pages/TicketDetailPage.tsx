import { useEffect, useState, type ChangeEvent, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, Edit, Send, UserCheck, XCircle } from 'lucide-react'
import type { Status, Ticket } from '@/data/mock-tickets'
import { BackButton } from '@/components/ui/back-button'
import { StatusBadge } from '@/components/ui/badges'
import { handleHorizontalMouseDragScroll, handleHorizontalWheelScroll } from '@/lib/horizontal-wheel-scroll'
import { markTicketRead } from '@/lib/ticket-read-state'

interface Comment {
  text: string
  author: string
  time: string
}

interface ImageAttachment {
  id: string
  file: File
  previewUrl: string
}

interface FileAttachment {
  id: string
  file: File
  fileUrl: string
}

type TicketTab = 'details' | 'comments' | 'attachments' | 'actions'

export function TicketDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const ticket: Ticket | null = null // TODO: fetch ticket by id from API

  const [status, setStatus] = useState<Status>(ticket?.status ?? 'open')
  const [assignee, setAssignee] = useState(ticket?.assignee ?? '')
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [activeTab, setActiveTab] = useState<TicketTab>('details')
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([])
  const [attachedImages, setAttachedImages] = useState<ImageAttachment[]>([])
  useEffect(() => {
    if (!id) return
    markTicketRead(id)
  }, [id])

  if (!ticket) {
    return (
      <div className="p-8 text-center">
        <p className="text-[#605E5C]">Ticket non trovato.</p>
        <button type="button" onClick={() => navigate('/tickets')} className="mt-4 text-sm text-[#009B9B] hover:underline">
          Torna alla lista
        </button>
      </div>
    )
  }

  const handleTakeOver = () => {
    setStatus('in_progress')
    setAssignee('Marco Rossi')
  }

  const handleResolve = () => {
    setStatus('resolved')
  }

  const handleClose = () => {
    setStatus('closed')
  }

  const handleForward = () => {
    navigate('/team')
  }

  const handleComment = () => {
    if (!commentText.trim()) return

    setComments((current) => [
      ...current,
      {
        text: commentText.trim(),
        author: 'Marco Rossi',
        time: new Date().toLocaleString('it-IT'),
      },
    ])
    setCommentText('')
  }

  const handleFileAttach = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) return
    const nextFiles = files.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      file,
      fileUrl: URL.createObjectURL(file),
    }))
    setAttachedFiles((current) => [...current, ...nextFiles])
    event.target.value = ''
  }

  const handleImageAttach = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) return
    const nextImages = files.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }))
    setAttachedImages((current) => [...current, ...nextImages])
    event.target.value = ''
  }

  const handleRemoveFile = (id: string) => {
    setAttachedFiles((current) => {
      const fileToRemove = current.find((file) => file.id === id)
      if (fileToRemove) URL.revokeObjectURL(fileToRemove.fileUrl)
      return current.filter((file) => file.id !== id)
    })
  }

  const handleRemoveImage = (id: string) => {
    setAttachedImages((current) => {
      const imageToRemove = current.find((image) => image.id === id)
      if (imageToRemove) URL.revokeObjectURL(imageToRemove.previewUrl)
      return current.filter((image) => image.id !== id)
    })
  }

  return (
    <div className="w-full px-4 pb-6 sm:px-6 lg:px-8">
      <div className="sticky top-14 z-20 bg-[#F8F9FA] pt-6">
        <div className="border-b border-[#EDEBE9] pb-4">
          <div className="flex items-start gap-3">
            <BackButton to="/tickets" className="mt-1 shrink-0" />
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-3xl font-light leading-tight text-[#323130]">{ticket.requestType ?? ticket.title}</h1>
              <div className="mt-1 h-5" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="relative mt-4 rounded-2xl border border-[#EDEBE9] bg-white px-4 py-3 text-sm">
          <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-[#201F1E]">Numero richiesta</p>
              <p className="text-[#323130]">{ticket.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-[#201F1E]">Segnalato da</p>
              <p className="text-[#323130]">{ticket.reporter}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-[#201F1E]">Presa in carico da</p>
              <p className="text-[#323130]">{assignee || 'In attesa di assegnazione'}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-[#201F1E]">Data richiesta</p>
              <p className="text-[#323130]">{new Date(ticket.createdAt).toLocaleDateString('it-IT')}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-[#201F1E]">Stato</p>
              <StatusBadge status={status} />
            </div>
          </div>
        </div>

        <div
          onWheel={handleHorizontalWheelScroll}
          onMouseMove={handleHorizontalMouseDragScroll}
          className="no-scrollbar mt-4 flex cursor-grab gap-4 overflow-x-auto whitespace-nowrap scroll-smooth text-sm active:cursor-grabbing"
        >
          {[
            { id: 'details' as TicketTab, label: 'Dettagli' },
            { id: 'comments' as TicketTab, label: `Note (${comments.length})` },
            { id: 'attachments' as TicketTab, label: `Allegati (${attachedFiles.length + attachedImages.length})` },
            { id: 'actions' as TicketTab, label: 'Azioni' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 px-1 py-3 ${
                activeTab === tab.id ? 'border-[#009B9B] text-[#009B9B]' : 'border-transparent text-[#605E5C]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="h-px w-full bg-[#EDEBE9]" />
        <div className="h-6 w-full bg-[#F8F9FA]" />
      </div>

      <div className="mt-0 grid grid-cols-1 gap-6">
        <div className="space-y-8">
          {activeTab === 'details' && (
            <>
              <section>
                <div className="grid grid-cols-1 gap-x-8 gap-y-1 md:grid-cols-2">
                  <FieldRow label="Segnalato da" value={ticket.reporter} />
                  <FieldRow label="Data creazione" value={new Date(ticket.createdAt).toLocaleString('it-IT')} />
                  <FieldRow label="Ultimo aggiornamento" value={new Date(ticket.updatedAt).toLocaleString('it-IT')} />
                </div>
              </section>
            </>
          )}

          {activeTab === 'comments' && (
            <section>
              {comments.length > 0 && (
                <div className="space-y-4">
                  {comments.map((comment, index) => (
                    <div key={`${comment.time}-${index}`} className="border-b border-dotted border-[#EDEBE9] pb-4">
                      <div className="mb-1 text-xs text-[#605E5C]">
                        {comment.author} · {comment.time}
                      </div>
                      <p className="text-sm text-[#323130]">{comment.text}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6">
                <label className="mb-2 block text-sm font-semibold text-[#201F1E]">Nuova nota</label>
                <textarea
                  placeholder="Scrivi una nota"
                  rows={4}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full border border-[#EDEBE9] bg-white px-3 py-2 text-sm text-[#323130] outline-none focus:border-[#009B9B]"
                />
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={handleComment}
                    disabled={!commentText.trim()}
                    className="bg-[#009B9B] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#007575] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Aggiungi nota
                  </button>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'attachments' && (
            <section>
              <h2 className="mb-4 text-base font-semibold text-[#323130]">Allegati</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-[#EDEBE9] bg-white p-4">
                  <p className="text-sm font-semibold text-[#323130]">Immagini</p>
                  <label className="mt-3 inline-flex cursor-pointer items-center rounded-md border border-[#EDEBE9] px-3 py-2 text-sm text-[#323130] hover:bg-[#F3F2F1]">
                    Inserisci immagine
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageAttach} />
                  </label>
                  <div className="mt-3 space-y-1 text-xs text-[#605E5C]">
                    {attachedImages.length === 0 ? (
                      <p>Nessuna immagine allegata.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {attachedImages.map((image) => (
                          <div key={image.id} className="rounded-md border border-[#EDEBE9] p-2">
                            <img
                              src={image.previewUrl}
                              alt={image.file.name}
                              className="h-20 w-full rounded object-cover"
                            />
                            <p className="mt-1 truncate text-[11px] text-[#323130]">{image.file.name}</p>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(image.id)}
                              className="mt-1 text-[11px] font-medium text-[#A4262C] hover:underline"
                            >
                              Elimina
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-[#EDEBE9] bg-white p-4">
                  <p className="text-sm font-semibold text-[#323130]">File</p>
                  <label className="mt-3 inline-flex cursor-pointer items-center rounded-md border border-[#EDEBE9] px-3 py-2 text-sm text-[#323130] hover:bg-[#F3F2F1]">
                    Inserisci file
                    <input type="file" multiple className="hidden" onChange={handleFileAttach} />
                  </label>
                  <div className="mt-3 space-y-1 text-xs text-[#605E5C]">
                    {attachedFiles.length === 0 ? (
                      <p>Nessun file allegato.</p>
                    ) : (
                      attachedFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <a
                              href={file.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="truncate text-[#323130] hover:text-[#009B9B] hover:underline"
                            >
                              {file.file.name}
                            </a>
                            <p className="text-[11px] text-[#A19F9D]">{Math.max(1, Math.round(file.file.size / 1024))} KB</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(file.id)}
                            className="shrink-0 text-[11px] font-medium text-[#A4262C] hover:underline"
                          >
                            Elimina
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'actions' && (
            <section className="max-w-sm rounded-2xl border border-[#EDEBE9] bg-white p-4">
              <h2 className="mb-4 text-sm font-semibold text-[#323130]">Azioni</h2>
              <div className="space-y-2">
                {status === 'open' && (
                  <button
                    type="button"
                    onClick={() => navigate(`/tickets/${ticket.id}/edit`)}
                    className="flex w-full items-center gap-2 border border-[#EDEBE9] px-3 py-2 text-sm text-[#323130] hover:bg-[#F3F2F1]"
                  >
                    <Edit className="h-4 w-4 text-[#009B9B]" />
                    Sollecita
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleTakeOver}
                  disabled={status === 'in_progress' || status === 'resolved' || status === 'closed'}
                  className="flex w-full items-center gap-2 border border-[#EDEBE9] px-3 py-2 text-sm text-[#323130] hover:bg-[#F3F2F1] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <UserCheck className="h-4 w-4 text-[#009B9B]" />
                  Prendi in carico
                </button>
                <button
                  type="button"
                  onClick={handleForward}
                  className="flex w-full items-center gap-2 border border-[#EDEBE9] px-3 py-2 text-sm text-[#323130] hover:bg-[#F3F2F1]"
                >
                  <Send className="h-4 w-4 text-[#009B9B]" />
                  Inoltra
                </button>
                <button
                  type="button"
                  onClick={handleResolve}
                  disabled={status === 'resolved' || status === 'closed'}
                  className="flex w-full items-center gap-2 border border-[#EDEBE9] px-3 py-2 text-sm text-[#323130] hover:bg-[#F3F2F1] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <CheckCircle2 className="h-4 w-4 text-[#107C10]" />
                  Segna come risolto
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={status === 'closed'}
                  className="flex w-full items-center gap-2 border border-[#F3D6D8] px-3 py-2 text-sm text-[#A4262C] hover:bg-[#FDF3F4] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <XCircle className="h-4 w-4" />
                  Chiudi ticket
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function FieldRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-dotted border-[#EDEBE9] py-2 sm:flex-row sm:items-center">
      <span className="w-32 shrink-0 text-sm font-semibold text-[#201F1E] md:w-48">{label}</span>
      <span className="min-w-0 text-sm text-[#323130]">{value}</span>
    </div>
  )
}
