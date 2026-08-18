import { useSyncExternalStore } from 'react'

export interface NotificationMessage {
  id: string
  author: 'Sistema' | 'Tu'
  text: string
  time: string
}

export interface AppNotification {
  id: string
  title: string
  preview: string
  time: string
  unread: boolean
  ticketId: string
  messages: NotificationMessage[]
}

let notificationsState: AppNotification[] = []

const listeners = new Set<() => void>()

function emitNotificationsChange() {
  listeners.forEach((listener) => listener())
}

function subscribeNotifications(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getNotificationsSnapshot() {
  return notificationsState
}

export function useNotifications() {
  const notifications = useSyncExternalStore(
    subscribeNotifications,
    getNotificationsSnapshot,
    getNotificationsSnapshot
  )

  const unreadCount = notifications.filter((notification) => notification.unread).length

  return { notifications, unreadCount }
}

export function markNotificationAsRead(notificationId: string) {
  let changed = false
  notificationsState = notificationsState.map((notification) => {
    if (notification.id !== notificationId || !notification.unread) return notification
    changed = true
    return { ...notification, unread: false }
  })
  if (changed) emitNotificationsChange()
}

export function appendNotificationReply(notificationId: string, text: string) {
  const trimmedText = text.trim()
  if (!trimmedText) return

  notificationsState = notificationsState.map((notification) => {
    if (notification.id !== notificationId) return notification

    const nextMessage: NotificationMessage = {
      id: `${notification.id}-R-${Date.now()}`,
      author: 'Tu',
      text: trimmedText,
      time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    }

    return {
      ...notification,
      unread: false,
      time: 'Adesso',
      messages: [...notification.messages, nextMessage],
    }
  })

  emitNotificationsChange()
}

export function setNotifications(notifications: AppNotification[]) {
  notificationsState = notifications
  emitNotificationsChange()
}
