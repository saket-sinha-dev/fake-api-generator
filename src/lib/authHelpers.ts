/**
 * Authentication and authorization utilities
 * Centralized auth helpers for consistent security checks
 */

import { auth } from '@/auth';
import { USER_ROLES } from './constants';
import { logger } from './logger';

/**
 * Gets the current authenticated session
 */
export async function getAuthSession() {
  try {
    const session = await auth();
    return session;
  } catch (error) {
    logger.error('Failed to get auth session', error);
    return null;
  }
}

/**
 * Checks if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getAuthSession();
  return !!session?.user?.email;
}

/**
 * Gets the authenticated user's email
 */
export async function getAuthenticatedUserEmail(): Promise<string | null> {
  const session = await getAuthSession();
  return session?.user?.email || null;
}

/**
 * Checks if the authenticated user has admin role
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getAuthSession();
  if (!session?.user) return false;

  const userRole = (session.user as any).role;
  return userRole === USER_ROLES.ADMIN;
}

/**
 * Requires authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<string> {
  const email = await getAuthenticatedUserEmail();
  
  if (!email) {
    throw new Error('Authentication required');
  }

  return email;
}

/**
 * Requires admin role - throws if not admin
 */
export async function requireAdmin(): Promise<void> {
  const isUserAdmin = await isAdmin();
  
  if (!isUserAdmin) {
    throw new Error('Admin privileges required');
  }
}

/**
 * Validates session and returns user email
 * Used in API routes for authentication checks
 */
export async function validateSession(): Promise<{
  valid: boolean;
  email?: string;
  error?: string;
}> {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return {
        valid: false,
        error: 'No active session',
      };
    }

    return {
      valid: true,
      email: session.user.email,
    };
  } catch (error) {
    logger.error('Session validation failed', error);
    return {
      valid: false,
      error: 'Session validation error',
    };
  }
}

/**
 * Checks if user has access to a specific project
 * Used for authorization checks on project resources
 */
export async function hasProjectAccess(
  userEmail: string,
  project: { userId: string; collaborators?: string[] }
): Promise<boolean> {
  // Owner has access
  if (project.userId === userEmail) {
    return true;
  }

  // Check if user is a collaborator
  if (project.collaborators && project.collaborators.includes(userEmail)) {
    return true;
  }

  return false;
}

/**
 * Checks if user is the owner of a project
 */
export function isProjectOwner(userEmail: string, project: { userId: string }): boolean {
  return project.userId === userEmail;
}

/**
 * Hashes a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs');
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verifies a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, hash);
}

/**
 * Generates a random session token
 */
export function generateSessionToken(): string {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('base64');
}
