import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import { ObjectId } from "mongodb"
import type { Task } from "@/lib/models/task"

// GET all tasks for user
export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const completed = searchParams.get("completed")

    const db = await getDatabase()
    const tasksCollection = db.collection<Task>("tasks")
    const query: any = { userId: new ObjectId(session.userId) }

    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      
      // LOGIC: Include tasks due today OR tasks with NO due date (null/missing)
      // This allows the AI to suggest "flexible" tasks for empty slots.
      query.$or = [
        { dueDate: { $gte: startDate, $lt: endDate } },
        { dueDate: null },
        { dueDate: { $exists: false } }
      ]
    }

    if (completed !== null) {
      query.completed = completed === "true"
    }

    // Sort: Deadlines first (ascending), then priority (descending), then newest
    const tasks = await tasksCollection
      .find(query)
      .sort({ 
        dueDate: 1,      // Soonest deadlines first
        priority: -1,    // Higher manual priority next
        createdAt: -1    // Fallback to newest
      })
      .toArray()

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error("Get tasks error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// CREATE new task
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    // Destructure using standardized naming
    const { 
      title, 
      description, 
      dueDate, 
      priority, 
      tags, 
      project, 
      estimated_minutes 
    } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const db = await getDatabase()
    const tasksCollection = db.collection<Task>("tasks")

    const result = await tasksCollection.insertOne({
      userId: new ObjectId(session.userId),
      title,
      description,
      completed: false,
      // Store as null if no date provided to keep DB clean for Python logic
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority || "medium",
      tags: tags || [],
      project,
      // Standardized key so UrgencyCalculator.py can read it
      estimated_minutes: Number(estimated_minutes) || 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any)

    return NextResponse.json({
      success: true,
      taskId: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Create task error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}