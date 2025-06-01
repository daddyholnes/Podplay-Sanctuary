/**
 * Helper Utilities
 * Common utility functions used throughout the application
 */

// Deep clone utility
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;
  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

// Deep merge utility
export const deepMerge = <T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
};

// Check if value is an object
const isObject = (item: any): boolean => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle function
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastExecTime = 0;
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastExecTime >= delay) {
      lastExecTime = now;
      func(...args);
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastExecTime = Date.now();
        func(...args);
      }, delay - (now - lastExecTime));
    }
  };
};

// Generate unique ID
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Generate UUID v4
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Sleep/delay utility
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Retry with exponential backoff
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await sleep(delay);
    }
  }
  
  throw lastError!;
};

// Array utilities
export const arrayUtils = {
  // Remove duplicates from array
  unique: <T>(array: T[]): T[] => [...new Set(array)],
  
  // Remove duplicates by key
  uniqueBy: <T, K extends keyof T>(array: T[], key: K): T[] => {
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  },
  
  // Group array by key
  groupBy: <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
    return array.reduce((groups, item) => {
      const group = String(item[key]);
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },
  
  // Chunk array into smaller arrays
  chunk: <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },
  
  // Flatten nested arrays
  flatten: <T>(array: (T | T[])[]): T[] => {
    return array.reduce((flat, item) => {
      return flat.concat(Array.isArray(item) ? arrayUtils.flatten(item) : item);
    }, [] as T[]);
  },
  
  // Shuffle array
  shuffle: <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },
  
  // Get random item from array
  random: <T>(array: T[]): T | undefined => {
    return array[Math.floor(Math.random() * array.length)];
  },
  
  // Move item in array
  move: <T>(array: T[], fromIndex: number, toIndex: number): T[] => {
    const result = [...array];
    const [removed] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, removed);
    return result;
  },
};

// Object utilities
export const objectUtils = {
  // Pick specific keys from object
  pick: <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  },
  
  // Omit specific keys from object
  omit: <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const result = { ...obj };
    keys.forEach(key => {
      delete result[key];
    });
    return result;
  },
  
  // Check if object is empty
  isEmpty: (obj: object): boolean => {
    return Object.keys(obj).length === 0;
  },
  
  // Get nested value safely
  get: (obj: any, path: string, defaultValue?: any): any => {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result == null || typeof result !== 'object') {
        return defaultValue;
      }
      result = result[key];
    }
    
    return result !== undefined ? result : defaultValue;
  },
  
  // Set nested value
  set: (obj: any, path: string, value: any): void => {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
  },
  
  // Transform object keys
  transformKeys: <T>(obj: T, transformer: (key: string) => string): T => {
    if (Array.isArray(obj)) {
      return obj.map(item => objectUtils.transformKeys(item, transformer)) as T;
    }
    
    if (obj !== null && typeof obj === 'object') {
      const transformed = {} as T;
      Object.keys(obj).forEach(key => {
        const newKey = transformer(key);
        (transformed as any)[newKey] = objectUtils.transformKeys((obj as any)[key], transformer);
      });
      return transformed;
    }
    
    return obj;
  },
  
  // Convert object to camelCase keys
  toCamelCase: <T>(obj: T): T => {
    return objectUtils.transformKeys(obj, key =>
      key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    );
  },
  
  // Convert object to snake_case keys
  toSnakeCase: <T>(obj: T): T => {
    return objectUtils.transformKeys(obj, key =>
      key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
    );
  },
};

// String utilities
export const stringUtils = {
  // Capitalize first letter
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },
  
  // Convert to title case
  toTitleCase: (str: string): string => {
    return str.replace(/\w\S*/g, txt =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  },
  
  // Convert to camelCase
  toCamelCase: (str: string): string => {
    return str.replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '');
  },
  
  // Convert to snake_case
  toSnakeCase: (str: string): string => {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, '');
  },
  
  // Convert to kebab-case
  toKebabCase: (str: string): string => {
    return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`).replace(/^-/, '');
  },
  
  // Remove accents/diacritics
  removeAccents: (str: string): string => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  },
  
  // Create slug from string
  toSlug: (str: string): string => {
    return stringUtils.removeAccents(str)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },
  
  // Truncate with word boundary
  truncateWords: (str: string, maxWords: number, ellipsis: string = '...'): string => {
    const words = str.split(/\s+/);
    if (words.length <= maxWords) return str;
    return words.slice(0, maxWords).join(' ') + ellipsis;
  },
  
  // Extract initials
  getInitials: (name: string, maxLength: number = 2): string => {
    return name
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, maxLength)
      .join('');
  },
  
  // Escape HTML
  escapeHtml: (str: string): string => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },
  
  // Unescape HTML
  unescapeHtml: (str: string): string => {
    const div = document.createElement('div');
    div.innerHTML = str;
    return div.textContent || div.innerText || '';
  },
};

// Number utilities
export const numberUtils = {
  // Clamp number between min and max
  clamp: (value: number, min: number, max: number): number => {
    return Math.max(min, Math.min(max, value));
  },
  
  // Round to specific decimal places
  round: (value: number, decimals: number = 0): number => {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  },
  
  // Generate random number between min and max
  random: (min: number, max: number): number => {
    return Math.random() * (max - min) + min;
  },
  
  // Generate random integer between min and max (inclusive)
  randomInt: (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  
  // Check if number is even
  isEven: (value: number): boolean => value % 2 === 0,
  
  // Check if number is odd
  isOdd: (value: number): boolean => value % 2 !== 0,
  
  // Calculate percentage
  percentage: (value: number, total: number): number => {
    return total === 0 ? 0 : (value / total) * 100;
  },
  
  // Linear interpolation
  lerp: (start: number, end: number, factor: number): number => {
    return start + (end - start) * factor;
  },
};

// URL utilities
export const urlUtils = {
  // Parse query string to object
  parseQuery: (queryString: string): Record<string, string> => {
    const params = new URLSearchParams(queryString);
    const result: Record<string, string> = {};
    
    for (const [key, value] of params) {
      result[key] = value;
    }
    
    return result;
  },
  
  // Convert object to query string
  stringifyQuery: (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    
    return searchParams.toString();
  },
  
  // Join URL parts
  join: (...parts: string[]): string => {
    return parts
      .map((part, index) => {
        if (index === 0) return part.replace(/\/+$/, '');
        return part.replace(/^\/+/, '').replace(/\/+$/, '');
      })
      .filter(Boolean)
      .join('/');
  },
  
  // Get base URL
  getBaseUrl: (url: string): string => {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.host}`;
    } catch {
      return '';
    }
  },
};

// Color utilities
export const colorUtils = {
  // Convert hex to RGB
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  },
  
  // Convert RGB to hex
  rgbToHex: (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  },
  
  // Generate random color
  randomHex: (): string => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  },
  
  // Calculate luminance
  getLuminance: (hex: string): number => {
    const rgb = colorUtils.hexToRgb(hex);
    if (!rgb) return 0;
    
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },
  
  // Check if color is light or dark
  isLight: (hex: string): boolean => {
    return colorUtils.getLuminance(hex) > 0.5;
  },
};

// Browser utilities
export const browserUtils = {
  // Copy text to clipboard
  copyToClipboard: async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
      }
    } catch {
      return false;
    }
  },
  
  // Get user agent info
  getUserAgent: () => {
    const ua = navigator.userAgent;
    return {
      browser: ua.includes('Chrome') ? 'Chrome' :
               ua.includes('Firefox') ? 'Firefox' :
               ua.includes('Safari') ? 'Safari' :
               ua.includes('Edge') ? 'Edge' : 'Unknown',
      os: ua.includes('Windows') ? 'Windows' :
          ua.includes('Mac') ? 'macOS' :
          ua.includes('Linux') ? 'Linux' :
          ua.includes('Android') ? 'Android' :
          ua.includes('iOS') ? 'iOS' : 'Unknown',
      isMobile: /Mobile|Android|iPhone|iPad/.test(ua),
    };
  },
  
  // Download file
  downloadFile: (data: string | Blob, filename: string, type: string = 'text/plain'): void => {
    const blob = data instanceof Blob ? data : new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
  
  // Check if feature is supported
  isSupported: {
    webp: () => {
      const canvas = document.createElement('canvas');
      return canvas.toDataURL('image/webp').indexOf('webp') > -1;
    },
    webgl: () => {
      try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      } catch {
        return false;
      }
    },
    localStorage: () => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch {
        return false;
      }
    },
    serviceWorker: () => 'serviceWorker' in navigator,
    webRTC: () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
  },
};
