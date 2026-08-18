import { useBodyScrollLock } from '@/lib/use-body-scroll-lock'

interface CancelConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  message?: string
}

export function CancelConfirmDialog({
  open,
  onClose,
  onConfirm,
  message = 'Sei sicuro di annullare?',
}: CancelConfirmDialogProps) {
  useBodyScrollLock(open, { blockNavigationWhileLocked: true })

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex min-h-[100dvh] items-center justify-center bg-black/30 px-4 overscroll-contain" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-lg border border-[#EDEBE9] bg-white p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-[#323130]">Conferma annullamento</h3>
        <p className="mt-2 text-sm text-[#605E5C]">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="border border-[#C8C6C4] px-4 py-2 text-sm text-[#201F1E] hover:bg-[#F3F2F1]"
          >
            No
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="bg-[#D13438] px-4 py-2 text-sm font-medium text-white hover:bg-[#C43135]"
          >
            Sì, annulla
          </button>
        </div>
      </div>
    </div>
  )
}
