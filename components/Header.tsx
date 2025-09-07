'use client'

import { BookOpen, Download, Mic, MicOff } from 'lucide-react'
import { useStory } from '@/context/StoryContext'
import { useState } from 'react'

export default function Header() {
  const { state, dispatch } = useStory()
  const [isListening, setIsListening] = useState(false)

  const handleExport = async () => {
    // TODO: Implement PDF export
    console.log('Exporting story as PDF...')
  }

  const handleSpeechToText = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser')
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      // TODO: Handle speech input for story creation
      console.log('Speech input:', transcript)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    if (isListening) {
      recognition.stop()
    } else {
      recognition.start()
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-orange-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Story Generator</h1>
              <p className="text-sm text-gray-600">Create complete animated storybooks with AI</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              {state.panels.length} page{state.panels.length !== 1 ? 's' : ''}
            </div>
            
            <button
              onClick={handleSpeechToText}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isListening
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              <span>{isListening ? 'Stop' : 'Voice'}</span>
            </button>
            
            <button
              onClick={handleExport}
              disabled={state.panels.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
