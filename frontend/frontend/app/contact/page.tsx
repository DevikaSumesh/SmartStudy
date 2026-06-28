"use client"
import { Navbar } from "@/components/site/navbar"
import type React from "react"

import { Footer } from "@/components/site/footer"
import { useState } from "react"

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would send the form data to a backend
    setSubmitted(true)
    setForm({ name: "", email: "", message: "" })
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <>
      <Navbar />
      <section className="container-max py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-[color:var(--brand-dark)]">Get in Touch</h1>
            <p className="text-lg text-[color:var(--ink)]/80 max-w-2xl">
              Have questions about Smart Study? We'd love to hear from you. Our team is here to help and will respond to
              your message as soon as possible.
            </p>
          </div>

          {/* Contact Form */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="panel p-8 space-y-6">
              <h2 className="text-2xl font-bold text-[color:var(--brand-dark)]">Send us a Message</h2>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-semibold text-[color:var(--ink)] mb-2">Your Name</label>
                  <input
                    placeholder="John Doe"
                    className="w-full rounded-lg border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-[color:var(--brand)]"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[color:var(--ink)] mb-2">Your Email</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className="w-full rounded-lg border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-[color:var(--brand)]"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[color:var(--ink)] mb-2">Message</label>
                  <textarea
                    placeholder="Tell us how we can help..."
                    className="w-full rounded-lg border border-black/10 px-4 py-3 min-h-40 outline-none focus:ring-2 focus:ring-[color:var(--brand)]"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary w-full py-3">
                  Send Message
                </button>
                {submitted && (
                  <p className="text-green-600 text-sm font-medium">Thank you! We'll get back to you soon.</p>
                )}
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="panel p-6 space-y-3">
                <h3 className="text-xl font-bold text-[color:var(--brand-dark)]">Email</h3>
                <p className="text-[color:var(--ink)]/80">support@smartstudy.com</p>
                <p className="text-sm text-[color:var(--ink)]/60">We typically respond within 24 hours</p>
              </div>
              <div className="panel p-6 space-y-3">
                <h3 className="text-xl font-bold text-[color:var(--brand-dark)]">Phone</h3>
                <p className="text-[color:var(--ink)]/80">+91 9098131550</p>
                <p className="text-sm text-[color:var(--ink)]/60">Monday - Friday, 9 AM - 6 PM IST</p>
              </div>
              <div className="panel p-6 space-y-3">
                <h3 className="text-xl font-bold text-[color:var(--brand-dark)]">Location</h3>
                <p className="text-[color:var(--ink)]/80">Kochi, Kerala, India</p>
                <p className="text-sm text-[color:var(--ink)]/60">Serving students worldwide</p>
              </div>
              <div className="panel p-6 space-y-3 bg-[color:var(--brand)]/5">
                <h3 className="text-xl font-bold text-[color:var(--brand-dark)]">FAQ</h3>
                <p className="text-[color:var(--ink)]/80 text-sm">
                  Check out our frequently asked questions to find quick answers to common questions about Smart Study.
                </p>
                <a href="#" className="text-[color:var(--brand)] font-semibold text-sm hover:underline">
                  View FAQ →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
