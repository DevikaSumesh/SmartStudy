import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import  { ObjectId } from "bson";
import type { MoodEntry } from "@/lib/models/mood"

// GET mood entries
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
    const moodCollection = db.collection<MoodEntry>("moodEntries")

    const query: any = { userId: new ObjectId(session.userId) }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    const moodEntries = await moodCollection.find(query).sort({ date: -1 }).limit(30).toArray()

    return NextResponse.json({ moodEntries })
  } catch (error) {
    console.error("Get mood entries error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// CREATE mood entry
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { date, mood, thoughts } = await request.json()

    if (mood === undefined || mood < 1 || mood > 6) {
      return NextResponse.json({ error: "Valid mood (1-6) is required" }, { status: 400 })
    }

    const db = await getDatabase()
    const moodCollection = db.collection<MoodEntry>("moodEntries")

    const result = await moodCollection.insertOne({
      userId: new ObjectId(session.userId),
      date: date ? new Date(date) : new Date(),
      mood,
      thoughts,
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      moodEntryId: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Create mood entry error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
