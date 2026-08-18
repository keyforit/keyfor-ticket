import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Bell, Settings } from 'lucide-react'
import { BackButton } from '@/components/ui/back-button'
import { UserProfileMenu } from '@/components/layout/UserProfileMenu'
import { useNotifications } from '@/lib/notifications'
import { useAuth } from '@/context/AuthContext'
import { getTemplateGroups } from '@/lib/user-templates'
import { getRequestTypeColor } from '@/lib/request-type'
import { handleHorizontalMouseDragScroll, handleHorizontalWheelScroll } from '@/lib/horizontal-wheel-scroll'

const SKELETON_CARDS = 4

export function RequestTypePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { unreadCount } = useNotifications()
  const { user, templates, loading } = useAuth()
  const [activeGroup, setActiveGroup] = useState('')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const currentPath = `${location.pathname}${location.search}`

  const groups = getTemplateGroups(templates)
  const effectiveActiveGroup = groups.includes(activeGroup) ? activeGroup : groups[0] ?? ''
  const showGroupTabs = groups.length > 1
  const filteredTemplates = effectiveActiveGroup
    ? templates.filter((template) => (template.groupCode || 'Altro') === effectiveActiveGroup)
    : templates

  const email = user?.email || user?.username || ''
  const displayName = user?.name || ''
  const initials =
    (user?.name || user?.email || user?.username || '')
      .split(/[\s@.]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join('') || '?'

  const handleLogout = () => {
    navigate('/login')
  }

  return (
    <div className="h-screen overflow-hidden bg-[#F8F9FA] flex flex-col">
      <header className="shrink-0 bg-[#1F1F1F] pl-3 pr-6 h-14 flex items-center gap-1">
        <div className="w-14 h-14 flex items-center justify-center shrink-0">
          <img
            src={`${import.meta.env.BASE_URL}login-symbol.png`}
            alt=""
            className="h-12 w-12 object-contain brightness-0 invert"
          />
        </div>
        <button
          type="button"
          onClick={() => navigate('/hub')}
          className="font-semibold text-white text-sm tracking-wide hover:text-white/90 transition-colors"
        >
          Key Ticket
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/notifications', { state: { from: currentPath } })}
            className="relative flex h-8 w-8 items-center justify-center rounded-md text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#D83B01]" />}
          </button>
          <button
            type="button"
            disabled
            className="relative flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-md text-white/30 transition-colors"
            aria-label="Impostazioni"
            title="Impostazioni"
          >
            <Settings className="h-4 w-4" />
          </button>
          <UserProfileMenu
            accentColor="#009B9B"
            email={email}
            name={displayName}
            initials={initials}
            onLogout={handleLogout}
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="flex w-full flex-col px-4 pb-6 sm:px-6 lg:px-8">
          <div className="sticky top-0 z-20 bg-[#F8F9FA] pt-6">
            <div className="pb-4">
              <div className="flex items-start gap-3">
                <BackButton to="/hub" className="mt-1 shrink-0" />
                <div className="min-w-0 space-y-1">
                  <h1 className="truncate text-3xl font-light leading-tight text-[#323130]">Nuova richiesta</h1>
                  <p className="text-sm leading-5 text-[#605E5C]">Seleziona una tipologia di richiesta</p>
                </div>
              </div>
            </div>

            {showGroupTabs && (
              <>
                <div
                  onWheel={handleHorizontalWheelScroll}
                  onMouseMove={handleHorizontalMouseDragScroll}
                  className="no-scrollbar mt-4 flex cursor-grab items-center gap-6 overflow-x-auto whitespace-nowrap scroll-smooth text-sm active:cursor-grabbing"
                >
                  {groups.map((group) => (
                    <button
                      key={group}
                      type="button"
                      onClick={() => setActiveGroup(group)}
                      className={`shrink-0 border-b-2 px-1 py-3 ${
                        effectiveActiveGroup === group
                          ? 'border-[#009B9B] text-[#009B9B]'
                          : 'border-transparent text-[#605E5C]'
                      }`}
                    >
                      {group}
                    </button>
                  ))}
                </div>
                <div className="h-px w-full bg-[#EDEBE9]" />
                <div className="h-5 w-full bg-[#F8F9FA]" />
              </>
            )}
          </div>

          <div className="mt-0 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {loading &&
              Array.from({ length: SKELETON_CARDS }, (_, index) => (
                <div key={index} className="overflow-hidden border border-[#EDEBE9] bg-white animate-pulse">
                  <div className="h-1.5 w-full bg-[#EDEBE9]" />
                  <div className="space-y-4 p-4">
                    <div className="h-5 w-3/4 rounded bg-[#EDEBE9]" />
                    <div className="flex items-center justify-between gap-3">
                      <div className="h-4 w-6 rounded-full bg-[#F3F2F1]" />
                      <div className="h-4 w-24 rounded bg-[#EDEBE9]" />
                    </div>
                  </div>
                </div>
              ))}

            {!loading &&
              filteredTemplates.map((template) => {
                const color = getRequestTypeColor(template.code)
                return (
                  <button
                    key={template.code}
                    type="button"
                    onClick={() => navigate('/richieste/' + template.code.toLowerCase())}
                    className="group w-full overflow-hidden border border-[#EDEBE9] bg-white text-left transition-all duration-200 hover:border-[#009B9B] hover:shadow-md"
                  >
                    <div className="h-1.5 w-full" style={{ backgroundColor: color }} />
                    <div className="flex min-h-[96px] flex-col justify-between gap-4 p-4">
                      <p className="text-base font-medium leading-snug text-[#323130]">
                        {template.description}
                      </p>
                      <div className="flex justify-end">
                        <span
                          className="inline-flex items-center gap-1.5 text-sm font-medium leading-none"
                          style={{ color }}
                        >
                          <span>Seleziona</span>
                          <ChevronRight className="h-4 w-4 shrink-0" />
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}


            {!loading && filteredTemplates.length === 0 && (
              <div className="rounded-xl border border-[#EDEBE9] bg-white p-4 text-sm text-[#605E5C]">
                Nessuna tipologia disponibile
              </div>
            )}
          </div>
        </div>
      </div>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4" onClick={() => setIsSettingsOpen(false)}>
          <div
            className="w-full max-w-md rounded-lg border border-[#EDEBE9] bg-white p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#EDEBE9] text-[#605E5C] hover:bg-[#F3F2F1]"
              aria-label="Chiudi impostazioni"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h2 className="mt-3 text-lg font-semibold text-[#201F1E]">Impostazioni</h2>
            <div className="mt-4 min-h-16 rounded-md border border-dashed border-[#EDEBE9] bg-[#FAF9F8] p-3 text-sm text-[#605E5C]">
              Opzioni in arrivo.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
