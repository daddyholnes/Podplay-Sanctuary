import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ScoutDevWorkspaces from '../ScoutDevWorkspaces';
import workspaceApi from '@/services/workspaceApi';

// Mock the workspace API
vi.mock('@/services/workspaceApi', () => ({
  default: {
    getProjects: vi.fn(),
    getProject: vi.fn(),
    getWorkspace: vi.fn(),
    getFiles: vi.fn(),
    getFileContent: vi.fn(),
    executeCommand: vi.fn(),
    getResourceUsage: vi.fn(),
  }
}));

// Sample test data
const mockProjects = [
  {
    id: 'project-1',
    name: 'Test Project',
    description: 'A test project',
    workspaces: [
      {
        id: 'workspace-1',
        name: 'Default Workspace',
        description: 'Default workspace for testing',
        gitBranch: 'main'
      }
    ]
  }
];

const mockFiles = [
  {
    id: 'file-1',
    name: 'index.js',
    path: '/index.js',
    type: 'file',
    size: 1024,
    lastModified: '2025-06-01T10:00:00Z'
  },
  {
    id: 'dir-1',
    name: 'src',
    path: '/src',
    type: 'directory',
    children: [
      {
        id: 'file-2',
        name: 'app.js',
        path: '/src/app.js',
        type: 'file',
        size: 2048,
        lastModified: '2025-06-01T10:00:00Z'
      }
    ]
  }
];

const mockFileContent = {
  content: 'console.log("Hello, world!");',
  language: 'javascript',
  lineCount: 1
};

const mockResources = {
  cpu: 25,
  memory: 40,
  disk: 60
};

// Helper function to render with theme context
const renderWithTheme = (ui) => {
  return render(
    <ThemeProvider>
      {ui}
    </ThemeProvider>
  );
};

describe('ScoutDevWorkspaces Component', () => {
  beforeEach(() => {
    // Reset and setup mocks before each test
    vi.resetAllMocks();
    workspaceApi.getProjects.mockResolvedValue(mockProjects);
    workspaceApi.getFiles.mockResolvedValue(mockFiles);
    workspaceApi.getFileContent.mockResolvedValue(mockFileContent);
    workspaceApi.executeCommand.mockResolvedValue({ id: 'cmd-123' });
    workspaceApi.getResourceUsage.mockResolvedValue(mockResources);
  });

  it('should render properly with loading state', () => {
    // Delay API response to test loading state
    workspaceApi.getProjects.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve(mockProjects), 100);
    }));
    
    renderWithTheme(<ScoutDevWorkspaces />);
    
    // Check if loading indicator is shown
    expect(screen.getByText(/loading/i)).toBeTruthy();
  });

  it('should render workspaces after loading', async () => {
    renderWithTheme(<ScoutDevWorkspaces />);
    
    // Wait for projects to load
    await waitFor(() => {
      expect(workspaceApi.getProjects).toHaveBeenCalled();
    });
    
    // Check if project name appears
    await waitFor(() => {
      expect(screen.getByText(/Test Project/i)).toBeTruthy();
    });
    
    // Check if workspace name appears
    await waitFor(() => {
      expect(screen.getByText(/Default Workspace/i)).toBeTruthy();
    });
  });

  it('should load file explorer data', async () => {
    renderWithTheme(<ScoutDevWorkspaces />);
    
    await waitFor(() => {
      expect(workspaceApi.getProjects).toHaveBeenCalled();
      expect(workspaceApi.getFiles).toHaveBeenCalled();
    });
    
    // Check if file names appear in the file explorer
    await waitFor(() => {
      expect(screen.getByText(/index.js/i)).toBeTruthy();
      expect(screen.getByText(/src/i)).toBeTruthy();
    });
  });

  it('should select a file and display its content', async () => {
    renderWithTheme(<ScoutDevWorkspaces />);
    
    await waitFor(() => {
      expect(workspaceApi.getProjects).toHaveBeenCalled();
      expect(workspaceApi.getFiles).toHaveBeenCalled();
    });
    
    // Find and click on a file
    const fileElement = await waitFor(() => screen.getByText(/index.js/i));
    fireEvent.click(fileElement);
    
    // Check if file content is loaded
    await waitFor(() => {
      expect(workspaceApi.getFileContent).toHaveBeenCalled();
    });
    
    // Check if content appears in the code editor
    await waitFor(() => {
      expect(screen.getByText(/console.log/i)).toBeTruthy();
    });
  });

  it('should execute terminal commands', async () => {
    renderWithTheme(<ScoutDevWorkspaces />);
    
    await waitFor(() => {
      expect(workspaceApi.getProjects).toHaveBeenCalled();
    });
    
    // Find terminal input and enter command
    const terminalInput = await waitFor(() => screen.getByPlaceholderText(/enter command/i));
    fireEvent.change(terminalInput, { target: { value: 'npm start' } });
    fireEvent.keyDown(terminalInput, { key: 'Enter', code: 'Enter' });
    
    // Check if command was executed
    await waitFor(() => {
      expect(workspaceApi.executeCommand).toHaveBeenCalledWith('project-1', 'workspace-1', 'npm start');
    });
  });

  it('should display resource usage', async () => {
    renderWithTheme(<ScoutDevWorkspaces />);
    
    await waitFor(() => {
      expect(workspaceApi.getProjects).toHaveBeenCalled();
      expect(workspaceApi.getResourceUsage).toHaveBeenCalled();
    });
    
    // Check if resource usage is displayed
    await waitFor(() => {
      expect(screen.getByText(/25%/i)).toBeTruthy(); // CPU usage
      expect(screen.getByText(/40%/i)).toBeTruthy(); // Memory usage
      expect(screen.getByText(/60%/i)).toBeTruthy(); // Disk usage
    });
  });

  it('should change layout mode', async () => {
    renderWithTheme(<ScoutDevWorkspaces />);
    
    await waitFor(() => {
      expect(workspaceApi.getProjects).toHaveBeenCalled();
    });
    
    // Find layout buttons and click on coding mode
    const codingLayoutButton = await waitFor(() => screen.getByTitle(/Coding Layout/i));
    fireEvent.click(codingLayoutButton);
    
    // Check if layout changes
    await waitFor(() => {
      // This would check for a CSS class or other indicator that the layout changed
      // The exact assertion depends on how your component updates the DOM
      expect(document.querySelector('.coding-layout')).toBeTruthy();
    });
  });
});
