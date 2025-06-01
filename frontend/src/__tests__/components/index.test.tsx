/**
 * @fileoverview Comprehensive test suite for UI Components
 * Tests component rendering, user interactions, accessibility,
 * props handling, and integration with application state
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from '../../store/rootReducer';
import { theme } from '../../styles/theme';
import { 
  Button, 
  Input, 
  Card, 
  Modal, 
  Sidebar, 
  Header, 
  Footer,
  LoadingSpinner,
  ErrorBoundary,
  Notification,
  FileTree,
  CodeEditor,
  ChatWindow,
  SearchBar,
  ProjectCard
} from '../../components';
import { 
  mockRenderWithProviders, 
  mockUser, 
  mockProject, 
  mockChatData,
  createMockStore 
} from '../utils';
import type { RootState } from '../../store';

// Test utilities
const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = createMockStore(preloadedState),
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </Provider>
  );

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

describe('Basic UI Components', () => {
  describe('Button Component', () => {
    it('should render with correct text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('should handle click events', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);
      
      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should show loading state', () => {
      render(<Button loading>Loading Button</Button>);
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should render different variants correctly', () => {
      const { rerender } = render(<Button variant="primary">Primary</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-primary');

      rerender(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-secondary');

      rerender(<Button variant="danger">Danger</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-danger');
    });

    it('should support different sizes', () => {
      const { rerender } = render(<Button size="small">Small</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-small');

      rerender(<Button size="large">Large</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-large');
    });

    it('should be accessible', () => {
      render(<Button aria-label="Accessible button">Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAccessibleName('Accessible button');
    });
  });

  describe('Input Component', () => {
    it('should render with label', () => {
      render(<Input label="Username" />);
      
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    });

    it('should handle value changes', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(<Input label="Test Input" onChange={handleChange} />);
      
      const input = screen.getByLabelText(/test input/i);
      await user.type(input, 'Hello World');
      
      expect(handleChange).toHaveBeenCalled();
      expect(input).toHaveValue('Hello World');
    });

    it('should show error state', () => {
      render(<Input label="Email" error="Invalid email format" />);
      
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toHaveClass('input-error');
    });

    it('should show placeholder text', () => {
      render(<Input placeholder="Enter your name" />);
      
      expect(screen.getByPlaceholderText(/enter your name/i)).toBeInTheDocument();
    });

    it('should support different input types', () => {
      const { rerender } = render(<Input type="email" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

      rerender(<Input type="password" />);
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password');
    });

    it('should be accessible with proper ARIA attributes', () => {
      render(
        <Input 
          label="Required Field" 
          required 
          error="This field is required"
          aria-describedby="error-message"
        />
      );
      
      const input = screen.getByLabelText(/required field/i);
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', 'error-message');
    });
  });

  describe('Card Component', () => {
    it('should render children content', () => {
      render(
        <Card>
          <h2>Card Title</h2>
          <p>Card content goes here</p>
        </Card>
      );
      
      expect(screen.getByText(/card title/i)).toBeInTheDocument();
      expect(screen.getByText(/card content goes here/i)).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Card className="custom-card">Content</Card>);
      
      expect(screen.getByTestId('card')).toHaveClass('custom-card');
    });

    it('should handle click events when clickable', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<Card onClick={handleClick} clickable>Clickable Card</Card>);
      
      await user.click(screen.getByTestId('card'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Modal Component', () => {
    it('should render when open', () => {
      render(
        <Modal isOpen title="Test Modal">
          <p>Modal content</p>
        </Modal>
      );
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/test modal/i)).toBeInTheDocument();
      expect(screen.getByText(/modal content/i)).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(
        <Modal isOpen={false} title="Hidden Modal">
          <p>Hidden content</p>
        </Modal>
      );
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', async () => {
      const handleClose = jest.fn();
      const user = userEvent.setup();

      render(
        <Modal isOpen title="Closeable Modal" onClose={handleClose}>
          <p>Content</p>
        </Modal>
      );
      
      await user.click(screen.getByLabelText(/close modal/i));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('should close on Escape key press', async () => {
      const handleClose = jest.fn();
      const user = userEvent.setup();

      render(
        <Modal isOpen title="Escapable Modal" onClose={handleClose}>
          <p>Content</p>
        </Modal>
      );
      
      await user.keyboard('{Escape}');
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('should trap focus within modal', async () => {
      const user = userEvent.setup();

      render(
        <Modal isOpen title="Focus Trap Modal">
          <input placeholder="First input" />
          <input placeholder="Second input" />
          <button>Close</button>
        </Modal>
      );
      
      const firstInput = screen.getByPlaceholderText(/first input/i);
      const secondInput = screen.getByPlaceholderText(/second input/i);
      const closeButton = screen.getByRole('button', { name: /close/i });

      // Focus should start on first focusable element
      expect(firstInput).toHaveFocus();

      // Tab should move to next element
      await user.tab();
      expect(secondInput).toHaveFocus();

      await user.tab();
      expect(closeButton).toHaveFocus();

      // Tab from last element should wrap to first
      await user.tab();
      expect(firstInput).toHaveFocus();
    });
  });
});

describe('Complex UI Components', () => {
  describe('Sidebar Component', () => {
    it('should render navigation items', () => {
      const navItems = [
        { id: 'chat', label: 'Chat', icon: 'chat', path: '/chat' },
        { id: 'workspace', label: 'Workspace', icon: 'folder', path: '/workspace' },
        { id: 'scout', label: 'Scout', icon: 'analytics', path: '/scout' },
      ];

      renderWithProviders(<Sidebar items={navItems} />);
      
      navItems.forEach(item => {
        expect(screen.getByText(item.label)).toBeInTheDocument();
      });
    });

    it('should highlight active item', () => {
      const navItems = [
        { id: 'chat', label: 'Chat', icon: 'chat', path: '/chat' },
        { id: 'workspace', label: 'Workspace', icon: 'folder', path: '/workspace' },
      ];

      renderWithProviders(<Sidebar items={navItems} activeItem="workspace" />);
      
      const workspaceItem = screen.getByText(/workspace/i).closest('a');
      expect(workspaceItem).toHaveClass('active');
    });

    it('should be collapsible', async () => {
      const user = userEvent.setup();
      const navItems = [
        { id: 'chat', label: 'Chat', icon: 'chat', path: '/chat' },
      ];

      renderWithProviders(<Sidebar items={navItems} collapsible />);
      
      const toggleButton = screen.getByLabelText(/toggle sidebar/i);
      await user.click(toggleButton);
      
      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveClass('collapsed');
    });
  });

  describe('Header Component', () => {
    it('should render user information', () => {
      renderWithProviders(<Header user={mockUser} />);
      
      expect(screen.getByText(mockUser.name)).toBeInTheDocument();
      expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    });

    it('should show theme toggle', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<Header user={mockUser} />);
      
      const themeToggle = screen.getByLabelText(/toggle theme/i);
      expect(themeToggle).toBeInTheDocument();
      
      await user.click(themeToggle);
      // Verify theme change in store
    });

    it('should display notifications count', () => {
      const initialState = {
        ui: {
          notifications: [
            { id: '1', type: 'info', title: 'Test', message: 'Test notification' },
            { id: '2', type: 'warning', title: 'Warning', message: 'Warning notification' },
          ],
        },
      };

      renderWithProviders(<Header user={mockUser} />, { preloadedState: initialState });
      
      expect(screen.getByText('2')).toBeInTheDocument(); // Notification count
    });
  });

  describe('FileTree Component', () => {
    const mockFileStructure = {
      id: 'root',
      name: 'project',
      type: 'folder',
      children: [
        {
          id: 'src',
          name: 'src',
          type: 'folder',
          children: [
            { id: 'app.tsx', name: 'App.tsx', type: 'file' },
            { id: 'index.ts', name: 'index.ts', type: 'file' },
          ],
        },
        { id: 'package.json', name: 'package.json', type: 'file' },
      ],
    };

    it('should render file structure', () => {
      renderWithProviders(<FileTree structure={mockFileStructure} />);
      
      expect(screen.getByText('project')).toBeInTheDocument();
      expect(screen.getByText('src')).toBeInTheDocument();
      expect(screen.getByText('package.json')).toBeInTheDocument();
    });

    it('should expand/collapse folders', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<FileTree structure={mockFileStructure} />);
      
      const srcFolder = screen.getByText('src');
      expect(screen.queryByText('App.tsx')).not.toBeVisible();
      
      await user.click(srcFolder);
      expect(screen.getByText('App.tsx')).toBeVisible();
      expect(screen.getByText('index.ts')).toBeVisible();
    });

    it('should handle file selection', async () => {
      const handleFileSelect = jest.fn();
      const user = userEvent.setup();
      
      renderWithProviders(
        <FileTree structure={mockFileStructure} onFileSelect={handleFileSelect} />
      );
      
      await user.click(screen.getByText('src'));
      await user.click(screen.getByText('App.tsx'));
      
      expect(handleFileSelect).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'app.tsx', name: 'App.tsx' })
      );
    });

    it('should support context menu', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<FileTree structure={mockFileStructure} />);
      
      await user.pointer({
        target: screen.getByText('package.json'),
        keys: '[MouseRight]',
      });
      
      expect(screen.getByText(/rename/i)).toBeInTheDocument();
      expect(screen.getByText(/delete/i)).toBeInTheDocument();
    });
  });

  describe('ChatWindow Component', () => {
    const mockConversation = mockChatData.conversation;

    it('should render conversation messages', () => {
      renderWithProviders(<ChatWindow conversation={mockConversation} />);
      
      mockConversation.messages.forEach(message => {
        expect(screen.getByText(message.content)).toBeInTheDocument();
      });
    });

    it('should send new messages', async () => {
      const handleSendMessage = jest.fn();
      const user = userEvent.setup();
      
      renderWithProviders(
        <ChatWindow conversation={mockConversation} onSendMessage={handleSendMessage} />
      );
      
      const input = screen.getByPlaceholderText(/type your message/i);
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      await user.type(input, 'Hello, AI!');
      await user.click(sendButton);
      
      expect(handleSendMessage).toHaveBeenCalledWith('Hello, AI!');
      expect(input).toHaveValue('');
    });

    it('should send message on Enter key press', async () => {
      const handleSendMessage = jest.fn();
      const user = userEvent.setup();
      
      renderWithProviders(
        <ChatWindow conversation={mockConversation} onSendMessage={handleSendMessage} />
      );
      
      const input = screen.getByPlaceholderText(/type your message/i);
      
      await user.type(input, 'Quick message{Enter}');
      
      expect(handleSendMessage).toHaveBeenCalledWith('Quick message');
    });

    it('should show typing indicator', () => {
      renderWithProviders(
        <ChatWindow conversation={mockConversation} isTyping />
      );
      
      expect(screen.getByText(/ai is typing/i)).toBeInTheDocument();
    });

    it('should scroll to bottom on new messages', async () => {
      const scrollIntoViewMock = jest.fn();
      window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;
      
      const { rerender } = renderWithProviders(
        <ChatWindow conversation={mockConversation} />
      );
      
      const newMessage = {
        id: 'new-msg',
        content: 'New message',
        role: 'assistant' as const,
        timestamp: new Date().toISOString(),
      };
      
      const updatedConversation = {
        ...mockConversation,
        messages: [...mockConversation.messages, newMessage],
      };
      
      rerender(<ChatWindow conversation={updatedConversation} />);
      
      await waitFor(() => {
        expect(scrollIntoViewMock).toHaveBeenCalled();
      });
    });
  });

  describe('SearchBar Component', () => {
    it('should handle search input', async () => {
      const handleSearch = jest.fn();
      const user = userEvent.setup();
      
      renderWithProviders(<SearchBar onSearch={handleSearch} />);
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      
      await user.type(searchInput, 'test query');
      await user.keyboard('{Enter}');
      
      expect(handleSearch).toHaveBeenCalledWith('test query');
    });

    it('should show search suggestions', async () => {
      const suggestions = ['React components', 'TypeScript types', 'CSS styles'];
      const user = userEvent.setup();
      
      renderWithProviders(<SearchBar suggestions={suggestions} />);
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      
      await user.type(searchInput, 'React');
      
      expect(screen.getByText('React components')).toBeInTheDocument();
    });

    it('should support filters', async () => {
      const filters = [
        { id: 'files', label: 'Files', active: true },
        { id: 'content', label: 'Content', active: false },
      ];
      
      renderWithProviders(<SearchBar filters={filters} />);
      
      expect(screen.getByText('Files')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('ProjectCard Component', () => {
    it('should render project information', () => {
      renderWithProviders(<ProjectCard project={mockProject} />);
      
      expect(screen.getByText(mockProject.name)).toBeInTheDocument();
      expect(screen.getByText(mockProject.description)).toBeInTheDocument();
    });

    it('should handle project selection', async () => {
      const handleSelect = jest.fn();
      const user = userEvent.setup();
      
      renderWithProviders(
        <ProjectCard project={mockProject} onSelect={handleSelect} />
      );
      
      await user.click(screen.getByTestId('project-card'));
      
      expect(handleSelect).toHaveBeenCalledWith(mockProject);
    });

    it('should show project status', () => {
      const activeProject = { ...mockProject, status: 'active' };
      
      renderWithProviders(<ProjectCard project={activeProject} />);
      
      expect(screen.getByText(/active/i)).toBeInTheDocument();
    });
  });
});

describe('Utility Components', () => {
  describe('LoadingSpinner Component', () => {
    it('should render with default size', () => {
      render(<LoadingSpinner />);
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should render with custom size', () => {
      render(<LoadingSpinner size="large" />);
      
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('spinner-large');
    });

    it('should show loading text when provided', () => {
      render(<LoadingSpinner text="Loading data..." />);
      
      expect(screen.getByText(/loading data/i)).toBeInTheDocument();
    });
  });

  describe('ErrorBoundary Component', () => {
    const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div>No error</div>;
    };

    it('should render children when no error', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );
      
      expect(screen.getByText(/no error/i)).toBeInTheDocument();
    });

    it('should render error UI when error occurs', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/test error/i)).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('should allow error recovery', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const user = userEvent.setup();
      
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      
      const retryButton = screen.getByRole('button', { name: /try again/i });
      await user.click(retryButton);
      
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );
      
      expect(screen.getByText(/no error/i)).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Notification Component', () => {
    const mockNotification = {
      id: 'notif-1',
      type: 'success' as const,
      title: 'Success',
      message: 'Operation completed successfully',
      timestamp: Date.now(),
    };

    it('should render notification content', () => {
      render(<Notification notification={mockNotification} />);
      
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText(/operation completed successfully/i)).toBeInTheDocument();
    });

    it('should auto-dismiss after timeout', async () => {
      const handleDismiss = jest.fn();
      
      render(
        <Notification 
          notification={mockNotification} 
          onDismiss={handleDismiss}
          autoHide
          hideAfter={1000}
        />
      );
      
      await waitFor(() => {
        expect(handleDismiss).toHaveBeenCalledWith(mockNotification.id);
      }, { timeout: 1500 });
    });

    it('should handle manual dismissal', async () => {
      const handleDismiss = jest.fn();
      const user = userEvent.setup();
      
      render(
        <Notification 
          notification={mockNotification} 
          onDismiss={handleDismiss}
        />
      );
      
      await user.click(screen.getByLabelText(/dismiss notification/i));
      
      expect(handleDismiss).toHaveBeenCalledWith(mockNotification.id);
    });

    it('should render different types with appropriate styling', () => {
      const { rerender } = render(
        <Notification notification={{ ...mockNotification, type: 'error' }} />
      );
      
      expect(screen.getByTestId('notification')).toHaveClass('notification-error');
      
      rerender(
        <Notification notification={{ ...mockNotification, type: 'warning' }} />
      );
      
      expect(screen.getByTestId('notification')).toHaveClass('notification-warning');
    });
  });
});

describe('Accessibility', () => {
  it('should provide proper ARIA labels for interactive elements', () => {
    renderWithProviders(
      <div>
        <Button aria-label="Save document">Save</Button>
        <Input label="Email address" type="email" />
        <Modal isOpen title="Confirmation" aria-describedby="modal-description">
          <p id="modal-description">Are you sure you want to delete this item?</p>
        </Modal>
      </div>
    );
    
    expect(screen.getByRole('button')).toHaveAccessibleName('Save document');
    expect(screen.getByRole('textbox')).toHaveAccessibleName('Email address');
    expect(screen.getByRole('dialog')).toHaveAccessibleDescription(
      'Are you sure you want to delete this item?'
    );
  });

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(
      <div>
        <Button>First</Button>
        <Button>Second</Button>
        <Input label="Input field" />
        <Button>Third</Button>
      </div>
    );
    
    // Tab through focusable elements
    await user.tab();
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
    
    await user.tab();
    expect(screen.getByRole('button', { name: 'Second' })).toHaveFocus();
    
    await user.tab();
    expect(screen.getByLabelText('Input field')).toHaveFocus();
    
    await user.tab();
    expect(screen.getByRole('button', { name: 'Third' })).toHaveFocus();
  });

  it('should announce dynamic content changes to screen readers', async () => {
    const LiveRegionTest = () => {
      const [message, setMessage] = React.useState('');
      
      return (
        <div>
          <button onClick={() => setMessage('Content updated!')}>
            Update Content
          </button>
          <div aria-live="polite" aria-atomic="true">
            {message}
          </div>
        </div>
      );
    };
    
    const user = userEvent.setup();
    render(<LiveRegionTest />);
    
    await user.click(screen.getByRole('button'));
    
    expect(screen.getByText('Content updated!')).toBeInTheDocument();
    expect(screen.getByText('Content updated!')).toHaveAttribute('aria-live', 'polite');
  });

  it('should provide proper focus management in modals', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(
      <Modal isOpen title="Focus Test">
        <Input label="First input" />
        <Input label="Second input" />
        <Button>OK</Button>
        <Button>Cancel</Button>
      </Modal>
    );
    
    // Focus should be on first focusable element
    expect(screen.getByLabelText('First input')).toHaveFocus();
    
    // Tab through elements
    await user.tab();
    expect(screen.getByLabelText('Second input')).toHaveFocus();
    
    await user.tab();
    expect(screen.getByRole('button', { name: 'OK' })).toHaveFocus();
    
    await user.tab();
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    
    // Shift+Tab should go backwards
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'OK' })).toHaveFocus();
  });
});
