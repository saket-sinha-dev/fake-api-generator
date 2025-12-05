export interface ConditionalResponse {
  condition: {
    type: 'header' | 'query' | 'body' | 'dependentApi'; // Type of condition
    key?: string; // Header/query/body key to check
    operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'exists';
    value?: any; // Expected value
    dependentApiId?: string; // ID of API to call first (for dependentApi type)
    dependentApiPath?: string; // Path to check in dependent API response (e.g., "data.isEligible")
  };
  responseIfTrue: any; // Response when condition is true
  responseIfFalse: any; // Response when condition is false
  statusCodeIfTrue?: number; // Optional different status code when true
  statusCodeIfFalse?: number; // Optional different status code when false
}

export interface MockApi {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
  statusCode: number;
  responseBody: any;
  requestBody?: any; // Expected request body format
  createdAt: string;
  name: string;
  webhookUrl?: string;
  projectId: string; // Project association
  queryParams?: { key: string; value: string; required: boolean }[]; // Query parameters
  conditionalResponse?: ConditionalResponse; // Optional conditional logic
}

export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'email' | 'uuid' | 'image' | 'relation';

export interface ResourceField {
  id: string;
  name: string;
  type: FieldType;
  fakerMethod?: string; // e.g., "person.firstName"
  relationTo?: string; // Resource ID for relations
  required: boolean;
}

export interface Resource {
  id: string;
  name: string; // e.g., "users"
  fields: ResourceField[];
  createdAt: string;
  projectId: string; // Project association
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  userId: string; // Owner's email from session
  collaborators?: string[]; // Array of collaborator emails
  isPublic?: boolean; // If true, anyone can view (read-only)
}

export interface UserProfile {
  email: string; // Primary key (from Google auth or credentials)
  firstName?: string;
  lastName?: string;
  mobile?: string;
  password?: string; // Hashed password for credentials login
  role?: 'user' | 'admin';
  isEmailVerified?: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt?: string;
  updatedAt?: string;
}

// Simple in-memory DB structure
export interface Database {
  [resourceName: string]: any[];
}
