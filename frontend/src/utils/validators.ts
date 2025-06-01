/**
 * Validation Utilities
 * Comprehensive validation functions for forms, data, and user inputs
 */

// Email validation with comprehensive regex
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email.trim().toLowerCase());
};

// URL validation with protocol support
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Phone number validation (flexible international format)
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  return phoneRegex.test(cleaned);
};

// Password strength validation
export interface PasswordStrength {
  isValid: boolean;
  score: number; // 0-4
  feedback: string[];
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumbers: boolean;
    hasSpecialChars: boolean;
  };
}

export const validatePassword = (
  password: string,
  minLength: number = 8
): PasswordStrength => {
  const requirements = {
    minLength: password.length >= minLength,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const feedback: string[] = [];
  let score = 0;

  if (!requirements.minLength) {
    feedback.push(`Password must be at least ${minLength} characters long`);
  } else {
    score++;
  }

  if (!requirements.hasUppercase) {
    feedback.push('Password must contain at least one uppercase letter');
  } else {
    score++;
  }

  if (!requirements.hasLowercase) {
    feedback.push('Password must contain at least one lowercase letter');
  } else {
    score++;
  }

  if (!requirements.hasNumbers) {
    feedback.push('Password must contain at least one number');
  } else {
    score++;
  }

  if (!requirements.hasSpecialChars) {
    feedback.push('Password must contain at least one special character');
  } else {
    score++;
  }

  // Additional strength checks
  if (password.length >= 12) score += 0.5;
  if (/(.)\1{2,}/.test(password)) {
    feedback.push('Avoid repeating characters');
    score -= 0.5;
  }

  const isValid = Object.values(requirements).every(Boolean);

  return {
    isValid,
    score: Math.max(0, Math.min(4, Math.floor(score))),
    feedback,
    requirements,
  };
};

// File validation
export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  allowedExtensions?: string[];
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  file: File;
}

export const validateFile = async (
  file: File,
  options: FileValidationOptions = {}
): Promise<FileValidationResult> => {
  const errors: string[] = [];

  // Size validation
  if (options.maxSize && file.size > options.maxSize) {
    errors.push(`File size must be less than ${formatFileSize(options.maxSize)}`);
  }

  // Type validation
  if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  // Extension validation
  if (options.allowedExtensions) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !options.allowedExtensions.includes(extension)) {
      errors.push(`File extension .${extension} is not allowed`);
    }
  }

  // Image dimension validation
  if (file.type.startsWith('image/') && (
    options.minWidth || options.minHeight || options.maxWidth || options.maxHeight
  )) {
    try {
      const dimensions = await getImageDimensions(file);
      
      if (options.minWidth && dimensions.width < options.minWidth) {
        errors.push(`Image width must be at least ${options.minWidth}px`);
      }
      
      if (options.minHeight && dimensions.height < options.minHeight) {
        errors.push(`Image height must be at least ${options.minHeight}px`);
      }
      
      if (options.maxWidth && dimensions.width > options.maxWidth) {
        errors.push(`Image width must be less than ${options.maxWidth}px`);
      }
      
      if (options.maxHeight && dimensions.height > options.maxHeight) {
        errors.push(`Image height must be less than ${options.maxHeight}px`);
      }
    } catch (error) {
      errors.push('Could not validate image dimensions');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    file,
  };
};

// Helper function to get image dimensions
const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load image'));
    };
    
    img.src = url;
  });
};

// Helper function for file size formatting
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// JSON validation
export const isValidJSON = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

// Credit card validation (Luhn algorithm)
export const isValidCreditCard = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\s/g, '');
  
  if (!/^\d+$/.test(cleaned)) return false;
  
  let sum = 0;
  let shouldDouble = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return sum % 10 === 0;
};

// IP address validation
export const isValidIPAddress = (ip: string): boolean => {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

// Domain name validation
export const isValidDomain = (domain: string): boolean => {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/;
  return domainRegex.test(domain);
};

// Hex color validation
export const isValidHexColor = (color: string): boolean => {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
};

// Username validation
export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};

// Date validation
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

// Age validation
export const isValidAge = (birthDate: string | Date, minAge: number = 13): boolean => {
  const birth = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= minAge;
  }
  
  return age >= minAge;
};

// Social Security Number validation (US format)
export const isValidSSN = (ssn: string): boolean => {
  const cleaned = ssn.replace(/\D/g, '');
  const ssnRegex = /^(?!666|000|9\d{2})\d{3}(?!00)\d{2}(?!0000)\d{4}$/;
  return ssnRegex.test(cleaned);
};

// Postal code validation (multiple countries)
export const isValidPostalCode = (postalCode: string, country: string = 'US'): boolean => {
  const patterns: Record<string, RegExp> = {
    US: /^\d{5}(-\d{4})?$/,
    CA: /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/,
    UK: /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/,
    DE: /^\d{5}$/,
    FR: /^\d{5}$/,
    JP: /^\d{3}-\d{4}$/,
    AU: /^\d{4}$/,
  };
  
  const pattern = patterns[country.toUpperCase()];
  return pattern ? pattern.test(postalCode) : true;
};

// Custom validation rule interface
export interface ValidationRule<T = any> {
  validate: (value: T) => boolean;
  message: string;
}

// Generic validator that applies multiple rules
export const validateWithRules = <T = any>(
  value: T,
  rules: ValidationRule<T>[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  for (const rule of rules) {
    if (!rule.validate(value)) {
      errors.push(rule.message);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Common validation rules
export const ValidationRules = {
  required: <T>(message: string = 'This field is required'): ValidationRule<T> => ({
    validate: (value: T) => value != null && value !== '' && value !== undefined,
    message,
  }),
  
  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validate: (value: string) => value.length >= min,
    message: message || `Must be at least ${min} characters long`,
  }),
  
  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validate: (value: string) => value.length <= max,
    message: message || `Must be no more than ${max} characters long`,
  }),
  
  pattern: (regex: RegExp, message: string): ValidationRule<string> => ({
    validate: (value: string) => regex.test(value),
    message,
  }),
  
  email: (message: string = 'Please enter a valid email address'): ValidationRule<string> => ({
    validate: isValidEmail,
    message,
  }),
  
  url: (message: string = 'Please enter a valid URL'): ValidationRule<string> => ({
    validate: isValidUrl,
    message,
  }),
  
  numeric: (message: string = 'Must be a number'): ValidationRule<string> => ({
    validate: (value: string) => !isNaN(Number(value)),
    message,
  }),
  
  integer: (message: string = 'Must be a whole number'): ValidationRule<string> => ({
    validate: (value: string) => Number.isInteger(Number(value)),
    message,
  }),
  
  min: (min: number, message?: string): ValidationRule<number> => ({
    validate: (value: number) => value >= min,
    message: message || `Must be at least ${min}`,
  }),
  
  max: (max: number, message?: string): ValidationRule<number> => ({
    validate: (value: number) => value <= max,
    message: message || `Must be no more than ${max}`,
  }),
} as const;

// Export all validators as a grouped object
export const Validators = {
  isValidEmail,
  isValidUrl,
  isValidPhoneNumber,
  validatePassword,
  validateFile,
  isValidJSON,
  isValidCreditCard,
  isValidIPAddress,
  isValidDomain,
  isValidHexColor,
  isValidUsername,
  isValidDate,
  isValidAge,
  isValidSSN,
  isValidPostalCode,
  validateWithRules,
  rules: ValidationRules,
} as const;
