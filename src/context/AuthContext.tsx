import React, { createContext, useContext, useEffect, useState } from 'react'
import { fetchUsersCompleteTree } from '../services/api'
import { parseTemplatesFromBcRows, type RequestTemplate } from '../lib/user-templates'

export interface User {
  name?: string
  email?: string
  tenantId?: string
  oid?: string
  isAdmin?: boolean
  // campi MSAL legacy (potrebbero essere presenti a seconda della versione)
  username?: string
}

interface AuthContextType {
  user: User | null
  templates: RequestTemplate[]
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  templates: [],
  loading: true,
  error: null,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [templates, setTemplates] = useState<RequestTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/me')
      .then((res) => {
        if (!res.ok) throw new Error('Non autenticato')
        return res.json()
      })
      .then(async (data) => {
        if (data && data.user) {
          const currentUser: User = data.user
          // email può essere in .email o .username (compatibilità MSAL)
          const email = currentUser.email ?? currentUser.username ?? ''
          if (email) {
            try {
              const bcData = await fetchUsersCompleteTree(email)
              if (bcData?.value?.length > 0) {
                setTemplates(parseTemplatesFromBcRows(bcData.value))
              }
            } catch (e) {
              console.warn('Impossibile recuperare template BC per questo utente', e)
            }
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
    <AuthContext.Provider value={{ user, templates, loading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
