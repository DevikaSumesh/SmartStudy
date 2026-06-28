"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { taskApi } from "@/lib/api"
import { toast } from "sonner"
import { Plus } from "lucide-react"

type QuickTaskCreatorProps = {
  onTaskCreated: () => void
}

export function QuickTaskCreator({ onTaskCreated }: QuickTaskCreatorProps) {
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [estimatedMinutes, setEstimatedMinutes] = useState(30)
  const [creating, setCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !subject || !dueDate) {
      toast.error("Please fill in all required fields")
      return
    }

    setCreating(true)
    try {
      await taskApi.createTask({
        title,
        subject,
        description: description || undefined,
        due_date: new Date(dueDate).toISOString(),
        estimated_minutes: estimatedMinutes,
      })

      toast.success("Task created!", { description: "AI will determine scheduling priority" })

      setTitle("")
      setSubject("")
      setDescription("")
      setDueDate("")
      setEstimatedMinutes(30)
      setShowForm(false)

      onTaskCreated()
    } catch (error: any) {
      toast.error("Failed to create task", { description: error.message })
    } finally {
      setCreating(false)
    }
  }

  if (!showForm) {
    return (
      <Card className="p-6">
        <Button
          onClick={() => setShowForm(true)}
          className="w-full bg-[color:var(--brand)] hover:bg-[color:var(--brand-dark)] gap-2"
        >
          <Plus className="h-5 w-5" />
          Quick Add Task
        </Button>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[color:var(--brand-dark)]">Quick Add Task</h3>
        <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Task Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Complete assignment"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Mathematics"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedMinutes">Est. Minutes</Label>
            <Input
              id="estimatedMinutes"
              type="number"
              min="5"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date *</Label>
          <Input
            id="dueDate"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details..."
            rows={2}
          />
        </div>

        <Button
          type="submit"
          disabled={creating}
          className="w-full bg-[color:var(--brand)] hover:bg-[color:var(--brand-dark)]"
        >
          {creating ? "Creating..." : "Create Task"}
        </Button>
      </form>
    </Card>
  )
}
