/**
 * Validation utilities for input sanitization and validation
 * Enterprise-grade validation with comprehensive error handling
 */

import { ERROR_MESSAGES, VALIDATION } from './constants';

/**
 * Validates email format
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: ERROR_MESSAGES.INVALID_EMAIL };
  }

  const trimmedEmail = email.trim();
  if (!VALIDATION.EMAIL_REGEX.test(trimmedEmail)) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_EMAIL };
  }

  return { valid: true };
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: ERROR_MESSAGES.INVALID_PASSWORD };
  }

  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    return { valid: false, error: ERROR_MESSAGES.PASSWORD_TOO_SHORT };
  }

  if (!VALIDATION.PASSWORD_REGEX.test(password)) {
    return { valid: false, error: ERROR_MESSAGES.PASSWORD_WEAK };
  }

  return { valid: true };
}

/**
 * Validates resource name format
 */
export function validateResourceName(name: string): { valid: boolean; error?: string } {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Resource name is required' };
  }

  const trimmedName = name.trim().toLowerCase();
  
  if (trimmedName.length === 0) {
    return { valid: false, error: 'Resource name cannot be empty' };
  }

  if (trimmedName.includes('/')) {
    return { 
      valid: false, 
      error: 'Resource name cannot contain slashes. Use Custom APIs for multi-segment paths.' 
    };
  }

  if (!VALIDATION.RESOURCE_NAME_REGEX.test(trimmedName)) {
    return { 
      valid: false, 
      error: 'Resource name must start with a letter and contain only lowercase letters, numbers, hyphens, or underscores' 
    };
  }

  return { valid: true };
}

/**
 * Validates JSON string
 */
export function validateJSON(jsonString: string): { valid: boolean; error?: string; data?: any } {
  if (!jsonString || jsonString.trim() === '') {
    return { valid: true, data: null }; // Empty JSON is valid (optional)
  }

  try {
    const parsed = JSON.parse(jsonString);
    
    // Check size
    if (JSON.stringify(parsed).length > VALIDATION.MAX_JSON_SIZE) {
      return { valid: false, error: 'JSON payload too large (max 1MB)' };
    }

    return { valid: true, data: parsed };
  } catch (error) {
    return { 
      valid: false, 
      error: ERROR_MESSAGES.INVALID_JSON + '. Check for syntax errors, missing commas, or quotes.' 
    };
  }
}

/**
 * Sanitizes string input to prevent XSS and injection attacks
 */
export function sanitizeString(input: string, maxLength?: number): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers

  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Validates MongoDB ObjectId format
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Validates UUID format
 */
export function isValidUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
}

/**
 * Validates HTTP status code
 */
export function isValidStatusCode(code: number): boolean {
  return Number.isInteger(code) && code >= 100 && code < 600;
}

/**
 * Validates API path format
 */
export function validateApiPath(path: string): { valid: boolean; error?: string } {
  if (!path || typeof path !== 'string') {
    return { valid: false, error: 'API path is required' };
  }

  // Check for whitespace before trimming (to catch paths like '/   ')
  if (/\s/.test(path)) {
    return { valid: false, error: 'API path contains invalid characters' };
  }

  const trimmedPath = path.trim();
  
  if (trimmedPath.length === 0) {
    return { valid: false, error: 'API path cannot be empty' };
  }

  // Path should start with /
  if (!trimmedPath.startsWith('/')) {
    return { valid: false, error: 'API path must start with /' };
  }

  // Check for other invalid characters
  if (/[<>'"\\]/.test(trimmedPath)) {
    return { valid: false, error: 'API path contains invalid characters' };
  }

  return { valid: true };
}

/**
 * Validates pagination parameters
 */
export function validatePagination(page?: string, limit?: string): {
  page: number;
  limit: number;
  error?: string;
} {
  const defaultPage = 1;
  const defaultLimit = 10;
  const maxLimit = 100;

  let parsedPage = defaultPage;
  let parsedLimit = defaultLimit;

  if (page) {
    parsedPage = parseInt(page, 10);
    if (isNaN(parsedPage) || parsedPage < 1) {
      return { page: defaultPage, limit: defaultLimit, error: 'Invalid page number' };
    }
  }

  if (limit) {
    parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      return { page: parsedPage, limit: defaultLimit, error: 'Invalid limit' };
    }
    if (parsedLimit > maxLimit) {
      parsedLimit = maxLimit;
    }
  }

  return { page: parsedPage, limit: parsedLimit };
}

/**
 * Validates required fields in an object
 */
export function validateRequiredFields<T extends Record<string, any>>(
  obj: T,
  requiredFields: (keyof T)[]
): { valid: boolean; error?: string; missing?: string[] } {
  const missing: string[] = [];

  for (const field of requiredFields) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
      missing.push(String(field));
    }
  }

  if (missing.length > 0) {
    return {
      valid: false,
      error: `${ERROR_MESSAGES.MISSING_REQUIRED_FIELDS}: ${missing.join(', ')}`,
      missing,
    };
  }

  return { valid: true };
}

/**
 * Validates HTTP method
 */
export function isValidHttpMethod(method: string): boolean {
  const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];
  return validMethods.includes(method.toUpperCase());
}

/**
 * Validates field type
 */
export function isValidFieldType(type: string): boolean {
  const validTypes = ['string', 'number', 'boolean', 'date', 'email', 'uuid', 'image', 'relation'];
  return validTypes.includes(type);
}
