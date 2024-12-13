import { act, renderHook } from '@testing-library/react';
import { useWebSocketStore } from '../websocket';
import WS from 'jest-websocket-mock';

describe('WebSocket Store', () => {
  let server: WS;
  const PROJECT_ID = 'test-project';
  const WS_URL = 'ws://localhost:3000';

  beforeEach(() => {
    server = new WS(`${WS_URL}/ws/projects/${PROJECT_ID}`);
  });

  afterEach(() => {
    WS.clean();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useWebSocketStore());
    
    expect(result.current.socket).toBeNull();
    expect(result.current.connected).toBeFalsy();
    expect(result.current.messages).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.retryCount).toBe(0);
    expect(result.current.messageQueue).toEqual([]);
    expect(result.current.queueProcessing).toBeFalsy();
  });

  it('should connect to WebSocket server', async () => {
    const { result } = renderHook(() => useWebSocketStore());

    act(() => {
      result.current.connect(PROJECT_ID);
    });

    await server.connected;
    
    expect(result.current.connected).toBeTruthy();
    expect(result.current.socket).not.toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should handle connection errors', async () => {
    const { result } = renderHook(() => useWebSocketStore());
    server.close();

    act(() => {
      result.current.connect(PROJECT_ID);
    });

    // Wait for retry attempt
    await new Promise(resolve => setTimeout(resolve, 1100));

    expect(result.current.connected).toBeFalsy();
    expect(result.current.error).not.toBeNull();
    expect(result.current.retryCount).toBeGreaterThan(0);
  });

  it('should send and receive messages', async () => {
    const { result } = renderHook(() => useWebSocketStore());

    act(() => {
      result.current.connect(PROJECT_ID);
    });

    await server.connected;

    const testMessage = {
      type: 'ElementUpdate',
      payload: {
        id: 'test-id',
        project_id: PROJECT_ID,
        data: { test: 'data' },
        timestamp: new Date().toISOString(),
        user_id: 'test-user',
      },
    };

    act(() => {
      result.current.sendMessage(testMessage);
    });

    await expect(server).toReceiveMessage(JSON.stringify(testMessage));

    act(() => {
      server.send(JSON.stringify(testMessage));
    });

    expect(result.current.messages).toContainEqual(testMessage);
  });

  it('should handle message queue', async () => {
    const { result } = renderHook(() => useWebSocketStore());

    // 接続を切断した状態で複数のメッセージを送信
    const messages = Array.from({ length: 5 }, (_, i) => ({
      type: 'ElementUpdate',
      payload: {
        id: `test-id-${i}`,
        project_id: PROJECT_ID,
        data: { test: `data-${i}` },
        timestamp: new Date().toISOString(),
        user_id: 'test-user',
      },
    }));

    for (const message of messages) {
      act(() => {
        result.current.sendMessage(message);
      });
    }

    expect(result.current.messageQueue).toHaveLength(messages.length);

    // 接続を確立
    act(() => {
      result.current.connect(PROJECT_ID);
    });

    await server.connected;

    // キューの処理を待つ
    await new Promise(resolve => setTimeout(resolve, messages.length * 100 + 100));

    // すべてのメッセージが送信されたことを確認
    for (const message of messages) {
      await expect(server).toReceiveMessage(JSON.stringify(message));
    }

    expect(result.current.messageQueue).toHaveLength(0);
  });

  it('should handle message history limit', async () => {
    const { result } = renderHook(() => useWebSocketStore());

    act(() => {
      result.current.connect(PROJECT_ID);
    });

    await server.connected;

    // 最大履歴数以上のメッセージを送信
    const messages = Array.from({ length: 150 }, (_, i) => ({
      type: 'ElementUpdate',
      payload: {
        id: `test-id-${i}`,
        project_id: PROJECT_ID,
        data: { test: `data-${i}` },
        timestamp: new Date().toISOString(),
        user_id: 'test-user',
      },
    }));

    for (const message of messages) {
      act(() => {
        server.send(JSON.stringify(message));
      });
    }

    expect(result.current.messages.length).toBeLessThanOrEqual(100);
  });

  it('should handle disconnection and cleanup', async () => {
    const { result } = renderHook(() => useWebSocketStore());

    act(() => {
      result.current.connect(PROJECT_ID);
    });

    await server.connected;

    act(() => {
      result.current.disconnect();
    });

    expect(result.current.socket).toBeNull();
    expect(result.current.connected).toBeFalsy();
    expect(result.current.retryCount).toBe(0);
    expect(result.current.queueProcessing).toBeFalsy();
  });

  it('should handle error reset', () => {
    const { result } = renderHook(() => useWebSocketStore());

    act(() => {
      useWebSocketStore.setState({ error: 'Test error' });
    });

    expect(result.current.error).toBe('Test error');

    act(() => {
      result.current.resetError();
    });

    expect(result.current.error).toBeNull();
  });
}); 