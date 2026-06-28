import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const userId = new ObjectId(session.userId)

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get task statistics
    const tasksCollection = db.collection("tasks")
    const totalTasks = await tasksCollection.countDocuments({ userId })
    const completedTasks = await tasksCollection.countDocuments({
      userId,
      completed: true,
    })
    const todayTasks = await tasksCollection
      .find({
        userId,
        dueDate: { $gte: today, $lt: tomorrow },
      })
      .toArray()

    // Get last sleep log
    const sleepCollection = db.collection("sleepLogs")
    const lastSleep = await sleepCollection.findOne({ userId }, { sort: { date: -1 } })

    // Get weekly pomodoro count
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const pomodoroCollection = db.collection("pomodoroSessions")
    const weeklyPomodoros = await pomodoroCollection.countDocuments({
      userId,
      startTime: { $gte: weekAgo },
      completed: true,
      type: "focus",
    })

    // Get mood trend (last 7 days)
    const moodCollection = db.collection("moodEntries")
    const moodTrend = await moodCollection
      .find({
        userId,
        date: { $gte: weekAgo },
      })
      .sort({ date: 1 })
      .toArray()

    return NextResponse.json({
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        today: todayTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      sleep: {
        lastDuration: lastSleep?.duration || 0,
        lastQuality: lastSleep?.quality || 0,
      },
      productivity: {
        weeklyPomodoros,
      },
      mood: {
        trend: moodTrend,
      },
    })
  } catch (error) {
    console.error("Get dashboard analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
