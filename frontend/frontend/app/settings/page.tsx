"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { focusApi } from "@/lib/api"
import { Settings, Brain, Zap, AlertCircle } from "lucide-react"

export default function SettingsPage() {
  const [isRetraining, setIsRetraining] = useState(false)

  const handleRetrain = async () => {
    setIsRetraining(true)
    try {
      const result = await focusApi.retrainModel()
      toast.success("AI model retrained successfully with all historical data")
      console.log("[v0] Retrain result:", result)
    } catch (error) {
      toast.error("Failed to retrain AI model")
      console.error("[v0] Retrain error:", error)
    } finally {
      setIsRetraining(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="h-8 w-8 text-indigo-600" />
            Settings
          </h1>
          <p className="text-slate-500 mt-2">Manage your AI Study Planner preferences</p>
        </header>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* AI Model Section */}
          <Card className="p-6 border-indigo-200 bg-gradient-to-br from-indigo-50 to-transparent">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-600 rounded-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">AI Model Training</h2>
                  <p className="text-slate-600 mt-1">
                    The AI model learns from your focus sessions to create better schedules. Retrain the model to
                    incorporate all your historical data.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <span>Retraining uses all task switching and completion data to improve schedule accuracy</span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleRetrain}
              disabled={isRetraining}
              className="mt-6 bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              {isRetraining ? "Retraining..." : "Retrain AI Model"}
            </Button>
          </Card>

          {/* Information Section */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">How Retraining Works</h3>
            <div className="space-y-3 text-slate-600">
              <div>
                <h4 className="font-medium text-slate-900">Data Collection</h4>
                <p>Every time you complete a focus session or switch tasks, the system records:</p>
                <ul className="list-disc list-inside ml-2 text-sm mt-1">
                  <li>Your current mood, energy, and stress levels</li>
                  <li>Actual time spent vs. scheduled time</li>
                  <li>Task completion and performance metrics</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-slate-900">Reward Calculation</h4>
                <p>Rewards are calculated using: R = (0.5 × Completion) + (0.3 × Performance) - (0.2 × Stress)</p>
                <p className="text-sm mt-1">
                  This weighted formula ensures the AI learns what works best for your wellbeing and productivity.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-slate-900">Model Improvement</h4>
                <p>
                  When you click "Retrain AI Model", all your historical data is fed to the PPO (Proximal Policy
                  Optimization) agent, which learns better scheduling decisions for your unique study patterns.
                </p>
              </div>
            </div>
          </Card>

          {/* Stats Section */}
          <Card className="p-6 bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Model Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Total Training Data Points</p>
                <p className="text-2xl font-bold text-slate-900">-</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Last Trained</p>
                <p className="text-2xl font-bold text-slate-900">-</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
