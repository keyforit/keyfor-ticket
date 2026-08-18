import { useEffect, useState } from 'react'
import { ChevronUp, ChevronDown, Bug } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getBufferedEvents, clearBufferedEvents, type DebugEvent } from '@/lib/debug'

export function DebugPanel() {
  const [events, setEvents] = useState<DebugEvent[]>([])
  const [isMinimized, setIsMinimized] = useState(false)
  const { isDebugEnabled } = useAuth()

  // Load buffered events on mount / when debug gets enabled
  useEffect(() => {
    if (isDebugEnabled) {
      const buffered = getBufferedEvents()
      if (buffered.length > 0) {
        setEvents([...buffered].reverse())
      }
    }
  }, [isDebugEnabled])

  useEffect(() => {
    const handleDebugEvent = (e: CustomEvent<DebugEvent>) => {
      setEvents((prev) => [e.detail, ...prev])
      setIsMinimized(false)
    }

    window.addEventListener('kf_debug_event' as any, handleDebugEvent as any)
    return () => window.removeEventListener('kf_debug_event' as any, handleDebugEvent as any)
  }, [])

  if (!isDebugEnabled) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col shadow-[0_-4px_12px_rgba(0,0,0,0.15)]">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-[#1F1F1F] px-4 py-2 text-white">
        <h3 className="font-semibold text-xs flex items-center gap-2">
          <Bug className="h-3.5 w-3.5 text-[#009B9B]" />
          Debug API BC
          <span className="text-[#A19F9D] font-normal">({events.length} chiamate)</span>
        </h3>
        <div className="flex items-center gap-3">
          <button onClick={() => { setEvents([]); clearBufferedEvents() }} className="text-xs text-[#A19F9D] hover:text-white transition-colors">Pulisci</button>
          <button onClick={() => setIsMinimized(!isMinimized)} className="text-[#A19F9D] hover:text-white transition-colors">
            {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Console body */}
      {!isMinimized && (
        <div className="overflow-y-auto p-3 space-y-2 bg-[#1A1A2E] border-t border-[#333]" style={{ maxHeight: '35vh' }}>
          {events.length === 0 ? (
            <div className="flex items-center justify-center text-[#A19F9D] text-xs py-4">
              In ascolto... Naviga o salva per intercettare le chiamate API.
            </div>
          ) : (
            events.map(ev => (
              <div key={ev.id} className="font-mono text-xs border-b border-[#333] pb-2 last:border-b-0">
                <div className="flex items-center gap-2">
                  <span className="text-[#666] text-[10px]">{ev.timestamp.toLocaleTimeString()}</span>
                  {ev.type === 'request' && <span className="text-blue-400 font-bold">→ REQ</span>}
                  {ev.type === 'response' && <span className="text-green-400 font-bold">← RES</span>}
                  {ev.type === 'error' && <span className="text-red-400 font-bold">✗ ERR</span>}
                  <span className="text-yellow-300">{ev.method}</span>
                  <span className="text-white/90">{ev.url}</span>
                  {ev.status && <span className={`ml-auto ${ev.status >= 400 ? 'text-red-400' : 'text-green-400'}`}>[{ev.status}]</span>}
                </div>
                {ev.message && <div className="mt-1 text-red-400 pl-4">{ev.message}</div>}
                {ev.payload && (
                  <pre className="mt-1 pl-4 text-[10px] text-[#B0BEC5] overflow-x-auto whitespace-pre-wrap max-h-32 overflow-y-auto">
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
