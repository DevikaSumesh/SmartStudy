"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { moodApi, sleepApi } from "@/lib/api"
import { toast } from "sonner"
import { Smile, Frown, Meh, Laugh, Heart } from "lucide-react"
import { format, startOfDay, endOfDay } from "date-fns"

export function DailyReadiness() {
  const [todayMood, setTodayMood] = useState<any>(null)
  const [todaySleep, setTodaySleep] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [selectedMood, setSelectedMood] = useState(3)
  const [energyLevel, setEnergyLevel] = useState(3)
  const [stressLevel, setStressLevel] = useState(3)

  const [hoursSlept, setHoursSlept] = useState("")
  const [sleepQuality, setSleepQuality] = useState([5])

  useEffect(() => {
    fetchTodayData()
  }, [])

  const fetchTodayData = async () => {
    try {
      const today = new Date()
      const startDate = format(startOfDay(today), "yyyy-MM-dd")
      const endDate = format(endOfDay(today), "yyyy-MM-dd")

      const [moodLogs, sleepLogs] = await Promise.all([
        moodApi.getMoodEntries(startDate, endDate),
        sleepApi.getSleepLogs(startDate, endDate),
      ])

      if (moodLogs.length > 0) setTodayMood(moodLogs[0])
      if (sleepLogs.length > 0) setTodaySleep(sleepLogs[0])
    } catch (error) {
      console.error("[v0] Error fetching daily data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogMood = async () => {
    try {
      await moodApi.createMoodEntry({
        date: new Date().toISOString(),
        mood_score: selectedMood,
        energy_level: energyLevel,
        stress_level: stressLevel,
        notes: "",
        tags: [],
      })
      toast.success("Mood logged successfully!", { description: "Great job tracking your energy!" })
      fetchTodayData()
    } catch (error: any) {
      toast.error("Failed to log mood")
    }
  }

  const handleLogSleep = async () => {
    if (!hoursSlept || Number(hoursSlept) <= 0) {
      toast.error("Please enter valid sleep hours")
      return
    }

    try {
      const now = new Date()
      const sleepHours = Number(hoursSlept)
      const wakeTime = now
      const sleepTime = new Date(now.getTime() - sleepHours * 60 * 60 * 1000)

      await sleepApi.createSleepLog({
        date: new Date().toISOString(),
        sleep_time: format(sleepTime, "HH:mm:ss"),
        wake_time: format(wakeTime, "HH:mm:ss"),
        hours_slept: sleepHours,
        quality_rating: sleepQuality[0],
        notes: "",
      })
      toast.success("Sleep logged successfully!", { description: "Sweet dreams tracked!" })
      setHoursSlept("")
      setSleepQuality([5])
      fetchTodayData()
    } catch (error: any) {
      toast.error("Failed to log sleep")
    }
  }

  const moodEmojis = [
    { icon: Frown, label: "Very Sad", color: "text-red-500" },
    { icon: Frown, label: "Sad", color: "text-orange-500" },
    { icon: Meh, label: "Okay", color: "text-yellow-500" },
    { icon: Smile, label: "Good", color: "text-green-500" },
    { icon: Laugh, label: "Great", color: "text-blue-500" },
    { icon: Heart, label: "Amazing", color: "text-purple-500" },
  ]

  const getEnergyStatus = () => {
    if (!todayMood && !todaySleep) return "Unknown"
    const avgEnergy = ((todayMood?.energy_level || 3) + (todaySleep?.quality_rating || 3)) / 2
    if (avgEnergy >= 4) return "High"
    if (avgEnergy >= 3) return "Medium"
    return "Low"
  }

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-center text-[color:var(--ink)]/60">Loading readiness data...</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-[color:var(--brand-dark)] mb-4">Daily Readiness</h2>

      {todayMood && todaySleep ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-lg font-semibold text-green-800">Today's Energy: {getEnergyStatus()}</p>
            <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
              <div>
                <p className="text-[color:var(--ink)]/60">Mood Score</p>
                <p className="font-semibold">{todayMood.mood_score}/6</p>
              </div>
              <div>
                <p className="text-[color:var(--ink)]/60">Sleep Quality</p>
                <p className="font-semibold">{todaySleep.quality_rating}/5</p>
              </div>
              <div>
                <p className="text-[color:var(--ink)]/60">Energy Level</p>
                <p className="font-semibold">{todayMood.energy_level}/5</p>
              </div>
              <div>
                <p className="text-[color:var(--ink)]/60">Hours Slept</p>
                <p className="font-semibold">{todaySleep.hours_slept}h</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-[color:var(--ink)]/50 text-center">Check back tomorrow to log again</p>
        </div>
      ) : (
        <div className="space-y-6">
          {!todayMood && (
            <div className="space-y-4">
              <h3 className="font-semibold text-[color:var(--brand-dark)]">How are you feeling today?</h3>
              <div className="flex justify-between gap-2">
                {moodEmojis.map((emoji, index) => {
                  const Icon = emoji.icon
                  const moodValue = index + 1
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedMood(moodValue)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg transition ${
                        selectedMood === moodValue
                          ? "bg-[color:var(--brand)]/10 ring-2 ring-[color:var(--brand)]"
                          : "hover:bg-black/5"
                      }`}
                    >
                      <Icon className={`h-6 w-6 ${emoji.color}`} />
                      <span className="text-xs">{moodValue}</span>
                    </button>
                  )
                })}
              </div>

              <div className="space-y-2">
                <Label>Energy Level: {energyLevel}/5</Label>
                <Slider value={[energyLevel]} onValueChange={(v) => setEnergyLevel(v[0])} min={1} max={5} step={1} />
              </div>

              <div className="space-y-2">
                <Label>Stress Level: {stressLevel}/5</Label>
                <Slider value={[stressLevel]} onValueChange={(v) => setStressLevel(v[0])} min={1} max={5} step={1} />
              </div>

              <Button
                onClick={handleLogMood}
                className="w-full bg-[color:var(--brand)] hover:bg-[color:var(--brand-dark)]"
              >
                Log Mood
              </Button>
            </div>
          )}

          {!todaySleep && (
            <div className="space-y-4 pt-4 border-t border-black/10">
              <h3 className="font-semibold text-[color:var(--brand-dark)]">How did you sleep?</h3>

              <div className="space-y-2">
                <Label htmlFor="hoursSlept">Hours Slept</Label>
                <Input
                  id="hoursSlept"
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={hoursSlept}
                  onChange={(e) => setHoursSlept(e.target.value)}
                  placeholder="e.g., 7.5"
                />
              </div>

              <div className="space-y-2">
                <Label>Sleep Quality: {sleepQuality[0]}/10</Label>
                <Slider value={sleepQuality} onValueChange={setSleepQuality} min={1} max={10} step={1} />
              </div>

              <Button
                onClick={handleLogSleep}
                className="w-full bg-[color:var(--brand)] hover:bg-[color:var(--brand-dark)]"
              >
                Log Sleep
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
