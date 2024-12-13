import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useElementStore } from './element-store';
import { useRelationshipStore } from './relationships-store';
import { useViewStore } from './views-store';

interface WebSocketMessage {
  type: string;
  payload: {
    id: string;
    project_id: string;
    data?: any;
    timestamp: string;
    user_id: string;
    view_type?: string;
    state?: any;
  };
}

interface WebSocketStore {
  socket: WebSocket | null;
  connected: boolean;
  messages: WebSocketMessage[];
  error: string | null;
  retryCount: number;
  maxRetries: number;
  retryDelay: number;
  messageQueue: WebSocketMessage[];
  queueProcessing: boolean;
  maxQueueSize: number;
  connect: (projectId: string) => void;
  disconnect: () => void;
  sendMessage: (message: WebSocketMessage) => Promise<void>;
  resetError: () => void;
  clearOldMessages: () => void;
  processMessageQueue: () => Promise<void>;
}

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:3000';
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 30000;
const MAX_QUEUE_SIZE = 1000;
const MAX_MESSAGES_HISTORY = 100;
const QUEUE_PROCESS_INTERVAL = 100; // ミリ秒

export const useWebSocketStore = create<WebSocketStore>()(
  devtools(
    (set, get) => ({
      socket: null,
      connected: false,
      messages: [],
      error: null,
      retryCount: 0,
      maxRetries: MAX_RETRIES,
      retryDelay: INITIAL_RETRY_DELAY,
      messageQueue: [],
      queueProcessing: false,
      maxQueueSize: MAX_QUEUE_SIZE,

      connect: (projectId: string) => {
        const { socket, retryCount, maxRetries, retryDelay } = get();
        
        if (socket) {
          socket.close();
        }

        try {
          const newSocket = new WebSocket(`${WS_URL}/ws/projects/${projectId}`);

          newSocket.onopen = () => {
            set({ 
              connected: true, 
              error: null,
              retryCount: 0,
              retryDelay: INITIAL_RETRY_DELAY,
            });
            console.log('WebSocket connected');
            // 接続時にキューの処理を開始
            get().processMessageQueue();
          };

          newSocket.onclose = (event) => {
            set({ connected: false });
            console.log('WebSocket disconnected', event);

            if (!event.wasClean && retryCount < maxRetries) {
              const nextRetryDelay = Math.min(retryDelay * 2, MAX_RETRY_DELAY);
              set((state) => ({ 
                retryCount: state.retryCount + 1,
                retryDelay: nextRetryDelay,
                error: `Connection lost. Retrying in ${nextRetryDelay/1000} seconds... (Attempt ${state.retryCount + 1}/${maxRetries})`,
              }));

              setTimeout(() => {
                get().connect(projectId);
              }, nextRetryDelay);
            } else if (retryCount >= maxRetries) {
              set({ 
                error: 'Failed to connect after maximum retry attempts. Please check your connection and try again.',
              });
            }
          };

          newSocket.onerror = (error) => {
            console.error('WebSocket error:', error);
            set({ 
              error: 'Connection error occurred. Please check your network connection.',
            });
          };

          newSocket.onmessage = (event) => {
            try {
              const message = JSON.parse(event.data);
              set((state) => ({
                messages: [...state.messages.slice(-MAX_MESSAGES_HISTORY), message],
              }));

              switch (message.type) {
                case 'ElementUpdate':
                  useElementStore.getState().handleElementUpdate(message.payload.data);
                  break;
                case 'ElementDelete':
                  useElementStore.getState().handleElementDelete(message.payload.id);
                  break;
                case 'RelationshipUpdate':
                  useRelationshipStore.getState().handleRelationshipUpdate(message.payload.data);
                  break;
                case 'RelationshipDelete':
                  useRelationshipStore.getState().handleRelationshipDelete(message.payload.id);
                  break;
                case 'ViewUpdate':
                  useViewStore.getState().handleViewUpdate(
                    message.payload.project_id,
                    message.payload.view_type!,
                    message.payload.state
                  );
                  break;
                default:
                  console.warn('Unknown message type:', message.type);
              }
            } catch (error) {
              console.error('Failed to parse message:', error);
              set({ error: 'Failed to process server message.' });
            }
          };

          set({ socket: newSocket });
        } catch (error) {
          console.error('Failed to create WebSocket:', error);
          set({ 
            error: 'Failed to establish connection. Please try again.',
            connected: false,
          });
        }
      },

      disconnect: () => {
        const { socket } = get();
        if (socket) {
          socket.close(1000, 'Normal closure');
          set({ 
            socket: null, 
            connected: false,
            retryCount: 0,
            retryDelay: INITIAL_RETRY_DELAY,
            queueProcessing: false,
          });
        }
      },

      sendMessage: async (message: WebSocketMessage) => {
        const { socket, connected, messageQueue, maxQueueSize } = get();
        
        // キューが最大サイズに達している場合は古いメッセージを削除
        if (messageQueue.length >= maxQueueSize) {
          set((state) => ({
            messageQueue: [...state.messageQueue.slice(1), message],
          }));
          console.warn('Message queue is full, dropping oldest message');
        } else {
          set((state) => ({
            messageQueue: [...state.messageQueue, message],
          }));
        }

        // 接続中の場合はキューの処理を開始
        if (socket && connected && !get().queueProcessing) {
          get().processMessageQueue();
        }
      },

      processMessageQueue: async () => {
        const { socket, connected, messageQueue } = get();
        if (!socket || !connected || messageQueue.length === 0) {
          set({ queueProcessing: false });
          return;
        }

        set({ queueProcessing: true });

        while (get().messageQueue.length > 0 && get().connected) {
          const message = get().messageQueue[0];
          try {
            await new Promise<void>((resolve, reject) => {
              if (!get().socket || !get().connected) {
                reject(new Error('WebSocket is not connected'));
                return;
              }

              get().socket!.send(JSON.stringify(message));
              resolve();

              setTimeout(() => {
                reject(new Error('Message send timeout'));
              }, 5000);
            });

            // メッセージ送信成功
            set((state) => ({
              messageQueue: state.messageQueue.slice(1),
            }));
          } catch (error) {
            console.error('Failed to send message:', error);
            break;
          }

          // 次のメッセージ送信までの間隔を設定
          await new Promise(resolve => setTimeout(resolve, QUEUE_PROCESS_INTERVAL));
        }

        set({ queueProcessing: false });
      },

      resetError: () => {
        set({ error: null });
      },

      clearOldMessages: () => {
        set((state) => ({
          messages: state.messages.slice(-MAX_MESSAGES_HISTORY),
        }));
      },
    }),
    {
      name: 'websocket-store',
    }
  )
); 