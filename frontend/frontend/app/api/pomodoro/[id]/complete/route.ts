import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import { ObjectId } from "mongodb"
import type { PomodoroSession } from "@/lib/models/pomodoro"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { actualDuration } = await request.json()

    const db = await getDatabase()
    const pomodoroCollection = db.collection<PomodoroSession>("pomodoroSessions")

    const endTime = new Date()

    const result = await pomodoroCollection.updateOne(
      {
        _id: new ObjectId(id),
        userId: new ObjectId(session.userId),
      },
      {
        $set: {
          endTime,
          actualDuration: actualDuration || undefined,
          completed: true,
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Complete pomodoro session error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
