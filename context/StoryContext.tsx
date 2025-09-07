'use client'

import React, { createContext, useContext, useReducer, ReactNode } from 'react'

export interface StoryPanel {
  id: string
  imageUrl?: string
  prompt: string
  characterDescription?: string
  sceneDescription?: string
  timestamp: number
  pageNumber?: number
  title?: string
  panels?: ComicPanel[]
}

export interface ComicPanel {
  text: string
  characterDescription?: string
  sceneDescription?: string
  panelType?: 'main' | 'small' | 'wide'
  imageUrl?: string
  panelNumber?: number
}

export interface StoryState {
  panels: StoryPanel[]
  currentCharacterDescription?: string
  isGenerating: boolean
  history: StoryPanel[][]
  historyIndex: number
}

export type StoryAction =
  | { type: 'ADD_PANEL'; payload: Omit<StoryPanel, 'id' | 'timestamp'> }
  | { type: 'UPDATE_PANEL'; payload: { id: string; updates: Partial<StoryPanel> } }
  | { type: 'DELETE_PANEL'; payload: string }
  | { type: 'REORDER_PANELS'; payload: StoryPanel[] }
  | { type: 'SET_CHARACTER_DESCRIPTION'; payload: string }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SAVE_STATE' }
  | { type: 'CLEAR_ALL' }

const initialState: StoryState = {
  panels: [],
  currentCharacterDescription: '',
  isGenerating: false,
  history: [[]],
  historyIndex: 0,
}

function storyReducer(state: StoryState, action: StoryAction): StoryState {
  switch (action.type) {
    case 'ADD_PANEL':
      const newPanel: StoryPanel = {
        ...action.payload,
        id: `panel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      }
      const newPanels = [...state.panels, newPanel]
      return {
        ...state,
        panels: newPanels,
        history: [...state.history.slice(0, state.historyIndex + 1), newPanels],
        historyIndex: state.historyIndex + 1,
      }

    case 'UPDATE_PANEL':
      const updatedPanels = state.panels.map(panel =>
        panel.id === action.payload.id
          ? { ...panel, ...action.payload.updates }
          : panel
      )
      return {
        ...state,
        panels: updatedPanels,
        history: [...state.history.slice(0, state.historyIndex + 1), updatedPanels],
        historyIndex: state.historyIndex + 1,
      }

    case 'DELETE_PANEL':
      const filteredPanels = state.panels.filter(panel => panel.id !== action.payload)
      return {
        ...state,
        panels: filteredPanels,
        history: [...state.history.slice(0, state.historyIndex + 1), filteredPanels],
        historyIndex: state.historyIndex + 1,
      }

    case 'REORDER_PANELS':
      return {
        ...state,
        panels: action.payload,
        history: [...state.history.slice(0, state.historyIndex + 1), action.payload],
        historyIndex: state.historyIndex + 1,
      }

    case 'SET_CHARACTER_DESCRIPTION':
      return {
        ...state,
        currentCharacterDescription: action.payload,
      }

    case 'SET_GENERATING':
      return {
        ...state,
        isGenerating: action.payload,
      }

    case 'UNDO':
      if (state.historyIndex > 0) {
        return {
          ...state,
          panels: state.history[state.historyIndex - 1],
          historyIndex: state.historyIndex - 1,
        }
      }
      return state

    case 'REDO':
      if (state.historyIndex < state.history.length - 1) {
        return {
          ...state,
          panels: state.history[state.historyIndex + 1],
          historyIndex: state.historyIndex + 1,
        }
      }
      return state

    case 'SAVE_STATE':
      return {
        ...state,
        history: [...state.history.slice(0, state.historyIndex + 1), state.panels],
        historyIndex: state.historyIndex + 1,
      }

    case 'CLEAR_ALL':
      return {
        ...state,
        panels: [],
        history: [[]],
        historyIndex: 0,
      }

    default:
      return state
  }
}

const StoryContext = createContext<{
  state: StoryState
  dispatch: React.Dispatch<StoryAction>
} | null>(null)

export function StoryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storyReducer, initialState)

  return (
    <StoryContext.Provider value={{ state, dispatch }}>
      {children}
    </StoryContext.Provider>
  )
}

export function useStory() {
  const context = useContext(StoryContext)
  if (!context) {
    throw new Error('useStory must be used within a StoryProvider')
  }
  return context
}
