"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { getAuthToken, setAuthToken, getUserId, setUserId } from "@/lib/api"

type User = {
  id: string
  name: string
  email: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (token: string, userId: string, name: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = getAuthToken()
    const userId = getUserId()
    const userName = typeof window !== "undefined" ? localStorage.getItem("user_name") : null

    if (token && userId && userName) {
      setUser({ id: userId, name: userName, email: "" })
    }
    setLoading(false)
  }, [])

  const login = (token: string, userId: string, name: string) => {
    setAuthToken(token)
    setUserId(userId)
    localStorage.setItem("user_name", name)
    setUser({ id: userId, name, email: "" })
  }

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.clear()
    }
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
