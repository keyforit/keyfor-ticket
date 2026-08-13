export async function fetchUsersCompleteTree(email: string) {
  try {
    // Chiamata all'API backend di Key Hub per proxyare la richiesta a BC
    const res = await fetch(/api/ticket/usersCompleteTree?email= + encodeURIComponent(email))
    if (!res.ok) {
      throw new Error('Errore nel recupero degli utenti')
    }
    return await res.json()
  } catch (error) {
    console.error('Error fetching users:', error)
    return null
  }
}
