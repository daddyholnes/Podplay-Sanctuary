/**
 * Chat Hooks Tests
 * 
 * Test suite for the useChat hook functionality.
 * 
 * @fileoverview Tests for chat hooks functionality
 * @version 1.0.0
 * @author Podplay Sanctuary Team
 */

import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { useChat } from '../../hooks/chat/useChat';
import { 
  createMockStore, 
  createMockConversation, 
  mockFetch
} from '../utils';

// ============================================================================
// TEST SETUP
// ============================================================================

const createWrapper = (store = createMockStore()) => {
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

describe('Chat Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.reset();
  });

  // ============================================================================
  // useChat Hook Tests
  // ============================================================================

  describe('useChat', () => {    it('should initialize with default state', () => {
      const { result } = renderHook(() => useChat(), {
        wrapper: createWrapper(),
      });

      expect(result.current.conversations).toEqual([]);
      expect(result.current.conversation).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });    it('should send a message successfully', async () => {
      const mockConversation = createMockConversation();
      const store = createMockStore({
        chat: {
          conversations: [mockConversation],
          activeConversationId: mockConversation.id,
          messages: {},
          typing: {},
          loading: false,
          error: null,
        },
      });

      mockFetch.success({ 
        id: 'msg-123',
        content: 'Test message',
        conversationId: mockConversation.id,
      });

      const { result } = renderHook(() => useChat(), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.sendMessage('Test message');
      });

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should create a new conversation', async () => {
      mockFetch.success({
        id: 'conv-new',
        title: 'New Conversation',
        type: 'chat',
        agent: 'mama-bear',
      });

      const { result } = renderHook(() => useChat(), {
        wrapper: createWrapper(),
      });      await act(async () => {
        await result.current.createConversation('New Conversation', 'chat', 'mama-bear');
      });

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should switch conversations', () => {
      const mockConversation = createMockConversation();
      const store = createMockStore({
        chat: {
          conversations: [mockConversation],
          activeConversationId: null,
          messages: {},
          typing: {},
          loading: false,
          error: null,
        },
      });

      const { result } = renderHook(() => useChat(), {
        wrapper: createWrapper(store),
      });

      act(() => {
        result.current.switchConversation(mockConversation.id);
      });

      expect(result.current.conversation?.id).toBe(mockConversation.id);
    });
  });
});
