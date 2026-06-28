// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("access_token")
}

export function setAuthToken(token: string) {
  localStorage.setItem("access_token", token)
}

export function removeAuthToken() {
  localStorage.removeItem("access_token")
}

export function getUserId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("user_id")
}

export function setUserId(userId: string) {
  localStorage.setItem("user_id", userId)
}

export async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken()

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  })

  return response
}

export const authApi = {
  signup: async (data: { full_name: string; email: string; password: string }) => {
    const response = await apiRequest("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Signup failed")
    }
    return response.json()
  },
  login: async (data: { email: string; password: string }) => {
    const response = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Login failed")
    }
    return response.json()
  },
}

export const taskApi = {
  getTasks: async () => {
    const response = await apiRequest("/api/tasks/")
    if (!response.ok) throw new Error("Failed to fetch tasks")
    return response.json()
  },
  createTask: async (data: any) => {
    const sanitizedData = {
      ...data,
      due_date: data.due_date && data.due_date.trim() !== "" ? data.due_date : null
    };
    const response = await apiRequest("/api/tasks/", {
      method: "POST",
      body: JSON.stringify(sanitizedData),
    })
    if (!response.ok) throw new Error("Failed to create task")
    return response.json()
  },
  updateTask: async (taskId: string, data: any) => {
    const sanitizedData = { ...data };
    if (data.due_date !== undefined) {
      sanitizedData.due_date = data.due_date && data.due_date.trim() !== "" ? data.due_date : null;
    }
    const response = await apiRequest(`/api/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(sanitizedData),
    })
    if (!response.ok) throw new Error("Failed to update task")
    return response.json()
  },
  deleteTask: async (taskId: string) => {
    const response = await apiRequest(`/api/tasks/${taskId}`, { method: "DELETE" })
    if (!response.ok) throw new Error("Failed to delete task")
  },
}

export const moodApi = {
  createMoodEntry: async (data: any) => {
    const response = await apiRequest("/api/mood/", {
      method: "POST",
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to log mood")
    return response.json()
  },
  getMoodEntries: async (startDate?: string, endDate?: string) => {
    let url = "/api/mood/"
    if (startDate && endDate) url += `?start_date=${startDate}&end_date=${endDate}`
    const response = await apiRequest(url)
    if (!response.ok) throw new Error("Failed to fetch mood entries")
    return response.json()
  },
  getLatestMood: async () => {
    const response = await apiRequest("/api/mood/latest")
    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error("Failed to fetch latest mood")
    }
    return response.json()
  },
}

export const sleepApi = {
  createSleepLog: async (data: any) => {
    const response = await apiRequest("/api/sleep/", {
      method: "POST",
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to log sleep")
    return response.json()
  },
  getSleepLogs: async (startDate?: string, endDate?: string) => {
    let url = "/api/sleep/"
    if (startDate && endDate) url += `?start_date=${startDate}&end_date=${endDate}`
    const response = await apiRequest(url)
    if (!response.ok) throw new Error("Failed to fetch sleep logs")
    return response.json()
  },
  getLatestSleep: async () => {
    const response = await apiRequest("/api/sleep/latest")
    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error("Failed to fetch latest sleep")
    }
    return response.json()
  },
}

export const pomodoroApi = {
  startSession: async (data: any) => {
    const response = await apiRequest("/api/pomodoro/", {
      method: "POST",
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to start session")
    return response.json()
  },
  updateSession: async (sessionId: string, data: any) => {
    const response = await apiRequest(`/api/pomodoro/${sessionId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to update session")
    return response.json()
  },
  getSessions: async () => {
    const response = await apiRequest("/api/pomodoro/")
    if (!response.ok) throw new Error("Failed to fetch sessions")
    return response.json()
  },
  getStats: async () => {
    const response = await apiRequest("/api/pomodoro/stats")
    if (!response.ok) throw new Error("Failed to fetch stats")
    return response.json()
  },
}

export const calendarApi = {
  getEvents: async (startDate?: string, endDate?: string) => {
    let url = "/api/calendar/events"
    if (startDate && endDate) {
      const params = new URLSearchParams({
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
      })
      url += `?${params.toString()}`
    }
    try {
      const response = await apiRequest(url)
      if (!response.ok) throw new Error(`Calendar API error`)
      const events = await response.json()
      return Array.isArray(events) ? events.map((e: any) => ({ ...e, id: e.id || e._id })) : []
    } catch (error) {
      throw error
    }
  },
  createEvent: async (data: any) => {
    const response = await apiRequest("/api/calendar/events", {
      method: "POST",
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to create event")
    const event = await response.json()
    return { ...event, id: event.id || event._id }
  },
}

// --- THIS IS THE CRITICAL SECTION FOR THE CHATBOT ---
export const aiApi = {
  generateSchedule: async () => {
    const response = await apiRequest("/api/rl-scheduler/generate-schedule", {
      method: "POST",
      body: JSON.stringify({ current_time: new Date().toISOString() })
    })
    if (!response.ok) throw new Error("Failed to generate schedule")
    return response.json()
  },
  chat: async (question: string) => {
    const response = await apiRequest("/api/chat/message", {
      method: "POST",
      body: JSON.stringify({ question }),
    });
    if (!response.ok) throw new Error("Chat failed");
    return response.json();
  },
  getChatHistory: async () => {
    const response = await apiRequest("/api/chat/history");
    if (!response.ok) throw new Error("Failed to fetch chat history");
    return response.json();
  },
  uploadDocs: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file); // Must match FastAPI "file" parameter
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/chat/upload`, {
      method: "POST",
      body: formData,
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Upload failed");
    return response.json();
  },
  getDocuments: async () => {
    const response = await apiRequest("/api/chat/documents");
    if (!response.ok) throw new Error("Failed to fetch documents");
    return response.json();
  },
  deleteDocument: async (docId: string) => {
    const response = await apiRequest(`/api/chat/documents/${docId}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Failed to delete document");
    return response.json();
  },
  getFlashcards: async () => {
    const response = await apiRequest("/api/chat/flashcards", { method: "POST" });
    if (!response.ok) throw new Error("Failed to generate flashcards");
    return response.json();
  },
}