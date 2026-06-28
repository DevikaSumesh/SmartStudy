import type { ObjectId } from "mongodb"

export interface Task {
  _id?: ObjectId
  userId: ObjectId
  title: string
  description?: string
  completed: boolean
  dueDate?: Date
  priority: "low" | "medium" | "high"
  tags: string[]
  project?: string
  estimatedTime?: number // minutes
  actualTime?: number // minutes
  createdAt: Date
  updatedAt: Date
}
