/**
 * Integration Tests for /api/projects/[id]
 * Tests project DELETE and PUT operations with authentication and authorization
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DELETE, PUT } from '@/app/api/projects/[id]/route';
import { auth } from '@/auth';
import type { ServiceResult } from '@/interfaces';

// Mock MongoDB connection
vi.mock('@/lib/mongodb', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

// Mock auth
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

// Mock Container to return mocked service
const mockProjectService = {
  deleteProject: vi.fn(),
  updateProject: vi.fn(),
};

vi.mock('@/container/Container', () => ({
  getProjectService: () => mockProjectService,
}));

describe('Projects [id] Endpoint Integration Tests', () => {
  const mockUserId = 'user@example.com';
  const mockCollaboratorId = 'collaborator@example.com';
  const mockProjectId = 'project-123';
  const mockProject = {
    id: mockProjectId,
    name: 'Test Project',
    description: 'Test description',
    userId: mockUserId,
    collaborators: [mockCollaboratorId],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('DELETE /api/projects/[id]', () => {
    it('should delete project successfully as owner', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: mockUserId },
      } as any);

      mockProjectService.deleteProject.mockResolvedValue({
        success: true,
        data: undefined,
      } as ServiceResult<void>);

      const params = Promise.resolve({ id: mockProjectId });
      const request = new Request('http://localhost:3000/api/projects/project-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockProjectService.deleteProject).toHaveBeenCalledWith(mockProjectId, mockUserId);
    });

    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const params = Promise.resolve({ id: mockProjectId });
      const request = new Request('http://localhost:3000/api/projects/project-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 when project not found', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: mockUserId },
      } as any);

      mockProjectService.deleteProject.mockResolvedValue({
        success: false,
        error: 'Project not found',
        statusCode: 404,
      } as ServiceResult<void>);

      const params = Promise.resolve({ id: 'non-existent' });
      const request = new Request('http://localhost:3000/api/projects/non-existent', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Project not found');
    });

    it('should return 403 when user is not the owner', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'other-user@example.com' },
      } as any);

      mockProjectService.deleteProject.mockResolvedValue({
        success: false,
        error: 'Only project owner can delete',
        statusCode: 403,
      } as ServiceResult<void>);

      const params = Promise.resolve({ id: mockProjectId });
      const request = new Request('http://localhost:3000/api/projects/project-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Only project owner can delete');
    });

    it('should return 403 when collaborator tries to delete', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: mockCollaboratorId },
      } as any);

      mockProjectService.deleteProject.mockResolvedValue({
        success: false,
        error: 'Only project owner can delete',
        statusCode: 403,
      } as ServiceResult<void>);

      const params = Promise.resolve({ id: mockProjectId });
      const request = new Request('http://localhost:3000/api/projects/project-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Only project owner can delete');
    });

    it('should handle database errors during deletion', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: mockUserId },
      } as any);

      mockProjectService.deleteProject.mockRejectedValue(new Error('Database error'));

      const params = Promise.resolve({ id: mockProjectId });
      const request = new Request('http://localhost:3000/api/projects/project-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('PUT /api/projects/[id]', () => {
    it('should update project successfully as owner', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: mockUserId },
      } as any);

      const updatedProject = { ...mockProject, name: 'Updated Name' };
      mockProjectService.updateProject.mockResolvedValue({
        success: true,
        data: updatedProject,
      } as ServiceResult<any>);

      const params = Promise.resolve({ id: mockProjectId });
      const request = new Request('http://localhost:3000/api/projects/project-123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Name' }),
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe('Updated Name');
    });

    it('should update project successfully as collaborator', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: mockCollaboratorId },
      } as any);

      const updatedProject = { ...mockProject, description: 'New description' };
      mockProjectService.updateProject.mockResolvedValue({
        success: true,
        data: updatedProject,
      } as ServiceResult<any>);

      const params = Promise.resolve({ id: mockProjectId });
      const request = new Request('http://localhost:3000/api/projects/project-123', {
        method: 'PUT',
        body: JSON.stringify({ description: 'New description' }),
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.description).toBe('New description');
    });

    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null as any);

      const params = Promise.resolve({ id: mockProjectId });
      const request = new Request('http://localhost:3000/api/projects/project-123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' }),
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 when project not found', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: mockUserId },
      } as any);

      mockProjectService.updateProject.mockResolvedValue({
        success: false,
        error: 'Project not found',
        statusCode: 404,
      } as ServiceResult<any>);

      const params = Promise.resolve({ id: 'non-existent' });
      const request = new Request('http://localhost:3000/api/projects/non-existent', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' }),
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Project not found');
    });

    it('should return 403 when user has no access', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: 'unauthorized@example.com' },
      } as any);

      mockProjectService.updateProject.mockResolvedValue({
        success: false,
        error: 'Access denied',
        statusCode: 403,
      } as ServiceResult<any>);

      const params = Promise.resolve({ id: mockProjectId });
      const request = new Request('http://localhost:3000/api/projects/project-123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' }),
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Access denied');
    });

    it('should update multiple fields', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: mockUserId },
      } as any);

      mockProjectService.updateProject.mockResolvedValue({
        success: true,
        data: {
          ...mockProject,
          name: 'New Name',
          description: 'New Description',
        },
      } as ServiceResult<any>);

      const params = Promise.resolve({ id: mockProjectId });
      const request = new Request('http://localhost:3000/api/projects/project-123', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'New Name',
          description: 'New Description',
        }),
      });

      const response = await PUT(request, { params });

      expect(response.status).toBe(200);
      expect(mockProjectService.updateProject).toHaveBeenCalledWith(
        mockProjectId,
        mockUserId,
        expect.objectContaining({
          name: 'New Name',
          description: 'New Description',
        })
      );
    });

    it('should set updatedAt timestamp', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: mockUserId },
      } as any);

      const updatedProject = { ...mockProject, updatedAt: new Date() };
      mockProjectService.updateProject.mockResolvedValue({
        success: true,
        data: updatedProject,
      } as ServiceResult<any>);

      const params = Promise.resolve({ id: mockProjectId });
      const request = new Request('http://localhost:3000/api/projects/project-123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' }),
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(data.updatedAt).toBeDefined();
    });

    it('should handle invalid JSON in request body', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: mockUserId },
      } as any);

      const params = Promise.resolve({ id: mockProjectId });
      const request = new Request('http://localhost:3000/api/projects/project-123', {
        method: 'PUT',
        body: 'invalid json',
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should handle database errors during update', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: mockUserId },
      } as any);

      mockProjectService.updateProject.mockRejectedValue(new Error('Database error'));

      const params = Promise.resolve({ id: mockProjectId });
      const request = new Request('http://localhost:3000/api/projects/project-123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' }),
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should allow owner to update collaborators', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: mockUserId },
      } as any);

      mockProjectService.updateProject.mockResolvedValue({
        success: true,
        data: {
          ...mockProject,
          collaborators: ['new@example.com'],
        },
      } as ServiceResult<any>);

      const params = Promise.resolve({ id: mockProjectId });
      const request = new Request('http://localhost:3000/api/projects/project-123', {
        method: 'PUT',
        body: JSON.stringify({
          collaborators: ['new@example.com'],
        }),
      });

      const response = await PUT(request, { params });

      expect(response.status).toBe(200);
      expect(mockProjectService.updateProject).toHaveBeenCalled();
    });

    it('should allow collaborator to update without changing collaborators list', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { email: mockCollaboratorId },
      } as any);

      mockProjectService.updateProject.mockResolvedValue({
        success: true,
        data: { ...mockProject, name: 'Updated by collaborator' },
      } as ServiceResult<any>);

      const params = Promise.resolve({ id: mockProjectId });
      const request = new Request('http://localhost:3000/api/projects/project-123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated by collaborator' }),
      });

      const response = await PUT(request, { params });

      expect(response.status).toBe(200);
      expect(mockProjectService.updateProject).toHaveBeenCalled();
    });
  });
});
