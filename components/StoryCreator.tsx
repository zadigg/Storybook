'use client'

import { useState } from 'react'
import { Plus, Undo, Redo } from 'lucide-react'
import { useStory } from '@/context/StoryContext'
import StoryPanel from './StoryPanel'
import PanelCreator from './PanelCreator'
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd'

export default function StoryCreator() {
  const { state, dispatch } = useStory()
  const [showCreator, setShowCreator] = useState(false)

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(state.panels)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    dispatch({ type: 'REORDER_PANELS', payload: items })
  }

  const canUndo = state.historyIndex > 0
  const canRedo = state.historyIndex < state.history.length - 1

  return (
    <div className="max-w-6xl mx-auto">
      {/* Controls */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowCreator(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span>Add Panel</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => dispatch({ type: 'UNDO' })}
              disabled={!canUndo}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Undo className="h-5 w-5" />
            </button>
            <button
              onClick={() => dispatch({ type: 'REDO' })}
              disabled={!canRedo}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Redo className="h-5 w-5" />
            </button>
          </div>
        </div>

        {state.isGenerating && (
          <div className="flex items-center space-x-2 text-orange-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
            <span>Generating image...</span>
          </div>
        )}
      </div>

      {/* Story Panels */}
      {state.panels.length === 0 ? (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Plus className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Your Story</h3>
            <p className="text-gray-600 mb-6">
              Create your first panel to begin building your interactive storybook
            </p>
            <button
              onClick={() => setShowCreator(true)}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Create First Panel
            </button>
          </div>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="story-panels" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex space-x-6 overflow-x-auto pb-4"
              >
                {state.panels.map((panel, index) => (
                  <StoryPanel
                    key={panel.id}
                    panel={panel}
                    index={index}
                    onUpdate={(updates) =>
                      dispatch({ type: 'UPDATE_PANEL', payload: { id: panel.id, updates } })
                    }
                    onDelete={() => dispatch({ type: 'DELETE_PANEL', payload: panel.id })}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Panel Creator Modal */}
      {showCreator && (
        <PanelCreator
          onClose={() => setShowCreator(false)}
          onSave={(panelData) => {
            dispatch({ type: 'ADD_PANEL', payload: panelData })
            setShowCreator(false)
          }}
        />
      )}
    </div>
  )
}
