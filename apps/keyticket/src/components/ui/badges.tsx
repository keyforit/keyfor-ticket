import { cn } from '@/lib/utils'
import type { Status } from '@/data/mock-tickets'

const statusConfig: Record<Status, { label: string; className: string }> = {
  open: { label: 'Aperto', className: 'bg-[#DFF6F6] text-[#007575]' },
  in_progress: { label: 'In Lavorazione', className: 'bg-[#FFF4CE] text-[#8A6E00]' },
  resolved: { label: 'Risolto', className: 'bg-[#DFF6DD] text-[#107C10]' },
  closed: { label: 'Chiuso', className: 'bg-[#F3F2F1] text-[#605E5C]' },
}

export function StatusBadge({ status }: { status: Status }) {
  const { label, className } = statusConfig[status]
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', className)}>
      {label}
    </span>
  )
}
