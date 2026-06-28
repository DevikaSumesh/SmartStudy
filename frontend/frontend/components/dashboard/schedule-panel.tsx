"use client"

import { useState, useEffect, useCallback } from "react"
import { Calendar, CheckCircle2, Circle, Clock } from "lucide-react"
import { aiApi } from "@/lib/api"

interface ScheduleItem {
  _id: string
  time: string
  task: string
  duration: string
  type: string
  completed: boolean
  startTime: Date
  endTime: Date
  progress: number
}

export function SchedulePanel() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper to calculate progress and status without calling the API
  const refreshLocalProgress = useCallback((items: any[]): ScheduleItem[] => {
    const now = new Date()
    return items.map((item, idx) => {
      const start = new Date(item.start_time || item.startTime)
      const end = new Date(item.end_time || item.endTime)
      
      const isActive = now >= start && now <= end
      const isCompleted = now > end

      let progress = 0
      if (isActive) {
        const total = end.getTime() - start.getTime()
        const elapsed = now.getTime() - start.getTime()
        progress = Math.min(Math.max(Math.round((elapsed / total) * 100), 0), 100)
      } else if (isCompleted) {
        progress = 100
      }

      return {
        _id: item._id || idx.toString(),
        time: start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        task: item.title || item.task,
        duration: `${Math.round((end.getTime() - start.getTime()) / (1000 * 60))}m`,
        type: item.event_type || item.type,
        completed: isCompleted,
        startTime: start,
        endTime: end,
        progress: progress,
      }
    })
  }, [])

  const fetchInitialSchedule = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await aiApi.generateSchedule()
      
      if (data && data.schedule) {
        const updated = refreshLocalProgress(data.schedule)
        setSchedule(updated)
      }
    } catch (err) {
      console.error("Schedule fetch error:", err)
      setError("Unable to load AI schedule. Please ensure tasks are added.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInitialSchedule()
  }, [])

  // Update progress bars every 30 seconds locally (No API calls)
  useEffect(() => {
    if (schedule.length === 0) return

    const interval = setInterval(() => {
      setSchedule(prev => refreshLocalProgress(prev))
    }, 30000)

    return () => clearInterval(interval)
  }, [schedule.length, refreshLocalProgress])

  if (loading) {
    return (
      <div className="p-8 text-center animate-pulse bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
        <Clock className="mx-auto mb-2 text-slate-400 animate-spin" />
        <p className="text-slate-500 font-medium">AI is optimizing your day...</p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl p-6 bg-white border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="text-indigo-600" size={24} />
          AI Daily Plan
        </h2>
        <span className="text-[10px] font-black px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full uppercase tracking-widest border border-indigo-100">
          Neural Optimized
        </span>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl text-sm text-amber-700">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {schedule.length > 0 ? (
          schedule.map((item) => {
            const isActive = item.progress > 0 && !item.completed
            
            return (
              <div
                key={item._id}
                className={`flex gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                  isActive
                    ? 'border-indigo-200 bg-indigo-50/50 shadow-sm'
                    : 'border-slate-50 hover:border-slate-200 bg-white'
                }`}
              >
                <div className="text-xs font-bold text-slate-400 w-14 pt-1 tabular-nums">
                  {item.time}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-bold text-sm ${isActive ? 'text-indigo-700' : 'text-slate-700'}`}>
                      {item.task}
                    </h3>
                  </div>
                  
                  <p className="text-xs text-slate-500 font-medium">
                    {item.duration} • <span className="capitalize">{item.type}</span>
                  </p>

                  {isActive && (
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-tight">Active Now</span>
                        <span className="text-[10px] font-bold text-indigo-500">{item.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 transition-all duration-1000 ease-out"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-start pt-1">
                  {item.completed ? (
                    <CheckCircle2 className="text-emerald-500" size={20} />
                  ) : (
                    <div className={`rounded-full p-0.5 ${isActive ? 'bg-indigo-100' : ''}`}>
                      <Circle
                        className={`${isActive ? 'text-indigo-600' : 'text-slate-200'}`}
                        size={18}
                        strokeWidth={isActive ? 3 : 2}
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
            <p className="text-sm text-slate-400 italic px-6">
              No tasks scheduled yet. Log your mood or add tasks to see your AI plan!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}