/**
 * Test Fixtures Index
 * 
 * Central export point for all test fixtures, mock data, and testing utilities
 * used throughout the Podplay Sanctuary test suite.
 */

// Export all fixtures and utilities
export * from './mockData';
export * from './testUtils';
export * from './mockResponses';
export * from './testFixtures';
export * from './mockComponents';
export * from './mockServices';
export * from './testFactories';

// Re-export commonly used items with shorter names
export { mockComponents as MockComponents } from './mockComponents';
export { mockServices as MockServices } from './mockServices';
export { 
  UserFactory,
  ProjectFactory,
  FileFactory,
  ChatMessageFactory,
  ConversationFactory,
  NotificationFactory,
  ErrorFactory,
  scenarioFactories
} from './testFactories';

// Export fixture utilities
export { fixtureUtils } from './testFixtures';
export { mockComponentUtils } from './mockComponents';
export { serviceUtils } from './mockServices';
