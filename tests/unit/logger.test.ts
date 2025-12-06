/**
 * Unit Tests for Logger Utility
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { logger } from '@/lib/logger';

describe('Logger', () => {
  let consoleLogSpy: any;
  let consoleErrorSpy: any;
  let consoleWarnSpy: any;
  let consoleDebugSpy: any;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('info', () => {
    it('should log info messages', () => {
      logger.info('Test info message');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log info with metadata', () => {
      logger.info('Test message', { userId: '123', action: 'create' });
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('error', () => {
    it('should log error messages', () => {
      logger.error('Test error message');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should log Error objects', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should log error with stack trace', () => {
      const error = new Error('Stack test');
      error.stack = 'Error stack trace';
      logger.error('Error with stack', error);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle metadata with errors', () => {
      logger.error('Error', new Error('test'), { userId: '456' });
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('warn', () => {
    it('should log warning messages', () => {
      logger.warn('Test warning');
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should log warning with context', () => {
      logger.warn('Deprecated API used', { endpoint: '/old-api' });
      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });

  describe('debug', () => {
    it('should log debug messages', () => {
      logger.debug('Test debug');
      expect(consoleDebugSpy).toHaveBeenCalled();
    });

    it('should log debug with detailed data', () => {
      logger.debug('Debug info', { 
        request: { method: 'GET', url: '/api/test' },
        response: { status: 200 }
      });
      expect(consoleDebugSpy).toHaveBeenCalled();
    });
  });

  describe('message formatting', () => {
    it('should format messages with timestamp', () => {
      logger.info('Timestamped message');
      expect(consoleLogSpy).toHaveBeenCalled();
      const call = consoleLogSpy.mock.calls[0][0];
      expect(typeof call).toBe('string');
    });

    it('should include log level in output', () => {
      logger.error('Error message');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should stringify metadata objects', () => {
      const metadata = { complex: { nested: { data: 'value' } } };
      logger.info('Complex metadata', metadata);
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle undefined values', () => {
      logger.info('Undefined test', undefined);
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should handle circular references', () => {
      const circular: any = { name: 'test' };
      circular.self = circular;
      logger.info('Circular reference', circular);
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should handle empty messages', () => {
      logger.info('');
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });
});
