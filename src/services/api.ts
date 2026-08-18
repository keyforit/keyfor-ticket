import { emitDebugEvent } from '@/lib/debug'

export async function fetchUsersCompleteTree(email: string) {
  try {
    emitDebugEvent({
      type: 'request',
      method: 'GET',
      url: '/api/ticket/usersCompleteTree',
      payload: { email }
    })
    
    const res = await fetch('/api/ticket/usersCompleteTree?email=' + encodeURIComponent(email))
    
    if (!res.ok) {
      const errText = await res.text()
      emitDebugEvent({
        type: 'error',
        method: 'GET',
        url: '/api/ticket/usersCompleteTree',
        status: res.status,
        message: errText
      })
      throw new Error('Errore nel recupero degli utenti')
    }
    
    const data = await res.json()
    emitDebugEvent({
      type: 'response',
      method: 'GET',
      url: '/api/ticket/usersCompleteTree',
      status: res.status,
      payload: data
    })
    return data
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return null
  }
}

export async function createTicketViaApi(ticketData: any) {
  try {
    emitDebugEvent({
      type: 'request',
      method: 'POST',
      url: '/api/ticket/create',
      payload: ticketData
    })
    
    const res = await fetch('/api/ticket/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ticketData),
    })
    
    if (!res.ok) {
      const errText = await res.text()
      emitDebugEvent({
        type: 'error',
        method: 'POST',
        url: '/api/ticket/create',
        status: res.status,
        message: errText
      })
      throw new Error(errText || 'Errore nella creazione del ticket')
    }
    
    const data = await res.json()
    emitDebugEvent({
      type: 'response',
      method: 'POST',
      url: '/api/ticket/create',
      status: res.status,
      payload: data
    })
    return data
  } catch (error) {
    console.error('Error creating ticket:', error)
    throw error
  }
}
