import { act, renderHook } from '@testing-library/react'
import useEditorStore from '../editor'
import { Element } from '../../components/editor/Canvas'

describe('Editor Store', () => {
  const mockElement: Element = {
    id: 'test1',
    type: 'room',
    name: 'Test Room',
    roomType: 'living',
    area: 20,
    geometry: {
      x: 0,
      y: 0,
      width: 100,
      height: 100
    },
    style: {
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 1
    }
  }

  beforeEach(() => {
    act(() => {
      useEditorStore.setState({
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
        }
      })
    })
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useEditorStore())
    
    expect(result.current.elements).toEqual({})
    expect(result.current.activeTool).toBe('select')
    expect(result.current.viewState).toEqual({
      zoom: 1,
      pan: { x: 0, y: 0 }
    })
    expect(result.current.history).toEqual({
      past: [],
      present: [],
      future: []
    })
  })

  describe('Element Operations', () => {
    it('should add element', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.addElement(mockElement)
      })

      expect(result.current.elements[mockElement.id]).toEqual(mockElement)
    })

    it('should update element', () => {
      const { result } = renderHook(() => useEditorStore())
      const updates = {
        name: 'Updated Room',
        area: 25
      }

      act(() => {
        result.current.addElement(mockElement)
        result.current.updateElement(mockElement.id, updates)
      })

      expect(result.current.elements[mockElement.id]).toEqual({
        ...mockElement,
        ...updates
      })
    })

    it('should remove element', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.addElement(mockElement)
        result.current.removeElement(mockElement.id)
      })

      expect(result.current.elements[mockElement.id]).toBeUndefined()
    })
  })

  describe('Tool Operations', () => {
    it('should set active tool', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.setActiveTool('room')
      })

      expect(result.current.activeTool).toBe('room')
    })
  })

  describe('View Operations', () => {
    it('should zoom in', () => {
      const { result } = renderHook(() => useEditorStore())
      const initialZoom = result.current.viewState.zoom

      act(() => {
        result.current.zoomIn()
      })

      expect(result.current.viewState.zoom).toBeGreaterThan(initialZoom)
    })

    it('should zoom out', () => {
      const { result } = renderHook(() => useEditorStore())
      const initialZoom = result.current.viewState.zoom

      act(() => {
        result.current.zoomOut()
      })

      expect(result.current.viewState.zoom).toBeLessThan(initialZoom)
    })

    it('should reset view', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.setViewState({
          zoom: 2,
          pan: { x: 100, y: 100 }
        })
        result.current.resetView()
      })

      expect(result.current.viewState).toEqual({
        zoom: 1,
        pan: { x: 0, y: 0 }
      })
    })
  })

  describe('History Operations', () => {
    it('should undo changes', () => {
      const { result } = renderHook(() => useEditorStore())
      const elements = [mockElement]

      act(() => {
        result.current.pushHistory([])
        result.current.pushHistory(elements)
        result.current.undo()
      })

      expect(result.current.history.present).toEqual([])
    })

    it('should redo changes', () => {
      const { result } = renderHook(() => useEditorStore())
      const elements = [mockElement]

      act(() => {
        result.current.pushHistory([])
        result.current.pushHistory(elements)
        result.current.undo()
        result.current.redo()
      })

      expect(result.current.history.present).toEqual(elements)
    })
  })
}) 