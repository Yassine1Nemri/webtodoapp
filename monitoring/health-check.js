// monitoring/health-check.js
const http = require('http');

class HealthChecker {
  constructor(port = 3000) {
    this.port = port;
    this.checks = {
      server: false,
      memory: false,
      security: false
    };
  }

  async checkServer() {
    return new Promise((resolve) => {
      const req = http.request({
        hostname: 'localhost',
        port: this.port,
        path: '/',
        method: 'GET',
        timeout: 5000
      }, (res) => {
        this.checks.server = res.statusCode === 200;
        resolve(this.checks.server);
      });

      req.on('error', () => {
        this.checks.server = false;
        resolve(false);
      });

      req.on('timeout', () => {
        this.checks.server = false;
        resolve(false);
      });

      req.end();
    });
  }

  checkMemory() {
    const used = process.memoryUsage();
    const maxMemory = 512 * 1024 * 1024; // 512MB limit
    
    this.checks.memory = used.heapUsed < maxMemory;
    
    if (!this.checks.memory) {
      console.warn(`Memory usage high: ${Math.round(used.heapUsed / 1024 / 1024)}MB`);
    }
    
    return this.checks.memory;
  }

  checkSecurity() {
    // Basic security checks
    const securityChecks = [
      process.env.NODE_ENV === 'production',
      !process.env.DEBUG, // Debug mode should be off in production
      process.getuid && process.getuid() !== 0 // Not running as root
    ];

    this.checks.security = securityChecks.every(check => check === true);
    return this.checks.security;
  }

  async runAllChecks() {
    console.log('🔍 Running health checks...');
    
    await this.checkServer();
    this.checkMemory();
    this.checkSecurity();

    const allHealthy = Object.values(this.checks).every(check => check === true);
    
    const status = {
      healthy: allHealthy,
      timestamp: new Date().toISOString(),
      checks: this.checks,
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    };

    if (allHealthy) {
      console.log('✅ All health checks passed');
    } else {
      console.error('❌ Some health checks failed:', this.checks);
      process.exit(1);
    }

    return status;
  }
}

// Export for use in tests and monitoring
if (require.main === module) {
  const checker = new HealthChecker();
  checker.runAllChecks();
} else {
  module.exports = HealthChecker;
}

