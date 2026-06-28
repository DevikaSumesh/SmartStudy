import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import  { ObjectId } from "bson";
import type { SleepLog } from "@/lib/models/sleep"

// GET sleep logs
export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const db = await getDatabase()
    const sleepCollection = db.collection<SleepLog>("sleepLogs")

    const query: any = { userId: new ObjectId(session.userId) }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    const sleepLogs = await sleepCollection.find(query).sort({ date: -1 }).limit(30).toArray()

    return NextResponse.json({ sleepLogs })
  } catch (error) {
    console.error("Get sleep logs error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// CREATE sleep log
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { date, bedTime, wakeTime, quality, mood, notes } = await request.json()

    if (!bedTime || !wakeTime) {
      return NextResponse.json({ error: "Bed time and wake time are required" }, { status: 400 })
    }

    const bedTimeDate = new Date(bedTime)
    const wakeTimeDate = new Date(wakeTime)
    const duration = (wakeTimeDate.getTime() - bedTimeDate.getTime()) / (1000 * 60 * 60)

    const db = await getDatabase()
    const sleepCollection = db.collection<SleepLog>("sleepLogs")

    const result = await sleepCollection.insertOne({
      userId: new ObjectId(session.userId),
      date: date ? new Date(date) : new Date(),
      bedTime: bedTimeDate,
      wakeTime: wakeTimeDate,
      duration: Math.round(duration * 10) / 10,
      quality,
      mood,
      notes,
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      sleepLogId: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Create sleep log error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
