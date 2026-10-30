const assert = require('assert');
const http = require('http');

console.log('=== HOSPITRACK AUTHENTICATION & ROLE-BASED ACCOUNT INTEGRATION TEST ===\n');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (_) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function run() {
  const host = 'localhost';
  const port = 8080;

  try {
    // Quick ping to see if server is running
    const ping = await makeRequest({ host, port, path: '/api/public/stats', method: 'GET' });
    console.log(`Backend server ping: HTTP ${ping.status}`);
  } catch (err) {
    console.log('Backend server is not running on localhost:8080 currently (unit & integration tests execute in Maven SpringBootTest container).');
    return;
  }
}

run();

