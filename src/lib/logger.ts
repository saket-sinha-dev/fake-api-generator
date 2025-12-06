/**
 * Logger utility for consistent logging across the application
 * Provides structured logging with different severity levels
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private shouldLog = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
  // Reserved for future production-specific logging behavior

  /**
   * Formats the log message with timestamp and context
   */
  private formatLog(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    let contextStr = '';
    if (context) {
      try {
        contextStr = ` | ${JSON.stringify(context)}`;
      } catch (error) {
        // Handle circular references or other JSON errors
        contextStr = ` | [Circular or Invalid JSON]`;
      }
    }
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  /**
   * Info level logging
   */
  info(message: string, context?: LogContext): void {
    if (this.shouldLog) {
      console.log(this.formatLog('info', message, context));
    }
  }

  /**
   * Warning level logging
   */
  warn(message: string, context?: LogContext): void {
    console.warn(this.formatLog('warn', message, context));
  }

  /**
   * Error level logging
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      ...(error instanceof Error && {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: this.shouldLog ? error.stack : undefined,
      }),
    };
    console.error(this.formatLog('error', message, errorContext));
  }

  /**
   * Debug level logging (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (this.shouldLog) {
      console.debug(this.formatLog('debug', message, context));
    }
  }

  /**
   * Log API request
   */
  logRequest(method: string, path: string, context?: LogContext): void {
    this.info(`${method} ${path}`, context);
  }

  /**
   * Log API response
   */
  logResponse(method: string, path: string, status: number, duration?: number): void {
    const context = duration ? { duration: `${duration}ms` } : undefined;
    this.info(`${method} ${path} - ${status}`, context);
  }

  /**
   * Log database operation
   */
  logDbOperation(operation: string, collection: string, context?: LogContext): void {
    this.debug(`DB ${operation} on ${collection}`, context);
  }

  /**
   * Log authentication event
   */
  logAuth(event: string, email?: string, success: boolean = true): void {
    this.info(`Auth: ${event}`, { email, success });
  }

  /**
   * Log validation error
   */
  logValidationError(field: string, error: string, context?: LogContext): void {
    this.warn(`Validation error on ${field}: ${error}`, context);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for use in other files
export type { LogLevel, LogContext };
