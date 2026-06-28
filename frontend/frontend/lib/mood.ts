import type { ObjectId } from "mongodb"

export interface MoodEntry {
  _id?: ObjectId
  userId: ObjectId
  date: Date
  mood: number // 1-6 scale (sad to happy)
  thoughts?: string
  createdAt: Date
}
