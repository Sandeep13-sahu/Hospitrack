const http = require('http');
const { spawn } = require('child_process');

async function test() {
  console.log('Testing live server.js startup and /health probe...');
  const port = 8999;
  const proc = spawn('node', ['server.js'], {
    env: {
      ...process.env,
      PORT: String(port),
      HOST: '127.0.0.1',
      NODE_ENV: 'test'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  proc.stdout.on('data', d => console.log('  [Server stdout]:', d.toString().trim()));
  proc.stderr.on('data', d => console.log('  [Server stderr]:', d.toString().trim()));

  // Wait 2 seconds for server to bind
  await new Promise(r => setTimeout(r, 2000));

  // Request /health
  await new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${port}/health`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('  [HTTP Response Code]:', res.statusCode);
        console.log('  [HTTP Response Body]:', data);
        try {
          const json = JSON.parse(data);
          if (json.service === 'hospitrack-platform' && json.frontend === 'UP') {
            console.log('  ✓ /health endpoint responded with valid schema!');
          }
        } catch (e) {
          console.error('Failed to parse JSON:', e);
        }
        resolve();
      });
    }).on('error', reject);
  });

  proc.kill('SIGTERM');
  await new Promise(r => setTimeout(r, 1000));
  console.log('  ✓ Process terminated cleanly.');
}

test().catch(e => {
  console.error('Test error:', e);
  process.exit(1);
});

