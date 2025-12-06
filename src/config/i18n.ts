/**
 * Internationalization (i18n) Strings Configuration
 * All user-facing strings in one place for easy localization
 * Single Responsibility: Manage all application strings
 */

export type Locale = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh';

export interface I18nStrings {
  // Common
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    update: string;
    search: string;
    loading: string;
    success: string;
    error: string;
    warning: string;
    info: string;
    yes: string;
    no: string;
    confirm: string;
    back: string;
    next: string;
    previous: string;
    submit: string;
    close: string;
  };

  // Authentication
  auth: {
    signIn: string;
    signUp: string;
    signOut: string;
    email: string;
    password: string;
    forgotPassword: string;
    resetPassword: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    mobile: string;
    rememberMe: string;
    orSignInWith: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    createAccount: string;
    welcomeBack: string;
    getStarted: string;
  };

  // Validation
  validation: {
    required: string;
    invalidEmail: string;
    invalidPassword: string;
    passwordTooShort: string;
    passwordsDoNotMatch: string;
    invalidFormat: string;
    tooLong: string;
    tooShort: string;
    mustBeNumber: string;
    mustBeString: string;
    invalidUrl: string;
    invalidJson: string;
  };

  // Error Messages
  errors: {
    unauthorized: string;
    forbidden: string;
    notFound: string;
    internalServerError: string;
    badRequest: string;
    conflict: string;
    tooManyRequests: string;
    serviceUnavailable: string;
    networkError: string;
    unknownError: string;
    invalidCredentials: string;
    accountLocked: string;
    sessionExpired: string;
    emailAlreadyExists: string;
    resourceNotFound: string;
    duplicateResource: string;
  };

  // Success Messages
  success: {
    created: string;
    updated: string;
    deleted: string;
    saved: string;
    passwordReset: string;
    emailSent: string;
    accountCreated: string;
    loginSuccessful: string;
  };

  // Projects
  projects: {
    title: string;
    create: string;
    edit: string;
    delete: string;
    name: string;
    description: string;
    owner: string;
    collaborators: string;
    createdAt: string;
    updatedAt: string;
    noProjects: string;
    confirmDelete: string;
  };

  // Resources
  resources: {
    title: string;
    create: string;
    edit: string;
    delete: string;
    name: string;
    fields: string;
    addField: string;
    fieldName: string;
    fieldType: string;
    required: string;
    generateData: string;
    dataGenerated: string;
    noResources: string;
    endpoint: string;
  };

  // APIs
  apis: {
    title: string;
    create: string;
    edit: string;
    delete: string;
    customApi: string;
    path: string;
    method: string;
    statusCode: string;
    requestBody: string;
    responseBody: string;
    queryParams: string;
    webhookUrl: string;
    conditionalResponse: string;
    noApis: string;
    testEndpoint: string;
  };

  // Dashboard
  dashboard: {
    welcome: string;
    overview: string;
    totalProjects: string;
    totalResources: string;
    totalApis: string;
    recentActivity: string;
    quickActions: string;
    documentation: string;
    support: string;
  };
}

const englishStrings: I18nStrings = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    update: 'Update',
    search: 'Search',
    loading: 'Loading...',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
    yes: 'Yes',
    no: 'No',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    close: 'Close',
  },

  auth: {
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    confirmPassword: 'Confirm Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    mobile: 'Mobile',
    rememberMe: 'Remember Me',
    orSignInWith: 'Or sign in with',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    createAccount: 'Create Account',
    welcomeBack: 'Welcome Back',
    getStarted: 'Get Started',
  },

  validation: {
    required: 'This field is required',
    invalidEmail: 'Invalid email address',
    invalidPassword: 'Invalid password format',
    passwordTooShort: 'Password must be at least 8 characters',
    passwordsDoNotMatch: 'Passwords do not match',
    invalidFormat: 'Invalid format',
    tooLong: 'Value is too long',
    tooShort: 'Value is too short',
    mustBeNumber: 'Must be a number',
    mustBeString: 'Must be a string',
    invalidUrl: 'Invalid URL',
    invalidJson: 'Invalid JSON format',
  },

  errors: {
    unauthorized: 'Unauthorized access',
    forbidden: 'Access forbidden',
    notFound: 'Resource not found',
    internalServerError: 'Internal server error',
    badRequest: 'Bad request',
    conflict: 'Resource already exists',
    tooManyRequests: 'Too many requests, please try again later',
    serviceUnavailable: 'Service temporarily unavailable',
    networkError: 'Network error, please check your connection',
    unknownError: 'An unexpected error occurred',
    invalidCredentials: 'Invalid email or password',
    accountLocked: 'Account has been locked',
    sessionExpired: 'Your session has expired, please sign in again',
    emailAlreadyExists: 'An account with this email already exists',
    resourceNotFound: 'The requested resource was not found',
    duplicateResource: 'A resource with this name already exists',
  },

  success: {
    created: 'Successfully created',
    updated: 'Successfully updated',
    deleted: 'Successfully deleted',
    saved: 'Successfully saved',
    passwordReset: 'Password reset successfully',
    emailSent: 'Email sent successfully',
    accountCreated: 'Account created successfully',
    loginSuccessful: 'Login successful',
  },

  projects: {
    title: 'Projects',
    create: 'Create Project',
    edit: 'Edit Project',
    delete: 'Delete Project',
    name: 'Project Name',
    description: 'Description',
    owner: 'Owner',
    collaborators: 'Collaborators',
    createdAt: 'Created At',
    updatedAt: 'Updated At',
    noProjects: 'No projects found',
    confirmDelete: 'Are you sure you want to delete this project?',
  },

  resources: {
    title: 'Resources',
    create: 'Create Resource',
    edit: 'Edit Resource',
    delete: 'Delete Resource',
    name: 'Resource Name',
    fields: 'Fields',
    addField: 'Add Field',
    fieldName: 'Field Name',
    fieldType: 'Field Type',
    required: 'Required',
    generateData: 'Generate Data',
    dataGenerated: 'Data generated successfully',
    noResources: 'No resources found',
    endpoint: 'Endpoint',
  },

  apis: {
    title: 'Custom APIs',
    create: 'Create API',
    edit: 'Edit API',
    delete: 'Delete API',
    customApi: 'Custom API',
    path: 'Path',
    method: 'Method',
    statusCode: 'Status Code',
    requestBody: 'Request Body',
    responseBody: 'Response Body',
    queryParams: 'Query Parameters',
    webhookUrl: 'Webhook URL',
    conditionalResponse: 'Conditional Response',
    noApis: 'No custom APIs found',
    testEndpoint: 'Test Endpoint',
  },

  dashboard: {
    welcome: 'Welcome to Fake API Generator',
    overview: 'Overview',
    totalProjects: 'Total Projects',
    totalResources: 'Total Resources',
    totalApis: 'Total APIs',
    recentActivity: 'Recent Activity',
    quickActions: 'Quick Actions',
    documentation: 'Documentation',
    support: 'Support',
  },
};

class I18nManager {
  private static instance: I18nManager;
  private currentLocale: Locale = 'en';
  private strings: Record<Locale, I18nStrings>;

  private constructor() {
    this.strings = {
      en: englishStrings,
      es: englishStrings, // TODO: Add Spanish translations
      fr: englishStrings, // TODO: Add French translations
      de: englishStrings, // TODO: Add German translations
      ja: englishStrings, // TODO: Add Japanese translations
      zh: englishStrings, // TODO: Add Chinese translations
    };
  }

  public static getInstance(): I18nManager {
    if (!I18nManager.instance) {
      I18nManager.instance = new I18nManager();
    }
    return I18nManager.instance;
  }

  public setLocale(locale: Locale): void {
    const validLocales: Locale[] = ['en', 'es', 'fr', 'de', 'ja', 'zh'];
    if (validLocales.includes(locale)) {
      this.currentLocale = locale;
    } else {
      // Default to 'en' for invalid locales
      this.currentLocale = 'en';
    }
  }

  public getLocale(): Locale {
    return this.currentLocale;
  }

  public t(): I18nStrings {
    return this.strings[this.currentLocale];
  }

  public addTranslations(locale: Locale, translations: I18nStrings): void {
    this.strings[locale] = translations;
  }
}

// Export class for testing
export { I18nManager };

// Export singleton instance
export const i18n = I18nManager.getInstance();

// Export for convenience
export const t = () => i18n.t();
