import  { ObjectId } from "bson";

export interface CalendarEvent {
  _id?: ObjectId
  userId: ObjectId
  title: string
  description?: string
  startTime: Date
  endTime: Date
  type: "task" | "study" | "break" | "sleep" | "other"
  color?: string
  reminders: Date[]
  createdAt: Date
  updatedAt: Date
}
