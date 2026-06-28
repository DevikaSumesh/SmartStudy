import { Navbar } from "@/components/site/navbar"
import { Hero } from "@/components/site/hero"
import { Footer } from "@/components/site/footer"
import Link from "next/link"

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />

      {/* Smart Assistant Section */}
      <section
        id="assistant"
        className="relative w-full py-20 md:py-28 bg-gradient-to-r from-[#0f172a] via-[#065f61] to-[#14b8a6]"
      >
        <div className="container-max relative z-10 max-w-6xl mx-auto px-6 md:px-10 text-white">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Left side: Robot image */}
            <div className="flex justify-center">
              <div className="bg-[#0f2c2f]/60 backdrop-blur-md rounded-2xl p-6 shadow-xl">
                <img
                  src="/images/assistant-robot.png"
                  alt="AI Study Assistant"
                  className="w-72 h-auto md:w-80"
                />
              </div>
            </div>

            {/* Right side: Text content */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                “Meet Your Smart Study Assistant”
              </h2>
              <p className="text-white/90 text-lg leading-relaxed mb-8">
                Got doubts? Ask away! Our smart assistant helps you stay on track by instantly clearing concepts,
                creating easy summaries, and organizing notes by module. It’s like having your personal tutor inside the
                app — anytime, anywhere.
              </p>

              <ul className="space-y-3 text-white/80 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-white font-bold">✓</span>
                  <span>Instant concept clarification and explanations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-white font-bold">✓</span>
                  <span>Generate summaries and study notes automatically</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-white font-bold">✓</span>
                  <span>Create flashcards and practice questions</span>
                </li>
              </ul>

              {/* Added spacing here */}
              <Link
                href="/chat"
                className="mt-8 inline-flex items-center gap-2 bg-white text-[color:var(--brand-dark)] hover:bg-gray-100 font-semibold px-6 py-3 rounded-full shadow-lg transition-all duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 12.75l8.954-8.955a.75.75 0 011.061 0l8.955 8.955M12 21.75V9.75"
                  />
                </svg>
                Talk to the Assistant now!
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
