import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { hashPassword, setSession } from "@/lib/auth"
import type { User } from "@/lib/models/user"

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const result = await usersCollection.insertOne({
      email,
      password: hashedPassword,
      name,
      provider: "email",
      createdAt: new Date(),
      updatedAt: new Date(),
      
      preferences: {
        focusSessionDuration: 25,
        breakDuration: 5,
        dailySleepGoal: 8,
        notifications: {
          tasks: true,
          study: true,
          sleep: true,
        },
      },
    })

    // Create session
    await setSession(result.insertedId.toString(), undefined, name)

    return NextResponse.json({
      success: true,
      userId: result.insertedId.toString(),
      name,
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
