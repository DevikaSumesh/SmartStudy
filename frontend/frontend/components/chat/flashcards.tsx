'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, RotateCcw } from 'lucide-react'
import axios from 'axios'

interface Flashcard {
  front: string
  back: string
}

interface FlashcardsProps {
  documentsUpdated?: boolean
}

export function Flashcards({ documentsUpdated }: FlashcardsProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [error, setError] = useState('')

  const generateFlashcards = async () => {
    setLoading(true); 
    setError(''); // Clear any old errors
    
    try {
      // CRITICAL FIX: Your app uses 'access_token', not 'token'!
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      
      const response = await axios.post('http://localhost:8000/api/chat/flashcards', {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setFlashcards(response.data);
        setCurrentIndex(0); // FIXED: Matches your actual state name
        setIsFlipped(false); // Reset flip state for the new cards
      } else {
        setError("No flashcards could be generated. Try re-uploading the document.");
      }
    } catch (err) {
      console.error("Error generating flashcards:", err);
      setError("Failed to generate flashcards. Make sure a document is uploaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFlashcards([])
    setCurrentIndex(0)
    setIsFlipped(false)
  }, [documentsUpdated])

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">No Flashcards Yet</h3>
          <p className="text-gray-400 mb-8 max-w-md">Upload documents first, then generate flashcards.</p>
        </div>
        <Button onClick={generateFlashcards} disabled={loading} className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white">
          {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</> : 'Generate Flashcards'}
        </Button>
        {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
      </div>
    )
  }

  const currentCard = flashcards[currentIndex]

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center">
        <p className="text-sm text-gray-400 mb-3">Card {currentIndex + 1} of {flashcards.length}</p>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-300" style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }} />
        </div>
      </div>

      <div onClick={() => setIsFlipped(!isFlipped)} className="h-80 bg-gradient-to-br from-teal-600 to-teal-500 rounded-2xl p-8 flex items-center justify-center cursor-pointer transform transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl">
        <div className="text-center text-white">
          <p className="text-xs uppercase tracking-widest opacity-75 mb-6">{isFlipped ? 'Answer' : 'Question'}</p>
          <p className="text-3xl font-semibold leading-relaxed mb-8">{isFlipped ? currentCard.back : currentCard.front}</p>
          <p className="text-xs opacity-60 animate-pulse">Click to flip</p>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Button onClick={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setIsFlipped(false) }} disabled={currentIndex === 0} className="bg-gray-700 hover:bg-gray-600 text-white">Previous</Button>
        <Button onClick={() => setIsFlipped(!isFlipped)} className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white">{isFlipped ? 'Show Question' : 'Show Answer'}</Button>
        <Button onClick={() => { setCurrentIndex(Math.min(flashcards.length - 1, currentIndex + 1)); setIsFlipped(false) }} disabled={currentIndex === flashcards.length - 1} className="bg-gray-700 hover:bg-gray-600 text-white">Next</Button>
      </div>

      <div className="flex justify-center pt-4 border-t border-gray-700">
        <Button onClick={generateFlashcards} className="gap-2 bg-gray-700 hover:bg-gray-600 text-white"><RotateCcw className="h-4 w-4" />Generate New Set</Button>
      </div>
    </div>
  )
}