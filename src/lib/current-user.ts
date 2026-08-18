import { useSyncExternalStore } from 'react'

export interface CurrentUser {
  name: string | null
  email: string | null
  tenantId: string | null
  oid: string | null
  isAdmin: boolean
}

type UserState =
  | { status: 'loading' }
  | { status: 'authenticated'; user: CurrentUser }
  | { status: 'unauthenticated' }

let state: UserState = { status: 'loading' }
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): UserState {
  return state
}

export function useCurrentUserState() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function useCurrentUser(): CurrentUser | null {
  const s = useCurrentUserState()
  return s.status === 'authenticated' ? s.user : null
}

export function getUserInitials(user: CurrentUser | null): string {
  if (!user) return '?'
  const name = user.name || user.email || ''
  return name
    .split(/[\s@.]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
    || '?'
}

/**
 * Chiama /api/me su KeyHub (stessa origin quando deployato come virtual directory).
 * In sviluppo locale KeyTicket gira su porta diversa — fallback a unauthenticated.
 */
export async function fetchCurrentUser(): Promise<void> {
  try {
    const res = await fetch('/api/me', { credentials: 'include' })
    if (!res.ok) {
      state = { status: 'unauthenticated' }
      emit()
      return
    }
    const data = await res.json()
    if (data?.user?.email) {
      state = { status: 'authenticated', user: data.user as CurrentUser }
    } else {
      state = { status: 'unauthenticated' }
    }
  } catch {
    state = { status: 'unauthenticated' }
  }
  emit()
}

export function clearCurrentUser(): void {
  state = { status: 'unauthenticated' }
  emit()
}
