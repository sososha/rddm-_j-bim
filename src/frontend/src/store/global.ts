import { create } from 'zustand'
import { ViewType } from '../components/editor/Canvas'

export interface UserInfo {
  id: string
  name: string
  email: string
}

export interface Project {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

interface GlobalState {
  user: UserInfo | null
  project: Project | null
  view: ViewType
  selectedElements: string[]
  setUser: (user: UserInfo | null) => void
  setProject: (project: Project | null) => void
  setView: (view: ViewType) => void
  setSelectedElements: (elements: string[]) => void
  addSelectedElement: (elementId: string) => void
  removeSelectedElement: (elementId: string) => void
  clearSelectedElements: () => void
}

const useGlobalStore = create<GlobalState>((set) => ({
  user: null,
  project: null,
  view: 'floor',
  selectedElements: [],

  setUser: (user) => set({ user }),
  setProject: (project) => set({ project }),
  setView: (view) => set({ view }),
  setSelectedElements: (elements) => set({ selectedElements: elements }),
  
  addSelectedElement: (elementId) =>
    set((state) => ({
      selectedElements: [...state.selectedElements, elementId]
    })),
  
  removeSelectedElement: (elementId) =>
    set((state) => ({
      selectedElements: state.selectedElements.filter((id) => id !== elementId)
    })),
  
  clearSelectedElements: () => set({ selectedElements: [] })
}))

export default useGlobalStore 