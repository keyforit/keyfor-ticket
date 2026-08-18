import { LayoutDashboard, List, PlusCircle, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const items = [
  { to: '/tickets?status=open', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/tickets', label: 'Ticket', icon: List, end: true },
  { to: '/tickets/new', label: 'Nuovo', icon: PlusCircle, special: true },
  { to: '/settings', label: 'Impostazioni', icon: Settings },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#EDEBE9] bg-white px-2 pb-[calc(env(safe-area-inset-bottom)+0.25rem)] pt-2 md:hidden">
      <div className="flex items-end">
        {items.map(({ to, label, icon: Icon, end, special }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-1 justify-center py-1 text-[10px] font-medium transition-colors',
                special ? 'text-white' : isActive ? 'text-[#009B9B]' : 'text-[#A19F9D]'
              )
            }
          >
            {({ isActive }) => (
              <div
                className={cn(
                  'flex flex-col items-center gap-1',
                  special && 'rounded-full bg-[#009B9B] p-3 -mt-5 shadow-[0_10px_24px_rgba(0,155,155,0.28)]'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5',
                    special ? 'text-white' : isActive ? 'text-[#009B9B]' : 'text-[#A19F9D]'
                  )}
                />
                {!special && <span>{label}</span>}
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
