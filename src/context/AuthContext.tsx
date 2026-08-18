import React, { createContext, useContext, useEffect, useState } from 'react'
import { fetchUsersCompleteTree } from '../services/api'
import { parseTemplatesFromBcRows, type RequestTemplate } from '../lib/user-templates'
import { emitDebugEvent } from '../lib/debug'

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
  isDebugEnabled: boolean
  toggleDebug: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  templates: [],
  loading: true,
  error: null,
  isDebugEnabled: false,
  toggleDebug: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [templates, setTemplates] = useState<RequestTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDebugEnabled, setIsDebugEnabled] = useState(() => {
    return localStorage.getItem('kf_debug_enabled') === 'true'
  })

  const toggleDebug = () => {
    setIsDebugEnabled((prev) => {
      const next = !prev
      localStorage.setItem('kf_debug_enabled', String(next))
      return next
    })
  }

  useEffect(() => {
    emitDebugEvent({ type: 'request', method: 'GET', url: '/api/me' })
    fetch('/api/me')
      .then((res) => {
        if (!res.ok) {
          emitDebugEvent({ type: 'error', method: 'GET', url: '/api/me', status: res.status, message: 'Non autenticato' })
          throw new Error('Non autenticato')
        }
        return res.json()
      })
      .then(async (data) => {
        emitDebugEvent({ type: 'response', method: 'GET', url: '/api/me', status: 200, payload: data })
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
    <AuthContext.Provider value={{ user, templates, loading, error, isDebugEnabled, toggleDebug }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
