import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import { ObjectId } from "mongodb"
import type { CalendarEvent } from "@/lib/models/calendar"

// 1. GET: Fetch events with strict serialization for the frontend
export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const aiScheduledOnly = searchParams.get("aiScheduledOnly") === "true"

    const db = await getDatabase()
    const eventsCollection = db.collection<CalendarEvent>("calendarEvents")

    const query: any = { userId: new ObjectId(session.userId) }

    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    if (aiScheduledOnly) {
      query.is_scheduled_by_ai = true
    }

    const events = await eventsCollection.find(query).sort({ startTime: 1 }).toArray()

    // SERIALIZATION FIX: 
    // - Converts ObjectIds to strings so the Focus Page doesn't crash
    // - Properly maps taskId from the database field
    const serializedEvents = events.map(event => ({
      ...event,
      _id: event._id.toString(),
      taskId: event._id ? event._id.toString() : undefined, // FIXED: Now references event.taskId, not event._id
      userId: event.userId.toString()
    }))

    return NextResponse.json({ events: serializedEvents })
  } catch (error) {
    console.error("Get events error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// 2. POST: Create event with merged validation (Time check + TaskID check)
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { 
      title, description, startTime, endTime, 
      type, color, reminders, taskId, is_scheduled_by_ai 
    } = body

    // Validation from 2nd code: Basic existence
    if (!title || !startTime || !endTime) {
      return NextResponse.json({ error: "Title, start time, and end time are required" }, { status: 400 })
    }

    // Validation from 2nd code: End time must be after start time
    const start = new Date(startTime)
    const end = new Date(endTime)
    if (end <= start) {
      return NextResponse.json({ error: "End time must be after start time" }, { status: 400 })
    }

    const db = await getDatabase()
    const eventsCollection = db.collection("calendarEvents")

    // Task ID Logic from both codes: Validate and convert
    let taskObjectId: ObjectId | undefined = undefined
    if (taskId && ObjectId.isValid(taskId)) {
      taskObjectId = new ObjectId(taskId)
    }

    const newEvent: any = {
      userId: new ObjectId(session.userId),
      taskId: taskObjectId, 
      title,
      description: description || "",
      startTime: start,
      endTime: end,
      type: type || "other",
      color: color || "#0f6b68",
      is_scheduled_by_ai: is_scheduled_by_ai || false, 
      reminders: reminders?.map((r: string) => new Date(r)) || [],
      completed: false,
      actualDurationSeconds: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await eventsCollection.insertOne(newEvent)

    return NextResponse.json({
      success: true,
      eventId: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Create event error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// 3. PATCH: Supports the "Finish & Log Session" functionality
export async function PATCH(request: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { eventId, actualDurationSeconds, completed } = await request.json()

    if (!eventId || !ObjectId.isValid(eventId)) {
      return NextResponse.json({ error: "Invalid Event ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const result = await db.collection("calendarEvents").updateOne(
      { 
        _id: new ObjectId(eventId), 
        userId: new ObjectId(session.userId) 
      },
      { 
        $set: { 
          completed: completed ?? true,
          actualDurationSeconds: actualDurationSeconds || 0,
          updatedAt: new Date()
        } 
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update event error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}