'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Trash2, X, MessageCircle } from 'lucide-react'
import useSWR from 'swr'

interface ChatSession {
  _id: string
  title: string
  created_at: string
  preview?: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

interface ChatSidebarProps {
  onClose?: () => void
}

export function ChatSidebar({ onClose }: ChatSidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Mock data for chat history - in real app, fetch from backend
  useEffect(() => {
    setSessions([
      {
        _id: '1',
        title: 'Calculus Review',
        created_at: new Date().toISOString(),
        preview: 'What are the main rules of derivatives?',
      },
      {
        _id: '2',
        title: 'Physics Problems',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        preview: 'Explain quantum entanglement...',
      },
      {
        _id: '3',
        title: 'Essay Outlining',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        preview: 'Help me structure my essay on...',
      },
    ])
  }, [])

  const handleNewChat = async () => {
    try {
      await axios.post('http://127.0.0.1:8000/api/chat/clear', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // CRITICAL FIX: Empty the array so the old messages disappear from the screen
      setMessages([]); 
      
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
  };

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSessions(sessions.filter((s) => s._id !== id))
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="w-64 bg-[#242424] border-r border-gray-700 flex flex-col">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h2 className="font-semibold text-white text-sm">Chat History</h2>
        <button
          onClick={onClose}
          className="md:hidden p-1 hover:bg-gray-700 rounded transition-colors"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-b border-gray-700">
        <Button
          onClick={handleNewChat}
          className="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white flex items-center justify-center gap-2 rounded-lg"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Chat Sessions */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {sessions.map((session) => (
            <div
              key={session._id}
              onClick={() => setSelectedId(session._id)}
              className={`p-3 rounded-lg cursor-pointer transition-all group ${
                selectedId === session._id
                  ? 'bg-gray-700 border border-teal-600'
                  : 'bg-[#2a2a2a] hover:bg-gray-700 border border-gray-700'
              }`}
            >
              <div className="flex items-start gap-2 mb-1">
                <MessageCircle className="h-4 w-4 text-teal-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white truncate">
                    {session.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatTime(session.created_at)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-400 line-clamp-2 mb-2 pl-6">
                {session.preview}
              </p>
              <button
                onClick={(e) => handleDeleteChat(session._id, e)}
                className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-300 transition-all flex items-center gap-1 ml-6"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Sidebar Footer */}
      <div className="border-t border-gray-700 p-4 space-y-2 text-xs text-gray-500">
        <p>AI-powered answers from your study materials</p>
      </div>
    </div>
  )
}
