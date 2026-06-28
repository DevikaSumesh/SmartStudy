import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getAuthToken } from "@/lib/api"

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the backend API URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
    const token = getAuthToken()

    if (!token) {
      return NextResponse.json({ error: "No authentication token found" }, { status: 401 })
    }

    // Call the FastAPI backend recommendations endpoint
    const response = await fetch(`${backendUrl}/recommendations`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("[v0] Backend recommendations error:", error)
      return NextResponse.json(
        { error: error.detail || "Failed to fetch recommendations" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json({
      recommendations: data.recommendations || [],
    })
  } catch (error: any) {
    console.error("[v0] Recommendations endpoint error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
