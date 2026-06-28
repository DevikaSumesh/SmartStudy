"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Home" },
  { href: "/feature", label: "Feature" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleGetStarted = () => {
    router.push("/login")
  }

  return (
    <header className="w-full sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-black/10">
      <div className="container-max flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span aria-hidden className="text-2xl">
            🖋️
          </span>
          <span className="font-semibold text-xl tracking-wide text-white">
            Smart<span className="opacity-80">Study</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn("text-white/80 hover:text-white transition", pathname === l.href && "text-white")}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-outline hidden sm:inline-flex bg-white/10 text-white border-white/30">
            Login
          </Link>
          <button onClick={handleGetStarted} className="btn-primary">
            Get Started
          </button>
        </div>
      </div>
    </header>
  )
}
