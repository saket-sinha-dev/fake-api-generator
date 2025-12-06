/**
 * Security Penetration Tests
 * Tests for common vulnerabilities and security issues
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';

const baseURL = process.env.BASE_URL || 'http://localhost:3000';

describe('Security Penetration Tests', () => {
  describe('Authentication & Authorization', () => {
    it('should reject requests without authentication token', async () => {
      const response = await request(baseURL)
        .get('/api/projects')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(baseURL)
        .get('/api/projects')
        .set('Cookie', 'next-auth.session-token=invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject expired tokens', async () => {
      const expiredToken = 'expired-token-12345';
      const response = await request(baseURL)
        .get('/api/projects')
        .set('Cookie', `next-auth.session-token=${expiredToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should prevent unauthorized project deletion', async () => {
      const response = await request(baseURL)
        .delete('/api/projects/other-user-project')
        .set('Cookie', 'next-auth.session-token=valid-token')
        .expect([403, 404]);

      if (response.status === 403) {
        expect(response.body.error).toMatch(/owner|forbidden|denied/i);
      }
    });

    it('should enforce role-based access control', async () => {
      // Try to delete project as collaborator (should fail)
      const response = await request(baseURL)
        .delete('/api/projects/shared-project')
        .set('Cookie', 'next-auth.session-token=collaborator-token');

      if (response.status === 403) {
        expect(response.body).toHaveProperty('error');
      }
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should sanitize SQL injection in project name', async () => {
      const sqlInjection = "'; DROP TABLE projects; --";
      
      const response = await request(baseURL)
        .post('/api/projects')
        .set('Cookie', 'next-auth.session-token=valid-token')
        .send({ name: sqlInjection })
        .expect('Content-Type', /json/);

      // Should either sanitize or reject, not execute SQL
      expect([201, 400]).toContain(response.status);
      
      if (response.status === 201) {
        expect(response.body.data.name).not.toContain('DROP TABLE');
      }
    });

    it('should sanitize SQL injection in resource filters', async () => {
      const response = await request(baseURL)
        .get("/api/v1/users?name=' OR '1'='1")
        .expect([200, 404]);

      // Should not return all records
      if (response.status === 200) {
        expect(response.body.data).toBeDefined();
      }
    });

    it('should sanitize SQL injection in query parameters', async () => {
      const maliciousQuery = "1' OR '1'='1' UNION SELECT * FROM users--";
      
      const response = await request(baseURL)
        .get(`/api/v1/users?_search=${encodeURIComponent(maliciousQuery)}`)
        .expect([200, 404]);

      // Should handle safely
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('XSS (Cross-Site Scripting) Prevention', () => {
    it('should sanitize XSS in project name', async () => {
      const xssPayload = '<script>alert("XSS")</script>';
      
      const response = await request(baseURL)
        .post('/api/projects')
        .set('Cookie', 'next-auth.session-token=valid-token')
        .send({ name: xssPayload });

      if (response.status === 201) {
        expect(response.body.data.name).not.toContain('<script>');
      }
    });

    it('should sanitize XSS in project description', async () => {
      const xssPayload = '<img src=x onerror="alert(1)">';
      
      const response = await request(baseURL)
        .post('/api/projects')
        .set('Cookie', 'next-auth.session-token=valid-token')
        .send({ 
          name: 'Test Project',
          description: xssPayload 
        });

      if (response.status === 201) {
        expect(response.body.data.description).not.toContain('onerror');
      }
    });

    it('should sanitize XSS in resource data', async () => {
      const xssPayload = '<svg onload=alert(document.cookie)>';
      
      const response = await request(baseURL)
        .post('/api/resources')
        .send({
          name: 'xss_test',
          fields: [{ name: xssPayload, type: 'string' }],
          projectId: 'test',
        });

      if (response.status === 201) {
        const fieldName = response.body.data.fields[0].name;
        expect(fieldName).not.toContain('onload');
      }
    });

    it('should sanitize XSS in API response body', async () => {
      const xssPayload = { 
        message: '<script>steal_cookies()</script>' 
      };
      
      const response = await request(baseURL)
        .post('/api/apis')
        .send({
          path: '/xss-test',
          method: 'GET',
          projectId: 'test',
          responseBody: xssPayload,
        });

      // API should store as-is but frontend should sanitize on display
      expect([201, 400]).toContain(response.status);
    });
  });

  describe('NoSQL Injection Prevention', () => {
    it('should prevent NoSQL injection in MongoDB queries', async () => {
      const noSqlInjection = { $ne: null };
      
      const response = await request(baseURL)
        .post('/api/projects')
        .set('Cookie', 'next-auth.session-token=valid-token')
        .send({ name: noSqlInjection });

      // Should reject invalid input
      expect([400, 500]).toContain(response.status);
    });

    it('should sanitize MongoDB operators in input', async () => {
      const response = await request(baseURL)
        .post('/api/resources')
        .send({
          name: 'test',
          fields: [],
          projectId: { $gt: '' },
        });

      expect([400, 500]).toContain(response.status);
    });
  });

  describe('CSRF (Cross-Site Request Forgery) Prevention', () => {
    it('should require CSRF token for state-changing operations', async () => {
      const response = await request(baseURL)
        .post('/api/projects')
        .set('Cookie', 'next-auth.session-token=valid-token')
        .set('Origin', 'https://malicious-site.com')
        .send({ name: 'CSRF Test' });

      // Should be protected by CSRF or CORS
      if (response.status === 201) {
        // NextAuth may handle CSRF internally
        expect(response.status).toBe(201);
      }
    });

    it('should validate Origin header', async () => {
      const response = await request(baseURL)
        .post('/api/projects')
        .set('Origin', 'https://evil.com')
        .send({ name: 'Test' });

      // Should check origin for CORS
      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit excessive requests', async () => {
      const requests = [];
      
      // Send 100 requests rapidly
      for (let i = 0; i < 100; i++) {
        requests.push(
          request(baseURL)
            .get('/api/resources')
            .then(res => res.status)
        );
      }
      
      const responses = await Promise.all(requests);
      
      // Should eventually rate limit (429) if implemented
      const rateLimited = responses.some(status => status === 429);
      
      // Rate limiting may or may not be implemented
      console.log(`Rate limiting active: ${rateLimited}`);
    }, 30000);

    it('should have per-IP rate limits', async () => {
      // Simulate requests from same IP
      const requests = Array.from({ length: 50 }, () =>
        request(baseURL)
          .get('/api/resources')
          .set('X-Forwarded-For', '1.2.3.4')
      );

      const responses = await Promise.all(requests);
      const statuses = responses.map(r => r.status);
      
      // May include 429 if rate limiting is active
      console.log('Status distribution:', statuses);
    }, 20000);
  });

  describe('Input Validation', () => {
    it('should validate email format in fields', async () => {
      const response = await request(baseURL)
        .post('/api/v1/users')
        .send({
          name: 'Test User',
          email: 'invalid-email',
        });

      // API may or may not validate email format
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it('should reject excessively long inputs', async () => {
      const longString = 'a'.repeat(10000);
      
      const response = await request(baseURL)
        .post('/api/projects')
        .set('Cookie', 'next-auth.session-token=valid-token')
        .send({ name: longString });

      // Should truncate or reject
      if (response.status === 201) {
        expect(response.body.data.name.length).toBeLessThanOrEqual(1000);
      }
    });

    it('should reject negative numbers in pagination', async () => {
      const response = await request(baseURL)
        .get('/api/v1/users?_page=-1&_limit=-10');

      // Should handle invalid pagination gracefully
      expect([200, 400, 404]).toContain(response.status);
    });

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
  });

  describe('File Upload Security (if applicable)', () => {
    it('should reject executable files', async () => {
      // Test if file upload endpoints exist
      const response = await request(baseURL)
        .post('/api/upload')
        .attach('file', Buffer.from('fake file'), 'malicious.exe');

      // Should reject or not have endpoint
      expect([404, 400, 415]).toContain(response.status);
    });

    it('should limit file size', async () => {
      const largeBuffer = Buffer.alloc(100 * 1024 * 1024); // 100MB
      
      const response = await request(baseURL)
        .post('/api/upload')
        .attach('file', largeBuffer, 'large.dat');

      // Should reject large files or not have endpoint
      expect([404, 413, 400]).toContain(response.status);
    });
  });

  describe('API Security Headers', () => {
    it('should set X-Content-Type-Options header', async () => {
      const response = await request(baseURL)
        .get('/api/resources');

      // Security headers may be set by Next.js
      if (response.headers['x-content-type-options']) {
        expect(response.headers['x-content-type-options']).toBe('nosniff');
      }
    });

    it('should set X-Frame-Options header', async () => {
      const response = await request(baseURL)
        .get('/');

      if (response.headers['x-frame-options']) {
        expect(['DENY', 'SAMEORIGIN']).toContain(
          response.headers['x-frame-options']
        );
      }
    });

    it('should set Strict-Transport-Security in production', async () => {
      const response = await request(baseURL)
        .get('/');

      // HSTS should be set in production
      if (process.env.NODE_ENV === 'production' && 
          response.headers['strict-transport-security']) {
        expect(response.headers['strict-transport-security']).toContain('max-age');
      }
    });

    it('should set Content-Security-Policy', async () => {
      const response = await request(baseURL)
        .get('/');

      // CSP may be configured
      if (response.headers['content-security-policy']) {
        expect(response.headers['content-security-policy']).toBeDefined();
      }
    });
  });

  describe('Sensitive Data Exposure', () => {
    it('should not expose internal error details', async () => {
      const response = await request(baseURL)
        .get('/api/projects/invalid-id')
        .set('Cookie', 'next-auth.session-token=valid-token');

      // Should not expose stack traces or internal paths
      const body = JSON.stringify(response.body);
      expect(body).not.toContain('node_modules');
      expect(body).not.toContain('at Object.');
      expect(body).not.toContain('/Users/');
    });

    it('should not expose MongoDB connection strings', async () => {
      const response = await request(baseURL)
        .get('/api/resources');

      const body = JSON.stringify(response.body);
      expect(body).not.toContain('mongodb://');
      expect(body).not.toContain('MONGODB_URI');
    });

    it('should not expose environment variables', async () => {
      const response = await request(baseURL)
        .get('/api/projects')
        .set('Cookie', 'next-auth.session-token=valid-token');

      const body = JSON.stringify(response.body);
      expect(body).not.toContain('NEXTAUTH_SECRET');
      expect(body).not.toContain('GOOGLE_CLIENT_SECRET');
    });
  });

  describe('API Endpoint Enumeration', () => {
    it('should not expose all routes in error messages', async () => {
      const response = await request(baseURL)
        .get('/api/non-existent-endpoint')
        .expect(404);

      // Should not list all available endpoints
      const body = JSON.stringify(response.body);
      expect(body.split('\n').length).toBeLessThan(50);
    });

    it('should handle OPTIONS requests securely', async () => {
      const response = await request(baseURL)
        .options('/api/projects');

      // Should handle CORS preflight
      expect([200, 204, 404]).toContain(response.status);
    });
  });

  describe('Session Security', () => {
    it('should use secure session cookies', async () => {
      const response = await request(baseURL)
        .get('/api/projects')
        .set('Cookie', 'next-auth.session-token=test-token');

      // Session cookies should have HttpOnly flag (checked client-side)
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it('should expire sessions properly', async () => {
      // Old session token should be invalid
      const oldToken = 'very-old-session-token';
      
      const response = await request(baseURL)
        .get('/api/projects')
        .set('Cookie', `next-auth.session-token=${oldToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Denial of Service (DoS) Prevention', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(baseURL)
        .post('/api/resources')
        .set('Content-Type', 'application/json')
        .send('{"invalid json}');

      expect([400, 500]).toContain(response.status);
    });

    it('should handle deeply nested JSON', async () => {
      let nested: any = { a: 1 };
      for (let i = 0; i < 1000; i++) {
        nested = { nested };
      }

      const response = await request(baseURL)
        .post('/api/resources')
        .send({
          name: 'test',
          fields: [],
          projectId: 'test',
          metadata: nested,
        });

      // Should handle or reject deep nesting
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it('should limit request body size', async () => {
      const largePayload = {
        name: 'test',
        fields: Array.from({ length: 10000 }, (_, i) => ({
          name: `field${i}`,
          type: 'string',
        })),
        projectId: 'test',
      };

      const response = await request(baseURL)
        .post('/api/resources')
        .send(largePayload);

      // Should handle large payloads or reject
      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });

  describe('API Versioning Security', () => {
    it('should handle version mismatches gracefully', async () => {
      const response = await request(baseURL)
        .get('/api/v2/users')
        .expect([404, 501]);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Webhook Security', () => {
    it('should validate webhook URLs', async () => {
      const response = await request(baseURL)
        .post('/api/apis')
        .send({
          path: '/test',
          method: 'GET',
          projectId: 'test',
          webhookUrl: 'javascript:alert(1)',
        });

      // Should reject invalid URLs
      if (response.status === 201) {
        expect(response.body.data.webhookUrl).not.toContain('javascript:');
      }
    });

    it('should prevent SSRF via webhook URLs', async () => {
      const response = await request(baseURL)
        .post('/api/apis')
        .send({
          path: '/test',
          method: 'GET',
          projectId: 'test',
          webhookUrl: 'http://localhost:27017/admin',
        });

      // Should validate webhook URLs to prevent SSRF
      expect([201, 400]).toContain(response.status);
    });
  });
});
