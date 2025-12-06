/**
 * Integration Tests for /api/v1/[...slug]
 * Tests dynamic API routing, custom APIs, resource endpoints, and advanced querying
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST, PUT, DELETE } from '@/app/api/v1/[...slug]/route';
import { API, Resource, Database } from '@/models';

// Mock MongoDB connection
vi.mock('@/lib/mongodb', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

describe('V1 Dynamic Endpoint Integration Tests', () => {
  const mockProjectId = 'project-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Custom API Matching', () => {
    it('should match and return custom API response', async () => {
      const customApi = {
        id: 'api-1',
        path: '/custom-endpoint',
        method: 'GET',
        statusCode: 200,
        responseBody: { message: 'Custom response' },
        projectId: mockProjectId,
      };

      vi.spyOn(API, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([customApi]),
      } as any);
      vi.spyOn(Resource, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      const params = Promise.resolve({ slug: ['custom-endpoint'] });
      const request = new Request('http://localhost:3000/api/v1/custom-endpoint', {
        method: 'GET',
      });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ message: 'Custom response' });
    });

    it('should match custom API with dynamic path segments', async () => {
      const customApi = {
        id: 'api-2',
        path: '/users/:id',
        method: 'GET',
        statusCode: 200,
        responseBody: { user: 'details' },
        projectId: mockProjectId,
      };

      vi.spyOn(API, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([customApi]),
      } as any);
      vi.spyOn(Resource, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      const params = Promise.resolve({ slug: ['users', '123'] });
      const request = new Request('http://localhost:3000/api/v1/users/123', {
        method: 'GET',
      });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ user: 'details' });
    });

    it('should return custom API with specified status code', async () => {
      const customApi = {
        id: 'api-3',
        path: '/error-test',
        method: 'GET',
        statusCode: 404,
        responseBody: { error: 'Not found' },
        projectId: mockProjectId,
      };

      vi.spyOn(API, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([customApi]),
      } as any);
      vi.spyOn(Resource, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      const params = Promise.resolve({ slug: ['error-test'] });
      const request = new Request('http://localhost:3000/api/v1/error-test', {
        method: 'GET',
      });

      const response = await GET(request, { params });

      expect(response.status).toBe(404);
    });

    it('should handle null responseBody (204 No Content)', async () => {
      const customApi = {
        id: 'api-4',
        path: '/no-content',
        method: 'DELETE',
        statusCode: 204,
        responseBody: null,
        projectId: mockProjectId,
      };

      vi.spyOn(API, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([customApi]),
      } as any);
      vi.spyOn(Resource, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      const params = Promise.resolve({ slug: ['no-content'] });
      const request = new Request('http://localhost:3000/api/v1/no-content', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params });

      expect(response.status).toBe(204);
      expect(response.body).toBeNull();
    });

    it('should match correct method for custom API', async () => {
      const getApi = {
        id: 'api-5',
        path: '/test',
        method: 'GET',
        statusCode: 200,
        responseBody: { method: 'GET' },
        projectId: mockProjectId,
      };

      const postApi = {
        id: 'api-6',
        path: '/test',
        method: 'POST',
        statusCode: 201,
        responseBody: { method: 'POST' },
        projectId: mockProjectId,
      };

      vi.spyOn(API, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([getApi, postApi]),
      } as any);
      vi.spyOn(Resource, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      const params = Promise.resolve({ slug: ['test'] });
      const request = new Request('http://localhost:3000/api/v1/test', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.method).toBe('POST');
    });
  });

  describe('Resource-Based Endpoints', () => {
    const mockUsers = [
      { id: '1', name: 'Alice', email: 'alice@test.com', age: 25 },
      { id: '2', name: 'Bob', email: 'bob@test.com', age: 30 },
      { id: '3', name: 'Charlie', email: 'charlie@test.com', age: 35 },
    ];

    it('should return all items from resource', async () => {
      const resource = { id: 'res-1', name: 'users', fields: [], projectId: mockProjectId };

      vi.spyOn(API, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      } as any);
      vi.spyOn(Resource, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([resource]),
      } as any);
      vi.spyOn(Database, 'findOne').mockReturnValue({
        lean: vi.fn().mockResolvedValue({ resourceName: 'users', data: mockUsers }),
      } as any);

      const params = Promise.resolve({ slug: ['users'] });
      const request = new Request('http://localhost:3000/api/v1/users', {
        method: 'GET',
      });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(3);
      expect(data.pagination).toBeDefined();
    });

    it('should return 404 when resource has no data generated', async () => {
      const resource = { id: 'res-2', name: 'posts', fields: [], projectId: mockProjectId };

      vi.spyOn(API, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      } as any);
      vi.spyOn(Resource, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([resource]),
      } as any);
      vi.spyOn(Database, 'findOne').mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      } as any);

      const params = Promise.resolve({ slug: ['posts'] });
      const request = new Request('http://localhost:3000/api/v1/posts', {
        method: 'GET',
      });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('No data generated');
    });

    it('should get specific item by id', async () => {
      const resource = { id: 'res-3', name: 'users', fields: [], projectId: mockProjectId };

      vi.spyOn(API, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      } as any);
      vi.spyOn(Resource, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([resource]),
      } as any);
      vi.spyOn(Database, 'findOne').mockReturnValue({
        lean: vi.fn().mockResolvedValue({ resourceName: 'users', data: mockUsers }),
      } as any);

      const params = Promise.resolve({ slug: ['users', '1'] });
      const request = new Request('http://localhost:3000/api/v1/users/1', {
        method: 'GET',
      });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe('1');
      expect(data.name).toBe('Alice');
    });

    it('should return 404 when item not found', async () => {
      const resource = { id: 'res-4', name: 'users', fields: [], projectId: mockProjectId };

      vi.spyOn(API, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      } as any);
      vi.spyOn(Resource, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([resource]),
      } as any);
      vi.spyOn(Database, 'findOne').mockReturnValue({
        lean: vi.fn().mockResolvedValue({ resourceName: 'users', data: mockUsers }),
      } as any);

      const params = Promise.resolve({ slug: ['users', '999'] });
      const request = new Request('http://localhost:3000/api/v1/users/999', {
        method: 'GET',
      });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Item not found');
    });

    it('should create new item with POST', async () => {
      const resource = { id: 'res-5', name: 'users', fields: [], projectId: mockProjectId };

      vi.spyOn(API, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      } as any);
      vi.spyOn(Resource, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([resource]),
      } as any);
      vi.spyOn(Database, 'findOne').mockReturnValue({
        lean: vi.fn().mockResolvedValue({ resourceName: 'users', data: mockUsers }),
      } as any);
      vi.spyOn(Database, 'findOneAndUpdate').mockResolvedValue({} as any);

      const params = Promise.resolve({ slug: ['users'] });
      const request = new Request('http://localhost:3000/api/v1/users', {
        method: 'POST',
        body: JSON.stringify({ name: 'Dave', email: 'dave@test.com' }),
      });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBeDefined();
      expect(data.name).toBe('Dave');
      expect(data.createdAt).toBeDefined();
    });

    it('should update item with PUT', async () => {
      const resource = { id: 'res-6', name: 'users', fields: [], projectId: mockProjectId };

      vi.spyOn(API, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      } as any);
      vi.spyOn(Resource, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([resource]),
      } as any);
      vi.spyOn(Database, 'findOne').mockReturnValue({
        lean: vi.fn().mockResolvedValue({ resourceName: 'users', data: mockUsers }),
      } as any);
      vi.spyOn(Database, 'findOneAndUpdate').mockResolvedValue({} as any);

      const params = Promise.resolve({ slug: ['users', '1'] });
      const request = new Request('http://localhost:3000/api/v1/users/1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Alice Updated' }),
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe('1');
      expect(data.name).toBe('Alice Updated');
    });

    it('should delete item with DELETE', async () => {
      const resource = { id: 'res-7', name: 'users', fields: [], projectId: mockProjectId };

      vi.spyOn(API, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      } as any);
      vi.spyOn(Resource, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([resource]),
      } as any);
      vi.spyOn(Database, 'findOne').mockReturnValue({
        lean: vi.fn().mockResolvedValue({ resourceName: 'users', data: mockUsers }),
      } as any);
      vi.spyOn(Database, 'findOneAndUpdate').mockResolvedValue({} as any);

      const params = Promise.resolve({ slug: ['users', '1'] });
      const request = new Request('http://localhost:3000/api/v1/users/1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('Advanced Querying - Pagination', () => {
    const mockUsers = Array.from({ length: 50 }, (_, i) => ({
      id: String(i + 1),
      name: `User ${i + 1}`,
      age: 20 + i,
    }));

    it('should paginate results with default limit', async () => {
      const resource = { id: 'res-8', name: 'users', fields: [], projectId: mockProjectId };

      vi.spyOn(API, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      } as any);
      vi.spyOn(Resource, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([resource]),
      } as any);
      vi.spyOn(Database, 'findOne').mockReturnValue({
        lean: vi.fn().mockResolvedValue({ resourceName: 'users', data: mockUsers }),
      } as any);

      const params = Promise.resolve({ slug: ['users'] });
      const request = new Request('http://localhost:3000/api/v1/users', {
        method: 'GET',
      });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(data.data).toHaveLength(10);
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(10);
      expect(data.pagination.total).toBe(50);
      expect(data.pagination.totalPages).toBe(5);
    });

    it('should paginate with custom page and limit', async () => {
      const resource = { id: 'res-9', name: 'users', fields: [], projectId: mockProjectId };

      vi.spyOn(API, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      } as any);
      vi.spyOn(Resource, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([resource]),
      } as any);
      vi.spyOn(Database, 'findOne').mockReturnValue({
        lean: vi.fn().mockResolvedValue({ resourceName: 'users', data: mockUsers }),
      } as any);

      const params = Promise.resolve({ slug: ['users'] });
      const request = new Request('http://localhost:3000/api/v1/users?_page=2&_limit=20', {
        method: 'GET',
      });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(data.data).toHaveLength(20);
      expect(data.pagination.page).toBe(2);
      expect(data.pagination.limit).toBe(20);
    });
  });

  describe('Advanced Querying - Sorting', () => {
    const mockUsers = [
      { id: '1', name: 'Charlie', age: 35 },
      { id: '2', name: 'Alice', age: 25 },
      { id: '3', name: 'Bob', age: 30 },
    ];

    it('should sort by single field ascending', async () => {
      const resource = { id: 'res-10', name: 'users', fields: [], projectId: mockProjectId };

      vi.spyOn(API, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      } as any);
      vi.spyOn(Resource, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([resource]),
      } as any);
      vi.spyOn(Database, 'findOne').mockReturnValue({
        lean: vi.fn().mockResolvedValue({ resourceName: 'users', data: mockUsers }),
      } as any);

      const params = Promise.resolve({ slug: ['users'] });
      const request = new Request('http://localhost:3000/api/v1/users?_sort=name', {
        method: 'GET',
      });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(data.data[0].name).toBe('Alice');
      expect(data.data[1].name).toBe('Bob');
      expect(data.data[2].name).toBe('Charlie');
    });

    it('should sort by single field descending', async () => {
      const resource = { id: 'res-11', name: 'users', fields: [], projectId: mockProjectId };

      vi.spyOn(API, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      } as any);
      vi.spyOn(Resource, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([resource]),
      } as any);
      vi.spyOn(Database, 'findOne').mockReturnValue({
        lean: vi.fn().mockResolvedValue({ resourceName: 'users', data: mockUsers }),
      } as any);

      const params = Promise.resolve({ slug: ['users'] });
      const request = new Request('http://localhost:3000/api/v1/users?_sort=age&_order=desc', {
        method: 'GET',
      });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(data.data[0].age).toBe(35);
      expect(data.data[1].age).toBe(30);
      expect(data.data[2].age).toBe(25);
    });
  });

  describe('Advanced Querying - Filtering', () => {
    const mockUsers = [
      { id: '1', name: 'Alice', age: 25, active: true },
      { id: '2', name: 'Bob', age: 30, active: false },
      { id: '3', name: 'Charlie', age: 35, active: true },
    ];

    it('should filter by exact match', async () => {
      const resource = { id: 'res-12', name: 'users', fields: [], projectId: mockProjectId };

      vi.spyOn(API, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      } as any);
      vi.spyOn(Resource, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([resource]),
      } as any);
      vi.spyOn(Database, 'findOne').mockReturnValue({
        lean: vi.fn().mockResolvedValue({ resourceName: 'users', data: mockUsers }),
      } as any);

      const params = Promise.resolve({ slug: ['users'] });
      const request = new Request('http://localhost:3000/api/v1/users?active=true', {
        method: 'GET',
      });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(data.data).toHaveLength(2);
      expect(data.data.every((u: any) => u.active === true)).toBe(true);
    });

    it('should filter by string contains (case-insensitive)', async () => {
      const resource = { id: 'res-13', name: 'users', fields: [], projectId: mockProjectId };

      vi.spyOn(API, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      } as any);
      vi.spyOn(Resource, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([resource]),
      } as any);
      vi.spyOn(Database, 'findOne').mockReturnValue({
        lean: vi.fn().mockResolvedValue({ resourceName: 'users', data: mockUsers }),
      } as any);

      const params = Promise.resolve({ slug: ['users'] });
      const request = new Request('http://localhost:3000/api/v1/users?name=ali', {
        method: 'GET',
      });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(data.data).toHaveLength(1); // Only Alice contains "ali"
    });

    it('should filter with _gte operator', async () => {
      const resource = { id: 'res-14', name: 'users', fields: [], projectId: mockProjectId };

      vi.spyOn(API, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      } as any);
      vi.spyOn(Resource, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([resource]),
      } as any);
      vi.spyOn(Database, 'findOne').mockReturnValue({
        lean: vi.fn().mockResolvedValue({ resourceName: 'users', data: mockUsers }),
      } as any);

      const params = Promise.resolve({ slug: ['users'] });
      const request = new Request('http://localhost:3000/api/v1/users?age_gte=30', {
        method: 'GET',
      });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(data.data).toHaveLength(2);
      expect(data.data.every((u: any) => u.age >= 30)).toBe(true);
    });

    it('should filter with _lte operator', async () => {
      const resource = { id: 'res-15', name: 'users', fields: [], projectId: mockProjectId };

      vi.spyOn(API, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      } as any);
      vi.spyOn(Resource, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([resource]),
      } as any);
      vi.spyOn(Database, 'findOne').mockReturnValue({
        lean: vi.fn().mockResolvedValue({ resourceName: 'users', data: mockUsers }),
      } as any);

      const params = Promise.resolve({ slug: ['users'] });
      const request = new Request('http://localhost:3000/api/v1/users?age_lte=30', {
        method: 'GET',
      });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(data.data).toHaveLength(2);
      expect(data.data.every((u: any) => u.age <= 30)).toBe(true);
    });

    it('should perform full-text search with _search', async () => {
      const resource = { id: 'res-16', name: 'users', fields: [], projectId: mockProjectId };

      vi.spyOn(API, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      } as any);
      vi.spyOn(Resource, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([resource]),
      } as any);
      vi.spyOn(Database, 'findOne').mockReturnValue({
        lean: vi.fn().mockResolvedValue({ resourceName: 'users', data: mockUsers }),
      } as any);

      const params = Promise.resolve({ slug: ['users'] });
      const request = new Request('http://localhost:3000/api/v1/users?_search=bob', {
        method: 'GET',
      });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(data.data).toHaveLength(1);
      expect(data.data[0].name).toBe('Bob');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoint', async () => {
      vi.spyOn(API, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      } as any);
      vi.spyOn(Resource, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      const params = Promise.resolve({ slug: ['non-existent'] });
      const request = new Request('http://localhost:3000/api/v1/non-existent', {
        method: 'GET',
      });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('Mock API not found');
    });

    it('should provide helpful hints in 404 error', async () => {
      const resource = { id: 'res-17', name: 'users', fields: [], projectId: mockProjectId };
      const api = { id: 'api-7', path: '/test', method: 'GET', projectId: mockProjectId };

      vi.spyOn(API, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([api]),
      } as any);
      vi.spyOn(Resource, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([resource]),
      } as any);

      const params = Promise.resolve({ slug: ['unknown'] });
      const request = new Request('http://localhost:3000/api/v1/unknown', {
        method: 'GET',
      });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.availableResources).toContain('users');
      expect(data.availableApis).toBeDefined();
    });

    it('should handle database errors gracefully', async () => {
      vi.spyOn(API, 'find').mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const params = Promise.resolve({ slug: ['test'] });
      const request = new Request('http://localhost:3000/api/v1/test', {
        method: 'GET',
      });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });
});
