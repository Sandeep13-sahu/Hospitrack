/**
 * Hospitrack — Pure Node.js Web Server (Zero-Dependency)
 * Serves the web application and orchestrates the Spring Boot backend
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = parseInt(process.env.PORT, 10) || 8000;
const HOST = process.env.HOST || '0.0.0.0';
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

const BACKEND_PORT = parseInt(process.env.BACKEND_PORT, 10) || 8080;
const BACKEND_HOST = process.env.BACKEND_HOST || '127.0.0.1';

/**
 * Normalizes PostgreSQL connection URLs for Spring Boot / JDBC compatibility.
 * e.g., Render / Supabase "postgres://" or "postgresql://" -> "jdbc:postgresql://"
 */
function normalizeDatabaseUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return {};
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith('jdbc:')) {
    return { DATABASE_URL: trimmed };
  }
  if (trimmed.startsWith('postgres://') || trimmed.startsWith('postgresql://')) {
    try {
      const parsed = new URL(trimmed);
      const host = parsed.hostname;
      const port = parsed.port || '5432';
      const dbName = parsed.pathname ? parsed.pathname.replace(/^\//, '') : 'hospitrack_prod';
      const username = decodeURIComponent(parsed.username || '');
      const password = decodeURIComponent(parsed.password || '');
      const search = parsed.search || '';

      const jdbcUrl = `jdbc:postgresql://${host}:${port}/${dbName}${search}`;
      const updates = { DATABASE_URL: jdbcUrl };
      if (username && !process.env.DATABASE_USERNAME) {
        updates.DATABASE_USERNAME = username;
      }
      if (password && !process.env.DATABASE_PASSWORD) {
        updates.DATABASE_PASSWORD = password;
      }
      return updates;
    } catch (e) {
      console.warn('  [Backend] Notice: Could not parse DATABASE_URL as URL, prefixing with jdbc::', e.message);
      return { DATABASE_URL: `jdbc:${trimmed}` };
    }
  }
  return {};
}

function checkBackendHealth(host, port) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: host,
      port: port,
      path: '/api/health',
      method: 'GET',
      timeout: 2000
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

const server = http.createServer(async (req, res) => {
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

  // Dedicated container health check endpoint (Render / orchestrators)
  if (reqPath === '/health') {
    const isHealthy = await checkBackendHealth(BACKEND_HOST, BACKEND_PORT);
    res.writeHead(isHealthy ? 200 : 503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: isHealthy ? 'UP' : 'INITIALIZING',
      service: 'hospitrack-platform',
      frontend: 'UP',
      backend: isHealthy ? 'UP' : 'INITIALIZING',
      port: PORT,
      backendPort: BACKEND_PORT,
      timestamp: Date.now()
    }));
    return;
  }

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

async function waitForBackendReady(maxWaitMs = 60000) {
  process.stdout.write('  [Backend] Waiting for Spring Boot health probe');
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    if (await checkBackendHealth(BACKEND_HOST, BACKEND_PORT)) {
      console.log('\n  [Backend] Spring Boot API is healthy and accepting traffic.');
      return true;
    }
    process.stdout.write('.');
    await new Promise((r) => setTimeout(r, 1000));
  }
  console.log(`\n  [Backend] Note: Backend did not report ready within ${maxWaitMs / 1000}s; requests will proxy as soon as initialization completes.`);
  return false;
}

async function ensureBackendRunning() {
  const isHealthy = await checkBackendHealth(BACKEND_HOST, BACKEND_PORT);
  if (isHealthy) {
    console.log(`  Backend API:  http://${BACKEND_HOST}:${BACKEND_PORT} (Operational)`);
    return;
  }

  const candidateJarPaths = [
    process.env.JAR_PATH,
    path.join(__dirname, 'backend', 'target', 'hospitrack-backend-1.0.0.jar'),
    path.join(__dirname, 'hospitrack-backend-1.0.0.jar'),
    path.join(__dirname, 'app.jar'),
    path.join(__dirname, 'backend.jar')
  ].filter(Boolean);

  let jarPath = null;
  for (const candidate of candidateJarPaths) {
    if (fs.existsSync(candidate)) {
      jarPath = candidate;
      break;
    }
  }

  if (!jarPath) {
    console.log('  [Backend] Spring Boot JAR not found in candidate paths:');
    candidateJarPaths.forEach(p => console.log(`    - ${p}`));
    console.log('  [Backend] For local development: cd backend && mvnw clean package -DskipTests');
    return;
  }

  const dbEnvUpdates = normalizeDatabaseUrl(process.env.DATABASE_URL);
  const springProfile = process.env.SPRING_PROFILES_ACTIVE || (process.env.NODE_ENV === 'production' ? 'prod' : 'dev');

  const backendEnv = {
    ...process.env,
    ...dbEnvUpdates,
    PORT: String(BACKEND_PORT),
    SERVER_PORT: String(BACKEND_PORT),
    SPRING_PROFILES_ACTIVE: springProfile
  };

  const javaOpts = process.env.JAVA_OPTS
    ? process.env.JAVA_OPTS.split(' ').filter(Boolean)
    : ['-Xms128m', '-Xmx512m'];

  const javaArgs = [
    ...javaOpts,
    `-Dserver.port=${BACKEND_PORT}`,
    `-Dspring.profiles.active=${springProfile}`,
    '-jar',
    jarPath,
    `--server.port=${BACKEND_PORT}`,
    `--spring.profiles.active=${springProfile}`
  ];

  console.log(`  [Backend] Launching Spring Boot (${springProfile}) on port ${BACKEND_PORT}...`);
  backendProcess = spawn('java', javaArgs, {
    cwd: __dirname,
    env: backendEnv,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  backendProcess.stdout.on('data', (data) => {
    const msg = data.toString();
    process.stdout.write(`  [Spring Boot] ${msg}`);
  });

  backendProcess.stderr.on('data', (data) => {
    const msg = data.toString();
    process.stderr.write(`  [Spring Boot Error] ${msg}`);
  });

  backendProcess.on('exit', (code, signal) => {
    if (code !== null && code !== 0) {
      console.log(`  [Backend] Process exited with code ${code}${signal ? ' (signal: ' + signal + ')' : ''}`);
    }
    backendProcess = null;
  });

  await waitForBackendReady(60000);
}

function handleProcessExit(signal) {
  console.log(`\nReceived ${signal || 'exit'}, terminating Hospitrack processes gracefully...`);
  if (backendProcess) {
    try {
      backendProcess.kill('SIGTERM');
    } catch (e) {}
    backendProcess = null;
  }
  process.exit(0);
}

process.on('SIGINT', () => handleProcessExit('SIGINT'));
process.on('SIGTERM', () => handleProcessExit('SIGTERM'));

server.listen(PORT, HOST, async () => {
  console.log('====================================================');
  console.log('  HOSPITRACK HEALTHCARE PLATFORM LIVE');
  console.log(`  Frontend URL: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  console.log(`  Proxy Target: http://${BACKEND_HOST}:${BACKEND_PORT}`);
  console.log(`  Environment:  ${process.env.NODE_ENV || 'production'} (Profile: ${process.env.SPRING_PROFILES_ACTIVE || 'prod'})`);
  console.log('====================================================');
  await ensureBackendRunning();
});
