'use client'

import React, { useState, useRef } from "react"
import { Button } from '@/components/ui/button'
import { Upload, FileText, Loader2, CheckCircle2, Trash2 } from 'lucide-react'
import useSWR from 'swr'

interface Document {
  _id: string
  filename: string
  chunk_count: number
  uploaded_at: string
}

interface UploaderProps {
  onUploadSuccess?: () => void
}

const fetcher = async (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("access_token") : null;
  const res = await fetch(`http://localhost:8000${url}`, {
    headers: token ? { "Authorization": `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export function DocumentUploader({ onUploadSuccess }: UploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  
  // Added useRef to reliably trigger the file input
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: documents = [], mutate } = useSWR('/api/chat/documents', fetcher)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Safer validation: checking the file extension instead of the mime type
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const validExtensions = ['pdf', 'txt', 'doc', 'docx']
    
    if (!validExtensions.includes(fileExtension || '')) {
      setError('Only PDF, TXT, DOC, and DOCX files are supported')
      return
    }

    setUploading(true)
    setError('')

    try {
      const token = localStorage.getItem("access_token");
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('http://localhost:8000/api/chat/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || 'Upload failed')
      }

      setUploadedFile(file.name)
      mutate()
      onUploadSuccess?.()
      
      // Clear the input so the same file can be uploaded again if needed
      if (fileInputRef.current) fileInputRef.current.value = ''

      setTimeout(() => setUploadedFile(null), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      console.error('[v0] Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const files = e.dataTransfer?.files
    if (files?.[0]) {
      const fakeEvent = { target: { files } } as React.ChangeEvent<HTMLInputElement>
      handleFileChange(fakeEvent)
    }
  }

  const handleDelete = async (docId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`http://localhost:8000/api/chat/documents/${docId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to delete')
      mutate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
          dragActive
            ? 'border-teal-500 bg-teal-500/10'
            : 'border-gray-600 bg-[#2a2a2a] hover:border-teal-500/50'
        }`}
      >
        <Upload className="h-12 w-12 text-teal-500 mx-auto mb-4" />
        <h3 className="font-semibold text-white mb-1 text-lg">Upload Study Materials</h3>
        <p className="text-sm text-gray-400 mb-6">Drag and drop PDF, TXT, DOC, or DOCX files here</p>

        {/* Separated the input and button to guarantee the click event fires */}
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange} 
          disabled={uploading} 
          className="hidden" 
          accept=".pdf,.txt,.doc,.docx" 
        />
        <Button 
          type="button" 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading} 
          className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white"
        >
          {uploading ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</>) : (<><Upload className="h-4 w-4 mr-2" />Choose File</>)}
        </Button>

        {uploadedFile && (
          <div className="mt-6 flex items-center justify-center gap-2 text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">{uploadedFile} uploaded successfully</span>
          </div>
        )}
        {error && <p className="mt-6 text-sm text-red-400">{error}</p>}
      </div>

      {documents.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-white text-lg">Uploaded Documents ({documents.length})</h3>
          <div className="space-y-3">
            {documents.map((doc: Document) => (
              <div key={doc._id} className="bg-[#2a2a2a] border border-gray-700 rounded-xl p-4 flex items-center justify-between hover:border-teal-600 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <FileText className="h-5 w-5 text-teal-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-white">{doc.filename}</p>
                    <p className="text-xs text-gray-400 mt-1">{doc.chunk_count} chunks • Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(doc._id)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}