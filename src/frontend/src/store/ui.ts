import { create } from 'zustand'

export interface Point {
  x: number
  y: number
}

interface UIState {
  sidebarCollapsed: boolean
  propertiesPanelWidth: number
  zoom: number
  pan: Point
  
  // サイドバー操作
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  
  // プロパティパネル操作
  setPropertiesPanelWidth: (width: number) => void
  
  // ズーム・パン操作
  setZoom: (zoom: number) => void
  setPan: (pan: Point) => void
  resetView: () => void
}

const DEFAULT_PROPERTIES_PANEL_WIDTH = 300

const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  propertiesPanelWidth: DEFAULT_PROPERTIES_PANEL_WIDTH,
  zoom: 1,
  pan: { x: 0, y: 0 },

  // サイドバー操作
  toggleSidebar: () =>
    set((state) => ({
      sidebarCollapsed: !state.sidebarCollapsed
    })),
  
  setSidebarCollapsed: (collapsed) =>
    set({ sidebarCollapsed: collapsed }),

  // プロパティパネル操作
  setPropertiesPanelWidth: (width) =>
    set({ propertiesPanelWidth: Math.max(200, Math.min(width, 600)) }),

  // ズーム・パン操作
  setZoom: (zoom) =>
    set({ zoom: Math.max(0.1, Math.min(zoom, 5)) }),
  
  setPan: (pan) =>
    set({ pan }),
  
  resetView: () =>
    set({
      zoom: 1,
      pan: { x: 0, y: 0 }
    })
}))

export default useUIStore 