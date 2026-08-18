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

/**
 * Monkey-patch global fetch to automatically intercept all API calls
 * when debug mode is enabled. Call once at app startup.
 */
export function installFetchInterceptor() {
  const originalFetch = window.fetch

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
    const isDebugEnabled = localStorage.getItem('kf_debug_enabled') === 'true'
    if (!isDebugEnabled) {
      return originalFetch(input, init)
    }

    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url
    const method = init?.method?.toUpperCase() || 'GET'

    let requestPayload: any = undefined
    if (init?.body) {
      try {
        requestPayload = JSON.parse(init.body as string)
      } catch {
        requestPayload = init.body
      }
    }

    emitDebugEvent({
      type: 'request',
      method,
      url,
      payload: requestPayload
    })

    try {
      const response = await originalFetch(input, init)
      // Clone to read body without consuming
      const clone = response.clone()
      let responsePayload: any = undefined
      try {
        responsePayload = await clone.json()
      } catch {
        // response is not JSON, skip payload
      }

      if (response.ok) {
        emitDebugEvent({
          type: 'response',
          method,
          url,
          status: response.status,
          payload: responsePayload
        })
      } else {
        emitDebugEvent({
          type: 'error',
          method,
          url,
          status: response.status,
          message: responsePayload?.message || responsePayload?.error || `HTTP ${response.status}`
        })
      }

      return response
    } catch (err: any) {
      emitDebugEvent({
        type: 'error',
        method,
        url,
        message: err.message || 'Network error'
      })
      throw err
    }
  }
}
