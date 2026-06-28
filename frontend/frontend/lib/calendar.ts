import type { ObjectId } from "mongodb"

export interface CalendarEvent {
  _id?: ObjectId
  userId: ObjectId
  title: string
  subject?: string
  description?: string
  startTime: Date
  endTime: Date
  type: "task" | "study" | "break" | "sleep" | "other"
  color?: string
  reminders: Date[]
  is_scheduled_by_ai?: boolean
  createdAt: Date
  updatedAt: Date
}
