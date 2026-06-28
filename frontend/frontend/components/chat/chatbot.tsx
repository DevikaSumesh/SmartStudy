'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Loader2, AlertCircle, Sparkles } from 'lucide-react'
import useSWR from 'swr'
import { aiApi } from '@/lib/api'

interface Message {
  _id: string
  message: string
  response: string
  context_used: string[]
  created_at: string
  role: string
}

// Fetch directly via aiApi
const fetcher = async () => await aiApi.getChatHistory()

export function ChatBox() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: history = [], mutate } = useSWR('chatHistory', fetcher)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setLoading(true)
    setError('')

    try {
      // Direct call to FastAPI!
      await aiApi.chat(input)
      setInput('')
      await mutate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('[v0] Chat error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a]">
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-200 mb-2">Start a new conversation</h2>
            <p className="text-gray-400 max-w-md">
              Upload your study materials and ask questions to get AI-powered answers backed by your documents.
            </p>
          </div>
        ) : (
          history.map((msg: Message) => (
            <div key={msg._id} className="space-y-4">
              <div className="flex justify-end">
                <div className="max-w-2xl">
                  <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-2xl px-6 py-3 shadow-lg">
                    <p className="text-base leading-relaxed">{msg.message}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">You</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-2xl">
                  <div className="bg-[#2a2a2a] border border-gray-700 text-gray-100 rounded-2xl px-6 py-3">
                    <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.response}</p>
                    {msg.context_used && msg.context_used.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        <p className="text-xs font-semibold text-gray-400 mb-2">Sources used:</p>
                        <ul className="text-xs text-gray-400 space-y-1">
                          {msg.context_used.slice(0, 2).map((source, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-teal-400">•</span>
                              <span>{source}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Assistant</p>
                </div>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-2xl">
              <div className="bg-[#2a2a2a] border border-gray-700 text-gray-100 rounded-2xl px-6 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
                  <span className="text-sm">Assistant is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 p-3 bg-red-900/20 text-red-400 rounded-lg border border-red-800">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      <div className="border-t border-gray-700 bg-[#1a1a1a] px-6 py-4">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a question about your documents..." disabled={loading} className="flex-1 bg-[#2a2a2a] border-gray-700 text-white placeholder-gray-500 rounded-full px-4 py-2 focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
          <Button type="submit" disabled={loading || !input.trim()} className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white rounded-full p-2 h-10 w-10">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}