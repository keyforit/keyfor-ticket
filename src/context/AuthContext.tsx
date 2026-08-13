import React, { createContext, useContext, useEffect, useState } from 'react'
import { fetchUsersCompleteTree } from '../services/api'

export interface User {
  homeAccountId: string;
  environment: string;
  tenantId: string;
  username: string;
  localAccountId: string;
  name?: string;
  bcDetails?: any; // Dati recuperati da BC
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Chiamata all'API Node.js del Key Hub per prendere la sessione MSAL
    fetch('/api/me')
      .then((res) => {
        if (!res.ok) throw new Error('Non autenticato')
        return res.json()
      })
      .then(async (data) => {
        if (data && data.user) {
          const currentUser = data.user
          // Una volta recuperata l'identita', interroghiamo BC per questo utente
          try {
            const bcData = await fetchUsersCompleteTree(currentUser.username)
            if (bcData && bcData.value && bcData.value.length > 0) {
              currentUser.bcDetails = bcData.value[0]
            }
          } catch (e) {
            console.warn('Impossibile recuperare dettagli BC per questo utente', e)
          }
          setUser(currentUser)
        } else {
          throw new Error('Nessun utente nella sessione')
        }
      })
      .catch((err) => {
        console.error('Errore Auth SSO:', err)
        setError(err.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
