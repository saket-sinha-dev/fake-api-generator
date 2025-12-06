/**
 * Artillery Processor Functions
 * Custom functions for generating test data
 */

module.exports = {
  /**
   * Generate random string for unique names
   */
  randomString: function(context, events, done) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    context.vars.randomString = result;
    return done();
  },

  /**
   * Generate random number within range
   */
  randomNumber: function(context, events, done) {
    const min = 1000;
    const max = 9999;
    context.vars.randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    return done();
  },

  /**
   * Setup function - runs before tests
   */
  setupTest: function(context, events, done) {
    // Set default variables
    context.vars.projectId = 'perf-test-project';
    context.vars.resourceName = 'users';
    return done();
  },

  /**
   * Log response metrics
   */
  logResponse: function(requestParams, response, context, ee, next) {
    console.log(`Response status: ${response.statusCode}`);
    console.log(`Response time: ${response.timings.phases.total}ms`);
    return next();
  },

  /**
   * Validate response structure
   */
  validateResponse: function(requestParams, response, context, ee, next) {
    if (response.statusCode === 200) {
      try {
        const body = JSON.parse(response.body);
        if (!body.data && !body.success && !body.error) {
          console.error('Invalid response structure');
          ee.emit('error', 'Invalid response structure');
        }
      } catch (e) {
        console.error('Failed to parse response JSON');
      }
    }
    return next();
  },

  /**
   * Generate realistic user data
   */
  generateUserData: function(context, events, done) {
    const firstNames = ['John', 'Jane', 'Alice', 'Bob', 'Charlie', 'Diana'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    context.vars.userData = {
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@test.com`,
      age: Math.floor(Math.random() * 50) + 18,
    };
    
    return done();
  },

  /**
   * Generate project data
   */
  generateProjectData: function(context, events, done) {
    const adjectives = ['Amazing', 'Innovative', 'Modern', 'Advanced', 'Smart'];
    const nouns = ['API', 'Service', 'Platform', 'System', 'Application'];
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    context.vars.projectData = {
      name: `${adjective} ${noun} ${Date.now()}`,
      description: `Performance test project created at ${new Date().toISOString()}`,
    };
    
    return done();
  },

  /**
   * Track custom metrics
   */
  trackMetrics: function(requestParams, response, context, ee, next) {
    // Emit custom metrics
    ee.emit('customStat', {
      stat: 'response_size',
      value: response.body ? response.body.length : 0,
    });
    
    if (response.statusCode >= 400) {
      ee.emit('customStat', {
        stat: 'error_count',
        value: 1,
      });
    }
    
    return next();
  },
};
