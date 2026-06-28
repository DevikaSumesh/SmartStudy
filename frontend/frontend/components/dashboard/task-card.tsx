"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { taskApi } from "@/lib/api"
import { format, parseISO, isValid } from 'date-fns'

// Define the Task type to match your Backend response
type Task = {
  id: string
  title: string
  completed: boolean
  subject: string
  due_date?: string | null // Added this
}

export function TaskCard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const data = await taskApi.getTasks()
      
      // Map the backend data (_id) to frontend state (id)
      const formattedTasks = data
        .filter((task: any) => task._id) 
        .map((task: any) => ({
          id: task._id,
          title: task.title,
          completed: task.completed,
          subject: task.subject,
          due_date: task.due_date // Pass the due_date through
        }))

      setTasks(formattedTasks)
    } catch (error: any) {
      console.error("[v0] Error fetching tasks:", error)
      toast.error("Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }

  const toggle = async (id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return

    try {
      // Optimistic update
      const newStatus = !task.completed
      setTasks((prev) => prev.map((x) => (x.id === id ? { ...x, completed: newStatus } : x)))
      
      await taskApi.updateTask(id, { completed: newStatus })
      toast.success(newStatus ? "Task completed!" : "Task marked as incomplete")
    } catch (error: any) {
      // Revert if API fails
      setTasks((prev) => prev.map((x) => (x.id === id ? { ...x, completed: task.completed } : x)))
      console.error("[v0] Error updating task:", error)
      toast.error("Failed to update task")
    }
  }

  // Helper function for safe date formatting
  const getDisplayDate = (dateStr?: string | null) => {
    if (!dateStr) return 'No due date';
    const parsed = parseISO(dateStr);
    return isValid(parsed) ? format(parsed, 'PPP') : 'No due date';
  }

  if (loading) {
    return (
      <div className="panel p-6 bg-[color:var(--brand)]/80 text-white rounded-[var(--radius-panel)] shadow-xl animate-pulse">
        <h3 className="text-xl font-semibold">Today's Tasks</h3>
        <p className="mt-4 text-white/80 text-center">Loading tasks...</p>
      </div>
    )
  }

  return (
    <div className="panel p-6 bg-[color:var(--brand)]/80 text-white rounded-[var(--radius-panel)] shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Today's Tasks</h3>
        <a href="/tasks" className="text-white/80 hover:text-white text-sm underline underline-offset-4">
          View All
        </a>
      </div>
      
      {tasks.length === 0 ? (
        <p className="mt-4 text-white/80 text-center italic">No tasks yet. Create your first task!</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {tasks.slice(0, 3).map((t) => (
            <li key={t.id} className="flex flex-col gap-1 border-b border-white/10 pb-2 last:border-0">
              <div className="flex items-start gap-3">
                <input
                  aria-label={t.title}
                  type="checkbox"
                  checked={t.completed}
                  onChange={() => toggle(t.id)}
                  className="mt-1 h-5 w-5 rounded border-white/50 bg-white/20 cursor-pointer accent-white"
                />
                <div className="flex flex-col">
                  <span className={`font-medium ${t.completed ? "line-through opacity-60" : ""}`}>
                    {t.title}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <span className="bg-white/20 px-1.5 py-0.5 rounded">{t.subject}</span>
                    <span>•</span>
                    <span>{getDisplayDate(t.due_date)}</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}