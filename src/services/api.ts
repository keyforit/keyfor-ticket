export async function fetchUsersCompleteTree(email: string) {
  try {
    const res = await fetch('/api/ticket/usersCompleteTree?email=' + encodeURIComponent(email))
    
    if (!res.ok) {
      throw new Error('Errore nel recupero degli utenti')
    }
    
    return await res.json()
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return null
  }
}

export async function createTicketViaApi(ticketData: any) {
  try {
    const res = await fetch('/api/ticket/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ticketData),
    })
    
    if (!res.ok) {
      const errText = await res.text()
      throw new Error(errText || 'Errore nella creazione del ticket')
    }
    
    return await res.json()
  } catch (error) {
    console.error('Error creating ticket:', error)
    throw error
  }
}
