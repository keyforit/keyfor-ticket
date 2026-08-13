export type Status = 'open' | 'in_progress' | 'resolved' | 'closed'

export interface Ticket {
  id: string
  requestType?: string
  customerName: string
  title: string
  description: string
  status: Status
  assignee: string
  reporter: string
  createdAt: string
  updatedAt: string
  tags: string[]
  solleciti: number
  isNew: boolean
}

export const mockTickets: Ticket[] = []
