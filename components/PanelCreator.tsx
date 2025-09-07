'use client'

import { useState } from 'react'
import { X, Wand2, Mic, MicOff } from 'lucide-react'
import { generateImage, generateCharacterDescription, enhancePrompt } from '@/lib/gemini'
import { useStory } from '@/context/StoryContext'

interface PanelCreatorProps {
  onClose: () => void
  onSave: (panelData: {
    prompt: string
    characterDescription?: string
    sceneDescription?: string
    imageUrl?: string
  }) => void
}

export default function PanelCreator({ onClose, onSave }: PanelCreatorProps) {
  const { state } = useStory()
  const [prompt, setPrompt] = useState('')
  const [characterDescription, setCharacterDescription] = useState('')
  const [sceneDescription, setSceneDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [enhancedPrompt, setEnhancedPrompt] = useState('')

  // Demo data for development
  const demoData = {
    prompts: [
      "A brave little robot named Sparky discovers a magical garden filled with glowing flowers and friendly talking animals. The robot's eyes light up with wonder as a colorful butterfly lands on their metal shoulder, while a wise old owl watches from a nearby tree branch.",
      "A young dragon learns to fly for the first time, soaring over a crystal-clear lake while rainbow fish jump out of the water below. The dragon's wings shimmer with iridescent scales as the sun sets behind distant mountains.",
      "A group of forest animals gather around a mysterious glowing tree that only appears during the full moon. Each animal brings a special gift to place at the tree's roots, creating a beautiful circle of light and magic.",
      "A space explorer discovers an abandoned alien city on a distant planet, where the buildings are made of living crystal that pulses with energy. Strange, friendly creatures emerge from the shadows to greet the visitor."
    ],
    characters: [
      "A curious little robot with bright blue LED eyes, a round silver body with copper accents, and small antennae that twitch when excited. Sparky has a friendly digital smile display and tiny mechanical hands that can pick up delicate objects. The robot wears a small red cape and has a small solar panel on their back that glows softly.",
      "A young dragon with emerald green scales and golden eyes, small enough to be friendly but with wings that shimmer like stained glass. The dragon has a curious expression and tiny claws that sparkle in the sunlight.",
      "A wise old owl with silver feathers and bright amber eyes, wearing tiny spectacles and a small satchel around their neck. The owl has a kind, grandfatherly appearance with feathers that seem to glow softly in the moonlight.",
      "A space explorer in a sleek silver suit with a transparent helmet, carrying a glowing device that maps the alien city. The explorer has a determined expression and equipment that pulses with blue energy."
    ],
    scenes: [
      "A mystical garden bathed in golden sunset light with floating orbs of soft light drifting between ancient oak trees. The air shimmers with magical particles, and the ground is covered in luminescent flowers that pulse with gentle colors. A crystal-clear stream winds through the garden, reflecting the warm orange and pink sky above.",
      "A serene mountain lake surrounded by towering pine trees, with the water so clear you can see colorful fish swimming below. The sky is painted in brilliant oranges and purples as the sun sets behind snow-capped peaks in the distance.",
      "An enchanted forest clearing where a massive ancient tree glows with inner light, its branches reaching toward a star-filled sky. Fireflies dance around the tree, and the ground is covered in soft moss that glows with bioluminescent patterns.",
      "An otherworldly alien city with towering crystal spires that reach toward a purple sky with two moons. The buildings pulse with inner light, and strange floating orbs drift between the structures, creating pathways of light in the air."
    ]
  }

  const loadDemoData = (index: number = 0) => {
    setPrompt(demoData.prompts[index])
    setCharacterDescription(demoData.characters[index])
    setSceneDescription(demoData.scenes[index])
  }

  const handleGenerateCharacter = async () => {
    if (!prompt.trim()) return
    
    setIsGenerating(true)
    try {
      const description = await generateCharacterDescription(prompt)
      setCharacterDescription(description)
    } catch (error) {
      console.error('Failed to generate character description:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return
    
    setIsGenerating(true)
    try {
      const enhanced = await enhancePrompt(prompt, characterDescription)
      setEnhancedPrompt(enhanced)
      setPrompt(enhanced)
    } catch (error) {
      console.error('Failed to enhance prompt:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateImage = async () => {
    if (!prompt.trim()) return
    
    setIsGenerating(true)
    try {
      const imageUrl = await generateImage({
        prompt,
        characterDescription: characterDescription || state.currentCharacterDescription,
        sceneDescription,
      })
      
      onSave({
        prompt,
        characterDescription: characterDescription || state.currentCharacterDescription,
        sceneDescription,
        imageUrl,
      })
    } catch (error) {
      console.error('Failed to generate image:', error)
      // Save without image if generation fails
      onSave({
        prompt,
        characterDescription: characterDescription || state.currentCharacterDescription,
        sceneDescription,
      })
    } finally {
      setIsGenerating(false)
    }
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
      setPrompt(transcript)
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Panel</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Demo Data Buttons - Only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">🚀 Quick Demo Data (for development)</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => loadDemoData(0)}
                  className="px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm hover:bg-orange-200 transition-colors"
                >
                  Robot Story
                </button>
                <button
                  onClick={() => loadDemoData(1)}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200 transition-colors"
                >
                  Dragon Story
                </button>
                <button
                  onClick={() => loadDemoData(2)}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
                >
                  Forest Story
                </button>
                <button
                  onClick={() => loadDemoData(3)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                >
                  Space Story
                </button>
                <button
                  onClick={() => {
                    setPrompt('')
                    setCharacterDescription('')
                    setSceneDescription('')
                  }}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}

          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What should happen in this panel?
            </label>
            <div className="flex space-x-2">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={4}
                placeholder="Describe the scene, characters, and action for this panel..."
              />
              <button
                onClick={handleSpeechToText}
                className={`p-3 border rounded-lg transition-colors ${
                  isListening
                    ? 'bg-red-100 border-red-300 text-red-700'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
            </div>
            <div className="mt-2 flex space-x-2">
              <button
                onClick={handleEnhancePrompt}
                disabled={!prompt.trim() || isGenerating}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                <Wand2 className="h-3 w-3" />
                <span>Enhance</span>
              </button>
            </div>
          </div>

          {/* Character Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Character Description (optional)
            </label>
            <div className="flex space-x-2">
              <textarea
                value={characterDescription}
                onChange={(e) => setCharacterDescription(e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={3}
                placeholder="Describe the main character's appearance, clothing, and distinctive features..."
              />
              <button
                onClick={handleGenerateCharacter}
                disabled={!prompt.trim() || isGenerating}
                className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 disabled:opacity-50 transition-colors"
              >
                Generate
              </button>
            </div>
          </div>

          {/* Scene Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scene Description (optional)
            </label>
            <textarea
              value={sceneDescription}
              onChange={(e) => setSceneDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={3}
              placeholder="Describe the setting, lighting, mood, and atmosphere..."
            />
          </div>

          {/* Current Character Context */}
          {state.currentCharacterDescription && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-1">Current Character:</p>
              <p className="text-sm text-blue-700">{state.currentCharacterDescription}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerateImage}
            disabled={!prompt.trim() || isGenerating}
            className="flex items-center space-x-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                <span>Create Panel</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
