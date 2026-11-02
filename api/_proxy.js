/**
 * Hospitrack — Vercel Serverless API Gateway / Reverse Proxy
 * Zero-dependency, streaming proxy connecting Vercel frontend deployments
 * to the authoritative Hospitrack Spring Boot REST API backend.
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const DEFAULT_LOCAL_BACKEND = 'http://localhost:8080';

module.exports = async function proxyHandler(req, res) {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Resolve backend target from environment variables
  const rawBackendUrl = (
    process.env.BACKEND_URL ||
    process.env.API_BASE_URL ||
    process.env.SPRING_BACKEND_URL ||
    DEFAULT_LOCAL_BACKEND
  ).trim().replace(/\/+$/, '');

  let targetUrl;
  try {
    targetUrl = new URL(rawBackendUrl);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      message: 'Invalid BACKEND_URL configuration in serverless environment.',
      error: err.message
    }));
    return;
  }

  // Determine requested subpath and prevent double /api prefixes
  let reqPath = req.url || '/';
  reqPath = reqPath.replace(/^\/api\/api(?=\/|$)/, '/api');

  if (!reqPath.startsWith('/api') && !reqPath.startsWith('/health')) {
    reqPath = '/api' + (reqPath.startsWith('/') ? reqPath : '/' + reqPath);
  }

  // Combine targetUrl base path if custom subpath is provided, avoiding double /api
  let basePath = targetUrl.pathname ? targetUrl.pathname.replace(/\/+$/, '') : '';
  if (basePath === '/api' && reqPath.startsWith('/api')) {
    basePath = '';
  }
  const fullPath = (basePath ? basePath : '') + reqPath;

  const isHttps = targetUrl.protocol === 'https:';
  const transport = isHttps ? https : http;
  const targetPort = targetUrl.port ? parseInt(targetUrl.port, 10) : (isHttps ? 443 : 80);

  // Prepare outgoing headers
  const outgoingHeaders = { ...req.headers };
  outgoingHeaders.host = targetUrl.host;
  delete outgoingHeaders['content-length'];
  delete outgoingHeaders['connection'];
  delete outgoingHeaders['keep-alive'];

  // Handle body payload if pre-parsed by serverless framework
  let bodyBuffer = null;
  if (req.body) {
    if (Buffer.isBuffer(req.body)) {
      bodyBuffer = req.body;
    } else if (typeof req.body === 'object') {
      bodyBuffer = Buffer.from(JSON.stringify(req.body), 'utf8');
      outgoingHeaders['content-type'] = outgoingHeaders['content-type'] || 'application/json';
    } else if (typeof req.body === 'string') {
      bodyBuffer = Buffer.from(req.body, 'utf8');
    }
    if (bodyBuffer) {
      outgoingHeaders['content-length'] = bodyBuffer.length;
    }
  }

  const options = {
    hostname: targetUrl.hostname,
    port: targetPort,
    path: fullPath,
    method: req.method,
    headers: outgoingHeaders,
    timeout: 30000
  };

  const proxyReq = transport.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('timeout', () => {
    proxyReq.destroy();
    if (!res.headersSent) {
      res.writeHead(504, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'Gateway Timeout: Hospitrack API backend took too long to respond.',
        target: targetUrl.origin
      }));
    }
  });

  proxyReq.on('error', (err) => {
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'Unable to connect to Hospitrack API services. Please verify BACKEND_URL in your Vercel Dashboard.',
        configuredBackend: targetUrl.origin,
        error: err.message
      }));
    }
  });

  if (bodyBuffer) {
    proxyReq.write(bodyBuffer);
    proxyReq.end();
  } else {
    req.pipe(proxyReq, { end: true });
  }
};

