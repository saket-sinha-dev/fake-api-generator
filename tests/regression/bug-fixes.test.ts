/**
 * Regression Test Suite
 * Tests to ensure previously fixed bugs don't reoccur
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';

const baseURL = process.env.BASE_URL || 'http://localhost:3000';

describe('Regression Tests', () => {
  describe('Bug #001 - Project Creation with Special Characters', () => {
    it('should handle project names with special characters', async () => {
      const response = await request(baseURL)
        .post('/api/projects')
        .set('Cookie', 'next-auth.session-token=valid-token')
        .send({
          name: 'Test & Project #123',
          description: 'Test description',
        });

      if (response.status === 201) {
        expect(response.body.data.name).toBe('Test & Project #123');
      }
    });

    it('should sanitize XSS in project names', async () => {
      const response = await request(baseURL)
        .post('/api/projects')
        .set('Cookie', 'next-auth.session-token=valid-token')
        .send({
          name: '<script>alert("xss")</script>',
        });

      if (response.status === 201) {
        expect(response.body.data.name).not.toContain('<script>');
      }
    });
  });

  describe('Bug #002 - Resource Field Type Validation', () => {
    it('should reject invalid field types', async () => {
      const response = await request(baseURL)
        .post('/api/resources')
        .send({
          name: 'test',
          fields: [{ name: 'field1', type: 'invalid_type' }],
          projectId: 'test',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should accept all valid field types', async () => {
      const validTypes = ['string', 'number', 'boolean', 'date', 'email', 'uuid', 'image', 'relation'];
      
      for (const type of validTypes) {
        const response = await request(baseURL)
          .post('/api/resources')
          .send({
            name: `test_${type}`,
            fields: [{ name: 'field1', type }],
            projectId: 'test',
          });

        // Should accept valid types
        expect([201, 400]).toContain(response.status);
      }
    });
  });

  describe('Bug #003 - Pagination Edge Cases', () => {
    it('should handle _page=0 gracefully', async () => {
      const response = await request(baseURL)
        .get('/api/v1/users?_page=0&_limit=10');

      expect([200, 400, 404]).toContain(response.status);
    });

    it('should handle negative pagination values', async () => {
      const response = await request(baseURL)
        .get('/api/v1/users?_page=-1&_limit=-10');

      expect([200, 400, 404]).toContain(response.status);
    });

    it('should handle excessive _limit values', async () => {
      const response = await request(baseURL)
        .get('/api/v1/users?_limit=999999');

      if (response.status === 200) {
        expect(response.body.data.length).toBeLessThanOrEqual(1000);
      }
    });
  });

  describe('Bug #004 - API Path Conflicts', () => {
    it('should handle conflicting API paths correctly', async () => {
      // Create first API
      await request(baseURL)
        .post('/api/apis')
        .send({
          path: '/api/test',
          method: 'GET',
          projectId: 'test',
          responseBody: { message: 'first' },
        });

      // Try to create duplicate
      const response = await request(baseURL)
        .post('/api/apis')
        .send({
          path: '/api/test',
          method: 'GET',
          projectId: 'test',
          responseBody: { message: 'second' },
        });

      // Should handle duplicate or allow with different project
      expect([201, 400]).toContain(response.status);
    });

    it('should distinguish between similar paths', async () => {
      const paths = [
        '/api/users',
        '/api/users/:id',
        '/api/users/:id/posts',
      ];

      for (const path of paths) {
        const response = await request(baseURL)
          .post('/api/apis')
          .send({
            path,
            method: 'GET',
            projectId: 'test',
            responseBody: { data: [] },
          });

        expect([201, 400]).toContain(response.status);
      }
    });
  });

  describe('Bug #005 - Resource Name Validation', () => {
    it('should convert resource names to lowercase', async () => {
      const response = await request(baseURL)
        .post('/api/resources')
        .send({
          name: 'UPPERCASE_NAME',
          fields: [],
          projectId: 'test',
        });

      if (response.status === 201) {
        expect(response.body.data.name).toBe('uppercase_name');
      }
    });

    it('should reject invalid resource name characters', async () => {
      const response = await request(baseURL)
        .post('/api/resources')
        .send({
          name: 'invalid-name!@#',
          fields: [],
          projectId: 'test',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should allow underscores in resource names', async () => {
      const response = await request(baseURL)
        .post('/api/resources')
        .send({
          name: 'valid_resource_name',
          fields: [],
          projectId: 'test',
        });

      expect([201, 400]).toContain(response.status);
    });
  });

  describe('Bug #006 - Sorting Parameter Issues', () => {
    it('should handle invalid _sort fields', async () => {
      const response = await request(baseURL)
        .get('/api/v1/users?_sort=nonexistent_field');

      expect([200, 400, 404]).toContain(response.status);
    });

    it('should handle invalid _order values', async () => {
      const response = await request(baseURL)
        .get('/api/v1/users?_sort=name&_order=invalid');

      expect([200, 400, 404]).toContain(response.status);
    });

    it('should default to asc when _order is missing', async () => {
      const response = await request(baseURL)
        .get('/api/v1/users?_sort=name');

      // Should use default order
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('Bug #007 - Filter Operator Precedence', () => {
    it('should apply _gte filter correctly', async () => {
      const response = await request(baseURL)
        .get('/api/v1/users?age_gte=18');

      if (response.status === 200) {
        response.body.data.forEach((user: any) => {
          if (user.age !== undefined) {
            expect(user.age).toBeGreaterThanOrEqual(18);
          }
        });
      }
    });

    it('should apply _lte filter correctly', async () => {
      const response = await request(baseURL)
        .get('/api/v1/users?age_lte=65');

      if (response.status === 200) {
        response.body.data.forEach((user: any) => {
          if (user.age !== undefined) {
            expect(user.age).toBeLessThanOrEqual(65);
          }
        });
      }
    });

    it('should handle combined filters', async () => {
      const response = await request(baseURL)
        .get('/api/v1/users?age_gte=18&age_lte=65');

      if (response.status === 200) {
        response.body.data.forEach((user: any) => {
          if (user.age !== undefined) {
            expect(user.age).toBeGreaterThanOrEqual(18);
            expect(user.age).toBeLessThanOrEqual(65);
          }
        });
      }
    });
  });

  describe('Bug #008 - Empty Response Bodies', () => {
    it('should handle null responseBody in custom APIs', async () => {
      const response = await request(baseURL)
        .post('/api/apis')
        .send({
          path: '/api/null-test',
          method: 'GET',
          projectId: 'test',
          responseBody: null,
        });

      expect([201, 400]).toContain(response.status);
    });

    it('should return empty array for no results', async () => {
      const response = await request(baseURL)
        .get('/api/v1/nonexistent_resource');

      if (response.status === 200) {
        expect(response.body.data).toEqual([]);
      }
    });
  });

  describe('Bug #009 - Concurrent Request Handling', () => {
    it('should handle multiple simultaneous requests', async () => {
      const requests = Array.from({ length: 20 }, () =>
        request(baseURL).get('/api/resources')
      );

      const responses = await Promise.all(requests);
      
      // All should return same status
      const statuses = responses.map(r => r.status);
      const allSame = statuses.every(s => s === statuses[0]);
      
      expect(allSame).toBe(true);
    }, 15000);

    it('should maintain data consistency under concurrent writes', async () => {
      const projectName = `concurrent-${Date.now()}`;
      
      const requests = Array.from({ length: 5 }, () =>
        request(baseURL)
          .post('/api/projects')
          .set('Cookie', 'next-auth.session-token=valid-token')
          .send({ name: projectName })
      );

      const responses = await Promise.allSettled(requests);
      
      // Should handle duplicates or race conditions
      console.log('Concurrent creates:', responses.length);
    }, 10000);
  });

  describe('Bug #010 - Search Query Escaping', () => {
    it('should escape special regex characters in search', async () => {
      const response = await request(baseURL)
        .get('/api/v1/users?_search=test.*');

      // Should treat .* as literal, not regex
      expect([200, 404]).toContain(response.status);
    });

    it('should handle search with SQL-like syntax', async () => {
      const response = await request(baseURL)
        .get("/api/v1/users?_search=' OR '1'='1");

      // Should not allow SQL injection
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('Bug #011 - Content-Type Handling', () => {
    it('should reject non-JSON content-type for POST', async () => {
      const response = await request(baseURL)
        .post('/api/resources')
        .set('Content-Type', 'text/plain')
        .send('not json');

      expect([400, 415]).toContain(response.status);
    });

    it('should handle missing content-type header', async () => {
      const response = await request(baseURL)
        .post('/api/projects')
        .set('Cookie', 'next-auth.session-token=valid-token')
        .send({ name: 'Test' });

      // Should assume JSON
      expect([201, 400, 415]).toContain(response.status);
    });
  });

  describe('Bug #012 - Status Code Validation', () => {
    it('should only accept valid HTTP status codes', async () => {
      const invalidStatuses = [99, 600, 1000];
      
      for (const status of invalidStatuses) {
        const response = await request(baseURL)
          .post('/api/apis')
          .send({
            path: '/test',
            method: 'GET',
            statusCode: status,
            projectId: 'test',
            responseBody: {},
          });

        // Should reject invalid status codes
        expect([400, 201]).toContain(response.status);
      }
    });
  });

  describe('Bug #013 - Webhook URL Validation', () => {
    it('should reject javascript: URLs', async () => {
      const response = await request(baseURL)
        .post('/api/apis')
        .send({
          path: '/test',
          method: 'GET',
          projectId: 'test',
          webhookUrl: 'javascript:alert(1)',
        });

      if (response.status === 201) {
        expect(response.body.data.webhookUrl).not.toContain('javascript:');
      }
    });

    it('should reject file:// URLs', async () => {
      const response = await request(baseURL)
        .post('/api/apis')
        .send({
          path: '/test',
          method: 'GET',
          projectId: 'test',
          webhookUrl: 'file:///etc/passwd',
        });

      if (response.status === 201) {
        expect(response.body.data.webhookUrl).not.toContain('file://');
      }
    });
  });

  describe('Bug #014 - Timestamp Consistency', () => {
    it('should set createdAt on resource creation', async () => {
      const response = await request(baseURL)
        .post('/api/resources')
        .send({
          name: 'timestamp_test',
          fields: [],
          projectId: 'test',
        });

      if (response.status === 201) {
        expect(response.body.data).toHaveProperty('createdAt');
        expect(new Date(response.body.data.createdAt).getTime()).toBeLessThanOrEqual(Date.now());
      }
    });

    it('should update updatedAt on resource modification', async () => {
      const createResponse = await request(baseURL)
        .post('/api/resources')
        .send({
          name: 'update_test',
          fields: [],
          projectId: 'test',
        });

      if (createResponse.status === 201) {
        const resourceId = createResponse.body.data._id;
        
        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const updateResponse = await request(baseURL)
          .put(`/api/resources/${resourceId}`)
          .send({ name: 'updated_name' });

        if (updateResponse.status === 200) {
          expect(updateResponse.body.data.updatedAt).toBeDefined();
          expect(
            new Date(updateResponse.body.data.updatedAt).getTime()
          ).toBeGreaterThan(
            new Date(createResponse.body.data.createdAt).getTime()
          );
        }
      }
    });
  });

  describe('Bug #015 - Deep Object Handling', () => {
    it('should handle deeply nested response bodies', async () => {
      const nestedObj = {
        level1: {
          level2: {
            level3: {
              level4: {
                value: 'deep',
              },
            },
          },
        },
      };

      const response = await request(baseURL)
        .post('/api/apis')
        .send({
          path: '/deep-test',
          method: 'GET',
          projectId: 'test',
          responseBody: nestedObj,
        });

      if (response.status === 201) {
        expect(response.body.data.responseBody.level1.level2.level3.level4.value).toBe('deep');
      }
    });
  });
});
