import { useEffect, useRef, useState } from 'react'

interface UserProfileMenuProps {
  accentColor: string
  email?: string
  name?: string
  initials?: string
  onLogout: () => void
}

export function UserProfileMenu({
  accentColor,
  email = '',
  name = '',
  initials = '?',
  onLogout,
}: UserProfileMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="h-8 w-8 select-none rounded-full text-xs font-bold text-white"
        style={{ backgroundColor: accentColor }}
        aria-label="Profilo utente"
        aria-expanded={open}
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-64 rounded-md border border-[#EDEBE9] bg-white p-3 shadow-xl">
          <p className="text-xs text-[#605E5C]">Account</p>
          {name && <p className="mt-1 text-sm font-medium text-[#201F1E] truncate">{name}</p>}
          {email && <p className="mt-0.5 text-xs text-[#605E5C] truncate">{email}</p>}
          <button
            type="button"
            onClick={onLogout}
            className="mt-3 w-full rounded-md border border-[#EDEBE9] px-3 py-1.5 text-sm text-[#323130] hover:bg-[#F3F2F1]"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
