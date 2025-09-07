'use client'

import { useState } from 'react'
import { Draggable } from 'react-beautiful-dnd'
import { Edit3, Trash2, RotateCcw, Image as ImageIcon } from 'lucide-react'
import { StoryPanel as StoryPanelType } from '@/context/StoryContext'
import { generateImage } from '@/lib/gemini'

interface StoryPanelProps {
  panel: StoryPanelType
  index: number
  onUpdate: (updates: Partial<StoryPanelType>) => void
  onDelete: () => void
}

export default function StoryPanel({ panel, index, onUpdate, onDelete }: StoryPanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [editPrompt, setEditPrompt] = useState(panel.prompt)

  const handleGenerateImage = async () => {
    setIsGenerating(true)
    try {
      const imageUrl = await generateImage({
        prompt: panel.prompt,
        characterDescription: panel.characterDescription,
        sceneDescription: panel.sceneDescription,
      })
      onUpdate({ imageUrl })
    } catch (error) {
      console.error('Failed to generate image:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerateImage = async () => {
    setIsGenerating(true)
    try {
      const imageUrl = await generateImage({
        prompt: panel.prompt,
        characterDescription: panel.characterDescription,
        sceneDescription: panel.sceneDescription,
      })
      onUpdate({ imageUrl })
    } catch (error) {
      console.error('Failed to regenerate image:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveEdit = () => {
    onUpdate({ prompt: editPrompt })
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditPrompt(panel.prompt)
    setIsEditing(false)
  }

  return (
    <Draggable draggableId={panel.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`story-panel bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-200 ${
            snapshot.isDragging ? 'dragging' : ''
          }`}
          style={{
            ...provided.draggableProps.style,
            minWidth: '300px',
            maxWidth: '400px',
          }}
        >
          {/* Panel Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Panel {index + 1}</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={onDelete}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Panel Content */}
          <div className="p-4">
            {/* Image */}
            <div className="mb-4">
              {panel.imageUrl ? (
                <div className="relative">
                  <img
                    src={panel.imageUrl}
                    alt={`Panel ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={handleRegenerateImage}
                    disabled={isGenerating}
                    className="absolute top-2 right-2 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all disabled:opacity-50"
                  >
                    <RotateCcw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-2">No image generated</p>
                    <button
                      onClick={handleGenerateImage}
                      disabled={isGenerating}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
                    >
                      {isGenerating ? 'Generating...' : 'Generate Image'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Prompt */}
            <div>
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows={3}
                    placeholder="Describe what should happen in this panel..."
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700 leading-relaxed">{panel.prompt}</p>
              )}
            </div>

            {/* Character Description */}
            {panel.characterDescription && (
              <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800 font-medium mb-1">Character:</p>
                <p className="text-xs text-blue-700">{panel.characterDescription}</p>
              </div>
            )}

            {/* Scene Description */}
            {panel.sceneDescription && (
              <div className="mt-2 p-2 bg-green-50 rounded-lg">
                <p className="text-xs text-green-800 font-medium mb-1">Scene:</p>
                <p className="text-xs text-green-700">{panel.sceneDescription}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}
