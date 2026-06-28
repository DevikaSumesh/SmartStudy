import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getSession } from "@/lib/auth"
import  { ObjectId } from "bson";
import type { User } from "@/lib/models/user"

export async function PUT(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { step, data } = await request.json()

    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")

  }}