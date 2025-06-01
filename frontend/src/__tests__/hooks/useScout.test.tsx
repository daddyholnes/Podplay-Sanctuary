/**
 * @fileoverview Comprehensive test suite for Scout hooks
 * Tests code analysis, insights generation, performance monitoring,
 * dependency analysis, and real-time code quality features
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import WS from 'jest-websocket-mock';
import { useScout, useCodeAnalysis, useInsights } from '../../hooks/scout';
import { scoutSlice } from '../../store/slices/scoutSlice';
import { mockAnalysisData, mockInsightsData, mockMetricsData } from '../utils';
import type { 
  CodeAnalysisRequest, 
  AnalysisResult, 
  CodeInsight,
  PerformanceMetrics,
  DependencyAnalysis 
} from '../../types';

// Mock dependencies
jest.mock('../../services/api/ApiService');
jest.mock('../../services/socket/SocketService');

// Test store setup
const createTestStore = (initialState = {}) =>
  configureStore({
    reducer: {
      scout: scoutSlice.reducer,
    },
    preloadedState: {
      scout: {
        analysis: {
          results: [],
          isAnalyzing: false,
          lastAnalysis: null,
          error: null,
        },
        insights: {
          data: [],
          isGenerating: false,
          lastUpdate: null,
          error: null,
        },
        metrics: {
          performance: null,
          dependencies: null,
          codeQuality: null,
          isLoading: false,
          error: null,
        },
        settings: {
          autoAnalysis: true,
          analysisDepth: 'medium',
          enableRealtime: true,
          thresholds: {
            performance: 85,
            maintainability: 80,
            security: 90,
          },
        },
        ...initialState,
      },
    },
  });

// Test wrapper component
const TestWrapper: React.FC<{ 
  children: React.ReactNode; 
  store?: ReturnType<typeof createTestStore>;
}> = ({ children, store = createTestStore() }) => (
  <Provider store={store}>
    {children}
  </Provider>
);

describe('useScout Hook', () => {
  let mockServer: WS;
  const mockApiService = {
    request: jest.fn(),
    upload: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockServer = new WS('ws://localhost:3001');
    (global as any).fetch = jest.fn();
  });

  afterEach(() => {
    WS.clean();
  });

  describe('Code Analysis', () => {
    it('should start code analysis successfully', async () => {
      const mockAnalysisRequest: CodeAnalysisRequest = {
        files: ['src/components/Chat.tsx', 'src/services/ApiService.ts'],
        type: 'comprehensive',
        options: {
          includeMetrics: true,
          includeSuggestions: true,
          depth: 'deep',
        },
      };

      const mockAnalysisResult: AnalysisResult = mockAnalysisData.comprehensiveAnalysis;

      mockApiService.request.mockResolvedValue({
        data: mockAnalysisResult,
        success: true,
      });

      const { result } = renderHook(() => useScout(), {
        wrapper: TestWrapper,
      });

      // Start analysis
      await act(async () => {
        await result.current.startAnalysis(mockAnalysisRequest);
      });

      // Verify analysis state
      expect(result.current.analysis.isAnalyzing).toBe(false);
      expect(result.current.analysis.results).toHaveLength(1);
      expect(result.current.analysis.results[0]).toEqual(mockAnalysisResult);
      expect(result.current.analysis.error).toBeNull();
    });

    it('should handle analysis with real-time updates', async () => {
      const { result } = renderHook(() => useScout(), {
        wrapper: TestWrapper,
      });

      const mockProgressUpdate = {
        type: 'analysis_progress',
        data: {
          stage: 'parsing',
          progress: 45,
          currentFile: 'src/components/Chat.tsx',
          estimatedTime: 15000,
        },
      };

      // Start analysis
      act(() => {
        result.current.startAnalysis({
          files: ['src/components/Chat.tsx'],
          type: 'quick',
          options: { realtime: true },
        });
      });

      // Simulate WebSocket progress update
      await act(async () => {
        mockServer.send(JSON.stringify(mockProgressUpdate));
      });

      expect(result.current.analysis.isAnalyzing).toBe(true);
      expect(result.current.analysis.progress).toEqual(mockProgressUpdate.data);
    });

    it('should handle analysis errors gracefully', async () => {
      const mockError = new Error('Analysis failed: Invalid file format');
      mockApiService.request.mockRejectedValue(mockError);

      const { result } = renderHook(() => useScout(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        try {
          await result.current.startAnalysis({
            files: ['invalid-file.xyz'],
            type: 'comprehensive',
          });
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.analysis.isAnalyzing).toBe(false);
      expect(result.current.analysis.error).toEqual(mockError.message);
      expect(result.current.analysis.results).toHaveLength(0);
    });

    it('should cancel ongoing analysis', async () => {
      const { result } = renderHook(() => useScout(), {
        wrapper: TestWrapper,
      });

      // Start analysis
      act(() => {
        result.current.startAnalysis({
          files: ['src/large-file.ts'],
          type: 'comprehensive',
        });
      });

      expect(result.current.analysis.isAnalyzing).toBe(true);

      // Cancel analysis
      act(() => {
        result.current.cancelAnalysis();
      });

      expect(result.current.analysis.isAnalyzing).toBe(false);
      expect(result.current.analysis.error).toBeNull();
    });
  });

  describe('Code Insights', () => {
    it('should generate insights successfully', async () => {
      const mockInsights: CodeInsight[] = mockInsightsData.performanceInsights;

      mockApiService.request.mockResolvedValue({
        data: { insights: mockInsights },
        success: true,
      });

      const { result } = renderHook(() => useScout(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.generateInsights({
          analysisId: 'analysis-123',
          focus: ['performance', 'maintainability'],
          context: 'React component optimization',
        });
      });

      expect(result.current.insights.data).toEqual(mockInsights);
      expect(result.current.insights.isGenerating).toBe(false);
      expect(result.current.insights.error).toBeNull();
    });

    it('should refresh insights automatically', async () => {
      const store = createTestStore({
        settings: { autoAnalysis: true, enableRealtime: true },
      });

      const { result } = renderHook(() => useScout(), {
        wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>,
      });

      // Mock file change event
      const fileChangeEvent = {
        type: 'file_changed',
        data: {
          file: 'src/components/Chat.tsx',
          changeType: 'modified',
          timestamp: Date.now(),
        },
      };

      await act(async () => {
        mockServer.send(JSON.stringify(fileChangeEvent));
      });

      // Wait for auto-refresh
      await waitFor(() => {
        expect(mockApiService.request).toHaveBeenCalledWith(
          expect.objectContaining({
            url: expect.stringContaining('/insights/refresh'),
          })
        );
      });
    });

    it('should handle insights generation with custom filters', async () => {
      const { result } = renderHook(() => useScout(), {
        wrapper: TestWrapper,
      });

      const customFilters = {
        severity: ['high', 'critical'],
        category: ['performance', 'security'],
        filePattern: '*.tsx',
        excludePatterns: ['**/*.test.*', '**/node_modules/**'],
      };

      await act(async () => {
        await result.current.generateInsights({
          analysisId: 'analysis-456',
          filters: customFilters,
        });
      });

      expect(mockApiService.request).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            filters: customFilters,
          }),
        })
      );
    });
  });

  describe('Performance Metrics', () => {
    it('should fetch performance metrics', async () => {
      const mockMetrics: PerformanceMetrics = mockMetricsData.performance;

      mockApiService.request.mockResolvedValue({
        data: mockMetrics,
        success: true,
      });

      const { result } = renderHook(() => useScout(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.fetchMetrics('performance');
      });

      expect(result.current.metrics.performance).toEqual(mockMetrics);
      expect(result.current.metrics.isLoading).toBe(false);
      expect(result.current.metrics.error).toBeNull();
    });

    it('should monitor real-time performance', async () => {
      const { result } = renderHook(() => useScout(), {
        wrapper: TestWrapper,
      });

      // Start monitoring
      act(() => {
        result.current.startPerformanceMonitoring({
          interval: 5000,
          metrics: ['cpu', 'memory', 'renderTime'],
        });
      });

      // Simulate performance update
      const performanceUpdate = {
        type: 'performance_update',
        data: {
          cpu: 23.5,
          memory: 156.7,
          renderTime: 16.2,
          timestamp: Date.now(),
        },
      };

      await act(async () => {
        mockServer.send(JSON.stringify(performanceUpdate));
      });

      expect(result.current.metrics.realtime).toEqual(performanceUpdate.data);
    });

    it('should detect performance regressions', async () => {
      const store = createTestStore({
        settings: {
          thresholds: { performance: 85 },
        },
      });

      const { result } = renderHook(() => useScout(), {
        wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>,
      });

      // Simulate performance degradation
      const regressionAlert = {
        type: 'performance_regression',
        data: {
          metric: 'renderTime',
          current: 42.3,
          baseline: 16.8,
          threshold: 25.0,
          severity: 'high',
          component: 'ChatWindow',
        },
      };

      await act(async () => {
        mockServer.send(JSON.stringify(regressionAlert));
      });

      expect(result.current.alerts).toContainEqual(
        expect.objectContaining({
          type: 'performance_regression',
          severity: 'high',
        })
      );
    });
  });

  describe('Dependency Analysis', () => {
    it('should analyze project dependencies', async () => {
      const mockDependencyAnalysis: DependencyAnalysis = mockAnalysisData.dependencies;

      mockApiService.request.mockResolvedValue({
        data: mockDependencyAnalysis,
        success: true,
      });

      const { result } = renderHook(() => useScout(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.analyzeDependencies({
          includeDevDependencies: true,
          checkSecurity: true,
          findDuplicates: true,
        });
      });

      expect(result.current.metrics.dependencies).toEqual(mockDependencyAnalysis);
      expect(result.current.metrics.isLoading).toBe(false);
    });

    it('should detect security vulnerabilities', async () => {
      const vulnerabilityAlert = {
        type: 'security_vulnerability',
        data: {
          package: 'lodash',
          version: '4.17.20',
          severity: 'moderate',
          description: 'Prototype pollution vulnerability',
          cve: 'CVE-2021-23337',
          recommendation: 'Upgrade to version 4.17.21 or higher',
        },
      };

      const { result } = renderHook(() => useScout(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        mockServer.send(JSON.stringify(vulnerabilityAlert));
      });

      expect(result.current.security.vulnerabilities).toContainEqual(
        expect.objectContaining({
          package: 'lodash',
          severity: 'moderate',
        })
      );
    });

    it('should suggest dependency optimizations', async () => {
      const { result } = renderHook(() => useScout(), {
        wrapper: TestWrapper,
      });

      const optimizationSuggestions = {
        type: 'dependency_optimization',
        data: {
          suggestions: [
            {
              type: 'replace',
              current: 'moment',
              suggested: 'date-fns',
              reason: 'Smaller bundle size and better tree-shaking',
              impact: { bundleSize: -67.2, performance: 15 },
            },
            {
              type: 'remove',
              package: 'unused-package',
              reason: 'No imports found in codebase',
              impact: { bundleSize: -12.4 },
            },
          ],
        },
      };

      await act(async () => {
        mockServer.send(JSON.stringify(optimizationSuggestions));
      });

      expect(result.current.suggestions.dependencies).toEqual(
        optimizationSuggestions.data.suggestions
      );
    });
  });

  describe('Settings Management', () => {
    it('should update analysis settings', async () => {
      const { result } = renderHook(() => useScout(), {
        wrapper: TestWrapper,
      });

      const newSettings = {
        autoAnalysis: false,
        analysisDepth: 'shallow' as const,
        thresholds: {
          performance: 90,
          maintainability: 85,
          security: 95,
        },
      };

      act(() => {
        result.current.updateSettings(newSettings);
      });

      expect(result.current.settings).toEqual(
        expect.objectContaining(newSettings)
      );
    });

    it('should save settings to localStorage', async () => {
      const { result } = renderHook(() => useScout(), {
        wrapper: TestWrapper,
      });

      const settings = {
        enableRealtime: false,
        analysisDepth: 'deep' as const,
      };

      act(() => {
        result.current.updateSettings(settings);
      });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'scout_settings',
        JSON.stringify(expect.objectContaining(settings))
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network request failed');
      mockApiService.request.mockRejectedValue(networkError);

      const { result } = renderHook(() => useScout(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        try {
          await result.current.startAnalysis({
            files: ['src/test.ts'],
            type: 'quick',
          });
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.analysis.error).toContain('Network request failed');
      expect(result.current.analysis.isAnalyzing).toBe(false);
    });

    it('should retry failed requests', async () => {
      mockApiService.request
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockRejectedValueOnce(new Error('Still failing'))
        .mockResolvedValue({
          data: mockAnalysisData.quickAnalysis,
          success: true,
        });

      const { result } = renderHook(() => useScout(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.startAnalysis({
          files: ['src/test.ts'],
          type: 'quick',
          options: { retry: { attempts: 3, delay: 100 } },
        });
      });

      expect(mockApiService.request).toHaveBeenCalledTimes(3);
      expect(result.current.analysis.results).toHaveLength(1);
      expect(result.current.analysis.error).toBeNull();
    });

    it('should handle WebSocket disconnection', async () => {
      const { result } = renderHook(() => useScout(), {
        wrapper: TestWrapper,
      });

      // Start real-time monitoring
      act(() => {
        result.current.startPerformanceMonitoring({ interval: 1000 });
      });

      // Simulate WebSocket disconnection
      act(() => {
        mockServer.close();
      });

      expect(result.current.connection.status).toBe('disconnected');
      expect(result.current.connection.error).toBeTruthy();
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle full analysis workflow', async () => {
      const { result } = renderHook(() => useScout(), {
        wrapper: TestWrapper,
      });

      // Step 1: Start analysis
      await act(async () => {
        await result.current.startAnalysis({
          files: ['src/components/Chat.tsx'],
          type: 'comprehensive',
        });
      });

      expect(result.current.analysis.results).toHaveLength(1);

      // Step 2: Generate insights
      await act(async () => {
        await result.current.generateInsights({
          analysisId: result.current.analysis.results[0].id,
          focus: ['performance'],
        });
      });

      expect(result.current.insights.data.length).toBeGreaterThan(0);

      // Step 3: Fetch metrics
      await act(async () => {
        await result.current.fetchMetrics('performance');
      });

      expect(result.current.metrics.performance).toBeTruthy();
    });

    it('should coordinate with workspace changes', async () => {
      const { result } = renderHook(() => useScout(), {
        wrapper: TestWrapper,
      });

      // Enable auto-analysis
      act(() => {
        result.current.updateSettings({ autoAnalysis: true });
      });

      // Simulate file save event
      const fileSaveEvent = {
        type: 'file_saved',
        data: {
          file: 'src/components/Chat.tsx',
          timestamp: Date.now(),
        },
      };

      await act(async () => {
        mockServer.send(JSON.stringify(fileSaveEvent));
      });

      // Should trigger automatic analysis
      await waitFor(() => {
        expect(result.current.analysis.isAnalyzing).toBe(true);
      });
    });
  });
});

describe('useCodeAnalysis Hook', () => {
  it('should provide code analysis functionality', async () => {
    const { result } = renderHook(() => useCodeAnalysis(), {
      wrapper: TestWrapper,
    });

    expect(result.current.startAnalysis).toBeDefined();
    expect(result.current.getResults).toBeDefined();
    expect(result.current.isAnalyzing).toBe(false);
  });

  it('should filter analysis results', async () => {
    const { result } = renderHook(() => useCodeAnalysis(), {
      wrapper: TestWrapper,
    });

    // Mock some results
    const mockResults = [
      { id: '1', type: 'performance', severity: 'high', file: 'a.ts' },
      { id: '2', type: 'maintainability', severity: 'low', file: 'b.ts' },
      { id: '3', type: 'performance', severity: 'medium', file: 'c.ts' },
    ];

    // Add results to state
    act(() => {
      result.current.addResults(mockResults as any);
    });

    // Filter by type
    const performanceResults = result.current.getResults({ type: 'performance' });
    expect(performanceResults).toHaveLength(2);

    // Filter by severity
    const highSeverityResults = result.current.getResults({ severity: 'high' });
    expect(highSeverityResults).toHaveLength(1);
  });
});

describe('useInsights Hook', () => {
  it('should provide insights functionality', async () => {
    const { result } = renderHook(() => useInsights(), {
      wrapper: TestWrapper,
    });

    expect(result.current.generateInsights).toBeDefined();
    expect(result.current.getInsights).toBeDefined();
    expect(result.current.isGenerating).toBe(false);
  });

  it('should categorize insights', async () => {
    const { result } = renderHook(() => useInsights(), {
      wrapper: TestWrapper,
    });

    const mockInsights = [
      { id: '1', category: 'performance', title: 'Optimize render', priority: 'high' },
      { id: '2', category: 'security', title: 'Fix XSS', priority: 'critical' },
      { id: '3', category: 'performance', title: 'Reduce bundle', priority: 'medium' },
    ];

    act(() => {
      result.current.addInsights(mockInsights as any);
    });

    const performanceInsights = result.current.getInsights({ category: 'performance' });
    expect(performanceInsights).toHaveLength(2);

    const criticalInsights = result.current.getInsights({ priority: 'critical' });
    expect(criticalInsights).toHaveLength(1);
  });
});
