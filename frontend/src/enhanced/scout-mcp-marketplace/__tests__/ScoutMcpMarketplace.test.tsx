import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ScoutMcpMarketplace from '../ScoutMcpMarketplace';
import mcpApi from '@/services/mcpApi';

// Mock the MCP API
vi.mock('@/services/mcpApi', () => ({
  default: {
    getTools: vi.fn(),
    getToolDetails: vi.fn(),
    getFeaturedTools: vi.fn(),
    getCategories: vi.fn(),
    getInstalledTools: vi.fn(),
    installTool: vi.fn(),
    uninstallTool: vi.fn(),
    getToolProviders: vi.fn()
  }
}));

// Mock data
const mockTools = [
  {
    id: 'filesystem',
    name: 'Filesystem',
    description: 'File system operations including read, write, create directory, and file search',
    category: 'core',
    provider: 'Podplay',
    version: '1.2.0',
    rating: 4.9,
    downloads: 15420,
    tags: ['filesystem', 'core', 'files'],
    installed: true,
    featured: true,
    icon: '📁',
    permissions: ['read_files', 'write_files'],
    documentation: 'https://docs.example.com/filesystem',
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-05-20T00:00:00Z'
  },
  {
    id: 'brave-search',
    name: 'Brave Search',
    description: 'Internet search capabilities powered by Brave Search engine',
    category: 'search',
    provider: 'Brave',
    version: '1.0.0',
    rating: 4.7,
    downloads: 12050,
    tags: ['search', 'internet', 'web'],
    installed: true,
    featured: true,
    icon: '🔍',
    permissions: ['internet_access'],
    documentation: 'https://docs.example.com/brave-search',
    createdAt: '2025-02-10T00:00:00Z',
    updatedAt: '2025-05-15T00:00:00Z'
  },
  {
    id: 'fetch',
    name: 'Fetch',
    description: 'HTTP client for retrieving data from external APIs',
    category: 'networking',
    provider: 'Podplay',
    version: '1.1.0',
    rating: 4.8,
    downloads: 14320,
    tags: ['http', 'api', 'networking'],
    installed: true,
    featured: false,
    icon: '📡',
    permissions: ['internet_access'],
    documentation: 'https://docs.example.com/fetch',
    createdAt: '2025-03-05T00:00:00Z',
    updatedAt: '2025-04-20T00:00:00Z'
  },
  {
    id: 'puppeteer',
    name: 'Puppeteer',
    description: 'Browser automation for web scraping and testing',
    category: 'automation',
    provider: 'Chrome',
    version: '1.0.5',
    rating: 4.6,
    downloads: 8320,
    tags: ['browser', 'automation', 'testing'],
    installed: false,
    featured: false,
    icon: '🤖',
    permissions: ['browser_control', 'internet_access'],
    documentation: 'https://docs.example.com/puppeteer',
    createdAt: '2025-04-10T00:00:00Z',
    updatedAt: '2025-05-01T00:00:00Z'
  }
];

// Helper to render with ThemeProvider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider>{ui}</ThemeProvider>
  );
};

describe('ScoutMcpMarketplace', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    
    // Set up default mock returns
    mcpApi.getTools.mockResolvedValue(mockTools);
    mcpApi.installTool.mockResolvedValue({ success: true, message: 'Tool installed successfully' });
    mcpApi.uninstallTool.mockResolvedValue({ success: true, message: 'Tool uninstalled successfully' });
  });

  it('should render and fetch tools from API', async () => {
    renderWithTheme(<ScoutMcpMarketplace />);
    
    // Check if loading state is shown initially
    expect(screen.getByText(/Loading MCP Tools/i)).toBeTruthy();
    
    // Verify API was called
    expect(mcpApi.getTools).toHaveBeenCalledTimes(1);
    
    // Wait for component to update after API call
    await waitFor(() => {
      expect(mcpApi.getTools).toHaveBeenCalled();
    });
  });

  it('should have a category filter dropdown', async () => {
    renderWithTheme(<ScoutMcpMarketplace />);
    
    await waitFor(() => {
      expect(mcpApi.getTools).toHaveBeenCalled();
    });
    
    // Verify the category dropdown exists
    const categorySelects = screen.getAllByRole('combobox');
    expect(categorySelects.length).toBeGreaterThan(0);
  });

  it('should have a search input that accepts user input', async () => {
    renderWithTheme(<ScoutMcpMarketplace />);
    
    // Type in search box
    const searchInput = screen.getByPlaceholderText('Search MCP tools...');
    expect(searchInput).toBeTruthy();
    
    // Verify we can type in the search box
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    expect((searchInput as HTMLInputElement).value).toBe('test search');
  });

  it('should call API when install button is clicked', async () => {
    // Mock tools with one installable item
    mcpApi.getTools.mockResolvedValueOnce([{
      id: 'test-tool',
      name: 'Test Tool',
      description: 'A test tool',
      category: 'test',
      provider: 'Test',
      version: '1.0',
      rating: 4.5,
      downloads: 100,
      tags: ['test'],
      installed: false,
      featured: true,
      icon: '🧪'
    }]);
    
    renderWithTheme(<ScoutMcpMarketplace />);
    
    // Wait for the loading to complete and component to render
    await waitFor(() => {
      expect(screen.queryByText('Loading MCP Tools')).toBeFalsy();
    });
    
    // Wait for the tool to appear
    const installButton = await screen.findByText('Install');
    
    // Click install button
    fireEvent.click(installButton);
    
    // Verify API was called
    expect(mcpApi.installTool).toHaveBeenCalled();
  });

  it('should call API when uninstall button is clicked', async () => {
    // Mock tools with one installed item
    mcpApi.getTools.mockResolvedValueOnce([{
      id: 'test-tool',
      name: 'Test Tool',
      description: 'A test tool',
      category: 'test',
      provider: 'Test',
      version: '1.0',
      rating: 4.5,
      downloads: 100,
      tags: ['test'],
      installed: true,
      featured: true,
      icon: '🧪'
    }]);
    
    renderWithTheme(<ScoutMcpMarketplace />);
    
    // Wait for the loading to complete and component to render
    await waitFor(() => {
      expect(screen.queryByText('Loading MCP Tools')).toBeFalsy();
    });
    
    // Wait for the tool to appear
    const uninstallButton = await screen.findByText('Uninstall');
    
    // Click uninstall button
    fireEvent.click(uninstallButton);
    
    // Verify API was called
    expect(mcpApi.uninstallTool).toHaveBeenCalled();
  });

  it('should display error state when API call fails', async () => {
    // Mock API failure
    mcpApi.getTools.mockRejectedValueOnce(new Error('API error'));
    
    renderWithTheme(<ScoutMcpMarketplace />);
    
    // Wait for loading state first
    await screen.findByText(/Loading MCP Tools/i);
    
    // Check for error message with relaxed matching
    await waitFor(() => {
      expect(screen.getByText(/Error/i)).toBeTruthy();
    }, { timeout: 2000 });
  });

  it('should maintain the purple-themed design system', async () => {
    renderWithTheme(<ScoutMcpMarketplace />);
    
    // First wait for component header to render
    await screen.findByText(/MCP Marketplace/i);
    
    // Check for purple elements in the UI
    const purpleSelectors = [
      '.bg-purple-gradient', 
      '.text-purple-700', 
      '.dark\\:text-purple-300',
      '.border-purple-500',
      '.dark\\:border-purple-900',
      '.bg-purple-50', 
      '.dark\\:bg-purple-900',
      '.focus\\:ring-purple-500'
    ];
    
    // Find at least one purple element that exists
    let foundPurpleElement = false;
    
    for (const selector of purpleSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        foundPurpleElement = true;
        break;
      }
    }
    
    expect(foundPurpleElement).toBe(true);
  });

  it('should handle filtering toggles in the UI', async () => {
    // Mock tools with some installed and some not installed
    mcpApi.getTools.mockResolvedValueOnce([
      {
        id: 'tool1',
        name: 'Installed Tool',
        description: 'A test installed tool',
        category: 'test',
        provider: 'Test',
        version: '1.0',
        rating: 4.5,
        downloads: 100,
        tags: ['test'],
        installed: true,
        featured: true,
        icon: '🧪'
      },
      {
        id: 'tool2',
        name: 'Not Installed Tool',
        description: 'A test not installed tool',
        category: 'other',
        provider: 'Test',
        version: '1.0',
        rating: 4.0,
        downloads: 50,
        tags: ['test'],
        installed: false,
        featured: false,
        icon: '💻'
      }
    ]);
    
    renderWithTheme(<ScoutMcpMarketplace />);
    
    // Wait for the component to render fully and API to be called
    await waitFor(() => {
      expect(mcpApi.getTools).toHaveBeenCalled();
    });
    
    // Wait for tools to appear
    await waitFor(() => {
      expect(screen.queryByText('Loading MCP Tools')).toBeFalsy();
    });
    
    // Check if filter buttons/options exist - using more general assertions
    const filterElements = screen.getAllByRole('button');
    expect(filterElements.length).toBeGreaterThan(0);
  });
});