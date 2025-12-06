/**
 * Integration Tests for /api/resources/[id]
 * Tests resource DELETE and PUT operations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DELETE, PUT } from '@/app/api/resources/[id]/route';
import { Resource } from '@/models';

// Mock MongoDB connection
vi.mock('@/lib/mongodb', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

describe('Resources [id] Endpoint Integration Tests', () => {
  const mockResourceId = 'resource-123';
  const mockResource = {
    id: mockResourceId,
    name: 'users',
    fields: [
      { name: 'name', type: 'string' },
      { name: 'email', type: 'email' },
    ],
    projectId: 'project-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('DELETE /api/resources/[id]', () => {
    it('should delete resource successfully', async () => {
      vi.spyOn(Resource, 'deleteOne').mockResolvedValue({ deletedCount: 1 } as any);

      const params = Promise.resolve({ id: mockResourceId });
      const request = new Request('http://localhost:3000/api/resources/resource-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return 404 when resource not found', async () => {
      vi.spyOn(Resource, 'deleteOne').mockResolvedValue({ deletedCount: 0 } as any);

      const params = Promise.resolve({ id: 'non-existent' });
      const request = new Request('http://localhost:3000/api/resources/non-existent', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Resource not found');
    });

    it('should handle database errors during deletion', async () => {
      vi.spyOn(Resource, 'deleteOne').mockRejectedValue(new Error('Database error'));

      const params = Promise.resolve({ id: mockResourceId });
      const request = new Request('http://localhost:3000/api/resources/resource-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('PUT /api/resources/[id]', () => {
    it('should update resource successfully', async () => {
      const updatedResource = { ...mockResource, name: 'posts' };
      vi.spyOn(Resource, 'findOneAndUpdate').mockResolvedValue(updatedResource as any);

      const params = Promise.resolve({ id: mockResourceId });
      const request = new Request('http://localhost:3000/api/resources/resource-123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'posts' }),
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe('posts');
    });

    it('should return 404 when resource not found', async () => {
      vi.spyOn(Resource, 'findOneAndUpdate').mockResolvedValue(null);

      const params = Promise.resolve({ id: 'non-existent' });
      const request = new Request('http://localhost:3000/api/resources/non-existent', {
        method: 'PUT',
        body: JSON.stringify({ name: 'posts' }),
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Resource not found');
    });

    it('should update fields successfully', async () => {
      const newFields = [
        { name: 'title', type: 'string' },
        { name: 'content', type: 'string' },
        { name: 'published', type: 'boolean' },
      ];
      const updatedResource = { ...mockResource, fields: newFields };
      vi.spyOn(Resource, 'findOneAndUpdate').mockResolvedValue(updatedResource as any);

      const params = Promise.resolve({ id: mockResourceId });
      const request = new Request('http://localhost:3000/api/resources/resource-123', {
        method: 'PUT',
        body: JSON.stringify({ fields: newFields }),
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.fields).toEqual(newFields);
    });

    it('should parse fields from JSON string', async () => {
      const fieldsString = '[{"name":"age","type":"number"}]';
      const updateSpy = vi.spyOn(Resource, 'findOneAndUpdate').mockResolvedValue({
        ...mockResource,
        fields: [{ name: 'age', type: 'number' }],
      } as any);

      const params = Promise.resolve({ id: mockResourceId });
      const request = new Request('http://localhost:3000/api/resources/resource-123', {
        method: 'PUT',
        body: JSON.stringify({ fields: fieldsString }),
      });

      await PUT(request, { params });

      const callArgs = updateSpy.mock.calls[0][1] as any;
      expect(callArgs.fields).toEqual([{ name: 'age', type: 'number' }]);
    });

    it('should return 400 for invalid JSON string in fields', async () => {
      const params = Promise.resolve({ id: mockResourceId });
      const request = new Request('http://localhost:3000/api/resources/resource-123', {
        method: 'PUT',
        body: JSON.stringify({ fields: 'invalid json' }),
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid fields format');
    });

    it('should set updatedAt timestamp', async () => {
      const updateSpy = vi.spyOn(Resource, 'findOneAndUpdate').mockResolvedValue(mockResource as any);

      const params = Promise.resolve({ id: mockResourceId });
      const request = new Request('http://localhost:3000/api/resources/resource-123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'posts' }),
      });

      await PUT(request, { params });

      expect(updateSpy).toHaveBeenCalledWith(
        { id: mockResourceId },
        expect.objectContaining({
          updatedAt: expect.any(Date),
        }),
        { new: true }
      );
    });

    it('should update multiple fields at once', async () => {
      const updates = {
        name: 'comments',
        fields: [
          { name: 'comment', type: 'string' },
          { name: 'userId', type: 'relation' },
        ],
      };
      const updateSpy = vi.spyOn(Resource, 'findOneAndUpdate').mockResolvedValue({
        ...mockResource,
        ...updates,
      } as any);

      const params = Promise.resolve({ id: mockResourceId });
      const request = new Request('http://localhost:3000/api/resources/resource-123', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      await PUT(request, { params });

      expect(updateSpy).toHaveBeenCalledWith(
        { id: mockResourceId },
        expect.objectContaining(updates),
        { new: true }
      );
    });

    it('should handle invalid JSON in request body', async () => {
      const params = Promise.resolve({ id: mockResourceId });
      const request = new Request('http://localhost:3000/api/resources/resource-123', {
        method: 'PUT',
        body: 'invalid json',
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should handle database errors during update', async () => {
      vi.spyOn(Resource, 'findOneAndUpdate').mockRejectedValue(new Error('Database error'));

      const params = Promise.resolve({ id: mockResourceId });
      const request = new Request('http://localhost:3000/api/resources/resource-123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'posts' }),
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should allow adding new fields to existing resource', async () => {
      const updatedFields = [
        ...mockResource.fields,
        { name: 'createdAt', type: 'date' },
        { name: 'isActive', type: 'boolean' },
      ];
      vi.spyOn(Resource, 'findOneAndUpdate').mockResolvedValue({
        ...mockResource,
        fields: updatedFields,
      } as any);

      const params = Promise.resolve({ id: mockResourceId });
      const request = new Request('http://localhost:3000/api/resources/resource-123', {
        method: 'PUT',
        body: JSON.stringify({ fields: updatedFields }),
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.fields).toHaveLength(4);
    });

    it('should allow removing fields from existing resource', async () => {
      const reducedFields = [mockResource.fields[0]];
      vi.spyOn(Resource, 'findOneAndUpdate').mockResolvedValue({
        ...mockResource,
        fields: reducedFields,
      } as any);

      const params = Promise.resolve({ id: mockResourceId });
      const request = new Request('http://localhost:3000/api/resources/resource-123', {
        method: 'PUT',
        body: JSON.stringify({ fields: reducedFields }),
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.fields).toHaveLength(1);
    });

    it('should handle fields with all valid types', async () => {
      const allTypeFields = [
        { name: 'name', type: 'string' },
        { name: 'age', type: 'number' },
        { name: 'active', type: 'boolean' },
        { name: 'createdAt', type: 'date' },
        { name: 'email', type: 'email' },
        { name: 'id', type: 'uuid' },
        { name: 'avatar', type: 'image' },
        { name: 'userId', type: 'relation' },
      ];
      vi.spyOn(Resource, 'findOneAndUpdate').mockResolvedValue({
        ...mockResource,
        fields: allTypeFields,
      } as any);

      const params = Promise.resolve({ id: mockResourceId });
      const request = new Request('http://localhost:3000/api/resources/resource-123', {
        method: 'PUT',
        body: JSON.stringify({ fields: allTypeFields }),
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.fields).toHaveLength(8);
    });

    it('should allow empty fields array', async () => {
      vi.spyOn(Resource, 'findOneAndUpdate').mockResolvedValue({
        ...mockResource,
        fields: [],
      } as any);

      const params = Promise.resolve({ id: mockResourceId });
      const request = new Request('http://localhost:3000/api/resources/resource-123', {
        method: 'PUT',
        body: JSON.stringify({ fields: [] }),
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.fields).toEqual([]);
    });
  });
});
