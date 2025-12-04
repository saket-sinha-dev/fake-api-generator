export interface MockApi {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
  statusCode: number;
  responseBody: any;
  createdAt: string;
  name: string;
  webhookUrl?: string;
  projectId: string; // Project association
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
  userId: string; // Owner's email from session
}

export interface UserProfile {
  email: string; // Primary key (from Google auth)
  name?: string;
  mobile?: string;
  updatedAt: string;
}

// Simple in-memory DB structure
export interface Database {
  [resourceName: string]: any[];
}
