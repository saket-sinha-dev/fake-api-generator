/**
 * Integration Tests for /api/apis/[id]
 * Tests API DELETE and PUT operations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DELETE, PUT } from '@/app/api/apis/[id]/route';
import { API } from '@/models';

// Mock MongoDB connection
vi.mock('@/lib/mongodb', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

describe('APIs [id] Endpoint Integration Tests', () => {
  const mockApiId = 'api-123';
  const mockApi = {
    id: mockApiId,
    path: '/test-endpoint',
    method: 'GET',
    statusCode: 200,
    responseBody: { message: 'test' },
    name: 'Test API',
    projectId: 'project-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('DELETE /api/apis/[id]', () => {
    it('should delete API successfully', async () => {
      vi.spyOn(API, 'deleteOne').mockResolvedValue({ deletedCount: 1 } as any);

      const params = Promise.resolve({ id: mockApiId });
      const request = new Request('http://localhost:3000/api/apis/api-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return 404 when API not found', async () => {
      vi.spyOn(API, 'deleteOne').mockResolvedValue({ deletedCount: 0 } as any);

      const params = Promise.resolve({ id: 'non-existent' });
      const request = new Request('http://localhost:3000/api/apis/non-existent', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('API not found');
    });

    it('should handle database errors during deletion', async () => {
      vi.spyOn(API, 'deleteOne').mockRejectedValue(new Error('Database error'));

      const params = Promise.resolve({ id: mockApiId });
      const request = new Request('http://localhost:3000/api/apis/api-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should call deleteOne with correct id', async () => {
      const deleteSpy = vi.spyOn(API, 'deleteOne').mockResolvedValue({ deletedCount: 1 } as any);

      const params = Promise.resolve({ id: mockApiId });
      const request = new Request('http://localhost:3000/api/apis/api-123', {
        method: 'DELETE',
      });

      await DELETE(request, { params });

      expect(deleteSpy).toHaveBeenCalledWith({ id: mockApiId });
    });
  });

  describe('PUT /api/apis/[id]', () => {
    it('should update API successfully', async () => {
      const updatedApi = { ...mockApi, statusCode: 201 };
      vi.spyOn(API, 'findOneAndUpdate').mockResolvedValue(updatedApi as any);

      const params = Promise.resolve({ id: mockApiId });
      const request = new Request('http://localhost:3000/api/apis/api-123', {
        method: 'PUT',
        body: JSON.stringify({ statusCode: 201 }),
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.statusCode).toBe(201);
    });

    it('should return 404 when API not found', async () => {
      vi.spyOn(API, 'findOneAndUpdate').mockResolvedValue(null);

      const params = Promise.resolve({ id: 'non-existent' });
      const request = new Request('http://localhost:3000/api/apis/non-existent', {
        method: 'PUT',
        body: JSON.stringify({ statusCode: 201 }),
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('API not found');
    });

    it('should update path', async () => {
      const updatedApi = { ...mockApi, path: '/new-endpoint' };
      vi.spyOn(API, 'findOneAndUpdate').mockResolvedValue(updatedApi as any);

      const params = Promise.resolve({ id: mockApiId });
      const request = new Request('http://localhost:3000/api/apis/api-123', {
        method: 'PUT',
        body: JSON.stringify({ path: '/new-endpoint' }),
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.path).toBe('/new-endpoint');
    });

    it('should update method', async () => {
      const updatedApi = { ...mockApi, method: 'POST' };
      vi.spyOn(API, 'findOneAndUpdate').mockResolvedValue(updatedApi as any);

      const params = Promise.resolve({ id: mockApiId });
      const request = new Request('http://localhost:3000/api/apis/api-123', {
        method: 'PUT',
        body: JSON.stringify({ method: 'POST' }),
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.method).toBe('POST');
    });

    it('should update responseBody', async () => {
      const newResponseBody = { data: [1, 2, 3], total: 3 };
      const updatedApi = { ...mockApi, responseBody: newResponseBody };
      vi.spyOn(API, 'findOneAndUpdate').mockResolvedValue(updatedApi as any);

      const params = Promise.resolve({ id: mockApiId });
      const request = new Request('http://localhost:3000/api/apis/api-123', {
        method: 'PUT',
        body: JSON.stringify({ responseBody: newResponseBody }),
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.responseBody).toEqual(newResponseBody);
    });

    it('should update name', async () => {
      const updatedApi = { ...mockApi, name: 'Updated API Name' };
      vi.spyOn(API, 'findOneAndUpdate').mockResolvedValue(updatedApi as any);

      const params = Promise.resolve({ id: mockApiId });
      const request = new Request('http://localhost:3000/api/apis/api-123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated API Name' }),
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe('Updated API Name');
    });

    it('should update webhookUrl', async () => {
      const updatedApi = { ...mockApi, webhookUrl: 'https://new-webhook.com' };
      vi.spyOn(API, 'findOneAndUpdate').mockResolvedValue(updatedApi as any);

      const params = Promise.resolve({ id: mockApiId });
      const request = new Request('http://localhost:3000/api/apis/api-123', {
        method: 'PUT',
        body: JSON.stringify({ webhookUrl: 'https://new-webhook.com' }),
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.webhookUrl).toBe('https://new-webhook.com');
    });

    it('should update requestBody', async () => {
      const requestBody = { field1: 'string', field2: 'number' };
      const updatedApi = { ...mockApi, requestBody };
      vi.spyOn(API, 'findOneAndUpdate').mockResolvedValue(updatedApi as any);

      const params = Promise.resolve({ id: mockApiId });
      const request = new Request('http://localhost:3000/api/apis/api-123', {
        method: 'PUT',
        body: JSON.stringify({ requestBody }),
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.requestBody).toEqual(requestBody);
    });

    it('should update queryParams', async () => {
      const queryParams = ['page', 'limit', 'sort'];
      const updatedApi = { ...mockApi, queryParams };
      vi.spyOn(API, 'findOneAndUpdate').mockResolvedValue(updatedApi as any);

      const params = Promise.resolve({ id: mockApiId });
      const request = new Request('http://localhost:3000/api/apis/api-123', {
        method: 'PUT',
        body: JSON.stringify({ queryParams }),
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.queryParams).toEqual(queryParams);
    });

    it('should update conditionalResponse', async () => {
      const conditionalResponse = {
        condition: { type: 'header', key: 'X-Test', operator: 'equals', value: 'true' },
        responseIfTrue: { success: true },
        responseIfFalse: { success: false },
      };
      const updatedApi = { ...mockApi, conditionalResponse };
      vi.spyOn(API, 'findOneAndUpdate').mockResolvedValue(updatedApi as any);

      const params = Promise.resolve({ id: mockApiId });
      const request = new Request('http://localhost:3000/api/apis/api-123', {
        method: 'PUT',
        body: JSON.stringify({ conditionalResponse }),
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.conditionalResponse).toEqual(conditionalResponse);
    });

    it('should set updatedAt timestamp', async () => {
      const updateSpy = vi.spyOn(API, 'findOneAndUpdate').mockResolvedValue(mockApi as any);

      const params = Promise.resolve({ id: mockApiId });
      const request = new Request('http://localhost:3000/api/apis/api-123', {
        method: 'PUT',
        body: JSON.stringify({ statusCode: 201 }),
      });

      await PUT(request, { params });

      expect(updateSpy).toHaveBeenCalledWith(
        { id: mockApiId },
        expect.objectContaining({
          updatedAt: expect.any(Date),
        }),
        { new: true }
      );
    });

    it('should update multiple fields at once', async () => {
      const updates = {
        path: '/updated-path',
        method: 'PUT',
        statusCode: 204,
        name: 'Updated Name',
      };
      const updateSpy = vi.spyOn(API, 'findOneAndUpdate').mockResolvedValue({
        ...mockApi,
        ...updates,
      } as any);

      const params = Promise.resolve({ id: mockApiId });
      const request = new Request('http://localhost:3000/api/apis/api-123', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      await PUT(request, { params });

      expect(updateSpy).toHaveBeenCalledWith(
        { id: mockApiId },
        expect.objectContaining(updates),
        { new: true }
      );
    });

    it('should handle invalid JSON in request body', async () => {
      const params = Promise.resolve({ id: mockApiId });
      const request = new Request('http://localhost:3000/api/apis/api-123', {
        method: 'PUT',
        body: 'invalid json',
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should handle database errors during update', async () => {
      vi.spyOn(API, 'findOneAndUpdate').mockRejectedValue(new Error('Database error'));

      const params = Promise.resolve({ id: mockApiId });
      const request = new Request('http://localhost:3000/api/apis/api-123', {
        method: 'PUT',
        body: JSON.stringify({ statusCode: 201 }),
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should update responseBody to null', async () => {
      const updatedApi = { ...mockApi, responseBody: null };
      vi.spyOn(API, 'findOneAndUpdate').mockResolvedValue(updatedApi as any);

      const params = Promise.resolve({ id: mockApiId });
      const request = new Request('http://localhost:3000/api/apis/api-123', {
        method: 'PUT',
        body: JSON.stringify({ responseBody: null }),
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.responseBody).toBeNull();
    });

    it('should handle complex nested responseBody', async () => {
      const complexResponse = {
        data: {
          users: [{ id: 1, name: 'John' }],
          meta: {
            pagination: { page: 1, total: 100 },
            filters: { active: true },
          },
        },
      };
      const updatedApi = { ...mockApi, responseBody: complexResponse };
      vi.spyOn(API, 'findOneAndUpdate').mockResolvedValue(updatedApi as any);

      const params = Promise.resolve({ id: mockApiId });
      const request = new Request('http://localhost:3000/api/apis/api-123', {
        method: 'PUT',
        body: JSON.stringify({ responseBody: complexResponse }),
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.responseBody).toEqual(complexResponse);
    });

    it('should allow clearing webhookUrl', async () => {
      const updatedApi = { ...mockApi, webhookUrl: undefined };
      vi.spyOn(API, 'findOneAndUpdate').mockResolvedValue(updatedApi as any);

      const params = Promise.resolve({ id: mockApiId });
      const request = new Request('http://localhost:3000/api/apis/api-123', {
        method: 'PUT',
        body: JSON.stringify({ webhookUrl: null }),
      });

      const response = await PUT(request, { params });

      expect(response.status).toBe(200);
    });

    it('should allow clearing conditionalResponse', async () => {
      const updatedApi = { ...mockApi, conditionalResponse: undefined };
      vi.spyOn(API, 'findOneAndUpdate').mockResolvedValue(updatedApi as any);

      const params = Promise.resolve({ id: mockApiId });
      const request = new Request('http://localhost:3000/api/apis/api-123', {
        method: 'PUT',
        body: JSON.stringify({ conditionalResponse: null }),
      });

      const response = await PUT(request, { params });

      expect(response.status).toBe(200);
    });
  });
});
