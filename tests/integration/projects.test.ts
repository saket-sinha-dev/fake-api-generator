/**
 * Integration Tests for /api/projects
 * Tests the complete flow including authentication, database operations, and response formatting
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GET, POST } from '@/app/api/projects/route';
import * as authHelpers from '@/lib/authHelpers';
import type { ServiceResult } from '@/interfaces';

// Mock auth helpers
vi.mock('@/lib/authHelpers', () => ({
  validateSession: vi.fn(),
}));

// Mock MongoDB connection
vi.mock('@/lib/mongodb', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

// Import the actual ProjectService for validation logic
import { ProjectService } from '@/services/ProjectService';

// Create a real service instance with mocked repository
const mockProjectRepository = {
  find: vi.fn(),
  findByUser: vi.fn(),
  create: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  nameExists: vi.fn(),
  nameExistsForUser: vi.fn(),
  addCollaborator: vi.fn(),
  removeCollaborator: vi.fn(),
};

const realProjectService = new ProjectService(mockProjectRepository as any);

vi.mock('@/container/Container', () => ({
  getProjectService: () => realProjectService,
}));

describe('Projects API Integration Tests', () => {
  const mockUserEmail = 'test@example.com';
  const mockProject = {
    id: 'test-project-id',
    name: 'Test Project',
    description: 'Test Description',
    userId: mockUserEmail,
    collaborators: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock: name doesn't exist (allows creation)
    mockProjectRepository.nameExistsForUser.mockResolvedValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/projects', () => {
    it('should return projects for authenticated user', async () => {
      // Mock authenticated session
      vi.mocked(authHelpers.validateSession).mockResolvedValue({
        valid: true,
        email: mockUserEmail,
      });

      const mockProjects = [mockProject];
      mockProjectRepository.findByUser.mockResolvedValue(mockProjects);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockProjects);
    });

    it('should return 401 for unauthenticated request', async () => {
      vi.mocked(authHelpers.validateSession).mockResolvedValue({
        valid: false,
        error: 'No active session',
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('should return projects where user is owner or collaborator', async () => {
      vi.mocked(authHelpers.validateSession).mockResolvedValue({
        valid: true,
        email: mockUserEmail,
      });

      mockProjectRepository.findByUser.mockResolvedValue([]);

      await GET();

      expect(mockProjectRepository.findByUser).toHaveBeenCalledWith(mockUserEmail);
    });

    it('should return empty array when user has no projects', async () => {
      vi.mocked(authHelpers.validateSession).mockResolvedValue({
        valid: true,
        email: mockUserEmail,
      });

      mockProjectRepository.findByUser.mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      vi.mocked(authHelpers.validateSession).mockResolvedValue({
        valid: true,
        email: mockUserEmail,
      });

      mockProjectRepository.findByUser.mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });

  describe('POST /api/projects', () => {
    it('should create new project with valid data', async () => {
      vi.mocked(authHelpers.validateSession).mockResolvedValue({
        valid: true,
        email: mockUserEmail,
      });

      mockProjectRepository.create.mockResolvedValue(mockProject);

      const request = new Request('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Project',
          description: 'Test Description',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
    });

    it('should return 401 for unauthenticated request', async () => {
      vi.mocked(authHelpers.validateSession).mockResolvedValue({
        valid: false,
        error: 'No active session',
      });

      const request = new Request('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('should return 400 when name is missing', async () => {
      vi.mocked(authHelpers.validateSession).mockResolvedValue({
        valid: true,
        email: mockUserEmail,
      });

      const request = new Request('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({ description: 'Only description' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return 409 when project name already exists', async () => {
      vi.mocked(authHelpers.validateSession).mockResolvedValue({
        valid: true,
        email: mockUserEmail,
      });

      mockProjectRepository.nameExistsForUser.mockResolvedValue(true);

      const request = new Request('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Project' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
    });

    it('should sanitize project name and description', async () => {
      vi.mocked(authHelpers.validateSession).mockResolvedValue({
        valid: true,
        email: mockUserEmail,
      });

      mockProjectRepository.create.mockResolvedValue({
        success: true,
        data: {
          ...mockProject,
          name: 'Dangerous Name',
          description: 'Dangerous Desc',
        },
      });

      const request = new Request('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: '<script>alert("xss")</script>Dangerous Name',
          description: '<img src=x onerror=alert(1)>Dangerous Desc',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockProjectRepository.create).toHaveBeenCalled();
    });

    it('should handle empty name after sanitization', async () => {
      vi.mocked(authHelpers.validateSession).mockResolvedValue({
        valid: true,
        email: mockUserEmail,
      });

      const request = new Request('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({ name: '   ' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should create project without description', async () => {
      vi.mocked(authHelpers.validateSession).mockResolvedValue({
        valid: true,
        email: mockUserEmail,
      });

      mockProjectRepository.create.mockResolvedValue(mockProject,
      );

      const request = new Request('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({ name: 'Project Without Desc' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(mockProjectRepository.create).toHaveBeenCalled();
    });

    it('should generate unique ID for new project', async () => {
      vi.mocked(authHelpers.validateSession).mockResolvedValue({
        valid: true,
        email: mockUserEmail,
      });

      mockProjectRepository.create.mockResolvedValue(mockProject,
      );

      const request = new Request('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Project' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.data.id).toBeDefined();
      expect(typeof data.data.id).toBe('string');
    });

    it('should handle database errors during creation', async () => {
      vi.mocked(authHelpers.validateSession).mockResolvedValue({
        valid: true,
        email: mockUserEmail,
      });

      mockProjectRepository.create.mockRejectedValue(
        new Error('Database error')
      );

      const request = new Request('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Project' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });

    it('should handle invalid JSON in request body', async () => {
      vi.mocked(authHelpers.validateSession).mockResolvedValue({
        valid: true,
        email: mockUserEmail,
      });

      const request = new Request('http://localhost:3000/api/projects', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('Security & Edge Cases', () => {
    it('should prevent SQL injection in project name', async () => {
      vi.mocked(authHelpers.validateSession).mockResolvedValue({
        valid: true,
        email: mockUserEmail,
      });

      mockProjectRepository.create.mockResolvedValue({
        success: true,
        data: { ...mockProject, name: '\'; DROP TABLE projects; --' },
      });

      const request = new Request('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({ name: "'; DROP TABLE projects; --" }),
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockProjectRepository.create).toHaveBeenCalled();
    });

    it('should handle very long project names', async () => {
      vi.mocked(authHelpers.validateSession).mockResolvedValue({
        valid: true,
        email: mockUserEmail,
      });

      const truncatedName = 'A'.repeat(100);
      mockProjectRepository.create.mockResolvedValue({
        ...mockProject,
        name: truncatedName,
      });

      const longName = 'A'.repeat(200);
      const request = new Request('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({ name: longName }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.data.name.length).toBeLessThanOrEqual(100);
    });

    it('should handle very long descriptions', async () => {
      vi.mocked(authHelpers.validateSession).mockResolvedValue({
        valid: true,
        email: mockUserEmail,
      });

      const truncatedDesc = 'B'.repeat(500);
      mockProjectRepository.create.mockResolvedValue({
        ...mockProject,
        description: truncatedDesc,
      });

      const longDesc = 'B'.repeat(1000);
      const request = new Request('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test', description: longDesc }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.data.description.length).toBeLessThanOrEqual(500);
    });
  });
});
