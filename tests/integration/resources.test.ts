/**
 * Integration Tests for /api/resources
 * Tests resource CRUD operations with validation, field handling, and database integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from '@/app/api/resources/route';
import type { ServiceResult } from '@/interfaces';

// Mock MongoDB connection
vi.mock('@/lib/mongodb', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

// Import the actual ResourceService for validation logic
import { ResourceService } from '@/services/ResourceService';

// Create a real service instance with mocked repositories
const mockResourceRepository = {
  findAll: vi.fn(),
  create: vi.fn(),
  nameExistsInProject: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  find: vi.fn(),
};

const mockDatabaseRepository = {
  findByProjectId: vi.fn(),
};

const mockDataGenerator = {
  generateData: vi.fn(),
};

const realResourceService = new ResourceService(
  mockResourceRepository as any,
  mockDatabaseRepository as any,
  mockDataGenerator as any
);

vi.mock('@/container/Container', () => ({
  getResourceService: () => realResourceService,
}));

describe('Resources API Integration Tests', () => {
  const mockProjectId = 'project-123';
  const mockResource = {
    id: 'resource-id-123',
    name: 'users',
    projectId: mockProjectId,
    fields: [
      { name: 'id', type: 'uuid' },
      { name: 'name', type: 'string' },
      { name: 'email', type: 'email' },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock: name doesn't exist (allows creation)
    mockResourceRepository.nameExistsInProject.mockResolvedValue(false);
  });

  describe('GET /api/resources', () => {
    it('should return all resources', async () => {
      const mockResources = [mockResource];
      mockResourceRepository.find.mockResolvedValue(mockResources);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockResources);
    });

    it('should return empty array when no resources exist', async () => {
      mockResourceRepository.find.mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
    });

    it('should handle database errors', async () => {
      mockResourceRepository.find.mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });

  describe('POST /api/resources', () => {
    it('should create resource with valid data', async () => {
      mockResourceRepository.nameExistsInProject.mockResolvedValue(false);
      mockResourceRepository.create.mockResolvedValue(mockResource);

      const request = new Request('http://localhost:3000/api/resources', {
        method: 'POST',
        body: JSON.stringify({
          name: 'users',
          projectId: mockProjectId,
          fields: [
            { name: 'id', type: 'uuid' },
            { name: 'email', type: 'email' },
          ],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
    });

    it('should return 400 when name is missing', async () => {
      const request = new Request('http://localhost:3000/api/resources', {
        method: 'POST',
        body: JSON.stringify({
          projectId: mockProjectId,
          fields: [],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return 400 when fields is missing', async () => {
      const request = new Request('http://localhost:3000/api/resources', {
        method: 'POST',
        body: JSON.stringify({
          name: 'users',
          projectId: mockProjectId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return 400 when projectId is missing', async () => {
      const request = new Request('http://localhost:3000/api/resources', {
        method: 'POST',
        body: JSON.stringify({
          name: 'users',
          fields: [],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return 409 when resource name already exists', async () => {
      mockResourceRepository.nameExistsInProject.mockResolvedValue(true);

      const request = new Request('http://localhost:3000/api/resources', {
        method: 'POST',
        body: JSON.stringify({
          name: 'users',
          projectId: mockProjectId,
          fields: [{ name: 'id', type: 'string' }],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
    });

    it('should accept fields as JSON string', async () => {
      mockResourceRepository.create.mockResolvedValue(mockResource);

      const request = new Request('http://localhost:3000/api/resources', {
        method: 'POST',
        body: JSON.stringify({
          name: 'users',
          projectId: mockProjectId,
          fields: JSON.stringify([{ name: 'id', type: 'uuid' }]),
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(mockResourceRepository.create).toHaveBeenCalled();
    });

    it('should return 400 when fields JSON string is invalid', async () => {
      const request = new Request('http://localhost:3000/api/resources', {
        method: 'POST',
        body: JSON.stringify({
          name: 'users',
          projectId: mockProjectId,
          fields: 'invalid json',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return 400 when fields is not an array', async () => {
      const request = new Request('http://localhost:3000/api/resources', {
        method: 'POST',
        body: JSON.stringify({
          name: 'users',
          projectId: mockProjectId,
          fields: { name: 'id', type: 'string' },
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should validate field structure', async () => {
      const request = new Request('http://localhost:3000/api/resources', {
        method: 'POST',
        body: JSON.stringify({
          name: 'users',
          projectId: mockProjectId,
          fields: [{ name: 'id' }], // Missing type
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should validate field types', async () => {
      const request = new Request('http://localhost:3000/api/resources', {
        method: 'POST',
        body: JSON.stringify({
          name: 'users',
          projectId: mockProjectId,
          fields: [{ name: 'id', type: 'invalid_type' }],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should accept all valid field types', async () => {
      const validTypes = ['string', 'number', 'boolean', 'date', 'email', 'uuid', 'image', 'relation'];
      
      for (const type of validTypes) {
        mockResourceRepository.create.mockResolvedValue({ ...mockResource, name: `resource_${type}` });

        const request = new Request('http://localhost:3000/api/resources', {
          method: 'POST',
          body: JSON.stringify({
            name: `resource_${type}`,
            projectId: mockProjectId,
            fields: [{ name: 'field', type }],
          }),
        });

        const response = await POST(request);
        expect(response.status).toBe(201);
      }

      expect(mockResourceRepository.create).toHaveBeenCalledTimes(validTypes.length);
    });

    it('should convert resource name to lowercase', async () => {
      mockResourceRepository.nameExistsInProject.mockResolvedValue(false);
      mockResourceRepository.create.mockResolvedValue({ ...mockResource, name: 'users' });

      const request = new Request('http://localhost:3000/api/resources', {
        method: 'POST',
        body: JSON.stringify({
          name: 'UsErS',
          projectId: mockProjectId,
          fields: [{ name: 'id', type: 'string' }],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.data.name).toBe('users');
    });

    it('should generate unique ID for resource', async () => {
      mockResourceRepository.nameExistsInProject.mockResolvedValue(false);
      mockResourceRepository.create.mockResolvedValue(mockResource);

      const request = new Request('http://localhost:3000/api/resources', {
        method: 'POST',
        body: JSON.stringify({
          name: 'users',
          projectId: mockProjectId,
          fields: [{ name: 'id', type: 'string' }],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.data.id).toBeDefined();
      expect(typeof data.data.id).toBe('string');
    });

    it('should reject resource name with slashes', async () => {
      const request = new Request('http://localhost:3000/api/resources', {
        method: 'POST',
        body: JSON.stringify({
          name: 'users/posts',
          projectId: mockProjectId,
          fields: [{ name: 'id', type: 'string' }],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject resource name starting with number', async () => {
      const request = new Request('http://localhost:3000/api/resources', {
        method: 'POST',
        body: JSON.stringify({
          name: '123users',
          projectId: mockProjectId,
          fields: [{ name: 'id', type: 'string' }],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should handle database errors during creation', async () => {
      mockResourceRepository.create.mockRejectedValue(
        new Error('Database error')
      );

      const request = new Request('http://localhost:3000/api/resources', {
        method: 'POST',
        body: JSON.stringify({
          name: 'users',
          projectId: mockProjectId,
          fields: [{ name: 'id', type: 'string' }],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });

    it('should handle invalid JSON in request body', async () => {
      const request = new Request('http://localhost:3000/api/resources', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should handle empty fields array', async () => {
      mockResourceRepository.create.mockResolvedValue({
        success: true,
        data: { ...mockResource, fields: [] },
      });

      const request = new Request('http://localhost:3000/api/resources', {
        method: 'POST',
        body: JSON.stringify({
          name: 'users',
          projectId: mockProjectId,
          fields: [],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(mockResourceRepository.create).toHaveBeenCalled();
    });

    it('should handle multiple fields with various types', async () => {
      const fields = [
        { name: 'id', type: 'uuid' },
        { name: 'name', type: 'string' },
        { name: 'age', type: 'number' },
        { name: 'active', type: 'boolean' },
        { name: 'email', type: 'email' },
        { name: 'createdAt', type: 'date' },
        { name: 'avatar', type: 'image' },
        { name: 'userId', type: 'relation' },
      ];

      mockResourceRepository.nameExistsInProject.mockResolvedValue(false);
      mockResourceRepository.create.mockResolvedValue({ ...mockResource, fields });

      const request = new Request('http://localhost:3000/api/resources', {
        method: 'POST',
        body: JSON.stringify({
          name: 'users',
          projectId: mockProjectId,
          fields,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.fields).toHaveLength(8);
    });
  });

  describe('Resource Name Validation', () => {
    it('should accept valid resource names', async () => {
      const validNames = ['users', 'posts', 'user_profiles', 'blogposts', 'comments123'];

      for (const name of validNames) {
        mockResourceRepository.create.mockResolvedValue({
          success: true,
          data: { ...mockResource, name },
        });

        const request = new Request('http://localhost:3000/api/resources', {
          method: 'POST',
          body: JSON.stringify({
            name,
            projectId: mockProjectId,
            fields: [{ name: 'id', type: 'string' }],
          }),
        });

        const response = await POST(request);
        expect(response.status).toBe(201);
      }

      expect(mockResourceRepository.create).toHaveBeenCalledTimes(validNames.length);
    });

    it('should reject invalid resource names', async () => {
      const invalidNames = [
        '',
        '   ',
        'user.name',        // Dot not allowed
        'user name',        // Space not allowed
        'user@name',        // @ not allowed
        '1users',           // Starts with number
        'users/posts',      // Slash not allowed
      ];

      for (const name of invalidNames) {
        const request = new Request('http://localhost:3000/api/resources', {
          method: 'POST',
          body: JSON.stringify({
            name,
            projectId: mockProjectId,
            fields: [{ name: 'id', type: 'string' }],
          }),
        });

        const response = await POST(request);
        expect(response.status).toBe(400);
      }
    });
  });
});
