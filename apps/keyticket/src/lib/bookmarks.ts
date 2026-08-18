const BOOKMARKS_STORAGE_KEY = 'keyfor-ticket-bookmarks'

type BookmarkMap = Record<string, boolean>

function readBookmarks(): BookmarkMap {
  if (typeof window === 'undefined') return {}
  const rawValue = window.localStorage.getItem(BOOKMARKS_STORAGE_KEY)
  if (!rawValue) return {}
  try {
    const parsed = JSON.parse(rawValue) as BookmarkMap
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeBookmarks(nextBookmarks: BookmarkMap) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(nextBookmarks))
}

export function getBookmarked(bookmarkKey: string) {
  return Boolean(readBookmarks()[bookmarkKey])
}

export function setBookmarked(bookmarkKey: string, bookmarked: boolean) {
  const bookmarks = readBookmarks()
  if (bookmarked) {
    bookmarks[bookmarkKey] = true
  } else {
    delete bookmarks[bookmarkKey]
  }
  writeBookmarks(bookmarks)
}

export function listBookmarkedKeys() {
  return Object.keys(readBookmarks())
}
