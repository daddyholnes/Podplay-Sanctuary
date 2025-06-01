/**
 * End-to-End Test Scenarios
 * 
 * Comprehensive E2E tests that simulate real user interactions
 * and verify complete application workflows from start to finish.
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { setupStore } from '../../store';
import App from '../../App';

// Mock implementations for E2E testing
const mockWebSocket = {
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  readyState: WebSocket.OPEN
};

// Mock file system API
const mockFileSystem = {
  showOpenFilePicker: jest.fn(),
  showSaveFilePicker: jest.fn(),
  requestPermission: jest.fn()
};

// Mock fetch for API calls
const mockFetch = jest.fn();

beforeAll(() => {
  // Setup global mocks
  global.WebSocket = jest.fn(() => mockWebSocket) as any;
  global.fetch = mockFetch;
  (global as any).showOpenFilePicker = mockFileSystem.showOpenFilePicker;
  (global as any).showSaveFilePicker = mockFileSystem.showSaveFilePicker;
  
  // Mock browser APIs
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
  
  // Mock ResizeObserver
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
  
  // Mock IntersectionObserver
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
});

const createE2EWrapper = (initialState = {}) => {
  const store = setupStore(initialState);
  
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );
};

const renderE2E = (initialState = {}) => {
  const Wrapper = createE2EWrapper(initialState);
  return render(<App />, { wrapper: Wrapper });
};

describe('End-to-End User Workflows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default successful responses
    mockFetch.mockImplementation((url: string, options: any) => {
      const method = options?.method || 'GET';
      
      // Authentication endpoints
      if (url.includes('/auth/login') && method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            token: 'test-token',
            user: { id: 1, name: 'Test User', email: 'test@example.com' }
          })
        });
      }
      
      // Workspace endpoints
      if (url.includes('/workspace/projects') && method === 'GET') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            projects: [
              { id: 'proj-1', name: 'Sample Project', type: 'typescript' },
              { id: 'proj-2', name: 'React App', type: 'react' }
            ]
          })
        });
      }
      
      // File tree endpoints
      if (url.includes('/files') && method === 'GET') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            files: [
              { id: 'file-1', name: 'src', type: 'directory', children: [
                { id: 'file-2', name: 'index.ts', type: 'file', size: 1024 },
                { id: 'file-3', name: 'App.tsx', type: 'file', size: 2048 }
              ]},
              { id: 'file-4', name: 'package.json', type: 'file', size: 512 }
            ]
          })
        });
      }
      
      // File content endpoints
      if (url.includes('/files/') && url.includes('/content') && method === 'GET') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            content: 'console.log("Hello World");',
            language: 'typescript',
            version: 1
          })
        });
      }
      
      // Chat endpoints
      if (url.includes('/chat/messages') && method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'msg-' + Date.now(),
            content: 'I can help you with that! What would you like to know?',
            role: 'assistant',
            timestamp: new Date().toISOString()
          })
        });
      }
      
      // MCP endpoints
      if (url.includes('/mcp/servers') && method === 'GET') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            servers: [
              { id: 'server-1', name: 'TypeScript Server', status: 'connected' },
              { id: 'server-2', name: 'Git Server', status: 'connected' }
            ]
          })
        });
      }
      
      // Scout analysis endpoints
      if (url.includes('/scout/analyze') && method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            analysis: {
              complexity: { score: 85, issues: ['High complexity in UserService.ts'] },
              security: { score: 92, vulnerabilities: [] },
              performance: { score: 78, suggestions: ['Consider lazy loading'] },
              dependencies: { outdated: 3, security: 0 }
            }
          })
        });
      }
      
      // Default response
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });
  });

  describe('New User Onboarding Flow', () => {
    test('complete first-time user experience', async () => {
      const user = userEvent.setup();
      
      renderE2E();
      
      // 1. Welcome screen appears for new users
      await waitFor(() => {
        expect(screen.getByText('Welcome to Podplay Sanctuary')).toBeInTheDocument();
      });
      
      // 2. User clicks "Get Started"
      const getStartedButton = screen.getByText('Get Started');
      await user.click(getStartedButton);
      
      // 3. Registration form appears
      await waitFor(() => {
        expect(screen.getByText('Create Your Account')).toBeInTheDocument();
      });
      
      // 4. Fill out registration form
      await user.type(screen.getByLabelText('Full Name'), 'John Developer');
      await user.type(screen.getByLabelText('Email'), 'john@example.com');
      await user.type(screen.getByLabelText('Password'), 'SecurePass123!');
      await user.type(screen.getByLabelText('Confirm Password'), 'SecurePass123!');
      
      // 5. Submit registration
      const signUpButton = screen.getByText('Sign Up');
      await user.click(signUpButton);
      
      // 6. Verify account creation and login
      await waitFor(() => {
        expect(screen.getByText('Welcome, John Developer!')).toBeInTheDocument();
      });
      
      // 7. Onboarding tour begins
      await waitFor(() => {
        expect(screen.getByText('Let\'s take a quick tour')).toBeInTheDocument();
      });
      
      // 8. Go through tour steps
      const nextButton = screen.getByText('Next');
      await user.click(nextButton); // Workspace tour
      await user.click(nextButton); // Chat tour
      await user.click(nextButton); // Scout tour
      
      // 9. Complete onboarding
      const finishButton = screen.getByText('Finish Tour');
      await user.click(finishButton);
      
      // 10. User lands on main dashboard
      await waitFor(() => {
        expect(screen.getByTestId('main-dashboard')).toBeInTheDocument();
      });
    });

    test('returning user login flow', async () => {
      const user = userEvent.setup();
      
      renderE2E();
      
      // 1. Click login for returning users
      const loginButton = screen.getByText('Sign In');
      await user.click(loginButton);
      
      // 2. Fill login form
      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      
      // 3. Submit login
      const submitButton = screen.getByText('Sign In');
      await user.click(submitButton);
      
      // 4. Verify successful login
      await waitFor(() => {
        expect(screen.getByText('Welcome back, Test User!')).toBeInTheDocument();
      });
      
      // 5. Should skip onboarding and go straight to dashboard
      await waitFor(() => {
        expect(screen.getByTestId('main-dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('Project Creation and Setup', () => {
    test('create new project from scratch', async () => {
      const user = userEvent.setup();
      
      renderE2E({
        auth: { user: { id: 1, name: 'Test User' }, token: 'test-token' }
      });
      
      // 1. Navigate to create project
      await user.click(screen.getByText('New Project'));
      
      // 2. Choose project template
      await waitFor(() => {
        expect(screen.getByText('Choose Template')).toBeInTheDocument();
      });
      
      const reactTemplate = screen.getByText('React TypeScript');
      await user.click(reactTemplate);
      
      // 3. Configure project settings
      await user.type(screen.getByLabelText('Project Name'), 'My Awesome App');
      await user.type(screen.getByLabelText('Description'), 'A new React application');
      await user.selectOptions(screen.getByLabelText('Package Manager'), 'npm');
      
      // 4. Select features
      await user.click(screen.getByLabelText('ESLint'));
      await user.click(screen.getByLabelText('Prettier'));
      await user.click(screen.getByLabelText('Tailwind CSS'));
      
      // 5. Create project
      const createButton = screen.getByText('Create Project');
      await user.click(createButton);
      
      // 6. Verify project creation progress
      await waitFor(() => {
        expect(screen.getByText('Creating project...')).toBeInTheDocument();
      });
      
      // 7. Project loads successfully
      await waitFor(() => {
        expect(screen.getByText('My Awesome App')).toBeInTheDocument();
        expect(screen.getByText('src')).toBeInTheDocument();
        expect(screen.getByText('package.json')).toBeInTheDocument();
      }, { timeout: 10000 });
    });

    test('import existing project', async () => {
      const user = userEvent.setup();
      
      // Mock file picker
      mockFileSystem.showOpenFilePicker.mockResolvedValue([{
        kind: 'directory',
        name: 'existing-project',
        getDirectoryHandle: jest.fn()
      }]);
      
      renderE2E({
        auth: { user: { id: 1, name: 'Test User' }, token: 'test-token' }
      });
      
      // 1. Click import project
      await user.click(screen.getByText('Import Project'));
      
      // 2. Select import method
      const fromFolderButton = screen.getByText('From Folder');
      await user.click(fromFolderButton);
      
      // 3. File picker opens (mocked)
      await waitFor(() => {
        expect(mockFileSystem.showOpenFilePicker).toHaveBeenCalled();
      });
      
      // 4. Project analysis begins
      await waitFor(() => {
        expect(screen.getByText('Analyzing project structure...')).toBeInTheDocument();
      });
      
      // 5. Import configuration
      await waitFor(() => {
        expect(screen.getByText('Configure Import')).toBeInTheDocument();
      });
      
      // 6. Confirm import settings
      const importButton = screen.getByText('Import Project');
      await user.click(importButton);
      
      // 7. Verify project imported
      await waitFor(() => {
        expect(screen.getByText('existing-project')).toBeInTheDocument();
      });
    });
  });

  describe('Development Workflow', () => {
    test('complete coding session', async () => {
      const user = userEvent.setup();
      
      renderE2E({
        auth: { user: { id: 1, name: 'Developer' }, token: 'test-token' },
        workspace: { currentProject: { id: 'proj-1', name: 'Sample Project' } }
      });
      
      // 1. Project loads with file tree
      await waitFor(() => {
        expect(screen.getByText('src')).toBeInTheDocument();
      });
      
      // 2. Open existing file
      await user.click(screen.getByText('index.ts'));
      
      // 3. Verify file opens in editor
      await waitFor(() => {
        expect(screen.getByTestId('code-editor')).toBeInTheDocument();
        expect(screen.getByText('console.log("Hello World");')).toBeInTheDocument();
      });
      
      // 4. Edit file content
      const editor = screen.getByTestId('code-editor');
      await user.clear(editor);
      await user.type(editor, `
        import { createApp } from './app';
        
        const app = createApp();
        app.start();
        
        console.log('Application started successfully');
      `);
      
      // 5. Save file
      fireEvent.keyDown(editor, { key: 's', ctrlKey: true });
      
      // 6. Verify save confirmation
      await waitFor(() => {
        expect(screen.getByText('File saved')).toBeInTheDocument();
      });
      
      // 7. Create new component
      fireEvent.contextMenu(screen.getByText('src'));
      await user.click(screen.getByText('New File'));
      await user.type(screen.getByPlaceholderText('Enter file name'), 'components/Button.tsx');
      await user.click(screen.getByText('Create'));
      
      // 8. Add component code
      const componentEditor = await screen.findByTestId('code-editor');
      await user.type(componentEditor, `
        import React from 'react';
        
        interface ButtonProps {
          children: React.ReactNode;
          onClick: () => void;
          variant?: 'primary' | 'secondary';
        }
        
        export const Button: React.FC<ButtonProps> = ({ 
          children, 
          onClick, 
          variant = 'primary' 
        }) => {
          return (
            <button 
              className={\`btn btn-\${variant}\`}
              onClick={onClick}
            >
              {children}
            </button>
          );
        };
      `);
      
      // 9. Save new component
      fireEvent.keyDown(componentEditor, { key: 's', ctrlKey: true });
      
      // 10. Verify component created
      await waitFor(() => {
        expect(screen.getByText('Button.tsx')).toBeInTheDocument();
      });
    });

    test('debugging and error handling', async () => {
      const user = userEvent.setup();
      
      renderE2E({
        auth: { user: { id: 1, name: 'Developer' }, token: 'test-token' }
      });
      
      // 1. Open file with errors
      await user.click(screen.getByText('App.tsx'));
      
      // 2. Introduce syntax error
      const editor = await screen.findByTestId('code-editor');
      await user.type(editor, `
        import React from 'react'
        
        function App() {
          const [count, setCount] = useState(0) // Missing import
          
          return (
            <div>
              <h1>Count: {count</h1> // Missing closing brace
            </div>
          );
        }
        
        export default App;
      `);
      
      // 3. Verify error indicators appear
      await waitFor(() => {
        expect(screen.getByTestId('error-indicator')).toBeInTheDocument();
      });
      
      // 4. Check problems panel
      await user.click(screen.getByText('Problems'));
      
      await waitFor(() => {
        expect(screen.getByText('useState is not defined')).toBeInTheDocument();
        expect(screen.getByText('Unexpected token')).toBeInTheDocument();
      });
      
      // 5. Fix errors
      await user.clear(editor);
      await user.type(editor, `
        import React, { useState } from 'react';
        
        function App() {
          const [count, setCount] = useState(0);
          
          return (
            <div>
              <h1>Count: {count}</h1>
              <button onClick={() => setCount(count + 1)}>
                Increment
              </button>
            </div>
          );
        }
        
        export default App;
      `);
      
      // 6. Verify errors cleared
      await waitFor(() => {
        expect(screen.queryByTestId('error-indicator')).not.toBeInTheDocument();
      });
    });
  });

  describe('AI Assistant Integration', () => {
    test('getting code assistance', async () => {
      const user = userEvent.setup();
      
      renderE2E({
        auth: { user: { id: 1, name: 'Developer' }, token: 'test-token' }
      });
      
      // 1. Navigate to chat
      await user.click(screen.getByText('Chat'));
      
      // 2. Ask for help
      const chatInput = screen.getByPlaceholderText('Type your message...');
      await user.type(chatInput, 'Can you help me create a TypeScript interface for a user profile?');
      
      // 3. Send message
      await user.click(screen.getByText('Send'));
      
      // 4. Verify message appears
      await waitFor(() => {
        expect(screen.getByText('Can you help me create a TypeScript interface for a user profile?')).toBeInTheDocument();
      });
      
      // 5. Wait for AI response
      await waitFor(() => {
        expect(screen.getByText('I can help you with that! What would you like to know?')).toBeInTheDocument();
      });
      
      // 6. Get code suggestion
      await user.clear(chatInput);
      await user.type(chatInput, 'Show me the interface with name, email, and age properties');
      await user.click(screen.getByText('Send'));
      
      // 7. Use code insertion feature
      const insertCodeButton = await screen.findByText('Insert Code');
      await user.click(insertCodeButton);
      
      // 8. Verify code inserted in editor
      await waitFor(() => {
        const editor = screen.getByTestId('code-editor');
        expect(editor).toHaveTextContent('interface UserProfile');
      });
    });

    test('using MCP tools', async () => {
      const user = userEvent.setup();
      
      renderE2E({
        auth: { user: { id: 1, name: 'Developer' }, token: 'test-token' }
      });
      
      // 1. Open MCP panel
      await user.click(screen.getByText('MCP'));
      
      // 2. Verify connected servers
      await waitFor(() => {
        expect(screen.getByText('TypeScript Server')).toBeInTheDocument();
        expect(screen.getByText('Git Server')).toBeInTheDocument();
      });
      
      // 3. Use TypeScript analysis tool
      await user.click(screen.getByText('TypeScript Server'));
      await user.click(screen.getByText('Analyze Types'));
      
      // 4. Verify tool execution
      await waitFor(() => {
        expect(screen.getByText('Running type analysis...')).toBeInTheDocument();
      });
      
      // 5. View results
      await waitFor(() => {
        expect(screen.getByText('Type Analysis Complete')).toBeInTheDocument();
      });
      
      // 6. Use Git tool
      await user.click(screen.getByText('Git Server'));
      await user.click(screen.getByText('Check Status'));
      
      // 7. Verify Git status
      await waitFor(() => {
        expect(screen.getByText('Repository Status')).toBeInTheDocument();
      });
    });
  });

  describe('Code Analysis and Optimization', () => {
    test('running comprehensive code analysis', async () => {
      const user = userEvent.setup();
      
      renderE2E({
        auth: { user: { id: 1, name: 'Developer' }, token: 'test-token' }
      });
      
      // 1. Navigate to Scout
      await user.click(screen.getByText('Scout'));
      
      // 2. Start comprehensive analysis
      const analyzeButton = screen.getByText('Run Full Analysis');
      await user.click(analyzeButton);
      
      // 3. Verify analysis progress
      await waitFor(() => {
        expect(screen.getByText('Analyzing code complexity...')).toBeInTheDocument();
      });
      
      // 4. Wait for analysis completion
      await waitFor(() => {
        expect(screen.getByText('Analysis Complete')).toBeInTheDocument();
      }, { timeout: 10000 });
      
      // 5. Review results
      expect(screen.getByText('Complexity Score: 85')).toBeInTheDocument();
      expect(screen.getByText('Security Score: 92')).toBeInTheDocument();
      expect(screen.getByText('Performance Score: 78')).toBeInTheDocument();
      
      // 6. View detailed issues
      await user.click(screen.getByText('View Issues'));
      
      await waitFor(() => {
        expect(screen.getByText('High complexity in UserService.ts')).toBeInTheDocument();
      });
      
      // 7. Get improvement suggestions
      await user.click(screen.getByText('Get Suggestions'));
      
      await waitFor(() => {
        expect(screen.getByText('Consider lazy loading')).toBeInTheDocument();
      });
      
      // 8. Apply automatic fixes
      const autoFixButton = screen.getByText('Apply Auto-fixes');
      await user.click(autoFixButton);
      
      // 9. Verify fixes applied
      await waitFor(() => {
        expect(screen.getByText('3 issues automatically fixed')).toBeInTheDocument();
      });
    });

    test('performance monitoring and optimization', async () => {
      const user = userEvent.setup();
      
      renderE2E({
        auth: { user: { id: 1, name: 'Developer' }, token: 'test-token' }
      });
      
      // 1. Go to performance section
      await user.click(screen.getByText('Scout'));
      await user.click(screen.getByText('Performance'));
      
      // 2. Start performance profiling
      const startProfilingButton = screen.getByText('Start Profiling');
      await user.click(startProfilingButton);
      
      // 3. Simulate some activity
      await user.click(screen.getByText('Workspace'));
      await user.click(screen.getByText('index.ts'));
      
      // Simulate editing
      const editor = await screen.findByTestId('code-editor');
      await user.type(editor, '\n// New comment');
      
      // 4. Stop profiling
      await user.click(screen.getByText('Scout'));
      await user.click(screen.getByText('Stop Profiling'));
      
      // 5. View performance report
      await waitFor(() => {
        expect(screen.getByText('Performance Report')).toBeInTheDocument();
      });
      
      // 6. Analyze bottlenecks
      expect(screen.getByText('Render Performance')).toBeInTheDocument();
      expect(screen.getByText('Memory Usage')).toBeInTheDocument();
      expect(screen.getByText('Bundle Size')).toBeInTheDocument();
      
      // 7. Get optimization recommendations
      await user.click(screen.getByText('Optimize'));
      
      await waitFor(() => {
        expect(screen.getByText('Optimization Suggestions')).toBeInTheDocument();
      });
    });
  });

  describe('Collaboration Features', () => {
    test('starting and managing collaboration session', async () => {
      const user = userEvent.setup();
      
      renderE2E({
        auth: { user: { id: 1, name: 'Host User' }, token: 'test-token' }
      });
      
      // 1. Start collaboration
      const collaborateButton = screen.getByText('Collaborate');
      await user.click(collaborateButton);
      
      // 2. Configure session
      await user.type(screen.getByLabelText('Session Name'), 'Code Review Session');
      await user.click(screen.getByLabelText('Allow editing'));
      await user.click(screen.getByLabelText('Voice chat'));
      
      // 3. Create session
      const createSessionButton = screen.getByText('Create Session');
      await user.click(createSessionButton);
      
      // 4. Verify session created
      await waitFor(() => {
        expect(screen.getByText('Collaboration session started')).toBeInTheDocument();
        expect(screen.getByText('Invite link: https://app.podplay.dev/join/abc123')).toBeInTheDocument();
      });
      
      // 5. Simulate user joining
      act(() => {
        const joinEvent = new CustomEvent('collaboration:user-joined', {
          detail: { userId: 'user-2', name: 'Guest User' }
        });
        window.dispatchEvent(joinEvent);
      });
      
      // 6. Verify user joined notification
      await waitFor(() => {
        expect(screen.getByText('Guest User joined the session')).toBeInTheDocument();
      });
      
      // 7. Test shared cursor
      const editor = screen.getByTestId('code-editor');
      fireEvent.click(editor);
      
      // Simulate receiving cursor position from other user
      act(() => {
        const cursorEvent = new CustomEvent('collaboration:cursor-update', {
          detail: { userId: 'user-2', position: { line: 5, column: 10 } }
        });
        window.dispatchEvent(cursorEvent);
      });
      
      // 8. Verify collaborative editing
      await waitFor(() => {
        expect(screen.getByTestId('guest-cursor-user-2')).toBeInTheDocument();
      });
    });

    test('real-time editing and conflict resolution', async () => {
      const user = userEvent.setup();
      
      renderE2E({
        auth: { user: { id: 1, name: 'User 1' }, token: 'test-token' }
      });
      
      // 1. Open file for editing
      await user.click(screen.getByText('App.tsx'));
      const editor = await screen.findByTestId('code-editor');
      
      // 2. Start editing
      await user.type(editor, 'const newVariable = "test";');
      
      // 3. Simulate conflicting edit from another user
      act(() => {
        const editEvent = new CustomEvent('collaboration:remote-edit', {
          detail: {
            userId: 'user-2',
            operation: {
              type: 'insert',
              position: { line: 1, column: 0 },
              text: 'import React from "react";\n'
            }
          }
        });
        window.dispatchEvent(editEvent);
      });
      
      // 4. Verify conflict detection
      await waitFor(() => {
        expect(screen.getByText('Edit conflict detected')).toBeInTheDocument();
      });
      
      // 5. Resolve conflict
      const resolveButton = screen.getByText('Accept Both Changes');
      await user.click(resolveButton);
      
      // 6. Verify resolution
      await waitFor(() => {
        expect(screen.getByText('Conflict resolved')).toBeInTheDocument();
      });
      
      // 7. Verify final content includes both changes
      expect(editor).toHaveTextContent('import React from "react";');
      expect(editor).toHaveTextContent('const newVariable = "test";');
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    test('handles network disconnection gracefully', async () => {
      const user = userEvent.setup();
      
      renderE2E({
        auth: { user: { id: 1, name: 'User' }, token: 'test-token' }
      });
      
      // 1. Simulate network disconnection
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      // 2. Try to perform action that requires network
      await user.click(screen.getByText('Scout'));
      await user.click(screen.getByText('Run Analysis'));
      
      // 3. Verify offline mode activation
      await waitFor(() => {
        expect(screen.getByText('You are offline')).toBeInTheDocument();
      });
      
      // 4. Verify offline functionality still works
      await user.click(screen.getByText('Workspace'));
      expect(screen.getByText('index.ts')).toBeInTheDocument();
      
      // 5. Simulate network restoration
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'online' })
      });
      
      // 6. Verify automatic reconnection
      await waitFor(() => {
        expect(screen.getByText('Connection restored')).toBeInTheDocument();
      });
    });

    test('recovers from application crashes', async () => {
      const user = userEvent.setup();
      
      // Mock error boundary
      const originalError = console.error;
      console.error = jest.fn();
      
      renderE2E({
        auth: { user: { id: 1, name: 'User' }, token: 'test-token' }
      });
      
      // 1. Simulate component error
      const errorButton = screen.getByTestId('trigger-error');
      await user.click(errorButton);
      
      // 2. Verify error boundary catches error
      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      });
      
      // 3. Verify error reporting
      expect(screen.getByText('Error has been reported')).toBeInTheDocument();
      
      // 4. Test recovery
      const retryButton = screen.getByText('Try Again');
      await user.click(retryButton);
      
      // 5. Verify application recovers
      await waitFor(() => {
        expect(screen.getByTestId('main-dashboard')).toBeInTheDocument();
      });
      
      console.error = originalError;
    });

    test('handles large file operations', async () => {
      const user = userEvent.setup();
      
      // Mock large file response
      mockFetch.mockImplementation((url) => {
        if (url.includes('/files/large-file/content')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              content: 'x'.repeat(1000000), // 1MB file
              language: 'javascript'
            })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });
      
      renderE2E({
        auth: { user: { id: 1, name: 'User' }, token: 'test-token' }
      });
      
      // 1. Open large file
      await user.click(screen.getByText('large-file.js'));
      
      // 2. Verify loading indicator
      expect(screen.getByText('Loading large file...')).toBeInTheDocument();
      
      // 3. Verify file loads with virtualization
      await waitFor(() => {
        expect(screen.getByTestId('virtual-editor')).toBeInTheDocument();
      }, { timeout: 10000 });
      
      // 4. Verify performance remains good
      const start = performance.now();
      await user.type(screen.getByTestId('virtual-editor'), 'test');
      const end = performance.now();
      
      expect(end - start).toBeLessThan(500); // Should respond quickly
    });
  });

  describe('Accessibility and User Experience', () => {
    test('keyboard navigation throughout application', async () => {
      const user = userEvent.setup();
      
      renderE2E({
        auth: { user: { id: 1, name: 'User' }, token: 'test-token' }
      });
      
      // 1. Tab through main navigation
      await user.tab();
      expect(screen.getByText('Workspace')).toHaveFocus();
      
      await user.tab();
      expect(screen.getByText('Chat')).toHaveFocus();
      
      await user.tab();
      expect(screen.getByText('Scout')).toHaveFocus();
      
      // 2. Use arrow keys in file tree
      await user.click(screen.getByText('Workspace'));
      await user.keyboard('[ArrowDown]');
      expect(screen.getByText('index.ts')).toHaveFocus();
      
      // 3. Open file with Enter key
      await user.keyboard('[Enter]');
      
      // 4. Verify editor receives focus
      await waitFor(() => {
        expect(screen.getByTestId('code-editor')).toHaveFocus();
      });
      
      // 5. Test command palette
      await user.keyboard('[ControlLeft>]p');
      
      await waitFor(() => {
        expect(screen.getByTestId('command-palette')).toBeInTheDocument();
      });
      
      // 6. Navigate command palette with keyboard
      await user.type(screen.getByTestId('command-input'), 'new file');
      await user.keyboard('[ArrowDown]');
      await user.keyboard('[Enter]');
      
      // 7. Verify command executed
      await waitFor(() => {
        expect(screen.getByText('Create New File')).toBeInTheDocument();
      });
    });

    test('screen reader compatibility', async () => {
      const user = userEvent.setup();
      
      renderE2E({
        auth: { user: { id: 1, name: 'User' }, token: 'test-token' }
      });
      
      // 1. Verify ARIA labels present
      expect(screen.getByLabelText('Main navigation')).toBeInTheDocument();
      expect(screen.getByLabelText('File tree')).toBeInTheDocument();
      expect(screen.getByLabelText('Code editor')).toBeInTheDocument();
      
      // 2. Verify live regions for announcements
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
      
      // 3. Test dynamic content announcements
      await user.click(screen.getByText('Run Analysis'));
      
      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent('Analysis started');
      });
      
      // 4. Verify semantic structure
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getAllByRole('navigation')).toHaveLength(2);
      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });

    test('responsive design and mobile experience', async () => {
      const user = userEvent.setup();
      
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      });
      
      // Mock touch events
      Object.defineProperty(window, 'ontouchstart', {
        writable: true,
        configurable: true,
        value: null
      });
      
      renderE2E({
        auth: { user: { id: 1, name: 'User' }, token: 'test-token' }
      });
      
      // 1. Verify mobile layout
      await waitFor(() => {
        expect(screen.getByTestId('mobile-layout')).toBeInTheDocument();
      });
      
      // 2. Test mobile navigation
      const menuButton = screen.getByLabelText('Open menu');
      await user.click(menuButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('mobile-sidebar')).toBeVisible();
      });
      
      // 3. Test touch gestures (simulated)
      const editor = screen.getByTestId('code-editor');
      
      // Simulate pinch to zoom
      fireEvent.touchStart(editor, {
        touches: [
          { clientX: 100, clientY: 100 },
          { clientX: 200, clientY: 200 }
        ]
      });
      
      fireEvent.touchMove(editor, {
        touches: [
          { clientX: 80, clientY: 80 },
          { clientX: 220, clientY: 220 }
        ]
      });
      
      // 4. Verify responsive behavior
      expect(screen.getByTestId('zoom-controls')).toBeInTheDocument();
    });
  });
});
