"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { authApi } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log("[v0] Attempting signup with:", { full_name: name, email })
      const data = await authApi.signup({
        full_name: name,
        email,
        password,
      })
      console.log("[v0] Signup successful:", { userId: data.user_id, name: data.name })

      login(data.access_token, data.user_id, data.name || name)

      toast.success("Account created! Let's get started.")
      router.push("/dashboard")
    } catch (error: any) {
      console.error("[v0] Signup error:", error.message)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-app-gradient flex items-center justify-center px-4">
      <div className="panel p-8 max-w-md w-full bg-white shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-[color:var(--brand)] rounded-full flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="h-8 w-8" aria-hidden>
              <path d="M10 46c14-22 28-30 44-30-8 10-16 22-26 32-6 6-12 8-18 8 0-4 0-8 0-10z" fill="white" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[color:var(--brand-dark)]">Join SmartStudy</h1>
          <p className="text-[color:var(--ink)]/60">Create an account to start your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Riya" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-[color:var(--brand)] hover:bg-[color:var(--brand-dark)]"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[color:var(--ink)]/60">
          Already have an account?{" "}
          <Link href="/login" className="text-[color:var(--brand)] font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
