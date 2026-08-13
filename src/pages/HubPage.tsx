import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, ChevronRight, Plus, Settings } from 'lucide-react'
import { UserProfileMenu } from '@/components/layout/UserProfileMenu'
import { listBookmarkedKeys } from '@/lib/bookmarks'
import { useNotifications } from '@/lib/notifications'
import { getRequestTypeColor } from '@/lib/request-type'

const HUB_CHOICES = [
  {
    id: 'new',
    iconSrc: `${import.meta.env.BASE_URL}hub-create.svg`,
    label: 'Crea nuova richiesta',
    to: '/request-type',
  },
  {
    id: 'manage',
    iconSrc: `${import.meta.env.BASE_URL}hub-view.svg`,
    label: 'Visualizza richieste aperte',
    to: '/tickets?status=open',
  },
  {
    id: 'history',
    iconSrc: `${import.meta.env.BASE_URL}hub-archive.svg`,
    label: 'Storico richieste',
    to: '/tickets?status=closed',
  },
] as const

type HubChoiceId = (typeof HUB_CHOICES)[number]['id']
type HubStyle = 'classic' | 'business' | 'spotlight'

const HUB_STYLE_STORAGE_KEY = 'keyfor-hub-style-v2'
const DEFAULT_HUB_STYLE: HubStyle = 'classic'

const HUB_COLORS: Record<HubStyle, Record<HubChoiceId, string>> = {
  classic: {
    new: '#00828E',
    manage: '#FFB900',
    history: '#D8453C',
  },
  business: {
    new: '#009B9B',
    manage: '#0078D4',
    history: '#5C2D91',
  },
  spotlight: {
    new: '#2F80ED',
    manage: '#F2994A',
    history: '#6B7280',
  },
}

const REQUEST_TYPE_TO_ID: Record<string, string> = {
  'Sposta Data': 'sposta-data',
  'Non Conformità': 'non-conformita',
  Sollecito: 'sollecito',
  'Giacenza Articolo': 'giacenza-articolo',
  'Reso Merce': 'reso-merce',
  'Variazione Prezzo': 'variazione-prezzo',
  'Blocco Ordine': 'blocco-ordine',
  'Sblocco Ordine': 'sblocco-ordine',
  'Verifica Pagamento': 'verifica-pagamento',
  'Aggiornamento Anagrafica': 'aggiornamento-anagrafica',
  'Richiesta Fattura': 'richiesta-fattura',
  'Reclamo Trasporto': 'reclamo-trasporto',
  'Priorità Consegna': 'priorita-consegna',
  'Richiesta Documenti': 'richiesta-documenti',
  'Cambio Vettore': 'cambio-vettore',
}

const REQUEST_TYPE_ID_TO_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(REQUEST_TYPE_TO_ID).map(([label, id]) => [id, label])
)
const MONTH_LABELS: Record<string, string> = {
  '1': 'Gennaio',
  '2': 'Febbraio',
  '3': 'Marzo',
  '4': 'Aprile',
  '5': 'Maggio',
  '6': 'Giugno',
  '7': 'Luglio',
  '8': 'Agosto',
  '9': 'Settembre',
  '10': 'Ottobre',
  '11': 'Novembre',
  '12': 'Dicembre',
}

type FavoriteLink = { label: string; to: string }

function readHubStyleFromStorage(): HubStyle {
  if (typeof window === 'undefined') return DEFAULT_HUB_STYLE
  const rawValue = window.localStorage.getItem(HUB_STYLE_STORAGE_KEY)
  return rawValue === 'classic' || rawValue === 'business' || rawValue === 'spotlight' ? rawValue : DEFAULT_HUB_STYLE
}

function persistHubStyle(value: HubStyle) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(HUB_STYLE_STORAGE_KEY, value)
}

export function HubPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { unreadCount } = useNotifications()
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false)
  const [hubStyle, setHubStyle] = useState<HubStyle>(() => readHubStyleFromStorage())
  const currentPath = `${location.pathname}${location.search}`
  const loginMessageFromState = ((location.state as { loginMessage?: string } | null)?.loginMessage ?? '').trim()
  const alreadyShown = sessionStorage.getItem('keyfor-login-msg-shown') === '1'
  const effectiveLoginMessage = loginMessageFromState && !alreadyShown ? loginMessageFromState : ''
  const [postLoginMessage, setPostLoginMessage] = useState(effectiveLoginMessage)
  const [isPostLoginMessageOpen, setIsPostLoginMessageOpen] = useState(Boolean(effectiveLoginMessage))

  useEffect(() => {
    if (!loginMessageFromState || alreadyShown) return
    sessionStorage.setItem('keyfor-login-msg-shown', '1')
    setPostLoginMessage(loginMessageFromState)
    setIsPostLoginMessageOpen(true)
  }, [loginMessageFromState, alreadyShown])

  const handleLogout = () => {
    sessionStorage.removeItem('keyfor-login-msg-shown')
    navigate('/login')
  }

  const styledChoices = useMemo(
    () =>
      HUB_CHOICES.map((choice) => ({
        ...choice,
        color: HUB_COLORS[hubStyle][choice.id],
      })),
    [hubStyle]
  )

  const favoriteLinksByChoice = useMemo<Record<HubChoiceId, FavoriteLink[]>>(() => {
    const links: Record<HubChoiceId, FavoriteLink[]> = { new: [], manage: [], history: [] }
    const bookmarkedKeys = listBookmarkedKeys()

    bookmarkedKeys.forEach((key) => {
      if (key.startsWith('create:')) {
        const [, requestTypeId = ''] = key.split(':')
        if (!requestTypeId) return
        const label = REQUEST_TYPE_ID_TO_LABEL[requestTypeId] ?? requestTypeId
        links.new.push({
          label,
          to: `/richieste/${requestTypeId}`,
        })
        return
      }

      if (key.startsWith('tickets-tab:')) {
        const [, rawStatus = 'open', mode = 'none', rawValue = 'all', rawYear = ''] = key.split(':')
        const status = rawStatus === 'closed' ? 'closed' : 'open'
        let label = 'Tutte'
        let to = `/tickets?status=${status}`

        if (mode === 'none' && rawValue !== 'all') {
          label = REQUEST_TYPE_ID_TO_LABEL[rawValue] ?? rawValue
          to = `${to}&type=${rawValue}`
        } else if (mode === 'assignee') {
          label = rawValue === 'all' ? 'Tutte assegnazioni' : rawValue
          to = `${to}&grouping=assignee&tab=${encodeURIComponent(rawValue)}`
        } else if (mode === 'requestType') {
          label = rawValue === 'all' ? 'Tutte tipologie' : rawValue
          to = `${to}&grouping=requestType&tab=${encodeURIComponent(rawValue)}`
        } else if (mode === 'monthYear') {
          if (rawValue === 'all') {
            label = rawYear ? `Tutti i mesi ${rawYear}` : 'Tutti i mesi'
            to = `${to}&grouping=monthYear&tab=all${rawYear ? `&year=${encodeURIComponent(rawYear)}` : ''}`
          } else {
            const monthLabel = MONTH_LABELS[rawValue] ?? `Mese ${rawValue}`
            label = rawYear ? `${monthLabel} ${rawYear}` : monthLabel
            to = `${to}&grouping=monthYear&tab=${encodeURIComponent(rawValue)}${rawYear ? `&year=${encodeURIComponent(rawYear)}` : ''}`
          }
        }

        if (status === 'closed') {
          links.history.push({ label, to })
        } else {
          links.manage.push({ label, to })
        }
      }
    })

    const dedupe = (items: FavoriteLink[]) =>
      Array.from(new Map(items.map((item) => [item.label, item])).values())

    return {
      new: dedupe(links.new),
      manage: dedupe(links.manage),
      history: dedupe(links.history),
    }
  }, [])

  const handleStyleChange = (style: HubStyle) => {
    setHubStyle(style)
    persistHubStyle(style)
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#F8F9FA] md:h-auto md:min-h-screen md:overflow-visible">
      <header className="bg-[#1F1F1F] pl-3 pr-6 py-0 h-14 flex items-center gap-1">
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
            onClick={() => setIsCustomizationOpen(true)}
            className="relative flex h-8 w-8 items-center justify-center rounded-md text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Impostazioni Hub"
            title="Impostazioni Hub"
          >
            <Settings className="h-4 w-4" />
          </button>
          <UserProfileMenu accentColor="#009B9B" onLogout={handleLogout} />
        </div>
      </header>

      {hubStyle === 'classic' ? (
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
          {styledChoices.map(({ id, iconSrc, label, color, to }) => (
            <button
              key={id}
              type="button"
              onClick={() => navigate(to)}
              className="flex-1 w-full transition-all duration-200 hover:brightness-95"
              style={{ backgroundColor: color }}
            >
              <div className="h-full w-full px-4 py-6">
                <div className="flex h-full w-full flex-col items-center justify-center gap-3">
                  <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center">
                    <img src={iconSrc} alt="" className="h-10 w-10" />
                  </div>
                  <p className="text-center text-base sm:text-lg font-bold text-white">{label}</p>
                  {favoriteLinksByChoice[id].length > 0 && (
                    <div className="mt-1 grid w-full grid-cols-2 gap-2 md:flex md:max-w-full md:flex-wrap md:items-center md:justify-center md:gap-x-3 md:gap-y-1">
                      {favoriteLinksByChoice[id].map((favorite, index) => (
                        <button
                          key={`${id}-${favorite.label}`}
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            navigate(favorite.to)
                          }}
                          className={`${index >= (favoriteLinksByChoice[id].length > 4 ? 3 : 4) ? 'hidden md:inline-flex' : 'inline-flex'} w-full items-center justify-center gap-1.5 truncate rounded-full bg-white/55 px-2.5 py-1 text-sm leading-none text-[#201F1E] hover:bg-white/65 md:w-auto md:max-w-full`}
                        >
                          {id === 'new' ? (
                            <Plus className="h-3 w-3 shrink-0" style={{ color: getRequestTypeColor(favorite.label, color) }} />
                          ) : (
                            <ChevronRight className="h-4 w-4 shrink-0" style={{ color: getRequestTypeColor(favorite.label, color) }} />
                          )}
                          <span className="truncate">{favorite.label}</span>
                        </button>
                      ))}
                      {favoriteLinksByChoice[id].length > 4 && (
                        <span className="inline-flex w-full items-center justify-center rounded-full bg-white/55 px-2.5 py-1 text-sm leading-none text-[#201F1E] md:hidden">...</span>
                      )}
                    </div>
                  )}
                  <div className="h-1" />
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : hubStyle === 'business' ? (
        <div className="flex min-h-0 w-full flex-1 overflow-hidden px-4 py-4 sm:px-6 sm:py-6 md:flex-none md:overflow-visible">
          <div className="grid h-full min-h-0 w-full grid-rows-[repeat(3,minmax(0,1fr))] gap-4 md:h-auto md:min-h-0 md:grid-cols-3 md:grid-rows-1">
            {styledChoices.map(({ id, iconSrc, label, color, to }) => (
              <button
                key={id}
                type="button"
                onClick={() => navigate(to)}
                className="h-full min-h-0 rounded-2xl border p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md md:h-[320px]"
                style={{
                  background: `linear-gradient(160deg, ${color}3D 0%, ${color}1F 100%)`,
                  borderColor: `${color}80`,
                }}
              >
                <div className="flex h-full flex-col items-center justify-between text-center">
                  <div className="mt-2 flex flex-col items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm">
                      <img src={iconSrc} alt="" className="h-7 w-7" />
                    </div>
                    <p className="text-lg font-semibold text-[#201F1E]">{label}</p>
                  </div>
                  {favoriteLinksByChoice[id].length > 0 && (
                    <div className="mt-6 grid w-full grid-cols-2 gap-2 pb-1 text-left md:flex md:flex-wrap md:justify-center md:gap-x-3 md:gap-y-2">
                      {favoriteLinksByChoice[id].map((favorite, index) => (
                        <button
                          key={`${id}-${favorite.label}`}
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            navigate(favorite.to)
                          }}
                          className={`${index >= (favoriteLinksByChoice[id].length > 4 ? 3 : 4) ? 'hidden md:inline-flex' : 'inline-flex'} w-full items-center justify-center gap-1.5 truncate rounded-full bg-white/55 px-2.5 py-1 text-sm leading-none text-[#201F1E] hover:bg-white/65 md:w-auto md:max-w-full`}
                        >
                          {id === 'new' ? (
                            <Plus className="h-3 w-3 shrink-0" style={{ color: getRequestTypeColor(favorite.label, color) }} />
                          ) : (
                            <ChevronRight className="h-4 w-4 shrink-0" style={{ color: getRequestTypeColor(favorite.label, color) }} />
                          )}
                          <span className="truncate">{favorite.label}</span>
                        </button>
                      ))}
                      {favoriteLinksByChoice[id].length > 4 && (
                        <span className="inline-flex w-full items-center justify-center rounded-full bg-white/55 px-2.5 py-1 text-sm leading-none text-[#201F1E] md:hidden">...</span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 w-full flex-1 overflow-hidden bg-[#F8F9FA] px-4 py-4 sm:px-6 sm:py-6 md:flex-none md:overflow-visible">
          <div className="grid h-full min-h-[calc(100dvh-4.5rem)] w-full gap-4 md:h-auto md:min-h-0 md:grid-cols-3 md:grid-rows-1">
            {styledChoices.map(({ id, iconSrc, label, color, to }) => (
              <button
                key={id}
                type="button"
                onClick={() => navigate(to)}
                className="group relative h-full min-h-0 overflow-hidden rounded-2xl border border-[#D2D0CE] bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md md:h-[320px]"
                style={{ backgroundColor: `${color}18` }}
              >
                <div className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: color }} />
                <div className="absolute right-0 top-0 h-24 w-24 rounded-full blur-2xl" style={{ backgroundColor: `${color}44` }} />
                <div className="relative flex h-full min-h-[190px] flex-col justify-between p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`font-semibold text-[#201F1E] ${id === 'new' ? 'text-2xl' : 'text-xl'}`}>{label}</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E1DFDD] bg-white">
                      <img src={iconSrc} alt="" className="h-6 w-6" />
                    </div>
                  </div>

                  {favoriteLinksByChoice[id].length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2 md:flex md:flex-wrap md:gap-x-4 md:gap-y-1">
                      {favoriteLinksByChoice[id].map((favorite, index) => (
                        <button
                          key={`${id}-${favorite.label}`}
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            navigate(favorite.to)
                          }}
                          className={`${index >= (favoriteLinksByChoice[id].length > 4 ? 3 : 4) ? 'hidden md:inline-flex' : 'inline-flex'} w-full items-center justify-center gap-1.5 truncate rounded-full px-2.5 py-1 text-xs font-medium leading-none hover:brightness-95 md:w-auto md:max-w-full`}
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.55)',
                            color: '#201F1E',
                          }}
                        >
                          {id === 'new' ? (
                            <Plus className="h-3 w-3 shrink-0" style={{ color: getRequestTypeColor(favorite.label, color) }} />
                          ) : (
                            <ChevronRight className="h-4 w-4 shrink-0" style={{ color: getRequestTypeColor(favorite.label, color) }} />
                          )}
                          <span className="truncate">{favorite.label}</span>
                        </button>
                      ))}
                      {favoriteLinksByChoice[id].length > 4 && (
                        <span className="inline-flex w-full items-center justify-center rounded-full bg-white/55 px-2.5 py-1 text-xs font-medium leading-none text-[#201F1E] md:hidden">...</span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isCustomizationOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4"
          onClick={() => setIsCustomizationOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-[#EDEBE9] bg-white p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-[#201F1E]">Impostazioni Hub</h2>
            <p className="mt-1 text-sm text-[#605E5C]">Scegli lo stile grafico della pagina Hub.</p>

            <div className="mt-4 space-y-2">
              {(
                [
                  { key: 'classic', label: 'Tema 1 (Predefinito)' },
                  { key: 'business', label: 'Tema 2' },
                  { key: 'spotlight', label: 'Tema 3' },
                ] as { key: HubStyle; label: string }[]
              ).map((item) => (
                <label key={item.key} className="flex items-center justify-between gap-3 rounded-md border border-[#EDEBE9] px-3 py-2">
                  <span className="text-sm text-[#323130]">{item.label}</span>
                  <input
                    type="radio"
                    name="hub-style"
                    checked={hubStyle === item.key}
                    onChange={() => handleStyleChange(item.key)}
                    className="h-4 w-4 accent-[#009B9B]"
                  />
                </label>
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setIsCustomizationOpen(false)}
                className="rounded-md bg-[#009B9B] px-4 py-2 text-sm font-medium text-white hover:bg-[#007575]"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {isPostLoginMessageOpen && postLoginMessage && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/30 p-4" onClick={() => setIsPostLoginMessageOpen(false)}>
          <div
            className="w-full max-w-md rounded-lg border border-[#EDEBE9] bg-white p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-[#323130]">Messaggio</h2>
            <p className="mt-2 text-sm leading-6 text-[#605E5C]">{postLoginMessage}</p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPostLoginMessageOpen(false)}
                className="rounded-md bg-[#009B9B] px-4 py-2 text-sm font-medium text-white hover:bg-[#007575]"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
