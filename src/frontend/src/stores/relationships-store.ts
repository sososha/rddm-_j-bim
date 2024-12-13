import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Relationship, CreateRelationship, UpdateRelationship } from '../types/relationship';
import { useWebSocketStore } from './websocket';

interface RelationshipStore {
  relationships: Relationship[];
  selectedRelationship: Relationship | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchRelationships: (projectId: string) => Promise<void>;
  createRelationship: (projectId: string, data: CreateRelationship) => Promise<void>;
  updateRelationship: (projectId: string, relationshipId: string, data: UpdateRelationship) => Promise<void>;
  deleteRelationship: (projectId: string, relationshipId: string) => Promise<void>;
  selectRelationship: (relationship: Relationship | null) => void;
  
  // WebSocket関連
  handleRelationshipUpdate: (relationship: Relationship) => void;
  handleRelationshipDelete: (relationshipId: string) => void;
}

export const useRelationshipStore = create<RelationshipStore>()(
  devtools(
    (set, get) => ({
      relationships: [],
      selectedRelationship: null,
      loading: false,
      error: null,

      fetchRelationships: async (projectId: string) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/projects/${projectId}/relationships`);
          if (!response.ok) throw new Error('Failed to fetch relationships');
          const relationships = await response.json();
          set({ relationships });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loading: false });
        }
      },

      createRelationship: async (projectId: string, data: CreateRelationship) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/projects/${projectId}/relationships`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          if (!response.ok) throw new Error('Failed to create relationship');
          const relationship = await response.json();
          
          // WebSocketで通知
          useWebSocketStore.getState().sendMessage({
            type: 'RelationshipUpdate',
            payload: {
              id: relationship.id,
              project_id: projectId,
              data: relationship,
              timestamp: new Date().toISOString(),
              user_id: 'system', // TODO: 実際のユーザーIDを使用
            },
          });
          
          set((state) => ({
            relationships: [...state.relationships, relationship],
          }));
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loading: false });
        }
      },

      updateRelationship: async (projectId: string, relationshipId: string, data: UpdateRelationship) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/projects/${projectId}/relationships/${relationshipId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          if (!response.ok) throw new Error('Failed to update relationship');
          const relationship = await response.json();
          
          // WebSocketで通知
          useWebSocketStore.getState().sendMessage({
            type: 'RelationshipUpdate',
            payload: {
              id: relationshipId,
              project_id: projectId,
              data: relationship,
              timestamp: new Date().toISOString(),
              user_id: 'system', // TODO: 実際のユーザーIDを使用
            },
          });
          
          set((state) => ({
            relationships: state.relationships.map((r) => (r.id === relationshipId ? relationship : r)),
            selectedRelationship: state.selectedRelationship?.id === relationshipId ? relationship : state.selectedRelationship,
          }));
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loading: false });
        }
      },

      deleteRelationship: async (projectId: string, relationshipId: string) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/projects/${projectId}/relationships/${relationshipId}`, {
            method: 'DELETE',
          });
          if (!response.ok) throw new Error('Failed to delete relationship');
          
          // WebSocketで通知
          useWebSocketStore.getState().sendMessage({
            type: 'RelationshipDelete',
            payload: {
              id: relationshipId,
              project_id: projectId,
              timestamp: new Date().toISOString(),
              user_id: 'system', // TODO: 実際のユーザーIDを使用
            },
          });
          
          set((state) => ({
            relationships: state.relationships.filter((r) => r.id !== relationshipId),
            selectedRelationship: state.selectedRelationship?.id === relationshipId ? null : state.selectedRelationship,
          }));
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loading: false });
        }
      },

      selectRelationship: (relationship: Relationship | null) => {
        set({ selectedRelationship: relationship });
      },

      // WebSocket関連のハンドラー
      handleRelationshipUpdate: (relationship: Relationship) => {
        set((state) => ({
          relationships: state.relationships.map((r) => (r.id === relationship.id ? relationship : r)),
          selectedRelationship: state.selectedRelationship?.id === relationship.id ? relationship : state.selectedRelationship,
        }));
      },

      handleRelationshipDelete: (relationshipId: string) => {
        set((state) => ({
          relationships: state.relationships.filter((r) => r.id !== relationshipId),
          selectedRelationship: state.selectedRelationship?.id === relationshipId ? null : state.selectedRelationship,
        }));
      },
    }),
    {
      name: 'relationship-store',
    }
  )
); 