import { Navbar } from "@/components/site/navbar"
import { Footer } from "@/components/site/footer"

export default function Feature() {
  return (
    <>
      <Navbar />
      <section className="container-max py-16">
        <div className="space-y-16">
          {/* Hero Section */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-[color:var(--brand-dark)]">
              Powerful Features for Better Learning
            </h1>
            <p className="text-lg text-[color:var(--ink)]/80 max-w-2xl">
              Smart Study combines AI intelligence with proven study techniques to help you learn faster, retain more,
              and achieve your academic goals.
            </p>
          </div>

          {/* Feature 1: Adaptive Planner */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-[color:var(--brand-dark)]">Adaptive Study Planner</h2>
              <p className="text-[color:var(--ink)]/80 leading-relaxed">
                Our AI-powered planner automatically creates personalized study schedules based on your sleep patterns,
                focus capacity, and learning goals. No more guessing what to study or when.
              </p>
              <ul className="space-y-3 text-[color:var(--ink)]/80">
                <li className="flex items-start gap-3">
                  <span className="text-[color:var(--brand)] font-bold">✓</span>
                  <span>Automatically reshuffles study blocks based on your sleep and focus score</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[color:var(--brand)] font-bold">✓</span>
                  <span>Adapts to your energy levels throughout the day</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[color:var(--brand)] font-bold">✓</span>
                  <span>Prevents burnout with intelligent break scheduling</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[color:var(--brand)] font-bold">✓</span>
                  <span>Learns from your study patterns to improve recommendations</span>
                </li>
              </ul>
            </div>
            <div className="panel p-6 bg-[color:var(--brand)]/5">
              <img src="/adaptive-study-planner-interface.jpg" alt="Adaptive Planner" className="rounded-lg w-full" />
            </div>
          </div>

          {/* Feature 2: AI Assistant */}
          <div className="grid md:grid-cols-2 gap-8 items-center md:grid-flow-dense">
            <div className="panel p-6 bg-[color:var(--brand)]/5">
              <img src="/ai-study-assistant-robot.jpg" alt="AI Assistant" className="rounded-lg w-full" />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-[color:var(--brand-dark)]">Intelligent Study Assistant</h2>
              <p className="text-[color:var(--ink)]/80 leading-relaxed">
                Your personal AI tutor that helps you understand concepts, create study materials, and prepare for
                exams. Ask anything and get instant, personalized help.
              </p>
              <ul className="space-y-3 text-[color:var(--ink)]/80">
                <li className="flex items-start gap-3">
                  <span className="text-[color:var(--brand)] font-bold">✓</span>
                  <span>Generate summaries, flashcards, and quiz questions instantly</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[color:var(--brand)] font-bold">✓</span>
                  <span>Explain complex concepts in simple, understandable language</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[color:var(--brand)] font-bold">✓</span>
                  <span>Create practice tests tailored to your learning level</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[color:var(--brand)] font-bold">✓</span>
                  <span>Available 24/7 to answer your study questions</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 3: Progress Tracking */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-[color:var(--brand-dark)]">Progress Insights & Analytics</h2>
              <p className="text-[color:var(--ink)]/80 leading-relaxed">
                Track your learning journey with detailed analytics. Understand your strengths, identify areas for
                improvement, and celebrate your progress.
              </p>
              <ul className="space-y-3 text-[color:var(--ink)]/80">
                <li className="flex items-start gap-3">
                  <span className="text-[color:var(--brand)] font-bold">✓</span>
                  <span>Real-time progress tracking across all subjects</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[color:var(--brand)] font-bold">✓</span>
                  <span>Detailed performance analytics and insights</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[color:var(--brand)] font-bold">✓</span>
                  <span>Identify weak areas and get targeted recommendations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[color:var(--brand)] font-bold">✓</span>
                  <span>Visualize your improvement over time</span>
                </li>
              </ul>
            </div>
            <div className="panel p-6 bg-[color:var(--brand)]/5">
              <img src="/progress-analytics-dashboard-charts.jpg" alt="Progress Tracking" className="rounded-lg w-full" />
            </div>
          </div>

          {/* CTA Section */}
          <div className="panel p-8 md:p-12 bg-gradient-to-r from-[color:var(--brand)] to-[color:var(--brand-dark)] text-white text-center space-y-4">
            <h2 className="text-3xl font-bold">Ready to Transform Your Study Experience?</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Join thousands of students who are already studying smarter with Smart Study. Start for free today.
            </p>
            <a
              href="/login"
              className="btn-primary bg-white text-[color:var(--brand)] hover:bg-white/90 inline-flex mt-4"
            >
              Get Started Now
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
