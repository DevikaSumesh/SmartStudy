"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { format, differenceInHours, isPast } from "date-fns"
import { taskApi } from "@/lib/api"
import { toast } from "sonner"

type Task = {
  id: string
  title: string
  subject: string
  due_date: string
  priority: number
  estimated_minutes: number
  completed: boolean
}

type UrgentTasksProps = {
  tasks: Task[]
  onTaskUpdate: () => void
}

export function UrgentTasks({ tasks, onTaskUpdate }: UrgentTasksProps) {
  const sortedTasks = [...tasks]
    .filter((task) => !task.completed)
    .sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    })

  const urgentTasks = sortedTasks.filter((task) => {
    const hoursUntilDue = differenceInHours(new Date(task.due_date), new Date())
    return hoursUntilDue <= 24 && hoursUntilDue >= 0
  })

  const handleToggleComplete = async (taskId: string) => {
    try {
      const task = tasks.find((t) => t.id === taskId)
      await taskApi.updateTask(taskId, { completed: !task?.completed })
      toast.success("Task updated!")
      onTaskUpdate()
    } catch (error) {
      toast.error("Failed to update task")
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return "bg-red-100 text-red-800 border-red-200"
    if (priority >= 3) return "bg-orange-100 text-orange-800 border-orange-200"
    return "bg-blue-100 text-blue-800 border-blue-200"
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <h2 className="text-xl font-bold text-[color:var(--brand-dark)]">Urgent Tasks</h2>
        {urgentTasks.length > 0 && (
          <Badge variant="destructive" className="ml-auto">
            {urgentTasks.length}
          </Badge>
        )}
      </div>

      {urgentTasks.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
          <p className="text-[color:var(--ink)]/60">No urgent tasks due in the next 24 hours</p>
        </div>
      ) : (
        <div className="space-y-3">
          {urgentTasks.slice(0, 5).map((task) => {
            const dueDate = new Date(task.due_date)
            const hoursUntilDue = differenceInHours(dueDate, new Date())
            const isOverdue = isPast(dueDate)

            return (
              <div key={task.id} className="border border-black/10 rounded-lg p-4 hover:bg-black/5 transition">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleComplete(task.id)}
                    className="mt-1 h-5 w-5 rounded border-2 border-[color:var(--brand)] hover:bg-[color:var(--brand)]/10 transition"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <h3 className="font-semibold text-[color:var(--brand-dark)] truncate">{task.title}</h3>
                      <Badge className={getPriorityColor(task.priority)}>P{task.priority}</Badge>
                      {isOverdue && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Overdue
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-[color:var(--ink)]/70">{task.subject}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-[color:var(--ink)]/60">
                      <span>Due: {format(dueDate, "MMM d, h:mm a")}</span>
                      <span>•</span>
                      <span className={isOverdue ? "text-red-600 font-semibold" : ""}>
                        {isOverdue ? "Overdue" : `${hoursUntilDue}h remaining`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {sortedTasks.length > urgentTasks.length && (
        <p className="text-sm text-[color:var(--ink)]/60 mt-4 text-center">
          {sortedTasks.length - urgentTasks.length} more tasks in your list
        </p>
      )}
    </Card>
  )
}
