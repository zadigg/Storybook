'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw, Download, Home } from 'lucide-react'
import { useStory } from '@/context/StoryContext'

interface StoryViewerProps {
  onNewStory: () => void
}

export default function StoryViewer({ onNewStory }: StoryViewerProps) {
  const { state } = useStory()
  const [currentPage, setCurrentPage] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const totalPages = state.panels.length
  const currentPageData = state.panels[currentPage]

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentPage(currentPage + 1)
        setIsAnimating(false)
      }, 300)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentPage(currentPage - 1)
        setIsAnimating(false)
      }, 300)
    }
  }

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextPage()
    if (e.key === 'ArrowLeft') prevPage()
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentPage])

  if (!currentPageData) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">No story to display</p>
          <button
            onClick={onNewStory}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-bold"
            style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
          >
            CREATE NEW STORY
          </button>
        </div>
      </div>
    )
  }

  // Get panels from the current page data
  const panels = currentPageData.panels || []

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Comic Book Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/90 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onNewStory}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>New Story</span>
            </button>
            <div className="text-sm text-white/80 bg-black/50 px-3 py-1 rounded-full">
              Page {currentPage + 1} of {totalPages}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onNewStory}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Generate New</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comic Book Page */}
      <div className="absolute inset-0 top-16 bottom-20">
        <div className={`transition-all duration-500 w-full h-full ${isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
          {/* Page Title - Overlay on top */}
          <div className="absolute top-2 left-0 right-0 z-30 text-center">
            <h2 className="text-xl md:text-2xl font-black text-white drop-shadow-2xl" 
                style={{
                  textShadow: '3px 3px 0px #000, 5px 5px 0px #ff6b35, 7px 7px 0px #000',
                  fontFamily: 'Impact, Arial Black, sans-serif',
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}>
              {currentPageData.title || `Page ${currentPage + 1}`}
            </h2>
          </div>

          {/* Full Screen Comic Book Page Layout */}
          <div className="w-full h-full relative bg-black">
            {/* Panel 1 - Top Left */}
            <div className="absolute top-0 left-0 w-1/3 h-1/2 bg-white border-2 border-black overflow-hidden">
              {panels[0] && (
                <>
                  {panels[0].imageUrl ? (
                    <img src={panels[0].imageUrl} alt="Panel 1" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-200">
                      <span className="text-2xl">🎨</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-white/95 rounded-lg p-2 border-2 border-black">
                      <p className="text-xs font-bold text-center text-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                        {panels[0].text || 'Panel 1'}
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-black">1</div>
                </>
              )}
            </div>

            {/* Panel 2 - Top Center */}
            <div className="absolute top-0 left-1/3 w-1/3 h-1/2 bg-white border-2 border-black overflow-hidden">
              {panels[1] && (
                <>
                  {panels[1].imageUrl ? (
                    <img src={panels[1].imageUrl} alt="Panel 2" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-200">
                      <span className="text-2xl">🎨</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-white/95 rounded-lg p-2 border-2 border-black">
                      <p className="text-xs font-bold text-center text-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                        {panels[1].text || 'Panel 2'}
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-black">2</div>
                </>
              )}
            </div>

            {/* Panel 3 - Top Right */}
            <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-white border-2 border-black overflow-hidden">
              {panels[2] && (
                <>
                  {panels[2].imageUrl ? (
                    <img src={panels[2].imageUrl} alt="Panel 3" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-200">
                      <span className="text-2xl">🎨</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-white/95 rounded-lg p-2 border-2 border-black">
                      <p className="text-xs font-bold text-center text-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                        {panels[2].text || 'Panel 3'}
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-black">3</div>
                </>
              )}
            </div>

            {/* Panel 4 - Bottom Left */}
            <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-white border-2 border-black overflow-hidden">
              {panels[3] && (
                <>
                  {panels[3].imageUrl ? (
                    <img src={panels[3].imageUrl} alt="Panel 4" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-200">
                      <span className="text-2xl">🎨</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-white/95 rounded-lg p-2 border-2 border-black">
                      <p className="text-xs font-bold text-center text-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                        {panels[3].text || 'Panel 4'}
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-black">4</div>
                </>
              )}
            </div>

            {/* Panel 5 - Bottom Center */}
            <div className="absolute bottom-0 left-1/3 w-1/3 h-1/2 bg-white border-2 border-black overflow-hidden">
              {panels[4] && (
                <>
                  {panels[4].imageUrl ? (
                    <img src={panels[4].imageUrl} alt="Panel 5" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-200">
                      <span className="text-2xl">🎨</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-white/95 rounded-lg p-2 border-2 border-black">
                      <p className="text-xs font-bold text-center text-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                        {panels[4].text || 'Panel 5'}
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-black">5</div>
                </>
              )}
            </div>

            {/* Panel 6 - Bottom Right */}
            <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-white border-2 border-black overflow-hidden">
              {panels[5] && (
                <>
                  {panels[5].imageUrl ? (
                    <img src={panels[5].imageUrl} alt="Panel 6" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-200">
                      <span className="text-2xl">🎨</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-white/95 rounded-lg p-2 border-2 border-black">
                      <p className="text-xs font-bold text-center text-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                        {panels[5].text || 'Panel 6'}
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-black">6</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comic Book Navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 to-transparent p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors font-bold ${
              currentPage === 0
                ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                : 'bg-red-500 text-white hover:bg-red-600 border-2 border-black shadow-lg'
            }`}
            style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
          >
            <ChevronLeft className="h-5 w-5" />
            <span>PREV</span>
          </button>

          <div className="flex items-center space-x-3">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`w-4 h-4 rounded-full transition-colors border-2 ${
                  i === currentPage 
                    ? 'bg-yellow-400 border-yellow-400 shadow-lg' 
                    : 'bg-white/50 border-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages - 1}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors font-bold ${
              currentPage === totalPages - 1
                ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                : 'bg-red-500 text-white hover:bg-red-600 border-2 border-black shadow-lg'
            }`}
            style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
          >
            <span>NEXT</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}