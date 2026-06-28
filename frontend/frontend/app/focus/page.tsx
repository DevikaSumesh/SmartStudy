'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Play, Pause, RotateCcw, ChevronDown, CheckCircle, Brain, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sidebar } from "@/components/layout/sidebar"
import { toast } from 'sonner'
import { calendarApi } from '@/lib/api'

// Properly typed CalendarEvent interface
interface CalendarEvent {
  _id: string
  id?: string
  title: string
  subject: string
  start_time: string
  end_time: string
  event_type: string
  task_id: string | null
  duration_minutes: number
  user_id?: string
  is_scheduled_by_ai?: boolean
}

type TimerStatus = 'idle' | 'running' | 'paused'

export default function FocusPage() {
  // FIX #1: Removed aggressive 30-second polling, using local timer instead
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('idle')
  const [seconds, setSeconds] = useState(0)
  const [activeTask, setActiveTask] = useState<CalendarEvent | null>(null)
  const [allTasks, setAllTasks] = useState<CalendarEvent[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(true)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const sessionStartTimeRef = useRef<number>(0)

  // FIX #3: Properly handle task_id for RL model training
  // task_id comes from the backend and points to the actual task
  // We use _id for the calendar event reference and task_id for RL logging

  // Fetch calendar once on mount - no polling
  const fetchActiveTasks = useCallback(async () => {
    try {
      const now = new Date()
      
      // Get today's date at midnight UTC (what the backend stored)
      // Create start of day in UTC
      const startOfDayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))
      const endOfDayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0))

      console.log("[v0] Current time (local):", now.toLocaleTimeString())
      console.log("[v0] Current time (UTC):", now.toUTCString())
      console.log("[v0] Requesting events from:", startOfDayUtc.toISOString(), "to", endOfDayUtc.toISOString())

      const events = await calendarApi.getEvents(startOfDayUtc.toISOString(), endOfDayUtc.toISOString())
      
      // Normalize events with proper typing
      const normalizedEvents: CalendarEvent[] = (events || []).map((e: any): CalendarEvent | null => {
        const eventId = e._id || e.id
        if (!eventId) {
          console.warn("[v0] Event missing ID, skipping")
          return null
        }

        // Backend returns UTC times as ISO strings
        // Keep them as-is for comparison, JavaScript Date constructor handles ISO strings correctly
        const startTime = new Date(e.start_time)
        const endTime = new Date(e.end_time)
        const durationMs = Math.max(0, endTime.getTime() - startTime.getTime())

        console.log(`[v0] Event: "${e.title}" - Start: ${startTime.toLocaleString()} (${e.start_time}), End: ${endTime.toLocaleString()} (${e.end_time})`)

        return {
          _id: String(eventId),
          title: e.title || 'Untitled',
          subject: e.subject || 'Study',
          start_time: e.start_time,
          end_time: e.end_time,
          event_type: e.event_type || 'study',
          task_id: e.task_id || null,
          duration_minutes: Math.round(durationMs / 60000),
          user_id: e.user_id,
          is_scheduled_by_ai: e.is_scheduled_by_ai !== false
        }
      }).filter((e: CalendarEvent | null): e is CalendarEvent => e !== null)

      const sortedTasks = normalizedEvents.sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      )

      setAllTasks(sortedTasks)

      // CRITICAL FIX: Match current time using Unix timestamps (absolute point in time)
      // Both now and event times are Date objects, so .getTime() comparison is timezone-agnostic
      const currentTimestamp = now.getTime()
      const currentTask = sortedTasks.find((t) => {
        const startTimestamp = new Date(t.start_time).getTime()
        const endTimestamp = new Date(t.end_time).getTime()
        
        const isActive = currentTimestamp >= startTimestamp && currentTimestamp < endTimestamp
        if (isActive) {
          console.log(`[v0] Current task matched: "${t.title}" (${new Date(t.start_time).toLocaleTimeString()} - ${new Date(t.end_time).toLocaleTimeString()})`)
        }
        return isActive
      })

      if (currentTask) {
        console.log("[v0] Found active task:", currentTask.title)
        setActiveTask(currentTask)
      } else if (sortedTasks.length > 0) {
        console.log("[v0] No current task found, showing first task:", sortedTasks[0].title)
        setActiveTask(sortedTasks[0])
      } else {
        console.log("[v0] No tasks found for today")
        setActiveTask(null)
        toast("No scheduled tasks for today. Create a schedule from the Dashboard!", {
          duration: 5000
        })
      }

      setSeconds(0)
    } catch (error) {
      console.error('[v0] Fetch error:', error)
      toast.error("Failed to load schedule. Please check the Dashboard.")
    } finally {
      setLoading(false)
    }
  }, [])

  // FIX #1: Fetch ONCE on mount, no polling
  useEffect(() => {
    fetchActiveTasks()
  }, [fetchActiveTasks])

  // FIX #4: Robust timer with cleanup
  useEffect(() => {
    if (timerStatus !== 'running') {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
      return
    }

    sessionStartTimeRef.current = Date.now()
    
    timerIntervalRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }
  }, [timerStatus])

  const formatTime = (totalSeconds: number): string => {
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Calculate remaining time until task ends
  const getRemainingTime = (): number => {
    if (!activeTask) return 0
    const endTime = new Date(activeTask.end_time)
    const now = new Date()
    const remainingMs = Math.max(0, endTime.getTime() - now.getTime())
    return Math.floor(remainingMs / 1000)
  }

  // Get elapsed time from task start
  const getElapsedTime = (): number => {
    if (!activeTask) return 0
    if (timerStatus === 'idle') return 0
    return seconds
  }

  const getTaskDuration = (): number => {
    if (!activeTask) return 0
    return activeTask.duration_minutes
  }

  // FIX #5: Add confirmation when switching tasks mid-session
  const handleTaskSwitch = (task: CalendarEvent) => {
    // If session has progress, confirm before switching
    if (seconds > 0 && timerStatus === 'running') {
      const confirmed = window.confirm(
        `You have ${formatTime(seconds)} logged. Switch task and lose progress?`
      )
      if (!confirmed) return
    }

    setActiveTask(task)
    setShowDropdown(false)
    setSeconds(0)
    setTimerStatus('idle')
  }

  const handleFinish = async () => {
    if (!activeTask) return
    
    try {
      const actualMinutes = Math.round(seconds / 60)
      const performanceScore = Math.min(1.0, actualMinutes / 45)
      
      // FIX #3: Use task_id from backend for RL training, _id for event reference
      const response = await fetch(`/api/focus/log-session`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          event_id: activeTask._id,
          task_id: activeTask.task_id || activeTask._id,
          actual_minutes: actualMinutes,
          focus_switch: false,
          is_completion: true,
          performance_score: performanceScore
        })
      })

      if (response.ok) {
        toast.success("Session logged successfully!")
        setTimerStatus('idle')
        setSeconds(0)
        
        // Find and move to next task
        const currentIndex = allTasks.findIndex(t => t._id === activeTask._id)
        if (currentIndex < allTasks.length - 1) {
          setActiveTask(allTasks[currentIndex + 1])
        } else {
          setActiveTask(null)
          toast("All tasks completed!")
        }
      } else {
        const error = await response.json()
        toast.error(error.detail || "Failed to log session")
      }
    } catch (error) {
      console.error("[v0] Session logging error:", error)
      toast.error("Failed to log session")
    }
  }

  return (
    <div className="flex min-h-screen bg-app-gradient">
      <Sidebar />
      
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
        <div className="container-max">
          {/* Header */}
          <header className="mb-10 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-brand-dark/30 p-2 rounded-lg backdrop-blur-md">
                <Brain className="text-white" size={24} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Focus Studio</h1>
            </div>
            <p className="text-white/70">Deep work sessions optimized by AI.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Timer Panel */}
            <div className="lg:col-span-8">
              <div className="panel p-12 flex flex-col items-center justify-center min-h-[450px] relative">
                <div className="text-[120px] font-black leading-none text-brand-dark mb-10 font-mono tracking-tighter">
                  {formatTime(seconds)}
                </div>

                <div className="flex items-center gap-4">
                  <Button 
                    onClick={() => setTimerStatus(timerStatus === 'running' ? 'paused' : 'running')}
                    className="btn-primary h-16 px-10 text-lg gap-2"
                  >
                    {timerStatus === 'running' ? <Pause size={20} /> : <Play size={20} className="fill-current" />}
                    {timerStatus === 'running' ? 'Pause' : 'Start Focus'}
                  </Button>
                  
                  {timerStatus !== 'idle' && (
                    <Button 
                      variant="ghost" 
                      onClick={() => {setTimerStatus('idle'); setSeconds(0)}}
                      className="btn-outline h-16 w-16 p-0 rounded-full"
                    >
                      <RotateCcw size={20} />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Task & Action Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Active Task Card - Shows ONLY the current active task */}
              <div className="panel p-6 border-b-4 border-brand">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">
                  Active Task
                </label>
                
                {loading ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-sm text-slate-500">
                    Loading today's schedule...
                  </div>
                ) : activeTask ? (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-brand/5 to-brand/10 border-2 border-brand">
                    <p className="font-bold text-brand-dark text-lg truncate">
                      {activeTask.title}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-1 uppercase font-semibold">
                      {activeTask.subject}
                    </p>
                    
                    {/* Time Display */}
                    <div className="mt-4 space-y-2 bg-white/50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">Task Duration</span>
                        <span className="text-sm font-bold text-brand-dark">{activeTask.duration_minutes}m</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">Elapsed</span>
                        <span className="text-sm font-mono font-bold text-blue-600">{formatTime(getElapsedTime())}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">Remaining</span>
                        <span className="text-sm font-mono font-bold text-orange-600">{formatTime(getRemainingTime())}</span>
                      </div>
                      <div className="h-px bg-slate-200 my-2"></div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">Ends at</span>
                        <span className="text-sm font-semibold text-slate-700">{new Date(activeTask.end_time).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                      </div>
                    </div>
                    
                    <p className="text-[9px] text-slate-600 mt-3 font-semibold flex items-center gap-2">
                      {activeTask.event_type === 'study' || activeTask.event_type === 'Study' ? '📚 Study Session' : '☕ Break Time'}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <p className="text-sm text-slate-600">No active task right now</p>
                    <p className="text-[10px] text-slate-500 mt-1">Check the Dashboard to create a schedule</p>
                  </div>
                )}
              </div>

              {/* Progress & Stats */}
              {activeTask && timerStatus === 'running' && (
                <div className="panel p-4 bg-white border-2 border-brand/20">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">
                    Session Progress
                  </label>
                  
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (getElapsedTime() / (activeTask.duration_minutes * 60)) * 100)}%`
                        }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-[9px] text-slate-600">
                      <span>{Math.round((getElapsedTime() / (activeTask.duration_minutes * 60)) * 100)}% Complete</span>
                      <span>{activeTask.duration_minutes}m goal</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Upcoming Tasks - Informational only */}
              {allTasks.length > 1 && (
                <div className="panel p-4 bg-slate-50">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">
                    Today's Schedule
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {allTasks.map((task) => {
                      const now = new Date()
                      const taskStart = new Date(task.start_time)
                      const taskEnd = new Date(task.end_time)
                      const isCurrentTask = task._id === activeTask?._id
                      const isPast = now > taskEnd
                      const isUpcoming = now < taskStart
                      
                      return (
                        <div 
                          key={task._id} 
                          className={`p-2 rounded text-[9px] border transition-all ${
                            isCurrentTask ? 'bg-brand/20 border-brand font-semibold' : 
                            isPast ? 'bg-slate-200/50 border-slate-300 text-slate-500' :
                            isUpcoming ? 'bg-white border-slate-200' :
                            'bg-white border-slate-200'
                          }`}
                        >
                          <p className="font-semibold">{task.title}</p>
                          <p className="text-[8px] opacity-70">{taskStart.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} - {taskEnd.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} ({task.duration_minutes}m)</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}


              {/* FIX #7: Button container always present to prevent layout shift */}
              <div className="h-20 w-full">
                {seconds > 0 ? (
                  <Button 
                    onClick={handleFinish}
                    className="w-full h-full rounded-panel bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold gap-3 shadow-xl shadow-emerald-900/20"
                  >
                    <CheckCircle size={24} />
                    Finish & Log Session
                  </Button>
                ) : (
                  <div className="w-full h-full rounded-panel bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-sm text-slate-400">
                    Start timer to enable session logging
                  </div>
                )}
              </div>

              {/* AI Insight Card */}
              <div className="panel p-6 bg-brand-dark text-white border-none">
                <div className="flex items-center gap-2 mb-3">
                  <Timer size={16} className="text-brand" />
                  <span className="text-xs font-bold uppercase tracking-widest">Efficiency AI</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed italic">
                  "You typically focus best for 45 minutes on {activeTask?.subject || 'this subject'}. Keep it up!"
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}