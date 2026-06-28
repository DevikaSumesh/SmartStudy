"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Calendar, 
  BarChart3, 
  Timer, 
  ListTodo, 
  LogOut, 
  MessageSquare 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

export function Sidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/tasks", label: "Tasks", icon: ListTodo },
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/chat", label: "AI Assistant", icon: MessageSquare }, 
    { href: "/focus", label: "Focus", icon: Timer },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
  ]

  return (
    <aside className="w-64 bg-white border-r border-black/10 h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-black/10">
        <h1 className="text-2xl font-bold text-brand-dark">SmartStudy</h1>
        <p className="text-sm text-ink/60">AI-based Study Planner</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-panel transition-all duration-200 ${
                  isActive 
                    ? "bg-brand text-white shadow-md" 
                    : "text-ink/70 hover:bg-black/5 hover:text-brand"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-brand"}`} />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-black/10">
        <Button
          onClick={logout}
          variant="ghost"
          className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-panel transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </Button>
      </div>
    </aside>
  )
}