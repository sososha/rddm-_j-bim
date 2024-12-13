import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { View } from '../types/view';
import { useWebSocketStore } from './websocket';

interface ViewStore {
  views: Record<string, View>;
  currentView: View | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchViews: (projectId: string) => Promise<void>;
  getView: (projectId: string, viewType: string) => Promise<void>;
  updateView: (projectId: string, viewType: string, state: any) => Promise<void>;
  setCurrentView: (view: View | null) => void;
  
  // WebSocket関連
  handleViewUpdate: (projectId: string, viewType: string, state: any) => void;
}

export const useViewStore = create<ViewStore>()(
  devtools(
    (set, get) => ({
      views: {},
      currentView: null,
      loading: false,
      error: null,

      fetchViews: async (projectId: string) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/projects/${projectId}/views`);
          if (!response.ok) throw new Error('Failed to fetch views');
          const views = await response.json();
          set({ views });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loading: false });
        }
      },

      getView: async (projectId: string, viewType: string) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/projects/${projectId}/views/${viewType}`);
          if (!response.ok) throw new Error('Failed to get view');
          const view = await response.json();
          set((state) => ({
            views: { ...state.views, [viewType]: view },
            currentView: view,
          }));
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loading: false });
        }
      },

      updateView: async (projectId: string, viewType: string, state: any) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/projects/${projectId}/views/${viewType}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ state }),
          });
          if (!response.ok) throw new Error('Failed to update view');
          const view = await response.json();
          
          // WebSocketで通知
          useWebSocketStore.getState().sendMessage({
            type: 'ViewUpdate',
            payload: {
              project_id: projectId,
              view_type: viewType,
              state: state,
              timestamp: new Date().toISOString(),
              user_id: 'system', // TODO: 実際のユーザーIDを使用
              id: viewType, // viewTypeをIDとして使用
            },
          });
          
          set((state) => ({
            views: { ...state.views, [viewType]: view },
            currentView: state.currentView?.type === viewType ? view : state.currentView,
          }));
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loading: false });
        }
      },

      setCurrentView: (view: View | null) => {
        set({ currentView: view });
      },

      // WebSocket関連のハンドラー
      handleViewUpdate: (projectId: string, viewType: string, state: any) => {
        const view = {
          type: viewType,
          project_id: projectId,
          state: state,
        };
        
        set((state) => ({
          views: { ...state.views, [viewType]: view },
          currentView: state.currentView?.type === viewType ? view : state.currentView,
        }));
      },
    }),
    {
      name: 'view-store',
    }
  )
); 