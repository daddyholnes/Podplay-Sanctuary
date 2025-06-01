/**
 * Test Data Factories for Podplay Sanctuary
 * 
 * This file provides factory functions for creating test data with
 * customizable properties, builders, and sequences for comprehensive
 * test scenarios.
 */

import { faker } from '@faker-js/faker';

// =============================================================================
// BASE FACTORY TYPES
// =============================================================================

type FactoryOptions<T> = Partial<T> & {
  count?: number;
  sequence?: boolean;
};

type Factory<T> = (options?: FactoryOptions<T>) => T;
type FactoryBuilder<T> = {
  build: (options?: FactoryOptions<T>) => T;
  buildMany: (count: number, options?: FactoryOptions<T>) => T[];
  sequence: (options?: FactoryOptions<T>) => Generator<T>;
};

// =============================================================================
// USER FACTORIES
// =============================================================================

export const userFactory: Factory<any> = (options = {}) => {
  const id = options.id || `user-${faker.string.uuid()}`;
  const firstName = options.firstName || faker.person.firstName();
  const lastName = options.lastName || faker.person.lastName();
  
  return {
    id,
    email: options.email || faker.internet.email({ firstName, lastName }),
    username: options.username || faker.internet.userName({ firstName, lastName }),
    firstName,
    lastName,
    role: options.role || faker.helpers.arrayElement(['user', 'admin', 'moderator']),
    avatar: options.avatar || faker.image.avatar(),
    isEmailVerified: options.isEmailVerified ?? faker.datatype.boolean(),
    lastLoginAt: options.lastLoginAt || faker.date.recent({ days: 30 }),
    createdAt: options.createdAt || faker.date.past({ years: 2 }),
    updatedAt: options.updatedAt || faker.date.recent({ days: 7 }),
    preferences: {
      theme: faker.helpers.arrayElement(['light', 'dark', 'system']),
      language: faker.helpers.arrayElement(['en', 'es', 'fr', 'de']),
      timezone: faker.location.timeZone(),
      notifications: faker.datatype.boolean(),
      autoSave: faker.datatype.boolean(),
      codeCompletion: faker.datatype.boolean(),
      ...options.preferences,
    },
    subscription: {
      plan: faker.helpers.arrayElement(['free', 'pro', 'enterprise']),
      status: faker.helpers.arrayElement(['active', 'expired', 'cancelled']),
      expiresAt: faker.date.future({ years: 1 }),
      features: faker.helpers.arrayElements(['basic_projects', 'ai_assistance', 'collaboration', 'priority_support']),
      ...options.subscription,
    },
    ...options,
  };
};

export const adminUserFactory: Factory<any> = (options = {}) => {
  return userFactory({
    role: 'admin',
    subscription: {
      plan: 'enterprise',
      status: 'active',
      features: ['unlimited_projects', 'priority_support', 'advanced_ai', 'collaboration'],
    },
    permissions: ['read', 'write', 'delete', 'admin'],
    ...options,
  });
};

export const newUserFactory: Factory<any> = (options = {}) => {
  return userFactory({
    isEmailVerified: false,
    lastLoginAt: null,
    createdAt: new Date(),
    subscription: {
      plan: 'free',
      status: 'active',
      features: ['basic_projects'],
    },
    preferences: {
      theme: 'system',
      notifications: true,
      autoSave: true,
      codeCompletion: false,
    },
    ...options,
  });
};

// =============================================================================
// PROJECT FACTORIES
// =============================================================================

export const projectFactory: Factory<any> = (options = {}) => {
  const name = options.name || faker.commerce.productName();
  
  return {
    id: options.id || `proj-${faker.string.uuid()}`,
    name,
    description: options.description || faker.lorem.paragraph(),
    type: options.type || faker.helpers.arrayElement(['react-app', 'vue-app', 'web-app', 'api', 'library']),
    status: options.status || faker.helpers.arrayElement(['active', 'archived', 'deleted']),
    visibility: options.visibility || faker.helpers.arrayElement(['public', 'private', 'internal']),
    ownerId: options.ownerId || `user-${faker.string.uuid()}`,
    collaborators: options.collaborators || [],
    tags: options.tags || faker.helpers.arrayElements(['react', 'typescript', 'testing', 'ui', 'api'], { min: 0, max: 3 }),
    createdAt: options.createdAt || faker.date.past({ years: 1 }),
    updatedAt: options.updatedAt || faker.date.recent({ days: 30 }),
    settings: {
      autoSave: faker.datatype.boolean(),
      linting: faker.datatype.boolean(),
      formatting: faker.datatype.boolean(),
      gitIntegration: faker.datatype.boolean(),
      aiAssistance: faker.datatype.boolean(),
      ...options.settings,
    },
    metrics: {
      linesOfCode: faker.number.int({ min: 100, max: 100000 }),
      files: faker.number.int({ min: 5, max: 500 }),
      contributors: faker.number.int({ min: 1, max: 20 }),
      commits: faker.number.int({ min: 1, max: 1000 }),
      lastCommit: faker.date.recent({ days: 7 }),
      ...options.metrics,
    },
    ...options,
  };
};

export const largeProjectFactory: Factory<any> = (options = {}) => {
  return projectFactory({
    type: 'web-app',
    metrics: {
      linesOfCode: faker.number.int({ min: 50000, max: 500000 }),
      files: faker.number.int({ min: 200, max: 2000 }),
      contributors: faker.number.int({ min: 10, max: 50 }),
      commits: faker.number.int({ min: 500, max: 5000 }),
    },
    collaborators: Array.from({ length: faker.number.int({ min: 5, max: 15 }) }, () => ({
      userId: `user-${faker.string.uuid()}`,
      role: faker.helpers.arrayElement(['developer', 'reviewer', 'admin']),
      permissions: faker.helpers.arrayElements(['read', 'write', 'delete']),
      addedAt: faker.date.past({ months: 6 }),
    })),
    ...options,
  });
};

export const starterProjectFactory: Factory<any> = (options = {}) => {
  return projectFactory({
    type: 'react-app',
    status: 'active',
    metrics: {
      linesOfCode: faker.number.int({ min: 50, max: 500 }),
      files: faker.number.int({ min: 3, max: 15 }),
      contributors: 1,
      commits: faker.number.int({ min: 1, max: 10 }),
    },
    settings: {
      autoSave: true,
      linting: false,
      formatting: true,
      gitIntegration: false,
      aiAssistance: true,
    },
    ...options,
  });
};

// =============================================================================
// FILE FACTORIES
// =============================================================================

export const fileFactory: Factory<any> = (options = {}) => {
  const extensions = ['ts', 'tsx', 'js', 'jsx', 'css', 'json', 'md'];
  const extension = options.extension || faker.helpers.arrayElement(extensions);
  const name = options.name || `${faker.system.fileName({ extensionCount: 0 })}.${extension}`;
  
  return {
    id: options.id || `file-${faker.string.uuid()}`,
    name,
    path: options.path || `/src/${faker.system.directoryPath()}/${name}`,
    type: options.type || extension,
    size: options.size || faker.number.int({ min: 100, max: 50000 }),
    content: options.content || generateFileContent(extension),
    lastModified: options.lastModified || faker.date.recent({ days: 7 }),
    createdAt: options.createdAt || faker.date.past({ months: 6 }),
    metadata: {
      linesOfCode: faker.number.int({ min: 10, max: 1000 }),
      encoding: 'utf-8',
      language: getLanguageFromExtension(extension),
      ...options.metadata,
    },
    ...options,
  };
};

export const componentFileFactory: Factory<any> = (options = {}) => {
  const componentName = options.componentName || faker.hacker.noun();
  const pascalName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
  
  return fileFactory({
    name: `${pascalName}.tsx`,
    type: 'tsx',
    content: generateReactComponent(pascalName),
    metadata: {
      language: 'typescript',
      framework: 'react',
      exports: [pascalName],
    },
    ...options,
  });
};

export const testFileFactory: Factory<any> = (options = {}) => {
  const testName = options.testName || faker.hacker.noun();
  
  return fileFactory({
    name: `${testName}.test.ts`,
    type: 'test',
    content: generateTestFile(testName),
    metadata: {
      language: 'typescript',
      testFramework: 'vitest',
      testCount: faker.number.int({ min: 5, max: 50 }),
    },
    ...options,
  });
};

// =============================================================================
// CHAT MESSAGE FACTORIES
// =============================================================================

export const chatMessageFactory: Factory<any> = (options = {}) => {
  return {
    id: options.id || `msg-${faker.string.uuid()}`,
    senderId: options.senderId || `user-${faker.string.uuid()}`,
    content: options.content || faker.lorem.sentences({ min: 1, max: 3 }),
    timestamp: options.timestamp || faker.date.recent({ hours: 24 }),
    type: options.type || faker.helpers.arrayElement(['text', 'code', 'image', 'file']),
    metadata: {
      confidence: faker.number.float({ min: 0.8, max: 1.0, fractionDigits: 2 }),
      language: faker.helpers.arrayElement(['typescript', 'javascript', 'python', 'html', 'css']),
      ...options.metadata,
    },
    reactions: options.reactions || [],
    editedAt: options.editedAt || null,
    ...options,
  };
};

export const codeMessageFactory: Factory<any> = (options = {}) => {
  const language = options.language || faker.helpers.arrayElement(['typescript', 'javascript', 'python']);
  
  return chatMessageFactory({
    type: 'code',
    content: generateCodeSnippet(language),
    metadata: {
      language,
      confidence: faker.number.float({ min: 0.9, max: 1.0, fractionDigits: 2 }),
      executable: faker.datatype.boolean(),
    },
    ...options,
  });
};

export const aiMessageFactory: Factory<any> = (options = {}) => {
  return chatMessageFactory({
    senderId: 'ai-assistant',
    content: generateAIResponse(),
    metadata: {
      confidence: faker.number.float({ min: 0.85, max: 0.99, fractionDigits: 2 }),
      sources: faker.helpers.arrayElements(['Documentation', 'Stack Overflow', 'GitHub', 'Best Practices']),
      responseTime: faker.number.int({ min: 100, max: 2000 }),
    },
    ...options,
  });
};

// =============================================================================
// CONVERSATION FACTORIES
// =============================================================================

export const conversationFactory: Factory<any> = (options = {}) => {
  const messageCount = options.messageCount || faker.number.int({ min: 5, max: 50 });
  const participants = options.participants || [
    `user-${faker.string.uuid()}`,
    'ai-assistant',
  ];
  
  return {
    id: options.id || `conv-${faker.string.uuid()}`,
    title: options.title || faker.lorem.words({ min: 2, max: 6 }),
    participants,
    messages: Array.from({ length: messageCount }, (_, i) => 
      chatMessageFactory({
        senderId: participants[i % participants.length],
        timestamp: new Date(Date.now() - (messageCount - i) * 60000),
      })
    ),
    createdAt: options.createdAt || faker.date.past({ days: 30 }),
    updatedAt: options.updatedAt || faker.date.recent({ hours: 24 }),
    metadata: {
      topic: faker.helpers.arrayElement(['React', 'TypeScript', 'Testing', 'Performance', 'Debugging']),
      complexity: faker.helpers.arrayElement(['beginner', 'intermediate', 'advanced']),
      resolved: faker.datatype.boolean(),
    },
    ...options,
  };
};

// =============================================================================
// NOTIFICATION FACTORIES
// =============================================================================

export const notificationFactory: Factory<any> = (options = {}) => {
  const types = ['info', 'success', 'warning', 'error'];
  const type = options.type || faker.helpers.arrayElement(types);
  
  return {
    id: options.id || `notif-${faker.string.uuid()}`,
    title: options.title || generateNotificationTitle(type),
    message: options.message || faker.lorem.sentence(),
    type,
    read: options.read ?? faker.datatype.boolean(),
    priority: options.priority || faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent']),
    category: options.category || faker.helpers.arrayElement(['system', 'project', 'chat', 'security']),
    createdAt: options.createdAt || faker.date.recent({ days: 7 }),
    expiresAt: options.expiresAt || faker.date.future({ days: 30 }),
    actions: options.actions || generateNotificationActions(type),
    metadata: {
      source: faker.helpers.arrayElement(['system', 'user', 'ai', 'external']),
      relatedId: faker.string.uuid(),
      ...options.metadata,
    },
    ...options,
  };
};

// =============================================================================
// ERROR FACTORIES
// =============================================================================

export const errorFactory: Factory<any> = (options = {}) => {
  const errorTypes = ['NETWORK_ERROR', 'VALIDATION_ERROR', 'AUTH_ERROR', 'SERVER_ERROR'];
  const type = options.type || faker.helpers.arrayElement(errorTypes);
  
  return {
    id: options.id || `error-${faker.string.uuid()}`,
    code: options.code || type,
    message: options.message || generateErrorMessage(type),
    stack: options.stack || faker.lorem.lines({ min: 5, max: 15 }),
    timestamp: options.timestamp || new Date(),
    userId: options.userId || `user-${faker.string.uuid()}`,
    context: {
      url: faker.internet.url(),
      userAgent: faker.internet.userAgent(),
      sessionId: faker.string.uuid(),
      ...options.context,
    },
    severity: options.severity || faker.helpers.arrayElement(['low', 'medium', 'high', 'critical']),
    resolved: options.resolved ?? false,
    ...options,
  };
};

// =============================================================================
// PERFORMANCE METRIC FACTORIES
// =============================================================================

export const performanceMetricFactory: Factory<any> = (options = {}) => {
  return {
    id: options.id || `metric-${faker.string.uuid()}`,
    timestamp: options.timestamp || new Date(),
    metrics: {
      loadTime: faker.number.int({ min: 500, max: 5000 }),
      firstContentfulPaint: faker.number.int({ min: 200, max: 2000 }),
      largestContentfulPaint: faker.number.int({ min: 800, max: 4000 }),
      firstInputDelay: faker.number.int({ min: 10, max: 300 }),
      cumulativeLayoutShift: faker.number.float({ min: 0, max: 0.5, fractionDigits: 3 }),
      memoryUsage: faker.number.int({ min: 10, max: 500 }) * 1024 * 1024, // MB in bytes
      ...options.metrics,
    },
    page: options.page || faker.internet.url({ appendSlash: false }),
    userAgent: options.userAgent || faker.internet.userAgent(),
    connectionType: options.connectionType || faker.helpers.arrayElement(['4g', 'wifi', '3g', 'slow-2g']),
    deviceType: options.deviceType || faker.helpers.arrayElement(['desktop', 'mobile', 'tablet']),
    ...options,
  };
};

// =============================================================================
// FACTORY BUILDERS
// =============================================================================

function createFactoryBuilder<T>(factory: Factory<T>): FactoryBuilder<T> {
  return {
    build: (options = {}) => factory(options),
    
    buildMany: (count: number, options = {}) => {
      return Array.from({ length: count }, (_, i) => 
        factory({ ...options, ...(options.sequence ? { index: i } : {}) })
      );
    },
    
    sequence: function* (options = {}) {
      let index = 0;
      while (true) {
        yield factory({ ...options, index: index++ });
      }
    },
  };
}

// Export factory builders
export const UserFactory = createFactoryBuilder(userFactory);
export const AdminUserFactory = createFactoryBuilder(adminUserFactory);
export const NewUserFactory = createFactoryBuilder(newUserFactory);
export const ProjectFactory = createFactoryBuilder(projectFactory);
export const LargeProjectFactory = createFactoryBuilder(largeProjectFactory);
export const StarterProjectFactory = createFactoryBuilder(starterProjectFactory);
export const FileFactory = createFactoryBuilder(fileFactory);
export const ComponentFileFactory = createFactoryBuilder(componentFileFactory);
export const TestFileFactory = createFactoryBuilder(testFileFactory);
export const ChatMessageFactory = createFactoryBuilder(chatMessageFactory);
export const CodeMessageFactory = createFactoryBuilder(codeMessageFactory);
export const AIMessageFactory = createFactoryBuilder(aiMessageFactory);
export const ConversationFactory = createFactoryBuilder(conversationFactory);
export const NotificationFactory = createFactoryBuilder(notificationFactory);
export const ErrorFactory = createFactoryBuilder(errorFactory);
export const PerformanceMetricFactory = createFactoryBuilder(performanceMetricFactory);

// =============================================================================
// CONTENT GENERATORS
// =============================================================================

function generateFileContent(extension: string): string {
  switch (extension) {
    case 'ts':
    case 'tsx':
      return generateTypeScriptContent();
    case 'js':
    case 'jsx':
      return generateJavaScriptContent();
    case 'css':
      return generateCSSContent();
    case 'json':
      return JSON.stringify(generateJSONContent(), null, 2);
    case 'md':
      return generateMarkdownContent();
    default:
      return faker.lorem.paragraphs({ min: 3, max: 10 });
  }
}

function generateTypeScriptContent(): string {
  return `// ${faker.lorem.sentence()}
export interface ${faker.hacker.noun().charAt(0).toUpperCase() + faker.hacker.noun().slice(1)} {
  id: string;
  name: string;
  ${faker.hacker.noun()}: ${faker.helpers.arrayElement(['string', 'number', 'boolean'])};
  createdAt: Date;
}

export function ${faker.hacker.verb()}${faker.hacker.noun().charAt(0).toUpperCase() + faker.hacker.noun().slice(1)}(): ${faker.helpers.arrayElement(['string', 'number', 'boolean', 'void'])} {
  // ${faker.lorem.sentence()}
  return ${faker.helpers.arrayElement(['"result"', '42', 'true', 'null'])};
}`;
}

function generateJavaScriptContent(): string {
  return `// ${faker.lorem.sentence()}
function ${faker.hacker.verb()}${faker.hacker.noun().charAt(0).toUpperCase() + faker.hacker.noun().slice(1)}() {
  const ${faker.hacker.noun()} = ${faker.helpers.arrayElement(['"value"', '123', 'true', '{}'])};
  
  // ${faker.lorem.sentence()}
  return ${faker.hacker.noun()};
}

module.exports = { ${faker.hacker.verb()}${faker.hacker.noun().charAt(0).toUpperCase() + faker.hacker.noun().slice(1)} };`;
}

function generateCSSContent(): string {
  return `.${faker.hacker.noun()} {
  color: ${faker.internet.color()};
  background-color: ${faker.internet.color()};
  padding: ${faker.number.int({ min: 8, max: 32 })}px;
  margin: ${faker.number.int({ min: 0, max: 16 })}px;
  border-radius: ${faker.number.int({ min: 4, max: 12 })}px;
}

.${faker.hacker.noun()}-${faker.hacker.noun()} {
  display: ${faker.helpers.arrayElement(['flex', 'block', 'inline-block', 'grid'])};
  align-items: ${faker.helpers.arrayElement(['center', 'flex-start', 'flex-end'])};
  justify-content: ${faker.helpers.arrayElement(['center', 'space-between', 'flex-start'])};
}`;
}

function generateJSONContent(): any {
  return {
    name: faker.company.name(),
    version: faker.system.semver(),
    description: faker.lorem.sentence(),
    main: "index.js",
    scripts: {
      start: "node index.js",
      test: "jest",
      build: "webpack",
    },
    dependencies: {
      [faker.hacker.noun()]: faker.system.semver(),
      [faker.hacker.noun()]: faker.system.semver(),
    },
  };
}

function generateMarkdownContent(): string {
  return `# ${faker.lorem.words({ min: 2, max: 5 })}

${faker.lorem.paragraph()}

## ${faker.lorem.words({ min: 1, max: 3 })}

${faker.lorem.paragraphs({ min: 2, max: 4 })}

### Code Example

\`\`\`typescript
${generateTypeScriptContent()}
\`\`\`

## ${faker.lorem.words({ min: 1, max: 3 })}

- ${faker.lorem.sentence()}
- ${faker.lorem.sentence()}
- ${faker.lorem.sentence()}
`;
}

function generateReactComponent(name: string): string {
  return `import React from 'react';

interface ${name}Props {
  title?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const ${name}: React.FC<${name}Props> = ({ 
  title = 'Default Title',
  onClick,
  disabled = false 
}) => {
  return (
    <div className="${name.toLowerCase()}">
      <h2>{title}</h2>
      <button onClick={onClick} disabled={disabled}>
        Click me
      </button>
    </div>
  );
};

export default ${name};`;
}

function generateTestFile(name: string): string {
  return `import { describe, it, expect, vi } from 'vitest';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('should ${faker.hacker.verb()} correctly', () => {
    // Arrange
    const input = '${faker.lorem.word()}';
    
    // Act
    const result = ${name}(input);
    
    // Assert
    expect(result).toBeDefined();
  });

  it('should handle edge cases', () => {
    expect(() => ${name}(null)).not.toThrow();
    expect(${name}('')).toBe('');
  });
});`;
}

function generateCodeSnippet(language: string): string {
  switch (language) {
    case 'typescript':
      return generateTypeScriptContent();
    case 'javascript':
      return generateJavaScriptContent();
    case 'python':
      return `def ${faker.hacker.verb()}_${faker.hacker.noun()}(${faker.hacker.noun()}: str) -> str:
    """${faker.lorem.sentence()}"""
    return f"${faker.lorem.words()}: {${faker.hacker.noun()}}"`;
    default:
      return generateTypeScriptContent();
  }
}

function generateAIResponse(): string {
  const responses = [
    `Based on your question, I'd recommend ${faker.lorem.sentence()}`,
    `Here's how you can solve that: ${faker.lorem.paragraph()}`,
    `The best practice for this is to ${faker.lorem.sentence()}`,
    `I see what you're trying to do. ${faker.lorem.paragraph()}`,
  ];
  return faker.helpers.arrayElement(responses);
}

function generateNotificationTitle(type: string): string {
  const titles = {
    info: ['New feature available', 'System update', 'Tip of the day'],
    success: ['Task completed', 'File saved successfully', 'Deployment successful'],
    warning: ['Storage almost full', 'Unsaved changes', 'Connection unstable'],
    error: ['Build failed', 'Authentication error', 'Network timeout'],
  };
  return faker.helpers.arrayElement(titles[type as keyof typeof titles] || titles.info);
}

function generateNotificationActions(type: string): any[] {
  const actions = {
    info: [{ id: 'learn-more', label: 'Learn More' }],
    success: [{ id: 'view', label: 'View Result' }],
    warning: [{ id: 'resolve', label: 'Resolve' }, { id: 'ignore', label: 'Ignore' }],
    error: [{ id: 'retry', label: 'Retry' }, { id: 'report', label: 'Report Bug' }],
  };
  return actions[type as keyof typeof actions] || [];
}

function generateErrorMessage(type: string): string {
  const messages = {
    NETWORK_ERROR: 'Failed to connect to server',
    VALIDATION_ERROR: 'Invalid input provided',
    AUTH_ERROR: 'Authentication failed',
    SERVER_ERROR: 'Internal server error occurred',
  };
  return messages[type as keyof typeof messages] || 'An unexpected error occurred';
}

function getLanguageFromExtension(extension: string): string {
  const map: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    css: 'css',
    json: 'json',
    md: 'markdown',
    py: 'python',
    html: 'html',
  };
  return map[extension] || 'text';
}

// =============================================================================
// SCENARIO FACTORIES
// =============================================================================

export const scenarioFactories = {
  // User onboarding scenario
  userOnboarding: () => ({
    newUser: NewUserFactory.build(),
    firstProject: StarterProjectFactory.build(),
    welcomeNotifications: NotificationFactory.buildMany(3, { type: 'info' }),
  }),

  // Collaboration scenario
  collaboration: () => {
    const owner = UserFactory.build();
    const collaborators = UserFactory.buildMany(3);
    const project = LargeProjectFactory.build({ 
      ownerId: owner.id,
      collaborators: collaborators.map(c => ({
        userId: c.id,
        role: 'developer',
        permissions: ['read', 'write'],
      })),
    });
    
    return { owner, collaborators, project };
  },

  // Error recovery scenario
  errorRecovery: () => ({
    errors: ErrorFactory.buildMany(5, { severity: 'high' }),
    user: UserFactory.build(),
    notifications: NotificationFactory.buildMany(3, { type: 'error' }),
  }),

  // Performance testing scenario
  performanceTest: () => ({
    metrics: PerformanceMetricFactory.buildMany(100),
    users: UserFactory.buildMany(50),
    projects: ProjectFactory.buildMany(20),
  }),
};

export default {
  UserFactory,
  AdminUserFactory,
  NewUserFactory,
  ProjectFactory,
  LargeProjectFactory,
  StarterProjectFactory,
  FileFactory,
  ComponentFileFactory,
  TestFileFactory,
  ChatMessageFactory,
  CodeMessageFactory,
  AIMessageFactory,
  ConversationFactory,
  NotificationFactory,
  ErrorFactory,
  PerformanceMetricFactory,
  scenarioFactories,
};
