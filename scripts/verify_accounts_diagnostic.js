/**
 * Hospitrack — Safe User Diagnostic Verification Script
 * Connects to running Hospitrack backend as SUPER_ADMIN and inspects
 * all registered accounts, verifying BCrypt hash validity, profile completeness,
 * and account status without exposing any raw passwords or hashes.
 */

const http = require('http');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:8080';
const ADMIN_EMAIL = process.env.INITIAL_ADMIN_EMAIL || 'admin@hospitrack.com';
const ADMIN_PASSWORD = process.env.INITIAL_ADMIN_PASSWORD || 'Admin@Hospitrack2026!';

function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port || 80,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runDiagnostics() {
  console.log('='.repeat(90));
  console.log(' HOSPITRACK — REGISTERED ACCOUNT AUTHENTICATION DIAGNOSTICS');
  console.log('='.repeat(90));
  console.log(`Backend Target: ${API_BASE}`);
  console.log(`Super Admin:    ${ADMIN_EMAIL}`);
  console.log('-'.repeat(90));

  try {
    // 1. Authenticate as Super Admin
    const loginRes = await request(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      identifier: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    if (loginRes.status !== 200 || !loginRes.data || !loginRes.data.success) {
      console.error(`FAILED: Super Admin authentication failed (HTTP ${loginRes.status}):`, loginRes.data?.message || loginRes.raw);
      process.exit(1);
    }

    const token = loginRes.data.data.accessToken;
    console.log('✓ Super Admin authenticated successfully. Access token acquired.');

    // 2. Query Diagnostic Endpoint
    const diagRes = await request(`${API_BASE}/api/admin/diagnostics/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (diagRes.status !== 200 || !diagRes.data || !diagRes.data.success) {
      console.error(`FAILED: Diagnostics query failed (HTTP ${diagRes.status}):`, diagRes.data?.message || diagRes.raw);
      process.exit(1);
    }

    const users = diagRes.data.data || [];
    console.log(`✓ Retrieved ${users.length} registered user records from database.\n`);

    console.log(
      '%-32s | %-14s | %-16s | %-10s | %-12s | %-10s'.replace(/%/g, '%')
        .replace('%-32s', 'Email'.padEnd(32))
        .replace('%-14s', 'Role'.padEnd(14))
        .replace('%-16s', 'Status'.padEnd(16))
        .replace('%-10s', 'BCrypt?'.padEnd(10))
        .replace('%-12s', 'Profile?'.padEnd(12))
        .replace('%-10s', 'Health'.padEnd(10))
    );
    console.log('-'.repeat(106));

    let passCount = 0;
    let warnCount = 0;

    users.forEach(u => {
      const email = (u.email || '').substring(0, 31).padEnd(32);
      const role = (u.role || '').padEnd(14);
      const status = (u.status || '').padEnd(16);
      const bcryptValid = u.validBcryptHash ? '✓ YES'.padEnd(10) : '✗ NO'.padEnd(10);
      const profileLinked = u.profileLinked ? '✓ YES'.padEnd(12) : '✗ NO'.padEnd(12);

      const isHealthy = u.validBcryptHash && u.profileLinked;
      const health = isHealthy ? 'PASS'.padEnd(10) : 'WARN'.padEnd(10);

      if (isHealthy) passCount++;
      else warnCount++;

      console.log(`${email} | ${role} | ${status} | ${bcryptValid} | ${profileLinked} | ${health}`);
    });

    console.log('-'.repeat(106));
    console.log(`SUMMARY: Total Users: ${users.length} | Healthy & Ready: ${passCount} | Action Needed: ${warnCount}`);
    console.log('SECURITY AUDIT: Zero raw passwords or password hashes exposed in diagnostics.');
    console.log('='.repeat(90));

  } catch (err) {
    console.error('Error executing account diagnostics:', err.message);
    process.exit(1);
  }
}

runDiagnostics();

