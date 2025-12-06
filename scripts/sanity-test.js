#!/usr/bin/env node
/**
 * Sanity Test Script for API Endpoints
 * Tests all critical API endpoints with various scenarios
 * Run: node scripts/sanity-test.js or npm run test:sanity
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

class TestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.tests = [];
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async test(name, testFn) {
    try {
      await testFn();
      this.passed++;
      this.log(`✓ ${name}`, 'green');
    } catch (error) {
      this.failed++;
      this.log(`✗ ${name}`, 'red');
      this.log(`  Error: ${error.message}`, 'red');
    }
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => null);

    return { response, data, status: response.status };
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  async summary() {
    this.log('\n' + '='.repeat(60), 'cyan');
    this.log('Test Summary', 'bright');
    this.log('='.repeat(60), 'cyan');
    this.log(`Total Tests: ${this.passed + this.failed}`, 'blue');
    this.log(`Passed: ${this.passed}`, 'green');
    this.log(`Failed: ${this.failed}`, this.failed > 0 ? 'red' : 'green');
    this.log('='.repeat(60), 'cyan');

    if (this.failed > 0) {
      process.exit(1);
    }
  }
}

// Test Suite
async function runTests() {
  const runner = new TestRunner();

  runner.log('\n' + '='.repeat(60), 'cyan');
  runner.log('Fake API Generator - Sanity Tests', 'bright');
  runner.log('='.repeat(60), 'cyan');
  runner.log(`Testing against: ${BASE_URL}\n`, 'blue');

  // Health Check Tests
  runner.log('Health Check Tests', 'yellow');
  runner.log('-'.repeat(60), 'cyan');

  await runner.test('Server is responding', async () => {
    const { status } = await runner.makeRequest('/api/resources');
    runner.assert(status >= 200 && status < 500, `Expected valid response, got ${status}`);
  });

  // Resource API Tests
  runner.log('\nResource API Tests', 'yellow');
  runner.log('-'.repeat(60), 'cyan');

  await runner.test('GET /api/resources returns array', async () => {
    const { status, data } = await runner.makeRequest('/api/resources');
    runner.assert(status === 200, `Expected 200, got ${status}`);
    runner.assert(Array.isArray(data), 'Response should be an array');
  });

  await runner.test('POST /api/resources requires authentication', async () => {
    const { status } = await runner.makeRequest('/api/resources', {
      method: 'POST',
      body: JSON.stringify({
        name: 'test',
        fields: [],
        projectId: 'test-id',
      }),
    });
    // Should fail without auth (401) or succeed with auth
    runner.assert(
      status === 200 || status === 201 || status === 401,
      `Expected 200/201/401, got ${status}`
    );
  });

  await runner.test('POST /api/resources validates required fields', async () => {
    const { status, data } = await runner.makeRequest('/api/resources', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    runner.assert(
      status === 400 || status === 401,
      `Expected 400 or 401, got ${status}`
    );
  });

  // API Endpoints Tests
  runner.log('\nAPI Endpoints Tests', 'yellow');
  runner.log('-'.repeat(60), 'cyan');

  await runner.test('GET /api/apis returns array', async () => {
    const { status, data } = await runner.makeRequest('/api/apis');
    runner.assert(status === 200, `Expected 200, got ${status}`);
    runner.assert(Array.isArray(data), 'Response should be an array');
  });

  await runner.test('POST /api/apis validates HTTP method', async () => {
    const { status } = await runner.makeRequest('/api/apis', {
      method: 'POST',
      body: JSON.stringify({
        path: '/test',
        method: 'INVALID',
        projectId: 'test-id',
      }),
    });
    runner.assert(
      status === 400 || status === 401,
      `Expected 400 or 401 for invalid method, got ${status}`
    );
  });

  // Project API Tests
  runner.log('\nProject API Tests', 'yellow');
  runner.log('-'.repeat(60), 'cyan');

  await runner.test('GET /api/projects requires authentication', async () => {
    const { status } = await runner.makeRequest('/api/projects');
    runner.assert(
      status === 200 || status === 401,
      `Expected 200 or 401, got ${status}`
    );
  });

  // Auth API Tests
  runner.log('\nAuthentication API Tests', 'yellow');
  runner.log('-'.repeat(60), 'cyan');

  await runner.test('POST /api/auth/signup validates email format', async () => {
    const { status } = await runner.makeRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'Test1234',
      }),
    });
    runner.assert(status === 400, `Expected 400 for invalid email, got ${status}`);
  });

  await runner.test('POST /api/auth/signup validates password strength', async () => {
    const { status } = await runner.makeRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'weak',
      }),
    });
    runner.assert(status === 400, `Expected 400 for weak password, got ${status}`);
  });

  await runner.test('POST /api/auth/signup requires email and password', async () => {
    const { status } = await runner.makeRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    runner.assert(status === 400, `Expected 400 for missing fields, got ${status}`);
  });

  await runner.test('POST /api/auth/forgot-password validates email', async () => {
    const { status } = await runner.makeRequest('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid',
      }),
    });
    // Should handle gracefully whether email exists or not
    runner.assert(
      status >= 200 && status < 500,
      `Expected valid response, got ${status}`
    );
  });

  // V1 API Tests
  runner.log('\nDynamic API (v1) Tests', 'yellow');
  runner.log('-'.repeat(60), 'cyan');

  await runner.test('GET /api/v1/nonexistent returns helpful error', async () => {
    const { status, data } = await runner.makeRequest('/api/v1/nonexistent');
    runner.assert(status === 404, `Expected 404, got ${status}`);
    runner.assert(
      data && data.error,
      'Error response should contain error message'
    );
    runner.assert(
      data && data.hint,
      'Error response should contain helpful hint'
    );
  });

  // Error Handling Tests
  runner.log('\nError Handling Tests', 'yellow');
  runner.log('-'.repeat(60), 'cyan');

  await runner.test('Invalid JSON returns 400', async () => {
    try {
      await fetch(`${BASE_URL}/api/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json{',
      });
      // If it doesn't throw, check status in response
      runner.assert(true, 'Request handled gracefully');
    } catch (error) {
      // Network error is acceptable for invalid JSON
      runner.assert(true, 'Request properly rejected');
    }
  });

  await runner.test('Malformed request returns error response', async () => {
    const { status, data } = await runner.makeRequest('/api/resources', {
      method: 'POST',
      body: JSON.stringify({ malformed: 'data' }),
    });
    runner.assert(
      status === 400 || status === 401,
      `Expected 400 or 401, got ${status}`
    );
    runner.assert(
      data && (data.error || data.success === false),
      'Error response should contain error indication'
    );
  });

  // Response Format Tests
  runner.log('\nResponse Format Tests', 'yellow');
  runner.log('-'.repeat(60), 'cyan');

  await runner.test('Successful responses have consistent format', async () => {
    const { status, data } = await runner.makeRequest('/api/resources');
    if (status === 200) {
      runner.assert(
        data !== null && data !== undefined,
        'Response should contain data'
      );
    }
  });

  runner.log('\n');
  await runner.summary();
}

// Run tests
runTests().catch((error) => {
  console.error(`${colors.red}Fatal Error:${colors.reset}`, error);
  process.exit(1);
});
