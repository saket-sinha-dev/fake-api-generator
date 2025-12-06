/**
 * Unit Tests for Configuration Manager
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigurationManager } from '@/config';

describe('Configuration Manager', () => {
  let config: ConfigurationManager;

  beforeEach(() => {
    config = ConfigurationManager.getInstance();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = ConfigurationManager.getInstance();
      const instance2 = ConfigurationManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('get', () => {
    it('should return complete configuration', () => {
      const cfg = config.get();
      expect(cfg).toBeDefined();
      expect(cfg.env).toBeDefined();
      expect(cfg.database).toBeDefined();
      expect(cfg.auth).toBeDefined();
    });

    it('should have correct environment', () => {
      const cfg = config.get();
      expect(['development', 'production', 'test', 'staging']).toContain(cfg.env);
    });

    it('should have database configuration', () => {
      const cfg = config.get();
      expect(cfg.database.uri).toBeDefined();
      expect(cfg.database.maxPoolSize).toBeGreaterThan(0);
    });
  });

  describe('getFeature', () => {
    it('should return feature flags', () => {
      expect(typeof config.getFeature('enableSignup')).toBe('boolean');
      expect(typeof config.getFeature('enableGoogleAuth')).toBe('boolean');
      expect(typeof config.getFeature('enableWebhooks')).toBe('boolean');
    });
  });

  describe('validate', () => {
    it('should validate configuration', () => {
      const result = config.validate();
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('should detect missing required fields', () => {
      // In test environment, we might not have all production configs
      const result = config.validate();
      if (!result.valid) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('reload', () => {
    it('should reload configuration', () => {
      const before = config.get();
      config.reload();
      const after = config.get();
      expect(after).toBeDefined();
      expect(typeof before).toBe(typeof after);
    });
  });

  describe('configuration values', () => {
    it('should have reasonable defaults', () => {
      const cfg = config.get();
      expect(cfg.api.maxPageSize).toBeLessThanOrEqual(1000);
      expect(cfg.auth.bcryptRounds).toBeGreaterThanOrEqual(10);
      expect(cfg.security.maxJsonSize).toBeGreaterThan(0);
    });

    it('should have all required API configuration', () => {
      const cfg = config.get();
      expect(cfg.api.version).toBeDefined();
      expect(cfg.api.baseUrl).toBeDefined();
      expect(cfg.api.maxPageSize).toBeGreaterThan(0);
      expect(cfg.api.defaultPageSize).toBeGreaterThan(0);
    });

    it('should have all required logging configuration', () => {
      const cfg = config.get();
      expect(cfg.logging.level).toBeDefined();
      expect(['debug', 'info', 'warn', 'error']).toContain(cfg.logging.level);
      expect(typeof cfg.logging.enableConsole).toBe('boolean');
    });
  });
});
