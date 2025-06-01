/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useChat } from '../hooks/useChat';

// Create a mock store
const createMockStore = () => {
  return configureStore({
    reducer: {
      chat: (state = {
        conversations: [],
        currentConversationId: null,
        messages: [],
        isLoading: false,
        error: null
      }, action) => {
        switch (action.type) {
          case 'chat/sendMessage':
            return {
              ...state,
              messages: [...state.messages, action.payload]
            };
          default:
            return state;
        }
      }
    }
  });
};

// Test wrapper component
const createWrapper = () => {
  const store = createMockStore();
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

describe('useChat', () => {
  test('should initialize with default state', () => {
    const { result } = renderHook(() => useChat(), {
      wrapper: createWrapper()
    });

    expect(result.current).toBeDefined();
    expect(typeof result.current.sendMessage).toBe('function');
  });

  test('should have sendMessage function', () => {
    const { result } = renderHook(() => useChat(), {
      wrapper: createWrapper()
    });

    expect(result.current.sendMessage).toBeDefined();
    expect(typeof result.current.sendMessage).toBe('function');
  });
});
