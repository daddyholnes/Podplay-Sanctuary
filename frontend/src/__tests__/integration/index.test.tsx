/**
 * Integration Tests
 * 
 * Comprehensive integration tests that verify the interaction between
 * multiple components, services, and systems working together.
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { setupStore } from '../../store';
import { ApiService } from '../../services/ApiService';
import { SocketService } from '../../services/SocketService';
import { WorkspaceService } from '../../services/WorkspaceService';
import App from '../../App';
import { ChatWindow } from '../../components/chat/ChatWindow';
import { FileTree } from '../../components/workspace/FileTree';
import { CodeEditor } from '../../components/editor/CodeEditor';
import { SearchBar } from '../../components/search/SearchBar';

// Mock external dependencies
jest.mock('../../services/ApiService');
jest.mock('../../services/SocketService');
jest.mock('../../services/WorkspaceService');

const mockApiService = ApiService as jest.MockedClass<typeof ApiService>;
const mockSocketService = SocketService as jest.MockedClass<typeof SocketService>;
const mockWorkspaceService = WorkspaceService as jest.MockedClass<typeof WorkspaceService>;

// Test utilities
const createTestWrapper = (initialState = {}) => {
  const store = setupStore(initialState);
  
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );
};

const renderWithProviders = (component: React.ReactElement, initialState = {}) => {
  const Wrapper = createTestWrapper(initialState);
  return render(component, { wrapper: Wrapper });
};

describe('Application Integration Tests', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockApiService.prototype.get = jest.fn().mockResolvedValue({ data: [] });
    mockApiService.prototype.post = jest.fn().mockResolvedValue({ data: {} });
    mockSocketService.prototype.connect = jest.fn().mockResolvedValue(undefined);
    mockSocketService.prototype.disconnect = jest.fn().mockResolvedValue(undefined);
    mockWorkspaceService.prototype.loadProject = jest.fn().mockResolvedValue({
      id: 'test-project',
      name: 'Test Project',
      files: []
    });
  });

  describe('Full Application Flow', () => {
    test('loads application and initializes services', async () => {
      renderWithProviders(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('app-container')).toBeInTheDocument();
      });
      
      // Verify services are initialized
      expect(mockSocketService.prototype.connect).toHaveBeenCalled();
      expect(mockWorkspaceService.prototype.loadProject).toHaveBeenCalled();
    });

    test('handles user authentication flow', async () => {
      const user = userEvent.setup();
      
      // Mock authentication endpoints
      mockApiService.prototype.post
        .mockResolvedValueOnce({ data: { token: 'auth-token', user: { id: 1, name: 'Test User' } } });
      
      renderWithProviders(<App />);
      
      // Find and click login button
      const loginButton = await screen.findByText('Login');
      await user.click(loginButton);
      
      // Fill in login form
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      
      // Submit form
      const submitButton = screen.getByText('Sign In');
      await user.click(submitButton);
      
      // Verify authentication API call
      await waitFor(() => {
        expect(mockApiService.prototype.post).toHaveBeenCalledWith('/auth/login', {
          email: 'test@example.com',
          password: 'password123'
        });
      });
      
      // Verify user is logged in
      await waitFor(() => {
        expect(screen.getByText('Welcome, Test User')).toBeInTheDocument();
      });
    });

    test('navigates between different application sections', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<App />, {
        auth: { user: { id: 1, name: 'Test User' }, token: 'auth-token' }
      });
      
      // Navigate to workspace
      const workspaceTab = await screen.findByText('Workspace');
      await user.click(workspaceTab);
      
      await waitFor(() => {
        expect(screen.getByTestId('workspace-container')).toBeInTheDocument();
      });
      
      // Navigate to chat
      const chatTab = screen.getByText('Chat');
      await user.click(chatTab);
      
      await waitFor(() => {
        expect(screen.getByTestId('chat-container')).toBeInTheDocument();
      });
      
      // Navigate to scout
      const scoutTab = screen.getByText('Scout');
      await user.click(scoutTab);
      
      await waitFor(() => {
        expect(screen.getByTestId('scout-container')).toBeInTheDocument();
      });
    });
  });

  describe('Chat and MCP Integration', () => {
    test('sends chat message and receives MCP response', async () => {
      const user = userEvent.setup();
      
      // Mock MCP server response
      mockApiService.prototype.post
        .mockResolvedValueOnce({
          data: {
            id: 'msg-1',
            content: 'Hello! How can I help you?',
            role: 'assistant',
            timestamp: new Date().toISOString()
          }
        });
      
      renderWithProviders(<ChatWindow />);
      
      // Type message
      const messageInput = screen.getByPlaceholderText('Type your message...');
      await user.type(messageInput, 'Hello, what can you do?');
      
      // Send message
      const sendButton = screen.getByText('Send');
      await user.click(sendButton);
      
      // Verify message appears in chat
      await waitFor(() => {
        expect(screen.getByText('Hello, what can you do?')).toBeInTheDocument();
      });
      
      // Verify API call was made
      expect(mockApiService.prototype.post).toHaveBeenCalledWith('/chat/messages', {
        content: 'Hello, what can you do?',
        role: 'user'
      });
      
      // Verify response appears
      await waitFor(() => {
        expect(screen.getByText('Hello! How can I help you?')).toBeInTheDocument();
      });
    });

    test('executes MCP tool with parameters', async () => {
      const user = userEvent.setup();
      
      // Mock tool execution response
      mockApiService.prototype.post
        .mockResolvedValueOnce({
          data: {
            result: 'File created successfully',
            toolId: 'create-file',
            parameters: { name: 'test.txt', content: 'Hello World' }
          }
        });
      
      renderWithProviders(<ChatWindow />);
      
      // Send command that triggers tool execution
      const messageInput = screen.getByPlaceholderText('Type your message...');
      await user.type(messageInput, '/create-file test.txt "Hello World"');
      
      const sendButton = screen.getByText('Send');
      await user.click(sendButton);
      
      // Verify tool execution API call
      await waitFor(() => {
        expect(mockApiService.prototype.post).toHaveBeenCalledWith('/mcp/tools/execute', {
          toolId: 'create-file',
          parameters: { name: 'test.txt', content: 'Hello World' }
        });
      });
      
      // Verify tool result is displayed
      await waitFor(() => {
        expect(screen.getByText('File created successfully')).toBeInTheDocument();
      });
    });

    test('handles real-time collaboration events', async () => {
      // Mock WebSocket events
      const mockEmit = jest.fn();
      const mockOn = jest.fn();
      
      mockSocketService.prototype.emit = mockEmit;
      mockSocketService.prototype.on = mockOn;
      
      renderWithProviders(<ChatWindow />);
      
      // Simulate receiving a collaboration event
      const collaborationHandler = mockOn.mock.calls.find(
        call => call[0] === 'collaboration:user-joined'
      )?.[1];
      
      if (collaborationHandler) {
        act(() => {
          collaborationHandler({ userId: 'user-2', name: 'Jane Doe' });
        });
        
        await waitFor(() => {
          expect(screen.getByText('Jane Doe joined the session')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Workspace and File Management', () => {
    test('loads project and displays file tree', async () => {
      // Mock workspace data
      mockWorkspaceService.prototype.loadProject.mockResolvedValue({
        id: 'project-1',
        name: 'My Project',
        files: [
          { id: 'file-1', name: 'index.ts', path: '/src/index.ts', type: 'file' },
          { id: 'file-2', name: 'components', path: '/src/components', type: 'directory' },
          { id: 'file-3', name: 'App.tsx', path: '/src/components/App.tsx', type: 'file' }
        ]
      });
      
      renderWithProviders(<FileTree />);
      
      // Verify project loads
      await waitFor(() => {
        expect(screen.getByText('My Project')).toBeInTheDocument();
      });
      
      // Verify files are displayed
      expect(screen.getByText('index.ts')).toBeInTheDocument();
      expect(screen.getByText('components')).toBeInTheDocument();
      expect(screen.getByText('App.tsx')).toBeInTheDocument();
    });

    test('opens file in editor when clicked', async () => {
      const user = userEvent.setup();
      
      // Mock file content
      mockApiService.prototype.get.mockResolvedValue({
        data: {
          content: 'console.log("Hello World");',
          language: 'typescript'
        }
      });
      
      renderWithProviders(
        <div>
          <FileTree />
          <CodeEditor />
        </div>
      );
      
      // Wait for file tree to load
      await waitFor(() => {
        expect(screen.getByText('index.ts')).toBeInTheDocument();
      });
      
      // Click on file
      const fileItem = screen.getByText('index.ts');
      await user.click(fileItem);
      
      // Verify file content is loaded
      await waitFor(() => {
        expect(mockApiService.prototype.get).toHaveBeenCalledWith('/files/file-1/content');
      });
      
      // Verify editor shows content
      await waitFor(() => {
        expect(screen.getByText('console.log("Hello World");')).toBeInTheDocument();
      });
    });

    test('creates new file and updates file tree', async () => {
      const user = userEvent.setup();
      
      // Mock file creation
      mockApiService.prototype.post.mockResolvedValue({
        data: {
          id: 'new-file',
          name: 'newfile.ts',
          path: '/src/newfile.ts',
          type: 'file'
        }
      });
      
      renderWithProviders(<FileTree />);
      
      // Right-click to open context menu
      const fileTree = screen.getByTestId('file-tree');
      fireEvent.contextMenu(fileTree);
      
      // Click "New File" option
      const newFileOption = await screen.findByText('New File');
      await user.click(newFileOption);
      
      // Enter file name
      const nameInput = screen.getByPlaceholderText('Enter file name');
      await user.type(nameInput, 'newfile.ts');
      
      // Confirm creation
      const createButton = screen.getByText('Create');
      await user.click(createButton);
      
      // Verify API call
      expect(mockApiService.prototype.post).toHaveBeenCalledWith('/files', {
        name: 'newfile.ts',
        path: '/src/newfile.ts',
        type: 'file'
      });
      
      // Verify file appears in tree
      await waitFor(() => {
        expect(screen.getByText('newfile.ts')).toBeInTheDocument();
      });
    });

    test('saves file changes and syncs with server', async () => {
      const user = userEvent.setup();
      
      // Mock save response
      mockApiService.prototype.put.mockResolvedValue({
        data: { success: true, version: 2 }
      });
      
      renderWithProviders(<CodeEditor />);
      
      // Simulate editor content change
      const editor = screen.getByTestId('code-editor');
      
      // Type in editor
      fireEvent.change(editor, {
        target: { value: 'console.log("Updated content");' }
      });
      
      // Save file (Ctrl+S)
      fireEvent.keyDown(editor, { key: 's', ctrlKey: true });
      
      // Verify save API call
      await waitFor(() => {
        expect(mockApiService.prototype.put).toHaveBeenCalledWith('/files/file-1/content', {
          content: 'console.log("Updated content");'
        });
      });
      
      // Verify save confirmation
      await waitFor(() => {
        expect(screen.getByText('File saved')).toBeInTheDocument();
      });
    });
  });

  describe('Search and Scout Integration', () => {
    test('performs global search across project', async () => {
      const user = userEvent.setup();
      
      // Mock search results
      mockApiService.prototype.get.mockResolvedValue({
        data: {
          results: [
            {
              file: 'src/index.ts',
              line: 1,
              content: 'console.log("Hello World");',
              match: 'Hello'
            },
            {
              file: 'src/App.tsx',
              line: 5,
              content: 'function HelloComponent() {',
              match: 'Hello'
            }
          ],
          total: 2
        }
      });
      
      renderWithProviders(<SearchBar />);
      
      // Enter search query
      const searchInput = screen.getByPlaceholderText('Search project...');
      await user.type(searchInput, 'Hello');
      
      // Press Enter to search
      fireEvent.keyDown(searchInput, { key: 'Enter' });
      
      // Verify search API call
      await waitFor(() => {
        expect(mockApiService.prototype.get).toHaveBeenCalledWith('/search', {
          params: { query: 'Hello', includeFiles: true }
        });
      });
      
      // Verify search results
      await waitFor(() => {
        expect(screen.getByText('src/index.ts')).toBeInTheDocument();
        expect(screen.getByText('src/App.tsx')).toBeInTheDocument();
      });
    });

    test('runs code analysis with Scout', async () => {
      const user = userEvent.setup();
      
      // Mock analysis results
      mockApiService.prototype.post.mockResolvedValue({
        data: {
          analysis: {
            complexity: { score: 85, issues: [] },
            security: { score: 92, vulnerabilities: [] },
            performance: { score: 78, suggestions: ['Consider code splitting'] },
            dependencies: { outdated: 2, security: 0 }
          }
        }
      });
      
      renderWithProviders(<div data-testid="scout-container" />);
      
      // Trigger analysis
      const analyzeButton = screen.getByText('Analyze Code');
      await user.click(analyzeButton);
      
      // Verify analysis API call
      await waitFor(() => {
        expect(mockApiService.prototype.post).toHaveBeenCalledWith('/scout/analyze', {
          projectId: 'project-1',
          includeComplexity: true,
          includeSecurity: true,
          includePerformance: true
        });
      });
      
      // Verify analysis results
      await waitFor(() => {
        expect(screen.getByText('Complexity Score: 85')).toBeInTheDocument();
        expect(screen.getByText('Security Score: 92')).toBeInTheDocument();
        expect(screen.getByText('Performance Score: 78')).toBeInTheDocument();
      });
    });

    test('generates insights and recommendations', async () => {
      const user = userEvent.setup();
      
      // Mock insights generation
      mockApiService.prototype.post.mockResolvedValue({
        data: {
          insights: [
            {
              type: 'improvement',
              title: 'Code Duplication Detected',
              description: 'Found 3 instances of duplicate code that could be refactored',
              priority: 'medium',
              files: ['src/utils.ts', 'src/helpers.ts']
            },
            {
              type: 'security',
              title: 'Potential XSS Vulnerability',
              description: 'Direct HTML insertion detected in UserProfile component',
              priority: 'high',
              files: ['src/components/UserProfile.tsx']
            }
          ]
        }
      });
      
      renderWithProviders(<div data-testid="scout-container" />);
      
      // Generate insights
      const insightsButton = screen.getByText('Generate Insights');
      await user.click(insightsButton);
      
      // Verify insights API call
      await waitFor(() => {
        expect(mockApiService.prototype.post).toHaveBeenCalledWith('/scout/insights', {
          projectId: 'project-1',
          includeRecommendations: true
        });
      });
      
      // Verify insights display
      await waitFor(() => {
        expect(screen.getByText('Code Duplication Detected')).toBeInTheDocument();
        expect(screen.getByText('Potential XSS Vulnerability')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('handles API errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock API error
      mockApiService.prototype.get.mockRejectedValue(new Error('Network error'));
      
      renderWithProviders(<FileTree />);
      
      // Wait for error to be handled
      await waitFor(() => {
        expect(screen.getByText('Failed to load project files')).toBeInTheDocument();
      });
      
      // Verify retry button appears
      expect(screen.getByText('Retry')).toBeInTheDocument();
      
      // Click retry
      mockApiService.prototype.get.mockResolvedValue({ data: { files: [] } });
      const retryButton = screen.getByText('Retry');
      await user.click(retryButton);
      
      // Verify retry attempt
      await waitFor(() => {
        expect(mockApiService.prototype.get).toHaveBeenCalledTimes(2);
      });
    });

    test('handles WebSocket disconnection and reconnection', async () => {
      // Mock WebSocket disconnection
      const mockOnDisconnect = jest.fn();
      const mockOnReconnect = jest.fn();
      
      mockSocketService.prototype.on = jest.fn((event, handler) => {
        if (event === 'disconnect') mockOnDisconnect.mockImplementation(handler);
        if (event === 'reconnect') mockOnReconnect.mockImplementation(handler);
      });
      
      renderWithProviders(<App />);
      
      // Simulate disconnection
      act(() => {
        mockOnDisconnect();
      });
      
      await waitFor(() => {
        expect(screen.getByText('Connection lost. Attempting to reconnect...')).toBeInTheDocument();
      });
      
      // Simulate reconnection
      act(() => {
        mockOnReconnect();
      });
      
      await waitFor(() => {
        expect(screen.getByText('Connection restored')).toBeInTheDocument();
      });
    });

    test('handles large file operations efficiently', async () => {
      const user = userEvent.setup();
      
      // Mock large file content
      const largeContent = 'x'.repeat(1000000); // 1MB of content
      mockApiService.prototype.get.mockResolvedValue({
        data: { content: largeContent, language: 'javascript' }
      });
      
      renderWithProviders(<CodeEditor />);
      
      // Open large file
      const fileItem = screen.getByText('large-file.js');
      await user.click(fileItem);
      
      // Verify file loads without hanging
      await waitFor(() => {
        expect(screen.getByTestId('code-editor')).toBeInTheDocument();
      }, { timeout: 5000 });
      
      // Verify performance is acceptable
      const start = performance.now();
      fireEvent.change(screen.getByTestId('code-editor'), {
        target: { value: largeContent + '\n// Added line' }
      });
      const end = performance.now();
      
      expect(end - start).toBeLessThan(1000); // Should handle change in < 1s
    });

    test('handles concurrent operations safely', async () => {
      const user = userEvent.setup();
      
      // Mock multiple concurrent requests
      mockApiService.prototype.post
        .mockResolvedValueOnce({ data: { id: 'msg-1' } })
        .mockResolvedValueOnce({ data: { id: 'msg-2' } })
        .mockResolvedValueOnce({ data: { id: 'msg-3' } });
      
      renderWithProviders(<ChatWindow />);
      
      const messageInput = screen.getByPlaceholderText('Type your message...');
      const sendButton = screen.getByText('Send');
      
      // Send multiple messages rapidly
      await user.type(messageInput, 'Message 1');
      await user.click(sendButton);
      
      await user.clear(messageInput);
      await user.type(messageInput, 'Message 2');
      await user.click(sendButton);
      
      await user.clear(messageInput);
      await user.type(messageInput, 'Message 3');
      await user.click(sendButton);
      
      // Verify all messages are handled
      await waitFor(() => {
        expect(mockApiService.prototype.post).toHaveBeenCalledTimes(3);
      });
      
      // Verify messages appear in correct order
      await waitFor(() => {
        const messages = screen.getAllByTestId('chat-message');
        expect(messages[0]).toHaveTextContent('Message 1');
        expect(messages[1]).toHaveTextContent('Message 2');
        expect(messages[2]).toHaveTextContent('Message 3');
      });
    });
  });

  describe('Performance and Optimization', () => {
    test('lazy loads components efficiently', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<App />);
      
      // Initially only main components should be loaded
      expect(screen.getByTestId('app-container')).toBeInTheDocument();
      expect(screen.queryByTestId('scout-container')).not.toBeInTheDocument();
      
      // Navigate to Scout tab
      const scoutTab = await screen.findByText('Scout');
      await user.click(scoutTab);
      
      // Scout component should now be loaded
      await waitFor(() => {
        expect(screen.getByTestId('scout-container')).toBeInTheDocument();
      });
    });

    test('implements proper caching strategies', async () => {
      // Mock cached responses
      mockApiService.prototype.get
        .mockResolvedValueOnce({ data: { files: ['file1', 'file2'] } })
        .mockResolvedValueOnce({ data: { files: ['file1', 'file2'] } }); // Same response
      
      renderWithProviders(<FileTree />);
      
      // First load
      await waitFor(() => {
        expect(screen.getByText('file1')).toBeInTheDocument();
      });
      
      // Navigate away and back
      fireEvent.click(screen.getByText('Chat'));
      fireEvent.click(screen.getByText('Workspace'));
      
      // Should use cached data (no additional API call)
      await waitFor(() => {
        expect(screen.getByText('file1')).toBeInTheDocument();
      });
      
      // Should only have made one API call due to caching
      expect(mockApiService.prototype.get).toHaveBeenCalledTimes(1);
    });

    test('handles memory cleanup on component unmount', async () => {
      const { unmount } = renderWithProviders(<ChatWindow />);
      
      // Verify WebSocket listeners are set up
      expect(mockSocketService.prototype.on).toHaveBeenCalled();
      
      // Unmount component
      unmount();
      
      // Verify cleanup is called
      expect(mockSocketService.prototype.off).toHaveBeenCalled();
    });
  });
});

describe('End-to-End User Workflows', () => {
  test('complete development workflow', async () => {
    const user = userEvent.setup();
    
    // Start with authenticated user
    renderWithProviders(<App />, {
      auth: { user: { id: 1, name: 'Developer' }, token: 'auth-token' }
    });
    
    // 1. Load project
    await waitFor(() => {
      expect(screen.getByText('My Project')).toBeInTheDocument();
    });
    
    // 2. Create new file
    fireEvent.contextMenu(screen.getByTestId('file-tree'));
    await user.click(screen.getByText('New File'));
    await user.type(screen.getByPlaceholderText('Enter file name'), 'feature.ts');
    await user.click(screen.getByText('Create'));
    
    // 3. Edit file content
    await user.click(screen.getByText('feature.ts'));
    const editor = await screen.findByTestId('code-editor');
    await user.type(editor, 'export const newFeature = () => { return "Hello"; };');
    
    // 4. Save file
    fireEvent.keyDown(editor, { key: 's', ctrlKey: true });
    
    // 5. Run analysis
    await user.click(screen.getByText('Scout'));
    await user.click(screen.getByText('Analyze Code'));
    
    // 6. Get AI assistance
    await user.click(screen.getByText('Chat'));
    const chatInput = screen.getByPlaceholderText('Type your message...');
    await user.type(chatInput, 'Can you help me optimize this new feature?');
    await user.click(screen.getByText('Send'));
    
    // Verify complete workflow executed
    await waitFor(() => {
      expect(screen.getByText('Can you help me optimize this new feature?')).toBeInTheDocument();
    });
  });

  test('collaborative development session', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(<App />, {
      auth: { user: { id: 1, name: 'Developer 1' }, token: 'auth-token' }
    });
    
    // 1. Join collaboration session
    await user.click(screen.getByText('Start Collaboration'));
    
    // 2. Simulate another user joining
    const collaborationHandler = mockSocketService.prototype.on.mock.calls.find(
      call => call[0] === 'collaboration:user-joined'
    )?.[1];
    
    if (collaborationHandler) {
      act(() => {
        collaborationHandler({ userId: 'user-2', name: 'Developer 2' });
      });
    }
    
    // 3. Verify collaboration UI updates
    await waitFor(() => {
      expect(screen.getByText('Developer 2 joined')).toBeInTheDocument();
    });
    
    // 4. Share cursor position
    const editor = screen.getByTestId('code-editor');
    fireEvent.click(editor);
    
    // 5. Simulate receiving cursor update from other user
    const cursorHandler = mockSocketService.prototype.on.mock.calls.find(
      call => call[0] === 'collaboration:cursor-update'
    )?.[1];
    
    if (cursorHandler) {
      act(() => {
        cursorHandler({ userId: 'user-2', position: { line: 5, column: 10 } });
      });
    }
    
    // 6. Verify collaboration features work
    await waitFor(() => {
      expect(screen.getByTestId('user-cursor-user-2')).toBeInTheDocument();
    });
  });
});
