/**
 * Performance Utilities
 * 
 * Provides performance monitoring, optimization utilities,
 * and debugging tools for application performance analysis.
 */

/**
 * Performance configuration
 */
export const PERFORMANCE_CONFIG = {
  // Monitoring thresholds (in milliseconds)
  thresholds: {
    slow: 100,
    warning: 500,
    critical: 1000,
  },
  
  // Sampling rates
  sampling: {
    metrics: 0.1, // 10% sampling
    traces: 0.05, // 5% sampling
    errors: 1.0, // 100% error sampling
  },
  
  // Buffer sizes
  buffers: {
    metrics: 1000,
    traces: 100,
    marks: 500,
  },
  
  // Performance observer options
  observer: {
    entryTypes: ['measure', 'navigation', 'resource', 'paint'],
    buffered: true,
  },
} as const;

/**
 * Performance measurement result
 */
export interface PerformanceMeasurement {
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
  metadata?: Record<string, any>;
}

/**
 * Performance metric
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags?: Record<string, string>;
}

/**
 * Performance monitor instance
 */
class PerformanceMonitor {
  private measurements: Map<string, PerformanceMeasurement[]> = new Map();
  private metrics: PerformanceMetric[] = [];
  private marks: Map<string, number> = new Map();
  private observers: PerformanceObserver[] = [];
  private isEnabled: boolean = true;

  constructor() {
    this.initializeObservers();
  }

  /**
   * Initialize performance observers
   */
  private initializeObservers(): void {
    if (typeof PerformanceObserver === 'undefined') return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: entry.name,
            value: entry.duration || entry.startTime,
            unit: 'ms',
            timestamp: Date.now(),
            tags: {
              entryType: entry.entryType,
            },
          });
        }
      });

      observer.observe({ entryTypes: PERFORMANCE_CONFIG.observer.entryTypes });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Performance observer not supported:', error);
    }
  }

  /**
   * Start performance measurement
   */
  start(name: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const startTime = performance.now();
    this.marks.set(name, startTime);

    // Mark in browser performance timeline
    if (typeof performance.mark === 'function') {
      performance.mark(`${name}-start`);
    }
  }

  /**
   * End performance measurement
   */
  end(name: string, metadata?: Record<string, any>): PerformanceMeasurement | null {
    if (!this.isEnabled) return null;

    const endTime = performance.now();
    const startTime = this.marks.get(name);

    if (startTime === undefined) {
      console.warn(`Performance measurement '${name}' was not started`);
      return null;
    }

    const duration = endTime - startTime;
    const measurement: PerformanceMeasurement = {
      name,
      duration,
      startTime,
      endTime,
      metadata,
    };

    // Store measurement
    if (!this.measurements.has(name)) {
      this.measurements.set(name, []);
    }
    this.measurements.get(name)!.push(measurement);

    // Mark in browser performance timeline
    if (typeof performance.mark === 'function' && typeof performance.measure === 'function') {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
    }

    // Clean up
    this.marks.delete(name);

    // Log slow operations
    if (duration > PERFORMANCE_CONFIG.thresholds.warning) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
    }

    return measurement;
  }

  /**
   * Measure function execution time
   */
  async measure<T>(
    name: string,
    fn: () => T | Promise<T>,
    metadata?: Record<string, any>
  ): Promise<{ result: T; measurement: PerformanceMeasurement }> {
    this.start(name, metadata);
    
    try {
      const result = await fn();
      const measurement = this.end(name, metadata)!;
      return { result, measurement };
    } catch (error) {
      this.end(name, { ...metadata, error: true });
      throw error;
    }
  }

  /**
   * Record a custom metric
   */
  recordMetric(metric: PerformanceMetric): void {
    if (!this.isEnabled) return;

    this.metrics.push(metric);

    // Keep buffer size under control
    if (this.metrics.length > PERFORMANCE_CONFIG.buffers.metrics) {
      this.metrics.splice(0, this.metrics.length - PERFORMANCE_CONFIG.buffers.metrics);
    }
  }

  /**
   * Get measurements for a specific operation
   */
  getMeasurements(name: string): PerformanceMeasurement[] {
    return this.measurements.get(name) || [];
  }

  /**
   * Get all measurements
   */
  getAllMeasurements(): Map<string, PerformanceMeasurement[]> {
    return new Map(this.measurements);
  }

  /**
   * Get metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get statistics for measurements
   */
  getStatistics(name: string): {
    count: number;
    min: number;
    max: number;
    avg: number;
    median: number;
    p95: number;
    p99: number;
  } | null {
    const measurements = this.getMeasurements(name);
    if (measurements.length === 0) return null;

    const durations = measurements.map(m => m.duration).sort((a, b) => a - b);
    const count = durations.length;

    return {
      count,
      min: durations[0],
      max: durations[count - 1],
      avg: durations.reduce((sum, d) => sum + d, 0) / count,
      median: durations[Math.floor(count / 2)],
      p95: durations[Math.floor(count * 0.95)],
      p99: durations[Math.floor(count * 0.99)],
    };
  }

  /**
   * Clear all measurements
   */
  clear(): void {
    this.measurements.clear();
    this.metrics.length = 0;
    this.marks.clear();
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Cleanup observers
   */
  dispose(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.length = 0;
    this.clear();
  }
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * Performance decorator for methods
 */
export function performanceDecorator(name?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const methodName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      const { result } = await performanceMonitor.measure(
        methodName,
        () => originalMethod.apply(this, args),
        { className: target.constructor.name, method: propertyKey }
      );
      return result;
    };

    return descriptor;
  };
}

/**
 * Measure React component render time
 */
export function measureComponentRender(componentName: string) {
  return function <T extends React.ComponentType<any>>(Component: T): T {
    const MeasuredComponent = React.forwardRef((props: any, ref: any) => {
      const startTime = React.useRef<number>();
      
      startTime.current = performance.now();
      
      React.useLayoutEffect(() => {
        if (startTime.current) {
          const duration = performance.now() - startTime.current;
          performanceMonitor.recordMetric({
            name: `component.render.${componentName}`,
            value: duration,
            unit: 'ms',
            timestamp: Date.now(),
            tags: { type: 'render' },
          });
        }
      });

      return React.createElement(Component, { ...props, ref });
    });

    MeasuredComponent.displayName = `Measured(${componentName})`;
    return MeasuredComponent as T;
  };
}

/**
 * Memory usage utilities
 */
export const memoryUtils = {
  /**
   * Get current memory usage (if available)
   */
  getUsage(): {
    used?: number;
    total?: number;
    limit?: number;
  } {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      };
    }
    return {};
  },

  /**
   * Force garbage collection (if available)
   */
  forceGC(): void {
    if (typeof window !== 'undefined' && 'gc' in window) {
      (window as any).gc();
    }
  },

  /**
   * Monitor memory usage over time
   */
  monitor(interval: number = 5000): () => void {
    const intervalId = setInterval(() => {
      const usage = this.getUsage();
      if (usage.used) {
        performanceMonitor.recordMetric({
          name: 'memory.usage',
          value: usage.used,
          unit: 'bytes',
          timestamp: Date.now(),
          tags: { type: 'heap' },
        });
      }
    }, interval);

    return () => clearInterval(intervalId);
  },
};

/**
 * FPS (Frames Per Second) monitor
 */
export class FPSMonitor {
  private isRunning: boolean = false;
  private frameCount: number = 0;
  private lastTime: number = 0;
  private fps: number = 0;
  private callback?: (fps: number) => void;

  start(callback?: (fps: number) => void): void {
    this.isRunning = true;
    this.callback = callback;
    this.lastTime = performance.now();
    this.loop();
  }

  stop(): void {
    this.isRunning = false;
  }

  getFPS(): number {
    return this.fps;
  }

  private loop(): void {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    this.frameCount++;

    if (currentTime - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;

      if (this.callback) {
        this.callback(this.fps);
      }

      performanceMonitor.recordMetric({
        name: 'fps',
        value: this.fps,
        unit: 'fps',
        timestamp: Date.now(),
        tags: { type: 'rendering' },
      });
    }

    requestAnimationFrame(() => this.loop());
  }
}

/**
 * Network performance utilities
 */
export const networkUtils = {
  /**
   * Measure network request performance
   */
  async measureRequest(url: string, options?: RequestInit): Promise<{
    response: Response;
    timing: {
      dns: number;
      connect: number;
      request: number;
      response: number;
      total: number;
    };
  }> {
    const startTime = performance.now();
    
    try {
      const response = await fetch(url, options);
      const endTime = performance.now();
      
      // Get navigation timing if available
      let timing = {
        dns: 0,
        connect: 0,
        request: 0,
        response: 0,
        total: endTime - startTime,
      };

      if (typeof PerformanceObserver !== 'undefined') {
        const entries = performance.getEntriesByType('resource')
          .filter(entry => entry.name === url);
        
        if (entries.length > 0) {
          const entry = entries[entries.length - 1] as PerformanceResourceTiming;
          timing = {
            dns: entry.domainLookupEnd - entry.domainLookupStart,
            connect: entry.connectEnd - entry.connectStart,
            request: entry.responseStart - entry.requestStart,
            response: entry.responseEnd - entry.responseStart,
            total: entry.responseEnd - entry.requestStart,
          };
        }
      }

      return { response, timing };
    } catch (error) {
      const endTime = performance.now();
      throw error;
    }
  },

  /**
   * Get connection information
   */
  getConnectionInfo(): {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  } {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      };
    }
    return {};
  },
};

/**
 * Bundle size analysis utilities
 */
export const bundleUtils = {
  /**
   * Analyze module sizes (webpack specific)
   */
  analyzeModules(): { name: string; size: number }[] {
    if (typeof __webpack_require__ === 'undefined') return [];

    const modules: { name: string; size: number }[] = [];
    
    try {
      // This is a simplified analysis - real implementation would need webpack stats
      const moduleIds = Object.keys(__webpack_require__.cache || {});
      
      moduleIds.forEach(id => {
        const module = __webpack_require__.cache[id];
        if (module && module.exports) {
          modules.push({
            name: id,
            size: JSON.stringify(module.exports).length,
          });
        }
      });
    } catch (error) {
      console.warn('Bundle analysis failed:', error);
    }

    return modules.sort((a, b) => b.size - a.size);
  },

  /**
   * Get estimated bundle size
   */
  getEstimatedSize(): number {
    try {
      // Rough estimation based on window object size
      return new Blob([JSON.stringify(window)]).size;
    } catch (error) {
      return 0;
    }
  },
};

/**
 * Performance audit utilities
 */
export const auditUtils = {
  /**
   * Run basic performance audit
   */
  audit(): {
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check for console.log statements
    if (typeof console.log.toString().includes('native code')) {
      issues.push('Console logging detected in production');
      recommendations.push('Remove console.log statements for better performance');
      score -= 10;
    }

    // Check memory usage
    const memory = memoryUtils.getUsage();
    if (memory.used && memory.limit && memory.used / memory.limit > 0.8) {
      issues.push('High memory usage detected');
      recommendations.push('Optimize memory usage and check for memory leaks');
      score -= 15;
    }

    // Check for slow measurements
    const slowOperations = performanceMonitor.getAllMeasurements();
    let slowCount = 0;
    
    slowOperations.forEach((measurements) => {
      measurements.forEach(measurement => {
        if (measurement.duration > PERFORMANCE_CONFIG.thresholds.warning) {
          slowCount++;
        }
      });
    });

    if (slowCount > 0) {
      issues.push(`${slowCount} slow operations detected`);
      recommendations.push('Optimize slow operations or consider lazy loading');
      score -= Math.min(20, slowCount * 2);
    }

    // Check connection quality
    const connection = networkUtils.getConnectionInfo();
    if (connection.effectiveType && ['slow-2g', '2g'].includes(connection.effectiveType)) {
      issues.push('Slow network connection detected');
      recommendations.push('Optimize for slow connections with compression and caching');
      score -= 5;
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations,
    };
  },
};

/**
 * Performance reporting utilities
 */
export const reportUtils = {
  /**
   * Generate performance report
   */
  generateReport(): {
    summary: {
      totalMeasurements: number;
      avgDuration: number;
      slowOperations: number;
    };
    measurements: Record<string, any>;
    metrics: PerformanceMetric[];
    audit: ReturnType<typeof auditUtils.audit>;
  } {
    const allMeasurements = performanceMonitor.getAllMeasurements();
    let totalDuration = 0;
    let totalCount = 0;
    let slowCount = 0;

    allMeasurements.forEach((measurements) => {
      measurements.forEach(measurement => {
        totalDuration += measurement.duration;
        totalCount++;
        if (measurement.duration > PERFORMANCE_CONFIG.thresholds.warning) {
          slowCount++;
        }
      });
    });

    const summary = {
      totalMeasurements: totalCount,
      avgDuration: totalCount > 0 ? totalDuration / totalCount : 0,
      slowOperations: slowCount,
    };

    const measurements: Record<string, any> = {};
    allMeasurements.forEach((measurementList, name) => {
      measurements[name] = performanceMonitor.getStatistics(name);
    });

    return {
      summary,
      measurements,
      metrics: performanceMonitor.getMetrics(),
      audit: auditUtils.audit(),
    };
  },

  /**
   * Export report as JSON
   */
  exportReport(): string {
    return JSON.stringify(this.generateReport(), null, 2);
  },
};

/**
 * Export all performance utilities
 */
export default {
  // Configuration
  PERFORMANCE_CONFIG,
  
  // Main monitor
  performanceMonitor,
  
  // Decorators
  performanceDecorator,
  measureComponentRender,
  
  // Utilities
  memoryUtils,
  networkUtils,
  bundleUtils,
  auditUtils,
  reportUtils,
  
  // Monitors
  FPSMonitor,
};
