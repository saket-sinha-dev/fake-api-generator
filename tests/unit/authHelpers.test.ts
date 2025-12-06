/**
 * Unit Tests for Auth Helper Utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { hashPassword, verifyPassword, generateSessionToken } from '@/lib/authHelpers';
import * as bcrypt from 'bcryptjs';

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

describe('Auth Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash password', async () => {
      const password = 'testPassword123!';
      const mockHash = 'hashedPassword';
      
      (bcrypt.hash as any).mockResolvedValue(mockHash);
      
      const result = await hashPassword(password);
      
      expect(bcrypt.hash).toHaveBeenCalledWith(password, expect.any(Number));
      expect(result).toBe(mockHash);
    });

    it('should use correct salt rounds', async () => {
      const password = 'password123';
      (bcrypt.hash as any).mockResolvedValue('hash');
      
      await hashPassword(password);
      
      expect(bcrypt.hash).toHaveBeenCalled();
      const saltRounds = (bcrypt.hash as any).mock.calls[0][1];
      expect(saltRounds).toBeGreaterThanOrEqual(10);
    });

    it('should handle errors', async () => {
      const password = 'password';
      (bcrypt.hash as any).mockRejectedValue(new Error('Hash error'));
      
      await expect(hashPassword(password)).rejects.toThrow('Hash error');
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testPassword123!';
      const hash = 'hashedPassword';
      
      (bcrypt.compare as any).mockResolvedValue(true);
      
      const result = await verifyPassword(password, hash);
      
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
      expect(result).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'wrongPassword';
      const hash = 'hashedPassword';
      
      (bcrypt.compare as any).mockResolvedValue(false);
      
      const result = await verifyPassword(password, hash);
      
      expect(result).toBe(false);
    });

    it('should handle comparison errors', async () => {
      const password = 'password';
      const hash = 'hash';
      
      (bcrypt.compare as any).mockRejectedValue(new Error('Compare error'));
      
      await expect(verifyPassword(password, hash)).rejects.toThrow('Compare error');
    });
  });

  describe('generateSessionToken', () => {
    it('should generate token of correct length', () => {
      const token = generateSessionToken();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(20);
    });

    it('should generate unique tokens', () => {
      const token1 = generateSessionToken();
      const token2 = generateSessionToken();
      const token3 = generateSessionToken();
      
      expect(token1).not.toBe(token2);
      expect(token2).not.toBe(token3);
      expect(token1).not.toBe(token3);
    });

    it('should generate tokens with only valid characters', () => {
      const token = generateSessionToken();
      
      // Should only contain alphanumeric and some special chars (base64-like)
      const validPattern = /^[A-Za-z0-9+/=-]+$/;
      expect(validPattern.test(token)).toBe(true);
    });

    it('should generate multiple unique tokens', () => {
      const tokens = new Set();
      const count = 100;
      
      for (let i = 0; i < count; i++) {
        tokens.add(generateSessionToken());
      }
      
      expect(tokens.size).toBe(count);
    });
  });

  describe('password hashing consistency', () => {
    it('should produce different hashes for same password', async () => {
      const password = 'samePassword123!';
      
      (bcrypt.hash as any)
        .mockResolvedValueOnce('hash1')
        .mockResolvedValueOnce('hash2');
      
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      // Different due to different salts
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('edge cases', () => {
    it('should handle empty password', async () => {
      (bcrypt.hash as any).mockResolvedValue('emptyHash');
      
      const result = await hashPassword('');
      expect(result).toBe('emptyHash');
    });

    it('should handle very long passwords', async () => {
      const longPassword = 'a'.repeat(1000);
      (bcrypt.hash as any).mockResolvedValue('longHash');
      
      const result = await hashPassword(longPassword);
      expect(result).toBe('longHash');
      expect(bcrypt.hash).toHaveBeenCalledWith(longPassword, expect.any(Number));
    });

    it('should handle special characters in password', async () => {
      const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      (bcrypt.hash as any).mockResolvedValue('specialHash');
      
      const result = await hashPassword(specialPassword);
      expect(result).toBe('specialHash');
    });

    it('should verify with empty hash', async () => {
      (bcrypt.compare as any).mockResolvedValue(false);
      
      const result = await verifyPassword('password', '');
      expect(result).toBe(false);
    });
  });
});
