import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  email: string
  password?: string // Hashed password for email/password auth
  name?: string
  provider?: "email" | "google" | "microsoft"
  providerId?: string // OAuth provider ID
  avatar?: string
  createdAt: Date
  updatedAt: Date
  
  preferences: {
    focusSessionDuration: number // minutes
    breakDuration: number // minutes
    dailySleepGoal: number // hours
    notifications: {
      tasks: boolean
      study: boolean
      sleep: boolean
    }
  }
}

export interface UserSession {
  _id?: ObjectId
  userId: ObjectId
  token: string
  expiresAt: Date
  createdAt: Date
}
