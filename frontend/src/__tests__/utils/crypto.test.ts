/**
 * Crypto Utilities Tests
 * 
 * Comprehensive test suite for cryptographic utility functions.
 * Tests encryption, decryption, hashing, password security, and secure storage.
 * 
 * @fileoverview Tests for crypto utility functionality
 * @version 1.0.0
 * @author Podplay Sanctuary Team
 */

import CryptoJS from 'crypto-js';
import {
  CRYPTO_CONFIG,
  CryptoError,
  generateRandomString,
  generateUUID,
  hashString,
  generateSalt,
  hashPassword,
  verifyPassword,
  encryptData,
  decryptData,
  encryptObject,
  decryptObject,
  generateHMAC,
  verifyHMAC,
  generateSecureToken,
  verifySecureToken,
  deriveKeyFromPassword,
  generateSecureRandom,
  isSecureContext,
  sanitizeInput,
  constantTimeCompare,
  secureStorage,
} from '../../utils/crypto';

// ============================================================================
// TEST SETUP
// ============================================================================

describe('Crypto Utilities', () => {
  // Test data
  const testData = 'This is test data for encryption';
  const testPassword = 'SecurePassword123!';
  const testSalt = 'randomSaltValue123';
  const testSecret = 'secretKeyForHMAC';
  const testPayload = { userId: '123', role: 'admin' };

  // Mock crypto APIs for testing
  beforeEach(() => {
    // Mock crypto.getRandomValues for secure random generation
    Object.defineProperty(global, 'crypto', {
      value: {
        getRandomValues: jest.fn((array) => {
          for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
          }
          return array;
        }),
        randomUUID: jest.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
      },
      writable: true,
    });

    // Mock window for secure context testing
    Object.defineProperty(global, 'window', {
      value: {
        isSecureContext: true,
        location: { protocol: 'https:' },
      },
      writable: true,
    });

    // Mock localStorage for secure storage testing
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ============================================================================
  // RANDOM GENERATION TESTS
  // ============================================================================

  describe('Random Generation', () => {
    describe('generateRandomString', () => {
      it('should generate random strings of correct length', () => {
        const result = generateRandomString(16);
        expect(result).toHaveLength(16);
        expect(typeof result).toBe('string');
      });

      it('should generate different strings on multiple calls', () => {
        const str1 = generateRandomString(32);
        const str2 = generateRandomString(32);
        expect(str1).not.toBe(str2);
      });

      it('should use default length when not specified', () => {
        const result = generateRandomString();
        expect(result).toHaveLength(32);
      });

      it('should handle edge cases', () => {
        expect(generateRandomString(0)).toHaveLength(0);
        expect(generateRandomString(1)).toHaveLength(1);
      });

      it('should throw error for negative length', () => {
        expect(() => generateRandomString(-1)).toThrow(CryptoError);
      });
    });

    describe('generateUUID', () => {
      it('should generate valid UUID format', () => {
        const uuid = generateUUID();
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        expect(uuid).toMatch(uuidRegex);
      });

      it('should generate different UUIDs on multiple calls', () => {
        const uuid1 = generateUUID();
        const uuid2 = generateUUID();
        expect(uuid1).not.toBe(uuid2);
      });

      it('should use crypto API when available', () => {
        generateUUID();
        expect(global.crypto.randomUUID).toHaveBeenCalled();
      });
    });

    describe('generateSecureRandom', () => {
      it('should generate numbers within specified range', () => {
        const result = generateSecureRandom(0, 100);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(100);
      });

      it('should use default range when not specified', () => {
        const result = generateSecureRandom();
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(1);
      });

      it('should use crypto API when available', () => {
        generateSecureRandom(0, 10);
        expect(global.crypto.getRandomValues).toHaveBeenCalled();
      });
    });
  });

  // ============================================================================
  // HASHING TESTS
  // ============================================================================

  describe('Hashing', () => {
    describe('hashString', () => {
      it('should hash strings with SHA256 by default', () => {
        const hash = hashString(testData);
        expect(typeof hash).toBe('string');
        expect(hash).toHaveLength(64); // SHA256 produces 64-character hex string
      });

      it('should support different hash algorithms', () => {
        const sha1Hash = hashString(testData, 'SHA1');
        const sha256Hash = hashString(testData, 'SHA256');
        const sha512Hash = hashString(testData, 'SHA512');
        const md5Hash = hashString(testData, 'MD5');

        expect(sha1Hash).toHaveLength(40);
        expect(sha256Hash).toHaveLength(64);
        expect(sha512Hash).toHaveLength(128);
        expect(md5Hash).toHaveLength(32);
      });

      it('should produce consistent hashes for same input', () => {
        const hash1 = hashString(testData);
        const hash2 = hashString(testData);
        expect(hash1).toBe(hash2);
      });

      it('should produce different hashes for different inputs', () => {
        const hash1 = hashString('input1');
        const hash2 = hashString('input2');
        expect(hash1).not.toBe(hash2);
      });

      it('should throw error for unsupported algorithm', () => {
        expect(() => hashString(testData, 'UNSUPPORTED' as any)).toThrow(CryptoError);
      });
    });

    describe('generateSalt', () => {
      it('should generate salt of correct length', () => {
        const salt = generateSalt(16);
        expect(salt).toHaveLength(16);
      });

      it('should use default length from config', () => {
        const salt = generateSalt();
        expect(salt).toHaveLength(CRYPTO_CONFIG.password.saltLength);
      });

      it('should generate different salts on multiple calls', () => {
        const salt1 = generateSalt();
        const salt2 = generateSalt();
        expect(salt1).not.toBe(salt2);
      });
    });

    describe('Password Hashing', () => {
      it('should hash password with salt', () => {
        const result = hashPassword(testPassword);
        expect(result.hash).toBeDefined();
        expect(result.salt).toBeDefined();
        expect(typeof result.hash).toBe('string');
        expect(typeof result.salt).toBe('string');
      });

      it('should use provided salt', () => {
        const result = hashPassword(testPassword, testSalt);
        expect(result.salt).toBe(testSalt);
      });

      it('should produce same hash for same password and salt', () => {
        const result1 = hashPassword(testPassword, testSalt);
        const result2 = hashPassword(testPassword, testSalt);
        expect(result1.hash).toBe(result2.hash);
      });

      it('should verify password correctly', () => {
        const { hash, salt } = hashPassword(testPassword);
        expect(verifyPassword(testPassword, hash, salt)).toBe(true);
        expect(verifyPassword('wrongPassword', hash, salt)).toBe(false);
      });

      it('should handle empty passwords', () => {
        expect(() => hashPassword('')).toThrow(CryptoError);
      });
    });
  });

  // ============================================================================
  // ENCRYPTION TESTS
  // ============================================================================

  describe('Encryption and Decryption', () => {
    describe('Basic Encryption', () => {
      it('should encrypt and decrypt data successfully', () => {
        const encrypted = encryptData(testData, testPassword);
        const decrypted = decryptData(encrypted, testPassword);
        
        expect(encrypted).not.toBe(testData);
        expect(decrypted).toBe(testData);
      });

      it('should produce different encrypted output for same input', () => {
        const encrypted1 = encryptData(testData, testPassword);
        const encrypted2 = encryptData(testData, testPassword);
        expect(encrypted1).not.toBe(encrypted2); // Due to random IV
      });

      it('should fail decryption with wrong key', () => {
        const encrypted = encryptData(testData, testPassword);
        expect(() => decryptData(encrypted, 'wrongPassword')).toThrow(CryptoError);
      });

      it('should handle empty data', () => {
        const encrypted = encryptData('', testPassword);
        const decrypted = decryptData(encrypted, testPassword);
        expect(decrypted).toBe('');
      });

      it('should throw error for invalid encrypted data', () => {
        expect(() => decryptData('invalidData', testPassword)).toThrow(CryptoError);
      });
    });

    describe('Object Encryption', () => {
      it('should encrypt and decrypt objects successfully', () => {
        const encrypted = encryptObject(testPayload, testPassword);
        const decrypted = decryptObject(encrypted, testPassword);
        
        expect(decrypted).toEqual(testPayload);
      });

      it('should handle complex objects', () => {
        const complexObject = {
          user: { id: 123, name: 'John' },
          permissions: ['read', 'write'],
          metadata: { created: new Date().toISOString() },
        };
        
        const encrypted = encryptObject(complexObject, testPassword);
        const decrypted = decryptObject(encrypted, testPassword);
        
        expect(decrypted).toEqual(complexObject);
      });

      it('should handle arrays', () => {
        const array = [1, 2, 3, 'test', { nested: true }];
        const encrypted = encryptObject(array, testPassword);
        const decrypted = decryptObject(encrypted, testPassword);
        
        expect(decrypted).toEqual(array);
      });

      it('should throw error for non-serializable objects', () => {
        const circularRef: any = { a: 1 };
        circularRef.b = circularRef;
        
        expect(() => encryptObject(circularRef, testPassword)).toThrow(CryptoError);
      });
    });
  });

  // ============================================================================
  // HMAC TESTS
  // ============================================================================

  describe('HMAC Operations', () => {
    describe('HMAC Generation', () => {
      it('should generate HMAC with SHA256 by default', () => {
        const hmac = generateHMAC(testData, testSecret);
        expect(typeof hmac).toBe('string');
        expect(hmac).toHaveLength(64); // SHA256 HMAC produces 64-character hex string
      });

      it('should support different HMAC algorithms', () => {
        const hmacSHA1 = generateHMAC(testData, testSecret, 'SHA1');
        const hmacSHA256 = generateHMAC(testData, testSecret, 'SHA256');
        const hmacSHA512 = generateHMAC(testData, testSecret, 'SHA512');

        expect(hmacSHA1).toHaveLength(40);
        expect(hmacSHA256).toHaveLength(64);
        expect(hmacSHA512).toHaveLength(128);
      });

      it('should produce consistent HMAC for same input', () => {
        const hmac1 = generateHMAC(testData, testSecret);
        const hmac2 = generateHMAC(testData, testSecret);
        expect(hmac1).toBe(hmac2);
      });

      it('should produce different HMAC for different secrets', () => {
        const hmac1 = generateHMAC(testData, 'secret1');
        const hmac2 = generateHMAC(testData, 'secret2');
        expect(hmac1).not.toBe(hmac2);
      });
    });

    describe('HMAC Verification', () => {
      it('should verify HMAC correctly', () => {
        const hmac = generateHMAC(testData, testSecret);
        expect(verifyHMAC(testData, hmac, testSecret)).toBe(true);
      });

      it('should reject invalid HMAC', () => {
        const hmac = generateHMAC(testData, testSecret);
        expect(verifyHMAC('modified data', hmac, testSecret)).toBe(false);
        expect(verifyHMAC(testData, 'invalid hmac', testSecret)).toBe(false);
        expect(verifyHMAC(testData, hmac, 'wrong secret')).toBe(false);
      });

      it('should work with different algorithms', () => {
        const hmac = generateHMAC(testData, testSecret, 'SHA512');
        expect(verifyHMAC(testData, hmac, testSecret, 'SHA512')).toBe(true);
        expect(verifyHMAC(testData, hmac, testSecret, 'SHA256')).toBe(false);
      });
    });
  });

  // ============================================================================
  // SECURE TOKEN TESTS
  // ============================================================================

  describe('Secure Tokens', () => {
    describe('Token Generation', () => {
      it('should generate secure token from payload', () => {
        const token = generateSecureToken(testPayload, testSecret);
        expect(typeof token).toBe('string');
        expect(token.length).toBeGreaterThan(0);
      });

      it('should include timestamp in token', () => {
        const token = generateSecureToken(testPayload, testSecret);
        // Token should be different when generated at different times
        setTimeout(() => {
          const token2 = generateSecureToken(testPayload, testSecret);
          expect(token).not.toBe(token2);
        }, 1);
      });
    });

    describe('Token Verification', () => {
      it('should verify valid token', () => {
        const token = generateSecureToken(testPayload, testSecret);
        const decoded = verifySecureToken(token, testSecret);
        
        expect(decoded).toBeTruthy();
        expect(decoded.userId).toBe(testPayload.userId);
        expect(decoded.role).toBe(testPayload.role);
      });

      it('should reject tampered token', () => {
        const token = generateSecureToken(testPayload, testSecret);
        const tamperedToken = token.slice(0, -5) + 'xxxxx';
        
        const decoded = verifySecureToken(tamperedToken, testSecret);
        expect(decoded).toBeNull();
      });

      it('should reject token with wrong secret', () => {
        const token = generateSecureToken(testPayload, testSecret);
        const decoded = verifySecureToken(token, 'wrongSecret');
        
        expect(decoded).toBeNull();
      });

      it('should handle malformed tokens', () => {
        expect(verifySecureToken('invalid.token', testSecret)).toBeNull();
        expect(verifySecureToken('', testSecret)).toBeNull();
      });
    });
  });

  // ============================================================================
  // KEY DERIVATION TESTS
  // ============================================================================

  describe('Key Derivation', () => {
    it('should derive key from password', () => {
      const key = deriveKeyFromPassword(testPassword, testSalt);
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);
    });

    it('should produce consistent keys for same input', () => {
      const key1 = deriveKeyFromPassword(testPassword, testSalt);
      const key2 = deriveKeyFromPassword(testPassword, testSalt);
      expect(key1).toBe(key2);
    });

    it('should produce different keys for different passwords', () => {
      const key1 = deriveKeyFromPassword('password1', testSalt);
      const key2 = deriveKeyFromPassword('password2', testSalt);
      expect(key1).not.toBe(key2);
    });

    it('should produce different keys for different salts', () => {
      const key1 = deriveKeyFromPassword(testPassword, 'salt1');
      const key2 = deriveKeyFromPassword(testPassword, 'salt2');
      expect(key1).not.toBe(key2);
    });
  });

  // ============================================================================
  // SECURITY UTILITIES TESTS
  // ============================================================================

  describe('Security Utilities', () => {
    describe('isSecureContext', () => {
      it('should return true for HTTPS context', () => {
        expect(isSecureContext()).toBe(true);
      });

      it('should handle non-browser environments', () => {
        delete (global as any).window;
        expect(isSecureContext()).toBe(true); // Should assume secure in non-browser
      });

      it('should detect insecure context', () => {
        Object.defineProperty(global, 'window', {
          value: {
            isSecureContext: false,
            location: { protocol: 'http:' },
          },
          writable: true,
        });
        
        expect(isSecureContext()).toBe(false);
      });
    });

    describe('sanitizeInput', () => {
      it('should remove control characters', () => {
        const input = 'hello\x00\x01world\x7F';
        const sanitized = sanitizeInput(input);
        expect(sanitized).toBe('helloworld');
      });

      it('should trim whitespace', () => {
        const input = '  hello world  ';
        const sanitized = sanitizeInput(input);
        expect(sanitized).toBe('hello world');
      });

      it('should handle empty strings', () => {
        expect(sanitizeInput('')).toBe('');
        expect(sanitizeInput('   ')).toBe('');
      });
    });

    describe('constantTimeCompare', () => {
      it('should return true for identical strings', () => {
        expect(constantTimeCompare('hello', 'hello')).toBe(true);
      });

      it('should return false for different strings', () => {
        expect(constantTimeCompare('hello', 'world')).toBe(false);
      });

      it('should return false for different lengths', () => {
        expect(constantTimeCompare('hello', 'hello world')).toBe(false);
      });

      it('should handle empty strings', () => {
        expect(constantTimeCompare('', '')).toBe(true);
        expect(constantTimeCompare('', 'hello')).toBe(false);
      });
    });
  });

  // ============================================================================
  // SECURE STORAGE TESTS
  // ============================================================================

  describe('Secure Storage', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    describe('setItem and getItem', () => {
      it('should store and retrieve data securely', () => {
        secureStorage.setItem('testKey', testPayload, testPassword);
        const retrieved = secureStorage.getItem('testKey', testPassword);
        
        expect(retrieved).toEqual(testPayload);
        expect(localStorage.setItem).toHaveBeenCalled();
      });

      it('should return null for non-existent keys', () => {
        const result = secureStorage.getItem('nonExistent', testPassword);
        expect(result).toBeNull();
      });

      it('should return null for wrong password', () => {
        secureStorage.setItem('testKey', testPayload, testPassword);
        const result = secureStorage.getItem('testKey', 'wrongPassword');
        expect(result).toBeNull();
      });

      it('should handle complex data types', () => {
        const complexData = {
          array: [1, 2, 3],
          nested: { deep: { value: 'test' } },
          date: new Date().toISOString(),
        };
        
        secureStorage.setItem('complex', complexData, testPassword);
        const retrieved = secureStorage.getItem('complex', testPassword);
        
        expect(retrieved).toEqual(complexData);
      });
    });

    describe('removeItem and clear', () => {
      it('should remove specific items', () => {
        secureStorage.setItem('testKey', testPayload, testPassword);
        secureStorage.removeItem('testKey');
        
        expect(localStorage.removeItem).toHaveBeenCalledWith('testKey');
      });

      it('should clear all storage', () => {
        secureStorage.clear();
        expect(localStorage.clear).toHaveBeenCalled();
      });
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe('Error Handling', () => {
    it('should throw CryptoError for encryption failures', () => {
      // Mock CryptoJS to throw error
      const originalAES = CryptoJS.AES;
      CryptoJS.AES.encrypt = jest.fn(() => {
        throw new Error('Encryption failed');
      });
      
      expect(() => encryptData(testData, testPassword)).toThrow(CryptoError);
      
      // Restore
      CryptoJS.AES.encrypt = originalAES.encrypt;
    });

    it('should provide meaningful error messages', () => {
      try {
        decryptData('invalid', testPassword);
      } catch (error) {
        expect(error).toBeInstanceOf(CryptoError);
        expect(error.message).toContain('decrypt');
      }
    });

    it('should include error codes', () => {
      try {
        generateRandomString(-1);
      } catch (error) {
        expect(error).toBeInstanceOf(CryptoError);
        expect(error.code).toBeDefined();
      }
    });
  });

  // ============================================================================
  // CONFIGURATION TESTS
  // ============================================================================

  describe('Configuration', () => {
    it('should use correct default configuration', () => {
      expect(CRYPTO_CONFIG.algorithm).toBe('AES');
      expect(CRYPTO_CONFIG.hash.algorithm).toBe('SHA256');
      expect(CRYPTO_CONFIG.password.minLength).toBe(8);
      expect(CRYPTO_CONFIG.keyDerivation.iterations).toBeGreaterThan(1000);
    });

    it('should have secure default settings', () => {
      expect(CRYPTO_CONFIG.password.iterations).toBeGreaterThanOrEqual(100000);
      expect(CRYPTO_CONFIG.password.saltLength).toBeGreaterThanOrEqual(16);
      expect(CRYPTO_CONFIG.keyDerivation.iterations).toBeGreaterThanOrEqual(10000);
    });
  });

  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================

  describe('Performance', () => {
    it('should encrypt/decrypt efficiently', () => {
      const start = performance.now();
      
      for (let i = 0; i < 100; i++) {
        const encrypted = encryptData(`test data ${i}`, testPassword);
        decryptData(encrypted, testPassword);
      }
      
      const end = performance.now();
      expect(end - start).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should hash efficiently', () => {
      const start = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        hashString(`test data ${i}`);
      }
      
      const end = performance.now();
      expect(end - start).toBeLessThan(500); // Should complete within 500ms
    });

    it('should generate secure tokens efficiently', () => {
      const start = performance.now();
      
      for (let i = 0; i < 100; i++) {
        generateSecureToken({ id: i }, testSecret);
      }
      
      const end = performance.now();
      expect(end - start).toBeLessThan(200); // Should complete within 200ms
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe('Integration', () => {
    it('should work with real-world authentication flow', () => {
      // 1. Register user with password
      const { hash, salt } = hashPassword(testPassword);
      
      // 2. Verify password during login
      const isValidPassword = verifyPassword(testPassword, hash, salt);
      expect(isValidPassword).toBe(true);
      
      // 3. Generate session token
      const sessionData = { userId: '123', role: 'user' };
      const token = generateSecureToken(sessionData, testSecret);
      
      // 4. Verify session token
      const decoded = verifySecureToken(token, testSecret);
      expect(decoded).toEqual(expect.objectContaining(sessionData));
    });

    it('should secure data storage workflow', () => {
      // 1. Derive encryption key from user password
      const userPassword = 'UserSecurePassword123!';
      const salt = generateSalt();
      const encryptionKey = deriveKeyFromPassword(userPassword, salt);
      
      // 2. Encrypt sensitive data
      const sensitiveData = { ssn: '123-45-6789', creditCard: '4111-1111-1111-1111' };
      const encrypted = encryptObject(sensitiveData, encryptionKey);
      
      // 3. Store encrypted data
      secureStorage.setItem('userData', { encrypted, salt }, userPassword);
      
      // 4. Retrieve and decrypt data
      const stored = secureStorage.getItem('userData', userPassword);
      const decrypted = decryptObject(stored.encrypted, encryptionKey);
      
      expect(decrypted).toEqual(sensitiveData);
    });
  });
});
