import  { ObjectId } from "bson";

export interface PomodoroSession {
  _id?: ObjectId
  userId: ObjectId
  taskId?: ObjectId
  taskTitle: string
  startTime: Date
  endTime?: Date
  duration: number // minutes planned
  actualDuration?: number // minutes completed
  completed: boolean
  sessionNumber: number // 1, 2, 3, 4...
  totalSessions: number
  type: "focus" | "break"
  createdAt: Date
}
