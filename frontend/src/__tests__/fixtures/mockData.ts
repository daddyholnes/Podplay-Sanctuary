// filepath: c:\Users\woodyholne\Desktop\Podplay-Sanctuary\frontend\src\__tests__\fixtures\mockData.ts
/**
 * Mock Data for Tests
 * 
 * This file contains mock data objects used throughout the test suite.
 * All mock data is typed and follows the application's data structures.
 */

// ============================================================================
// USER AND AUTHENTICATION MOCK DATA
// ============================================================================

export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  username: 'testuser',
  displayName: 'Test User',
  avatar: 'https://example.com/avatar.jpg',
  role: 'user' as const,
  preferences: {
    theme: 'dark' as const,
    language: 'en',
    notifications: true,
    autoSave: true,
    codeCompletion: true
  },
  subscription: {
    plan: 'pro' as const,
    status: 'active' as const,
    expiresAt: new Date('2024-12-31').toISOString(),
    features: ['unlimited_projects', 'ai_assistance', 'collaboration']
  },
  stats: {
    projectsCreated: 25,
    linesOfCode: 15000,
    hoursUsed: 120,
    aiInteractions: 500
  },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-15T12:00:00.000Z'
};

export const mockAuthState = {
  user: mockUser,
  isAuthenticated: true,
  isLoading: false,
  error: null,
  token: 'mock-jwt-token',
  refreshToken: 'mock-refresh-token',
  expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
};

export const mockUnauthenticatedState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  token: null,
  refreshToken: null,
  expiresAt: null
};

// ============================================================================
// PROJECT AND WORKSPACE MOCK DATA
// ============================================================================

export const mockProject = {
  id: 'project-123',
  name: 'Test Project',
  description: 'A test project for development',
  type: 'web' as const,
  framework: 'react',
  language: 'typescript',
  template: 'nextjs',
  status: 'active' as const,
  visibility: 'private' as const,
  owner: mockUser,
  collaborators: [
    {
      id: 'user-456',
      email: 'collaborator@example.com',
      username: 'collaborator',
      displayName: 'Collaborator User',
      role: 'editor' as const,
      permissions: ['read', 'write', 'comment'],
      joinedAt: '2024-01-10T00:00:00.000Z'
    }
  ],
  settings: {
    autoSave: true,
    linting: true,
    formatting: true,
    gitIntegration: true,
    deploymentTarget: 'vercel',
    environment: {
      NODE_ENV: 'development',
      API_URL: 'http://localhost:3001',
      DATABASE_URL: 'postgresql://localhost:5432/testdb'
    }
  },
  stats: {
    filesCount: 45,
    linesOfCode: 2500,
    lastActivity: '2024-01-15T12:00:00.000Z',
    deployments: 12,
    builds: 25
  },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-15T12:00:00.000Z'
};

export const mockWorkspace = {
  id: 'workspace-123',
  name: 'Test Workspace',
  description: 'A test workspace',
  projects: [mockProject],
  files: [
    {
      id: 'file-1',
      name: 'index.tsx',
      path: '/src/index.tsx',
      type: 'file' as const,
      content: 'import React from "react";\n\nfunction App() {\n  return <div>Hello World</div>;\n}\n\nexport default App;',
      language: 'typescript',
      size: 1024,
      lastModified: '2024-01-15T12:00:00.000Z',
      isReadOnly: false,
      encoding: 'utf-8'
    },
    {
      id: 'file-2',
      name: 'package.json',
      path: '/package.json',
      type: 'file' as const,
      content: JSON.stringify({
        name: 'test-project',
        version: '1.0.0',
        dependencies: {
          react: '^18.0.0',
          'react-dom': '^18.0.0'
        }
      }, null, 2),
      language: 'json',
      size: 256,
      lastModified: '2024-01-15T11:00:00.000Z',
      isReadOnly: false,
      encoding: 'utf-8'
    }
  ],
  folders: [
    {
      id: 'folder-1',
      name: 'src',
      path: '/src',
      type: 'directory' as const,
      children: ['file-1'],
      expanded: true
    },
    {
      id: 'folder-2',
      name: 'components',
      path: '/src/components',
      type: 'directory' as const,
      children: [],
      expanded: false
    }
  ],
  activeFile: 'file-1',
  openFiles: ['file-1', 'file-2'],
  settings: mockProject.settings
};

// ============================================================================
// CHAT AND AI MOCK DATA
// ============================================================================

export const mockChatMessage = {
  id: 'message-123',
  type: 'user' as const,
  content: 'Hello, can you help me with this React component?',
  timestamp: '2024-01-15T12:00:00.000Z',
  status: 'sent' as const,
  metadata: {
    context: 'code_assistance',
    files: ['file-1'],
    language: 'typescript'
  }
};

export const mockAIResponse = {
  id: 'message-124',
  type: 'assistant' as const,
  content: 'I\'d be happy to help you with your React component! I can see you\'re working with TypeScript. What specific issue are you facing?',
  timestamp: '2024-01-15T12:00:05.000Z',
  status: 'received' as const,
  metadata: {
    model: 'gpt-4',
    confidence: 0.95,
    tokens: 150,
    processingTime: 2.5
  }
};

export const mockChatConversation = {
  id: 'conversation-123',
  title: 'React Component Help',
  messages: [mockChatMessage, mockAIResponse],
  status: 'active' as const,
  participants: [mockUser.id, 'ai-assistant'],
  createdAt: '2024-01-15T12:00:00.000Z',
  updatedAt: '2024-01-15T12:00:05.000Z',
  settings: {
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2048,
    contextWindow: 8192
  }
};

// ============================================================================
// API AND SERVICE MOCK DATA
// ============================================================================

export const mockApiResponse = {
  success: true,
  data: mockProject,
  message: 'Project retrieved successfully',
  timestamp: '2024-01-15T12:00:00.000Z',
  requestId: 'req-123',
  pagination: {
    page: 1,
    limit: 10,
    total: 1,
    hasNext: false,
    hasPrev: false
  }
};

export const mockApiError = {
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input data',
    details: {
      field: 'email',
      reason: 'Invalid email format'
    }
  },
  timestamp: '2024-01-15T12:00:00.000Z',
  requestId: 'req-124'
};

export const mockWebSocketMessage = {
  type: 'file_update',
  payload: {
    fileId: 'file-1',
    changes: [
      {
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 5 } },
        text: 'const'
      }
    ],
    userId: mockUser.id,
    timestamp: '2024-01-15T12:00:00.000Z'
  }
};

// ============================================================================
// FORM AND UI MOCK DATA
// ============================================================================

export const mockFormData = {
  projectName: 'New Project',
  projectDescription: 'A new project description',
  projectType: 'web',
  framework: 'react',
  language: 'typescript',
  template: 'nextjs',
  visibility: 'private',
  gitRepository: 'https://github.com/user/repo.git',
  environmentVariables: {
    NODE_ENV: 'development',
    API_URL: 'http://localhost:3001'
  }
};

export const mockFormErrors = {
  projectName: 'Project name is required',
  projectDescription: 'Description must be at least 10 characters',
  framework: 'Please select a framework'
};

export const mockSelectOptions = {
  projectTypes: [
    { value: 'web', label: 'Web Application' },
    { value: 'mobile', label: 'Mobile App' },
    { value: 'desktop', label: 'Desktop App' },
    { value: 'api', label: 'API/Backend' }
  ],
  frameworks: [
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue.js' },
    { value: 'angular', label: 'Angular' },
    { value: 'svelte', label: 'Svelte' }
  ],
  languages: [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' }
  ]
};

// ============================================================================
// PERFORMANCE AND ANALYTICS MOCK DATA
// ============================================================================

export const mockPerformanceMetrics = {
  pageLoadTime: 1250,
  firstContentfulPaint: 800,
  largestContentfulPaint: 1200,
  firstInputDelay: 15,
  cumulativeLayoutShift: 0.05,
  timeToInteractive: 1500,
  totalBlockingTime: 200,
  resourceLoadTime: {
    js: 300,
    css: 150,
    images: 400,
    fonts: 200
  },
  memoryUsage: {
    usedJSHeapSize: 15728640,
    totalJSHeapSize: 20971520,
    jsHeapSizeLimit: 2147483648
  },
  networkInfo: {
    effectiveType: '4g',
    downlink: 10,
    rtt: 100,
    saveData: false
  }
};

export const mockAnalyticsEvent = {
  id: 'event-123',
  name: 'project_created',
  properties: {
    projectType: 'web',
    framework: 'react',
    language: 'typescript',
    template: 'nextjs'
  },
  userId: mockUser.id,
  sessionId: 'session-123',
  timestamp: '2024-01-15T12:00:00.000Z',
  context: {
    page: '/dashboard',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    referrer: 'https://example.com',
    locale: 'en-US',
    timezone: 'America/New_York'
  }
};

// ============================================================================
// NOTIFICATION AND ALERT MOCK DATA
// ============================================================================

export const mockNotification = {
  id: 'notification-123',
  type: 'success' as const,
  title: 'Project Created',
  message: 'Your project has been created successfully!',
  timestamp: '2024-01-15T12:00:00.000Z',
  read: false,
  actions: [
    {
      label: 'View Project',
      action: 'navigate',
      target: '/projects/project-123'
    },
    {
      label: 'Dismiss',
      action: 'dismiss'
    }
  ],
  category: 'project',
  priority: 'medium' as const,
  expiresAt: '2024-01-16T12:00:00.000Z'
};

export const mockToast = {
  id: 'toast-123',
  type: 'info' as const,
  message: 'File saved successfully',
  duration: 3000,
  position: 'top-right' as const,
  dismissible: true,
  actions: []
};

// ============================================================================
// SEARCH AND FILTER MOCK DATA
// ============================================================================

export const mockSearchResults = {
  query: 'react component',
  results: [
    {
      id: 'result-1',
      type: 'file',
      title: 'Button.tsx',
      path: '/src/components/Button.tsx',
      matches: [
        {
          line: 5,
          content: 'export const Button: React.FC<ButtonProps> = ({ children, onClick }) => {',
          highlight: { start: 22, end: 27 }
        }
      ],
      score: 0.95
    },
    {
      id: 'result-2',
      type: 'documentation',
      title: 'React Components Guide',
      path: '/docs/components.md',
      matches: [
        {
          line: 1,
          content: '# React Components',
          highlight: { start: 2, end: 7 }
        }
      ],
      score: 0.85
    }
  ],
  totalResults: 25,
  searchTime: 45,
  suggestions: ['react hooks', 'react typescript', 'component props'],
  filters: {
    fileTypes: ['tsx', 'ts', 'jsx', 'js'],
    locations: ['src/components', 'src/pages'],
    dateRange: {
      start: '2024-01-01',
      end: '2024-01-15'
    }
  }
};

// ============================================================================
// ERROR AND DEBUGGING MOCK DATA
// ============================================================================

export const mockError = {
  id: 'error-123',
  name: 'TypeError',
  message: 'Cannot read property \'map\' of undefined',
  stack: `TypeError: Cannot read property 'map' of undefined
    at Component.render (/src/components/List.tsx:15:20)
    at React.createElement (/node_modules/react/index.js:123:45)`,
  file: '/src/components/List.tsx',
  line: 15,
  column: 20,
  severity: 'error' as const,
  category: 'runtime',
  timestamp: '2024-01-15T12:00:00.000Z',
  context: {
    props: { items: undefined },
    state: { loading: false },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  tags: ['react', 'component', 'rendering']
};

export const mockConsoleLog = {
  id: 'log-123',
  level: 'warn' as const,
  message: 'Warning: Each child in a list should have a unique "key" prop.',
  timestamp: '2024-01-15T12:00:00.000Z',
  source: 'react',
  file: '/src/components/List.tsx',
  line: 20,
  args: []
};

// ============================================================================
// EXPORT COLLECTIONS
// ============================================================================

export const mockUsers = [
  mockUser,
  {
    ...mockUser,
    id: 'user-456',
    email: 'user2@example.com',
    username: 'user2',
    displayName: 'User Two'
  }
];

export const mockProjects = [
  mockProject,
  {
    ...mockProject,
    id: 'project-456',
    name: 'Another Project',
    framework: 'vue',
    language: 'javascript'
  }
];

export const mockFiles = [
  ...mockWorkspace.files,
  {
    id: 'file-3',
    name: 'styles.css',
    path: '/src/styles.css',
    type: 'file' as const,
    content: 'body { margin: 0; padding: 0; }',
    language: 'css',
    size: 64,
    lastModified: '2024-01-15T10:00:00.000Z',
    isReadOnly: false,
    encoding: 'utf-8'
  }
];

export const mockNotifications = [
  mockNotification,
  {
    ...mockNotification,
    id: 'notification-456',
    type: 'warning' as const,
    title: 'Build Failed',
    message: 'Your latest build has failed. Check the logs for details.'
  }
];

// ============================================================================
// UTILITY FUNCTIONS FOR MOCK DATA
// ============================================================================

/**
 * Create a mock user with custom properties
 */
export const createMockUser = (overrides: Partial<typeof mockUser> = {}) => ({
  ...mockUser,
  ...overrides,
  id: overrides.id || `user-${Math.random().toString(36).substr(2, 9)}`
});

/**
 * Create a mock project with custom properties
 */
export const createMockProject = (overrides: Partial<typeof mockProject> = {}) => ({
  ...mockProject,
  ...overrides,
  id: overrides.id || `project-${Math.random().toString(36).substr(2, 9)}`
});

/**
 * Create a mock file with custom properties
 */
export const createMockFile = (overrides: Partial<typeof mockWorkspace.files[0]> = {}) => ({
  ...mockWorkspace.files[0],
  ...overrides,
  id: overrides.id || `file-${Math.random().toString(36).substr(2, 9)}`
});

/**
 * Create a mock API response with custom data
 */
export const createMockApiResponse = <T>(data: T, overrides: Partial<typeof mockApiResponse> = {}) => ({
  ...mockApiResponse,
  ...overrides,
  data,
  requestId: overrides.requestId || `req-${Math.random().toString(36).substr(2, 9)}`
});

/**
 * Create a mock error with custom properties
 */
export const createMockError = (overrides: Partial<typeof mockError> = {}) => ({
  ...mockError,
  ...overrides,
  id: overrides.id || `error-${Math.random().toString(36).substr(2, 9)}`
});

/**
 * Generate multiple mock items
 */
export const generateMockArray = <T>(
  factory: (index: number) => T,
  count: number
): T[] => {
  return Array.from({ length: count }, (_, index) => factory(index));
};

/**
 * Create mock pagination data
 */
export const createMockPagination = (
  page: number = 1,
  limit: number = 10,
  total: number = 100
) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1,
  offset: (page - 1) * limit
});
