/**
 * Crypto Utilities
 * 
 * Provides encryption, decryption, hashing, and security utilities
 * for secure data handling and authentication.
 */

import CryptoJS from 'crypto-js';

/**
 * Configuration for crypto operations
 */
export const CRYPTO_CONFIG = {
  // Default encryption algorithm
  algorithm: 'AES',
  
  // Key derivation settings
  keyDerivation: {
    iterations: 10000,
    keySize: 256 / 32,
    ivSize: 128 / 32,
  },
  
  // Hash settings
  hash: {
    algorithm: 'SHA256',
    encoding: 'hex' as const,
  },
  
  // JWT settings
  jwt: {
    algorithm: 'HS256',
    expiresIn: '24h',
  },
  
  // Password settings
  password: {
    minLength: 8,
    saltLength: 16,
    iterations: 100000,
  },
} as const;

/**
 * Error types for crypto operations
 */
export class CryptoError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'CryptoError';
  }
}

/**
 * Generate a cryptographically secure random string
 */
export function generateRandomString(length: number = 32): string {
  try {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    // Use crypto.getRandomValues if available (browser)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const randomArray = new Uint8Array(length);
      crypto.getRandomValues(randomArray);
      
      for (let i = 0; i < length; i++) {
        result += characters.charAt(randomArray[i] % characters.length);
      }
    } else {
      // Fallback to CryptoJS
      const randomBytes = CryptoJS.lib.WordArray.random(length);
      const randomHex = randomBytes.toString();
      
      for (let i = 0; i < length; i++) {
        const index = parseInt(randomHex.substr(i * 2, 2), 16) % characters.length;
        result += characters.charAt(index);
      }
    }
    
    return result;
  } catch (error) {
    throw new CryptoError('Failed to generate random string', 'RANDOM_GENERATION_ERROR');
  }
}

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  try {
    // Use crypto.randomUUID if available
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Fallback implementation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  } catch (error) {
    throw new CryptoError('Failed to generate UUID', 'UUID_GENERATION_ERROR');
  }
}

/**
 * Hash a string using specified algorithm
 */
export function hashString(
  input: string,
  algorithm: 'SHA1' | 'SHA256' | 'SHA512' | 'MD5' = 'SHA256'
): string {
  try {
    let hash: CryptoJS.lib.WordArray;
    
    switch (algorithm) {
      case 'SHA1':
        hash = CryptoJS.SHA1(input);
        break;
      case 'SHA256':
        hash = CryptoJS.SHA256(input);
        break;
      case 'SHA512':
        hash = CryptoJS.SHA512(input);
        break;
      case 'MD5':
        hash = CryptoJS.MD5(input);
        break;
      default:
        throw new CryptoError(`Unsupported hash algorithm: ${algorithm}`, 'UNSUPPORTED_ALGORITHM');
    }
    
    return hash.toString(CryptoJS.enc.Hex);
  } catch (error) {
    if (error instanceof CryptoError) throw error;
    throw new CryptoError('Failed to hash string', 'HASH_ERROR');
  }
}

/**
 * Generate a salt for password hashing
 */
export function generateSalt(length: number = CRYPTO_CONFIG.password.saltLength): string {
  try {
    return CryptoJS.lib.WordArray.random(length).toString(CryptoJS.enc.Hex);
  } catch (error) {
    throw new CryptoError('Failed to generate salt', 'SALT_GENERATION_ERROR');
  }
}

/**
 * Hash a password with salt using PBKDF2
 */
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  try {
    const actualSalt = salt || generateSalt();
    
    const hash = CryptoJS.PBKDF2(password, actualSalt, {
      keySize: CRYPTO_CONFIG.password.saltLength / 4,
      iterations: CRYPTO_CONFIG.password.iterations,
    });
    
    return {
      hash: hash.toString(CryptoJS.enc.Hex),
      salt: actualSalt,
    };
  } catch (error) {
    throw new CryptoError('Failed to hash password', 'PASSWORD_HASH_ERROR');
  }
}

/**
 * Verify a password against a hash
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const { hash: computedHash } = hashPassword(password, salt);
    return computedHash === hash;
  } catch (error) {
    throw new CryptoError('Failed to verify password', 'PASSWORD_VERIFY_ERROR');
  }
}

/**
 * Encrypt data using AES
 */
export function encryptData(data: string, key: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(data, key);
    return encrypted.toString();
  } catch (error) {
    throw new CryptoError('Failed to encrypt data', 'ENCRYPTION_ERROR');
  }
}

/**
 * Decrypt data using AES
 */
export function decryptData(encryptedData: string, key: string): string {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
    const originalText = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!originalText) {
      throw new CryptoError('Failed to decrypt data - invalid key or corrupted data', 'DECRYPTION_ERROR');
    }
    
    return originalText;
  } catch (error) {
    if (error instanceof CryptoError) throw error;
    throw new CryptoError('Failed to decrypt data', 'DECRYPTION_ERROR');
  }
}

/**
 * Encrypt object data
 */
export function encryptObject<T>(obj: T, key: string): string {
  try {
    const jsonString = JSON.stringify(obj);
    return encryptData(jsonString, key);
  } catch (error) {
    throw new CryptoError('Failed to encrypt object', 'OBJECT_ENCRYPTION_ERROR');
  }
}

/**
 * Decrypt object data
 */
export function decryptObject<T>(encryptedData: string, key: string): T {
  try {
    const decryptedString = decryptData(encryptedData, key);
    return JSON.parse(decryptedString) as T;
  } catch (error) {
    throw new CryptoError('Failed to decrypt object', 'OBJECT_DECRYPTION_ERROR');
  }
}

/**
 * Generate HMAC signature
 */
export function generateHMAC(
  data: string,
  secret: string,
  algorithm: 'SHA1' | 'SHA256' | 'SHA512' = 'SHA256'
): string {
  try {
    let hmac: CryptoJS.lib.WordArray;
    
    switch (algorithm) {
      case 'SHA1':
        hmac = CryptoJS.HmacSHA1(data, secret);
        break;
      case 'SHA256':
        hmac = CryptoJS.HmacSHA256(data, secret);
        break;
      case 'SHA512':
        hmac = CryptoJS.HmacSHA512(data, secret);
        break;
      default:
        throw new CryptoError(`Unsupported HMAC algorithm: ${algorithm}`, 'UNSUPPORTED_ALGORITHM');
    }
    
    return hmac.toString(CryptoJS.enc.Hex);
  } catch (error) {
    if (error instanceof CryptoError) throw error;
    throw new CryptoError('Failed to generate HMAC', 'HMAC_ERROR');
  }
}

/**
 * Verify HMAC signature
 */
export function verifyHMAC(
  data: string,
  signature: string,
  secret: string,
  algorithm: 'SHA1' | 'SHA256' | 'SHA512' = 'SHA256'
): boolean {
  try {
    const computedSignature = generateHMAC(data, secret, algorithm);
    return computedSignature === signature;
  } catch (error) {
    throw new CryptoError('Failed to verify HMAC', 'HMAC_VERIFY_ERROR');
  }
}

/**
 * Generate a secure token for API authentication
 */
export function generateSecureToken(payload: Record<string, any>, secret: string): string {
  try {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };
    
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    }));
    
    const signature = generateHMAC(`${encodedHeader}.${encodedPayload}`, secret, 'SHA256');
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  } catch (error) {
    throw new CryptoError('Failed to generate secure token', 'TOKEN_GENERATION_ERROR');
  }
}

/**
 * Verify and decode a secure token
 */
export function verifySecureToken(token: string, secret: string): Record<string, any> | null {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    
    if (!encodedHeader || !encodedPayload || !signature) {
      return null;
    }
    
    // Verify signature
    const expectedSignature = generateHMAC(`${encodedHeader}.${encodedPayload}`, secret, 'SHA256');
    if (signature !== expectedSignature) {
      return null;
    }
    
    // Decode payload
    const payload = JSON.parse(atob(encodedPayload));
    
    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Secure storage encryption key derivation
 */
export function deriveKeyFromPassword(password: string, salt: string): string {
  try {
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: CRYPTO_CONFIG.keyDerivation.keySize,
      iterations: CRYPTO_CONFIG.keyDerivation.iterations,
    });
    
    return key.toString(CryptoJS.enc.Hex);
  } catch (error) {
    throw new CryptoError('Failed to derive key from password', 'KEY_DERIVATION_ERROR');
  }
}

/**
 * Secure random number generation
 */
export function generateSecureRandom(min: number = 0, max: number = 1): number {
  try {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const randomArray = new Uint32Array(1);
      crypto.getRandomValues(randomArray);
      return min + (randomArray[0] / (0xFFFFFFFF + 1)) * (max - min);
    }
    
    // Fallback
    return min + Math.random() * (max - min);
  } catch (error) {
    throw new CryptoError('Failed to generate secure random number', 'SECURE_RANDOM_ERROR');
  }
}

/**
 * Check if running in secure context (HTTPS)
 */
export function isSecureContext(): boolean {
  if (typeof window !== 'undefined') {
    return window.isSecureContext || window.location.protocol === 'https:';
  }
  return true; // Assume secure in non-browser environments
}

/**
 * Sanitize input for crypto operations
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[\x00-\x1F\x7F]/g, '');
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Crypto utilities for browser storage
 */
export const secureStorage = {
  /**
   * Encrypt and store data in localStorage
   */
  setItem(key: string, value: any, password: string): void {
    try {
      const serialized = JSON.stringify(value);
      const encrypted = encryptData(serialized, password);
      localStorage.setItem(key, encrypted);
    } catch (error) {
      throw new CryptoError('Failed to securely store item', 'SECURE_STORAGE_ERROR');
    }
  },
  
  /**
   * Decrypt and retrieve data from localStorage
   */
  getItem<T>(key: string, password: string): T | null {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      
      const decrypted = decryptData(encrypted, password);
      return JSON.parse(decrypted) as T;
    } catch (error) {
      return null;
    }
  },
  
  /**
   * Remove item from localStorage
   */
  removeItem(key: string): void {
    localStorage.removeItem(key);
  },
  
  /**
   * Clear all encrypted storage
   */
  clear(): void {
    localStorage.clear();
  },
};

/**
 * Export all crypto utilities
 */
export default {
  // Configuration
  CRYPTO_CONFIG,
  CryptoError,
  
  // Random generation
  generateRandomString,
  generateUUID,
  generateSecureRandom,
  
  // Hashing
  hashString,
  generateSalt,
  hashPassword,
  verifyPassword,
  
  // Encryption
  encryptData,
  decryptData,
  encryptObject,
  decryptObject,
  
  // HMAC
  generateHMAC,
  verifyHMAC,
  
  // Tokens
  generateSecureToken,
  verifySecureToken,
  
  // Key derivation
  deriveKeyFromPassword,
  
  // Security
  isSecureContext,
  sanitizeInput,
  constantTimeCompare,
  
  // Secure storage
  secureStorage,
};
