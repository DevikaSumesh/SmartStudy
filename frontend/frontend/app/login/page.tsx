"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { authApi } from "@/lib/api"
import { taskApi } from "@/lib/api" // Import taskApi
import { useAuth } from "@/hooks/use-auth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  try {
    console.log("[v0] Attempting login with:", { email })
    const data = await authApi.login({ email, password })
    console.log("[v0] Login successful:", { userId: data.user_id, name: data.name })

    login(data.access_token, data.user_id, data.name)

    toast.success("Welcome!")
    router.push("/dashboard")   // ✅ Always go to dashboard

  } catch (error: any) {
    console.error("[v0] Login error:", error.message)
    toast.error(error.message)
  } finally {
    setLoading(false)
  }
}


  return (
    <div className="min-h-screen bg-app-gradient flex items-center justify-center px-4 py-10">
      <div className="panel w-full max-w-md p-8 md:p-12">
        <div className="flex justify-center mb-6">
          <div className="relative h-12 w-12 md:h-16 md:w-16 bg-[color:var(--brand)] rounded-full flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="h-8 w-8 md:h-10 md:w-10" aria-hidden>
              <path d="M10 46c14-22 28-30 44-30-8 10-16 22-26 32-6 6-12 8-18 8 0-4 0-8 0-10z" fill="white" />
            </svg>
          </div>
        </div>

        <h1 className="text-center text-2xl md:text-3xl font-semibold text-[color:var(--brand-dark)]">
          Login to Study Smart
        </h1>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[color:var(--brand)] hover:bg-[color:var(--brand-dark)]"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <p className="mt-8 text-sm text-center text-[color:var(--ink)]/70">
          Don't have an account?{" "}
          <Link className="text-[color:var(--brand)] underline font-medium" href="/signup">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}