const autocannon = require('autocannon');

const targetUrl = process.env.TARGET_URL || 'http://localhost:4000/api/hospitals';
const connections = parseInt(process.env.CONNECTIONS || '100', 10);
const duration = parseInt(process.env.DURATION || '60', 10);

console.log(`Starting Load Test...`);
console.log(`Target URL:  ${targetUrl}`);
console.log(`Connections: ${connections}`);
console.log(`Duration:    ${duration} seconds\n`);

const instance = autocannon({
  url: targetUrl,
  connections: connections,
  duration: duration,
}, (err, result) => {
  if (err) {
    console.error('Load test failed with error:', err);
    process.exit(1);
  }
  
  console.log('\n======================================');
  console.log('         LOAD TEST RESULTS            ');
  console.log('======================================');
  console.log(`Target URL:          ${result.url}`);
  console.log(`Total Requests:      ${result.requests.sent}`);
  console.log(`Duration:            ${result.duration} seconds`);
  console.log(`Connections (Users): ${result.connections}`);
  console.log(`Requests/Sec (RPS):  ${result.requests.average}`);
  console.log(`Throughput:          ${(result.throughput.average / 1024 / 1024).toFixed(2)} MB/sec`);
  console.log('\n--- Response Times ---');
  console.log(`Average:             ${result.latency.average} ms`);
  console.log(`Min:                 ${result.latency.min} ms`);
  console.log(`Max:                 ${result.latency.max} ms`);
  console.log(`p50 (Median):        ${result.latency.p50} ms`);
  console.log(`p99:                 ${result.latency.p99} ms`);
  console.log('======================================\n');
});

autocannon.track(instance, { renderProgressBar: true });
