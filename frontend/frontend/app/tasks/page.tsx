'use client'

import React, { useState, useRef } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { AlertCircle, Upload, FileText, Loader2 } from 'lucide-react'

// Adjust this interface if your DB uses different field names!
interface Task {
  _id: string
  title: string
  subject?: string
  due_date?: string
  duration_minutes?: number
  is_completed: boolean
  is_overdue?: boolean
}

const fetcher = async (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("access_token") : null;
  const res = await fetch(`http://localhost:8000${url}`, {
    headers: token ? { "Authorization": `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export default function TasksPage() {
  const { data: tasks = [], mutate } = useSWR('/api/tasks/', fetcher)
  const [isParsing, setIsParsing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeTasksCount = tasks.filter((t: Task) => !t.is_completed).length

  // Triggered when user selects a PDF
  const handleSyllabusUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsParsing(true)
    const token = localStorage.getItem("access_token")

    try {
      // 1. Send the PDF to the Backend Parser Route
      const formData = new FormData()
      formData.append("file", file)

      const parseRes = await fetch("http://localhost:8000/api/syllabus/parse", {
        method: "POST",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
        body: formData
      })

      if (!parseRes.ok) throw new Error("Failed to parse syllabus")
      const parseData = await parseRes.json()
      
      const extractedTasks = parseData.extracted_tasks

      // 2. Loop through the AI's JSON list and push them to your EXISTING task creation route
      // NOTE: Make sure "http://localhost:8000/api/tasks/" is your actual task creation endpoint!
      const creationPromises = extractedTasks.map((task: any) => {
        return fetch("http://localhost:8000/api/tasks/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            title: task.title,
            subject: task.subject || "Syllabus",
            duration_minutes: task.duration_minutes || 60,
            is_completed: false
          })
        })
      })

      // Wait for all the individual tasks to successfully save to the database
      await Promise.all(creationPromises)

      // 3. Refresh the UI to instantly show the new automated tasks!
      await mutate()
      
    } catch (error) {
      console.error("Error parsing syllabus:", error)
      alert("Failed to parse the syllabus. Check the console for details.")
    } finally {
      setIsParsing(false)
      // Reset the input so they can upload the exact same file again if they want
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto text-gray-900 bg-white min-h-screen">
      
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1 text-slate-900">All Tasks</h1>
          <p className="text-slate-500 text-sm">
            {tasks.length} total, {activeTasksCount} active
          </p>
        </div>
        
        <div className="flex gap-3">
          {/* Hidden File Input */}
          <input 
            type="file" 
            accept="application/pdf" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleSyllabusUpload}
          />
          
          {/* The New Auto-Parse Button */}
          <Button 
            variant="outline"
            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
            disabled={isParsing}
            onClick={() => fileInputRef.current?.click()}
          >
            {isParsing ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> AI Analyzing...</>
            ) : (
              <><Upload className="mr-2 h-4 w-4" /> Upload Syllabus</>
            )}
          </Button>

          {/* Your Original Create Task Button */}
          <Button className="bg-[#5B45FF] hover:bg-[#4b35e6] text-white rounded-full px-6">
            Create Task
          </Button>
        </div>
      </div>

      {/* Task List Container */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col gap-2 p-2">
        
        {tasks.length === 0 && !isParsing ? (
          <div className="p-8 text-center text-gray-500">
            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p>No tasks yet. Upload a syllabus to auto-generate your plan!</p>
          </div>
        ) : (
          tasks.map((task: Task) => (
            <div key={task._id} className="flex items-center p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors bg-white group">
              
              <input 
                type="checkbox" 
                checked={task.is_completed}
                readOnly
                className="h-5 w-5 rounded border-gray-300 text-[#5B45FF] focus:ring-[#5B45FF] mr-4 cursor-pointer"
              />
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`font-medium ${task.is_completed ? 'line-through text-gray-400' : 'text-slate-900'}`}>
                    {task.title}
                  </span>
                  
                  {/* Date Badge */}
                  {task.due_date && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {new Date(task.due_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </span>
                  )}
                  
                  {/* Overdue Badge */}
                  {task.is_overdue && !task.is_completed && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-600 text-white">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Overdue
                    </span>
                  )}
                </div>
                
                {/* Subtext */}
                <div className="text-xs text-gray-500 flex items-center">
                  {task.subject || "General"} • {task.duration_minutes || 0} min
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  )
}