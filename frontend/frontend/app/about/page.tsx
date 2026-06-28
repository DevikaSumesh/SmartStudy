import { Navbar } from "@/components/site/navbar"
import { Footer } from "@/components/site/footer"

export default function About() {
  return (
    <>
      <Navbar />
      <section className="container-max py-16">
        <div className="space-y-12">
          {/* Hero Section */}
          <div className="panel p-8 md:p-12 space-y-4 bg-gradient-to-r from-[color:var(--brand)]/10 to-[color:var(--brand-dark)]/10">
            <h1 className="text-4xl md:text-5xl font-bold text-[color:var(--brand-dark)]">About Smart Study</h1>
            <p className="text-lg text-[color:var(--ink)]/80 max-w-2xl">
              We're revolutionizing how students learn by combining AI-powered personalization with evidence-based study
              techniques.
            </p>
          </div>

          {/* Mission Section */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-[color:var(--brand-dark)]">Our Mission</h2>
              <p className="text-[color:var(--ink)]/80 leading-relaxed">
                We believe every student deserves a personalized learning experience that adapts to their unique rhythm,
                sleep patterns, and focus capacity. Smart Study eliminates the guesswork from study planning by using AI
                to create adaptive schedules that work with your body and mind, not against them.
              </p>
              <p className="text-[color:var(--ink)]/80 leading-relaxed">
                Our goal is to help students achieve better grades, retain more knowledge, and maintain their mental
                health—all without the stress and burnout that traditional study methods often cause.
              </p>
            </div>
            <div className="panel p-8 bg-[color:var(--brand)]/5 space-y-4">
              <h3 className="text-xl font-semibold text-[color:var(--brand-dark)]">Key Statistics</h3>
              <ul className="space-y-3 text-[color:var(--ink)]/80">
                <li className="flex items-start gap-3">
                  <span className="text-[color:var(--brand)] font-bold">→</span>
                  <span>Students using Smart Study improve their grades by an average of 15%</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[color:var(--brand)] font-bold">→</span>
                  <span>40% reduction in study-related stress and anxiety</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[color:var(--brand)] font-bold">→</span>
                  <span>Used by 50,000+ students across 100+ countries</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[color:var(--brand)] font-bold">→</span>
                  <span>95% user satisfaction rate</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Values Section */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[color:var(--brand-dark)]">Our Core Values</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="panel p-6 space-y-3">
                <h3 className="text-xl font-semibold text-[color:var(--brand)]">Personalization</h3>
                <p className="text-[color:var(--ink)]/80">
                  Every student is unique. We use advanced AI to create study plans tailored to your individual learning
                  style, sleep schedule, and academic goals.
                </p>
              </div>
              <div className="panel p-6 space-y-3">
                <h3 className="text-xl font-semibold text-[color:var(--brand)]">Privacy First</h3>
                <p className="text-[color:var(--ink)]/80">
                  Your data is yours. We never sell your information and use end-to-end encryption to protect your study
                  data and personal information.
                </p>
              </div>
              <div className="panel p-6 space-y-3">
                <h3 className="text-xl font-semibold text-[color:var(--brand)]">Accessibility</h3>
                <p className="text-[color:var(--ink)]/80">
                  Quality education tools shouldn't be expensive. Smart Study is free for all students and works
                  seamlessly on mobile and desktop.
                </p>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="panel p-8 md:p-12 bg-gradient-to-r from-[color:var(--brand-dark)]/5 to-[color:var(--brand)]/5 space-y-6">
            <h2 className="text-3xl font-bold text-[color:var(--brand-dark)]">Built by Educators & Technologists</h2>
            <p className="text-[color:var(--ink)]/80 leading-relaxed max-w-3xl">
              Smart Study was founded by a team of educators, neuroscientists, and software engineers who are passionate
              about improving education. We combine cutting-edge AI technology with evidence-based learning science to
              create tools that actually work.
            </p>
            <p className="text-[color:var(--ink)]/80 leading-relaxed max-w-3xl">
              Our team includes former teachers, published researchers in cognitive psychology, and engineers from
              leading tech companies. We're committed to continuously improving Smart Study based on user feedback and
              the latest research in learning science.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
