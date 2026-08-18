export interface DebugEvent {
  id: string
  timestamp: Date
  type: 'request' | 'response' | 'error'
  method?: string
  url?: string
  payload?: any
  status?: number
  message?: string
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
