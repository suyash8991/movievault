/**
 * Performance Benchmark Script
 *
 * Tests API response times with and without Redis caching
 * Run this before and after Redis implementation to compare performance
 *
 * Usage:
 *   # Without Redis (baseline)
 *   npm run benchmark
 *
 *   # With Redis (after implementation)
 *   REDIS_URL=redis://localhost:6379 npm run benchmark
 */

interface BenchmarkResult {
  endpoint: string;
  requests: number;
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  successRate: number;
}

interface BenchmarkSummary {
  redisEnabled: boolean;
  results: BenchmarkResult[];
  totalRequests: number;
  totalTime: number;
  averageResponseTime: number;
}

class PerformanceBenchmark {
  private baseUrl: string;
  private results: BenchmarkResult[] = [];

  constructor(baseUrl: string = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Measure response time for a single request
   */
  private async measureRequest(url: string): Promise<{ time: number; success: boolean }> {
    const start = performance.now();

    try {
      const response = await fetch(url);
      const end = performance.now();

      return {
        time: end - start,
        success: response.ok
      };
    } catch (error) {
      const end = performance.now();
      return {
        time: end - start,
        success: false
      };
    }
  }

  /**
   * Run benchmark for a specific endpoint
   */
  async benchmarkEndpoint(
    endpoint: string,
    iterations: number = 10,
    description: string = ''
  ): Promise<BenchmarkResult> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`\n📊 Benchmarking: ${description || endpoint}`);
    console.log(`   Running ${iterations} requests...`);

    const times: number[] = [];
    let successCount = 0;

    for (let i = 0; i < iterations; i++) {
      const { time, success } = await this.measureRequest(url);
      times.push(time);
      if (success) successCount++;

      // Show progress
      if ((i + 1) % 5 === 0 || i === iterations - 1) {
        process.stdout.write(`\r   Progress: ${i + 1}/${iterations}`);
      }

      // Small delay between requests to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(''); // New line after progress

    const result: BenchmarkResult = {
      endpoint,
      requests: iterations,
      totalTime: times.reduce((sum, t) => sum + t, 0),
      avgTime: times.reduce((sum, t) => sum + t, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      successRate: (successCount / iterations) * 100
    };

    this.results.push(result);
    this.printResult(result);

    return result;
  }

  /**
   * Print individual benchmark result
   */
  private printResult(result: BenchmarkResult): void {
    console.log(`\n   Results:`);
    console.log(`   ├─ Requests:     ${result.requests}`);
    console.log(`   ├─ Success Rate: ${result.successRate.toFixed(1)}%`);
    console.log(`   ├─ Avg Time:     ${result.avgTime.toFixed(2)}ms`);
    console.log(`   ├─ Min Time:     ${result.minTime.toFixed(2)}ms`);
    console.log(`   └─ Max Time:     ${result.maxTime.toFixed(2)}ms`);
  }

  /**
   * Run comprehensive benchmark suite
   */
  async runSuite(): Promise<BenchmarkSummary> {
    const redisEnabled = !!process.env.REDIS_URL;

    console.log('\n' + '='.repeat(60));
    console.log('🚀 PERFORMANCE BENCHMARK SUITE');
    console.log('='.repeat(60));
    console.log(`\n⚙️  Redis Caching: ${redisEnabled ? '✅ ENABLED' : '❌ DISABLED'}`);
    console.log(`📍 Base URL: ${this.baseUrl}`);
    console.log(`⏱️  Started at: ${new Date().toLocaleTimeString()}\n`);

    // Clear previous results
    this.results = [];

    // Test 1: Popular Movies (Page 1) - High traffic endpoint
    await this.benchmarkEndpoint(
      '/api/movies/popular?page=1',
      10,
      'Popular Movies (Page 1) - Most Accessed'
    );

    // Test 2: Search Results - Common query
    await this.benchmarkEndpoint(
      '/api/movies/search?query=matrix&page=1',
      10,
      'Search "matrix" - Common Query'
    );

    // Test 3: Movie Details - Specific movie
    await this.benchmarkEndpoint(
      '/api/movies/550',
      10,
      'Movie Details (Fight Club #550)'
    );

    // Test 4: Popular Movies (Page 2) - Different page
    await this.benchmarkEndpoint(
      '/api/movies/popular?page=2',
      10,
      'Popular Movies (Page 2)'
    );

    // Test 5: Search Results - Another query
    await this.benchmarkEndpoint(
      '/api/movies/search?query=inception&page=1',
      10,
      'Search "inception"'
    );

    // Calculate summary
    const summary = this.calculateSummary(redisEnabled);
    this.printSummary(summary);

    return summary;
  }

  /**
   * Calculate benchmark summary
   */
  private calculateSummary(redisEnabled: boolean): BenchmarkSummary {
    const totalRequests = this.results.reduce((sum, r) => sum + r.requests, 0);
    const totalTime = this.results.reduce((sum, r) => sum + r.totalTime, 0);

    return {
      redisEnabled,
      results: this.results,
      totalRequests,
      totalTime,
      averageResponseTime: totalTime / totalRequests
    };
  }

  /**
   * Print summary of all benchmarks
   */
  private printSummary(summary: BenchmarkSummary): void {
    console.log('\n' + '='.repeat(60));
    console.log('📈 BENCHMARK SUMMARY');
    console.log('='.repeat(60));
    console.log(`\n🔧 Configuration:`);
    console.log(`   Redis: ${summary.redisEnabled ? 'ENABLED ✅' : 'DISABLED ❌'}`);
    console.log(`\n📊 Overall Results:`);
    console.log(`   ├─ Total Requests:   ${summary.totalRequests}`);
    console.log(`   ├─ Total Time:       ${summary.totalTime.toFixed(2)}ms`);
    console.log(`   └─ Avg Response:     ${summary.averageResponseTime.toFixed(2)}ms`);

    console.log(`\n📋 Breakdown by Endpoint:`);
    summary.results.forEach((result, index) => {
      console.log(`\n   ${index + 1}. ${result.endpoint}`);
      console.log(`      Avg: ${result.avgTime.toFixed(2)}ms | Min: ${result.minTime.toFixed(2)}ms | Max: ${result.maxTime.toFixed(2)}ms`);
    });

    console.log('\n' + '='.repeat(60));

    if (!summary.redisEnabled) {
      console.log('\n💡 TIP: Run with REDIS_URL set to compare with cache enabled:');
      console.log('   REDIS_URL=redis://localhost:6379 npm run benchmark\n');
    } else {
      console.log('\n✨ Cache-enabled performance measured!');
      console.log('   Compare these results with the baseline (no Redis) run.\n');
    }
  }

  /**
   * Save results to JSON file for comparison
   */
  saveSummary(summary: BenchmarkSummary, filename: string): void {
    const fs = require('fs');
    const path = require('path');

    const resultsDir = path.join(__dirname, 'results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    const filepath = path.join(resultsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(summary, null, 2));

    console.log(`📁 Results saved to: ${filepath}\n`);
  }
}

/**
 * Compare two benchmark results
 */
function compareResults(baseline: BenchmarkSummary, cached: BenchmarkSummary): void {
  console.log('\n' + '='.repeat(60));
  console.log('📊 PERFORMANCE COMPARISON');
  console.log('='.repeat(60));

  const improvement = ((baseline.averageResponseTime - cached.averageResponseTime) / baseline.averageResponseTime) * 100;
  const speedup = baseline.averageResponseTime / cached.averageResponseTime;

  console.log(`\n🏁 Baseline (No Redis):`);
  console.log(`   Average Response Time: ${baseline.averageResponseTime.toFixed(2)}ms`);

  console.log(`\n⚡ With Redis Cache:`);
  console.log(`   Average Response Time: ${cached.averageResponseTime.toFixed(2)}ms`);

  console.log(`\n📈 Performance Gains:`);
  console.log(`   ├─ Improvement: ${improvement.toFixed(1)}% faster`);
  console.log(`   └─ Speedup: ${speedup.toFixed(2)}x`);

  console.log(`\n📋 Endpoint Comparison:`);
  baseline.results.forEach((baseResult, index) => {
    const cachedResult = cached.results[index];
    if (cachedResult) {
      const endpointImprovement = ((baseResult.avgTime - cachedResult.avgTime) / baseResult.avgTime) * 100;
      console.log(`\n   ${index + 1}. ${baseResult.endpoint}`);
      console.log(`      Baseline: ${baseResult.avgTime.toFixed(2)}ms`);
      console.log(`      Cached:   ${cachedResult.avgTime.toFixed(2)}ms`);
      console.log(`      Gain:     ${endpointImprovement.toFixed(1)}% faster`);
    }
  });

  console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * Main execution
 */
async function main() {
  const benchmark = new PerformanceBenchmark();

  try {
    // Check if server is running
    const testUrl = 'http://localhost:5000/api/movies/popular?page=1';
    console.log('\n🔍 Checking if server is running...');

    try {
      await fetch(testUrl);
      console.log('✅ Server is ready!\n');
    } catch (error) {
      console.error('❌ Server is not running!');
      console.log('\n💡 Please start the backend server first:');
      console.log('   cd backend && npm run dev\n');
      process.exit(1);
    }

    // Run benchmark suite
    const summary = await benchmark.runSuite();

    // Save results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const redisStatus = summary.redisEnabled ? 'with-redis' : 'no-redis';
    const filename = `benchmark-${redisStatus}-${timestamp}.json`;
    benchmark.saveSummary(summary, filename);

    // If you have both results, compare them
    const fs = require('fs');
    const path = require('path');
    const resultsDir = path.join(__dirname, 'results');

    if (fs.existsSync(resultsDir)) {
      const files = fs.readdirSync(resultsDir);
      const baselineFile = files.find((f: string) => f.includes('no-redis'));
      const cachedFile = files.find((f: string) => f.includes('with-redis'));

      if (baselineFile && cachedFile) {
        const baseline = JSON.parse(fs.readFileSync(path.join(resultsDir, baselineFile), 'utf8'));
        const cached = JSON.parse(fs.readFileSync(path.join(resultsDir, cachedFile), 'utf8'));
        compareResults(baseline, cached);
      }
    }

  } catch (error) {
    console.error('\n❌ Benchmark failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { PerformanceBenchmark, BenchmarkSummary, BenchmarkResult, compareResults };
