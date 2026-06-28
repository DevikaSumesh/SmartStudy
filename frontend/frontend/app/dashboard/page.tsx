"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { DailyReadiness } from "@/components/dashboard/daily-readiness"
import { QuickTaskCreator } from "@/components/dashboard/quick-task-creator"
import { SchedulePanel } from "@/components/dashboard/schedule-panel"
import { UrgentTasks } from "@/components/dashboard/urgent-tasks"
import { useAuth } from "@/hooks/use-auth"
import { taskApi } from "@/lib/api"
import { toast } from "sonner"

type Task = {
  id: string
  title: string
  subject: string
  description?: string
  due_date: string
  priority: number
  estimated_minutes: number
  completed: boolean
}

export default function Dashboard() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loadingTasks, setLoadingTasks] = useState(true)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks()
    }
  }, [isAuthenticated])

  const fetchTasks = async () => {
    try {
      const data = await taskApi.getTasks()
      setTasks(data)
    } catch (error) {
      console.error("[v0] Error fetching tasks:", error)
      toast.error("Failed to load tasks")
    } finally {
      setLoadingTasks(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-gradient text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="flex min-h-screen bg-app-gradient">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 text-white">
          <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
          <p className="opacity-80 mt-1">Let's start it fresh.</p>
        </header>

        {/* Updated Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* LEFT & CENTER COLUMN (Now span 2 columns) */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Schedule Panel now takes prominence in the center */}
            <SchedulePanel /> 
            
            {/* 2. Urgent Tasks follows below */}
            <UrgentTasks tasks={tasks} onTaskUpdate={fetchTasks} />
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-8">
            {/* 1. Readiness Check */}
            <DailyReadiness />
            
            {/* 2. Quick Add Task moved here for better space utilization */}
            <QuickTaskCreator onTaskCreated={fetchTasks} />
          </div>

        </div>
      </main>
    </div>
  )
}
