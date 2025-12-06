/**
 * Integration Tests for /api/apis
 * Tests custom API endpoint CRUD operations with validation and configuration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from '@/app/api/apis/route';
import { API } from '@/models';

// Mock MongoDB connection
vi.mock('@/lib/mongodb', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

describe('APIs Endpoint Integration Tests', () => {
  const mockProjectId = 'project-123';
  const mockAPI = {
    id: 'api-id-123',
    path: '/test-endpoint',
    method: 'GET',
    statusCode: 200,
    responseBody: { message: 'test' },
    name: 'Test API',
    projectId: mockProjectId,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/apis', () => {
    it('should return all APIs', async () => {
      const mockAPIs = [mockAPI];
      vi.spyOn(API, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockAPIs),
      } as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockAPIs);
    });

    it('should return empty array when no APIs exist', async () => {
      vi.spyOn(API, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
    });

    it('should handle database errors', async () => {
      vi.spyOn(API, 'find').mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });

  describe('POST /api/apis', () => {
    it('should create API with minimal required fields', async () => {
      vi.spyOn(API, 'findOne').mockResolvedValue(null);
      vi.spyOn(API, 'create').mockResolvedValue(mockAPI as any);

      const request = new Request('http://localhost:3000/api/apis', {
        method: 'POST',
        body: JSON.stringify({
          path: '/test',
          method: 'GET',
          projectId: mockProjectId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
    });

    it('should create API with all optional fields', async () => {
      vi.spyOn(API, 'findOne').mockResolvedValue(null);
      const createSpy = vi.spyOn(API, 'create').mockResolvedValue(mockAPI as any);

      const request = new Request('http://localhost:3000/api/apis', {
        method: 'POST',
        body: JSON.stringify({
          path: '/test',
          method: 'POST',
          projectId: mockProjectId,
          statusCode: 201,
          name: 'Test API',
          responseBody: { data: 'test' },
          requestBody: { input: 'string' },
          queryParams: ['page', 'limit'],
          webhookUrl: 'https://webhook.example.com',
          conditionalResponse: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(createSpy).toHaveBeenCalled();
    });

    it('should return 400 when path is missing', async () => {
      const request = new Request('http://localhost:3000/api/apis', {
        method: 'POST',
        body: JSON.stringify({
          method: 'GET',
          projectId: mockProjectId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return 400 when method is missing', async () => {
      const request = new Request('http://localhost:3000/api/apis', {
        method: 'POST',
        body: JSON.stringify({
          path: '/test',
          projectId: mockProjectId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return 400 when projectId is missing', async () => {
      const request = new Request('http://localhost:3000/api/apis', {
        method: 'POST',
        body: JSON.stringify({
          path: '/test',
          method: 'GET',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return 409 when path+method combination already exists', async () => {
      vi.spyOn(API, 'findOne').mockResolvedValue(mockAPI as any);

      const request = new Request('http://localhost:3000/api/apis', {
        method: 'POST',
        body: JSON.stringify({
          path: '/test-endpoint',
          method: 'GET',
          projectId: mockProjectId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
    });

    it('should normalize path to start with slash', async () => {
      vi.spyOn(API, 'findOne').mockResolvedValue(null);
      const createSpy = vi.spyOn(API, 'create').mockResolvedValue(mockAPI as any);

      const request = new Request('http://localhost:3000/api/apis', {
        method: 'POST',
        body: JSON.stringify({
          path: 'test',
          method: 'GET',
          projectId: mockProjectId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      if (createSpy.mock.calls.length > 0) {
        const createdData = createSpy.mock.calls[0][0];
        expect(createdData.path).toBe('/test');
      }
    });

    it('should convert method to uppercase', async () => {
      vi.spyOn(API, 'findOne').mockResolvedValue(null);
      const createSpy = vi.spyOn(API, 'create').mockResolvedValue(mockAPI as any);

      const request = new Request('http://localhost:3000/api/apis', {
        method: 'POST',
        body: JSON.stringify({
          path: '/test',
          method: 'get',
          projectId: mockProjectId,
        }),
      });

      await POST(request);

      const createdData = createSpy.mock.calls[0][0];
      expect(createdData.method).toBe('GET');
    });

    it('should accept all valid HTTP methods', async () => {
      vi.spyOn(API, 'findOne').mockResolvedValue(null);
      const createSpy = vi.spyOn(API, 'create').mockResolvedValue(mockAPI as any);

      const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];

      for (const method of validMethods) {
        const request = new Request('http://localhost:3000/api/apis', {
          method: 'POST',
          body: JSON.stringify({
            path: `/test-${method}`,
            method,
            projectId: mockProjectId,
          }),
        });

        const response = await POST(request);
        expect(response.status).toBe(201);
      }

      expect(createSpy).toHaveBeenCalledTimes(validMethods.length);
    });

    it('should return 400 for invalid HTTP method', async () => {
      const request = new Request('http://localhost:3000/api/apis', {
        method: 'POST',
        body: JSON.stringify({
          path: '/test',
          method: 'INVALID',
          projectId: mockProjectId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should use 200 as default status code', async () => {
      vi.spyOn(API, 'findOne').mockResolvedValue(null);
      const createSpy = vi.spyOn(API, 'create').mockResolvedValue(mockAPI as any);

      const request = new Request('http://localhost:3000/api/apis', {
        method: 'POST',
        body: JSON.stringify({
          path: '/test',
          method: 'GET',
          projectId: mockProjectId,
        }),
      });

      await POST(request);

      const createdData = createSpy.mock.calls[0][0];
      expect(createdData.statusCode).toBe(200);
    });

    it('should accept valid status codes', async () => {
      vi.spyOn(API, 'findOne').mockResolvedValue(null);
      const createSpy = vi.spyOn(API, 'create').mockResolvedValue(mockAPI as any);

      const validStatusCodes = [200, 201, 204, 400, 401, 404, 500];

      for (const statusCode of validStatusCodes) {
        const request = new Request('http://localhost:3000/api/apis', {
          method: 'POST',
          body: JSON.stringify({
            path: `/test-${statusCode}`,
            method: 'GET',
            projectId: mockProjectId,
            statusCode,
          }),
        });

        const response = await POST(request);
        expect(response.status).toBe(201);
      }

      expect(createSpy).toHaveBeenCalledTimes(validStatusCodes.length);
    });

    it('should return 400 for invalid status code', async () => {
      const request = new Request('http://localhost:3000/api/apis', {
        method: 'POST',
        body: JSON.stringify({
          path: '/test',
          method: 'GET',
          projectId: mockProjectId,
          statusCode: 999,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should use "Untitled API" as default name', async () => {
      vi.spyOn(API, 'findOne').mockResolvedValue(null);
      const createSpy = vi.spyOn(API, 'create').mockResolvedValue(mockAPI as any);

      const request = new Request('http://localhost:3000/api/apis', {
        method: 'POST',
        body: JSON.stringify({
          path: '/test',
          method: 'GET',
          projectId: mockProjectId,
        }),
      });

      await POST(request);

      const createdData = createSpy.mock.calls[0][0];
      expect(createdData.name).toBe('Untitled API');
    });

    it('should sanitize API name', async () => {
      vi.spyOn(API, 'findOne').mockResolvedValue(null);
      const createSpy = vi.spyOn(API, 'create').mockResolvedValue(mockAPI as any);

      const request = new Request('http://localhost:3000/api/apis', {
        method: 'POST',
        body: JSON.stringify({
          path: '/test',
          method: 'GET',
          projectId: mockProjectId,
          name: '<script>alert("xss")</script>Safe Name',
        }),
      });

      await POST(request);

      const createdData = createSpy.mock.calls[0][0];
      expect(createdData.name).not.toContain('<script>');
    });

    it('should sanitize webhook URL', async () => {
      vi.spyOn(API, 'findOne').mockResolvedValue(null);
      const createSpy = vi.spyOn(API, 'create').mockResolvedValue(mockAPI as any);

      const request = new Request('http://localhost:3000/api/apis', {
        method: 'POST',
        body: JSON.stringify({
          path: '/test',
          method: 'GET',
          projectId: mockProjectId,
          webhookUrl: '<script>https://example.com</script>',
        }),
      });

      await POST(request);

      const createdData = createSpy.mock.calls[0][0];
      expect(createdData.webhookUrl).not.toContain('<script>');
    });

    it('should generate unique ID for API', async () => {
      vi.spyOn(API, 'findOne').mockResolvedValue(null);
      const createSpy = vi.spyOn(API, 'create').mockResolvedValue(mockAPI as any);

      const request = new Request('http://localhost:3000/api/apis', {
        method: 'POST',
        body: JSON.stringify({
          path: '/test',
          method: 'GET',
          projectId: mockProjectId,
        }),
      });

      await POST(request);

      const createdData = createSpy.mock.calls[0][0];
      expect(createdData.id).toBeDefined();
      expect(typeof createdData.id).toBe('string');
    });

    it('should validate path format', async () => {
      const invalidPaths = ['', '   ', 'invalid path']; // 'no-slash' is now normalized to '/no-slash' and is valid

      for (const path of invalidPaths) {
        const request = new Request('http://localhost:3000/api/apis', {
          method: 'POST',
          body: JSON.stringify({
            path,
            method: 'GET',
            projectId: mockProjectId,
          }),
        });

        const response = await POST(request);
        expect(response.status).toBe(400);
      }
    });

    it('should handle invalid JSON in request body', async () => {
      const request = new Request('http://localhost:3000/api/apis', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should handle database errors during creation', async () => {
      vi.spyOn(API, 'findOne').mockResolvedValue(null);
      vi.spyOn(API, 'create').mockRejectedValue(new Error('Database error'));

      const request = new Request('http://localhost:3000/api/apis', {
        method: 'POST',
        body: JSON.stringify({
          path: '/test',
          method: 'GET',
          projectId: mockProjectId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });

    it('should preserve responseBody structure', async () => {
      vi.spyOn(API, 'findOne').mockResolvedValue(null);
      const createSpy = vi.spyOn(API, 'create').mockResolvedValue(mockAPI as any);

      const responseBody = {
        data: { users: [] },
        pagination: { page: 1, total: 0 },
        meta: { version: '1.0' },
      };

      const request = new Request('http://localhost:3000/api/apis', {
        method: 'POST',
        body: JSON.stringify({
          path: '/test',
          method: 'GET',
          projectId: mockProjectId,
          responseBody,
        }),
      });

      await POST(request);

      const createdData = createSpy.mock.calls[0][0];
      expect(createdData.responseBody).toEqual(responseBody);
    });

    it('should handle dynamic path segments', async () => {
      vi.spyOn(API, 'findOne').mockResolvedValue(null);
      const createSpy = vi.spyOn(API, 'create').mockResolvedValue(mockAPI as any);

      const dynamicPaths = [
        '/users/:id',
        '/posts/:postId/comments/:commentId',
        '/api/:version/users',
      ];

      for (const path of dynamicPaths) {
        const request = new Request('http://localhost:3000/api/apis', {
          method: 'POST',
          body: JSON.stringify({
            path,
            method: 'GET',
            projectId: mockProjectId,
          }),
        });

        const response = await POST(request);
        expect(response.status).toBe(201);
      }

      expect(createSpy).toHaveBeenCalledTimes(dynamicPaths.length);
    });
  });
});
