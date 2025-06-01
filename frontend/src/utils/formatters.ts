/**
 * Data Formatting Utilities
 * Provides consistent formatting for various data types throughout the application
 */

import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Number formatting with locale support
export const formatNumber = (
  value: number,
  options: Intl.NumberFormatOptions = {}
): string => {
  return new Intl.NumberFormat('en-US', options).format(value);
};

// Currency formatting
export const formatCurrency = (
  amount: number,
  currency: string = 'USD'
): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Percentage formatting
export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

// Duration formatting (milliseconds to human readable)
export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

// Relative time formatting
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) {
    return 'Invalid date';
  }

  return formatDistanceToNow(dateObj, { addSuffix: true });
};

// Absolute time formatting with customizable format
export const formatDateTime = (
  date: Date | string,
  formatString: string = 'PPp'
): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) {
    return 'Invalid date';
  }

  return format(dateObj, formatString);
};

// Text truncation with ellipsis
export const truncateText = (
  text: string,
  maxLength: number,
  ellipsis: string = '...'
): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - ellipsis.length) + ellipsis;
};

// Camel case to title case
export const camelToTitle = (camelCase: string): string => {
  return camelCase
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

// Snake case to title case
export const snakeToTitle = (snakeCase: string): string => {
  return snakeCase
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Kebab case to title case
export const kebabToTitle = (kebabCase: string): string => {
  return kebabCase
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Format phone numbers (US format)
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  return phone;
};

// Format URLs for display (remove protocol, www)
export const formatDisplayUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '') + urlObj.pathname + urlObj.search;
  } catch {
    return url;
  }
};

// Format code snippets with language highlighting info
export const formatCodeSnippet = (
  code: string,
  language?: string,
  maxLines?: number
): { code: string; language?: string; truncated: boolean } => {
  const lines = code.split('\n');
  let truncated = false;
  let formattedCode = code;

  if (maxLines && lines.length > maxLines) {
    formattedCode = lines.slice(0, maxLines).join('\n');
    truncated = true;
  }

  return {
    code: formattedCode,
    language,
    truncated,
  };
};

// Format API response data for logging
export const formatApiResponse = (
  response: any,
  maxDepth: number = 3
): string => {
  try {
    const circularReplacer = () => {
      const seen = new WeakSet();
      return (key: string, value: any) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
        }
        return value;
      };
    };

    return JSON.stringify(response, circularReplacer(), 2);
  } catch {
    return String(response);
  }
};

// Format error messages for user display
export const formatErrorMessage = (error: Error | string): string => {
  if (typeof error === 'string') return error;
  
  // Common error message cleanup
  let message = error.message || 'An unknown error occurred';
  
  // Remove stack trace info if present
  message = message.split('\n')[0];
  
  // Capitalize first letter
  message = message.charAt(0).toUpperCase() + message.slice(1);
  
  // Ensure it ends with a period
  if (!message.endsWith('.') && !message.endsWith('!') && !message.endsWith('?')) {
    message += '.';
  }
  
  return message;
};

// Format lists for natural language display
export const formatList = (
  items: string[],
  conjunction: 'and' | 'or' = 'and'
): string => {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  
  return `${items.slice(0, -1).join(', ')}, ${conjunction} ${items[items.length - 1]}`;
};

// Format memory usage
export const formatMemoryUsage = (bytes: number): string => {
  return formatFileSize(bytes);
};

// Format git commit hash for display
export const formatCommitHash = (hash: string, length: number = 7): string => {
  return hash.slice(0, length);
};

// Format branch names for display
export const formatBranchName = (branch: string): string => {
  // Remove refs/heads/ prefix if present
  return branch.replace(/^refs\/heads\//, '');
};

// Format search query for highlighting
export const formatSearchHighlight = (
  text: string,
  query: string,
  highlightClass: string = 'highlight'
): string => {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, `<span class="${highlightClass}">$1</span>`);
};

// Format file paths for display (platform agnostic)
export const formatFilePath = (path: string, maxSegments?: number): string => {
  const segments = path.split(/[/\\]/);
  
  if (maxSegments && segments.length > maxSegments) {
    const start = segments.slice(0, 1);
    const end = segments.slice(-maxSegments + 1);
    return [...start, '...', ...end].join('/');
  }
  
  return path.replace(/\\/g, '/');
};

// Export all formatters as a grouped object for convenience
export const Formatters = {
  fileSize: formatFileSize,
  number: formatNumber,
  currency: formatCurrency,
  percentage: formatPercentage,
  duration: formatDuration,
  relativeTime: formatRelativeTime,
  dateTime: formatDateTime,
  truncateText,
  camelToTitle,
  snakeToTitle,
  kebabToTitle,
  phoneNumber: formatPhoneNumber,
  displayUrl: formatDisplayUrl,
  codeSnippet: formatCodeSnippet,
  apiResponse: formatApiResponse,
  errorMessage: formatErrorMessage,
  list: formatList,
  memoryUsage: formatMemoryUsage,
  commitHash: formatCommitHash,
  branchName: formatBranchName,
  searchHighlight: formatSearchHighlight,
  filePath: formatFilePath,
} as const;
