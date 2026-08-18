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

// Global buffer so events emitted before the panel mounts are not lost
const eventBuffer: DebugEvent[] = []

export function getBufferedEvents(): DebugEvent[] {
  return eventBuffer
}

export function clearBufferedEvents(): void {
  eventBuffer.length = 0
}

export function emitDebugEvent(data: Omit<DebugEvent, 'id' | 'timestamp'>) {
  const isDebugEnabled = localStorage.getItem('kf_debug_enabled') === 'true'
  if (!isDebugEnabled) return

  const detail: DebugEvent = {
    ...data,
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date()
  }

  eventBuffer.push(detail)

  const event = new CustomEvent('kf_debug_event', { detail })
  window.dispatchEvent(event)
}
