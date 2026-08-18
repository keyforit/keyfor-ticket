import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, Bug } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import type { DebugEvent } from '@/lib/debug'

export function DebugPanel() {
  const [events, setEvents] = useState<DebugEvent[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const { isDebugEnabled, toggleDebug } = useAuth()

  useEffect(() => {
    const handleDebugEvent = (e: CustomEvent<DebugEvent>) => {
      setEvents((prev) => [e.detail, ...prev])
      if (isDebugEnabled) setIsOpen(true)
    }

    window.addEventListener('kf_debug_event' as any, handleDebugEvent as any)
    return () => window.removeEventListener('kf_debug_event' as any, handleDebugEvent as any)
  }, [isDebugEnabled])

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* Floating button — always visible */}
      {!isOpen && (
        <button 
          onClick={() => {
            if (!isDebugEnabled) {
              toggleDebug()
            }
            setIsOpen(true)
          }}
          className={`flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium shadow-lg transition-colors ${
            isDebugEnabled 
              ? 'bg-[#1F1F1F] text-white hover:bg-black' 
              : 'bg-white text-[#605E5C] border border-[#EDEBE9] hover:bg-[#F3F2F1]'
          }`}
        >
          <Bug className={`h-4 w-4 ${isDebugEnabled ? 'text-[#009B9B]' : 'text-[#A19F9D]'}`} />
          {isDebugEnabled ? `Debug API (${events.length})` : 'Debug'}
        </button>
      )}

      {/* Panel when open */}
      {isOpen && (
        <div className="w-full sm:w-[450px] rounded-lg shadow-2xl bg-white border border-[#EDEBE9] overflow-hidden flex flex-col" style={{ maxHeight: '60vh', minHeight: '300px' }}>
          <div className="flex items-center justify-between bg-[#1F1F1F] px-4 py-3 text-white">
            <h3 className="font-semibold text-sm flex items-center gap-2"><Bug className="h-4 w-4 text-[#009B9B]" /> Debug API BC</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleDebug}
                className={`text-xs px-2 py-0.5 rounded transition-colors ${
                  isDebugEnabled ? 'bg-[#009B9B] text-white' : 'bg-[#605E5C] text-white'
                }`}
              >
                {isDebugEnabled ? 'ON' : 'OFF'}
              </button>
              <button onClick={() => setEvents([])} className="text-xs text-[#A19F9D] hover:text-white transition-colors">Pulisci</button>
              <button onClick={() => setIsOpen(false)} className="text-[#A19F9D] hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#F3F2F1]">
            {!isDebugEnabled ? (
              <div className="h-full flex flex-col items-center justify-center text-[#605E5C] text-sm py-8">
                <p>Debug disattivato.</p>
                <p className="text-xs text-[#A19F9D] mt-1">Premi ON per iniziare a intercettare le chiamate API.</p>
              </div>
            ) : events.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#605E5C] text-sm py-8">
                <p>Nessuna chiamata intercettata.</p>
                <p className="text-xs text-[#A19F9D] mt-1">Effettua un salvataggio o naviga per vedere i log.</p>
              </div>
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
                  {ev.message && <div className="mb-2 text-red-600 font-medium break-all">{ev.message}</div>}
                  
                  {ev.payload && (
                    <pre className="mt-2 bg-[#F8F9FA] p-2 rounded overflow-x-auto text-[10px] text-[#323130] border border-[#EDEBE9] whitespace-pre-wrap">
                      {JSON.stringify(ev.payload, null, 2)}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
