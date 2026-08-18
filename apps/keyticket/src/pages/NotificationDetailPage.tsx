import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { BackButton } from '@/components/ui/back-button'
import { markNotificationAsRead, useNotifications } from '@/lib/notifications'

export function NotificationDetailPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { id } = useParams()
  const { notifications } = useNotifications()
  const fromPath = (location.state as { from?: string } | undefined)?.from ?? '/hub'
  const listPath = `/notifications?from=${encodeURIComponent(fromPath)}`

  const notification = useMemo(
    () => notifications.find((item) => item.id === id) ?? null,
    [notifications, id]
  )

  useEffect(() => {
    if (!notification) return
    markNotificationAsRead(notification.id)
    navigate(`/tickets/${notification.ticketId}`, { replace: true })
  }, [notification, navigate])

  if (!notification) {
    return (
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="border-b border-[#EDEBE9] pb-4">
          <div className="flex items-start gap-3">
            <BackButton to={listPath} className="mt-1 shrink-0" />
            <div className="min-w-0 space-y-1">
              <h1 className="truncate text-3xl font-light leading-tight text-[#323130]">Notifica non trovata</h1>
              <p className="text-sm leading-5 text-[#605E5C]">Dettaglio notifica</p>
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-[#EDEBE9] bg-white p-4">
          <button
            type="button"
            onClick={() => navigate(listPath, { state: { from: fromPath } })}
            className="text-sm text-[#009B9B] hover:underline"
          >
            Torna alla lista notifiche
          </button>
        </div>
      </div>
    )
  }

  return null
}
