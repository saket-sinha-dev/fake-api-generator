/**
 * Application-wide constants
 * Centralized configuration for maintainability and consistency
 */

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Not found',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  INVALID_INPUT: 'Invalid input provided',
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  RESOURCE_NOT_FOUND: 'Resource not found',
  PROJECT_NOT_FOUND: 'Project not found',
  API_NOT_FOUND: 'API not found',
  USER_NOT_FOUND: 'User not found',
  DUPLICATE_RESOURCE: 'Resource already exists',
  DUPLICATE_API: 'API endpoint already exists',
  INVALID_EMAIL: 'Invalid email address',
  INVALID_PASSWORD: 'Invalid password format',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long',
  PASSWORD_WEAK: 'Password must contain at least one letter and one number',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  INVALID_JSON: 'Invalid JSON format',
  EMAIL_PASSWORD_REQUIRED: 'Email and password are required',
  INVALID_CREDENTIALS: 'Invalid email or password',
  OAUTH_ONLY: 'Please sign in with Google',
  TOKEN_REQUIRED: 'Token and new password are required',
  TOKEN_INVALID_EXPIRED: 'Invalid or expired reset token',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  PASSWORD_RESET_SENT: 'Password reset link has been sent to your email!',
  PASSWORD_RESET_SUCCESS: 'Password reset successful! Redirecting...',
  ACCOUNT_CREATED: 'Account created successfully!',
  EMAIL_VERIFIED: 'Email verified successfully',
} as const;

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  RESOURCE_NAME_REGEX: /^[a-z][a-z0-9_-]*$/,
  MAX_QUERY_PARAM_LENGTH: 1000,
  MAX_JSON_SIZE: 1024 * 1024, // 1MB
} as const;

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// User Roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

// Project Roles
export const PROJECT_ROLES = {
  OWNER: 'owner',
  COLLABORATOR: 'collaborator',
} as const;

// HTTP Methods
export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] as const;

// Field Types
export const FIELD_TYPES = [
  'string',
  'number',
  'boolean',
  'date',
  'email',
  'uuid',
  'image',
  'relation',
] as const;

// Conditional Operators
export const CONDITIONAL_OPERATORS = [
  'equals',
  'notEquals',
  'contains',
  'greaterThan',
  'lessThan',
  'exists',
] as const;

// Conditional Types
export const CONDITIONAL_TYPES = ['header', 'query', 'body', 'dependentApi'] as const;

// Token Expiry
export const TOKEN_EXPIRY = {
  PASSWORD_RESET: 60 * 60 * 1000, // 1 hour in milliseconds
  EMAIL_VERIFICATION: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// Rate Limiting (for future implementation)
export const RATE_LIMITS = {
  API_REQUESTS_PER_MINUTE: 60,
  PASSWORD_RESET_PER_HOUR: 3,
  SIGNUP_PER_HOUR: 5,
} as const;

// MongoDB Collection Names
export const COLLECTIONS = {
  USERS: 'userprofiles',
  PROJECTS: 'projects',
  RESOURCES: 'resources',
  APIS: 'apis',
  DATABASES: 'databases',
} as const;
