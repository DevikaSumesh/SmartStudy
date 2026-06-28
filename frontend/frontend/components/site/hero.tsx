import Link from "next/link"

export function Hero() {
  return (
    <section
      className="relative w-full min-h-[600px] md:min-h-[700px] flex items-center justify-start overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(16,74,84,0.75) 50%, rgba(20,184,166,0.6) 100%), url('/images/home_img1.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center right",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="container-max relative z-10 py-20 md:py-32 max-w-2xl">
        <h1 className="text-balance text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
          Focus. Adapt. Achieve
        </h1>

        <p className="text-pretty mt-6 text-white/90 text-lg md:text-xl leading-relaxed">
          An AI-powered study planner that personalizes your schedule based on sleep, focus & productivity.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/dashboard" className="btn-primary px-8 py-3 text-base font-medium">
            Try the planner
          </Link>
          <Link
            href="/about"
            className="btn-outline bg-white/20 text-white border-white/40 hover:bg-white/30 px-8 py-3 text-base font-medium"
          >
            How it works
          </Link>
        </div>

        <p className="mt-6 text-white/70 text-sm md:text-base">
          No downloads needed. Works on mobile & desktop. Free for students.
        </p>
      </div>
    </section>
  )
}
