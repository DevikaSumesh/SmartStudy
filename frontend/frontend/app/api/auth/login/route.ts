import { NextResponse } from "next/server"
import { setSession } from "@/lib/auth"
import { apiRequest } from "@/lib/api"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Call the FastAPI backend login endpoint
    const data = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    // Store the access token in a secure cookie
    await setSession(data.user_id, data.access_token, data.name)

    return NextResponse.json({
      success: true,
      userId: data.user_id,
      name: data.name, // added name to the frontend response
      token: data.access_token,
    })
  } catch (error: any) {
    console.error("[v0] Proxy login error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}
