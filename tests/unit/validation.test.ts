/**
 * Unit Tests for Validation Utilities
 * Tests all validation functions with edge cases
 */

import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateResourceName,
  validateJSON,
  sanitizeString,
  isValidObjectId,
  isValidUUID,
  isValidStatusCode,
  validateApiPath,
  validatePagination,
  validateRequiredFields,
  isValidHttpMethod,
  isValidFieldType,
} from '@/lib/validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com').valid).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk').valid).toBe(true);
      expect(validateEmail('test123@test-domain.com').valid).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid').valid).toBe(false);
      expect(validateEmail('test@').valid).toBe(false);
      expect(validateEmail('@example.com').valid).toBe(false);
      expect(validateEmail('test @example.com').valid).toBe(false);
      expect(validateEmail('').valid).toBe(false);
    });

    it('should handle null and undefined', () => {
      expect(validateEmail(null as any).valid).toBe(false);
      expect(validateEmail(undefined as any).valid).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      expect(validatePassword('Test1234').valid).toBe(true);
      expect(validatePassword('Password123!').valid).toBe(true);
      expect(validatePassword('aB3#5678').valid).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(validatePassword('short').valid).toBe(false);
      expect(validatePassword('12345678').valid).toBe(false);
      expect(validatePassword('abcdefgh').valid).toBe(false);
      expect(validatePassword('').valid).toBe(false);
    });

    it('should require minimum 8 characters', () => {
      expect(validatePassword('Test123').valid).toBe(false);
      expect(validatePassword('Test1234').valid).toBe(true);
    });

    it('should require letter and number', () => {
      expect(validatePassword('password').valid).toBe(false);
      expect(validatePassword('12345678').valid).toBe(false);
      expect(validatePassword('Pass1234').valid).toBe(true);
    });
  });

  describe('validateResourceName', () => {
    it('should validate correct resource names', () => {
      expect(validateResourceName('users').valid).toBe(true);
      expect(validateResourceName('products').valid).toBe(true);
      expect(validateResourceName('user-profiles').valid).toBe(true);
      expect(validateResourceName('user_items').valid).toBe(true);
    });

    it('should reject invalid resource names', () => {
      expect(validateResourceName('').valid).toBe(false);
      expect(validateResourceName('User!').valid).toBe(false);
      expect(validateResourceName('users/items').valid).toBe(false);
      expect(validateResourceName('123users').valid).toBe(false);
    });

    it('should reject names with slashes', () => {
      const result = validateResourceName('users/profile');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('slashes');
    });
  });

  describe('validateJSON', () => {
    it('should validate correct JSON', () => {
      expect(validateJSON('{"key": "value"}').valid).toBe(true);
      expect(validateJSON('[]').valid).toBe(true);
      expect(validateJSON('null').valid).toBe(true);
      expect(validateJSON('true').valid).toBe(true);
      expect(validateJSON('123').valid).toBe(true);
    });

    it('should reject invalid JSON', () => {
      expect(validateJSON('{invalid}').valid).toBe(false);
      expect(validateJSON('{"key": value}').valid).toBe(false);
      expect(validateJSON("{'key': 'value'}").valid).toBe(false);
    });

    it('should allow empty JSON', () => {
      expect(validateJSON('').valid).toBe(true);
      expect(validateJSON('  ').valid).toBe(true);
    });

    it('should parse and return data', () => {
      const result = validateJSON('{"key": "value"}');
      expect(result.valid).toBe(true);
      expect(result.data).toEqual({ key: 'value' });
    });
  });

  describe('sanitizeString', () => {
    it('should remove HTML tags', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(sanitizeString('<b>Bold</b>')).toBe('bBold/b');
    });

    it('should remove javascript: protocol', () => {
      expect(sanitizeString('javascript:alert(1)')).toBe('alert(1)');
    });

    it('should remove event handlers', () => {
      expect(sanitizeString('onclick=alert(1)')).toBe('alert(1)');
      expect(sanitizeString('onload=malicious()')).toBe('malicious()');
    });

    it('should trim whitespace', () => {
      expect(sanitizeString('  test  ')).toBe('test');
    });

    it('should respect max length', () => {
      expect(sanitizeString('12345678901234567890', 10)).toBe('1234567890');
    });

    it('should handle empty strings', () => {
      expect(sanitizeString('')).toBe('');
      expect(sanitizeString(null as any)).toBe('');
    });
  });

  describe('isValidObjectId', () => {
    it('should validate correct ObjectIds', () => {
      expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
      expect(isValidObjectId('5f7b1a2c3d4e5f6a7b8c9d0e')).toBe(true);
    });

    it('should reject invalid ObjectIds', () => {
      expect(isValidObjectId('invalid')).toBe(false);
      expect(isValidObjectId('507f1f77')).toBe(false);
      expect(isValidObjectId('507f1f77bcf86cd799439011Z')).toBe(false);
    });
  });

  describe('isValidUUID', () => {
    it('should validate correct UUIDs', () => {
      expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      expect(isValidUUID('invalid')).toBe(false);
      expect(isValidUUID('123e4567-e89b-12d3-a456')).toBe(false);
    });
  });

  describe('isValidStatusCode', () => {
    it('should validate HTTP status codes', () => {
      expect(isValidStatusCode(200)).toBe(true);
      expect(isValidStatusCode(404)).toBe(true);
      expect(isValidStatusCode(500)).toBe(true);
    });

    it('should reject invalid status codes', () => {
      expect(isValidStatusCode(99)).toBe(false);
      expect(isValidStatusCode(600)).toBe(false);
      expect(isValidStatusCode(-1)).toBe(false);
    });
  });

  describe('validateApiPath', () => {
    it('should validate correct API paths', () => {
      expect(validateApiPath('/api/users').valid).toBe(true);
      expect(validateApiPath('/api/v1/products').valid).toBe(true);
      expect(validateApiPath('/users/:id').valid).toBe(true);
    });

    it('should reject paths without leading slash', () => {
      expect(validateApiPath('api/users').valid).toBe(false);
    });

    it('should reject empty paths', () => {
      expect(validateApiPath('').valid).toBe(false);
    });

    it('should reject paths with invalid characters', () => {
      expect(validateApiPath('/api/<script>').valid).toBe(false);
    });
  });

  describe('validatePagination', () => {
    it('should return defaults for no input', () => {
      const result = validatePagination();
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should parse valid pagination', () => {
      const result = validatePagination('2', '20');
      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
    });

    it('should enforce maximum limit', () => {
      const result = validatePagination('1', '200');
      expect(result.limit).toBe(100);
    });

    it('should handle invalid inputs', () => {
      const result = validatePagination('invalid', 'invalid');
      expect(result.error).toBeDefined();
    });
  });

  describe('validateRequiredFields', () => {
    it('should validate all required fields present', () => {
      const obj = { name: 'test', email: 'test@example.com' };
      const result = validateRequiredFields(obj, ['name', 'email']);
      expect(result.valid).toBe(true);
    });

    it('should detect missing fields', () => {
      const obj = { name: 'test' };
      const result = validateRequiredFields(obj, ['name', 'email']);
      expect(result.valid).toBe(false);
      expect(result.missing).toContain('email');
    });

    it('should handle empty values', () => {
      const obj = { name: '', email: null };
      const result = validateRequiredFields(obj, ['name', 'email']);
      expect(result.valid).toBe(false);
      expect(result.missing?.length).toBe(2);
    });
  });

  describe('isValidHttpMethod', () => {
    it('should validate correct HTTP methods', () => {
      expect(isValidHttpMethod('GET')).toBe(true);
      expect(isValidHttpMethod('POST')).toBe(true);
      expect(isValidHttpMethod('PUT')).toBe(true);
      expect(isValidHttpMethod('DELETE')).toBe(true);
      expect(isValidHttpMethod('PATCH')).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(isValidHttpMethod('get')).toBe(true);
      expect(isValidHttpMethod('post')).toBe(true);
    });

    it('should reject invalid methods', () => {
      expect(isValidHttpMethod('INVALID')).toBe(false);
      expect(isValidHttpMethod('')).toBe(false);
    });
  });

  describe('isValidFieldType', () => {
    it('should validate correct field types', () => {
      expect(isValidFieldType('string')).toBe(true);
      expect(isValidFieldType('number')).toBe(true);
      expect(isValidFieldType('boolean')).toBe(true);
      expect(isValidFieldType('date')).toBe(true);
      expect(isValidFieldType('email')).toBe(true);
      expect(isValidFieldType('uuid')).toBe(true);
      expect(isValidFieldType('image')).toBe(true);
      expect(isValidFieldType('relation')).toBe(true);
    });

    it('should reject invalid field types', () => {
      expect(isValidFieldType('invalid')).toBe(false);
      expect(isValidFieldType('')).toBe(false);
    });
  });
});
