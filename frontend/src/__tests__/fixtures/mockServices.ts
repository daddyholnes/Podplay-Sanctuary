/**
 * Mock Services for Podplay Sanctuary Testing
 * 
 * This file provides mock implementations of service layer functions
 * including API services, authentication services, file services,
 * chat services, and other business logic services.
 */

import { vi } from 'vitest';
import { mockData, createMockUser, createMockProject, createMockChatMessage } from './mockData';
import { mockResponses } from './mockResponses';

// =============================================================================
// AUTHENTICATION SERVICE MOCKS
// =============================================================================

export const mockAuthService = {
  // Login service
  login: vi.fn(async (credentials: { email: string; password: string }) => {
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
    
    if (credentials.email === 'error@test.com') {
      throw new Error('Invalid credentials');
    }
    
    if (credentials.email === 'timeout@test.com') {
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    return {
      user: createMockUser({ email: credentials.email }),
      tokens: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
      },
    };
  }),

  // Register service
  register: vi.fn(async (userData: any) => {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    if (userData.email === 'existing@test.com') {
      throw new Error('Email already exists');
    }

    return {
      user: createMockUser(userData),
      tokens: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
      },
    };
  }),

  // Logout service
  logout: vi.fn(async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return { success: true };
  }),

  // Refresh token service
  refreshToken: vi.fn(async (refreshToken: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (refreshToken === 'invalid-token') {
      throw new Error('Invalid refresh token');
    }

    return {
      accessToken: 'new-mock-access-token',
      refreshToken: 'new-mock-refresh-token',
      expiresIn: 3600,
    };
  }),

  // Verify email service
  verifyEmail: vi.fn(async (token: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (token === 'invalid-token') {
      throw new Error('Invalid verification token');
    }

    return { success: true };
  }),

  // Reset password service
  resetPassword: vi.fn(async (email: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (email === 'notfound@test.com') {
      throw new Error('Email not found');
    }

    return { success: true };
  }),

  // Change password service
  changePassword: vi.fn(async (data: { currentPassword: string; newPassword: string }) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (data.currentPassword === 'wrong-password') {
      throw new Error('Current password is incorrect');
    }

    return { success: true };
  }),

  // Get current user
  getCurrentUser: vi.fn(async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return mockData.users.currentUser;
  }),

  // Update profile
  updateProfile: vi.fn(async (updates: any) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { ...mockData.users.currentUser, ...updates };
  }),
};

// =============================================================================
// PROJECT SERVICE MOCKS
// =============================================================================

export const mockProjectService = {
  // Get all projects
  getProjects: vi.fn(async (filters?: any) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    let projects = mockData.projects.userProjects;
    
    if (filters?.type) {
      projects = projects.filter(p => p.type === filters.type);
    }
    
    if (filters?.search) {
      projects = projects.filter(p => 
        p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    return projects;
  }),

  // Get project by ID
  getProject: vi.fn(async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (id === 'not-found') {
      throw new Error('Project not found');
    }

    return createMockProject({ id });
  }),

  // Create project
  createProject: vi.fn(async (projectData: any) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (projectData.name === 'forbidden-name') {
      throw new Error('Project name not allowed');
    }

    return createMockProject(projectData);
  }),

  // Update project
  updateProject: vi.fn(async (id: string, updates: any) => {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    if (id === 'not-found') {
      throw new Error('Project not found');
    }

    return createMockProject({ id, ...updates });
  }),

  // Delete project
  deleteProject: vi.fn(async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (id === 'not-found') {
      throw new Error('Project not found');
    }

    return { success: true };
  }),

  // Get project collaborators
  getCollaborators: vi.fn(async (projectId: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockData.projects.collaborators;
  }),

  // Add collaborator
  addCollaborator: vi.fn(async (projectId: string, collaboratorData: any) => {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    if (collaboratorData.email === 'notfound@test.com') {
      throw new Error('User not found');
    }

    return {
      id: 'collab-' + Date.now(),
      ...collaboratorData,
      addedAt: new Date(),
    };
  }),

  // Remove collaborator
  removeCollaborator: vi.fn(async (projectId: string, userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { success: true };
  }),

  // Deploy project
  deployProject: vi.fn(async (projectId: string, environment: string) => {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Longer delay for deployment
    
    if (environment === 'invalid') {
      throw new Error('Invalid deployment environment');
    }

    return {
      deploymentId: 'deploy-' + Date.now(),
      url: `https://${environment}.sanctuary.dev/${projectId}`,
      status: 'success',
      timestamp: new Date(),
    };
  }),
};

// =============================================================================
// FILE SERVICE MOCKS
// =============================================================================

export const mockFileService = {
  // Get file tree
  getFileTree: vi.fn(async (projectId: string) => {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    if (projectId === 'empty-project') {
      return { files: [], folders: [] };
    }

    return mockData.fileSystem.projectFiles;
  }),

  // Get file content
  getFileContent: vi.fn(async (fileId: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (fileId === 'not-found') {
      throw new Error('File not found');
    }

    if (fileId === 'binary-file') {
      return { content: null, isBinary: true, size: 1024000 };
    }

    return {
      content: `// File content for ${fileId}\nexport default function Component() {\n  return <div>Hello World</div>;\n}`,
      isBinary: false,
      size: 150,
    };
  }),

  // Save file
  saveFile: vi.fn(async (fileId: string, content: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (fileId === 'readonly-file') {
      throw new Error('File is read-only');
    }

    return {
      success: true,
      lastModified: new Date(),
      size: content.length,
    };
  }),

  // Create file
  createFile: vi.fn(async (projectId: string, filePath: string, content: string = '') => {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    if (filePath.includes('invalid')) {
      throw new Error('Invalid file path');
    }

    return {
      id: 'file-' + Date.now(),
      name: filePath.split('/').pop(),
      path: filePath,
      content,
      createdAt: new Date(),
      size: content.length,
    };
  }),

  // Delete file
  deleteFile: vi.fn(async (fileId: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (fileId === 'protected-file') {
      throw new Error('Cannot delete protected file');
    }

    return { success: true };
  }),

  // Upload file
  uploadFile: vi.fn(async (projectId: string, file: File) => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate upload time
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('File too large');
    }

    if (file.name.includes('virus')) {
      throw new Error('File rejected by security scan');
    }

    return {
      id: 'uploaded-' + Date.now(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
    };
  }),

  // Download file
  downloadFile: vi.fn(async (fileId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (fileId === 'not-found') {
      throw new Error('File not found');
    }

    return {
      blob: new Blob(['mock file content'], { type: 'text/plain' }),
      filename: `download-${fileId}.txt`,
    };
  }),

  // Search files
  searchFiles: vi.fn(async (projectId: string, query: string) => {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    return mockData.search.fileResults.filter(file =>
      file.name.toLowerCase().includes(query.toLowerCase()) ||
      file.content.toLowerCase().includes(query.toLowerCase())
    );
  }),
};

// =============================================================================
// CHAT SERVICE MOCKS
// =============================================================================

export const mockChatService = {
  // Get chat history
  getChatHistory: vi.fn(async (conversationId?: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (conversationId === 'not-found') {
      return { messages: [], conversation: null };
    }

    return {
      messages: mockData.chat.recentConversations[0]?.messages || [],
      conversation: mockData.chat.recentConversations[0] || null,
    };
  }),

  // Send message
  sendMessage: vi.fn(async (message: string, conversationId?: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (message.includes('error')) {
      throw new Error('Failed to send message');
    }

    const userMessage = createMockChatMessage({
      content: message,
      senderId: mockData.users.currentUser.id,
      type: 'text',
    });

    // Simulate AI response
    const aiResponse = createMockChatMessage({
      content: `I understand you said: "${message}". How can I help you with that?`,
      senderId: 'ai-assistant',
      type: 'text',
      timestamp: new Date(Date.now() + 1000),
    });

    return {
      userMessage,
      aiResponse,
      conversationId: conversationId || 'conv-' + Date.now(),
    };
  }),

  // Get suggestions
  getSuggestions: vi.fn(async (context: string) => {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    return [
      'How can I optimize my React components?',
      'What are the best practices for TypeScript?',
      'Help me debug this error',
      'Explain this code snippet',
      'Generate unit tests for this function',
    ];
  }),

  // Get conversation list
  getConversations: vi.fn(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockData.chat.recentConversations;
  }),

  // Create new conversation
  createConversation: vi.fn(async (title?: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      id: 'conv-' + Date.now(),
      title: title || 'New Conversation',
      participants: [mockData.users.currentUser.id, 'ai-assistant'],
      createdAt: new Date(),
      messages: [],
    };
  }),

  // Delete conversation
  deleteConversation: vi.fn(async (conversationId: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (conversationId === 'not-found') {
      throw new Error('Conversation not found');
    }

    return { success: true };
  }),

  // Generate code
  generateCode: vi.fn(async (prompt: string, language: string = 'typescript') => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (prompt.includes('impossible')) {
      throw new Error('Cannot generate code for this request');
    }

    return {
      code: `// Generated ${language} code for: ${prompt}\nfunction generatedFunction() {\n  // Implementation here\n  return 'result';\n}`,
      explanation: `This code implements ${prompt} using ${language} best practices.`,
      language,
    };
  }),

  // Explain code
  explainCode: vi.fn(async (code: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      explanation: `This code appears to be a ${code.includes('function') ? 'function' : 'code snippet'} that performs specific operations. It follows standard coding practices and implements the intended functionality.`,
      complexity: 'medium',
      suggestions: [
        'Consider adding error handling',
        'Add type annotations for better type safety',
        'Consider extracting reusable logic',
      ],
    };
  }),
};

// =============================================================================
// NOTIFICATION SERVICE MOCKS
// =============================================================================

export const mockNotificationService = {
  // Get notifications
  getNotifications: vi.fn(async (filters?: any) => {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    let notifications = mockData.notifications.recent;
    
    if (filters?.unreadOnly) {
      notifications = notifications.filter(n => !n.read);
    }

    return notifications;
  }),

  // Mark as read
  markAsRead: vi.fn(async (notificationId: string) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    if (notificationId === 'not-found') {
      throw new Error('Notification not found');
    }

    return { success: true };
  }),

  // Mark all as read
  markAllAsRead: vi.fn(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { success: true, count: 5 };
  }),

  // Delete notification
  deleteNotification: vi.fn(async (notificationId: string) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return { success: true };
  }),

  // Subscribe to notifications
  subscribe: vi.fn(async (endpoint: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { success: true, subscriptionId: 'sub-' + Date.now() };
  }),

  // Send notification
  sendNotification: vi.fn(async (notification: any) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      id: 'notif-' + Date.now(),
      ...notification,
      sentAt: new Date(),
    };
  }),
};

// =============================================================================
// ANALYTICS SERVICE MOCKS
// =============================================================================

export const mockAnalyticsService = {
  // Track event
  trackEvent: vi.fn(async (event: string, properties?: any) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return { success: true, eventId: 'event-' + Date.now() };
  }),

  // Get analytics data
  getAnalytics: vi.fn(async (timeRange: string = '7d') => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      views: Math.floor(Math.random() * 10000) + 1000,
      users: Math.floor(Math.random() * 1000) + 100,
      sessions: Math.floor(Math.random() * 2000) + 200,
      bounceRate: Math.random() * 0.5 + 0.2,
      averageSessionDuration: Math.floor(Math.random() * 300) + 120,
    };
  }),

  // Track performance
  trackPerformance: vi.fn(async (metrics: any) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return { success: true };
  }),

  // Get performance data
  getPerformanceData: vi.fn(async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      loadTime: Math.random() * 2000 + 500,
      firstContentfulPaint: Math.random() * 1000 + 200,
      largestContentfulPaint: Math.random() * 2000 + 800,
      cumulativeLayoutShift: Math.random() * 0.1,
      firstInputDelay: Math.random() * 100 + 10,
    };
  }),
};

// =============================================================================
// SEARCH SERVICE MOCKS
// =============================================================================

export const mockSearchService = {
  // Global search
  globalSearch: vi.fn(async (query: string, filters?: any) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    if (query === 'no-results') {
      return { results: [], total: 0 };
    }

    const results = [
      ...mockData.search.projectResults,
      ...mockData.search.fileResults,
      ...mockData.search.chatResults,
    ].filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description?.toLowerCase().includes(query.toLowerCase())
    );

    return {
      results: results.slice(0, 20),
      total: results.length,
      suggestions: ['react', 'typescript', 'components', 'testing'],
    };
  }),

  // Search projects
  searchProjects: vi.fn(async (query: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return mockData.search.projectResults.filter(project =>
      project.title.toLowerCase().includes(query.toLowerCase())
    );
  }),

  // Search files
  searchFiles: vi.fn(async (query: string, projectId?: string) => {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    return mockData.search.fileResults.filter(file =>
      file.title.toLowerCase().includes(query.toLowerCase())
    );
  }),

  // Search in code
  searchInCode: vi.fn(async (query: string, projectId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        file: 'src/components/Button.tsx',
        line: 15,
        column: 8,
        match: `const ${query} = `,
        context: `function Button() {\n  const ${query} = useState();\n  return <button>...`,
      },
      {
        file: 'src/utils/helpers.ts',
        line: 42,
        column: 12,
        match: `export function ${query}`,
        context: `// Helper function\nexport function ${query}(value) {\n  return value;`,
      },
    ];
  }),

  // Get search suggestions
  getSearchSuggestions: vi.fn(async (query: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const suggestions = [
      'react components',
      'typescript types',
      'unit tests',
      'api integration',
      'error handling',
    ];

    return suggestions.filter(s => s.includes(query.toLowerCase()));
  }),
};

// =============================================================================
// SETTINGS SERVICE MOCKS
// =============================================================================

export const mockSettingsService = {
  // Get user settings
  getSettings: vi.fn(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockData.users.currentUser.preferences;
  }),

  // Update settings
  updateSettings: vi.fn(async (settings: any) => {
    await new Promise(resolve => setTimeout(resolve, 150));
    return { ...mockData.users.currentUser.preferences, ...settings };
  }),

  // Reset settings
  resetSettings: vi.fn(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      theme: 'system',
      language: 'en',
      notifications: true,
      autoSave: true,
    };
  }),

  // Export settings
  exportSettings: vi.fn(async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      blob: new Blob([JSON.stringify(mockData.users.currentUser.preferences, null, 2)], {
        type: 'application/json',
      }),
      filename: 'sanctuary-settings.json',
    };
  }),

  // Import settings
  importSettings: vi.fn(async (file: File) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (file.type !== 'application/json') {
      throw new Error('Invalid file type');
    }

    return { success: true, imported: 15 };
  }),
};

// =============================================================================
// MOCK SERVICE REGISTRY
// =============================================================================

export const mockServices = {
  auth: mockAuthService,
  project: mockProjectService,
  file: mockFileService,
  chat: mockChatService,
  notification: mockNotificationService,
  analytics: mockAnalyticsService,
  search: mockSearchService,
  settings: mockSettingsService,
};

// =============================================================================
// SERVICE UTILITIES
// =============================================================================

export const serviceUtils = {
  // Reset all service mocks
  resetMocks: () => {
    Object.values(mockServices).forEach(service => {
      Object.values(service).forEach(method => {
        if (typeof method === 'function' && 'mockClear' in method) {
          method.mockClear();
        }
      });
    });
  },

  // Set service method to throw error
  setMethodToFail: (serviceName: string, methodName: string, error: Error) => {
    const service = mockServices[serviceName as keyof typeof mockServices];
    if (service && service[methodName as keyof typeof service]) {
      const method = service[methodName as keyof typeof service] as any;
      method.mockRejectedValueOnce(error);
    }
  },

  // Set service method to return specific value
  setMethodToReturn: (serviceName: string, methodName: string, value: any) => {
    const service = mockServices[serviceName as keyof typeof mockServices];
    if (service && service[methodName as keyof typeof service]) {
      const method = service[methodName as keyof typeof service] as any;
      method.mockResolvedValueOnce(value);
    }
  },

  // Get service method calls
  getMethodCalls: (serviceName: string, methodName: string) => {
    const service = mockServices[serviceName as keyof typeof mockServices];
    if (service && service[methodName as keyof typeof service]) {
      const method = service[methodName as keyof typeof service] as any;
      return method.mock?.calls || [];
    }
    return [];
  },

  // Verify service method was called
  expectMethodCalled: (serviceName: string, methodName: string, times?: number) => {
    const service = mockServices[serviceName as keyof typeof mockServices];
    if (service && service[methodName as keyof typeof service]) {
      const method = service[methodName as keyof typeof service] as any;
      if (times !== undefined) {
        expect(method).toHaveBeenCalledTimes(times);
      } else {
        expect(method).toHaveBeenCalled();
      }
    }
  },

  // Verify service method was called with specific arguments
  expectMethodCalledWith: (serviceName: string, methodName: string, ...args: any[]) => {
    const service = mockServices[serviceName as keyof typeof mockServices];
    if (service && service[methodName as keyof typeof service]) {
      const method = service[methodName as keyof typeof service] as any;
      expect(method).toHaveBeenCalledWith(...args);
    }
  },

  // Create service error scenario
  createErrorScenario: (serviceName: string, methodName: string, errorMessage: string) => {
    return () => {
      serviceUtils.setMethodToFail(serviceName, methodName, new Error(errorMessage));
    };
  },

  // Create service success scenario
  createSuccessScenario: (serviceName: string, methodName: string, returnValue: any) => {
    return () => {
      serviceUtils.setMethodToReturn(serviceName, methodName, returnValue);
    };
  },
};

export default mockServices;
