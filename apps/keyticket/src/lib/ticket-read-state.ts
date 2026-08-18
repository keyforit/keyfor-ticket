const STORAGE_KEY = 'keyfor-ticket-read'

function getReadSet(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

export function isTicketRead(id: string): boolean {
  return getReadSet().has(id)
}

export function markTicketRead(id: string): void {
  const set = getReadSet()
  if (set.has(id)) return
  set.add(id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
}
