/**
 * Unit Tests for API Response Utilities
 * 
 * NOTE: These functions return NextResponse objects, so we need to call .json() to access the body
 */

import { describe, it, expect } from 'vitest';
import { 
  successResponse, 
  errorResponse, 
  paginatedResponse,
  createdResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  badRequestResponse
} from '@/lib/apiResponse';
import { HTTP_STATUS } from '@/lib/constants';

describe('API Response Utilities', () => {
  describe('successResponse', () => {
    it('should create success response with data', async () => {
      const data = { id: '123', name: 'Test' };
      const response = successResponse(data);
      const json = await response.json();
      
      expect(json.success).toBe(true);
      expect(json.data).toEqual(data);
      expect(response.status).toBe(200);
    });

    it('should create success response with custom message', async () => {
      const data = { id: '456' };
      const message = 'Resource created successfully';
      const response = successResponse(data, HTTP_STATUS.OK, message);
      const json = await response.json();
      
      expect(json.success).toBe(true);
      expect(json.data).toEqual(data);
      expect(json.message).toBe(message);
    });

    it('should create success response with custom status code', async () => {
      const data = { id: '789' };
      const response = successResponse(data, 201, 'Created');
      const json = await response.json();
      
      expect(json.success).toBe(true);
      expect(response.status).toBe(201);
      expect(json.message).toBe('Created');
    });

    it('should handle null data', async () => {
      const response = successResponse(null);
      const json = await response.json();
      
      expect(json.success).toBe(true);
      expect(json.data).toBeNull();
    });

    it('should handle array data', async () => {
      const data = [{ id: '1' }, { id: '2' }];
      const response = successResponse(data);
      const json = await response.json();
      
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data).toHaveLength(2);
    });
  });

  describe('errorResponse', () => {
    it('should create error response with message', async () => {
      const message = 'Something went wrong';
      const response = errorResponse(message);
      const json = await response.json();
      
      expect(json.success).toBe(false);
      expect(json.error).toBe(message);
      expect(response.status).toBe(500);
    });

    it('should create error response with custom status code', async () => {
      const message = 'Not found';
      const response = errorResponse(message, 404);
      const json = await response.json();
      
      expect(json.success).toBe(false);
      expect(json.error).toBe(message);
      expect(response.status).toBe(404);
    });

    it('should handle different HTTP error codes', async () => {
      const codes = [400, 401, 403, 404, 409, 422, 500, 502, 503];
      
      for (const code of codes) {
        const response = errorResponse('Error', code);
        const json = await response.json();
        expect(response.status).toBe(code);
        expect(json.success).toBe(false);
      }
    });
  });

  describe('paginatedResponse', () => {
    it('should create paginated response with data', async () => {
      const data = [{ id: '1' }, { id: '2' }, { id: '3' }];
      const response = paginatedResponse(data, 1, 10, 50);
      const json = await response.json();
      
      expect(json.success).toBe(true);
      expect(json.data).toEqual(data);
      expect(json.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 50,
        totalPages: 5
      });
    });

    it('should calculate total pages correctly', async () => {
      const cases = [
        { total: 50, limit: 10, expectedPages: 5 },
        { total: 55, limit: 10, expectedPages: 6 },
        { total: 100, limit: 25, expectedPages: 4 },
        { total: 7, limit: 10, expectedPages: 1 },
        { total: 0, limit: 10, expectedPages: 0 }
      ];

      for (const { total, limit, expectedPages } of cases) {
        const response = paginatedResponse([], 1, limit, total);
        const json = await response.json();
        expect(json.pagination.totalPages).toBe(expectedPages);
      }
    });

    it('should handle empty data array', async () => {
      const response = paginatedResponse([], 1, 10, 0);
      const json = await response.json();
      
      expect(json.success).toBe(true);
      expect(json.data).toEqual([]);
      expect(json.pagination.total).toBe(0);
      expect(json.pagination.totalPages).toBe(0);
    });

    it('should handle different page numbers', async () => {
      const data = [{ id: '1' }];
      const response = paginatedResponse(data, 3, 10, 50);
      const json = await response.json();
      
      expect(json.pagination.page).toBe(3);
      expect(json.pagination.totalPages).toBe(5);
    });
  });

  describe('createdResponse', () => {
    it('should create 201 response with data', async () => {
      const data = { id: 'new123', name: 'New Resource' };
      const response = createdResponse(data);
      const json = await response.json();
      
      expect(json.success).toBe(true);
      expect(json.data).toEqual(data);
      expect(response.status).toBe(201);
    });

    it('should include custom message', async () => {
      const data = { id: 'test' };
      const message = 'Resource created';
      const response = createdResponse(data, message);
      const json = await response.json();
      
      expect(json.message).toBe(message);
      expect(response.status).toBe(201);
    });
  });

  describe('notFoundResponse', () => {
    it('should create 404 response', async () => {
      const response = notFoundResponse();
      const json = await response.json();
      
      expect(json.success).toBe(false);
      expect(response.status).toBe(404);
    });

    it('should include custom message', async () => {
      const message = 'Resource not found';
      const response = notFoundResponse(message);
      const json = await response.json();
      
      expect(json.error).toBe(message);
    });
  });

  describe('unauthorizedResponse', () => {
    it('should create 401 response', async () => {
      const response = unauthorizedResponse();
      const json = await response.json();
      
      expect(json.success).toBe(false);
      expect(response.status).toBe(401);
    });
  });

  describe('forbiddenResponse', () => {
    it('should create 403 response', async () => {
      const response = forbiddenResponse();
      const json = await response.json();
      
      expect(json.success).toBe(false);
      expect(response.status).toBe(403);
    });
  });

  describe('badRequestResponse', () => {
    it('should create 400 response', async () => {
      const response = badRequestResponse();
      const json = await response.json();
      
      expect(json.success).toBe(false);
      expect(response.status).toBe(400);
    });
  });

  describe('response structure consistency', () => {
    it('success responses should have consistent structure', async () => {
      const response = successResponse({ test: 'data' });
      const json = await response.json();
      
      expect(json).toHaveProperty('success');
      expect(json).toHaveProperty('data');
    });

    it('error responses should have consistent structure', async () => {
      const response = errorResponse('Error');
      const json = await response.json();
      
      expect(json).toHaveProperty('success');
      expect(json).toHaveProperty('error');
    });

    it('paginated responses should have consistent structure', async () => {
      const response = paginatedResponse([], 1, 10, 0);
      const json = await response.json();
      
      expect(json).toHaveProperty('success');
      expect(json).toHaveProperty('data');
      expect(json).toHaveProperty('pagination');
    });
  });
});
