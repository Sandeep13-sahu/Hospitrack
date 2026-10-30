/**
 * Hospitrack — Pure Node.js Web Server (Zero-Dependency)
 * Serves the web application at http://localhost:8000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 8000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const BACKEND_PORT = process.env.BACKEND_PORT || 8080;
const BACKEND_HOST = process.env.BACKEND_HOST || 'localhost';

const server = http.createServer((req, res) => {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let reqPath = decodeURI(req.url.split('?')[0]);

  // Proxy /api/* requests to Spring Boot backend
  if (reqPath.startsWith('/api/') || reqPath === '/api') {
    const proxyReq = http.request({
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: `${BACKEND_HOST}:${BACKEND_PORT}`
      }
    }, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'Unable to connect to Hospitrack API services. Please ensure the backend server is running.'
      }));
    });

    req.pipe(proxyReq, { end: true });
    return;
  }

  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const filePath = path.normalize(path.join(PUBLIC_DIR, reqPath));

  // Security check: ensure path is within PUBLIC_DIR
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA client-side routing
      const indexPath = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(indexPath, (readErr, content) => {
        if (readErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(content);
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please free port ${PORT} or set PORT environment variable.`);
  } else {
    console.error('Server error:', err);
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

let backendProcess = null;

function checkBackendHealth(host, port) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: host,
      port: port,
      path: '/api/health',
      method: 'GET',
      timeout: 2500
    }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

async function ensureBackendRunning() {
  const isHealthy = await checkBackendHealth(BACKEND_HOST, BACKEND_PORT);
  if (isHealthy) {
    console.log(`  Backend API:  http://${BACKEND_HOST}:${BACKEND_PORT} (Operational)`);
    return;
  }

  const jarPath = path.join(__dirname, 'backend', 'target', 'hospitrack-backend-1.0.0.jar');
  if (!fs.existsSync(jarPath)) {
    console.log(`  [Backend] Spring Boot JAR not found at ${jarPath}`);
    console.log(`  [Backend] Build backend: cd backend && mvnw clean package -DskipTests`);
    return;
  }

  console.log(`  [Backend] Launching Spring Boot backend on port ${BACKEND_PORT}...`);
  backendProcess = spawn('java', ['-jar', jarPath], {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  backendProcess.stdout.on('data', (data) => {
    const msg = data.toString();
    if (msg.includes('Tomcat started on port') || msg.includes('Started HospitrackApplication')) {
      console.log(`  [Backend] Spring Boot backend is UP on port ${BACKEND_PORT}`);
    }
  });

  backendProcess.stderr.on('data', (data) => {
    const msg = data.toString();
    if (msg.includes('ERROR')) {
      console.error(`  [Backend Error] ${msg.trim()}`);
    }
  });

  backendProcess.on('exit', (code, signal) => {
    if (code !== null && code !== 0) {
      console.log(`  [Backend] Process exited with code ${code}`);
    }
    backendProcess = null;
  });
}

function handleProcessExit() {
  if (backendProcess) {
    console.log('\nStopping Spring Boot backend...');
    try {
      backendProcess.kill('SIGTERM');
    } catch (e) {}
    backendProcess = null;
  }
  process.exit(0);
}

process.on('SIGINT', handleProcessExit);
process.on('SIGTERM', handleProcessExit);

server.listen(PORT, async () => {
  console.log('====================================================');
  console.log('  HOSPITRACK HEALTHCARE PLATFORM LIVE');
  console.log(`  Frontend URL: http://localhost:${PORT}`);
  await ensureBackendRunning();
  console.log('  Environment:  Production / Development');
  console.log('====================================================');
});
