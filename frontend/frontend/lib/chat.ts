import type { ObjectId } from "mongodb"

export interface ChatMessage {
  _id?: ObjectId
  userId: ObjectId
  role: "user" | "assistant"
  content: string
  timestamp: Date
  attachments?: {
    type: "image" | "file"
    url: string
    name: string
  }[]
}

export interface ChatSession {
  _id?: ObjectId
  userId: ObjectId
  messages: ObjectId[]
  createdAt: Date
  updatedAt: Date
}
