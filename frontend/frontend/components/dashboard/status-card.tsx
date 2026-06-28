"use client"

import { useState, useEffect } from "react"
import { apiRequest } from "@/lib/api"

type StatusData = {
  focusScore: number
  weeklyPomodoros: number
  completionRate: number
}

export function StatusCard() {
  const [status, setStatus] = useState<StatusData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatusData()
  }, [])

  const fetchStatusData = async () => {
    try {
      console.log("[v0] Fetching status data...")
      const response = await apiRequest("/api/analytics/dashboard")

      if (!response.ok) {
        throw new Error("Failed to fetch status data")
      }

      const data = await response.json()
      console.log("[v0] Status data received:", data)

      setStatus({
        focusScore: data.tasks?.completionRate || 0,
        weeklyPomodoros: data.productivity?.weeklyPomodoros || 0,
        completionRate: data.tasks?.completionRate || 0,
      })
    } catch (error: any) {
      console.error("[v0] Error fetching status data:", error)
      // Set default values on error
      setStatus({
        focusScore: 0,
        weeklyPomodoros: 0,
        completionRate: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="panel p-6 bg-gradient-to-br from-green-100 to-blue-100 rounded-[var(--radius-panel)] shadow-md">
        <h3 className="text-xl font-semibold text-[color:var(--brand-dark)] mb-4">Study Status</h3>
        <p className="text-[color:var(--ink)]/70">Loading...</p>
      </div>
    )
  }

  return (
    <div className="panel p-6 bg-gradient-to-br from-green-100 to-blue-100 rounded-[var(--radius-panel)] shadow-md">
      <h3 className="text-xl font-semibold text-[color:var(--brand-dark)] mb-4">Study Status</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[color:var(--ink)]/70">Completion Rate</span>
          <span className="font-semibold text-green-600">{status?.completionRate}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[color:var(--ink)]/70">Focus Score</span>
          <span className="font-semibold text-[color:var(--brand-dark)]">{status?.focusScore}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[color:var(--ink)]/70">This week</span>
          <span className="font-semibold text-[color:var(--brand-dark)]">{status?.weeklyPomodoros} sessions</span>
        </div>
      </div>
      <a href="/insights" className="mt-4 inline-block text-[color:var(--brand)] text-sm font-medium hover:underline">
        View insights →
      </a>
    </div>
  )
}
