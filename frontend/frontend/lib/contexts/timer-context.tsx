// contexts/timer-context.tsx
'use client';

import React, { createContext, useContext, useState, useCallback } from 'react'

interface TimerContextType {
  elapsedSeconds: number
  timerStatus: 'idle' | 'running' | 'paused'
  activeTaskId: string | null
  setTimerStatus: (status: 'idle' | 'running' | 'paused') => void
  setElapsedSeconds: (seconds: number | ((prev: number) => number)) => void
  setActiveTaskId: (taskId: string | null) => void
  resetTimer: () => void
  completeTask: () => Promise<void> // Added this
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [timerStatus, setTimerStatus] = useState<'idle' | 'running' | 'paused'>('idle')
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)

  const resetTimer = useCallback(() => {
    setElapsedSeconds(0)
    setTimerStatus('idle')
  }, [])

  // NEW: Function to mark task as done in the database
  const completeTask = useCallback(async () => {
    if (!activeTaskId) return;
    try {
      const response = await fetch(`/api/calendar/events/${activeTaskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true, actualDuration: elapsedSeconds }),
      });
      if (response.ok) {
        resetTimer();
        setActiveTaskId(null);
        alert("Task marked as completed!");
      }
    } catch (err) {
      console.error("Failed to complete task:", err);
    }
  }, [activeTaskId, elapsedSeconds, resetTimer]);

  return (
    <TimerContext.Provider
      value={{
        elapsedSeconds,
        timerStatus,
        activeTaskId,
        setTimerStatus,
        setElapsedSeconds,
        setActiveTaskId,
        resetTimer,
        completeTask, // Exposed to UI
      }}
    >
      {children}
    </TimerContext.Provider>
  )
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) throw new Error('useTimer must be used within TimerProvider');
  return context;
}