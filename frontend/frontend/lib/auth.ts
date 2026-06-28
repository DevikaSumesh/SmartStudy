import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createToken(userId: string, name?: string): Promise<string> {
  return new SignJWT({ userId, name }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(SECRET_KEY)
}

export async function verifyToken(token: string) {
  try {
    const verified = await jwtVerify(token, SECRET_KEY)
    return verified.payload as { userId: string; name?: string }
  } catch (error) {
    return null
  }
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")

  if (!token) return null

  const payload = await verifyToken(token.value)
  return payload // now includes { userId, name }
}

export async function setSession(userId: string, externalToken?: string, name?: string) {
  // If an external token (from FastAPI) is provided, use it directly.
  // Otherwise, generate a new one using our shared secret.
  const token = externalToken || (await createToken(userId, name))
  const cookieStore = await cookies()

  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })

  return token
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete("auth-token")
}
