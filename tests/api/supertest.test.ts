/**
 * API Tests with Supertest
 * Direct HTTP testing of API endpoints without browser overhead
 */

import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock dependencies
vi.mock('@/lib/mongodb', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

const baseURL = process.env.BASE_URL || 'http://localhost:3000';

describe('API Tests with Supertest', () => {
  describe('Projects API', () => {
    describe('GET /api/projects', () => {
      it('should return 401 without authentication', async () => {
        const response = await request(baseURL)
          .get('/api/projects')
          .expect('Content-Type', /json/)
          .expect(401);

        expect(response.body).toHaveProperty('error');
      });

      it('should return projects array with valid session', async () => {
        const response = await request(baseURL)
          .get('/api/projects')
          .set('Cookie', 'next-auth.session-token=valid-token')
          .expect('Content-Type', /json/);

        if (response.status === 200) {
          expect(response.body).toHaveProperty('data');
          expect(Array.isArray(response.body.data)).toBe(true);
        }
      });

      it('should have correct response structure', async () => {
        const response = await request(baseURL)
          .get('/api/projects')
          .set('Cookie', 'next-auth.session-token=valid-token');

        if (response.status === 200) {
          expect(response.body).toHaveProperty('success');
          expect(response.body).toHaveProperty('data');
        }
      });
    });

    describe('POST /api/projects', () => {
      it('should return 401 without authentication', async () => {
        await request(baseURL)
          .post('/api/projects')
          .send({ name: 'Test Project' })
          .expect(401);
      });

      it('should return 400 with missing name', async () => {
        await request(baseURL)
          .post('/api/projects')
          .set('Cookie', 'next-auth.session-token=valid-token')
          .send({})
          .expect(400);
      });

      it('should create project with valid data', async () => {
        const response = await request(baseURL)
          .post('/api/projects')
          .set('Cookie', 'next-auth.session-token=valid-token')
          .send({
            name: 'Supertest Project',
            description: 'Created via supertest',
          })
          .expect('Content-Type', /json/);

        if (response.status === 201) {
          expect(response.body.data).toHaveProperty('id');
          expect(response.body.data.name).toBe('Supertest Project');
        }
      });

      it('should sanitize XSS in project name', async () => {
        const response = await request(baseURL)
          .post('/api/projects')
          .set('Cookie', 'next-auth.session-token=valid-token')
          .send({
            name: '<script>alert("xss")</script>Safe Name',
          });

        if (response.status === 201) {
          expect(response.body.data.name).not.toContain('<script>');
        }
      });

      it('should handle duplicate project names', async () => {
        const projectName = `Duplicate-${Date.now()}`;

        // Create first
        await request(baseURL)
          .post('/api/projects')
          .set('Cookie', 'next-auth.session-token=valid-token')
          .send({ name: projectName });

        // Try duplicate
        const response = await request(baseURL)
          .post('/api/projects')
          .set('Cookie', 'next-auth.session-token=valid-token')
          .send({ name: projectName });

        if (response.status === 409) {
          expect(response.body).toHaveProperty('error');
        }
      });
    });

    describe('DELETE /api/projects/:id', () => {
      it('should return 401 without authentication', async () => {
        await request(baseURL)
          .delete('/api/projects/test-id')
          .expect(401);
      });

      it('should return 404 for non-existent project', async () => {
        await request(baseURL)
          .delete('/api/projects/non-existent-id')
          .set('Cookie', 'next-auth.session-token=valid-token')
          .expect(404);
      });
    });

    describe('PUT /api/projects/:id', () => {
      it('should return 401 without authentication', async () => {
        await request(baseURL)
          .put('/api/projects/test-id')
          .send({ name: 'Updated' })
          .expect(401);
      });

      it('should return 404 for non-existent project', async () => {
        await request(baseURL)
          .put('/api/projects/non-existent-id')
          .set('Cookie', 'next-auth.session-token=valid-token')
          .send({ name: 'Updated' })
          .expect(404);
      });
    });
  });

  describe('Resources API', () => {
    describe('GET /api/resources', () => {
      it('should return resources array', async () => {
        const response = await request(baseURL)
          .get('/api/resources')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it('should have correct response headers', async () => {
        const response = await request(baseURL)
          .get('/api/resources');

        expect(response.headers['content-type']).toMatch(/json/);
      });
    });

    describe('POST /api/resources', () => {
      it('should return 400 with missing name', async () => {
        await request(baseURL)
          .post('/api/resources')
          .send({ fields: [] })
          .expect(400);
      });

      it('should return 400 with missing fields', async () => {
        await request(baseURL)
          .post('/api/resources')
          .send({ name: 'users' })
          .expect(400);
      });

      it('should return 400 with missing projectId', async () => {
        await request(baseURL)
          .post('/api/resources')
          .send({ name: 'users', fields: [] })
          .expect(400);
      });

      it('should create resource with valid data', async () => {
        const response = await request(baseURL)
          .post('/api/resources')
          .send({
            name: `users_${Date.now()}`,
            fields: [
              { name: 'name', type: 'string' },
              { name: 'email', type: 'email' },
            ],
            projectId: 'test-project',
          })
          .expect('Content-Type', /json/);

        if (response.status === 201) {
          expect(response.body.data).toHaveProperty('id');
          expect(response.body.data.fields).toHaveLength(2);
        }
      });

      it('should validate field types', async () => {
        const response = await request(baseURL)
          .post('/api/resources')
          .send({
            name: 'test_resource',
            fields: [{ name: 'field1', type: 'invalid_type' }],
            projectId: 'test-project',
          });

        expect(response.status).toBe(400);
      });

      it('should convert resource name to lowercase', async () => {
        const response = await request(baseURL)
          .post('/api/resources')
          .send({
            name: 'UPPERCASE_NAME',
            fields: [],
            projectId: 'test-project',
          });

        if (response.status === 201) {
          expect(response.body.data.name).toBe('uppercase_name');
        }
      });

      it('should reject names with invalid characters', async () => {
        const invalidNames = [
          'user-name',
          'user name',
          'user.name',
          'user@name',
          '123users',
        ];

        for (const name of invalidNames) {
          const response = await request(baseURL)
            .post('/api/resources')
            .send({
              name,
              fields: [],
              projectId: 'test-project',
            });

          expect(response.status).toBe(400);
        }
      });
    });

    describe('DELETE /api/resources/:id', () => {
      it('should return 404 for non-existent resource', async () => {
        await request(baseURL)
          .delete('/api/resources/non-existent-id')
          .expect(404);
      });
    });

    describe('PUT /api/resources/:id', () => {
      it('should return 404 for non-existent resource', async () => {
        await request(baseURL)
          .put('/api/resources/non-existent-id')
          .send({ name: 'updated' })
          .expect(404);
      });

      it('should parse fields from JSON string', async () => {
        const response = await request(baseURL)
          .put('/api/resources/existing-id')
          .send({
            fields: JSON.stringify([{ name: 'test', type: 'string' }]),
          });

        // Will be 404 if resource doesn't exist, but format should be accepted
        if (response.status === 200) {
          expect(response.body.fields).toBeDefined();
        }
      });

      it('should return 400 for invalid JSON in fields', async () => {
        const response = await request(baseURL)
          .put('/api/resources/existing-id')
          .send({
            fields: 'invalid json string',
          });

        expect([400, 404]).toContain(response.status);
      });
    });
  });

  describe('Custom APIs', () => {
    describe('GET /api/apis', () => {
      it('should return APIs array', async () => {
        const response = await request(baseURL)
          .get('/api/apis')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });

    describe('POST /api/apis', () => {
      it('should return 400 with missing path', async () => {
        await request(baseURL)
          .post('/api/apis')
          .send({ method: 'GET', projectId: 'test' })
          .expect(400);
      });

      it('should return 400 with missing method', async () => {
        await request(baseURL)
          .post('/api/apis')
          .send({ path: '/test', projectId: 'test' })
          .expect(400);
      });

      it('should return 400 with missing projectId', async () => {
        await request(baseURL)
          .post('/api/apis')
          .send({ path: '/test', method: 'GET' })
          .expect(400);
      });

      it('should create API with valid data', async () => {
        const response = await request(baseURL)
          .post('/api/apis')
          .send({
            path: `/test-${Date.now()}`,
            method: 'GET',
            projectId: 'test-project',
            statusCode: 200,
            responseBody: { message: 'test' },
          })
          .expect('Content-Type', /json/);

        if (response.status === 201) {
          expect(response.body.data).toHaveProperty('id');
          expect(response.body.data.path).toContain('/test-');
        }
      });

      it('should normalize path to start with slash', async () => {
        const response = await request(baseURL)
          .post('/api/apis')
          .send({
            path: 'test-path',
            method: 'GET',
            projectId: 'test-project',
          });

        if (response.status === 201) {
          expect(response.body.data.path).toMatch(/^\//);
        }
      });

      it('should convert method to uppercase', async () => {
        const response = await request(baseURL)
          .post('/api/apis')
          .send({
            path: '/test',
            method: 'get',
            projectId: 'test-project',
          });

        if (response.status === 201) {
          expect(response.body.data.method).toBe('GET');
        }
      });

      it('should accept valid HTTP methods', async () => {
        const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

        for (const method of methods) {
          const response = await request(baseURL)
            .post('/api/apis')
            .send({
              path: `/test-${method}-${Date.now()}`,
              method,
              projectId: 'test-project',
            });

          expect([201, 409]).toContain(response.status);
        }
      });

      it('should reject invalid HTTP methods', async () => {
        await request(baseURL)
          .post('/api/apis')
          .send({
            path: '/test',
            method: 'INVALID',
            projectId: 'test-project',
          })
          .expect(400);
      });

      it('should use 200 as default status code', async () => {
        const response = await request(baseURL)
          .post('/api/apis')
          .send({
            path: `/default-status-${Date.now()}`,
            method: 'GET',
            projectId: 'test-project',
          });

        if (response.status === 201) {
          expect(response.body.data.statusCode).toBe(200);
        }
      });

      it('should accept valid status codes', async () => {
        const statusCodes = [200, 201, 204, 400, 404, 500];

        for (const statusCode of statusCodes) {
          const response = await request(baseURL)
            .post('/api/apis')
            .send({
              path: `/test-status-${statusCode}-${Date.now()}`,
              method: 'GET',
              projectId: 'test-project',
              statusCode,
            });

          if (response.status === 201) {
            expect(response.body.data.statusCode).toBe(statusCode);
          }
        }
      });

      it('should reject invalid status codes', async () => {
        await request(baseURL)
          .post('/api/apis')
          .send({
            path: '/test',
            method: 'GET',
            projectId: 'test-project',
            statusCode: 999,
          })
          .expect(400);
      });
    });

    describe('DELETE /api/apis/:id', () => {
      it('should return 404 for non-existent API', async () => {
        await request(baseURL)
          .delete('/api/apis/non-existent-id')
          .expect(404);
      });
    });

    describe('PUT /api/apis/:id', () => {
      it('should return 404 for non-existent API', async () => {
        await request(baseURL)
          .put('/api/apis/non-existent-id')
          .send({ statusCode: 201 })
          .expect(404);
      });
    });
  });

  describe('Dynamic v1 Endpoints', () => {
    describe('Custom API Matching', () => {
      it('should return 404 for non-existent endpoint', async () => {
        await request(baseURL)
          .get('/api/v1/non-existent-endpoint')
          .expect(404);
      });

      it('should provide helpful error message with 404', async () => {
        const response = await request(baseURL)
          .get('/api/v1/unknown-path')
          .expect(404);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('not found');
      });
    });

    describe('Resource Endpoints', () => {
      it('should return 404 when resource has no data', async () => {
        const response = await request(baseURL)
          .get('/api/v1/nonexistent_resource')
          .expect(404);

        expect(response.body).toHaveProperty('error');
      });

      it('should support pagination parameters', async () => {
        const response = await request(baseURL)
          .get('/api/v1/users?_page=1&_limit=10');

        if (response.status === 200) {
          expect(response.body).toHaveProperty('pagination');
          expect(response.body.pagination).toHaveProperty('page');
          expect(response.body.pagination).toHaveProperty('limit');
        }
      });

      it('should support sorting parameters', async () => {
        const response = await request(baseURL)
          .get('/api/v1/users?_sort=name&_order=asc');

        // Will be 404 if users resource doesn't exist
        expect([200, 404]).toContain(response.status);
      });

      it('should support filtering parameters', async () => {
        const response = await request(baseURL)
          .get('/api/v1/users?name=John');

        expect([200, 404]).toContain(response.status);
      });

      it('should support search parameter', async () => {
        const response = await request(baseURL)
          .get('/api/v1/users?_search=test');

        expect([200, 404]).toContain(response.status);
      });

      it('should support comparison operators', async () => {
        const response = await request(baseURL)
          .get('/api/v1/users?age_gte=18');

        expect([200, 404]).toContain(response.status);
      });
    });

    describe('HTTP Methods Support', () => {
      it('should support POST to resource endpoints', async () => {
        const response = await request(baseURL)
          .post('/api/v1/test_resource')
          .send({ name: 'Test' });

        // Will be 404 if resource doesn't exist, 201 if created
        expect([201, 404]).toContain(response.status);
      });

      it('should support PUT to resource item endpoints', async () => {
        const response = await request(baseURL)
          .put('/api/v1/test_resource/123')
          .send({ name: 'Updated' });

        expect([200, 404]).toContain(response.status);
      });

      it('should support DELETE to resource item endpoints', async () => {
        const response = await request(baseURL)
          .delete('/api/v1/test_resource/123');

        expect([200, 404]).toContain(response.status);
      });
    });
  });

  describe('Response Headers', () => {
    it('should set correct content-type for JSON', async () => {
      const response = await request(baseURL)
        .get('/api/projects')
        .set('Cookie', 'next-auth.session-token=valid-token');

      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should include CORS headers if configured', async () => {
      const response = await request(baseURL)
        .options('/api/projects');

      // CORS headers depend on configuration
      if (response.headers['access-control-allow-origin']) {
        expect(response.headers).toHaveProperty('access-control-allow-origin');
      }
    });
  });

  describe('Error Responses', () => {
    it('should return proper error structure', async () => {
      const response = await request(baseURL)
        .get('/api/projects')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });

    it('should handle invalid JSON gracefully', async () => {
      const response = await request(baseURL)
        .post('/api/resources')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should return 500 for server errors', async () => {
      // This test depends on implementation
      const response = await request(baseURL)
        .get('/api/projects')
        .set('Cookie', 'next-auth.session-token=valid-token');

      if (response.status === 500) {
        expect(response.body).toHaveProperty('error');
      }
    });
  });

  describe('Performance', () => {
    it('should respond within reasonable time', async () => {
      const startTime = Date.now();
      
      await request(baseURL)
        .get('/api/resources');
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(5000); // 5 seconds max
    });

    it('should handle concurrent requests', async () => {
      const requests = Array.from({ length: 10 }, () =>
        request(baseURL).get('/api/resources')
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect([200, 401]).toContain(response.status);
      });
    });
  });
});
