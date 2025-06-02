import { describe, it, expect, vi } from 'vitest';

describe('Test Setup Verification', () => {
  it('should have window.matchMedia mocked', () => {
    console.log('=== Running setup.test.ts: window.matchMedia check ===');
    expect(window.matchMedia).toBeDefined();
    // Check if it's the mock function we expect from Vitest setup
    expect(vi.isMockFunction(window.matchMedia)).toBe(true);
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    expect(mediaQuery.matches).toBe(false); // As per our mock
    // Check if the inner functions of the mock are also mocks
    expect(vi.isMockFunction(mediaQuery.addListener)).toBe(true);
  });

  it('should have localStorage mocked', () => {
    console.log('=== Running setup.test.ts: localStorage check ===');
    expect(window.localStorage).toBeDefined();
    expect(vi.isMockFunction(window.localStorage.getItem)).toBe(true);
    expect(vi.isMockFunction(window.localStorage.setItem)).toBe(true);

    // Test the mock behavior
    window.localStorage.setItem('testKey', 'testValue');
    expect(window.localStorage.getItem('testKey')).toBe('testValue');
    expect(window.localStorage.setItem).toHaveBeenCalledWith('testKey', 'testValue');
  });
});
