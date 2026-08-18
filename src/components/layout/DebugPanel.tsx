import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle } from 'lucide-react'

interface DebugEvent {
  id: string
  timestamp: Date
  type: 'request' | 'response' | 'error'
  method?: string
  url?: string
  payload?: any
  status?: number
  message?: string
}

export function DebugPanel() {
  const [events, setEvents] = useState<DebugEvent[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleDebugEvent = (e: CustomEvent<DebugEvent>) => {
      setEvents((prev) => [e.detail, ...prev])
      setIsOpen(true) // Auto open when an event arrives
    }

    window.addEventListener('kf_debug_event' as any, handleDebugEvent as any)
    return () => window.removeEventListener('kf_debug_event' as any, handleDebugEvent as any)
  }, [])

  if (!isOpen && events.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-md rounded-lg shadow-2xl bg-white border border-[#EDEBE9] overflow-hidden flex flex-col" style={{ maxHeight: '60vh' }}>
      <div className="flex items-center justify-between bg-[#1F1F1F] px-4 py-2 text-white">
        <h3 className="font-semibold text-sm">Debug API BC</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => setEvents([])} className="text-xs hover:text-white/80">Clear</button>
          <button onClick={() => setIsOpen(!isOpen)} className="hover:text-white/80">
            {isOpen ? <X className="h-4 w-4" /> : <span className="text-xs font-bold">{events.length}</span>}
          </button>
        </div>
      </div>
      
      {isOpen && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F3F2F1]">
          {events.length === 0 ? (
            <p className="text-sm text-[#605E5C] text-center">Nessuna chiamata registrata</p>
          ) : (
            events.map(ev => (
              <div key={ev.id} className="bg-white rounded border border-[#EDEBE9] p-3 text-xs shadow-sm">
                <div className="flex items-center justify-between border-b border-[#EDEBE9] pb-2 mb-2">
                  <div className="flex items-center gap-2 font-semibold">
                    {ev.type === 'request' && <span className="text-blue-600">REQ</span>}
                    {ev.type === 'response' && <span className="text-green-600"><CheckCircle className="h-3 w-3 inline mr-1" />RES</span>}
                    {ev.type === 'error' && <span className="text-red-600"><AlertCircle className="h-3 w-3 inline mr-1" />ERR</span>}
                    <span>{ev.method} {ev.url?.replace('/api/ticket/', '')}</span>
                  </div>
                  <span className="text-[#A19F9D]">{ev.timestamp.toLocaleTimeString()}</span>
                </div>
                
                {ev.status && <div className="mb-1 font-medium">Status: {ev.status}</div>}
                {ev.message && <div className="mb-1 text-red-600 font-medium">{ev.message}</div>}
                
                {ev.payload && (
                  <pre className="mt-2 bg-[#F8F9FA] p-2 rounded overflow-x-auto text-[10px] text-[#323130] border border-[#EDEBE9]">
                    {JSON.stringify(ev.payload, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export function emitDebugEvent(data: Omit<DebugEvent, 'id' | 'timestamp'>) {
  const isDebugEnabled = localStorage.getItem('kf_debug_enabled') === 'true'
  if (!isDebugEnabled) return

  const event = new CustomEvent('kf_debug_event', {
    detail: {
      ...data,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date()
    }
  })
  window.dispatchEvent(event)
}