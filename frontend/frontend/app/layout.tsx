import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { AuthProvider } from "@/hooks/use-auth"
import { TimerProvider } from "@/lib/contexts/timer-context" 
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "SmartStudy - AI Planner",
  description: "Organize your studies with AI",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          {/* 2. Wrap children with TimerProvider inside AuthProvider */}
          <TimerProvider>
            {children}
            <Toaster position="top-center" richColors />
          </TimerProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}