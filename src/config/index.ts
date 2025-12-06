/**
 * Application Configuration Management
 * Centralized configuration following the 12-factor app methodology
 * Single Responsibility: Manage all application configuration
 */

export interface AppConfig {
  // Environment
  env: 'development' | 'production' | 'test' | 'staging';
  port: number;
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;

  // Database
  database: {
    uri: string;
    maxPoolSize: number;
    minPoolSize: number;
    serverSelectionTimeout: number;
    socketTimeout: number;
    retryWrites: boolean;
  };

  // Authentication
  auth: {
    secret: string;
    sessionMaxAge: number;
    bcryptRounds: number;
    trustHost: boolean;
    google?: {
      clientId: string;
      clientSecret: string;
    };
  };

  // Email
  email: {
    enabled: boolean;
    smtp: {
      host: string;
      port: number;
      secure: boolean;
      user: string;
      pass: string;
    };
    from: string;
    replyTo: string;
  };

  // Rate Limiting
  rateLimit: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
  };

  // Security
  security: {
    corsOrigins: string[];
    maxJsonSize: number;
    maxFileSize: number;
    allowedFileTypes: string[];
  };

  // Logging
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableConsole: boolean;
    enableFile: boolean;
    filePath?: string;
  };

  // Features
  features: {
    enableSignup: boolean;
    enableGoogleAuth: boolean;
    enableEmailVerification: boolean;
    enableWebhooks: boolean;
    enableConditionalResponses: boolean;
  };

  // API
  api: {
    version: string;
    baseUrl: string;
    maxPageSize: number;
    defaultPageSize: number;
    timeout: number;
  };

  // Testing
  testing?: {
    mockExternalServices: boolean;
    seedDatabase: boolean;
    cleanupAfterTests: boolean;
  };
}

class ConfigurationManager {
  private static instance: ConfigurationManager;
  private config: AppConfig;

  private constructor() {
    this.config = this.loadConfiguration();
  }

  public static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  private loadConfiguration(): AppConfig {
    const env = (process.env.NODE_ENV as AppConfig['env']) || 'development';

    return {
      env,
      port: parseInt(process.env.PORT || '3000', 10),
      isDevelopment: env === 'development',
      isProduction: env === 'production',
      isTest: env === 'test',

      database: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/fake-api-generator',
        maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '10', 10),
        minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE || '2', 10),
        serverSelectionTimeout: parseInt(process.env.DB_TIMEOUT || '5000', 10),
        socketTimeout: parseInt(process.env.DB_SOCKET_TIMEOUT || '45000', 10),
        retryWrites: process.env.DB_RETRY_WRITES !== 'false',
      },

      auth: {
        secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'change-me-in-production',
        sessionMaxAge: parseInt(process.env.SESSION_MAX_AGE || '2592000', 10), // 30 days
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
        trustHost: process.env.AUTH_TRUST_HOST !== 'false',
        google: process.env.GOOGLE_CLIENT_ID
          ? {
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            }
          : undefined,
      },

      email: {
        enabled: process.env.SMTP_USER && process.env.SMTP_PASS ? true : false,
        smtp: {
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: process.env.SMTP_SECURE === 'true',
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || '',
        },
        from: process.env.EMAIL_FROM || 'noreply@fakeapi.com',
        replyTo: process.env.EMAIL_REPLY_TO || 'support@fakeapi.com',
      },

      rateLimit: {
        enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minute
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
        skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESS === 'true',
      },

      security: {
        corsOrigins: (process.env.CORS_ORIGINS || '*').split(','),
        maxJsonSize: parseInt(process.env.MAX_JSON_SIZE || '1048576', 10), // 1MB
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
        allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'json,txt,csv').split(','),
      },

      logging: {
        level: (process.env.LOG_LEVEL as AppConfig['logging']['level']) || 'info',
        enableConsole: process.env.LOG_CONSOLE !== 'false',
        enableFile: process.env.LOG_FILE === 'true',
        filePath: process.env.LOG_FILE_PATH,
      },

      features: {
        enableSignup: process.env.FEATURE_SIGNUP !== 'false',
        enableGoogleAuth: !!process.env.GOOGLE_CLIENT_ID,
        enableEmailVerification: process.env.FEATURE_EMAIL_VERIFICATION === 'true',
        enableWebhooks: process.env.FEATURE_WEBHOOKS !== 'false',
        enableConditionalResponses: process.env.FEATURE_CONDITIONAL_RESPONSES !== 'false',
      },

      api: {
        version: process.env.API_VERSION || 'v1',
        baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
        maxPageSize: parseInt(process.env.API_MAX_PAGE_SIZE || '100', 10),
        defaultPageSize: parseInt(process.env.API_DEFAULT_PAGE_SIZE || '10', 10),
        timeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
      },

      testing: env === 'test'
        ? {
            mockExternalServices: process.env.TEST_MOCK_SERVICES !== 'false',
            seedDatabase: process.env.TEST_SEED_DB === 'true',
            cleanupAfterTests: process.env.TEST_CLEANUP !== 'false',
          }
        : undefined,
    };
  }

  public get(): AppConfig {
    return this.config;
  }

  public reload(): void {
    this.config = this.loadConfiguration();
  }

  public getFeature(feature: keyof AppConfig['features']): boolean {
    return this.config.features[feature];
  }

  public validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!this.config.database.uri) {
      errors.push('MONGODB_URI is required');
    }

    if (this.config.isProduction && this.config.auth.secret === 'change-me-in-production') {
      errors.push('AUTH_SECRET must be set in production');
    }

    if (this.config.features.enableGoogleAuth && !this.config.auth.google) {
      errors.push('Google OAuth credentials are required when enableGoogleAuth is true');
    }

    if (this.config.email.enabled && !this.config.email.smtp.user) {
      errors.push('SMTP credentials are required when email is enabled');
    }

    // Validation rules
    if (this.config.auth.bcryptRounds < 10) {
      errors.push('BCRYPT_ROUNDS must be at least 10');
    }

    if (this.config.api.maxPageSize > 1000) {
      errors.push('API_MAX_PAGE_SIZE should not exceed 1000');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const config = ConfigurationManager.getInstance();

// Export for testing
export { ConfigurationManager };
