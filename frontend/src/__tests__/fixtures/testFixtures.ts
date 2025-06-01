/**
 * Test Fixtures for Podplay Sanctuary
 * 
 * This file provides comprehensive test fixtures for various testing scenarios
 * including complex user workflows, edge cases, and integration test data.
 */

import { User, Project, FileData, ChatMessage, NotificationData } from './mockData';

// =============================================================================
// USER TEST FIXTURES
// =============================================================================

export const userFixtures = {
  // Admin user with full permissions
  adminUser: {
    id: 'admin-001',
    email: 'admin@podplay.sanctuary',
    username: 'sanctuary_admin',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin' as const,
    permissions: ['read', 'write', 'delete', 'admin'],
    avatar: 'https://api.sanctuary.dev/avatars/admin-001.jpg',
    isEmailVerified: true,
    preferences: {
      theme: 'dark',
      language: 'en',
      timezone: 'UTC',
      notifications: true,
      autoSave: true,
      codeCompletion: true,
    },
    subscription: {
      plan: 'enterprise',
      status: 'active',
      expiresAt: new Date('2025-12-31'),
      features: ['unlimited_projects', 'priority_support', 'advanced_ai'],
    },
    lastLoginAt: new Date(),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  },

  // Regular user for standard testing
  regularUser: {
    id: 'user-001',
    email: 'user@test.com',
    username: 'test_user',
    firstName: 'Test',
    lastName: 'User',
    role: 'user' as const,
    permissions: ['read', 'write'],
    avatar: null,
    isEmailVerified: true,
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'America/New_York',
      notifications: true,
      autoSave: false,
      codeCompletion: true,
    },
    subscription: {
      plan: 'pro',
      status: 'active',
      expiresAt: new Date('2025-06-30'),
      features: ['multiple_projects', 'ai_assistance'],
    },
    lastLoginAt: new Date(),
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date(),
  },

  // New user for onboarding tests
  newUser: {
    id: 'user-new',
    email: 'newbie@test.com',
    username: 'new_user',
    firstName: 'New',
    lastName: 'User',
    role: 'user' as const,
    permissions: ['read'],
    avatar: null,
    isEmailVerified: false,
    preferences: {
      theme: 'system',
      language: 'en',
      timezone: 'UTC',
      notifications: true,
      autoSave: true,
      codeCompletion: false,
    },
    subscription: {
      plan: 'free',
      status: 'active',
      expiresAt: new Date('2030-01-01'),
      features: ['basic_projects'],
    },
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Expired subscription user
  expiredUser: {
    id: 'user-expired',
    email: 'expired@test.com',
    username: 'expired_user',
    firstName: 'Expired',
    lastName: 'User',
    role: 'user' as const,
    permissions: ['read'],
    avatar: null,
    isEmailVerified: true,
    preferences: {
      theme: 'dark',
      language: 'en',
      timezone: 'UTC',
      notifications: false,
      autoSave: false,
      codeCompletion: false,
    },
    subscription: {
      plan: 'pro',
      status: 'expired',
      expiresAt: new Date('2024-12-31'),
      features: [],
    },
    lastLoginAt: new Date('2024-12-30'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-31'),
  },
};

// =============================================================================
// PROJECT TEST FIXTURES
// =============================================================================

export const projectFixtures = {
  // Large enterprise project
  enterpriseProject: {
    id: 'proj-enterprise',
    name: 'Enterprise Dashboard',
    description: 'Complex enterprise dashboard with multiple modules',
    type: 'web-app',
    status: 'active',
    visibility: 'private',
    ownerId: 'admin-001',
    collaborators: [
      { userId: 'user-001', role: 'developer', permissions: ['read', 'write'] },
      { userId: 'user-002', role: 'reviewer', permissions: ['read'] },
    ],
    settings: {
      autoSave: true,
      linting: true,
      formatting: true,
      gitIntegration: true,
      aiAssistance: true,
    },
    structure: {
      src: {
        components: {
          'Dashboard.tsx': { size: 15000, lastModified: new Date() },
          'Sidebar.tsx': { size: 8000, lastModified: new Date() },
          'Header.tsx': { size: 5000, lastModified: new Date() },
        },
        pages: {
          'Home.tsx': { size: 12000, lastModified: new Date() },
          'Analytics.tsx': { size: 20000, lastModified: new Date() },
          'Settings.tsx': { size: 10000, lastModified: new Date() },
        },
        utils: {
          'api.ts': { size: 25000, lastModified: new Date() },
          'constants.ts': { size: 3000, lastModified: new Date() },
          'helpers.ts': { size: 8000, lastModified: new Date() },
        },
      },
      'package.json': { size: 2000, lastModified: new Date() },
      'README.md': { size: 5000, lastModified: new Date() },
    },
    metrics: {
      linesOfCode: 50000,
      files: 120,
      contributors: 5,
      commits: 1250,
      lastCommit: new Date(),
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
  },

  // Simple starter project
  starterProject: {
    id: 'proj-starter',
    name: 'My First App',
    description: 'A simple React application for beginners',
    type: 'react-app',
    status: 'active',
    visibility: 'public',
    ownerId: 'user-new',
    collaborators: [],
    settings: {
      autoSave: true,
      linting: false,
      formatting: true,
      gitIntegration: false,
      aiAssistance: true,
    },
    structure: {
      src: {
        'App.tsx': { size: 1000, lastModified: new Date() },
        'index.tsx': { size: 500, lastModified: new Date() },
        'App.css': { size: 800, lastModified: new Date() },
      },
      'package.json': { size: 1500, lastModified: new Date() },
      'README.md': { size: 1000, lastModified: new Date() },
    },
    metrics: {
      linesOfCode: 150,
      files: 5,
      contributors: 1,
      commits: 3,
      lastCommit: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Archived project
  archivedProject: {
    id: 'proj-archived',
    name: 'Legacy System',
    description: 'Old project that has been archived',
    type: 'web-app',
    status: 'archived',
    visibility: 'private',
    ownerId: 'user-001',
    collaborators: [],
    settings: {
      autoSave: false,
      linting: false,
      formatting: false,
      gitIntegration: true,
      aiAssistance: false,
    },
    structure: {
      src: {
        'index.js': { size: 5000, lastModified: new Date('2023-12-01') },
        'styles.css': { size: 2000, lastModified: new Date('2023-12-01') },
      },
      'package.json': { size: 1800, lastModified: new Date('2023-12-01') },
    },
    metrics: {
      linesOfCode: 8000,
      files: 25,
      contributors: 3,
      commits: 450,
      lastCommit: new Date('2023-12-01'),
    },
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-12-01'),
  },
};

// =============================================================================
// CHAT CONVERSATION FIXTURES
// =============================================================================

export const chatFixtures = {
  // Technical discussion
  technicalChat: {
    id: 'chat-tech',
    title: 'React Performance Optimization',
    participants: ['user-001', 'ai-assistant'],
    messages: [
      {
        id: 'msg-1',
        senderId: 'user-001',
        content: 'How can I optimize my React component performance?',
        timestamp: new Date(Date.now() - 3600000),
        type: 'text',
      },
      {
        id: 'msg-2',
        senderId: 'ai-assistant',
        content: 'Here are several strategies for React performance optimization:\n\n1. Use React.memo for component memoization\n2. Implement useMemo and useCallback hooks\n3. Optimize re-renders with proper key props\n4. Consider code splitting with React.lazy',
        timestamp: new Date(Date.now() - 3580000),
        type: 'text',
        metadata: {
          confidence: 0.95,
          sources: ['React Documentation', 'Performance Best Practices'],
        },
      },
      {
        id: 'msg-3',
        senderId: 'user-001',
        content: 'Can you show me an example of useMemo implementation?',
        timestamp: new Date(Date.now() - 3560000),
        type: 'text',
      },
      {
        id: 'msg-4',
        senderId: 'ai-assistant',
        content: '```typescript\nconst ExpensiveComponent = ({ items, filter }) => {\n  const filteredItems = useMemo(() => {\n    return items.filter(item => item.category === filter);\n  }, [items, filter]);\n\n  return (\n    <div>\n      {filteredItems.map(item => <Item key={item.id} item={item} />)}\n    </div>\n  );\n};\n```',
        timestamp: new Date(Date.now() - 3540000),
        type: 'code',
        metadata: {
          language: 'typescript',
          confidence: 0.98,
        },
      },
    ],
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 3540000),
  },

  // Error troubleshooting
  errorChat: {
    id: 'chat-error',
    title: 'TypeScript Error Resolution',
    participants: ['user-001', 'ai-assistant'],
    messages: [
      {
        id: 'msg-error-1',
        senderId: 'user-001',
        content: 'I\'m getting this TypeScript error: "Property \'x\' does not exist on type \'{}\'". How do I fix it?',
        timestamp: new Date(Date.now() - 1800000),
        type: 'text',
        metadata: {
          errorType: 'typescript',
          severity: 'error',
        },
      },
      {
        id: 'msg-error-2',
        senderId: 'ai-assistant',
        content: 'This error typically occurs when TypeScript can\'t infer the correct type. Here are the most common solutions:\n\n1. **Explicit Type Annotation:**\n```typescript\ninterface MyObject {\n  x: string;\n}\nconst obj: MyObject = { x: "value" };\n```\n\n2. **Type Assertion:**\n```typescript\nconst obj = {} as { x: string };\nobj.x = "value";\n```\n\n3. **Optional Properties:**\n```typescript\ninterface MyObject {\n  x?: string;\n}\n```',
        timestamp: new Date(Date.now() - 1780000),
        type: 'text',
        metadata: {
          confidence: 0.97,
          codeBlocks: 3,
        },
      },
    ],
    createdAt: new Date(Date.now() - 1800000),
    updatedAt: new Date(Date.now() - 1780000),
  },

  // Long conversation
  longChat: {
    id: 'chat-long',
    title: 'Full Stack Development Discussion',
    participants: ['user-001', 'ai-assistant'],
    messages: Array.from({ length: 50 }, (_, i) => ({
      id: `msg-long-${i + 1}`,
      senderId: i % 2 === 0 ? 'user-001' : 'ai-assistant',
      content: i % 2 === 0 
        ? `User question #${Math.floor(i / 2) + 1}: How do I implement feature X?`
        : `AI response #${Math.floor(i / 2) + 1}: Here's how you can implement that feature...`,
      timestamp: new Date(Date.now() - (50 - i) * 120000),
      type: 'text',
    })),
    createdAt: new Date(Date.now() - 6000000),
    updatedAt: new Date(Date.now() - 120000),
  },
};

// =============================================================================
// FILE SYSTEM FIXTURES
// =============================================================================

export const fileFixtures = {
  // Large TypeScript file
  largeTypeScriptFile: {
    id: 'file-large-ts',
    name: 'UserManager.ts',
    path: '/src/services/UserManager.ts',
    type: 'typescript',
    size: 45000,
    content: `// UserManager.ts - Comprehensive user management service
import { User, UserPreferences, UserSubscription } from '../types/user';
import { ApiClient } from './ApiClient';
import { Logger } from '../utils/logger';

export class UserManager {
  private apiClient: ApiClient;
  private logger: Logger;
  private cache: Map<string, User> = new Map();

  constructor(apiClient: ApiClient, logger: Logger) {
    this.apiClient = apiClient;
    this.logger = logger;
  }

  // ... rest of implementation (45KB total)
}`,
    lastModified: new Date(),
    createdAt: new Date('2024-02-01'),
    metadata: {
      linesOfCode: 1200,
      complexity: 'high',
      dependencies: ['ApiClient', 'Logger', 'User types'],
      exports: ['UserManager'],
    },
  },

  // CSS file with complex styles
  complexCSSFile: {
    id: 'file-complex-css',
    name: 'theme.css',
    path: '/src/styles/theme.css',
    type: 'css',
    size: 25000,
    content: `/* Theme CSS - Comprehensive design system */
:root {
  /* Color variables */
  --primary-50: #f0f9ff;
  --primary-100: #e0f2fe;
  --primary-500: #0ea5e9;
  --primary-900: #0c4a6e;
  
  /* Typography */
  --font-family-sans: 'Inter', sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --line-height-normal: 1.5;
  
  /* Spacing */
  --space-1: 0.25rem;
  --space-4: 1rem;
  --space-8: 2rem;
}

/* Component styles */
.button {
  /* Complex button implementation */
}

/* ... rest of styles (25KB total) */`,
    lastModified: new Date(),
    createdAt: new Date('2024-01-15'),
    metadata: {
      linesOfCode: 800,
      selectors: 150,
      customProperties: 45,
      mediaQueries: 12,
    },
  },

  // JSON configuration file
  configFile: {
    id: 'file-config',
    name: 'app.config.json',
    path: '/config/app.config.json',
    type: 'json',
    size: 3500,
    content: JSON.stringify({
      app: {
        name: 'Podplay Sanctuary',
        version: '1.0.0',
        environment: 'development',
      },
      api: {
        baseUrl: 'https://api.sanctuary.dev',
        timeout: 30000,
        retries: 3,
      },
      features: {
        aiAssistance: true,
        realTimeChat: true,
        collaboration: true,
        analytics: false,
      },
      ui: {
        theme: 'auto',
        animations: true,
        accessibility: {
          highContrast: false,
          reducedMotion: false,
        },
      },
    }, null, 2),
    lastModified: new Date(),
    createdAt: new Date('2024-01-01'),
    metadata: {
      format: 'json',
      valid: true,
      properties: 25,
    },
  },

  // Binary file
  binaryFile: {
    id: 'file-binary',
    name: 'logo.png',
    path: '/public/assets/logo.png',
    type: 'image',
    size: 15000,
    content: null, // Binary content not stored as string
    lastModified: new Date(),
    createdAt: new Date('2024-01-01'),
    metadata: {
      format: 'png',
      dimensions: { width: 512, height: 512 },
      colorDepth: 32,
    },
  },
};

// =============================================================================
// ERROR SCENARIOS
// =============================================================================

export const errorFixtures = {
  // Network errors
  networkErrors: {
    connectionTimeout: {
      code: 'NETWORK_TIMEOUT',
      message: 'Request timed out after 30 seconds',
      details: { timeout: 30000, url: 'https://api.sanctuary.dev/users' },
    },
    serverError: {
      code: 'SERVER_ERROR',
      message: 'Internal server error',
      details: { status: 500, statusText: 'Internal Server Error' },
    },
    rateLimited: {
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please try again later.',
      details: { retryAfter: 60, limit: 100 },
    },
  },

  // Authentication errors
  authErrors: {
    invalidCredentials: {
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password',
      details: { field: 'credentials' },
    },
    tokenExpired: {
      code: 'TOKEN_EXPIRED',
      message: 'Authentication token has expired',
      details: { expiredAt: new Date(Date.now() - 3600000) },
    },
    insufficientPermissions: {
      code: 'INSUFFICIENT_PERMISSIONS',
      message: 'You do not have permission to perform this action',
      details: { required: ['admin'], current: ['user'] },
    },
  },

  // Validation errors
  validationErrors: {
    invalidEmail: {
      code: 'VALIDATION_ERROR',
      message: 'Invalid email format',
      details: { field: 'email', value: 'invalid-email' },
    },
    passwordTooWeak: {
      code: 'VALIDATION_ERROR',
      message: 'Password must be at least 8 characters with uppercase, lowercase, and numbers',
      details: { field: 'password', requirements: ['length', 'uppercase', 'lowercase', 'numbers'] },
    },
    requiredField: {
      code: 'VALIDATION_ERROR',
      message: 'This field is required',
      details: { field: 'name' },
    },
  },
};

// =============================================================================
// PERFORMANCE TEST SCENARIOS
// =============================================================================

export const performanceFixtures = {
  // Large dataset scenarios
  largeDatasets: {
    users: Array.from({ length: 10000 }, (_, i) => ({
      id: `user-${i}`,
      name: `User ${i}`,
      email: `user${i}@test.com`,
      lastActive: new Date(Date.now() - Math.random() * 86400000 * 30),
    })),
    
    projects: Array.from({ length: 1000 }, (_, i) => ({
      id: `project-${i}`,
      name: `Project ${i}`,
      description: `Description for project ${i}`,
      fileCount: Math.floor(Math.random() * 100) + 1,
      size: Math.floor(Math.random() * 1000000) + 10000,
    })),
    
    files: Array.from({ length: 5000 }, (_, i) => ({
      id: `file-${i}`,
      name: `file-${i}.tsx`,
      path: `/src/components/file-${i}.tsx`,
      size: Math.floor(Math.random() * 50000) + 1000,
      lastModified: new Date(Date.now() - Math.random() * 86400000 * 7),
    })),
  },

  // Performance metrics
  metrics: {
    loadTimes: {
      initial: 1200, // ms
      navigation: 300,
      codeCompletion: 150,
      fileOpen: 80,
      search: 250,
    },
    memory: {
      initial: 50 * 1024 * 1024, // 50MB
      afterLargeFile: 75 * 1024 * 1024, // 75MB
      peak: 100 * 1024 * 1024, // 100MB
    },
    benchmarks: {
      renderTime: 16.67, // 60fps
      searchTime: 100,
      saveTime: 50,
      compilationTime: 2000,
    },
  },
};

// =============================================================================
// INTEGRATION TEST SCENARIOS
// =============================================================================

export const integrationFixtures = {
  // Complete user workflow
  userWorkflow: {
    steps: [
      { action: 'login', data: { email: 'user@test.com', password: 'password123' } },
      { action: 'createProject', data: { name: 'Test Project', type: 'react-app' } },
      { action: 'addFile', data: { name: 'App.tsx', content: 'export default function App() { return <div>Hello</div>; }' } },
      { action: 'saveFile', data: { id: 'file-1' } },
      { action: 'runTests', data: { projectId: 'project-1' } },
      { action: 'deployProject', data: { projectId: 'project-1', environment: 'staging' } },
    ],
    expectedResults: {
      projectCreated: true,
      filesSaved: 1,
      testsPass: true,
      deploymentSuccess: true,
    },
  },

  // Collaboration scenario
  collaborationScenario: {
    participants: ['user-001', 'user-002'],
    actions: [
      { userId: 'user-001', action: 'shareProject', data: { projectId: 'proj-1', userId: 'user-002' } },
      { userId: 'user-002', action: 'acceptInvitation', data: { projectId: 'proj-1' } },
      { userId: 'user-001', action: 'editFile', data: { fileId: 'file-1', changes: 'line 10: added new feature' } },
      { userId: 'user-002', action: 'editFile', data: { fileId: 'file-1', changes: 'line 15: fixed bug' } },
      { userId: 'user-001', action: 'resolveConflict', data: { fileId: 'file-1', resolution: 'merge' } },
    ],
    expectedResults: {
      collaborationEstablished: true,
      conflictsResolved: true,
      changesSync: true,
    },
  },
};

// =============================================================================
// ACCESSIBILITY TEST FIXTURES
// =============================================================================

export const accessibilityFixtures = {
  // Screen reader scenarios
  screenReaderScenarios: [
    {
      name: 'Navigation with screen reader',
      steps: [
        'Focus on main navigation',
        'Navigate to projects section',
        'Open project with Enter key',
        'Navigate to file explorer',
        'Select file with keyboard',
      ],
      expectedAria: {
        landmarks: ['main', 'navigation', 'complementary'],
        headings: ['h1', 'h2', 'h3'],
        labels: ['Project name', 'File name', 'Actions'],
      },
    },
    {
      name: 'Form interaction',
      steps: [
        'Focus on form field',
        'Read field label and description',
        'Enter invalid data',
        'Receive error announcement',
        'Correct data and submit',
      ],
      expectedAria: {
        labels: ['Email address', 'Password'],
        descriptions: ['Enter your email', 'Password must be 8+ characters'],
        errors: ['Invalid email format', 'Password too short'],
      },
    },
  ],

  // Keyboard navigation
  keyboardNavigation: {
    sequences: [
      { keys: ['Tab'], expected: 'Focus moves to next interactive element' },
      { keys: ['Shift', 'Tab'], expected: 'Focus moves to previous interactive element' },
      { keys: ['Enter'], expected: 'Activates focused button or link' },
      { keys: ['Space'], expected: 'Toggles checkbox or button' },
      { keys: ['Escape'], expected: 'Closes modal or dropdown' },
      { keys: ['ArrowDown'], expected: 'Moves to next menu item' },
      { keys: ['ArrowUp'], expected: 'Moves to previous menu item' },
    ],
    testElements: [
      'button',
      'input',
      'select',
      'textarea',
      'a[href]',
      '[tabindex="0"]',
    ],
  },

  // Color contrast tests
  colorContrast: {
    combinations: [
      { background: '#ffffff', foreground: '#000000', ratio: 21, level: 'AAA' },
      { background: '#0ea5e9', foreground: '#ffffff', ratio: 3.1, level: 'AA' },
      { background: '#ef4444', foreground: '#ffffff', ratio: 3.9, level: 'AA' },
      { background: '#f3f4f6', foreground: '#374151', ratio: 7.1, level: 'AAA' },
    ],
    minimumRatios: {
      'AA-normal': 4.5,
      'AA-large': 3,
      'AAA-normal': 7,
      'AAA-large': 4.5,
    },
  },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export const fixtureUtils = {
  // Generate test data
  generateUsers: (count: number) => Array.from({ length: count }, (_, i) => ({
    ...userFixtures.regularUser,
    id: `generated-user-${i}`,
    email: `user${i}@generated.test`,
    username: `generated_user_${i}`,
  })),

  generateProjects: (count: number, ownerId: string) => Array.from({ length: count }, (_, i) => ({
    ...projectFixtures.starterProject,
    id: `generated-project-${i}`,
    name: `Generated Project ${i}`,
    ownerId,
  })),

  generateMessages: (count: number, participants: string[]) => Array.from({ length: count }, (_, i) => ({
    id: `generated-msg-${i}`,
    senderId: participants[i % participants.length],
    content: `Generated message ${i}`,
    timestamp: new Date(Date.now() - (count - i) * 60000),
    type: 'text' as const,
  })),

  // Create test scenarios
  createWorkflowScenario: (name: string, steps: any[]) => ({
    name,
    steps,
    id: `scenario-${Date.now()}`,
    createdAt: new Date(),
  }),

  createErrorScenario: (errorType: string, details: any) => ({
    type: errorType,
    details,
    timestamp: new Date(),
    id: `error-${Date.now()}`,
  }),

  // Validate fixtures
  validateUser: (user: any): boolean => {
    return !!(user.id && user.email && user.username && user.role);
  },

  validateProject: (project: any): boolean => {
    return !!(project.id && project.name && project.ownerId && project.type);
  },

  validateMessage: (message: any): boolean => {
    return !!(message.id && message.senderId && message.content && message.timestamp);
  },

  // Reset fixtures to initial state
  resetFixtures: () => {
    // Reset any mutable fixture data
    Object.values(userFixtures).forEach(user => {
      user.updatedAt = new Date();
    });
    Object.values(projectFixtures).forEach(project => {
      project.updatedAt = new Date();
    });
  },
};

export default {
  users: userFixtures,
  projects: projectFixtures,
  chats: chatFixtures,
  files: fileFixtures,
  errors: errorFixtures,
  performance: performanceFixtures,
  integration: integrationFixtures,
  accessibility: accessibilityFixtures,
  utils: fixtureUtils,
};
