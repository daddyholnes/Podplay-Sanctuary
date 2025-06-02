import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ScoutMiniAppsHub from '../ScoutMiniAppsHub';
import miniAppsApi from '@/services/miniAppsApi';

// Mock the MiniApps API
vi.mock('@/services/miniAppsApi', () => ({
  default: {
    getApps: vi.fn(),
    getInstalledApps: vi.fn(),
    getFeaturedApps: vi.fn(),
    getAppDetails: vi.fn(),
    installApp: vi.fn(),
    uninstallApp: vi.fn(),
    launchApp: vi.fn(),
    recordUsage: vi.fn()
  }
}));

// Mock data
const mockApps = [
  {
    id: 'image-processor',
    name: 'Image Processor',
    description: 'Edit, convert and optimize images with AI assistance',
    category: 'media',
    author: 'Scout Labs',
    rating: 4.8,
    downloads: 12350,
    icon: '🖼️',
    color: '#8B5CF6',
    installed: true,
    featured: true,
    tags: ['images', 'editing', 'AI'],
    lastUsed: '2025-05-10T14:30:00Z'
  },
  {
    id: 'code-generator',
    name: 'Code Generator',
    description: 'Generate code snippets for various programming languages',
    category: 'development',
    author: 'DevTools',
    rating: 4.7,
    downloads: 9870,
    icon: '👨‍💻',
    color: '#EC4899',
    installed: true,
    featured: false,
    tags: ['code', 'development', 'snippets'],
    lastUsed: '2025-05-12T09:15:00Z'
  },
  {
    id: 'task-manager',
    name: 'Task Manager',
    description: 'Organize and track your tasks with smart prioritization',
    category: 'productivity',
    author: 'ProdTools',
    rating: 4.9,
    downloads: 15640,
    icon: '📋',
    color: '#10B981',
    installed: false,
    featured: true,
    tags: ['productivity', 'tasks', 'organization']
  },
  {
    id: 'voice-recorder',
    name: 'Voice Recorder',
    description: 'Record and transcribe voice notes with AI-powered transcription',
    category: 'media',
    author: 'AudioTools',
    rating: 4.6,
    downloads: 7830,
    icon: '🎙️',
    color: '#F59E0B',
    installed: false,
    featured: false,
    tags: ['audio', 'recording', 'transcription']
  }
];

// Helper to render with ThemeProvider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider>{ui}</ThemeProvider>
  );
};

describe('ScoutMiniAppsHub Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    
    // Set up default mock returns
    miniAppsApi.getInstalledApps.mockResolvedValue(mockApps.filter(app => app.installed));
    miniAppsApi.getApps.mockResolvedValue(mockApps);
    miniAppsApi.installApp.mockResolvedValue({ success: true, message: 'App installed successfully' });
    miniAppsApi.uninstallApp.mockResolvedValue({ success: true, message: 'App uninstalled successfully' });
    miniAppsApi.launchApp.mockResolvedValue({ 
      sessionId: 'test-session-123', 
      appData: {}, 
      url: 'http://localhost:3000/app/image-processor' 
    });
    miniAppsApi.recordUsage.mockResolvedValue(undefined);
  });

  it('should render and call the API to fetch installed apps', async () => {
    renderWithTheme(<ScoutMiniAppsHub />);
    
    // Verify component renders
    expect(screen.getByText(/Scout Mini Apps/i)).toBeTruthy();
    
    // Verify API was called
    await waitFor(() => {
      expect(miniAppsApi.getInstalledApps).toHaveBeenCalledTimes(1);
    }, { timeout: 3000 });
  });

  it('should switch between tabs and call appropriate APIs', async () => {
    renderWithTheme(<ScoutMiniAppsHub />);
    
    // Wait for initial API call
    await waitFor(() => {
      expect(miniAppsApi.getInstalledApps).toHaveBeenCalled();
    }, { timeout: 3000 });
    
    // Find and click discover tab
    const discoverTab = screen.getByText('Discover');
    expect(discoverTab).toBeTruthy();
    fireEvent.click(discoverTab);
    
    // Verify the appropriate API was called when switching tabs
    await waitFor(() => {
      expect(miniAppsApi.getApps).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('should have category filtering UI elements', async () => {
    renderWithTheme(<ScoutMiniAppsHub />);
    
    // Verify component renders with category dropdown
    const categorySelects = screen.getAllByRole('combobox');
    expect(categorySelects.length).toBeGreaterThan(0);
    
    // Check if the dropdown has category options
    const firstSelect = categorySelects[0];
    expect(firstSelect.value).toBe('all');
    
    // Verify category options exist
    const categoryOptions = within(firstSelect).getAllByRole('option');
    expect(categoryOptions.length).toBeGreaterThan(1);
  });

  it('should have a working search input', async () => {
    renderWithTheme(<ScoutMiniAppsHub />);
    
    // Find the search input
    const searchInput = screen.getByPlaceholderText('Search mini apps...');
    expect(searchInput).toBeTruthy();
    
    // Verify search input accepts text
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    expect((searchInput as HTMLInputElement).value).toBe('test search');
  });

  it('should call installApp API when a button is clicked', async () => {
    // Mock tools with one not installed item
    miniAppsApi.getApps.mockResolvedValueOnce([{
      id: 'test-app',
      name: 'Test App',
      description: 'A test app',
      category: 'test',
      author: 'Test Author',
      rating: 4.5,
      downloads: 100,
      icon: '🧪',
      color: '#8B5CF6',
      installed: false,
      featured: true,
      tags: ['test']
    }]);
    
    renderWithTheme(<ScoutMiniAppsHub />);
    
    // Switch to discover view
    fireEvent.click(screen.getByText('Discover'));
    
    // Wait for the component to update after API call
    await waitFor(() => {
      expect(miniAppsApi.getApps).toHaveBeenCalled();
    }, { timeout: 3000 });
    
    // Find an Install button and click it
    const installButton = await screen.findByText('Install');
    fireEvent.click(installButton);
    
    // Verify the API call
    await waitFor(() => {
      expect(miniAppsApi.installApp).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('should call uninstallApp API when uninstall action is triggered', async () => {
    // Mock with an installed app
    miniAppsApi.getInstalledApps.mockResolvedValueOnce([{
      id: 'test-app',
      name: 'Test App',
      description: 'A test app',
      category: 'test',
      author: 'Test Author',
      rating: 4.5,
      downloads: 100,
      icon: '🧪',
      color: '#8B5CF6',
      installed: true,
      featured: true,
      tags: ['test']
    }]);
    
    renderWithTheme(<ScoutMiniAppsHub />);
    
    // Wait for the API to be called and component to update
    await waitFor(() => {
      expect(miniAppsApi.getInstalledApps).toHaveBeenCalled();
    }, { timeout: 3000 });

    // Look for any Uninstall button
    const uninstallButton = await screen.findByText('Uninstall');
    fireEvent.click(uninstallButton);
    
    // Verify API was called
    await waitFor(() => {
      expect(miniAppsApi.uninstallApp).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('should call launch APIs when launch action is triggered', async () => {
    // Mock with an installed app
    miniAppsApi.getInstalledApps.mockResolvedValueOnce([{
      id: 'test-app',
      name: 'Test App',
      description: 'A test app',
      category: 'test',
      author: 'Test Author',
      rating: 4.5,
      downloads: 100,
      icon: '🧪',
      color: '#8B5CF6',
      installed: true,
      featured: true,
      tags: ['test']
    }]);
    
    renderWithTheme(<ScoutMiniAppsHub />);
    
    // Wait for the component to update after API call
    await waitFor(() => {
      expect(miniAppsApi.getInstalledApps).toHaveBeenCalled();
    }, { timeout: 3000 });
    
    // Find and click the Launch button
    const launchButton = await screen.findByText('Launch');
    fireEvent.click(launchButton);
    
    // Verify API calls were made
    await waitFor(() => {
      expect(miniAppsApi.launchApp).toHaveBeenCalled();
      expect(miniAppsApi.recordUsage).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('should display error state when API call fails', async () => {
    // Mock API failure
    miniAppsApi.getInstalledApps.mockRejectedValueOnce(new Error('API error'));
    
    renderWithTheme(<ScoutMiniAppsHub />);
    
    // Approach the test differently by checking for error-related elements
    await waitFor(() => {
      // Look for any error indicator element that is likely to exist
      const errorElements = [
        () => screen.queryByText(/Error/i),
        () => screen.queryByText(/Failed/i),
        () => screen.queryByText(/Try Again/i),
        () => document.querySelector('.bg-red-100'),
        () => document.querySelector('.dark\\:bg-red-900'),
        () => document.querySelector('[class*="text-red"]')
      ];
      
      // Check if any error indicators are found
      const hasErrorElement = errorElements.some(finder => finder() !== null);
      expect(hasErrorElement).toBe(true);
    }, { timeout: 3000 });
  });

  it('should display purple-themed UI elements', async () => {
    renderWithTheme(<ScoutMiniAppsHub />);
    
    // First wait for component to render fully
    await screen.findByText(/Scout Mini Apps/i);
    
    // Check for purple elements in the UI even before data loads
    const purpleElements = document.querySelectorAll('.border-purple-500, .text-purple-700, .dark\\:text-purple-300, .bg-purple-gradient');
    expect(purpleElements.length).toBeGreaterThan(0);
    
    // The purple gradient is used on the Create Mini App button
    const createButton = screen.getByText(/Create Mini App/i);
    expect(createButton.closest('.bg-purple-gradient')).toBeTruthy();
  });
});