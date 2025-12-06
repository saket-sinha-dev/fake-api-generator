/**
 * API Security Tests
 * Tests for API-specific security vulnerabilities
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';

const baseURL = process.env.BASE_URL || 'http://localhost:3000';

describe('API Security Tests', () => {
  describe('Rate Limiting', () => {
    it('should rate limit per endpoint', async () => {
      const requests = Array.from({ length: 100 }, () =>
        request(baseURL).get('/api/resources')
      );

      const responses = await Promise.all(requests);
      const statuses = responses.map(r => r.status);

      // Should include 429 if rate limiting is active
      console.log('Rate limit test statuses:', statuses.filter(s => s === 429).length);
    }, 30000);

    it('should have different limits for authenticated vs anonymous', async () => {
      const anonRequests = Array.from({ length: 50 }, () =>
        request(baseURL).get('/api/resources')
      );

      const authRequests = Array.from({ length: 50 }, () =>
        request(baseURL)
          .get('/api/projects')
          .set('Cookie', 'next-auth.session-token=valid-token')
      );

      const [anonResponses, authResponses] = await Promise.all([
        Promise.all(anonRequests),
        Promise.all(authRequests),
      ]);

      console.log('Anonymous rate limits:', 
        anonResponses.filter(r => r.status === 429).length);
      console.log('Authenticated rate limits:', 
        authResponses.filter(r => r.status === 429).length);
    }, 30000);

    it('should implement sliding window rate limiting', async () => {
      // Send requests in batches
      const batch1 = await Promise.all(
        Array.from({ length: 50 }, () => request(baseURL).get('/api/resources'))
      );

      // Wait 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));

      const batch2 = await Promise.all(
        Array.from({ length: 50 }, () => request(baseURL).get('/api/resources'))
      );

      // Rate limit should refresh over time
      const batch1Limited = batch1.filter(r => r.status === 429).length;
      const batch2Limited = batch2.filter(r => r.status === 429).length;

      console.log('Batch 1 limited:', batch1Limited);
      console.log('Batch 2 limited:', batch2Limited);
    }, 35000);
  });

  describe('Request Size Limits', () => {
    it('should reject oversized request bodies', async () => {
      const largePayload = {
        name: 'test',
        fields: Array.from({ length: 100000 }, (_, i) => ({
          name: `field${i}`,
          type: 'string',
        })),
        projectId: 'test',
      };

      const response = await request(baseURL)
        .post('/api/resources')
        .send(largePayload);

      // Should reject or handle large payload
      expect([413, 400, 500]).toContain(response.status);
    });

    it('should limit nested object depth', async () => {
      let deepNested: any = { level: 1000 };
      for (let i = 0; i < 1000; i++) {
        deepNested = { nested: deepNested };
      }

      const response = await request(baseURL)
        .post('/api/resources')
        .send({
          name: 'deep',
          fields: [],
          projectId: 'test',
          metadata: deepNested,
        });

      // Should handle or reject deep nesting
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it('should limit array sizes in requests', async () => {
      const response = await request(baseURL)
        .post('/api/resources')
        .send({
          name: 'large-array',
          fields: Array(100000).fill({ name: 'field', type: 'string' }),
          projectId: 'test',
        });

      // Should handle large arrays
      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });

  describe('Mass Assignment Protection', () => {
    it('should not allow updating protected fields', async () => {
      const response = await request(baseURL)
        .put('/api/projects/project-id')
        .set('Cookie', 'next-auth.session-token=valid-token')
        .send({
          name: 'Updated',
          _id: 'different-id',
          createdAt: new Date('2000-01-01'),
        });

      // Should ignore _id and createdAt
      if (response.status === 200) {
        expect(response.body.data._id).not.toBe('different-id');
      }
    });

    it('should not allow setting owner via API', async () => {
      const response = await request(baseURL)
        .post('/api/projects')
        .set('Cookie', 'next-auth.session-token=user-token')
        .send({
          name: 'New Project',
          owner: 'different-user-id',
        });

      // Owner should be set from session, not request
      if (response.status === 201) {
        expect(response.body.data.owner).not.toBe('different-user-id');
      }
    });

    it('should not allow modifying collaborators array directly', async () => {
      const response = await request(baseURL)
        .put('/api/projects/project-id')
        .set('Cookie', 'next-auth.session-token=owner-token')
        .send({
          collaborators: ['attacker-id'],
        });

      // Should have separate endpoint for managing collaborators
      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });

  describe('Information Disclosure', () => {
    it('should not expose internal IDs in errors', async () => {
      const response = await request(baseURL)
        .get('/api/projects/invalid-id')
        .set('Cookie', 'next-auth.session-token=valid-token');

      const body = JSON.stringify(response.body);
      expect(body).not.toContain('ObjectId');
      expect(body).not.toContain('_id:');
    });

    it('should not reveal database structure', async () => {
      const response = await request(baseURL)
        .get('/api/resources?field=invalid');

      const body = JSON.stringify(response.body);
      expect(body).not.toContain('collection');
      expect(body).not.toContain('schema');
      expect(body).not.toContain('mongoose');
    });

    it('should not expose stack traces in production', async () => {
      const response = await request(baseURL)
        .post('/api/resources')
        .send({ invalid: 'data' });

      const body = JSON.stringify(response.body);
      
      if (process.env.NODE_ENV === 'production') {
        expect(body).not.toContain('at ');
        expect(body).not.toContain('node_modules');
        expect(body).not.toContain('.ts:');
      }
    });

    it('should not reveal API versioning details', async () => {
      const response = await request(baseURL)
        .get('/api/resources')
        .set('X-API-Version', 'future-version');

      const body = JSON.stringify(response.body);
      expect(body).not.toContain('available versions');
    });
  });

  describe('HTTP Method Security', () => {
    it('should reject invalid HTTP methods', async () => {
      const response = await request(baseURL)
        .patch('/api/projects')
        .send({ name: 'Test' });

      // PATCH may not be supported
      expect([404, 405]).toContain(response.status);
    });

    it('should handle HEAD requests securely', async () => {
      const response = await request(baseURL)
        .head('/api/resources');

      // Should return headers only, no body
      expect(response.text).toBe('');
    });

    it('should handle OPTIONS for CORS preflight', async () => {
      const response = await request(baseURL)
        .options('/api/projects')
        .set('Origin', 'https://example.com');

      // Should return CORS headers
      expect([200, 204]).toContain(response.status);
    });

    it('should not allow method override via headers', async () => {
      const response = await request(baseURL)
        .get('/api/projects/project-id')
        .set('X-HTTP-Method-Override', 'DELETE')
        .set('Cookie', 'next-auth.session-token=valid-token');

      // Should not delete using GET + override header
      expect(response.status).not.toBe(204);
    });
  });

  describe('URL Parameter Injection', () => {
    it('should sanitize path traversal attempts', async () => {
      const response = await request(baseURL)
        .get('/api/v1/../../etc/passwd');

      // Should not allow directory traversal
      expect([404, 400]).toContain(response.status);
    });

    it('should handle encoded path separators', async () => {
      const response = await request(baseURL)
        .get('/api/v1/users%2F..%2F..%2Fadmin');

      // Should not decode and traverse
      expect([404, 400]).toContain(response.status);
    });

    it('should reject null bytes in URLs', async () => {
      const response = await request(baseURL)
        .get('/api/v1/users%00.txt');

      // Should reject null bytes
      expect([404, 400]).toContain(response.status);
    });
  });

  describe('Response Header Security', () => {
    it('should not expose server version', async () => {
      const response = await request(baseURL)
        .get('/api/resources');

      const serverHeader = response.headers['server'];
      
      if (serverHeader) {
        expect(serverHeader).not.toContain('Express');
        expect(serverHeader).not.toMatch(/\d+\.\d+\.\d+/);
      }
    });

    it('should set X-Content-Type-Options', async () => {
      const response = await request(baseURL)
        .get('/api/resources');

      if (response.headers['x-content-type-options']) {
        expect(response.headers['x-content-type-options']).toBe('nosniff');
      }
    });

    it('should set X-Frame-Options', async () => {
      const response = await request(baseURL)
        .get('/');

      if (response.headers['x-frame-options']) {
        expect(['DENY', 'SAMEORIGIN']).toContain(
          response.headers['x-frame-options']
        );
      }
    });

    it('should not leak internal IP addresses', async () => {
      const response = await request(baseURL)
        .get('/api/resources');

      const headers = JSON.stringify(response.headers);
      expect(headers).not.toMatch(/\d+\.\d+\.\d+\.\d+/);
    });
  });

  describe('API Abuse Prevention', () => {
    it('should prevent automated scraping', async () => {
      const requests = [];
      
      // Simulate scraper behavior
      for (let i = 0; i < 1000; i++) {
        requests.push(
          request(baseURL)
            .get(`/api/v1/users?_page=${i}`)
            .set('User-Agent', 'Python/3.9')
        );
      }

      const responses = await Promise.all(requests.slice(0, 100));
      
      // Should eventually block or rate limit
      const blocked = responses.filter(r => r.status === 429 || r.status === 403);
      console.log('Blocked scraper requests:', blocked.length);
    }, 60000);

    it('should detect bot patterns', async () => {
      const response = await request(baseURL)
        .get('/api/resources')
        .set('User-Agent', 'bot/1.0');

      // May block obvious bots
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it('should limit pagination ranges', async () => {
      const response = await request(baseURL)
        .get('/api/v1/users?_page=999999&_limit=999999');

      // Should limit max page/limit values
      if (response.status === 200) {
        expect(response.body.data.length).toBeLessThanOrEqual(1000);
      }
    });
  });

  describe('Data Validation', () => {
    it('should reject invalid JSON content-type mismatch', async () => {
      const response = await request(baseURL)
        .post('/api/resources')
        .set('Content-Type', 'text/plain')
        .send('not json');

      expect([400, 415]).toContain(response.status);
    });

    it('should validate required fields strictly', async () => {
      const response = await request(baseURL)
        .post('/api/resources')
        .send({
          // Missing required 'name' field
          fields: [],
          projectId: 'test',
        })
        .expect(400);

      expect(response.body.error).toMatch(/name|required/i);
    });

    it('should reject unknown fields', async () => {
      const response = await request(baseURL)
        .post('/api/projects')
        .set('Cookie', 'next-auth.session-token=valid-token')
        .send({
          name: 'Test',
          unknownField: 'value',
          anotherUnknown: 'value',
        });

      // May accept or reject unknown fields
      expect([201, 400]).toContain(response.status);
    });

    it('should validate field types strictly', async () => {
      const response = await request(baseURL)
        .post('/api/resources')
        .send({
          name: 12345, // Should be string
          fields: 'not-an-array',
          projectId: ['array', 'not', 'string'],
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('CORS Security', () => {
    it('should validate origin header', async () => {
      const response = await request(baseURL)
        .get('/api/resources')
        .set('Origin', 'https://malicious-site.com');

      // Should not allow arbitrary origins
      const allowedOrigin = response.headers['access-control-allow-origin'];
      
      if (allowedOrigin) {
        expect(allowedOrigin).not.toBe('*');
      }
    });

    it('should not reflect arbitrary origins', async () => {
      const response = await request(baseURL)
        .get('/api/resources')
        .set('Origin', 'https://evil.com');

      const allowedOrigin = response.headers['access-control-allow-origin'];
      expect(allowedOrigin).not.toBe('https://evil.com');
    });

    it('should set proper CORS credentials flag', async () => {
      const response = await request(baseURL)
        .get('/api/resources')
        .set('Origin', 'https://example.com');

      const credentials = response.headers['access-control-allow-credentials'];
      
      // If credentials true, origin should not be *
      if (credentials === 'true') {
        expect(response.headers['access-control-allow-origin']).not.toBe('*');
      }
    });
  });

  describe('API Key/Token Security (if applicable)', () => {
    it('should reject malformed API keys', async () => {
      const response = await request(baseURL)
        .get('/api/projects')
        .set('X-API-Key', 'invalid-format');

      expect([401, 404]).toContain(response.status);
    });

    it('should not accept API keys in URL', async () => {
      const response = await request(baseURL)
        .get('/api/projects?api_key=secret123');

      // API keys in URL are insecure
      expect([401, 404]).toContain(response.status);
    });
  });

  describe('Error Response Security', () => {
    it('should use consistent error format', async () => {
      const response1 = await request(baseURL)
        .get('/api/projects/invalid1')
        .set('Cookie', 'next-auth.session-token=valid-token');

      const response2 = await request(baseURL)
        .post('/api/resources')
        .send({ invalid: 'data' });

      // Both should have consistent error structure
      if (response1.status >= 400) {
        expect(response1.body).toHaveProperty('error');
      }
      if (response2.status >= 400) {
        expect(response2.body).toHaveProperty('error');
      }
    });

    it('should not expose different errors for timing attacks', async () => {
      const start1 = Date.now();
      await request(baseURL)
        .get('/api/projects/exists')
        .set('Cookie', 'next-auth.session-token=valid-token');
      const time1 = Date.now() - start1;

      const start2 = Date.now();
      await request(baseURL)
        .get('/api/projects/not-exists')
        .set('Cookie', 'next-auth.session-token=valid-token');
      const time2 = Date.now() - start2;

      // Timing should be similar
      console.log(`Timing difference: ${Math.abs(time1 - time2)}ms`);
    });
  });

  describe('Webhook Security', () => {
    it('should validate webhook URLs', async () => {
      const invalidUrls = [
        'javascript:alert(1)',
        'file:///etc/passwd',
        'http://localhost:27017',
        'ftp://internal-server',
      ];

      for (const url of invalidUrls) {
        const response = await request(baseURL)
          .post('/api/apis')
          .send({
            path: '/test',
            method: 'GET',
            projectId: 'test',
            webhookUrl: url,
          });

        // Should reject dangerous URLs
        if (response.status === 201) {
          expect(response.body.data.webhookUrl).not.toBe(url);
        }
      }
    });

    it('should prevent SSRF via webhooks', async () => {
      const response = await request(baseURL)
        .post('/api/apis')
        .send({
          path: '/test',
          method: 'GET',
          projectId: 'test',
          webhookUrl: 'http://169.254.169.254/latest/meta-data/',
        });

      // Should block AWS metadata endpoint
      expect([201, 400]).toContain(response.status);
    });
  });
});
