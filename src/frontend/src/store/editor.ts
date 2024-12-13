import { create } from 'zustand'
import { Element } from '../components/editor/Canvas'

export type ToolType = 'select' | 'room' | 'door' | 'window' | 'wall'

export interface ViewState {
  zoom: number
  pan: { x: number; y: number }
}

export interface HistoryState {
  past: Element[][]
  present: Element[]
  future: Element[][]
}

interface EditorState {
  elements: Record<string, Element>
  activeTool: ToolType
  viewState: ViewState
  history: HistoryState

  // 要素操作
  addElement: (element: Element) => void
  updateElement: (elementId: string, updates: Partial<Element>) => void
  removeElement: (elementId: string) => void
  
  // ツール操作
  setActiveTool: (tool: ToolType) => void
  
  // ビュー操作
  setViewState: (viewState: ViewState) => void
  zoomIn: () => void
  zoomOut: () => void
  resetView: () => void
  
  // 履歴操作
  undo: () => void
  redo: () => void
  pushHistory: (elements: Element[]) => void
}

const useEditorStore = create<EditorState>((set) => ({
  elements: {},
  activeTool: 'select',
  viewState: {
    zoom: 1,
    pan: { x: 0, y: 0 }
  },
  history: {
    past: [],
    present: [],
    future: []
  },

  // 要素操作
  addElement: (element) =>
    set((state) => ({
      elements: {
        ...state.elements,
        [element.id]: element
      }
    })),

  updateElement: (elementId, updates) =>
    set((state) => ({
      elements: {
        ...state.elements,
        [elementId]: {
          ...state.elements[elementId],
          ...updates
        }
      }
    })),

  removeElement: (elementId) =>
    set((state) => {
      const { [elementId]: removed, ...rest } = state.elements
      return { elements: rest }
    }),

  // ツール操作
  setActiveTool: (tool) => set({ activeTool: tool }),

  // ビュー操作
  setViewState: (viewState) => set({ viewState }),
  
  zoomIn: () =>
    set((state) => ({
      viewState: {
        ...state.viewState,
        zoom: Math.min(state.viewState.zoom * 1.2, 5)
      }
    })),
  
  zoomOut: () =>
    set((state) => ({
      viewState: {
        ...state.viewState,
        zoom: Math.max(state.viewState.zoom / 1.2, 0.1)
      }
    })),
  
  resetView: () =>
    set({
      viewState: {
        zoom: 1,
        pan: { x: 0, y: 0 }
      }
    }),

  // 履歴操作
  undo: () =>
    set((state) => {
      const { past, present, future } = state.history
      if (past.length === 0) return state

      const previous = past[past.length - 1]
      const newPast = past.slice(0, past.length - 1)

      return {
        history: {
          past: newPast,
          present: previous,
          future: [present, ...future]
        }
      }
    }),

  redo: () =>
    set((state) => {
      const { past, present, future } = state.history
      if (future.length === 0) return state

      const next = future[0]
      const newFuture = future.slice(1)

      return {
        history: {
          past: [...past, present],
          present: next,
          future: newFuture
        }
      }
    }),

  pushHistory: (elements) =>
    set((state) => ({
      history: {
        past: [...state.history.past, state.history.present],
        present: elements,
        future: []
      }
    }))
}))

export default useEditorStore 