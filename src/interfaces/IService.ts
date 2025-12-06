/**
 * Base service interface
 * Services encapsulate business logic and coordinate between repositories
 * Following the Single Responsibility Principle
 */
export interface IService {
  /**
   * Service name for identification
   */
  getName(): string;
}

/**
 * Result wrapper for service operations
 * Provides consistent error handling and response structure
 */
export interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  field?: string;
}
