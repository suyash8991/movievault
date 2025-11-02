# Performance Benchmark Guide

This benchmark suite helps you measure the performance impact of Redis caching on your API endpoints.

## 📋 What It Tests

The benchmark measures response times for these commonly-accessed endpoints:

1. **Popular Movies (Page 1)** - Most frequently accessed (homepage)
2. **Search Results** - Common search queries ("matrix", "inception")
3. **Movie Details** - Specific movie fetches
4. **Popular Movies (Page 2)** - Different pagination

Each endpoint is tested with **10 requests** to get average, min, and max response times.

---

## 🚀 Quick Start

### Step 1: Run Baseline (Without Redis)

First, measure performance **without Redis** to establish a baseline:

```bash
# Make sure backend server is running
cd backend
npm run dev

# In another terminal, run benchmark
npm run benchmark
```

**Expected Output:**
```
🚀 PERFORMANCE BENCHMARK SUITE
⚙️  Redis Caching: ❌ DISABLED

📊 Benchmarking: Popular Movies (Page 1)
   Running 10 requests...
   Progress: 10/10

   Results:
   ├─ Requests:     10
   ├─ Success Rate: 100.0%
   ├─ Avg Time:     450.23ms
   ├─ Min Time:     389.12ms
   └─ Max Time:     567.89ms

... (more endpoints)

📈 BENCHMARK SUMMARY
📊 Overall Results:
   ├─ Total Requests:   50
   ├─ Total Time:       22,456.78ms
   └─ Avg Response:     449.14ms
```

Results are automatically saved to `tests/performance/results/benchmark-no-redis-YYYY-MM-DD.json`

---

### Step 2: Install and Start Redis

**Option A: Using Docker (Recommended)**
```bash
docker run -d -p 6379:6379 --name redis redis:7-alpine
```

**Option B: Using Homebrew (Mac)**
```bash
brew install redis
brew services start redis
```

**Option C: Using Windows**
Download from: https://github.com/microsoftarchive/redis/releases

---

### Step 3: Run Benchmark WITH Redis

Once Redis is running, implement Redis caching (see [BUILD_PLAN.md](../../../BUILD_PLAN.md)) and run the benchmark again:

```bash
# Set Redis URL and run benchmark
REDIS_URL=redis://localhost:6379 npm run benchmark
```

**Expected Output:**
```
🚀 PERFORMANCE BENCHMARK SUITE
⚙️  Redis Caching: ✅ ENABLED

📊 Benchmarking: Popular Movies (Page 1)
   Running 10 requests...
   Progress: 10/10

   Results:
   ├─ Requests:     10
   ├─ Success Rate: 100.0%
   ├─ Avg Time:     3.45ms    ← Much faster!
   ├─ Min Time:     2.12ms
   └─ Max Time:     8.23ms

... (more endpoints)

📈 BENCHMARK SUMMARY
📊 Overall Results:
   ├─ Total Requests:   50
   ├─ Total Time:       189.34ms
   └─ Avg Response:     3.79ms  ← 118x faster!
```

Results saved to `tests/performance/results/benchmark-with-redis-YYYY-MM-DD.json`

---

### Step 4: Automatic Comparison

If you have both baseline and cached results, the script **automatically compares** them:

```
📊 PERFORMANCE COMPARISON
═══════════════════════════════════════════════════════

🏁 Baseline (No Redis):
   Average Response Time: 449.14ms

⚡ With Redis Cache:
   Average Response Time: 3.79ms

📈 Performance Gains:
   ├─ Improvement: 99.2% faster
   └─ Speedup: 118.5x

📋 Endpoint Comparison:

   1. /api/movies/popular?page=1
      Baseline: 450.23ms
      Cached:   3.45ms
      Gain:     99.2% faster

   2. /api/movies/search?query=matrix&page=1
      Baseline: 478.56ms
      Cached:   3.89ms
      Gain:     99.2% faster

... (more endpoints)
```

---

## 📊 Understanding the Results

### Key Metrics

- **Avg Time**: Average response time across all requests
- **Min Time**: Fastest response (best case)
- **Max Time**: Slowest response (worst case)
- **Success Rate**: % of requests that returned 200 OK

### Expected Performance Improvements

| Metric | Without Redis | With Redis | Improvement |
|--------|--------------|------------|-------------|
| **Popular Movies** | ~450ms | ~3ms | **99%+ faster** |
| **Search Results** | ~480ms | ~4ms | **99%+ faster** |
| **Movie Details** | ~420ms | ~3ms | **99%+ faster** |

**Why such dramatic improvements?**
- Without Redis: Every request hits TMDb API (~400-500ms network latency)
- With Redis: Cached data returned from memory (~1-5ms)

### Cache Hit Scenarios

**First Request** (Cold Cache):
```
Cache miss → TMDb API call → ~450ms
```

**Subsequent Requests** (Warm Cache):
```
Cache hit → Redis memory → ~3ms
```

The benchmark runs multiple requests per endpoint, so you'll see mostly cache hits after the first request.

---

## 🔧 Advanced Usage

### Custom Iterations

Modify the benchmark script to run more requests:

```typescript
// In benchmark.ts, change iterations parameter
await this.benchmarkEndpoint(
  '/api/movies/popular?page=1',
  50,  // ← Increase from 10 to 50
  'Popular Movies (Page 1)'
);
```

### Test Different Endpoints

Add your own endpoints:

```typescript
await this.benchmarkEndpoint(
  '/api/your-endpoint',
  10,
  'Your Endpoint Description'
);
```

### Change Server URL

```typescript
const benchmark = new PerformanceBenchmark('http://localhost:5000');
```

---

## 📁 Result Files

Benchmark results are saved as JSON files in `tests/performance/results/`:

```
results/
├── benchmark-no-redis-2025-01-31.json
└── benchmark-with-redis-2025-01-31.json
```

**JSON Structure:**
```json
{
  "redisEnabled": false,
  "totalRequests": 50,
  "totalTime": 22456.78,
  "averageResponseTime": 449.14,
  "results": [
    {
      "endpoint": "/api/movies/popular?page=1",
      "requests": 10,
      "avgTime": 450.23,
      "minTime": 389.12,
      "maxTime": 567.89,
      "successRate": 100
    }
  ]
}
```

---

## 🐛 Troubleshooting

### "Server is not running"

**Problem:** Benchmark can't connect to backend
```
❌ Server is not running!
```

**Solution:** Start the backend server first:
```bash
cd backend
npm run dev
```

### "Cannot find module 'ioredis'"

**Problem:** Redis not installed yet
```
Error: Cannot find module 'ioredis'
```

**Solution:** This is expected before implementing Redis. Run baseline first:
```bash
npm run benchmark  # Without REDIS_URL
```

### High Variance in Results

**Problem:** Response times vary wildly (min: 50ms, max: 2000ms)

**Possible Causes:**
- Network latency to TMDb API
- Server under load
- Cold start (first request slower)

**Solution:** Run benchmark multiple times and average the results

### Redis Connection Failed

**Problem:** Can't connect to Redis
```
Redis connection failed
```

**Solution:** Check Redis is running:
```bash
docker ps  # Should show redis container
# OR
redis-cli ping  # Should return "PONG"
```

---

## 💡 Tips for Best Results

1. **Close other applications** to reduce system load
2. **Run multiple times** and average results for accuracy
3. **Test during low traffic** if testing production
4. **Clear Redis cache** between tests for cold vs warm comparison:
   ```bash
   redis-cli FLUSHALL
   ```
5. **Use consistent network** conditions (same Wi-Fi, no VPN)

---

## 📚 What's Next?

After seeing the performance improvement:

1. ✅ Implement Redis caching following [BUILD_PLAN.md](../../../BUILD_PLAN.md)
2. ✅ Run production benchmarks with real traffic
3. ✅ Monitor cache hit rates in production
4. ✅ Tune TTL values based on usage patterns
5. ✅ Consider cache warming for popular content

---

## 🎯 Success Criteria

Your Redis implementation is successful if you see:

- ✅ **90%+ reduction** in average response time
- ✅ **50x-150x speedup** for cached endpoints
- ✅ **Sub-5ms** response times for cache hits
- ✅ **100% success rate** (no errors)

---

**Happy Benchmarking! 🚀**
