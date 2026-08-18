import { useSyncExternalStore } from 'react'

export type TicketListColumnKey = 'requestType' | 'title' | 'assignee' | 'customerName' | 'createdAt' | 'updatedAt' | 'status' | 'solleciti'
export type TicketListGroupingMode = 'none' | 'assignee' | 'requestType' | 'monthYear'

export const TICKET_LIST_COLUMN_ORDER: TicketListColumnKey[] = [
  'requestType',
  'title',
  'assignee',
  'customerName',
  'createdAt',
  'updatedAt',
  'solleciti',
  'status',
]

export const TICKET_LIST_COLUMN_LABELS: Record<TicketListColumnKey, string> = {
  requestType: 'Tipo richiesta',
  title: 'Titolo',
  assignee: 'Presa in carico',
  customerName: 'Cliente',
  createdAt: 'Data creazione',
  updatedAt: 'Ult. aggiornamento',
  solleciti: 'Sollecito',
  status: 'Stato',
}

type TicketListColumnVisibility = Record<TicketListColumnKey, boolean>
interface TicketListCustomizationState {
  columns: TicketListColumnVisibility
  groupingMode: TicketListGroupingMode
  groupingYear: string
  columnOrder: TicketListColumnKey[]
}

const STORAGE_KEY = 'keyfor-ticket-customization'

const DEFAULT_TICKET_LIST_COLUMNS: TicketListColumnVisibility = {
  requestType: true,
  title: true,
  assignee: true,
  customerName: true,
  createdAt: true,
  updatedAt: true,
  solleciti: true,
  status: true,
}

function hasAtLeastOneColumnVisible(value: TicketListColumnVisibility) {
  return TICKET_LIST_COLUMN_ORDER.some((key) => value[key])
}

function getDefaultCustomizationState(): TicketListCustomizationState {
  return {
    columns: { ...DEFAULT_TICKET_LIST_COLUMNS },
    groupingMode: 'none',
    groupingYear: '',
    columnOrder: [...TICKET_LIST_COLUMN_ORDER],
  }
}

function readTicketListCustomizationFromStorage(): TicketListCustomizationState {
  if (typeof window === 'undefined') return getDefaultCustomizationState()

  const rawValue = window.localStorage.getItem(STORAGE_KEY)
  if (!rawValue) return getDefaultCustomizationState()

  try {
    const parsed = JSON.parse(rawValue) as {
      columns?: Partial<TicketListColumnVisibility>
      groupingMode?: TicketListGroupingMode
      groupingYear?: string
      columnOrder?: TicketListColumnKey[]
    }
    const parsedColumns = parsed.columns ?? {}
    const nextValue: TicketListColumnVisibility = {
      requestType: parsedColumns.requestType ?? DEFAULT_TICKET_LIST_COLUMNS.requestType,
      title: parsedColumns.title ?? DEFAULT_TICKET_LIST_COLUMNS.title,
      assignee: parsedColumns.assignee ?? DEFAULT_TICKET_LIST_COLUMNS.assignee,
      customerName: parsedColumns.customerName ?? DEFAULT_TICKET_LIST_COLUMNS.customerName,
      createdAt: parsedColumns.createdAt ?? DEFAULT_TICKET_LIST_COLUMNS.createdAt,
      updatedAt: parsedColumns.updatedAt ?? DEFAULT_TICKET_LIST_COLUMNS.updatedAt,
      solleciti: parsedColumns.solleciti ?? DEFAULT_TICKET_LIST_COLUMNS.solleciti,
      status: parsedColumns.status ?? DEFAULT_TICKET_LIST_COLUMNS.status,
    }
    const nextGroupingMode: TicketListGroupingMode =
      parsed.groupingMode === 'assignee' ||
      parsed.groupingMode === 'requestType' ||
      parsed.groupingMode === 'monthYear'
        ? parsed.groupingMode
        : 'none'
    const validKeys = new Set<string>(TICKET_LIST_COLUMN_ORDER)
    const parsedOrder = Array.isArray(parsed.columnOrder)
      ? (parsed.columnOrder.filter((k) => validKeys.has(k)) as TicketListColumnKey[])
      : []
    const missingKeys = TICKET_LIST_COLUMN_ORDER.filter((k) => !parsedOrder.includes(k))
    const columnOrder = parsedOrder.length > 0 ? [...parsedOrder, ...missingKeys] : [...TICKET_LIST_COLUMN_ORDER]
    return {
      columns: hasAtLeastOneColumnVisible(nextValue) ? nextValue : { ...DEFAULT_TICKET_LIST_COLUMNS },
      groupingMode: nextGroupingMode,
      groupingYear: typeof parsed.groupingYear === 'string' ? parsed.groupingYear : '',
      columnOrder,
    }
  } catch {
    return getDefaultCustomizationState()
  }
}

function persistTicketListCustomization(value: TicketListCustomizationState) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}

let ticketListCustomizationState: TicketListCustomizationState = readTicketListCustomizationFromStorage()

const listeners = new Set<() => void>()

function emitTicketListColumnsChange() {
  listeners.forEach((listener) => listener())
}

function subscribeTicketListColumns(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getTicketListColumnsSnapshot() {
  return ticketListCustomizationState
}

export function useTicketListCustomization() {
  const customization = useSyncExternalStore(
    subscribeTicketListColumns,
    getTicketListColumnsSnapshot,
    getTicketListColumnsSnapshot
  )

  return {
    visibleColumns: customization.columns,
    groupingMode: customization.groupingMode,
    groupingYear: customization.groupingYear,
    columnOrder: customization.columnOrder,
  }
}

export function setTicketListColumnVisibility(column: TicketListColumnKey, visible: boolean) {
  const nextColumns = { ...ticketListCustomizationState.columns, [column]: visible }
  if (!hasAtLeastOneColumnVisible(nextColumns)) return

  ticketListCustomizationState = { ...ticketListCustomizationState, columns: nextColumns }
  persistTicketListCustomization(ticketListCustomizationState)
  emitTicketListColumnsChange()
}

export function setTicketListColumnOrder(columnOrder: TicketListColumnKey[]) {
  ticketListCustomizationState = { ...ticketListCustomizationState, columnOrder }
  persistTicketListCustomization(ticketListCustomizationState)
  emitTicketListColumnsChange()
}

export function setTicketListGroupingMode(groupingMode: TicketListGroupingMode) {
  ticketListCustomizationState = { ...ticketListCustomizationState, groupingMode }
  persistTicketListCustomization(ticketListCustomizationState)
  emitTicketListColumnsChange()
}

export function setTicketListGroupingYear(groupingYear: string) {
  ticketListCustomizationState = { ...ticketListCustomizationState, groupingYear }
  persistTicketListCustomization(ticketListCustomizationState)
  emitTicketListColumnsChange()
}

export function resetTicketListGroupingMode() {
  ticketListCustomizationState = { ...ticketListCustomizationState, groupingMode: 'none' }
  persistTicketListCustomization(ticketListCustomizationState)
  emitTicketListColumnsChange()
}

export function resetTicketListCustomization() {
  ticketListCustomizationState = getDefaultCustomizationState()
  persistTicketListCustomization(ticketListCustomizationState)
  emitTicketListColumnsChange()
}
