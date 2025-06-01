/**
 * Formatters Utility Tests
 * 
 * Comprehensive tests for all data formatting utilities including
 * file sizes, numbers, currency, dates, and text formatting functions.
 */

import {
  formatFileSize,
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatDuration,
  formatRelativeTime,
  formatDate,
  formatDateTime,
  formatBytes,
  formatCompactNumber,
  formatPhoneNumber,
  formatURL,
  formatJSON,
  truncateText,
  capitalizeText,
  camelCaseToTitle,
  slugify,
  formatCodeBlock,
  formatSearchHighlight,
  formatters
} from '../../utils/formatters';

describe('formatFileSize', () => {
  test('formats zero bytes correctly', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
  });

  test('formats bytes correctly', () => {
    expect(formatFileSize(512)).toBe('512 Bytes');
    expect(formatFileSize(1023)).toBe('1023 Bytes');
  });

  test('formats kilobytes correctly', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(102400)).toBe('100 KB');
  });

  test('formats megabytes correctly', () => {
    expect(formatFileSize(1048576)).toBe('1 MB');
    expect(formatFileSize(5242880)).toBe('5 MB');
    expect(formatFileSize(1572864)).toBe('1.5 MB');
  });

  test('formats gigabytes correctly', () => {
    expect(formatFileSize(1073741824)).toBe('1 GB');
    expect(formatFileSize(5368709120)).toBe('5 GB');
    expect(formatFileSize(1610612736)).toBe('1.5 GB');
  });

  test('formats terabytes correctly', () => {
    expect(formatFileSize(1099511627776)).toBe('1 TB');
    expect(formatFileSize(5497558138880)).toBe('5 TB');
  });

  test('handles decimal precision correctly', () => {
    expect(formatFileSize(1536, 1)).toBe('1.5 KB');
    expect(formatFileSize(1536, 0)).toBe('2 KB');
    expect(formatFileSize(1536, 3)).toBe('1.500 KB');
  });

  test('handles negative values', () => {
    expect(formatFileSize(-1024)).toBe('-1 KB');
  });

  test('handles very large numbers', () => {
    expect(formatFileSize(Number.MAX_SAFE_INTEGER)).toContain('PB');
  });
});

describe('formatNumber', () => {
  test('formats basic numbers', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(1000000)).toBe('1,000,000');
    expect(formatNumber(1234567.89)).toBe('1,234,567.89');
  });

  test('formats with custom options', () => {
    expect(formatNumber(1234.567, { minimumFractionDigits: 2 })).toBe('1,234.57');
    expect(formatNumber(1234, { minimumFractionDigits: 2 })).toBe('1,234.00');
  });

  test('formats with maximum fraction digits', () => {
    expect(formatNumber(1234.56789, { maximumFractionDigits: 2 })).toBe('1,234.57');
  });

  test('formats negative numbers', () => {
    expect(formatNumber(-1234.56)).toBe('-1,234.56');
  });

  test('formats zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  test('formats decimal numbers', () => {
    expect(formatNumber(0.123)).toBe('0.123');
    expect(formatNumber(0.001)).toBe('0.001');
  });
});

describe('formatCurrency', () => {
  test('formats USD currency', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(-50.25)).toBe('-$50.25');
  });

  test('formats different currencies', () => {
    expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56');
    expect(formatCurrency(1234.56, 'GBP')).toBe('£1,234.56');
    expect(formatCurrency(1234.56, 'JPY')).toBe('¥1,235');
  });

  test('handles locale-specific formatting', () => {
    expect(formatCurrency(1234.56, 'USD', 'en-US')).toBe('$1,234.56');
    expect(formatCurrency(1234.56, 'EUR', 'de-DE')).toBe('1.234,56 €');
  });

  test('handles large amounts', () => {
    expect(formatCurrency(1000000000)).toBe('$1,000,000,000.00');
  });
});

describe('formatPercentage', () => {
  test('formats basic percentages', () => {
    expect(formatPercentage(0.5)).toBe('50.0%');
    expect(formatPercentage(0.123)).toBe('12.3%');
    expect(formatPercentage(1.5)).toBe('150.0%');
  });

  test('formats with custom decimal places', () => {
    expect(formatPercentage(0.12345, 0)).toBe('12%');
    expect(formatPercentage(0.12345, 2)).toBe('12.35%');
    expect(formatPercentage(0.12345, 3)).toBe('12.345%');
  });

  test('handles edge cases', () => {
    expect(formatPercentage(0)).toBe('0.0%');
    expect(formatPercentage(-0.25)).toBe('-25.0%');
  });
});

describe('formatDuration', () => {
  test('formats seconds', () => {
    expect(formatDuration(5000)).toBe('5s');
    expect(formatDuration(30000)).toBe('30s');
    expect(formatDuration(59000)).toBe('59s');
  });

  test('formats minutes', () => {
    expect(formatDuration(60000)).toBe('1m 0s');
    expect(formatDuration(90000)).toBe('1m 30s');
    expect(formatDuration(3540000)).toBe('59m 0s');
  });

  test('formats hours', () => {
    expect(formatDuration(3600000)).toBe('1h 0m');
    expect(formatDuration(5400000)).toBe('1h 30m');
    expect(formatDuration(86340000)).toBe('23h 59m');
  });

  test('formats days', () => {
    expect(formatDuration(86400000)).toBe('1d 0h');
    expect(formatDuration(90000000)).toBe('1d 1h');
    expect(formatDuration(172800000)).toBe('2d 0h');
  });

  test('handles zero duration', () => {
    expect(formatDuration(0)).toBe('0s');
  });

  test('handles milliseconds less than 1 second', () => {
    expect(formatDuration(500)).toBe('0s');
    expect(formatDuration(999)).toBe('0s');
  });

  test('formats with compact option', () => {
    expect(formatDuration(90000, { compact: true })).toBe('1m30s');
    expect(formatDuration(5400000, { compact: true })).toBe('1h30m');
  });
});

describe('formatRelativeTime', () => {
  beforeEach(() => {
    // Mock current time for consistent testing
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-06-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('formats recent past times', () => {
    const fiveMinutesAgo = new Date('2023-06-15T11:55:00Z');
    expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');

    const oneHourAgo = new Date('2023-06-15T11:00:00Z');
    expect(formatRelativeTime(oneHourAgo)).toBe('1 hour ago');
  });

  test('formats today', () => {
    const thisMorning = new Date('2023-06-15T08:00:00Z');
    expect(formatRelativeTime(thisMo)).toBe('4 hours ago');
  });

  test('formats yesterday', () => {
    const yesterday = new Date('2023-06-14T12:00:00Z');
    expect(formatRelativeTime(yesterday)).toBe('1 day ago');
  });

  test('formats future times', () => {
    const tomorrow = new Date('2023-06-16T12:00:00Z');
    expect(formatRelativeTime(tomorrow)).toBe('in 1 day');

    const nextWeek = new Date('2023-06-22T12:00:00Z');
    expect(formatRelativeTime(nextWeek)).toBe('in 7 days');
  });

  test('handles string dates', () => {
    expect(formatRelativeTime('2023-06-15T11:30:00Z')).toBe('30 minutes ago');
  });

  test('handles invalid dates', () => {
    expect(formatRelativeTime('invalid-date')).toBe('Invalid date');
  });
});

describe('formatDate', () => {
  test('formats dates with default format', () => {
    const date = new Date('2023-06-15T12:00:00Z');
    expect(formatDate(date)).toBe('Jun 15, 2023');
  });

  test('formats with custom format', () => {
    const date = new Date('2023-06-15T12:00:00Z');
    expect(formatDate(date, 'yyyy-MM-dd')).toBe('2023-06-15');
    expect(formatDate(date, 'MMMM do, yyyy')).toBe('June 15th, 2023');
  });

  test('handles string dates', () => {
    expect(formatDate('2023-06-15')).toBe('Jun 15, 2023');
  });

  test('handles invalid dates', () => {
    expect(formatDate('invalid')).toBe('Invalid date');
  });
});

describe('formatDateTime', () => {
  test('formats date and time', () => {
    const date = new Date('2023-06-15T14:30:45Z');
    expect(formatDateTime(date)).toBe('Jun 15, 2023 at 2:30 PM');
  });

  test('formats with custom format', () => {
    const date = new Date('2023-06-15T14:30:45Z');
    expect(formatDateTime(date, 'yyyy-MM-dd HH:mm:ss')).toBe('2023-06-15 14:30:45');
  });

  test('handles timezone formatting', () => {
    const date = new Date('2023-06-15T14:30:45Z');
    expect(formatDateTime(date, { includeTimezone: true })).toContain('UTC');
  });
});

describe('formatCompactNumber', () => {
  test('formats thousands', () => {
    expect(formatCompactNumber(1000)).toBe('1K');
    expect(formatCompactNumber(1500)).toBe('1.5K');
    expect(formatCompactNumber(999)).toBe('999');
  });

  test('formats millions', () => {
    expect(formatCompactNumber(1000000)).toBe('1M');
    expect(formatCompactNumber(2500000)).toBe('2.5M');
  });

  test('formats billions', () => {
    expect(formatCompactNumber(1000000000)).toBe('1B');
    expect(formatCompactNumber(1500000000)).toBe('1.5B');
  });

  test('handles negative numbers', () => {
    expect(formatCompactNumber(-1500)).toBe('-1.5K');
    expect(formatCompactNumber(-2500000)).toBe('-2.5M');
  });
});

describe('formatPhoneNumber', () => {
  test('formats US phone numbers', () => {
    expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
    expect(formatPhoneNumber('11234567890')).toBe('+1 (123) 456-7890');
  });

  test('handles international formats', () => {
    expect(formatPhoneNumber('+44 20 7946 0958')).toBe('+44 20 7946 0958');
  });

  test('handles invalid numbers', () => {
    expect(formatPhoneNumber('invalid')).toBe('invalid');
    expect(formatPhoneNumber('123')).toBe('123');
  });

  test('formats with different separators', () => {
    expect(formatPhoneNumber('123-456-7890')).toBe('(123) 456-7890');
    expect(formatPhoneNumber('123.456.7890')).toBe('(123) 456-7890');
  });
});

describe('formatURL', () => {
  test('formats basic URLs', () => {
    expect(formatURL('https://example.com')).toBe('https://example.com');
    expect(formatURL('http://example.com')).toBe('http://example.com');
  });

  test('adds protocol to URLs without it', () => {
    expect(formatURL('example.com')).toBe('https://example.com');
    expect(formatURL('www.example.com')).toBe('https://www.example.com');
  });

  test('handles paths and query parameters', () => {
    expect(formatURL('example.com/path?query=value')).toBe('https://example.com/path?query=value');
  });

  test('validates URLs', () => {
    expect(formatURL('not-a-url', { validate: true })).toBe(null);
    expect(formatURL('https://example.com', { validate: true })).toBe('https://example.com');
  });
});

describe('formatJSON', () => {
  test('formats objects with default indentation', () => {
    const obj = { name: 'John', age: 30 };
    const formatted = formatJSON(obj);
    expect(formatted).toContain('{\n  "name": "John",\n  "age": 30\n}');
  });

  test('formats with custom indentation', () => {
    const obj = { name: 'John' };
    const formatted = formatJSON(obj, 4);
    expect(formatted).toContain('{\n    "name": "John"\n}');
  });

  test('handles arrays', () => {
    const arr = [1, 2, 3];
    const formatted = formatJSON(arr);
    expect(formatted).toContain('[\n  1,\n  2,\n  3\n]');
  });

  test('handles nested objects', () => {
    const obj = { user: { name: 'John', details: { age: 30 } } };
    const formatted = formatJSON(obj);
    expect(formatted).toContain('"user"');
    expect(formatted).toContain('"details"');
  });

  test('handles circular references', () => {
    const obj: any = { name: 'John' };
    obj.self = obj;
    expect(() => formatJSON(obj)).not.toThrow();
  });
});

describe('Text Formatting Functions', () => {
  describe('truncateText', () => {
    test('truncates long text', () => {
      const text = 'This is a very long text that should be truncated';
      expect(truncateText(text, 20)).toBe('This is a very lo...');
    });

    test('returns original text if shorter than limit', () => {
      const text = 'Short text';
      expect(truncateText(text, 20)).toBe('Short text');
    });

    test('handles custom suffix', () => {
      const text = 'This is a long text';
      expect(truncateText(text, 10, '…')).toBe('This is a…');
    });

    test('handles word boundaries', () => {
      const text = 'This is a very long text';
      expect(truncateText(text, 15, '...', true)).toBe('This is a...');
    });
  });

  describe('capitalizeText', () => {
    test('capitalizes first letter of each word', () => {
      expect(capitalizeText('hello world')).toBe('Hello World');
      expect(capitalizeText('the quick brown fox')).toBe('The Quick Brown Fox');
    });

    test('handles single words', () => {
      expect(capitalizeText('hello')).toBe('Hello');
      expect(capitalizeText('HELLO')).toBe('Hello');
    });

    test('handles empty string', () => {
      expect(capitalizeText('')).toBe('');
    });

    test('preserves existing capitalization', () => {
      expect(capitalizeText('iPhone')).toBe('iPhone');
    });
  });

  describe('camelCaseToTitle', () => {
    test('converts camelCase to title case', () => {
      expect(camelCaseToTitle('firstName')).toBe('First Name');
      expect(camelCaseToTitle('lastName')).toBe('Last Name');
      expect(camelCaseToTitle('phoneNumber')).toBe('Phone Number');
    });

    test('handles PascalCase', () => {
      expect(camelCaseToTitle('FirstName')).toBe('First Name');
      expect(camelCaseToTitle('XMLHttpRequest')).toBe('XML Http Request');
    });

    test('handles acronyms', () => {
      expect(camelCaseToTitle('xmlHTTPRequest')).toBe('Xml HTTP Request');
      expect(camelCaseToTitle('URLPattern')).toBe('URL Pattern');
    });
  });

  describe('slugify', () => {
    test('creates URL-friendly slugs', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('The Quick Brown Fox')).toBe('the-quick-brown-fox');
    });

    test('handles special characters', () => {
      expect(slugify('Hello, World!')).toBe('hello-world');
      expect(slugify('One & Two')).toBe('one-two');
    });

    test('handles multiple spaces', () => {
      expect(slugify('Hello    World')).toBe('hello-world');
    });

    test('handles leading/trailing spaces', () => {
      expect(slugify('  Hello World  ')).toBe('hello-world');
    });

    test('handles unicode characters', () => {
      expect(slugify('Café & Résumé')).toBe('cafe-resume');
    });
  });
});

describe('formatCodeBlock', () => {
  test('formats code with language', () => {
    const code = 'const x = 5;';
    const formatted = formatCodeBlock(code, 'javascript');
    expect(formatted).toContain('```javascript');
    expect(formatted).toContain(code);
    expect(formatted).toContain('```');
  });

  test('formats code without language', () => {
    const code = 'const x = 5;';
    const formatted = formatCodeBlock(code);
    expect(formatted).toContain('```');
    expect(formatted).toContain(code);
  });

  test('handles multi-line code', () => {
    const code = 'const x = 5;\nconst y = 10;';
    const formatted = formatCodeBlock(code, 'javascript');
    expect(formatted).toContain(code);
  });
});

describe('formatSearchHighlight', () => {
  test('highlights search terms', () => {
    const text = 'The quick brown fox';
    const result = formatSearchHighlight(text, 'quick');
    expect(result).toContain('<mark>quick</mark>');
  });

  test('handles case insensitive search', () => {
    const text = 'The Quick Brown Fox';
    const result = formatSearchHighlight(text, 'quick', { caseSensitive: false });
    expect(result).toContain('<mark>Quick</mark>');
  });

  test('highlights multiple occurrences', () => {
    const text = 'The fox and the fox';
    const result = formatSearchHighlight(text, 'fox');
    expect((result.match(/<mark>fox<\/mark>/g) || []).length).toBe(2);
  });

  test('handles regex special characters', () => {
    const text = 'Price: $19.99';
    const result = formatSearchHighlight(text, '$19.99');
    expect(result).toContain('<mark>$19.99</mark>');
  });
});

describe('formatters default export', () => {
  test('exports all formatting functions', () => {
    expect(typeof formatters.formatFileSize).toBe('function');
    expect(typeof formatters.formatNumber).toBe('function');
    expect(typeof formatters.formatCurrency).toBe('function');
    expect(typeof formatters.formatDate).toBe('function');
    expect(typeof formatters.truncateText).toBe('function');
  });

  test('provides consistent API', () => {
    const fileSize = formatters.formatFileSize(1024);
    const directCall = formatFileSize(1024);
    expect(fileSize).toBe(directCall);
  });
});

describe('Edge Cases and Error Handling', () => {
  test('handles null and undefined values', () => {
    expect(formatFileSize(null as any)).toBe('0 Bytes');
    expect(formatFileSize(undefined as any)).toBe('0 Bytes');
    expect(formatNumber(null as any)).toBe('0');
    expect(formatCurrency(undefined as any)).toBe('$0.00');
  });

  test('handles NaN values', () => {
    expect(formatFileSize(NaN)).toBe('0 Bytes');
    expect(formatNumber(NaN)).toBe('NaN');
    expect(formatPercentage(NaN)).toBe('NaN%');
  });

  test('handles Infinity values', () => {
    expect(formatFileSize(Infinity)).toContain('∞');
    expect(formatNumber(Infinity)).toBe('∞');
    expect(formatDuration(Infinity)).toBe('∞');
  });

  test('handles very small numbers', () => {
    expect(formatFileSize(0.1)).toBe('0 Bytes');
    expect(formatNumber(0.00001)).toBe('0.00001');
    expect(formatPercentage(0.00001)).toBe('0.0%');
  });

  test('handles locale-specific edge cases', () => {
    // Test with different locales if supported
    expect(() => formatCurrency(1234, 'INVALID' as any)).not.toThrow();
    expect(() => formatNumber(1234, { locale: 'invalid' } as any)).not.toThrow();
  });
});

describe('Performance Tests', () => {
  test('formats large arrays efficiently', () => {
    const start = performance.now();
    const largeArray = Array.from({ length: 10000 }, (_, i) => i * 1024);
    largeArray.forEach(size => formatFileSize(size));
    const end = performance.now();
    
    // Should complete in reasonable time (< 100ms)
    expect(end - start).toBeLessThan(100);
  });

  test('handles repeated formatting calls', () => {
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      formatCurrency(Math.random() * 10000);
      formatNumber(Math.random() * 1000000);
      formatPercentage(Math.random());
    }
    const end = performance.now();
    
    // Should complete efficiently
    expect(end - start).toBeLessThan(50);
  });

  test('memory usage stays reasonable', () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Generate and format many values
    for (let i = 0; i < 10000; i++) {
      formatFileSize(Math.random() * 1000000000);
      formatRelativeTime(new Date(Date.now() - Math.random() * 86400000));
    }
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be reasonable (< 10MB)
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });
});
