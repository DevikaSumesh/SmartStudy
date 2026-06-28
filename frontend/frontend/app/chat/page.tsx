'use client'

import { useState } from 'react'
import { ChatBox } from '@/components/chat/chatbox'
import { ChatSidebar } from '@/components/chat/chat-sidebar'
import { DocumentUploader } from '@/components/chat/document-uploader'
import { Flashcards } from '@/components/chat/flashcards'
import { MessageCircle, BookOpen, Lightbulb, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ChatPage() {
  const [activeView, setActiveView] = useState<'chat' | 'documents' | 'flashcards'>('chat')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [documentsUpdated, setDocumentsUpdated] = useState(false)

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex">
      {/* Left Sidebar */}
      {sidebarOpen && (
        <ChatSidebar onClose={() => setSidebarOpen(false)} />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Top Navigation Bar */}
        <div className="border-b border-gray-700 bg-[#242424] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="text-gray-400 hover:text-white"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <h1 className="text-lg font-semibold">SmartStudy Assistant</h1>
            </div>
          </div>

          {/* View Selector */}
          <div className="flex items-center gap-2">
            <Button
              variant={activeView === 'chat' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('chat')}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Chat</span>
            </Button>
            <Button
              variant={activeView === 'documents' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('documents')}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Documents</span>
            </Button>
            <Button
              variant={activeView === 'flashcards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('flashcards')}
              className="flex items-center gap-2"
            >
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Flashcards</span>
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeView === 'chat' && <ChatBox />}
          {activeView === 'documents' && (
            <div className="h-full overflow-auto p-6">
              <DocumentUploader
                onUploadSuccess={() => setDocumentsUpdated(!documentsUpdated)}
              />
            </div>
          )}
          {activeView === 'flashcards' && (
            <div className="h-full overflow-auto p-6">
              <Flashcards documentsUpdated={documentsUpdated} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
