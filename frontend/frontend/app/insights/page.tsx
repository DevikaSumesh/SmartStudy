import { Navbar } from "@/components/site/navbar"
import { Footer } from "@/components/site/footer"
import { QuickActions } from "@/components/site/quick-actions"
import { InsightsDashboard } from "@/components/insights/insight-dashboard"

export default function Insights() {
  return (
    <>
      <Navbar />
      <section className="container-max py-10">
        <InsightsDashboard />
      </section>
      <QuickActions />
      <Footer />
    </>
  )
}
