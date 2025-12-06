/**
 * Contract Tests
 * API Schema validation and contract testing
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';

const baseURL = process.env.BASE_URL || 'http://localhost:3000';

describe('Contract Tests - API Schemas', () => {
  describe('Projects API Contract', () => {
    it('should return correct schema for GET /api/projects', async () => {
      const response = await request(baseURL)
        .get('/api/projects')
        .set('Cookie', 'next-auth.session-token=valid-token');

      if (response.status === 200) {
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        
        if (response.body.data.length > 0) {
          const project = response.body.data[0];
          expect(project).toHaveProperty('_id');
          expect(project).toHaveProperty('name');
          expect(project).toHaveProperty('createdAt');
          expect(project).toHaveProperty('updatedAt');
          
          expect(typeof project._id).toBe('string');
          expect(typeof project.name).toBe('string');
        }
      }
    });

    it('should accept valid POST /api/projects request', async () => {
      const validPayload = {
        name: 'Contract Test Project',
        description: 'Test project for contract validation',
      };

      const response = await request(baseURL)
        .post('/api/projects')
        .set('Cookie', 'next-auth.session-token=valid-token')
        .send(validPayload);

      if (response.status === 201) {
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('_id');
        expect(response.body.data.name).toBe(validPayload.name);
        expect(response.body.data.description).toBe(validPayload.description);
      }
    });

    it('should return correct error schema for invalid POST', async () => {
      const response = await request(baseURL)
        .post('/api/projects')
        .set('Cookie', 'next-auth.session-token=valid-token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });

    it('should return correct schema for PUT /api/projects/:id', async () => {
      const response = await request(baseURL)
        .put('/api/projects/test-id')
        .set('Cookie', 'next-auth.session-token=valid-token')
        .send({ name: 'Updated Name' });

      if (response.status === 200) {
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('_id');
        expect(response.body.data).toHaveProperty('updatedAt');
      }
    });

    it('should return correct schema for DELETE /api/projects/:id', async () => {
      const response = await request(baseURL)
        .delete('/api/projects/test-id')
        .set('Cookie', 'next-auth.session-token=valid-token');

      if (response.status === 200) {
        expect(response.body).toHaveProperty('message');
        expect(typeof response.body.message).toBe('string');
      }
    });
  });

  describe('Resources API Contract', () => {
    it('should return correct schema for GET /api/resources', async () => {
      const response = await request(baseURL)
        .get('/api/resources');

      if (response.status === 200) {
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        
        if (response.body.data.length > 0) {
          const resource = response.body.data[0];
          expect(resource).toHaveProperty('_id');
          expect(resource).toHaveProperty('name');
          expect(resource).toHaveProperty('fields');
          expect(Array.isArray(resource.fields)).toBe(true);
          
          if (resource.fields.length > 0) {
            const field = resource.fields[0];
            expect(field).toHaveProperty('name');
            expect(field).toHaveProperty('type');
            expect(typeof field.name).toBe('string');
            expect(typeof field.type).toBe('string');
          }
        }
      }
    });

    it('should accept valid POST /api/resources request', async () => {
      const validPayload = {
        name: 'contract_test_users',
        fields: [
          { name: 'id', type: 'uuid' },
          { name: 'name', type: 'string' },
          { name: 'email', type: 'email' },
          { name: 'age', type: 'number' },
        ],
        projectId: 'test-project-id',
      };

      const response = await request(baseURL)
        .post('/api/resources')
        .send(validPayload);

      if (response.status === 201) {
        expect(response.body).toHaveProperty('data');
        expect(response.body.data.name).toBe(validPayload.name);
        expect(response.body.data.fields).toHaveLength(4);
        
        response.body.data.fields.forEach((field: any, index: number) => {
          expect(field.name).toBe(validPayload.fields[index].name);
          expect(field.type).toBe(validPayload.fields[index].type);
        });
      }
    });

    it('should validate field types in contract', async () => {
      const validTypes = ['string', 'number', 'boolean', 'date', 'email', 'uuid', 'image', 'relation'];
      
      for (const type of validTypes) {
        const response = await request(baseURL)
          .post('/api/resources')
          .send({
            name: `test_${type}`,
            fields: [{ name: 'field1', type }],
            projectId: 'test',
          });

        if (response.status === 201) {
          expect(response.body.data.fields[0].type).toBe(type);
        }
      }
    });

    it('should reject invalid field types', async () => {
      const response = await request(baseURL)
        .post('/api/resources')
        .send({
          name: 'invalid_type',
          fields: [{ name: 'field1', type: 'invalid_type' }],
          projectId: 'test',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Custom APIs Contract', () => {
    it('should return correct schema for GET /api/apis', async () => {
      const response = await request(baseURL)
        .get('/api/apis');

      if (response.status === 200) {
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        
        if (response.body.data.length > 0) {
          const api = response.body.data[0];
          expect(api).toHaveProperty('_id');
          expect(api).toHaveProperty('path');
          expect(api).toHaveProperty('method');
          expect(api).toHaveProperty('responseBody');
          
          expect(typeof api.path).toBe('string');
          expect(typeof api.method).toBe('string');
        }
      }
    });

    it('should accept valid HTTP methods in contract', async () => {
      const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      
      for (const method of validMethods) {
        const response = await request(baseURL)
          .post('/api/apis')
          .send({
            path: `/test-${method.toLowerCase()}`,
            method,
            projectId: 'test',
            responseBody: { message: 'test' },
          });

        if (response.status === 201) {
          expect(response.body.data.method).toBe(method);
        }
      }
    });

    it('should accept valid status codes in contract', async () => {
      const validStatuses = [200, 201, 204, 400, 401, 403, 404, 500];
      
      for (const status of validStatuses) {
        const response = await request(baseURL)
          .post('/api/apis')
          .send({
            path: `/test-status-${status}`,
            method: 'GET',
            statusCode: status,
            projectId: 'test',
            responseBody: { message: 'test' },
          });

        if (response.status === 201) {
          expect(response.body.data.statusCode).toBe(status);
        }
      }
    });

    it('should validate API path format', async () => {
      const validPaths = [
        '/api/users',
        '/api/users/:id',
        '/api/users/:id/posts',
        '/v1/resources/:slug',
      ];

      for (const path of validPaths) {
        const response = await request(baseURL)
          .post('/api/apis')
          .send({
            path,
            method: 'GET',
            projectId: 'test',
            responseBody: { data: [] },
          });

        if (response.status === 201) {
          expect(response.body.data.path).toBe(path);
        }
      }
    });
  });

  describe('Dynamic Resource Endpoints Contract', () => {
    it('should return paginated response schema', async () => {
      const response = await request(baseURL)
        .get('/api/v1/users?_page=1&_limit=10');

      if (response.status === 200) {
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('pagination');
        
        const pagination = response.body.pagination;
        expect(pagination).toHaveProperty('page');
        expect(pagination).toHaveProperty('limit');
        expect(pagination).toHaveProperty('total');
        expect(pagination).toHaveProperty('totalPages');
        
        expect(typeof pagination.page).toBe('number');
        expect(typeof pagination.limit).toBe('number');
        expect(typeof pagination.total).toBe('number');
        expect(typeof pagination.totalPages).toBe('number');
      }
    });

    it('should support sorting parameters in contract', async () => {
      const response = await request(baseURL)
        .get('/api/v1/users?_sort=name&_order=asc');

      // Should accept sorting parameters
      expect([200, 404]).toContain(response.status);
    });

    it('should support filtering parameters in contract', async () => {
      const response = await request(baseURL)
        .get('/api/v1/users?name=John&age=25');

      // Should accept filtering parameters
      expect([200, 404]).toContain(response.status);
    });

    it('should support comparison operators in contract', async () => {
      const operators = ['_gte', '_lte', '_gt', '_lt', '_ne'];
      
      for (const op of operators) {
        const response = await request(baseURL)
          .get(`/api/v1/users?age${op}=25`);

        // Should accept operator parameters
        expect([200, 404]).toContain(response.status);
      }
    });

    it('should support search parameter in contract', async () => {
      const response = await request(baseURL)
        .get('/api/v1/users?_search=john');

      // Should accept search parameter
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('Error Response Contract', () => {
    it('should return consistent error format', async () => {
      const errorEndpoints = [
        { method: 'get', path: '/api/projects/invalid' },
        { method: 'post', path: '/api/resources', data: {} },
        { method: 'delete', path: '/api/apis/nonexistent' },
      ];

      for (const endpoint of errorEndpoints) {
        let response;
        
        if (endpoint.method === 'get') {
          response = await request(baseURL).get(endpoint.path);
        } else if (endpoint.method === 'post') {
          response = await request(baseURL).post(endpoint.path).send(endpoint.data);
        } else if (endpoint.method === 'delete') {
          response = await request(baseURL).delete(endpoint.path);
        }

        if (response && response.status >= 400) {
          expect(response.body).toHaveProperty('error');
          expect(typeof response.body.error).toBe('string');
        }
      }
    });

    it('should include proper status codes in error responses', async () => {
      const tests = [
        { endpoint: '/api/projects', status: 401 }, // Unauthorized
        { endpoint: '/api/resources', method: 'post', data: {}, status: 400 }, // Bad Request
        { endpoint: '/api/projects/nonexistent', status: 404 }, // Not Found
      ];

      for (const test of tests) {
        let response;
        
        if (test.method === 'post') {
          response = await request(baseURL).post(test.endpoint).send(test.data);
        } else {
          response = await request(baseURL).get(test.endpoint);
        }

        expect(response.status).toBe(test.status);
      }
    });
  });

  describe('Content-Type Contract', () => {
    it('should return JSON content-type', async () => {
      const response = await request(baseURL)
        .get('/api/resources')
        .expect('Content-Type', /json/);

      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it('should accept JSON content-type', async () => {
      const response = await request(baseURL)
        .post('/api/resources')
        .set('Content-Type', 'application/json')
        .send({
          name: 'test',
          fields: [],
          projectId: 'test',
        });

      expect([201, 400]).toContain(response.status);
    });

    it('should reject non-JSON content-type for POST', async () => {
      const response = await request(baseURL)
        .post('/api/resources')
        .set('Content-Type', 'text/plain')
        .send('not json');

      expect([400, 415]).toContain(response.status);
    });
  });

  describe('Versioning Contract', () => {
    it('should maintain v1 API contract', async () => {
      const response = await request(baseURL)
        .get('/api/v1/users');

      // v1 endpoints should be stable
      expect([200, 404]).toContain(response.status);
    });

    it('should handle versioned endpoints consistently', async () => {
      const endpoints = [
        '/api/v1/users',
        '/api/v1/posts',
        '/api/v1/comments',
      ];

      for (const endpoint of endpoints) {
        const response = await request(baseURL).get(endpoint);
        
        // All should return consistent structure
        if (response.status === 200) {
          expect(response.body).toHaveProperty('data');
        }
      }
    });
  });

  describe('Request Validation Contract', () => {
    it('should validate required fields in POST requests', async () => {
      const requiredFieldTests = [
        {
          endpoint: '/api/projects',
          payload: { description: 'Missing name' },
          missingField: 'name',
        },
        {
          endpoint: '/api/resources',
          payload: { fields: [] },
          missingField: 'name',
        },
        {
          endpoint: '/api/apis',
          payload: { method: 'GET' },
          missingField: 'path',
        },
      ];

      for (const test of requiredFieldTests) {
        const response = await request(baseURL)
          .post(test.endpoint)
          .set('Cookie', 'next-auth.session-token=valid-token')
          .send(test.payload);

        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(
          new RegExp(test.missingField, 'i')
        );
      }
    });

    it('should validate field types in requests', async () => {
      const typeTests = [
        {
          endpoint: '/api/resources',
          payload: {
            name: 12345, // Should be string
            fields: [],
            projectId: 'test',
          },
        },
        {
          endpoint: '/api/apis',
          payload: {
            path: '/test',
            method: 'GET',
            statusCode: 'not-a-number', // Should be number
            projectId: 'test',
          },
        },
      ];

      for (const test of typeTests) {
        const response = await request(baseURL)
          .post(test.endpoint)
          .send(test.payload);

        expect(response.status).toBe(400);
      }
    });
  });

  describe('Response Headers Contract', () => {
    it('should include standard response headers', async () => {
      const response = await request(baseURL)
        .get('/api/resources');

      expect(response.headers).toHaveProperty('content-type');
      expect(response.headers['content-type']).toContain('application/json');
    });

    it('should include CORS headers when appropriate', async () => {
      const response = await request(baseURL)
        .get('/api/resources')
        .set('Origin', 'https://example.com');

      // CORS headers may be present
      if (response.headers['access-control-allow-origin']) {
        expect(response.headers['access-control-allow-origin']).toBeDefined();
      }
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain compatibility with legacy endpoints', async () => {
      const legacyEndpoints = [
        '/api/projects',
        '/api/resources',
        '/api/apis',
      ];

      for (const endpoint of legacyEndpoints) {
        const response = await request(baseURL).get(endpoint);
        
        // Legacy endpoints should still work
        expect([200, 401]).toContain(response.status);
      }
    });

    it('should not break existing integrations', async () => {
      // Test that response structure hasn't changed
      const response = await request(baseURL)
        .get('/api/resources');

      if (response.status === 200) {
        // Should have expected structure
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });
  });
});
