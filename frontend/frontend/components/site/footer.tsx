import Link from "next/link"

export function Footer() {
  return (
    <footer className="mt-24 bg-[color:var(--brand-dark)] text-white/90">
      <div className="container-max grid gap-10 py-12 md:grid-cols-4">
        <div>
          <div className="text-xl font-semibold mb-3 flex items-center gap-2">
            <span>🖋️</span>
            <span>Smart Study</span>
          </div>
          <p className="text-sm text-white/70">
            An AI‑powered study planner that personalizes your schedule based on sleep, focus & productivity.
          </p>
          <div className="flex gap-4 mt-4">
            <a href="#" className="text-white/60 hover:text-white transition">
              Twitter
            </a>
            <a href="#" className="text-white/60 hover:text-white transition">
              LinkedIn
            </a>
            <a href="#" className="text-white/60 hover:text-white transition">
              Instagram
            </a>
          </div>
        </div>
        <div>
          <div className="font-semibold mb-3">Quick Links</div>
          <ul className="space-y-2 text-white/80">
            <li>
              <Link href="/" className="hover:text-white transition">
                Home
              </Link>
            </li>
            <li>
              <Link href="/feature" className="hover:text-white transition">
                Features
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white transition">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white transition">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">Study Tools</div>
          <ul className="space-y-2 text-white/80">
            <li>
              <Link href="/dashboard" className="hover:text-white transition">
                Study Scheduler
              </Link>
            </li>
            <li>
              <Link href="/pomodoro" className="hover:text-white transition">
                Pomodoro
              </Link>
            </li>
            <li>
              <Link href="/insights" className="hover:text-white transition">
                Progress Insights
              </Link>
            </li>
            <li>
              <Link href="/chat" className="hover:text-white transition">
                AI Assistant
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">Contact Us</div>
          <ul className="space-y-2 text-white/80">
            <li>
              <a href="mailto:support@smartstudy.com" className="hover:text-white transition">
                support@smartstudy.com
              </a>
            </li>
            <li>
              <a href="tel:+919098131550" className="hover:text-white transition">
                +91 9098131550
              </a>
            </li>
            <li>Kochi, Kerala</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-max py-4 text-sm text-white/60 flex flex-col md:flex-row items-center justify-between gap-4">
          <span>© Smart Study. All rights reserved</span>
          <nav className="flex items-center gap-4">
            <a href="#" className="hover:text-white transition">
              Privacy policy
            </a>
            <a href="#" className="hover:text-white transition">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition">
              Cookie policy
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
