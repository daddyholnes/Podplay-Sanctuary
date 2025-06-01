// filepath: c:\Users\woodyholne\Desktop\Podplay-Sanctuary\frontend\src\__tests__\fixtures\mockResponses.ts
/**
 * Mock API Responses
 * 
 * This file contains mock responses for API calls used in tests.
 * It provides consistent mock data for different API endpoints and scenarios.
 */

import { 
  mockUser, 
  mockProject, 
  mockChatConversation, 
  mockNotification,
  createMockApiResponse,
  createMockPagination
} from './mockData';

// ============================================================================
// AUTHENTICATION API RESPONSES
// ============================================================================

export const authResponses = {
  login: {
    success: createMockApiResponse({
      user: mockUser,
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token',
      expiresAt: new Date(Date.now() + 3600000).toISOString()
    }),
    
    failure: {
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
        details: {
          field: 'credentials',
          reason: 'Authentication failed'
        }
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-auth-fail'
    },
    
    expired: {
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Your session has expired. Please log in again.',
        details: {
          field: 'token',
          reason: 'Token has expired'
        }
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-token-expired'
    }
  },
  
  register: {
    success: createMockApiResponse({
      user: mockUser,
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token',
      message: 'Account created successfully'
    }),
    
    emailExists: {
      success: false,
      error: {
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'An account with this email already exists',
        details: {
          field: 'email',
          reason: 'Email address is already registered'
        }
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-email-exists'
    },
    
    validationError: {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Please check your input and try again',
        details: {
          fields: {
            email: 'Please enter a valid email address',
            password: 'Password must be at least 8 characters long',
            username: 'Username must be between 3 and 20 characters'
          }
        }
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-validation-error'
    }
  },
  
  refreshToken: {
    success: createMockApiResponse({
      token: 'new-mock-jwt-token',
      refreshToken: 'new-mock-refresh-token',
      expiresAt: new Date(Date.now() + 3600000).toISOString()
    }),
    
    invalid: {
      success: false,
      error: {
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Invalid refresh token. Please log in again.',
        details: {
          field: 'refreshToken',
          reason: 'Refresh token is invalid or expired'
        }
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-invalid-refresh'
    }
  },
  
  forgotPassword: {
    success: createMockApiResponse({
      message: 'Password reset email sent successfully',
      resetToken: 'mock-reset-token'
    }),
    
    userNotFound: {
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'No account found with this email address',
        details: {
          field: 'email',
          reason: 'Email address not registered'
        }
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-user-not-found'
    }
  },
  
  resetPassword: {
    success: createMockApiResponse({
      message: 'Password reset successfully'
    }),
    
    invalidToken: {
      success: false,
      error: {
        code: 'INVALID_RESET_TOKEN',
        message: 'Invalid or expired reset token',
        details: {
          field: 'resetToken',
          reason: 'Reset token is invalid or has expired'
        }
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-invalid-reset-token'
    }
  }
};

// ============================================================================
// USER API RESPONSES
// ============================================================================

export const userResponses = {
  profile: {
    success: createMockApiResponse(mockUser),
    
    notFound: {
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User profile not found',
        details: {
          field: 'userId',
          reason: 'User does not exist'
        }
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-user-not-found'
    }
  },
  
  updateProfile: {
    success: createMockApiResponse({
      ...mockUser,
      displayName: 'Updated Display Name',
      updatedAt: new Date().toISOString()
    }),
    
    validationError: {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid profile data',
        details: {
          fields: {
            displayName: 'Display name must be between 2 and 50 characters',
            email: 'Please enter a valid email address'
          }
        }
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-profile-validation'
    }
  },
  
  uploadAvatar: {
    success: createMockApiResponse({
      avatarUrl: 'https://example.com/new-avatar.jpg',
      message: 'Avatar uploaded successfully'
    }),
    
    fileTooLarge: {
      success: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: 'Avatar file size must be less than 5MB',
        details: {
          field: 'avatar',
          reason: 'File size exceeds maximum allowed size',
          maxSize: '5MB'
        }
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-file-too-large'
    },
    
    invalidFormat: {
      success: false,
      error: {
        code: 'INVALID_FILE_FORMAT',
        message: 'Avatar must be a JPEG, PNG, or WebP image',
        details: {
          field: 'avatar',
          reason: 'Unsupported file format',
          allowedFormats: ['jpeg', 'jpg', 'png', 'webp']
        }
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-invalid-format'
    }
  },
  
  preferences: {
    success: createMockApiResponse({
      ...mockUser.preferences,
      autoSave: false,
      theme: 'light'
    }),
    
    updateSuccess: createMockApiResponse({
      message: 'Preferences updated successfully',
      preferences: {
        ...mockUser.preferences,
        theme: 'light',
        notifications: false
      }
    })
  }
};

// ============================================================================
// PROJECT API RESPONSES
// ============================================================================

export const projectResponses = {
  list: {
    success: createMockApiResponse([
      mockProject,
      {
        ...mockProject,
        id: 'project-456',
        name: 'Another Project',
        framework: 'vue'
      }
    ], {
      pagination: createMockPagination(1, 10, 2)
    }),
    
    empty: createMockApiResponse([], {
      pagination: createMockPagination(1, 10, 0)
    })
  },
  
  get: {
    success: createMockApiResponse(mockProject),
    
    notFound: {
      success: false,
      error: {
        code: 'PROJECT_NOT_FOUND',
        message: 'Project not found',
        details: {
          field: 'projectId',
          reason: 'Project does not exist or you do not have access'
        }
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-project-not-found'
    },
    
    noAccess: {
      success: false,
      error: {
        code: 'ACCESS_DENIED',
        message: 'You do not have permission to access this project',
        details: {
          field: 'projectId',
          reason: 'Insufficient permissions'
        }
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-no-access'
    }
  },
  
  create: {
    success: createMockApiResponse({
      ...mockProject,
      id: 'new-project-123',
      name: 'New Test Project',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }),
    
    nameExists: {
      success: false,
      error: {
        code: 'PROJECT_NAME_EXISTS',
        message: 'A project with this name already exists',
        details: {
          field: 'name',
          reason: 'Project name must be unique'
        }
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-name-exists'
    },
    
    quotaExceeded: {
      success: false,
      error: {
        code: 'PROJECT_QUOTA_EXCEEDED',
        message: 'You have reached your project limit',
        details: {
          field: 'quota',
          reason: 'Maximum number of projects reached',
          currentCount: 10,
          maxAllowed: 10,
          upgradeRequired: true
        }
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-quota-exceeded'
    }
  },
  
  update: {
    success: createMockApiResponse({
      ...mockProject,
      name: 'Updated Project Name',
      description: 'Updated project description',
      updatedAt: new Date().toISOString()
    }),
    
    validationError: {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid project data',
        details: {
          fields: {
            name: 'Project name must be between 3 and 50 characters',
            description: 'Description is too long (maximum 500 characters)'
          }
        }
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-project-validation'
    }
  },
  
  delete: {
    success: createMockApiResponse({
      message: 'Project deleted successfully',
      projectId: mockProject.id
    }),
    
    hasCollaborators: {
      success: false,
      error: {
        code: 'PROJECT_HAS_COLLABORATORS',
        message: 'Cannot delete project with active collaborators',
        details: {
          field: 'collaborators',
          reason: 'Remove all collaborators before deleting',
          collaboratorCount: 2
        }
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-has-collaborators'
    }
  },
  
  collaborators: {
    list: createMockApiResponse(mockProject.collaborators),
    
    add: createMockApiResponse({
      message: 'Collaborator added successfully',
      collaborator: {
        id: 'user-789',
        email: 'newuser@example.com',
        username: 'newuser',
        displayName: 'New User',
        role: 'viewer',
        permissions: ['read'],
        joinedAt: new Date().toISOString()
      }
    }),
    
    remove: createMockApiResponse({
      message: 'Collaborator removed successfully'
    }),
    
    userNotFound: {
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        details: {
          field: 'email',
          reason: 'No user found with this email address'
        }
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-collaborator-not-found'
    },
    
    alreadyCollaborator: {
      success: false,
      error: {
        code: 'ALREADY_COLLABORATOR',
        message: 'User is already a collaborator on this project',
        details: {
          field: 'email',
          reason: 'User already has access to this project'
        }
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-already-collaborator'
    }
  }
};

// ============================================================================
// FILE SYSTEM API RESPONSES
// ============================================================================

export const fileResponses = {
  list: {
    success: createMockApiResponse([
      {
        id: 'file-1',
        name: 'index.tsx',
        path: '/src/index.tsx',
        type: 'file',
        size: 1024,
        lastModified: new Date().toISOString()
      },
      {
        id: 'folder-1',
        name: 'components',
        path: '/src/components',
        type: 'directory',
        children: 5,
        lastModified: new Date().toISOString()
      }
    ])
  },
  
  get: {
    success: createMockApiResponse({
      id: 'file-1',
      name: 'index.tsx',
      path: '/src/index.tsx',
      content: 'import React from "react";\n\nfunction App() {\n  return <div>Hello World</div>;\n}\n\nexport default App;',
      language: 'typescript',
      size: 1024,
      lastModified: new Date().toISOString(),
      encoding: 'utf-8'
    }),
    
    binary: createMockApiResponse({
      id: 'image-1',
      name: 'logo.png',
      path: '/public/logo.png',
      content: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      type: 'file',
      mimeType: 'image/png',
      size: 2048,
      lastModified: new Date().toISOString(),
      encoding: 'base64'
    }),
    
    notFound: {
      success: false,
      error: {
        code: 'FILE_NOT_FOUND',
        message: 'File not found',
        details: {
          field: 'path',
          reason: 'File does not exist at the specified path'
        }
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-file-not-found'
    }
  },
  
  create: {
    success: createMockApiResponse({
      id: 'new-file-123',
      name: 'new-file.tsx',
      path: '/src/new-file.tsx',
      content: '',
      size: 0,
      lastModified: new Date().toISOString(),
      message: 'File created successfully'
    }),
    
    alreadyExists: {
      success: false,
      error: {
        code: 'FILE_ALREADY_EXISTS',
        message: 'A file with this name already exists',
        details: {
          field: 'name',
          reason: 'File name must be unique in the directory'
        }
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-file-exists'
    },
    
    invalidName: {
      success: false,
      error: {
        code: 'INVALID_FILE_NAME',
        message: 'Invalid file name',
        details: {
          field: 'name',
          reason: 'File name contains invalid characters',
          allowedChars: 'a-z, A-Z, 0-9, ., -, _'
        }
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-invalid-name'
    }
  },
  
  update: {
    success: createMockApiResponse({
      id: 'file-1',
      path: '/src/index.tsx',
      size: 1124,
      lastModified: new Date().toISOString(),
      message: 'File updated successfully'
    }),
    
    readOnly: {
      success: false,
      error: {
        code: 'FILE_READ_ONLY',
        message: 'Cannot modify read-only file',
        details: {
          field: 'content',
          reason: 'File is marked as read-only'
        }
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-read-only'
    },
    
    tooLarge: {
      success: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: 'File size exceeds maximum allowed size',
        details: {
          field: 'content',
          reason: 'File size must be less than 10MB',
          maxSize: '10MB'
        }
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-file-too-large'
    }
  },
  
  delete: {
    success: createMockApiResponse({
      message: 'File deleted successfully',
      path: '/src/old-file.tsx'
    }),
    
    isDirectory: {
      success: false,
      error: {
        code: 'CANNOT_DELETE_DIRECTORY',
        message: 'Cannot delete directory with files',
        details: {
          field: 'path',
          reason: 'Directory contains files or subdirectories',
          fileCount: 5
        }
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-delete-directory'
    }
  },
  
  upload: {
    success: createMockApiResponse({
      files: [
        {
          id: 'uploaded-1',
          name: 'upload.jpg',
          path: '/uploads/upload.jpg',
          size: 204800,
          mimeType: 'image/jpeg',
          url: 'https://example.com/uploads/upload.jpg'
        }
      ],
      message: 'Files uploaded successfully'
    }),
    
    invalidType: {
      success: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: 'File type not allowed',
        details: {
          field: 'files',
          reason: 'Only images, documents, and code files are allowed',
          allowedTypes: ['jpg', 'png', 'gif', 'pdf', 'txt', 'md', 'js', 'ts', 'jsx', 'tsx']
        }
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-invalid-type'
    },
    
    quotaExceeded: {
      success: false,
      error: {
        code: 'STORAGE_QUOTA_EXCEEDED',
        message: 'Storage quota exceeded',
        details: {
          field: 'storage',
          reason: 'Project storage limit reached',
          currentUsage: '95MB',
          maxAllowed: '100MB'
        }
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-quota-exceeded'
    }
  }
};

// ============================================================================
// CHAT AND AI API RESPONSES
// ============================================================================

export const chatResponses = {
  conversations: {
    list: createMockApiResponse([
      mockChatConversation,
      {
        ...mockChatConversation,
        id: 'conversation-456',
        title: 'CSS Styling Help',
        messages: []
      }
    ]),
    
    empty: createMockApiResponse([])
  },
  
  conversation: {
    get: createMockApiResponse(mockChatConversation),
    
    notFound: {
      success: false,
      error: {
        code: 'CONVERSATION_NOT_FOUND',
        message: 'Conversation not found',
        details: {
          field: 'conversationId',
          reason: 'Conversation does not exist or has been deleted'
        }
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-conversation-not-found'
    }
  },
  
  sendMessage: {
    success: createMockApiResponse({
      message: {
        id: 'message-new',
        type: 'user',
        content: 'How do I implement authentication?',
        timestamp: new Date().toISOString(),
        status: 'sent'
      },
      conversationId: mockChatConversation.id
    }),
    
    rateLimited: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many messages sent. Please wait before sending another message.',
        details: {
          field: 'message',
          reason: 'Rate limit exceeded',
          retryAfter: 60,
          limit: '10 messages per minute'
        }
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-rate-limited'
    },
    
    contentFiltered: {
      success: false,
      error: {
        code: 'CONTENT_FILTERED',
        message: 'Message content violates our content policy',
        details: {
          field: 'content',
          reason: 'Message contains inappropriate content'
        }
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-content-filtered'
    }
  },
  
  aiResponse: {
    success: createMockApiResponse({
      message: {
        id: 'ai-response-new',
        type: 'assistant',
        content: 'I can help you implement authentication! Here are several approaches you can consider...',
        timestamp: new Date().toISOString(),
        status: 'received',
        metadata: {
          model: 'gpt-4',
          confidence: 0.92,
          tokens: 250,
          processingTime: 3.2
        }
      },
      conversationId: mockChatConversation.id
    }),
    
    serviceUnavailable: {
      success: false,
      error: {
        code: 'AI_SERVICE_UNAVAILABLE',
        message: 'AI service is temporarily unavailable',
        details: {
          field: 'service',
          reason: 'AI service is experiencing high load',
          retryAfter: 30
        }
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-ai-unavailable'
    },
    
    contextTooLong: {
      success: false,
      error: {
        code: 'CONTEXT_TOO_LONG',
        message: 'Conversation context is too long',
        details: {
          field: 'context',
          reason: 'Context exceeds maximum token limit',
          maxTokens: 8192,
          currentTokens: 9500
        }
      },
      timestamp: new Date().toISOString(),
      requestId: 'req-context-too-long'
    }
  }
};

// ============================================================================
// NOTIFICATION API RESPONSES
// ============================================================================

export const notificationResponses = {
  list: {
    success: createMockApiResponse([
      mockNotification,
      {
        ...mockNotification,
        id: 'notification-456',
        type: 'info',
        title: 'System Update',
        message: 'The platform will be updated tonight at 2 AM UTC.'
      }
    ]),
    
    unreadOnly: createMockApiResponse([mockNotification])
  },
  
  markAsRead: {
    success: createMockApiResponse({
      message: 'Notification marked as read',
      notificationId: mockNotification.id
    })
  },
  
  markAllAsRead: {
    success: createMockApiResponse({
      message: 'All notifications marked as read',
      count: 5
    })
  },
  
  delete: {
    success: createMockApiResponse({
      message: 'Notification deleted successfully',
      notificationId: mockNotification.id
    })
  },
  
  settings: {
    get: createMockApiResponse({
      email: true,
      push: true,
      inApp: true,
      projectUpdates: true,
      systemUpdates: false,
      marketingEmails: false
    }),
    
    update: createMockApiResponse({
      message: 'Notification settings updated successfully',
      settings: {
        email: false,
        push: true,
        inApp: true,
        projectUpdates: true,
        systemUpdates: true,
        marketingEmails: false
      }
    })
  }
};

// ============================================================================
// SEARCH API RESPONSES
// ============================================================================

export const searchResponses = {
  global: {
    success: createMockApiResponse({
      query: 'react component',
      results: [
        {
          id: 'result-1',
          type: 'file',
          title: 'Button.tsx',
          path: '/src/components/Button.tsx',
          snippet: 'export const Button: React.FC<ButtonProps> = ({ children, onClick }) => {',
          score: 0.95,
          projectId: mockProject.id
        },
        {
          id: 'result-2',
          type: 'project',
          title: 'React UI Library',
          description: 'A comprehensive React component library',
          score: 0.87,
          projectId: 'project-789'
        }
      ],
      totalResults: 25,
      searchTime: 45,
      suggestions: ['react hooks', 'react typescript', 'component props']
    }),
    
    noResults: createMockApiResponse({
      query: 'nonexistent query',
      results: [],
      totalResults: 0,
      searchTime: 12,
      suggestions: ['react', 'typescript', 'components']
    })
  },
  
  files: {
    success: createMockApiResponse({
      query: 'function handleClick',
      results: [
        {
          id: 'file-result-1',
          name: 'Button.tsx',
          path: '/src/components/Button.tsx',
          matches: [
            {
              line: 15,
              content: 'const handleClick = (event: MouseEvent) => {',
              highlight: { start: 6, end: 17 }
            }
          ],
          score: 0.92
        }
      ],
      totalResults: 3,
      searchTime: 25
    })
  }
};

// ============================================================================
// ANALYTICS API RESPONSES
// ============================================================================

export const analyticsResponses = {
  overview: {
    success: createMockApiResponse({
      totalProjects: 15,
      activeProjects: 8,
      totalUsers: 125,
      activeUsers: 45,
      storageUsed: '2.5GB',
      storageLimit: '10GB',
      apiCalls: 15420,
      apiLimit: 50000
    })
  },
  
  usage: {
    success: createMockApiResponse({
      period: 'last_30_days',
      metrics: {
        projectsCreated: 5,
        filesCreated: 120,
        linesOfCode: 5420,
        aiInteractions: 250,
        collaborations: 15
      },
      trends: {
        projectsCreated: '+25%',
        filesCreated: '+15%',
        linesOfCode: '+30%',
        aiInteractions: '+45%'
      }
    })
  },
  
  performance: {
    success: createMockApiResponse({
      period: 'last_24_hours',
      metrics: {
        averageLoadTime: 1.2,
        errorRate: 0.05,
        uptime: 99.9,
        responseTime: 250
      },
      breakdown: {
        api: { averageTime: 180, errorRate: 0.02 },
        frontend: { averageTime: 800, errorRate: 0.01 },
        database: { averageTime: 45, errorRate: 0.001 }
      }
    })
  }
};

// ============================================================================
// ERROR RESPONSES COLLECTION
// ============================================================================

export const errorResponses = {
  serverError: {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred. Please try again later.',
      details: {
        field: null,
        reason: 'Internal server error',
        timestamp: new Date().toISOString(),
        supportId: 'ERR-123456'
      }
    },
    timestamp: new Date().toISOString(),
    requestId: 'req-server-error'
  },
  
  unauthorized: {
    success: false,
    error: {
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
      details: {
        field: 'authorization',
        reason: 'Valid authentication token required'
      }
    },
    timestamp: new Date().toISOString(),
    requestId: 'req-unauthorized'
  },
  
  forbidden: {
    success: false,
    error: {
      code: 'FORBIDDEN',
      message: 'You do not have permission to perform this action',
      details: {
        field: 'permissions',
        reason: 'Insufficient permissions for this operation'
      }
    },
    timestamp: new Date().toISOString(),
    requestId: 'req-forbidden'
  },
  
  badRequest: {
    success: false,
    error: {
      code: 'BAD_REQUEST',
      message: 'Invalid request data',
      details: {
        field: 'request',
        reason: 'Request format is invalid or missing required fields'
      }
    },
    timestamp: new Date().toISOString(),
    requestId: 'req-bad-request'
  },
  
  rateLimited: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
      details: {
        field: 'rate_limit',
        reason: 'Request rate limit exceeded',
        retryAfter: 60,
        limit: '100 requests per minute'
      }
    },
    timestamp: new Date().toISOString(),
    requestId: 'req-rate-limited'
  },
  
  maintenance: {
    success: false,
    error: {
      code: 'SERVICE_UNAVAILABLE',
      message: 'Service is temporarily unavailable for maintenance',
      details: {
        field: 'service',
        reason: 'Scheduled maintenance in progress',
        retryAfter: 1800,
        maintenanceWindow: '2024-01-15T02:00:00.000Z to 2024-01-15T04:00:00.000Z'
      }
    },
    timestamp: new Date().toISOString(),
    requestId: 'req-maintenance'
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get a random success response
 */
export const getRandomSuccessResponse = (data?: any) => {
  return createMockApiResponse(data || { message: 'Operation completed successfully' });
};

/**
 * Get a random error response
 */
export const getRandomErrorResponse = () => {
  const errors = Object.values(errorResponses);
  return errors[Math.floor(Math.random() * errors.length)];
};

/**
 * Create a delayed response for testing loading states
 */
export const createDelayedResponse = <T>(response: T, delay: number = 1000): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(response), delay));
};

/**
 * Create a response that fails after delay
 */
export const createFailedResponse = (error: any = errorResponses.serverError, delay: number = 1000): Promise<never> => {
  return new Promise((_, reject) => setTimeout(() => reject(error), delay));
};

/**
 * Create paginated response
 */
export const createPaginatedResponse = <T>(
  items: T[],
  page: number = 1,
  limit: number = 10,
  total?: number
) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = items.slice(startIndex, endIndex);
  const actualTotal = total || items.length;
  
  return createMockApiResponse(paginatedItems, {
    pagination: createMockPagination(page, limit, actualTotal)
  });
};

// Export all responses grouped by feature
export const mockResponses = {
  auth: authResponses,
  user: userResponses,
  project: projectResponses,
  file: fileResponses,
  chat: chatResponses,
  notification: notificationResponses,
  search: searchResponses,
  analytics: analyticsResponses,
  errors: errorResponses
};
