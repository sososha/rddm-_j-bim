import { act, renderHook } from '@testing-library/react'
import useUIStore from '../ui'

describe('UI Store', () => {
  beforeEach(() => {
    act(() => {
      useUIStore.setState({
        sidebarCollapsed: false,
        propertiesPanelWidth: 300,
        zoom: 1,
        pan: { x: 0, y: 0 }
      })
    })
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useUIStore())
    
    expect(result.current.sidebarCollapsed).toBe(false)
    expect(result.current.propertiesPanelWidth).toBe(300)
    expect(result.current.zoom).toBe(1)
    expect(result.current.pan).toEqual({ x: 0, y: 0 })
  })

  describe('Sidebar Operations', () => {
    it('should toggle sidebar', () => {
      const { result } = renderHook(() => useUIStore())

      act(() => {
        result.current.toggleSidebar()
      })

      expect(result.current.sidebarCollapsed).toBe(true)

      act(() => {
        result.current.toggleSidebar()
      })

      expect(result.current.sidebarCollapsed).toBe(false)
    })

    it('should set sidebar collapsed state', () => {
      const { result } = renderHook(() => useUIStore())

      act(() => {
        result.current.setSidebarCollapsed(true)
      })

      expect(result.current.sidebarCollapsed).toBe(true)
    })
  })

  describe('Properties Panel Operations', () => {
    it('should set properties panel width within bounds', () => {
      const { result } = renderHook(() => useUIStore())

      act(() => {
        result.current.setPropertiesPanelWidth(400)
      })

      expect(result.current.propertiesPanelWidth).toBe(400)

      // Test minimum bound
      act(() => {
        result.current.setPropertiesPanelWidth(100)
      })

      expect(result.current.propertiesPanelWidth).toBe(200)

      // Test maximum bound
      act(() => {
        result.current.setPropertiesPanelWidth(700)
      })

      expect(result.current.propertiesPanelWidth).toBe(600)
    })
  })

  describe('View Operations', () => {
    it('should set zoom within bounds', () => {
      const { result } = renderHook(() => useUIStore())

      act(() => {
        result.current.setZoom(2)
      })

      expect(result.current.zoom).toBe(2)

      // Test minimum bound
      act(() => {
        result.current.setZoom(0.05)
      })

      expect(result.current.zoom).toBe(0.1)

      // Test maximum bound
      act(() => {
        result.current.setZoom(6)
      })

      expect(result.current.zoom).toBe(5)
    })

    it('should set pan position', () => {
      const { result } = renderHook(() => useUIStore())
      const newPan = { x: 100, y: 100 }

      act(() => {
        result.current.setPan(newPan)
      })

      expect(result.current.pan).toEqual(newPan)
    })

    it('should reset view', () => {
      const { result } = renderHook(() => useUIStore())

      act(() => {
        result.current.setZoom(2)
        result.current.setPan({ x: 100, y: 100 })
        result.current.resetView()
      })

      expect(result.current.zoom).toBe(1)
      expect(result.current.pan).toEqual({ x: 0, y: 0 })
    })
  })
}) 