import { runDashboardTests } from './dashboard.test.js';
import { runServerTests } from './server.test.js';
import { runIntegrationTests } from './integration.test.js';

const CI_MODE = process.argv.includes('--ci');

class TestRunner {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      total: 0
    };
    this.allPassed = true;
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m', // Cyan
      success: '\x1b[32m', // Green
      error: '\x1b[31m', // Red
      warning: '\x1b[33m', // Yellow
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  async runTestSuite(name, testFunction) {
    this.log(`\n📊 Running ${name}...`, 'info');
    
    try {
      const result = await testFunction();
      this.results.passed += result.passed;
      this.results.failed += result.failed;
      this.results.total += result.total;
      
      if (result.failed > 0) {
        this.allPassed = false;
        this.log(`❌ ${name} - ${result.passed}/${result.total} passed`, 'error');
      } else {
        this.log(`✅ ${name} - ${result.passed}/${result.total} passed`, 'success');
      }
      
      return result;
    } catch (error) {
      this.log(`💥 ${name} - Test suite crashed: ${error.message}`, 'error');
      this.allPassed = false;
      return { passed: 0, failed: 1, total: 1 };
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Stock Dashboard Test Suite...', 'info');
    this.log('='.repeat(60), 'info');

    // Run all test suites
    await this.runTestSuite('Dashboard Component Tests', runDashboardTests);
    await this.runTestSuite('Server API Tests', runServerTests);
    await this.runTestSuite('Integration Tests', runIntegrationTests);

    // Summary
    this.log('\n' + '='.repeat(60), 'info');
    this.log('📋 TEST SUMMARY:', 'info');
    this.log(`Total Tests: ${this.results.total}`, 'info');
    this.log(`Passed: ${this.results.passed}`, 'success');
    this.log(`Failed: ${this.results.failed}`, this.results.failed > 0 ? 'error' : 'success');

    if (this.allPassed) {
      this.log('\n ALL TESTS PASSED!', 'success');
      if (CI_MODE) {
        process.exit(0);
      }
    } else {
      this.log('\nSOME TESTS FAILED!', 'error');
      if (CI_MODE) {
        process.exit(1);
      }
    }
  }
}

// Run tests
const runner = new TestRunner();
runner.runAllTests().catch(console.error);