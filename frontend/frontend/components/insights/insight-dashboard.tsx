"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const kpis = [
  { label: "Total Study Time", value: "28.3h" },
  { label: "Average Focus", value: "84%" },
  { label: "Tasks Completed", value: "23" },
  { label: "Productivity Score", value: "87%" },
]

const trend = [
  { day: "Mon", score: 78 },
  { day: "Tue", score: 82 },
  { day: "Wed", score: 68 },
  { day: "Thu", score: 86 },
  { day: "Fri", score: 90 },
  { day: "Sat", score: 95 },
  { day: "Sun", score: 88 },
]

const subjects = [
  { name: "Mathematics", hrs: 12, pct: 85 },
  { name: "Physics", hrs: 8, pct: 72 },
  { name: "Chemistry", hrs: 6, pct: 68 },
  { name: "Computer Science", hrs: 15, pct: 91 },
]

export function InsightsDashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="panel p-5 bg-white/80">
            <div className="text-sm text-black/60">{k.label}</div>
            <div className="mt-1 text-2xl font-semibold text-[color:var(--brand-dark)]">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Study Performance Trends & Weekly Goals */}
      <div className="grid lg:grid-cols-[2fr,1fr] gap-4">
        <div className="panel p-4">
          <div className="text-sm font-medium mb-2 text-[color:var(--brand-dark)]">Study Performance Trends</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: 12 }} />
                <Line type="monotone" dataKey="score" stroke="#7c4dff" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-4">
          <div className="text-sm font-medium mb-3 text-[color:var(--brand-dark)]">Weekly Goals</div>
          {[
            { label: "Study Hours", pct: 85, color: "#51d6c7" },
            { label: "Focus Score", pct: 78, color: "#a78bfa" },
            { label: "Task Completion", pct: 92, color: "#10b981" },
            { label: "Sleep Quality", pct: 88, color: "#f59e0b" },
          ].map((g) => (
            <div key={g.label} className="mb-3">
              <div className="flex items-center justify-between text-sm">
                <span>{g.label}</span>
                <span className="opacity-70">{g.pct}%</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-black/10">
                <div className="h-2 rounded-full" style={{ width: `${g.pct}%`, background: g.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subject Performance & Recent Achievements */}
      <div className="grid lg:grid-cols-[2fr,1fr] gap-4">
        <div className="panel p-4">
          <div className="text-sm font-medium mb-3 text-[color:var(--brand-dark)]">Subject Performance</div>
          <div className="space-y-3">
            {subjects.map((s) => (
              <div key={s.name}>
                <div className="flex items-center justify-between text-sm">
                  <span>{s.name}</span>
                  <span className="opacity-70">{s.hrs}h</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-black/10">
                  <div className="h-2 rounded-full bg-[color:var(--brand)]" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel p-4">
          <div className="text-sm font-medium mb-3 text-[color:var(--brand-dark)]">Recent Achievements</div>
          <ul className="space-y-2">
            <li className="panel p-3">🔥 Study Streak – 7 days in a row</li>
            <li className="panel p-3">🧠 Focus Master – 95% focus score</li>
            <li className="panel p-3">🌅 Early Bird – Started before 8 AM</li>
            <li className="panel p-3">✅ Task Crusher – 20 tasks completed</li>
          </ul>
        </div>
      </div>

      {/* AI Study Insights */}
      <div className="panel p-6 bg-app-gradient/20">
        <h3 className="text-lg font-semibold text-[color:var(--brand-dark)] mb-2">AI Study Insights</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium">Peak Performance:</div>
            <p className="opacity-80">
              Your focus peaks on weekends (95% avg). Consider scheduling challenging topics like Advanced Mathematics
              during these high-performance periods.
            </p>
          </div>
          <div>
            <div className="font-medium">Improvement Area:</div>
            <p className="opacity-80">
              Thursday shows consistent low performance. Try adjusting your sleep schedule or reducing workload on
              Wednesday evenings.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
