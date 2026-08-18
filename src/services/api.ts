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

export async function createTicketViaApi(ticketData: any, tenantId: string) {
  try {
    // Passiamo tramite il backend Azure (che aggiunge il token Managed Identity)
    const url = '/api/ticket/createOData'
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...ticketData,
        tenantId // Inviamo il tenantId al backend così può comporre l'URL BC OData
      }),
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
