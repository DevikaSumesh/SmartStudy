import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import { ObjectId } from "mongodb"
import type { Task } from "@/lib/models/task"

// UPDATE task
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const db = await getDatabase()
    const tasksCollection = db.collection<Task>("tasks")

    const updateData: any = {
      ...body,
      updatedAt: new Date(),
    }

    if (body.dueDate) {
      updateData.dueDate = new Date(body.dueDate)
    }

    const result = await tasksCollection.updateOne(
      {
        _id: new ObjectId(id),
        userId: new ObjectId(session.userId),
      },
      { $set: updateData },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update task error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE task
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const db = await getDatabase()
    const tasksCollection = db.collection<Task>("tasks")

    const result = await tasksCollection.deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(session.userId),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete task error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
