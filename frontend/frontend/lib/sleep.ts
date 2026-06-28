import type { ObjectId } from "mongodb"

export interface SleepLog {
  _id?: ObjectId
  userId: ObjectId
  date: Date // Date of the sleep night
  bedTime: Date
  wakeTime: Date
  duration: number // hours
  quality?: number // 1-5 scale
  mood?: number // 1-6 scale (emojis)
  notes?: string
  createdAt: Date
}
