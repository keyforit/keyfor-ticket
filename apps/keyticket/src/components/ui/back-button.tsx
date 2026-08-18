import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  to?: string | number
  className?: string
}

export function BackButton({ to = -1, className }: BackButtonProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (typeof to === 'number') {
      navigate(to)
      return
    }
    const historyIndex = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (historyIndex > 0) {
      navigate(-1)
      return
    }
    navigate(to, { replace: true })
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#DDF1F4] text-[#201F1E] hover:bg-[#CFE8EC]',
        className
      )}
    >
      <ChevronLeft className="h-4 w-4 shrink-0" />
    </button>
  )
}
