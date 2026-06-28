"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { toast } from "sonner"
import { calendarApi, taskApi, aiApi, moodApi, sleepApi } from "@/lib/api"
import { Sparkles, Brain, ChevronLeft, ChevronRight, TrendingUp, Moon, Heart, CalendarOff } from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  addMonths,
  subMonths,
  isValid,
} from "date-fns"

type CalendarEvent = {
  id: string
  title: string
  subject: string
  start_time: string
  end_time: string
  event_type: "study" | "break"
  is_scheduled_by_ai?: boolean
  task_id?: string
}

type Task = {
  id: string
  title: string
  subject: string
  due_date: string | null
  priority: number
  completed: boolean
}

type Recommendation = {
  type: "sleep" | "productivity" | "wellbeing" | "study"
  message: string
  priority: "high" | "medium" | "low"
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])

  // RL Observation State
  const [mood, setMood] = useState(3)
  const [energy, setEnergy] = useState(3)
  const [stress, setStress] = useState(3)
  const [sleepHours, setSleepHours] = useState(7)
  const [sleepQuality, setSleepQuality] = useState(3)

  useEffect(() => {
    fetchCalendarData()
    fetchRecommendations()
  }, [currentMonth])

  const fetchCalendarData = async () => {
    try {
      const start = format(startOfMonth(currentMonth), "yyyy-MM-dd")
      const end = format(endOfMonth(currentMonth), "yyyy-MM-dd")

      const [eventsData, tasksData] = await Promise.all([
        calendarApi.getEvents(start, end).catch(() => []),
        taskApi.getTasks().catch(() => [])
      ])

      const normalizedEvents = (eventsData || []).map((e: any) => ({
        ...e,
        id: e.id || e._id || Math.random().toString(),
      }))
      setEvents(normalizedEvents)

      const normalizedTasks = (tasksData || []).map((t: any) => ({
        ...t,
        id: t.id || t._id || Math.random().toString(),
        due_date: t.due_date || t.dueDate || null
      }))
      setTasks(normalizedTasks.filter((t: Task) => !t.completed))
    } catch (error) {
      console.error("Calendar fetch error:", error)
      toast.error("Failed to load calendar data")
    }
  }

  const fetchRecommendations = async () => {
    try {
      const data = await aiApi.getRecommendations()
      setRecommendations(data.recommendations || [])
    } catch (error) {
      console.error("Recommendations fetch error:", error)
    }
  }

  const handleGenerateSchedule = async () => {
    if (tasks.length === 0) {
      toast.error("Please create some tasks first")
      return
    }

    setIsGenerating(true)
    try {
      const result = await aiApi.generateSchedule()
      toast.success(`AI generated ${result.events_created} events!`)
      await fetchCalendarData()
    } catch (error: any) {
      toast.error(error.message || "Failed to generate schedule")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleMetricChange = async () => {
    try {
      const today = format(new Date(), "yyyy-MM-dd")
      await moodApi.createMoodEntry({
        date: today,
        mood_score: mood,
        energy_level: energy,
        stress_level: stress,
        notes: "Updated from calendar",
      })
      toast.success("Metrics synced with AI")
    } catch (error) {
      toast.error("Failed to save metrics")
    }
  }

 const handleSleepChange = async () => {
  try {
    const today = format(new Date(), "yyyy-MM-dd")
    // Ensure these variables (sleepHours, sleepQuality) are numbers, not strings
    await sleepApi.createSleepLog({
      date: today,
      sleep_time: "22:00", // Example: Check if your API requires these
      wake_time: "07:00",  // Example: Check if your API requires these
      hours_slept: Number(sleepHours), 
      quality_rating: Number(sleepQuality),
      notes: "Updated from calendar",
    })
    toast.success("Sleep data saved")
  } catch (error) {
    toast.error("Failed to save sleep data")
  }
}
  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  // SAFE FILTERING LOGIC
  const getEventsForDate = (date: Date) => {
    return events.filter((e) => {
      if (!e.start_time) return false
      const parsed = parseISO(e.start_time)
      return isValid(parsed) && isSameDay(parsed, date)
    })
  }

  const getTasksForDate = (date: Date) => {
    return tasks.filter((t) => {
      if (!t.due_date) return false // Prevents the filter crash
      const parsed = parseISO(t.due_date)
      return isValid(parsed) && isSameDay(parsed, date)
    })
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Smart Calendar</h1>
            <p className="text-slate-500">AI-powered study scheduling</p>
          </div>
          <div className="flex gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Brain className="h-4 w-4" /> AI Insights
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>AI Recommendations</SheetTitle>
                  <SheetDescription>Personalized insights</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {recommendations.map((rec, idx) => (
                    <Card key={idx} className={`p-4 border-l-4 ${rec.priority === "high" ? "border-l-red-500 bg-red-50" : "border-l-indigo-500 bg-indigo-50"}`}>
                      <div className="flex gap-3">
                        {rec.type === "sleep" ? <Moon size={18}/> : <Brain size={18}/>}
                        <div>
                          <p className="text-sm font-semibold capitalize">{rec.type}</p>
                          <p className="text-xs text-gray-600">{rec.message}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
            <Button onClick={handleGenerateSchedule} disabled={isGenerating} className="gap-2 bg-indigo-600">
              <Sparkles className="h-4 w-4" /> {isGenerating ? "Generating..." : "Generate Schedule"}
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft /></Button>
                  <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight /></Button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                  <div key={d} className="text-center text-xs font-bold text-gray-400 pb-2">{d}</div>
                ))}
                {monthDays.map((day) => {
                  const dayEvents = getEventsForDate(day)
                  const dayTasks = getTasksForDate(day)
                  const isToday = isSameDay(day, new Date())
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`min-h-[100px] p-2 border rounded-lg transition-all text-left ${isToday ? "border-indigo-500 bg-indigo-50/50" : "border-gray-100 hover:border-indigo-200"}`}
                    >
                      <span className={`text-sm ${isToday ? "font-bold text-indigo-600" : "text-gray-700"}`}>{format(day, "d")}</span>
                      <div className="mt-1 space-y-1">
                        {dayEvents.slice(0, 2).map(e => (
                          <div key={e.id} className="text-[10px] p-1 rounded bg-indigo-100 text-indigo-700 truncate">{e.title}</div>
                        ))}
                        {dayTasks.map(t => (
                          <div key={t.id} className="text-[10px] p-1 rounded bg-orange-100 text-orange-700 truncate">📌 {t.title}</div>
                        ))}
                      </div>
                    </button>
                  )
                })}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex gap-2"><Brain className="text-purple-600" /> RL Observation</h3>
              <div className="space-y-6">
                {[{ label: "Mood", val: mood, set: setMood }, { label: "Energy", val: energy, set: setEnergy }, { label: "Stress", val: stress, set: setStress }].map(m => (
                  <div key={m.label}>
                    <div className="flex justify-between text-sm mb-2"><span>{m.label}</span><span className="font-bold">{m.val}/5</span></div>
                    <Slider value={[m.val]} min={1} max={5} step={1} onValueChange={(v) => m.set(v[0])} onValueCommit={handleMetricChange} />
                  </div>
                ))}
                <hr />
                <div>
                  <div className="flex justify-between text-sm mb-2"><span>Sleep Hours</span><span className="font-bold">{sleepHours}h</span></div>
                  <Slider value={[sleepHours]} min={0} max={12} step={0.5} onValueChange={(v) => setSleepHours(v[0])} onValueCommit={handleSleepChange} />
                </div>
              </div>
            </Card>

            {selectedDate && (
              <Card className="p-6">
                <h3 className="font-semibold mb-4">{format(selectedDate, "EEEE, MMM d")}</h3>
                <div className="space-y-3">
                  {[...getEventsForDate(selectedDate), ...getTasksForDate(selectedDate)].length === 0 && (
                    <div className="text-center py-6 text-gray-400 text-sm">No scheduled items</div>
                  )}
                  {getEventsForDate(selectedDate).map(event => (
                    <div key={event.id} className="p-3 border rounded-lg bg-white shadow-sm">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium">{event.title}</span>
                        {event.is_scheduled_by_ai && <Badge className="bg-purple-100 text-purple-700">AI</Badge>}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {format(parseISO(event.start_time), "h:mm a")} - {format(parseISO(event.end_time), "h:mm a")}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}