import { useEffect, useState } from 'react'
import { ChevronLeft, Bell, Settings, ArrowUp, ArrowDown } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { UserProfileMenu } from './UserProfileMenu'
import { useNotifications } from '@/lib/notifications'
import {
  resetTicketListCustomization,
  setTicketListColumnOrder,
  setTicketListColumnVisibility,
  setTicketListGroupingMode,
  setTicketListGroupingYear,
  TICKET_LIST_COLUMN_LABELS,
  type TicketListColumnKey,
  type TicketListGroupingMode,
  useTicketListCustomization,
} from '@/lib/ticket-list-customization'

export function TopNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { unreadCount } = useNotifications()
  const { visibleColumns, groupingMode, groupingYear, columnOrder } = useTicketListCustomization()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const currentPath = `${location.pathname}${location.search}`
  const statusParam = new URLSearchParams(location.search).get('status')
  const canCustomizeTicketList = location.pathname === '/tickets' && (statusParam === 'open' || statusParam === 'closed')
  const hasSettings = canCustomizeTicketList
  const canUseAssigneeGrouping = statusParam === 'open' || statusParam === 'closed'
  const availableYears = getAvailableYears([])

  useEffect(() => {
    if (!canUseAssigneeGrouping && groupingMode === 'assignee') {
      setTicketListGroupingMode('none')
    }
  }, [canUseAssigneeGrouping, groupingMode])

  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(groupingYear)) {
      setTicketListGroupingYear(availableYears[0])
    }
  }, [availableYears, groupingYear])

  const handleLogout = () => {
    navigate('/login')
  }

  const moveColumn = (columnKey: TicketListColumnKey, direction: 'up' | 'down') => {
    const currentIndex = columnOrder.indexOf(columnKey)
    if (currentIndex === -1) return
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= columnOrder.length) return
    const nextOrder = [...columnOrder]
    const [moved] = nextOrder.splice(currentIndex, 1)
    nextOrder.splice(targetIndex, 0, moved)
    setTicketListColumnOrder(nextOrder)
  }

  return (
    <header className="sticky top-0 z-40 bg-[#1F1F1F] pl-3 pr-6 h-14 flex items-center gap-1">
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
          title="Notifiche"
          onClick={() => navigate('/notifications', { state: { from: currentPath } })}
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-white/80 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#D83B01]" />}
        </button>
        <button
          type="button"
          title="Impostazioni"
          onClick={() => hasSettings && setIsSettingsOpen(true)}
          disabled={!hasSettings}
          className={`relative flex h-8 w-8 items-center justify-center rounded-md text-white/80 transition-colors ${hasSettings ? 'hover:bg-white/10 hover:text-white cursor-pointer' : 'cursor-default opacity-80'}`}
        >
          <Settings className="h-4 w-4" />
        </button>
        <UserProfileMenu accentColor="#009B9B" onLogout={handleLogout} />
      </div>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-4" onClick={() => setIsSettingsOpen(false)}>
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

            {canCustomizeTicketList ? (
              <div className="mt-4 max-h-[70vh] space-y-5 overflow-y-auto pr-1">
                <section>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-[#201F1E]">Personalizza campi</h3>
                    <button
                      type="button"
                      onClick={resetTicketListCustomization}
                      className="rounded-md border border-[#EDEBE9] px-2.5 py-1 text-xs text-[#323130] hover:bg-[#F3F2F1]"
                    >
                      Ripristina
                    </button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {columnOrder.map((columnKey, index) => (
                      <label key={columnKey} className="flex items-center justify-between gap-3 rounded-md border border-[#EDEBE9] px-3 py-2">
                        <span className="text-sm text-[#323130]">{TICKET_LIST_COLUMN_LABELS[columnKey]}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => moveColumn(columnKey, 'up')}
                            disabled={index === 0}
                            className={`inline-flex h-6 w-6 items-center justify-center rounded border border-[#EDEBE9] transition-colors ${index === 0 ? 'cursor-not-allowed text-[#C8C6C4]' : 'text-[#605E5C] hover:bg-[#F3F2F1]'}`}
                            title="Sposta su"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveColumn(columnKey, 'down')}
                            disabled={index === columnOrder.length - 1}
                            className={`inline-flex h-6 w-6 items-center justify-center rounded border border-[#EDEBE9] transition-colors ${index === columnOrder.length - 1 ? 'cursor-not-allowed text-[#C8C6C4]' : 'text-[#605E5C] hover:bg-[#F3F2F1]'}`}
                            title="Sposta giù"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                          <input
                            type="checkbox"
                            checked={visibleColumns[columnKey]}
                            onChange={(event) => setTicketListColumnVisibility(columnKey, event.target.checked)}
                            className="ml-1 h-4 w-4 accent-[#009B9B]"
                          />
                        </div>
                      </label>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-semibold text-[#201F1E]">Raggruppamenti</h3>
                  <div className="mt-2 space-y-2">
                    {(
                      [
                        { key: 'none', label: 'Per tipologia (predefinito)' },
                        ...(canUseAssigneeGrouping ? [{ key: 'assignee', label: 'Per assegnazione' }] : []),
                        { key: 'monthYear', label: 'Per mese/anno' },
                      ] as { key: TicketListGroupingMode; label: string }[]
                    ).map((item) => (
                      <label key={item.key} className="flex items-center justify-between gap-3 rounded-md border border-[#EDEBE9] px-3 py-2">
                        <span className="text-sm text-[#323130]">{item.label}</span>
                        <input
                          type="radio"
                          name="ticket-list-grouping"
                          checked={groupingMode === item.key}
                          onChange={() => setTicketListGroupingMode(item.key)}
                          className="h-4 w-4 accent-[#009B9B]"
                        />
                      </label>
                    ))}
                  </div>
                </section>

                {groupingMode === 'monthYear' && (
                  <section className="rounded-md border border-[#EDEBE9] px-3 py-2">
                    <label className="flex items-center justify-between gap-3">
                      <span className="text-sm text-[#323130]">Anno</span>
                      <select
                        value={groupingYear}
                        onChange={(event) => setTicketListGroupingYear(event.target.value)}
                        className="h-8 min-w-[110px] rounded-md border border-[#D2D0CE] bg-white px-2 text-sm text-[#323130] outline-none focus:border-[#009B9B]"
                      >
                        {availableYears.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </label>
                  </section>
                )}
              </div>
            ) : (
              <div className="mt-4 rounded-md border border-dashed border-[#EDEBE9] bg-[#FAF9F8] p-3 text-sm text-[#605E5C]">
                Queste impostazioni sono disponibili nella lista richieste aperte/storico.
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

function getAvailableYears(tickets: { createdAt: string }[]) {
  return Array.from(new Set(tickets.map((ticket) => new Date(ticket.createdAt).getFullYear().toString()))).sort((a, b) => Number(b) - Number(a))
}
