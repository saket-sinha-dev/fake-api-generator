import mongoose, { Schema, Document, Model } from 'mongoose';

// User Profile Schema
export interface IUserProfile extends Document {
  email: string;
  firstName?: string;
  lastName?: string;
  mobile?: string;
  password?: string; // Hashed password for credentials login
  role?: 'user' | 'admin';
  isEmailVerified?: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>({
  email: { type: String, required: true, unique: true, index: true },
  firstName: String,
  lastName: String,
  mobile: String,
  password: String, // For credentials-based login
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isEmailVerified: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

export const UserProfile: Model<IUserProfile> = 
  mongoose.models.UserProfile || mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);

// Project Schema
export interface IProject extends Document {
  id: string;
  name: string;
  description?: string;
  userId: string;
  collaborators?: string[];
  isPublic?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  description: String,
  userId: { type: String, required: true, index: true },
  collaborators: { type: [String], default: [] },
  isPublic: { type: Boolean, default: false },
}, { timestamps: true });

// Compound index for efficient queries
ProjectSchema.index({ userId: 1, name: 1 });
ProjectSchema.index({ collaborators: 1 });

export const Project: Model<IProject> = 
  mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

// Resource Schema
export interface IResource extends Document {
  id: string;
  name: string;
  fields: Array<{
    id: string;
    name: string;
    type: string;
    fakerMethod?: string;
    relationTo?: string;
    required: boolean;
  }>;
  projectId: string;
  createdAt: Date;
}

const ResourceSchema = new Schema<IResource>({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, index: true },
  fields: [new Schema({
    id: { type: String },
    name: { type: String },
    type: { type: String },
    fakerMethod: { type: String },
    relationTo: { type: String },
    required: { type: Boolean },
  }, { _id: false })],
  projectId: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

export const Resource: Model<IResource> = 
  mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema);

// API Schema
export interface IAPI extends Document {
  id: string;
  name: string;
  path: string;
  method: string;
  statusCode: number;
  requestBody?: any;
  responseBody: any;
  queryParams?: Array<{
    key: string;
    value: string;
    required: boolean;
  }>;
  webhookUrl?: string;
  projectId: string;
  conditionalResponse?: {
    condition: {
      type: 'header' | 'query' | 'body' | 'dependentApi';
      key?: string;
      operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'exists';
      value?: any;
      dependentApiId?: string;
      dependentApiPath?: string;
    };
    responseIfTrue: any;
    responseIfFalse: any;
    statusCodeIfTrue?: number;
    statusCodeIfFalse?: number;
  };
  createdAt: Date;
}

const APISchema = new Schema<IAPI>({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  path: { type: String, required: true },
  method: { type: String, required: true },
  statusCode: { type: Number, required: true },
  requestBody: Schema.Types.Mixed,
  responseBody: Schema.Types.Mixed,
  queryParams: {
    type: [{
      key: String,
      value: String,
      required: Boolean,
    }],
    default: []
  },
  webhookUrl: String,
  projectId: { type: String, required: true, index: true },
  conditionalResponse: {
    type: {
      condition: {
        type: { type: String, enum: ['header', 'query', 'body', 'dependentApi'] },
        key: String,
        operator: { type: String, enum: ['equals', 'notEquals', 'contains', 'greaterThan', 'lessThan', 'exists'] },
        value: Schema.Types.Mixed,
        dependentApiId: String,
        dependentApiPath: String,
      },
      responseIfTrue: Schema.Types.Mixed,
      responseIfFalse: Schema.Types.Mixed,
      statusCodeIfTrue: Number,
      statusCodeIfFalse: Number,
    },
    required: false
  },
  createdAt: { type: Date, default: Date.now },
});

// Compound index for efficient API lookup
APISchema.index({ method: 1, path: 1 });

export const API: Model<IAPI> = 
  mongoose.models.API || mongoose.model<IAPI>('API', APISchema);

// Database (Generated Data) Schema
export interface IDatabase extends Document {
  resourceName: string;
  data: any[];
  updatedAt: Date;
}

const DatabaseSchema = new Schema<IDatabase>({
  resourceName: { type: String, required: true, unique: true, index: true },
  data: [Schema.Types.Mixed],
}, { timestamps: true });

export const Database: Model<IDatabase> = 
  mongoose.models.Database || mongoose.model<IDatabase>('Database', DatabaseSchema);
