import { act, renderHook } from '@testing-library/react'
import useGlobalStore from '../global'

describe('Global Store', () => {
  beforeEach(() => {
    act(() => {
      useGlobalStore.setState({
        user: null,
        project: null,
        view: 'floor',
        selectedElements: []
      })
    })
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useGlobalStore())
    
    expect(result.current.user).toBeNull()
    expect(result.current.project).toBeNull()
    expect(result.current.view).toBe('floor')
    expect(result.current.selectedElements).toEqual([])
  })

  it('should set user', () => {
    const { result } = renderHook(() => useGlobalStore())
    const user = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com'
    }

    act(() => {
      result.current.setUser(user)
    })

    expect(result.current.user).toEqual(user)
  })

  it('should set project', () => {
    const { result } = renderHook(() => useGlobalStore())
    const project = {
      id: '1',
      name: 'Test Project',
      description: 'Test Description',
      createdAt: '2024-04-12',
      updatedAt: '2024-04-12'
    }

    act(() => {
      result.current.setProject(project)
    })

    expect(result.current.project).toEqual(project)
  })

  it('should set view', () => {
    const { result } = renderHook(() => useGlobalStore())

    act(() => {
      result.current.setView('structure')
    })

    expect(result.current.view).toBe('structure')
  })

  describe('Selected Elements', () => {
    it('should add selected element', () => {
      const { result } = renderHook(() => useGlobalStore())

      act(() => {
        result.current.addSelectedElement('element1')
      })

      expect(result.current.selectedElements).toEqual(['element1'])
    })

    it('should remove selected element', () => {
      const { result } = renderHook(() => useGlobalStore())

      act(() => {
        result.current.setSelectedElements(['element1', 'element2'])
        result.current.removeSelectedElement('element1')
      })

      expect(result.current.selectedElements).toEqual(['element2'])
    })

    it('should clear selected elements', () => {
      const { result } = renderHook(() => useGlobalStore())

      act(() => {
        result.current.setSelectedElements(['element1', 'element2'])
        result.current.clearSelectedElements()
      })

      expect(result.current.selectedElements).toEqual([])
    })
  })
}) 