"use client"

import { useEffect, useMemo, useRef, useCallback } from "react"
import { Play, Pause, RotateCcw, CheckCircle } from "lucide-react" // Added CheckCircle
import { useTimer } from "@/lib/contexts/timer-context" 
export function PomodoroTimerCard() {
  // Use the Context instead of local useState
  const { 
    elapsedSeconds, setElapsedSeconds, 
    timerStatus, setTimerStatus, 
    activeTaskId, completeTask, resetTimer 
  } = useTimer();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Logic: Timer counts UP for focus tracking, or DOWN for pomodoro
  // Here we will keep your countdown logic but sync it with Context
  useEffect(() => {
    if (timerStatus === "running") {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerStatus, setElapsedSeconds]);

  return (
    <div className="panel p-6 rounded-[var(--radius-panel)] bg-white shadow-xl">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Focus Timer</h2>
        
        {/* Progress Display */}
        <div className="text-5xl font-mono font-bold text-teal-600 mb-6">
          {Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')}:
          {(elapsedSeconds % 60).toString().padStart(2, '0')}
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          {timerStatus !== "running" ? (
            <button 
              className="bg-teal-600 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2"
              onClick={() => setTimerStatus("running")}
            >
              <Play size={18} /> Start
            </button>
          ) : (
            <button 
              className="bg-amber-500 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2"
              onClick={() => setTimerStatus("paused")}
            >
              <Pause size={18} /> Pause
            </button>
          )}

          <button 
            className="border border-slate-200 px-4 py-2 rounded-full hover:bg-slate-50"
            onClick={resetTimer}
          >
            <RotateCcw size={18} />
          </button>

          {/* THE NEW COMPLETE BUTTON */}
          {activeTaskId && (
            <button 
              className="bg-green-600 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2"
              onClick={completeTask}
            >
              <CheckCircle size={18} /> Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}