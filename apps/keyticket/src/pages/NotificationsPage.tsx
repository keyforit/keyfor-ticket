import { useLocation, useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { BackButton } from '@/components/ui/back-button'
import { markNotificationAsRead, useNotifications } from '@/lib/notifications'

export function NotificationsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { notifications, unreadCount } = useNotifications()
  const fromPathFromState = (location.state as { from?: string } | undefined)?.from
  const fromPathFromQuery = new URLSearchParams(location.search).get('from') ?? undefined
  const fromPath = fromPathFromState ?? fromPathFromQuery ?? '/hub'

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="border-b border-[#EDEBE9] pb-4">
        <div className="flex items-start gap-3">
          <BackButton to={fromPath} className="mt-1 shrink-0" />
          <div className="min-w-0 space-y-1">
            <h1 className="truncate text-3xl font-light leading-tight text-[#323130]">Notifiche</h1>
            <p className="text-sm leading-5 text-[#605E5C]">
              {notifications.length} notifiche · {unreadCount} non lette
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-[#EDEBE9] bg-white">
        {notifications.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              markNotificationAsRead(item.id)
              navigate(`/tickets/${item.ticketId}`, { state: { from: fromPath } })
            }}
            className={`w-full border-b border-[#EDEBE9] px-4 py-4 text-left last:border-b-0 hover:bg-[#FAF9F8] ${
              item.unread ? 'bg-[#FDFDFC]' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E5F4F4]">
                <Bell className="h-4 w-4 text-[#009B9B]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm ${item.unread ? 'font-semibold text-[#201F1E]' : 'text-[#323130]'}`}>{item.title}</p>
                <p className="mt-0.5 truncate text-xs text-[#605E5C]">{item.preview}</p>
                <p className="mt-1 text-[11px] text-[#A19F9D]">{item.time}</p>
              </div>
              {item.unread && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#D83B01]" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
