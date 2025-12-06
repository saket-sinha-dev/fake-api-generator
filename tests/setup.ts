/**
 * Test Setup Configuration
 * Global test setup for Vitest
 */

import '@testing-library/jest-dom';
import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { config } from '@/config';

let mongoServer: MongoMemoryServer;

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/test',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock NextAuth
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Setup MongoDB Memory Server
beforeAll(async () => {
  if (config.get().isTest) {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  }
}, 60000);

// Cleanup after each test
afterEach(async () => {
  if (config.get().isTest && config.get().testing?.cleanupAfterTests) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});

// Cleanup after all tests
afterAll(async () => {
  if (config.get().isTest) {
    await mongoose.disconnect();
    await mongoServer?.stop();
  }
});

// Global test utilities
export const createMockRequest = (options: RequestInit = {}) => {
  return new Request('http://localhost:3000/api/test', {
    method: 'GET',
    ...options,
  });
};

export const createMockUser = () => ({
  email: 'test@example.com',
  password: 'Test1234!',
  firstName: 'Test',
  lastName: 'User',
  role: 'user' as const,
  isEmailVerified: true,
});
