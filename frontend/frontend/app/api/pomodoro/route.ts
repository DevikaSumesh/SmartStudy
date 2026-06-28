import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import { ObjectId } from "mongodb"
import type { PomodoroSession } from "@/lib/models/pomodoro"

// GET pomodoro sessions
export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const sessionId = searchParams.get("sessionId")

    const db = await getDatabase()
    const pomodoroCollection = db.collection<PomodoroSession>("pomodoroSessions")

    const query: any = { userId: new ObjectId(session.userId) }

    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      query.startTime = { $gte: startDate, $lt: endDate }
    }

    if (sessionId) {
      query._id = new ObjectId(sessionId)
    }

    const sessions = await pomodoroCollection.find(query).sort({ startTime: -1 }).limit(50).toArray()

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error("Get pomodoro sessions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// CREATE pomodoro session
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { taskId, taskTitle, duration, sessionNumber, totalSessions, type } = await request.json()

    if (!taskTitle || !duration) {
      return NextResponse.json({ error: "Task title and duration are required" }, { status: 400 })
    }

    const db = await getDatabase()
    const pomodoroCollection = db.collection<PomodoroSession>("pomodoroSessions")

    const result = await pomodoroCollection.insertOne({
      userId: new ObjectId(session.userId),
      taskId: taskId ? new ObjectId(taskId) : undefined,
      taskTitle,
      startTime: new Date(),
      duration,
      completed: false,
      sessionNumber: sessionNumber || 1,
      totalSessions: totalSessions || 4,
      type: type || "focus",
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      sessionId: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Create pomodoro session error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// UPDATE pomodoro session (pause/resume/complete)
export async function PATCH(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sessionId, action, elapsedSeconds } = await request.json()

    if (!sessionId || !action) {
      return NextResponse.json({ error: "Session ID and action are required" }, { status: 400 })
    }

    const db = await getDatabase()
    const pomodoroCollection = db.collection<PomodoroSession>("pomodoroSessions")

    let updateData: any = {}

    if (action === "complete") {
      updateData.endTime = new Date()
      updateData.completed = true
      updateData.actualDuration = elapsedSeconds ? Math.round(elapsedSeconds / 60) : undefined
    } else if (action === "pause") {
      updateData.endTime = new Date()
    } else if (action === "resume") {
      updateData.endTime = undefined
    }

    const result = await pomodoroCollection.findOneAndUpdate(
      { _id: new ObjectId(sessionId), userId: new ObjectId(session.userId) },
      { $set: updateData },
      { returnDocument: "after" }
    )

    if (!result) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      session: result,
    })
  } catch (error) {
    console.error("Update pomodoro session error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
