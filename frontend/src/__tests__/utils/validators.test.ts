/**
 * Validators Utility Tests
 * 
 * Comprehensive tests for all validation utilities including
 * email, URL, phone, password validation, and form validation functions.
 */

import {
  isEmail,
  isURL,
  isPhoneNumber,
  validatePassword,
  isStrongPassword,
  validateForm,
  isValidDate,
  isValidAge,
  isValidPostalCode,
  isValidCreditCard,
  validateFileUpload,
  validateJSON,
  isValidUsername,
  isValidSlug,
  sanitizeInput,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validatePattern,
  validateRange,
  validateCustom,
  createValidator,
  validators
} from '../../utils/validators';

describe('Email Validation', () => {
  describe('isEmail', () => {
    test('validates correct email formats', () => {
      expect(isEmail('test@example.com')).toBe(true);
      expect(isEmail('user.name@domain.co.uk')).toBe(true);
      expect(isEmail('user+tag@example.org')).toBe(true);
      expect(isEmail('123@example.com')).toBe(true);
    });

    test('rejects invalid email formats', () => {
      expect(isEmail('invalid-email')).toBe(false);
      expect(isEmail('test@')).toBe(false);
      expect(isEmail('@example.com')).toBe(false);
      expect(isEmail('test..test@example.com')).toBe(false);
      expect(isEmail('')).toBe(false);
    });

    test('handles edge cases', () => {
      expect(isEmail('a@b.co')).toBe(true);
      expect(isEmail('very.long.email.address@very.long.domain.name.com')).toBe(true);
      expect(isEmail('test@localhost')).toBe(false); // No TLD
    });

    test('validates with custom options', () => {
      expect(isEmail('test@localhost', { allowLocalhost: true })).toBe(true);
      expect(isEmail('Test@Example.Com', { caseSensitive: false })).toBe(true);
      expect(isEmail('Test@Example.Com', { caseSensitive: true })).toBe(true);
    });
  });
});

describe('URL Validation', () => {
  describe('isURL', () => {
    test('validates correct URL formats', () => {
      expect(isURL('https://example.com')).toBe(true);
      expect(isURL('http://example.com')).toBe(true);
      expect(isURL('https://www.example.com/path')).toBe(true);
      expect(isURL('ftp://files.example.com')).toBe(true);
    });

    test('rejects invalid URL formats', () => {
      expect(isURL('not-a-url')).toBe(false);
      expect(isURL('http://')).toBe(false);
      expect(isURL('://example.com')).toBe(false);
      expect(isURL('')).toBe(false);
    });

    test('validates with protocol restrictions', () => {
      expect(isURL('https://example.com', { protocols: ['https'] })).toBe(true);
      expect(isURL('http://example.com', { protocols: ['https'] })).toBe(false);
      expect(isURL('ftp://example.com', { protocols: ['http', 'https'] })).toBe(false);
    });

    test('validates localhost URLs', () => {
      expect(isURL('http://localhost:3000')).toBe(true);
      expect(isURL('https://127.0.0.1:8080')).toBe(true);
      expect(isURL('http://localhost', { requirePort: true })).toBe(false);
    });

    test('validates paths and query parameters', () => {
      expect(isURL('https://example.com/path/to/resource')).toBe(true);
      expect(isURL('https://example.com?query=value&other=123')).toBe(true);
      expect(isURL('https://example.com#fragment')).toBe(true);
    });
  });
});

describe('Phone Number Validation', () => {
  describe('isPhoneNumber', () => {
    test('validates US phone numbers', () => {
      expect(isPhoneNumber('(555) 123-4567')).toBe(true);
      expect(isPhoneNumber('555-123-4567')).toBe(true);
      expect(isPhoneNumber('5551234567')).toBe(true);
      expect(isPhoneNumber('+1 555 123 4567')).toBe(true);
    });

    test('validates international numbers', () => {
      expect(isPhoneNumber('+44 20 7946 0958')).toBe(true);
      expect(isPhoneNumber('+33 1 42 68 53 00')).toBe(true);
      expect(isPhoneNumber('+81 3 1234 5678')).toBe(true);
    });

    test('rejects invalid phone numbers', () => {
      expect(isPhoneNumber('123')).toBe(false);
      expect(isPhoneNumber('abc-def-ghij')).toBe(false);
      expect(isPhoneNumber('')).toBe(false);
      expect(isPhoneNumber('555-555-555')).toBe(false); // Too short
    });

    test('validates with country codes', () => {
      expect(isPhoneNumber('555-123-4567', { country: 'US' })).toBe(true);
      expect(isPhoneNumber('020 7946 0958', { country: 'GB' })).toBe(true);
      expect(isPhoneNumber('555-123-4567', { country: 'GB' })).toBe(false);
    });

    test('handles different formats', () => {
      expect(isPhoneNumber('555.123.4567')).toBe(true);
      expect(isPhoneNumber('555 123 4567')).toBe(true);
      expect(isPhoneNumber('(555)123-4567')).toBe(true);
    });
  });
});

describe('Password Validation', () => {
  describe('validatePassword', () => {
    test('validates strong passwords', () => {
      const result = validatePassword('StrongPass123!');
      expect(result.isValid).toBe(true);
      expect(result.strength).toBe('strong');
      expect(result.score).toBeGreaterThan(80);
    });

    test('identifies weak passwords', () => {
      const result = validatePassword('123456');
      expect(result.isValid).toBe(false);
      expect(result.strength).toBe('weak');
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    test('validates password requirements', () => {
      const weakPassword = validatePassword('weak');
      expect(weakPassword.errors).toContain('Password must be at least 8 characters long');
      
      const noUppercase = validatePassword('password123!');
      expect(noUppercase.errors).toContain('Password must contain at least one uppercase letter');
      
      const noNumbers = validatePassword('Password!');
      expect(noNumbers.errors).toContain('Password must contain at least one number');
      
      const noSpecial = validatePassword('Password123');
      expect(noSpecial.errors).toContain('Password must contain at least one special character');
    });

    test('detects common passwords', () => {
      const common = validatePassword('Password123!');
      expect(common.warnings).toContain('Password is too common');
      
      const dictionary = validatePassword('dictionary123!');
      expect(dictionary.warnings).toContain('Password contains dictionary words');
    });

    test('calculates entropy correctly', () => {
      const simple = validatePassword('abc123');
      const complex = validatePassword('Tr0ub4dor&3');
      expect(complex.entropy).toBeGreaterThan(simple.entropy);
    });

    test('validates with custom requirements', () => {
      const options = {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecial: true,
        minSpecialChars: 2
      };
      
      const result = validatePassword('ShortPass1!', options);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 12 characters long');
    });
  });

  describe('isStrongPassword', () => {
    test('identifies strong passwords', () => {
      expect(isStrongPassword('ComplexPass123!')).toBe(true);
      expect(isStrongPassword('MyVerySecureP@ssw0rd')).toBe(true);
    });

    test('rejects weak passwords', () => {
      expect(isStrongPassword('password')).toBe(false);
      expect(isStrongPassword('12345678')).toBe(false);
      expect(isStrongPassword('Password')).toBe(false);
    });
  });
});

describe('Date Validation', () => {
  describe('isValidDate', () => {
    test('validates valid dates', () => {
      expect(isValidDate('2023-06-15')).toBe(true);
      expect(isValidDate('06/15/2023')).toBe(true);
      expect(isValidDate(new Date())).toBe(true);
      expect(isValidDate('June 15, 2023')).toBe(true);
    });

    test('rejects invalid dates', () => {
      expect(isValidDate('invalid-date')).toBe(false);
      expect(isValidDate('2023-13-01')).toBe(false); // Invalid month
      expect(isValidDate('2023-02-30')).toBe(false); // Invalid day
      expect(isValidDate('')).toBe(false);
    });

    test('validates date ranges', () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 86400000);
      const tomorrow = new Date(today.getTime() + 86400000);
      
      expect(isValidDate(yesterday, { min: today })).toBe(false);
      expect(isValidDate(tomorrow, { max: today })).toBe(false);
      expect(isValidDate(today, { min: yesterday, max: tomorrow })).toBe(true);
    });

    test('validates future/past dates', () => {
      const future = new Date(Date.now() + 86400000);
      const past = new Date(Date.now() - 86400000);
      
      expect(isValidDate(future, { allowFuture: false })).toBe(false);
      expect(isValidDate(past, { allowPast: false })).toBe(false);
    });
  });

  describe('isValidAge', () => {
    test('validates reasonable ages', () => {
      expect(isValidAge(25)).toBe(true);
      expect(isValidAge(0)).toBe(true); // Newborn
      expect(isValidAge(120)).toBe(true); // Oldest recorded
    });

    test('rejects unreasonable ages', () => {
      expect(isValidAge(-1)).toBe(false);
      expect(isValidAge(150)).toBe(false);
      expect(isValidAge(NaN)).toBe(false);
    });

    test('validates with custom ranges', () => {
      expect(isValidAge(17, { min: 18 })).toBe(false);
      expect(isValidAge(70, { max: 65 })).toBe(false);
      expect(isValidAge(25, { min: 18, max: 65 })).toBe(true);
    });
  });
});

describe('Other Validation Functions', () => {
  describe('isValidPostalCode', () => {
    test('validates US ZIP codes', () => {
      expect(isValidPostalCode('12345', 'US')).toBe(true);
      expect(isValidPostalCode('12345-6789', 'US')).toBe(true);
    });

    test('validates other country codes', () => {
      expect(isValidPostalCode('SW1A 1AA', 'GB')).toBe(true);
      expect(isValidPostalCode('75001', 'FR')).toBe(true);
      expect(isValidPostalCode('10115', 'DE')).toBe(true);
    });

    test('rejects invalid postal codes', () => {
      expect(isValidPostalCode('1234', 'US')).toBe(false); // Too short
      expect(isValidPostalCode('ABCDE', 'US')).toBe(false); // Letters in US ZIP
    });
  });

  describe('isValidCreditCard', () => {
    test('validates credit card numbers using Luhn algorithm', () => {
      expect(isValidCreditCard('4111111111111111')).toBe(true); // Visa test number
      expect(isValidCreditCard('5555555555554444')).toBe(true); // Mastercard test number
    });

    test('rejects invalid credit card numbers', () => {
      expect(isValidCreditCard('4111111111111112')).toBe(false); // Failed Luhn
      expect(isValidCreditCard('123456789')).toBe(false); // Too short
      expect(isValidCreditCard('abcd-efgh-ijkl')).toBe(false); // Non-numeric
    });

    test('validates specific card types', () => {
      expect(isValidCreditCard('4111111111111111', { type: 'visa' })).toBe(true);
      expect(isValidCreditCard('5555555555554444', { type: 'visa' })).toBe(false);
    });
  });

  describe('isValidUsername', () => {
    test('validates usernames', () => {
      expect(isValidUsername('john_doe')).toBe(true);
      expect(isValidUsername('user123')).toBe(true);
      expect(isValidUsername('a')).toBe(false); // Too short
    });

    test('rejects invalid usernames', () => {
      expect(isValidUsername('user with spaces')).toBe(false);
      expect(isValidUsername('user@domain')).toBe(false);
      expect(isValidUsername('')).toBe(false);
    });

    test('validates with custom options', () => {
      expect(isValidUsername('ab', { minLength: 3 })).toBe(false);
      expect(isValidUsername('verylongusername', { maxLength: 10 })).toBe(false);
    });
  });

  describe('isValidSlug', () => {
    test('validates URL slugs', () => {
      expect(isValidSlug('hello-world')).toBe(true);
      expect(isValidSlug('my-blog-post-123')).toBe(true);
      expect(isValidSlug('single')).toBe(true);
    });

    test('rejects invalid slugs', () => {
      expect(isValidSlug('Hello World')).toBe(false); // Spaces
      expect(isValidSlug('hello_world')).toBe(false); // Underscores
      expect(isValidSlug('hello--world')).toBe(false); // Double hyphens
    });
  });
});

describe('File Upload Validation', () => {
  describe('validateFileUpload', () => {
    const createMockFile = (name: string, size: number, type: string) => ({
      name,
      size,
      type,
      lastModified: Date.now()
    } as File);

    test('validates file types', () => {
      const imageFile = createMockFile('image.jpg', 1000000, 'image/jpeg');
      const result = validateFileUpload(imageFile, {
        allowedTypes: ['image/jpeg', 'image/png']
      });
      expect(result.isValid).toBe(true);
    });

    test('rejects invalid file types', () => {
      const textFile = createMockFile('document.txt', 1000, 'text/plain');
      const result = validateFileUpload(textFile, {
        allowedTypes: ['image/jpeg', 'image/png']
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File type not allowed');
    });

    test('validates file size', () => {
      const largeFile = createMockFile('large.jpg', 10000000, 'image/jpeg');
      const result = validateFileUpload(largeFile, {
        maxSize: 5000000 // 5MB
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File size exceeds maximum allowed');
    });

    test('validates file extensions', () => {
      const file = createMockFile('image.gif', 1000000, 'image/gif');
      const result = validateFileUpload(file, {
        allowedExtensions: ['.jpg', '.png']
      });
      expect(result.isValid).toBe(false);
    });

    test('validates multiple files', () => {
      const files = [
        createMockFile('image1.jpg', 1000000, 'image/jpeg'),
        createMockFile('image2.png', 2000000, 'image/png')
      ];
      const result = validateFileUpload(files, {
        allowedTypes: ['image/jpeg', 'image/png'],
        maxFiles: 5
      });
      expect(result.isValid).toBe(true);
    });
  });
});

describe('Form Validation', () => {
  describe('validateForm', () => {
    test('validates complete form data', () => {
      const formData = {
        email: 'test@example.com',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!',
        age: 25
      };

      const rules = {
        email: [validateRequired, isEmail],
        password: [validateRequired, isStrongPassword],
        confirmPassword: [validateRequired, (value: string, data: any) => 
          value === data.password || 'Passwords must match'],
        age: [validateRequired, validateRange(18, 120)]
      };

      const result = validateForm(formData, rules);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    test('returns validation errors', () => {
      const formData = {
        email: 'invalid-email',
        password: '123',
        age: 15
      };

      const rules = {
        email: [validateRequired, isEmail],
        password: [validateRequired, validateMinLength(8)],
        age: [validateRequired, validateRange(18, 120)]
      };

      const result = validateForm(formData, rules);
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBeDefined();
      expect(result.errors.password).toBeDefined();
      expect(result.errors.age).toBeDefined();
    });

    test('handles async validation', async () => {
      const formData = { username: 'testuser' };
      
      const asyncValidator = async (value: string) => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(value === 'taken' ? 'Username is already taken' : true);
          }, 10);
        });
      };

      const rules = {
        username: [validateRequired, asyncValidator]
      };

      const result = await validateForm(formData, rules);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Individual Validators', () => {
    test('validateRequired', () => {
      expect(validateRequired('value')).toBe(true);
      expect(validateRequired('')).toBe('This field is required');
      expect(validateRequired(null)).toBe('This field is required');
      expect(validateRequired(undefined)).toBe('This field is required');
    });

    test('validateMinLength', () => {
      const validator = validateMinLength(5);
      expect(validator('hello')).toBe(true);
      expect(validator('hi')).toBe('Must be at least 5 characters long');
    });

    test('validateMaxLength', () => {
      const validator = validateMaxLength(10);
      expect(validator('hello')).toBe(true);
      expect(validator('this is too long')).toBe('Must be no more than 10 characters long');
    });

    test('validatePattern', () => {
      const validator = validatePattern(/^\d{3}-\d{3}-\d{4}$/);
      expect(validator('123-456-7890')).toBe(true);
      expect(validator('invalid')).toBe('Invalid format');
    });

    test('validateRange', () => {
      const validator = validateRange(18, 65);
      expect(validator(25)).toBe(true);
      expect(validator(15)).toBe('Must be between 18 and 65');
      expect(validator(70)).toBe('Must be between 18 and 65');
    });

    test('validateCustom', () => {
      const validator = validateCustom((value: string) => 
        value.includes('@') || 'Must contain @ symbol'
      );
      expect(validator('test@example.com')).toBe(true);
      expect(validator('invalid')).toBe('Must contain @ symbol');
    });
  });
});

describe('JSON Validation', () => {
  describe('validateJSON', () => {
    test('validates valid JSON strings', () => {
      expect(validateJSON('{"name": "John", "age": 30}')).toBe(true);
      expect(validateJSON('[]')).toBe(true);
      expect(validateJSON('null')).toBe(true);
    });

    test('rejects invalid JSON', () => {
      expect(validateJSON('{name: "John"}')).toBe(false); // Unquoted key
      expect(validateJSON('{"name": "John",}')).toBe(false); // Trailing comma
      expect(validateJSON('undefined')).toBe(false);
    });

    test('validates against schema', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        },
        required: ['name']
      };

      expect(validateJSON('{"name": "John", "age": 30}', schema)).toBe(true);
      expect(validateJSON('{"age": 30}', schema)).toBe(false); // Missing required name
    });
  });
});

describe('Input Sanitization', () => {
  describe('sanitizeInput', () => {
    test('removes dangerous HTML', () => {
      const input = '<script>alert("xss")</script>Hello';
      const sanitized = sanitizeInput(input);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('Hello');
    });

    test('preserves safe HTML', () => {
      const input = '<p>Hello <strong>world</strong></p>';
      const sanitized = sanitizeInput(input, { allowedTags: ['p', 'strong'] });
      expect(sanitized).toBe(input);
    });

    test('removes SQL injection attempts', () => {
      const input = "'; DROP TABLE users; --";
      const sanitized = sanitizeInput(input, { preventSQLInjection: true });
      expect(sanitized).not.toContain('DROP TABLE');
    });

    test('normalizes whitespace', () => {
      const input = '  Hello    world  ';
      const sanitized = sanitizeInput(input, { normalizeWhitespace: true });
      expect(sanitized).toBe('Hello world');
    });
  });
});

describe('Validator Factory', () => {
  describe('createValidator', () => {
    test('creates composite validators', () => {
      const emailValidator = createValidator([
        validateRequired,
        isEmail,
        validateMaxLength(254)
      ]);

      expect(emailValidator('test@example.com')).toBe(true);
      expect(emailValidator('')).toBe('This field is required');
      expect(emailValidator('invalid')).toBe('Invalid email address');
    });

    test('handles async validators', async () => {
      const asyncValidator = createValidator([
        validateRequired,
        async (value: string) => {
          return new Promise(resolve => {
            setTimeout(() => resolve(value.length > 5 || 'Too short'), 10);
          });
        }
      ]);

      expect(await asyncValidator('hello world')).toBe(true);
      expect(await asyncValidator('hi')).toBe('Too short');
    });

    test('stops on first error', () => {
      const validator = createValidator([
        validateRequired,
        validateMinLength(5),
        isEmail
      ]);

      // Should fail on first validation (required)
      expect(validator('')).toBe('This field is required');
      
      // Should fail on second validation (min length)
      expect(validator('hi')).toBe('Must be at least 5 characters long');
    });
  });
});

describe('Validators Default Export', () => {
  test('exports all validation functions', () => {
    expect(typeof validators.isEmail).toBe('function');
    expect(typeof validators.isURL).toBe('function');
    expect(typeof validators.validatePassword).toBe('function');
    expect(typeof validators.validateForm).toBe('function');
  });

  test('provides consistent API', () => {
    const emailResult = validators.isEmail('test@example.com');
    const directResult = isEmail('test@example.com');
    expect(emailResult).toBe(directResult);
  });
});

describe('Edge Cases and Error Handling', () => {
  test('handles null and undefined inputs', () => {
    expect(isEmail(null as any)).toBe(false);
    expect(isEmail(undefined as any)).toBe(false);
    expect(isURL('')).toBe(false);
    expect(isPhoneNumber(null as any)).toBe(false);
  });

  test('handles non-string inputs gracefully', () => {
    expect(isEmail(123 as any)).toBe(false);
    expect(isURL([] as any)).toBe(false);
    expect(isPhoneNumber({} as any)).toBe(false);
  });

  test('handles extremely long inputs', () => {
    const veryLongString = 'a'.repeat(10000);
    expect(() => isEmail(veryLongString)).not.toThrow();
    expect(() => isURL(veryLongString)).not.toThrow();
    expect(() => validatePassword(veryLongString)).not.toThrow();
  });

  test('handles special characters and unicode', () => {
    expect(isEmail('test@münchen.de')).toBe(true);
    expect(isURL('https://例え.テスト')).toBe(true);
    expect(sanitizeInput('Hello 世界 🌍')).toBe('Hello 世界 🌍');
  });
});

describe('Performance Tests', () => {
  test('validates large datasets efficiently', () => {
    const start = performance.now();
    const emails = Array.from({ length: 1000 }, (_, i) => `user${i}@example.com`);
    emails.forEach(email => isEmail(email));
    const end = performance.now();
    
    expect(end - start).toBeLessThan(100);
  });

  test('password validation is reasonably fast', () => {
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      validatePassword(`ComplexPassword${i}!`);
    }
    const end = performance.now();
    
    expect(end - start).toBeLessThan(500);
  });

  test('form validation handles large forms', () => {
    const formData: any = {};
    const rules: any = {};
    
    // Create a form with 100 fields
    for (let i = 0; i < 100; i++) {
      formData[`field${i}`] = `value${i}`;
      rules[`field${i}`] = [validateRequired, validateMinLength(3)];
    }
    
    const start = performance.now();
    validateForm(formData, rules);
    const end = performance.now();
    
    expect(end - start).toBeLessThan(100);
  });
});
