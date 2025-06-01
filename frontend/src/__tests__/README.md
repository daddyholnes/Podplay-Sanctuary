# Testing Guide for Podplay Sanctuary

This guide provides comprehensive documentation for testing in the Podplay Sanctuary frontend application. It covers testing philosophies, patterns, utilities, and best practices.

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Test Structure](#test-structure)
3. [Testing Utilities](#testing-utilities)
4. [Mock System](#mock-system)
5. [Test Types](#test-types)
6. [Best Practices](#best-practices)
7. [Common Patterns](#common-patterns)
8. [Performance Testing](#performance-testing)
9. [Accessibility Testing](#accessibility-testing)
10. [CI/CD Integration](#cicd-integration)

## Testing Philosophy

### Core Principles

1. **Test Behavior, Not Implementation**: Focus on what the code does, not how it does it
2. **User-Centric Testing**: Write tests from the user's perspective
3. **Test Pyramid**: More unit tests, fewer integration tests, minimal E2E tests
4. **Fast Feedback**: Tests should run quickly to provide immediate feedback
5. **Reliable Tests**: Tests should be deterministic and not flaky

### Testing Priorities

1. **Critical User Paths**: Authentication, project creation, file operations
2. **Business Logic**: Core utilities, data transformations, calculations
3. **Error Handling**: Error boundaries, network failures, validation
4. **Performance**: Critical paths and resource-intensive operations
5. **Accessibility**: Screen reader support, keyboard navigation

## Test Structure

### Directory Organization

```
src/__tests__/
├── setup/              # Test configuration and setup
│   ├── setupTests.ts   # Jest/Vitest configuration
│   ├── setupMocks.ts   # Mock implementations
│   └── polyfills.ts    # Browser polyfills
├── fixtures/           # Test data and utilities
│   ├── mockData.ts     # Static mock data
│   ├── testUtils.ts    # Testing utilities
│   ├── mockComponents.ts # Component mocks
│   ├── mockServices.ts # Service layer mocks
│   ├── testFactories.ts # Data factories
│   └── mockResponses.ts # API response mocks
├── utils/              # Unit tests for utilities
├── components/         # Component tests
├── integration/        # Integration tests
└── e2e/               # End-to-end tests
```

### Test File Naming

- Unit tests: `*.test.ts` or `*.test.tsx`
- Integration tests: `*.integration.test.tsx`
- E2E tests: `*.e2e.test.tsx`
- Component tests: `ComponentName.test.tsx`

## Testing Utilities

### Custom Render Function

Use the custom render function for React component tests:

```typescript
import { renderWithProviders } from '@/test-utils';

test('renders component with providers', () => {
  const { getByText } = renderWithProviders(<MyComponent />);
  expect(getByText('Hello World')).toBeInTheDocument();
});
```

### Async Testing Utilities

```typescript
import { waitForAsync, waitForCondition } from '@/test-utils';

test('handles async operations', async () => {
  renderWithProviders(<AsyncComponent />);
  
  await waitForAsync(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});
```

### Mock Utilities

```typescript
import { createMockUser, createMockProject } from '@/fixtures';

test('uses mock data', () => {
  const user = createMockUser({ role: 'admin' });
  const project = createMockProject({ ownerId: user.id });
  
  // Test with mock data
});
```

## Mock System

### Component Mocks

```typescript
import { MockButton, MockModal } from '@/fixtures/mockComponents';

// Use in tests
test('renders with mocked components', () => {
  render(
    <div>
      <MockButton onClick={mockFn}>Click me</MockButton>
      <MockModal isOpen={true}>Modal content</MockModal>
    </div>
  );
});
```

### Service Mocks

```typescript
import { mockAuthService } from '@/fixtures/mockServices';

beforeEach(() => {
  mockAuthService.login.mockResolvedValue({
    user: createMockUser(),
    tokens: { accessToken: 'token' }
  });
});
```

### API Response Mocks

```typescript
import { authResponses } from '@/fixtures/mockResponses';

// Mock successful login
server.use(
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(ctx.json(authResponses.loginSuccess));
  })
);
```

## Test Types

### Unit Tests

Test individual functions and components in isolation:

```typescript
import { formatFileSize } from '@/utils/formatters';

describe('formatFileSize', () => {
  it('formats bytes correctly', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(1048576)).toBe('1.0 MB');
  });

  it('handles edge cases', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
    expect(formatFileSize(-1)).toBe('0 Bytes');
  });
});
```

### Component Tests

Test React components with user interactions:

```typescript
import { renderWithProviders, userEvent } from '@/test-utils';
import { Button } from '@/components/Button';

describe('Button', () => {
  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const { getByRole } = renderWithProviders(
      <Button onClick={handleClick}>Click me</Button>
    );

    await userEvent.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when loading', () => {
    const { getByRole } = renderWithProviders(
      <Button loading>Loading</Button>
    );

    expect(getByRole('button')).toBeDisabled();
  });
});
```

### Integration Tests

Test complete user workflows:

```typescript
import { renderWithProviders, userEvent, waitFor } from '@/test-utils';
import { ProjectCreationFlow } from '@/features/projects';

describe('Project Creation Flow', () => {
  it('creates a new project', async () => {
    const { getByLabelText, getByRole } = renderWithProviders(
      <ProjectCreationFlow />
    );

    // Fill form
    await userEvent.type(getByLabelText('Project Name'), 'My Project');
    await userEvent.selectOptions(getByLabelText('Project Type'), 'react-app');

    // Submit
    await userEvent.click(getByRole('button', { name: 'Create Project' }));

    // Verify result
    await waitFor(() => {
      expect(screen.getByText('Project created successfully')).toBeInTheDocument();
    });
  });
});
```

### E2E Tests

Test complete user journeys:

```typescript
import { test, expect } from '@playwright/test';

test('user can create and manage projects', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[data-testid="email"]', 'user@test.com');
  await page.fill('[data-testid="password"]', 'password');
  await page.click('[data-testid="login-button"]');

  // Create project
  await page.click('[data-testid="new-project"]');
  await page.fill('[data-testid="project-name"]', 'E2E Test Project');
  await page.click('[data-testid="create-project"]');

  // Verify project exists
  await expect(page.locator('[data-testid="project-list"]')).toContainText('E2E Test Project');
});
```

## Best Practices

### Test Organization

1. **Arrange, Act, Assert**: Structure tests clearly
2. **One Assertion Per Test**: Keep tests focused
3. **Descriptive Test Names**: Explain what is being tested
4. **Group Related Tests**: Use `describe` blocks effectively

### Data Management

1. **Use Factories**: Generate consistent test data
2. **Avoid Hardcoded Values**: Use variables and constants
3. **Reset Between Tests**: Clean up state and mocks
4. **Isolate Tests**: Each test should be independent

### Mocking Strategy

1. **Mock External Dependencies**: APIs, third-party libraries
2. **Mock Heavy Operations**: File uploads, network requests
3. **Avoid Over-Mocking**: Don't mock what you're testing
4. **Use Real Data Structures**: Keep mocks realistic

### Async Testing

1. **Use Proper Async Utilities**: `waitFor`, `findBy*` queries
2. **Avoid `act()` Warnings**: Use testing library utilities
3. **Handle Race Conditions**: Use proper timing controls
4. **Test Loading States**: Verify intermediate states

## Common Patterns

### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '@/hooks/useCounter';

test('useCounter increments count', () => {
  const { result } = renderHook(() => useCounter());

  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(1);
});
```

### Testing Context

```typescript
import { renderWithProviders } from '@/test-utils';
import { ThemeProvider } from '@/contexts/ThemeContext';

test('component uses theme context', () => {
  const { getByTestId } = renderWithProviders(
    <ThemeProvider theme="dark">
      <ThemedComponent />
    </ThemeProvider>
  );

  expect(getByTestId('themed-element')).toHaveClass('dark-theme');
});
```

### Testing Error Boundaries

```typescript
import { renderWithProviders } from '@/test-utils';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test error');
};

test('error boundary catches errors', () => {
  const { getByText } = renderWithProviders(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(getByText('Something went wrong')).toBeInTheDocument();
});
```

### Testing Forms

```typescript
import { renderWithProviders, userEvent } from '@/test-utils';
import { ContactForm } from '@/components/ContactForm';

test('form validation works', async () => {
  const onSubmit = vi.fn();
  const { getByLabelText, getByRole, getByText } = renderWithProviders(
    <ContactForm onSubmit={onSubmit} />
  );

  // Submit empty form
  await userEvent.click(getByRole('button', { name: 'Submit' }));

  // Check validation errors
  expect(getByText('Email is required')).toBeInTheDocument();
  expect(onSubmit).not.toHaveBeenCalled();

  // Fill valid data
  await userEvent.type(getByLabelText('Email'), 'user@test.com');
  await userEvent.type(getByLabelText('Message'), 'Hello world');
  await userEvent.click(getByRole('button', { name: 'Submit' }));

  // Verify submission
  expect(onSubmit).toHaveBeenCalledWith({
    email: 'user@test.com',
    message: 'Hello world'
  });
});
```

## Performance Testing

### Measuring Component Performance

```typescript
import { measureComponentPerformance } from '@/test-utils';
import { LargeDataTable } from '@/components/LargeDataTable';

test('component renders within performance budget', async () => {
  const data = generateLargeDataset(10000);
  
  const metrics = await measureComponentPerformance(() => 
    renderWithProviders(<LargeDataTable data={data} />)
  );

  expect(metrics.renderTime).toBeLessThan(100); // ms
  expect(metrics.memoryUsage).toBeLessThan(50 * 1024 * 1024); // 50MB
});
```

### Testing Memory Leaks

```typescript
import { checkMemoryLeaks } from '@/test-utils';

test('component cleans up properly', async () => {
  const cleanup = await checkMemoryLeaks(async () => {
    const { unmount } = renderWithProviders(<ComponentWithCleanup />);
    unmount();
  });

  expect(cleanup.memoryLeaks).toBe(0);
  expect(cleanup.eventListeners).toBe(0);
});
```

## Accessibility Testing

### Screen Reader Testing

```typescript
import { renderWithProviders, screen } from '@/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('component is accessible', async () => {
  const { container } = renderWithProviders(<AccessibleComponent />);
  
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Keyboard Navigation Testing

```typescript
import { renderWithProviders, userEvent } from '@/test-utils';

test('component supports keyboard navigation', async () => {
  const { getByRole } = renderWithProviders(<NavigableMenu />);
  
  const firstItem = getByRole('menuitem', { name: 'First Item' });
  firstItem.focus();

  await userEvent.keyboard('{ArrowDown}');
  expect(getByRole('menuitem', { name: 'Second Item' })).toHaveFocus();

  await userEvent.keyboard('{Enter}');
  expect(mockOnSelect).toHaveBeenCalledWith('second');
});
```

## CI/CD Integration

### GitHub Actions Configuration

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e
      - run: npm run test:accessibility
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### Test Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run src/**/*.test.{ts,tsx}",
    "test:integration": "vitest run src/**/*.integration.test.{ts,tsx}",
    "test:e2e": "playwright test",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:accessibility": "axe-core-cli src/",
    "test:performance": "vitest run --reporter=performance"
  }
}
```

### Coverage Configuration

```javascript
// vitest.config.ts
export default {
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      },
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        'src/main.tsx'
      ]
    }
  }
};
```

## Troubleshooting

### Common Issues

1. **Async Tests Timing Out**
   - Use proper async utilities
   - Increase timeout for slow operations
   - Check for missing awaits

2. **Flaky Tests**
   - Ensure proper cleanup
   - Use deterministic data
   - Avoid relying on timing

3. **Memory Leaks in Tests**
   - Clean up event listeners
   - Cancel pending requests
   - Clear timers and intervals

4. **Mock Issues**
   - Reset mocks between tests
   - Use proper mock implementations
   - Avoid mock conflicts

### Debugging Tips

1. **Use `screen.debug()`** to see current DOM state
2. **Add `waitFor()` logging** to debug timing issues
3. **Use `--reporter=verbose`** for detailed test output
4. **Enable source maps** for better error traces

## Resources

- [Testing Library Documentation](https://testing-library.com/)
- [Vitest Documentation](https://vitest.dev/)
- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Axe Accessibility Testing](https://github.com/dequelabs/axe-core)

## Contributing

When adding new tests:

1. Follow the established patterns
2. Update this guide for new utilities
3. Add examples for complex scenarios
4. Ensure tests are fast and reliable
5. Document any special setup requirements
