import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Element, CreateElement, UpdateElement } from '../types/element';
import { useWebSocketStore } from './websocket';

interface ElementStore {
  elements: Element[];
  selectedElement: Element | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchElements: (projectId: string) => Promise<void>;
  createElement: (projectId: string, data: CreateElement) => Promise<void>;
  updateElement: (projectId: string, elementId: string, data: UpdateElement) => Promise<void>;
  deleteElement: (projectId: string, elementId: string) => Promise<void>;
  selectElement: (element: Element | null) => void;
  
  // WebSocket関連
  handleElementUpdate: (element: Element) => void;
  handleElementDelete: (elementId: string) => void;
}

export const useElementStore = create<ElementStore>()(
  devtools(
    (set, get) => ({
      elements: [],
      selectedElement: null,
      loading: false,
      error: null,

      fetchElements: async (projectId: string) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/projects/${projectId}/elements`);
          if (!response.ok) throw new Error('Failed to fetch elements');
          const elements = await response.json();
          set({ elements });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loading: false });
        }
      },

      createElement: async (projectId: string, data: CreateElement) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/projects/${projectId}/elements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          if (!response.ok) throw new Error('Failed to create element');
          const element = await response.json();
          
          // WebSocketで通知
          useWebSocketStore.getState().sendMessage({
            type: 'ElementUpdate',
            payload: {
              id: element.id,
              project_id: projectId,
              data: element,
              timestamp: new Date().toISOString(),
              user_id: 'system', // TODO: 実際のユーザーIDを使用
            },
          });
          
          set((state) => ({
            elements: [...state.elements, element],
          }));
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loading: false });
        }
      },

      updateElement: async (projectId: string, elementId: string, data: UpdateElement) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/projects/${projectId}/elements/${elementId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          if (!response.ok) throw new Error('Failed to update element');
          const element = await response.json();
          
          // WebSocketで通知
          useWebSocketStore.getState().sendMessage({
            type: 'ElementUpdate',
            payload: {
              id: elementId,
              project_id: projectId,
              data: element,
              timestamp: new Date().toISOString(),
              user_id: 'system', // TODO: 実際のユーザーIDを使用
            },
          });
          
          set((state) => ({
            elements: state.elements.map((e) => (e.id === elementId ? element : e)),
            selectedElement: state.selectedElement?.id === elementId ? element : state.selectedElement,
          }));
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loading: false });
        }
      },

      deleteElement: async (projectId: string, elementId: string) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/projects/${projectId}/elements/${elementId}`, {
            method: 'DELETE',
          });
          if (!response.ok) throw new Error('Failed to delete element');
          
          // WebSocketで通知
          useWebSocketStore.getState().sendMessage({
            type: 'ElementDelete',
            payload: {
              id: elementId,
              project_id: projectId,
              timestamp: new Date().toISOString(),
              user_id: 'system', // TODO: 実際のユーザーIDを使用
            },
          });
          
          set((state) => ({
            elements: state.elements.filter((e) => e.id !== elementId),
            selectedElement: state.selectedElement?.id === elementId ? null : state.selectedElement,
          }));
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loading: false });
        }
      },

      selectElement: (element: Element | null) => {
        set({ selectedElement: element });
      },

      // WebSocket関連のハンドラー
      handleElementUpdate: (element: Element) => {
        set((state) => ({
          elements: state.elements.map((e) => (e.id === element.id ? element : e)),
          selectedElement: state.selectedElement?.id === element.id ? element : state.selectedElement,
        }));
      },

      handleElementDelete: (elementId: string) => {
        set((state) => ({
          elements: state.elements.filter((e) => e.id !== elementId),
          selectedElement: state.selectedElement?.id === elementId ? null : state.selectedElement,
        }));
      },
    }),
    {
      name: 'element-store',
    }
  )
); 