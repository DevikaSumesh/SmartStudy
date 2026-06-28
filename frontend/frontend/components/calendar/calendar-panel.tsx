"use client"

import { useMemo, useState } from "react"
import { isSameDay, parseISO, format } from "date-fns"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react"

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function buildMonth(date = new Date()) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1)
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  const grid: (number | null)[] = []
  const leading = first.getDay()
  for (let i = 0; i < leading; i++) grid.push(null)
  for (let d = 1; d <= last.getDate(); d++) grid.push(d)
  while (grid.length % 7 !== 0) grid.push(null)
  return grid
}

export function CalendarPanel({ initialTasks = [] }: { initialTasks: any[] }) {
  const [current, setCurrent] = useState(new Date())
  // Track which day is clicked
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate())
  const [sleep, setSleep] = useState(7)
  const [mood, setMood] = useState<number | null>(3)

  const grid = useMemo(() => buildMonth(current), [current])
  const monthLabel = format(current, "MMMM yyyy")

  const getTasksForDay = (day: number) => {
    const dateToCheck = new Date(current.getFullYear(), current.getMonth(), day)
    return initialTasks.filter(task => {
      if (!task.due_date) return false
      return isSameDay(parseISO(task.due_date), dateToCheck)
    })
  }

  const selectedTasks = selectedDay ? getTasksForDay(selectedDay) : []

  return (
    <div className="space-y-6">
      <Card className="p-6 border-none shadow-sm rounded-[32px] bg-white">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-[#1a3636]">{monthLabel}</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-2">{d}</div>
          ))}
          {grid.map((d, i) => {
            const dayTasks = d ? getTasksForDay(d) : []
            const isSelected = selectedDay === d
            
            return (
              <div 
                key={i} 
                onClick={() => d && setSelectedDay(d)}
                className={`min-h-[100px] p-2 rounded-2xl border transition-all cursor-pointer ${
                  d 
                    ? isSelected 
                      ? "bg-emerald-50 border-emerald-500 shadow-md" 
                      : "bg-white border-gray-100 hover:border-emerald-200"
                    : "bg-transparent border-transparent"
                }`}
              >
                <span className={`text-xs font-bold ${isSelected ? "text-emerald-700" : "text-gray-400"}`}>{d}</span>
                <div className="mt-1 space-y-1">
                  {dayTasks.slice(0, 2).map((t, idx) => (
                    <div key={idx} className="w-full h-1.5 rounded-full bg-emerald-400" />
                  ))}
                  {dayTasks.length > 2 && <div className="text-[8px] text-emerald-600 font-bold">+{dayTasks.length - 2}</div>}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* --- TASK DISPLAY SECTION --- */}
      <Card className="p-6 border-none shadow-sm rounded-3xl bg-white">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-[#1a3636] flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-emerald-500" />
            Schedule for {selectedDay} {format(current, "MMMM")}
          </h4>
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
            {selectedTasks.length} Tasks
          </Badge>
        </div>

        <div className="space-y-3">
          {selectedTasks.length > 0 ? (
            selectedTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-800">{task.title}</span>
                  <span className="text-xs text-gray-500 uppercase font-medium">{task.subject}</span>
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex items-center text-xs text-gray-400 gap-1">
                      <Clock className="h-3 w-3" />
                      {task.estimated_minutes}m
                   </div>
                   <Badge className={task.priority >= 4 ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"}>
                     P{task.priority}
                   </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm italic">
              No tasks scheduled for this day. Enjoy your rest!
            </div>
          )}
        </div>
      </Card>

      {/* Mood/Sleep sections stay as they were below */}
    </div>
  )
}