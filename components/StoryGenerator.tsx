'use client'

import { useState } from 'react'
import { Wand2, BookOpen, Play, Download, RotateCcw } from 'lucide-react'
import { useStory } from '@/context/StoryContext'
import { generateCompleteStory } from '@/lib/storyGenerator'
import StoryViewer from './StoryViewer'

export default function StoryGenerator() {
  const { state, dispatch } = useStory()
  const [userIdea, setUserIdea] = useState('A brave little robot named Sparky discovers a magical garden filled with glowing flowers and friendly talking animals')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showStory, setShowStory] = useState(false)

  const handleGenerateStory = async () => {
    if (!userIdea.trim()) return

    setIsGenerating(true)
    try {
      const story = await generateCompleteStory(userIdea)
      
      // Clear existing panels
      dispatch({ type: 'CLEAR_ALL' })
      
      // Add all story pages with panels
      story.pages.forEach((page, index) => {
        dispatch({
          type: 'ADD_PANEL',
          payload: {
            prompt: page.panels?.[0]?.text || 'No text available',
            characterDescription: page.panels?.[0]?.characterDescription,
            sceneDescription: page.panels?.[0]?.sceneDescription,
            imageUrl: page.panels?.[0]?.imageUrl,
            pageNumber: index + 1,
            title: page.title,
            panels: page.panels || []
          }
        })
      })

      setShowStory(true)
    } catch (error) {
      console.error('Failed to generate story:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleNewStory = () => {
    setUserIdea('')
    setShowStory(false)
    dispatch({ type: 'CLEAR_ALL' })
  }

  if (showStory && state.panels.length > 0) {
    return <StoryViewer onNewStory={handleNewStory} />
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-6">
          <BookOpen className="h-16 w-16 text-orange-500 mr-4" />
          <h1 className="text-4xl font-bold text-gray-900">AI Story Generator</h1>
        </div>
        <p className="text-xl text-gray-600 mb-8">
          Tell me your idea, and I'll create a complete animated storybook for you!
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-800 mb-3">
            What's your story idea?
          </label>
          <textarea
            value={userIdea}
            onChange={(e) => setUserIdea(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
            rows={4}
            placeholder="Example: A brave little robot who discovers a magical garden and makes friends with talking animals..."
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              {userIdea.length > 0 && `${userIdea.length} characters`}
            </div>
            <button
              onClick={() => setUserIdea('A brave little robot named Sparky discovers a magical garden filled with glowing flowers and friendly talking animals')}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
            >
              🚀 Test Story
            </button>
          </div>
          
          <button
            onClick={handleGenerateStory}
            disabled={!userIdea.trim() || isGenerating}
            className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating Your Story...</span>
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5" />
                <span>Generate Story</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-xl text-center">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Complete Story</h3>
          <p className="text-sm text-gray-600">AI generates a full story with beginning, middle, and end</p>
        </div>
        
        <div className="bg-green-50 p-6 rounded-xl text-center">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Animated Pages</h3>
          <p className="text-sm text-gray-600">Beautiful page transitions and story animations</p>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-xl text-center">
          <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Export & Share</h3>
          <p className="text-sm text-gray-600">Download your story as PDF or share online</p>
        </div>
      </div>

      {/* Image Generation Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
        <div className="flex items-start space-x-3">
          <div className="text-yellow-600 text-lg">⚠️</div>
          <div>
            <h4 className="font-semibold text-yellow-800 mb-1">AI Image Generation Status</h4>
            <p className="text-sm text-yellow-700">
              Attempting to generate real AI images with Gemini 2.5 Flash Image API. 
              If images fail to generate, pages will show story content only (no fake placeholder images).
              Check browser console for detailed error messages.
            </p>
          </div>
        </div>
      </div>

      {/* Example Ideas */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-800 mb-4">💡 Quick Test Ideas (Click to Use)</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            "A brave little robot who discovers a magical garden and makes friends with talking animals",
            "A young dragon who learns to fly and saves a village from a terrible storm",
            "A space explorer who finds an abandoned alien city and discovers its secrets",
            "A group of forest animals who work together to save their home from destruction",
            "A time-traveling cat who visits different historical periods and meets famous figures",
            "A magical library where books come to life and characters escape their stories"
          ].map((idea, index) => (
            <button
              key={index}
              onClick={() => setUserIdea(idea)}
              className="text-left p-3 bg-white rounded-lg hover:bg-orange-50 hover:border-orange-200 border border-gray-200 transition-colors text-sm"
            >
              {idea}
            </button>
          ))}
        </div>
        <div className="mt-4 text-center">
          <button
            onClick={handleGenerateStory}
            disabled={!userIdea.trim() || isGenerating}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors font-semibold"
          >
            {isGenerating ? 'Creating Story...' : '🚀 Generate Story Now!'}
          </button>
        </div>
      </div>
    </div>
  )
}
