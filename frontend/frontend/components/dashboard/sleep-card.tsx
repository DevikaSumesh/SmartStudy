"use client"

import { useState, useEffect } from "react"
import { apiRequest } from "@/lib/api"

type SleepData = {
  lastDuration: number
  lastQuality: string
  weeklyAverage: number
}

export function SleepCard() {
  const [sleep, setSleep] = useState<SleepData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSleepData()
  }, [])

  const fetchSleepData = async () => {
    try {
      console.log("[v0] Fetching sleep data...")
      const response = await apiRequest("/api/analytics/dashboard")

      if (!response.ok) {
        throw new Error("Failed to fetch sleep data")
      }

      const data = await response.json()
      console.log("[v0] Sleep data received:", data.sleep)

      setSleep({
        lastDuration: data.sleep?.lastDuration || 0,
        lastQuality: data.sleep?.lastQuality >= 4 ? "Good" : data.sleep?.lastQuality >= 2 ? "Fair" : "Poor",
        weeklyAverage: data.sleep?.weeklyAverage || 0,
      })
    } catch (error: any) {
      console.error("[v0] Error fetching sleep data:", error)
      // Set default values on error
      setSleep({
        lastDuration: 0,
        lastQuality: "No data",
        weeklyAverage: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="panel p-6 bg-gradient-to-br from-[color:var(--brand)]/20 to-[color:var(--brand)]/10 rounded-[var(--radius-panel)] shadow-md">
        <h3 className="text-xl font-semibold text-[color:var(--brand-dark)] mb-4">Sleep Tracker</h3>
        <p className="text-[color:var(--ink)]/70">Loading...</p>
      </div>
    )
  }

  return (
    <div className="panel p-6 bg-gradient-to-br from-[color:var(--brand)]/20 to-[color:var(--brand)]/10 rounded-[var(--radius-panel)] shadow-md">
      <h3 className="text-xl font-semibold text-[color:var(--brand-dark)] mb-4">Sleep Tracker</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[color:var(--ink)]/70">Last night</span>
          <span className="font-semibold text-[color:var(--brand-dark)]">
            {sleep?.lastDuration ? `${sleep.lastDuration.toFixed(1)} hrs` : "No data"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[color:var(--ink)]/70">Quality</span>
          <span className="font-semibold text-[color:var(--brand-dark)]">{sleep?.lastQuality}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[color:var(--ink)]/70">Weekly avg</span>
          <span className="font-semibold text-[color:var(--brand-dark)]">
            {sleep?.weeklyAverage ? `${sleep.weeklyAverage.toFixed(1)} hrs` : "No data"}
          </span>
        </div>
      </div>
      <a href="/sleep" className="mt-4 inline-block text-[color:var(--brand)] text-sm font-medium hover:underline">
        View details →
      </a>
    </div>
  )
}
