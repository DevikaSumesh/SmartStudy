"use client"

import Link from "next/link"
import { LayoutGrid, Calendar, Clock, MessageSquare, FolderPlus, BarChart3, Menu, Edit3 } from "lucide-react"

export function QuickActions() {
  const actions = [
    { icon: <LayoutGrid size={22} />, href: "/dashboard", label: "Dashboard" },
    { icon: <Calendar size={22} />, href: "/calendar", label: "Calendar" },
    { icon: <Clock size={22} />, href: "/pomodoro", label: "Pomodoro" },
    { icon: <MessageSquare size={22} />, href: "/chat", label: "AI Chat" },
    { icon: <FolderPlus size={22} />, href: "/projects", label: "Projects" },
    { icon: <BarChart3 size={22} />, href: "/analytics", label: "Analytics" },
  ]

  return (
    <>
      {/* Left Sidebar Actions */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 w-20 flex flex-col items-center gap-6 py-8 bg-[color:var(--brand-dark)]/5 backdrop-blur-sm border-r border-black/5 rounded-r-3xl hidden lg:flex">
        <button
          type="button"
          aria-label="Toggle Menu"
          className="p-3 text-[color:var(--brand-dark)] hover:text-[color:var(--brand)] transition-colors"
        >
          <Menu size={24} />
        </button>
        <button
          type="button"
          aria-label="Quick Edit"
          className="p-3 text-[color:var(--brand-dark)] hover:text-[color:var(--brand)] transition-colors"
        >
          <Edit3 size={24} />
        </button>
      </div>

      {/* Right Sidebar Actions */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 w-16 bg-[color:var(--brand)]/20 backdrop-blur-md border-l border-white/20 rounded-l-2xl py-8 flex flex-col items-center gap-8 shadow-xl hidden lg:flex">
        {actions.map((action, i) => (
          <Link
            key={i}
            href={action.href}
            title={action.label}
            className="p-2 text-[color:var(--brand-dark)] hover:text-[color:var(--brand)] hover:scale-110 transition-all"
          >
            {action.icon}
          </Link>
        ))}
      </div>
    </>
  )
}
