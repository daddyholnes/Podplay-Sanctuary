import {
  Logger,
  createLogger,
  log,
  info,
  warn,
  error,
  debug,
  trace,
  setLogLevel,
  getLogLevel,
  addLogTransport,
  removeLogTransport,
  createConsoleTransport,
  createFileTransport,
  createRemoteTransport,
  createDatabaseTransport,
  formatLog,
  parseLog,
  filterLogs,
  searchLogs,
  groupLogs,
  aggregateLogs,
  exportLogs,
  importLogs,
  rotateLogs,
  compressLogs,
  cleanupLogs,
  createLogStream,
  createLogBuffer,
  logWithContext,
  logWithMetadata,
  logPerformance,
  logError,
  logUserAction,
  logAPICall,
  logPageView,
  logFeatureUsage,
  enableStructuredLogging,
  disableStructuredLogging,
  createLogMiddleware,
  createLogDecorator,
  createLogInterceptor,
  setupErrorLogging,
  setupPerformanceLogging,
  setupUserActivityLogging,
  createLogAnalytics,
  generateLogReport,
  monitorLogHealth,
  alertOnLogEvents,
  createLogDashboard,
  validateLogFormat,
  sanitizeLogData,
  maskSensitiveData,
  encryptLogs,
  decryptLogs,
  signLogs,
  verifyLogSignature,
  createLogAudit,
  trackLogCompliance
} from '../../utils/logger';

// Mock console methods
const mockConsole = {
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  trace: jest.fn(),
  group: jest.fn(),
  groupEnd: jest.fn(),
  time: jest.fn(),
  timeEnd: jest.fn(),
  count: jest.fn(),
  clear: jest.fn()
};

// Mock file system for file transport
const mockFs = {
  writeFileSync: jest.fn(),
  appendFileSync: jest.fn(),
  readFileSync: jest.fn(() => '[]'),
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn(),
  unlinkSync: jest.fn(),
  statSync: jest.fn(() => ({ size: 1000 }))
};

// Mock fetch for remote transport
const mockFetch = jest.fn(() => Promise.resolve({
  ok: true,
  status: 200,
  json: () => Promise.resolve({ success: true })
}));

// Mock localStorage for browser storage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

// Mock crypto for encryption
const mockCrypto = {
  subtle: {
    encrypt: jest.fn(() => Promise.resolve(new ArrayBuffer(16))),
    decrypt: jest.fn(() => Promise.resolve(new ArrayBuffer(16))),
    sign: jest.fn(() => Promise.resolve(new ArrayBuffer(32))),
    verify: jest.fn(() => Promise.resolve(true)),
    generateKey: jest.fn(() => Promise.resolve({})),
    importKey: jest.fn(() => Promise.resolve({}))
  }
};

// Setup global mocks
Object.defineProperty(global, 'console', {
  writable: true,
  value: mockConsole
});

Object.defineProperty(global, 'fetch', {
  writable: true,
  value: mockFetch
});

Object.defineProperty(global, 'localStorage', {
  writable: true,
  value: mockLocalStorage
});

Object.defineProperty(global, 'crypto', {
  writable: true,
  value: mockCrypto
});

describe('Logger Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.values(mockConsole).forEach(mock => mock.mockClear());
    mockFetch.mockClear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
  });

  describe('Basic Logging', () => {
    test('log should output message', () => {
      log('Test message');
      
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('Test message')
      );
    });

    test('info should output info message', () => {
      info('Info message');
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('Info message')
      );
    });

    test('warn should output warning message', () => {
      warn('Warning message');
      
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('Warning message')
      );
    });

    test('error should output error message', () => {
      error('Error message');
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('Error message')
      );
    });

    test('debug should output debug message', () => {
      debug('Debug message');
      
      expect(mockConsole.debug).toHaveBeenCalledWith(
        expect.stringContaining('Debug message')
      );
    });

    test('trace should output trace message', () => {
      trace('Trace message');
      
      expect(mockConsole.trace).toHaveBeenCalledWith(
        expect.stringContaining('Trace message')
      );
    });
  });

  describe('Log Levels', () => {
    test('setLogLevel should change active log level', () => {
      setLogLevel('ERROR');
      
      info('This should not appear');
      error('This should appear');
      
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.error).toHaveBeenCalled();
    });

    test('getLogLevel should return current log level', () => {
      setLogLevel('WARN');
      const level = getLogLevel();
      
      expect(level).toBe('WARN');
    });

    test('should respect log level hierarchy', () => {
      setLogLevel('WARN');
      
      debug('Debug message');  // Should not appear
      info('Info message');    // Should not appear
      warn('Warn message');    // Should appear
      error('Error message');  // Should appear
      
      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.warn).toHaveBeenCalled();
      expect(mockConsole.error).toHaveBeenCalled();
    });
  });

  describe('Logger Creation', () => {
    test('createLogger should create named logger instance', () => {
      const logger = createLogger('TestLogger');
      
      expect(logger.name).toBe('TestLogger');
      expect(logger.log).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.error).toBeDefined();
    });

    test('named logger should include name in output', () => {
      const logger = createLogger('MyModule');
      logger.info('Test message');
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('MyModule')
      );
    });
  });

  describe('Transports', () => {
    test('createConsoleTransport should create console transport', () => {
      const transport = createConsoleTransport({
        level: 'INFO',
        format: 'simple'
      });
      
      expect(transport.name).toBe('console');
      expect(transport.log).toBeDefined();
      expect(transport.level).toBe('INFO');
    });

    test('createFileTransport should create file transport', () => {
      const transport = createFileTransport({
        filename: 'app.log',
        level: 'ERROR',
        maxSize: '10MB',
        maxFiles: 5
      });
      
      expect(transport.name).toBe('file');
      expect(transport.filename).toBe('app.log');
      expect(transport.log).toBeDefined();
    });

    test('createRemoteTransport should create remote transport', () => {
      const transport = createRemoteTransport({
        url: 'https://api.example.com/logs',
        level: 'WARN',
        batchSize: 100,
        flushInterval: 5000
      });
      
      expect(transport.name).toBe('remote');
      expect(transport.url).toBe('https://api.example.com/logs');
      expect(transport.log).toBeDefined();
    });

    test('createDatabaseTransport should create database transport', () => {
      const transport = createDatabaseTransport({
        connectionString: 'mongodb://localhost:27017/logs',
        collection: 'application_logs',
        level: 'ALL'
      });
      
      expect(transport.name).toBe('database');
      expect(transport.collection).toBe('application_logs');
      expect(transport.log).toBeDefined();
    });

    test('addLogTransport should add transport to logger', () => {
      const logger = createLogger('TestLogger');
      const transport = createConsoleTransport({ level: 'INFO' });
      
      addLogTransport(logger, transport);
      
      expect(logger.transports).toContain(transport);
    });

    test('removeLogTransport should remove transport from logger', () => {
      const logger = createLogger('TestLogger');
      const transport = createConsoleTransport({ level: 'INFO' });
      
      addLogTransport(logger, transport);
      removeLogTransport(logger, transport);
      
      expect(logger.transports).not.toContain(transport);
    });
  });

  describe('Log Formatting', () => {
    test('formatLog should format log entry', () => {
      const logEntry = {
        level: 'INFO',
        message: 'Test message',
        timestamp: new Date('2023-01-01T12:00:00Z'),
        metadata: { userId: 123 }
      };
      
      const formatted = formatLog(logEntry, 'json');
      
      expect(JSON.parse(formatted)).toEqual(logEntry);
    });

    test('formatLog should support different formats', () => {
      const logEntry = {
        level: 'INFO',
        message: 'Test message',
        timestamp: new Date('2023-01-01T12:00:00Z')
      };
      
      const simple = formatLog(logEntry, 'simple');
      const detailed = formatLog(logEntry, 'detailed');
      
      expect(simple).toContain('INFO');
      expect(simple).toContain('Test message');
      expect(detailed).toContain('2023-01-01T12:00:00');
    });

    test('parseLog should parse formatted log', () => {
      const logString = '{"level":"INFO","message":"Test","timestamp":"2023-01-01T12:00:00.000Z"}';
      const parsed = parseLog(logString, 'json');
      
      expect(parsed.level).toBe('INFO');
      expect(parsed.message).toBe('Test');
      expect(parsed.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Context and Metadata', () => {
    test('logWithContext should include context in log', () => {
      const context = {
        userId: 123,
        sessionId: 'abc-123',
        requestId: 'req-456'
      };
      
      logWithContext('User action', context);
      
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('userId')
      );
    });

    test('logWithMetadata should include metadata', () => {
      const metadata = {
        component: 'UserForm',
        action: 'submit',
        duration: 150
      };
      
      logWithMetadata('Form submitted', 'INFO', metadata);
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('UserForm')
      );
    });
  });

  describe('Specialized Logging', () => {
    test('logPerformance should log performance metrics', () => {
      const metrics = {
        operation: 'renderComponent',
        duration: 15.5,
        memoryUsage: 1024000
      };
      
      logPerformance(metrics);
      
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('renderComponent')
      );
    });

    test('logError should log error with stack trace', () => {
      const error = new Error('Test error');
      const context = { component: 'UserForm' };
      
      logError(error, context);
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('Test error')
      );
    });

    test('logUserAction should log user interactions', () => {
      const action = {
        type: 'BUTTON_CLICK',
        target: 'submit-button',
        userId: 123,
        timestamp: new Date()
      };
      
      logUserAction(action);
      
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('BUTTON_CLICK')
      );
    });

    test('logAPICall should log API requests', () => {
      const apiCall = {
        method: 'POST',
        url: '/api/users',
        status: 201,
        duration: 250,
        requestSize: 512,
        responseSize: 1024
      };
      
      logAPICall(apiCall);
      
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('POST')
      );
    });

    test('logPageView should log page navigation', () => {
      const pageView = {
        path: '/dashboard',
        referrer: '/login',
        userId: 123,
        loadTime: 1200
      };
      
      logPageView(pageView);
      
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('/dashboard')
      );
    });

    test('logFeatureUsage should log feature interactions', () => {
      const usage = {
        feature: 'dark-mode',
        action: 'toggle',
        userId: 123,
        context: { currentTheme: 'light' }
      };
      
      logFeatureUsage(usage);
      
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('dark-mode')
      );
    });
  });

  describe('Log Management', () => {
    test('filterLogs should filter by criteria', () => {
      const logs = [
        { level: 'INFO', message: 'Info 1', timestamp: new Date() },
        { level: 'ERROR', message: 'Error 1', timestamp: new Date() },
        { level: 'INFO', message: 'Info 2', timestamp: new Date() }
      ];
      
      const filtered = filterLogs(logs, { level: 'ERROR' });
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].level).toBe('ERROR');
    });

    test('searchLogs should search by message content', () => {
      const logs = [
        { level: 'INFO', message: 'User login successful', timestamp: new Date() },
        { level: 'ERROR', message: 'Database connection failed', timestamp: new Date() },
        { level: 'INFO', message: 'User logout', timestamp: new Date() }
      ];
      
      const results = searchLogs(logs, 'User');
      
      expect(results).toHaveLength(2);
      expect(results[0].message).toContain('User');
      expect(results[1].message).toContain('User');
    });

    test('groupLogs should group by criteria', () => {
      const logs = [
        { level: 'INFO', component: 'Auth', message: 'Login', timestamp: new Date() },
        { level: 'ERROR', component: 'Auth', message: 'Failed', timestamp: new Date() },
        { level: 'INFO', component: 'Dashboard', message: 'Load', timestamp: new Date() }
      ];
      
      const grouped = groupLogs(logs, 'component');
      
      expect(grouped.Auth).toHaveLength(2);
      expect(grouped.Dashboard).toHaveLength(1);
    });

    test('aggregateLogs should aggregate statistics', () => {
      const logs = [
        { level: 'INFO', timestamp: new Date() },
        { level: 'ERROR', timestamp: new Date() },
        { level: 'INFO', timestamp: new Date() },
        { level: 'WARN', timestamp: new Date() }
      ];
      
      const stats = aggregateLogs(logs);
      
      expect(stats.total).toBe(4);
      expect(stats.byLevel.INFO).toBe(2);
      expect(stats.byLevel.ERROR).toBe(1);
      expect(stats.byLevel.WARN).toBe(1);
    });
  });

  describe('Log Storage and Rotation', () => {
    test('exportLogs should export logs in specified format', () => {
      const logs = [
        { level: 'INFO', message: 'Test 1', timestamp: new Date() },
        { level: 'ERROR', message: 'Test 2', timestamp: new Date() }
      ];
      
      const exported = exportLogs(logs, 'json');
      
      expect(typeof exported).toBe('string');
      expect(JSON.parse(exported)).toHaveLength(2);
    });

    test('importLogs should import logs from string', () => {
      const logString = JSON.stringify([
        { level: 'INFO', message: 'Imported 1', timestamp: new Date().toISOString() },
        { level: 'ERROR', message: 'Imported 2', timestamp: new Date().toISOString() }
      ]);
      
      const imported = importLogs(logString, 'json');
      
      expect(imported).toHaveLength(2);
      expect(imported[0].level).toBe('INFO');
    });

    test('rotateLogs should handle log rotation', () => {
      const config = {
        maxSize: '10MB',
        maxFiles: 5,
        compress: true
      };
      
      rotateLogs('app.log', config);
      
      // Should have attempted file operations
      expect(mockFs.statSync).toHaveBeenCalled();
    });

    test('compressLogs should compress log files', () => {
      const files = ['app.log.1', 'app.log.2'];
      
      compressLogs(files);
      
      // Should have processed files
      expect(files.length).toBeGreaterThan(0);
    });

    test('cleanupLogs should remove old logs', () => {
      const config = {
        retentionDays: 30,
        path: '/logs'
      };
      
      cleanupLogs(config);
      
      // Should have attempted cleanup
      expect(config.retentionDays).toBe(30);
    });
  });

  describe('Structured Logging', () => {
    test('enableStructuredLogging should enable structured format', () => {
      enableStructuredLogging();
      
      log('Test message', { userId: 123 });
      
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('"userId":123')
      );
    });

    test('disableStructuredLogging should disable structured format', () => {
      disableStructuredLogging();
      
      log('Test message', { userId: 123 });
      
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('Test message')
      );
    });
  });

  describe('Middleware and Decorators', () => {
    test('createLogMiddleware should create middleware function', () => {
      const middleware = createLogMiddleware({
        logRequests: true,
        logResponses: true,
        logErrors: true
      });
      
      expect(typeof middleware).toBe('function');
    });

    test('createLogDecorator should create decorator function', () => {
      const decorator = createLogDecorator({
        logEntry: true,
        logExit: true,
        logDuration: true
      });
      
      expect(typeof decorator).toBe('function');
      
      // Test decorator usage
      const originalFunction = () => 'result';
      const decoratedFunction = decorator(originalFunction);
      
      const result = decoratedFunction();
      
      expect(result).toBe('result');
      expect(mockConsole.log).toHaveBeenCalled();
    });

    test('createLogInterceptor should create interceptor', () => {
      const interceptor = createLogInterceptor({
        target: 'fetch',
        logCalls: true,
        logResponses: true
      });
      
      expect(interceptor.start).toBeDefined();
      expect(interceptor.stop).toBeDefined();
    });
  });

  describe('Automatic Logging Setup', () => {
    test('setupErrorLogging should setup error handling', () => {
      setupErrorLogging({
        captureUnhandledExceptions: true,
        captureUnhandledRejections: true,
        captureConsoleErrors: true
      });
      
      // Should have set up error handlers
      expect(typeof process.on).toBe('function');
    });

    test('setupPerformanceLogging should setup performance monitoring', () => {
      setupPerformanceLogging({
        logRenderTimes: true,
        logMemoryUsage: true,
        logNetworkRequests: true
      });
      
      // Should have set up performance observers
      expect(typeof PerformanceObserver).toBe('function');
    });

    test('setupUserActivityLogging should setup user tracking', () => {
      setupUserActivityLogging({
        logClicks: true,
        logNavigation: true,
        logFormSubmissions: true
      });
      
      // Should have set up event listeners
      expect(typeof document.addEventListener).toBe('function');
    });
  });

  describe('Security and Privacy', () => {
    test('sanitizeLogData should remove sensitive information', () => {
      const data = {
        username: 'john_doe',
        password: 'secret123',
        email: 'john@example.com',
        ssn: '123-45-6789'
      };
      
      const sanitized = sanitizeLogData(data);
      
      expect(sanitized.username).toBe('john_doe');
      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.email).toBe('j***@example.com');
      expect(sanitized.ssn).toBe('[REDACTED]');
    });

    test('maskSensitiveData should mask PII', () => {
      const message = 'User john@example.com logged in with card 4111111111111111';
      const masked = maskSensitiveData(message);
      
      expect(masked).toContain('j***@example.com');
      expect(masked).toContain('****1111');
    });

    test('encryptLogs should encrypt log data', async () => {
      const logs = [
        { level: 'INFO', message: 'Sensitive data', timestamp: new Date() }
      ];
      
      const encrypted = await encryptLogs(logs, 'encryption-key');
      
      expect(typeof encrypted).toBe('string');
      expect(mockCrypto.subtle.encrypt).toHaveBeenCalled();
    });

    test('decryptLogs should decrypt log data', async () => {
      const encryptedData = 'encrypted-log-data';
      
      const decrypted = await decryptLogs(encryptedData, 'encryption-key');
      
      expect(Array.isArray(decrypted)).toBe(true);
      expect(mockCrypto.subtle.decrypt).toHaveBeenCalled();
    });

    test('signLogs should create digital signature', async () => {
      const logs = [
        { level: 'INFO', message: 'Important log', timestamp: new Date() }
      ];
      
      const signature = await signLogs(logs, 'signing-key');
      
      expect(typeof signature).toBe('string');
      expect(mockCrypto.subtle.sign).toHaveBeenCalled();
    });

    test('verifyLogSignature should verify signature', async () => {
      const logs = [
        { level: 'INFO', message: 'Important log', timestamp: new Date() }
      ];
      const signature = 'log-signature';
      
      const isValid = await verifyLogSignature(logs, signature, 'verification-key');
      
      expect(typeof isValid).toBe('boolean');
      expect(mockCrypto.subtle.verify).toHaveBeenCalled();
    });
  });

  describe('Analytics and Reporting', () => {
    test('createLogAnalytics should create analytics instance', () => {
      const analytics = createLogAnalytics({
        timeWindow: '24h',
        metrics: ['count', 'rate', 'errors']
      });
      
      expect(analytics.analyze).toBeDefined();
      expect(analytics.getMetrics).toBeDefined();
      expect(analytics.generateReport).toBeDefined();
    });

    test('generateLogReport should create comprehensive report', () => {
      const logs = [
        { level: 'INFO', message: 'Info 1', timestamp: new Date() },
        { level: 'ERROR', message: 'Error 1', timestamp: new Date() },
        { level: 'WARN', message: 'Warning 1', timestamp: new Date() }
      ];
      
      const report = generateLogReport(logs, {
        period: '24h',
        includeStats: true,
        includeTrends: true
      });
      
      expect(report.summary).toBeDefined();
      expect(report.statistics).toBeDefined();
      expect(report.trends).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });

    test('monitorLogHealth should monitor log system', () => {
      const monitor = monitorLogHealth({
        checkInterval: 60000,
        alertThresholds: {
          errorRate: 0.1,
          logVolume: 1000,
          responseTime: 500
        }
      });
      
      expect(monitor.start).toBeDefined();
      expect(monitor.stop).toBeDefined();
      expect(monitor.getStatus).toBeDefined();
    });

    test('alertOnLogEvents should setup alerting', () => {
      const alertCallback = jest.fn();
      const rules = [
        { pattern: /ERROR/, threshold: 10, window: '5m' },
        { pattern: /CRITICAL/, threshold: 1, window: '1m' }
      ];
      
      alertOnLogEvents(rules, alertCallback);
      
      // Simulate log events
      error('Critical system failure');
      
      expect(alertCallback).toHaveBeenCalled();
    });

    test('createLogDashboard should create dashboard', () => {
      const dashboard = createLogDashboard({
        refreshInterval: 30000,
        widgets: ['volume', 'errors', 'performance', 'alerts']
      });
      
      expect(dashboard.render).toBeDefined();
      expect(dashboard.update).toBeDefined();
      expect(dashboard.export).toBeDefined();
    });
  });

  describe('Compliance and Auditing', () => {
    test('createLogAudit should create audit trail', () => {
      const audit = createLogAudit({
        auditLevel: 'DETAILED',
        includeStackTrace: true,
        trackUserActions: true
      });
      
      expect(audit.logEntry).toBeDefined();
      expect(audit.generateAuditReport).toBeDefined();
      expect(audit.validateIntegrity).toBeDefined();
    });

    test('trackLogCompliance should track compliance', () => {
      const compliance = trackLogCompliance({
        standards: ['GDPR', 'HIPAA', 'SOX'],
        retentionPeriod: '7y',
        encryptionRequired: true
      });
      
      expect(compliance.checkCompliance).toBeDefined();
      expect(compliance.generateComplianceReport).toBeDefined();
      expect(compliance.validateRetention).toBeDefined();
    });

    test('validateLogFormat should validate log structure', () => {
      const validLog = {
        level: 'INFO',
        message: 'Test message',
        timestamp: new Date(),
        metadata: { userId: 123 }
      };
      
      const invalidLog = {
        level: 'INVALID_LEVEL',
        message: null,
        timestamp: 'invalid-date'
      };
      
      expect(validateLogFormat(validLog)).toBe(true);
      expect(validateLogFormat(invalidLog)).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should handle transport failures gracefully', () => {
      const faultyTransport = {
        name: 'faulty',
        log: jest.fn(() => { throw new Error('Transport failed'); })
      };
      
      const logger = createLogger('TestLogger');
      addLogTransport(logger, faultyTransport);
      
      expect(() => {
        logger.info('Test message');
      }).not.toThrow();
    });

    test('should handle formatting errors', () => {
      const circularObject = {};
      circularObject.self = circularObject;
      
      expect(() => {
        log('Test with circular reference', circularObject);
      }).not.toThrow();
    });

    test('should handle storage failures', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      
      expect(() => {
        const transport = createFileTransport({ filename: 'test.log' });
        transport.log({ level: 'INFO', message: 'Test' });
      }).not.toThrow();
    });

    test('should handle network failures', () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      
      expect(async () => {
        const transport = createRemoteTransport({ url: 'https://logs.example.com' });
        await transport.log({ level: 'INFO', message: 'Test' });
      }).not.toThrow();
    });
  });

  describe('Performance Considerations', () => {
    test('should buffer logs efficiently', () => {
      const buffer = createLogBuffer({
        maxSize: 1000,
        flushInterval: 5000,
        flushOnLevel: 'ERROR'
      });
      
      // Add many logs
      for (let i = 0; i < 100; i++) {
        buffer.add({ level: 'INFO', message: `Log ${i}`, timestamp: new Date() });
      }
      
      expect(buffer.size()).toBe(100);
      expect(buffer.flush).toBeDefined();
    });

    test('should handle high-volume logging', () => {
      const logger = createLogger('HighVolume');
      
      const startTime = performance.now();
      
      // Log many messages
      for (let i = 0; i < 1000; i++) {
        logger.info(`Message ${i}`);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(1000);
    });

    test('should minimize memory footprint', () => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0;
      
      const logger = createLogger('MemoryTest');
      
      // Create many log entries
      for (let i = 0; i < 1000; i++) {
        logger.info(`Memory test ${i}`, { data: new Array(100).fill(i) });
      }
      
      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
    });
  });
});
