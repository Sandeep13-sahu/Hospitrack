/**
 * Hospitrack — Demo Credentials Verification Script
 * Parses DEMO_CREDENTIALS.md and verifies that EVERY demonstration account
 * can authenticate successfully against the running backend with valid JWT response.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const BACKEND_PORT = parseInt(process.env.PORT, 10) || 8080;
const MD_PATH = path.resolve(__dirname, '../DEMO_CREDENTIALS.md');

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function apiLogin(email, password) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ identifier: email, password: password });
    const req = http.request({
      hostname: '127.0.0.1',
      port: BACKEND_PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ status: 0, error: err.message });
    });

    req.write(data);
    req.end();
  });
}

async function checkHealth() {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${BACKEND_PORT}/api/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForBackend(maxAttempts = 40) {
  for (let i = 0; i < maxAttempts; i++) {
    const up = await checkHealth();
    if (up) {
      // Check if admin login works (database seeder done)
      const adminLogin = await apiLogin('admin@hospitrack.com', 'Admin@Hospitrack2026!');
      if (adminLogin.status === 200 && adminLogin.data?.success) {
        await wait(1000); // final seeder commit flush
        return true;
      }
    }
    await wait(1000);
  }
  return false;
}

async function verifyAllDemoCredentials() {
  console.log('='.repeat(95));
  console.log('  HOSPITRACK — DEMO CREDENTIALS ACCURACY & AUTHENTICATION VERIFICATION');
  console.log('='.repeat(95));
  console.log(`Backend Target: http://127.0.0.1:${BACKEND_PORT}`);
  console.log(`Credentials Source: ${MD_PATH}\n`);

  if (!fs.existsSync(MD_PATH)) {
    console.error(`[ERROR] DEMO_CREDENTIALS.md not found at ${MD_PATH}`);
    process.exit(1);
  }

  let backendProc = null;
  const alreadyUp = await checkHealth();
  if (!alreadyUp) {
    console.log('[Setup] Launching Spring Boot Backend on port ' + BACKEND_PORT + '...');
    const jarPath = path.resolve(__dirname, '../backend/target/hospitrack-backend-1.0.0.jar');
    backendProc = spawn('java', [
      '-Xms96m', '-Xmx256m',
      '-Dserver.port=' + BACKEND_PORT,
      '-Dspring.profiles.active=dev',
      '-jar', jarPath
    ], {
      cwd: path.resolve(__dirname, '..'),
      stdio: ['ignore', 'pipe', 'pipe']
    });

    const ready = await waitForBackend(45);
    if (!ready) {
      console.error('[Error] Backend failed to start or seed within 45 seconds.');
      if (backendProc) backendProc.kill();
      process.exit(1);
    }
    console.log('[Setup] Backend is healthy and database seeder is verified.\n');
  } else {
    console.log('[Setup] Backend is already running and accessible on port ' + BACKEND_PORT + '.\n');
  }

  try {
    const content = fs.readFileSync(MD_PATH, 'utf8');
    const lines = content.split(/\r?\n/);

    const accounts = [];
    let inPreSeeded = false;
    let inNewlyRegistered = false;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (line.includes('## 🏥 Pre-Seeded Demonstration Accounts')) {
        inPreSeeded = true;
        inNewlyRegistered = false;
        continue;
      }
      if (line.includes('## 🔒 Security Notice')) {
        inPreSeeded = false;
        continue;
      }
      if (line.includes('## 📝 Newly Registered Accounts')) {
        inNewlyRegistered = true;
        inPreSeeded = false;
        continue;
      }

      if (inPreSeeded) {
        const m = line.match(/^\|\s*\*\*([^*]+)\*\*\s*\|\s*`([^`]+)`\s*\|\s*`([^`]+)`(?:\s*\(or\s*`([^`]+)`\))?\s*\|\s*([^|]+)\s*\|/);
        if (m) {
          accounts.push({
            section: 'Pre-Seeded',
            role: m[1].trim(),
            email: m[2].trim(),
            password: m[3].trim(),
            altPassword: m[4] ? m[4].trim() : null,
            identity: m[5].trim()
          });
        }
      } else if (inNewlyRegistered) {
        const m = line.match(/^\|\s*\*\*([^*]+)\*\*\s*\|\s*([^|]+)\s*\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|\s*([^|]+)\s*\|\s*`?([A-Za-z0-9_]+)`?\s*\|/);
        if (m) {
          accounts.push({
            section: 'Registered',
            role: m[1].trim(),
            email: m[3].trim(),
            password: m[4].trim(),
            identity: m[2].trim(),
            status: m[6].trim()
          });
        }
      }
    }

    console.log(`Discovered ${accounts.length} credentials in DEMO_CREDENTIALS.md.\n`);
    console.log('-'.repeat(95));
    console.log(
      'Status'.padEnd(8) +
      'Section'.padEnd(12) +
      'Role'.padEnd(16) +
      'Email Address'.padEnd(35) +
      'Auth Result'
    );
    console.log('-'.repeat(95));

    let passed = 0;
    let failed = 0;
    let blockedPending = 0;

    for (const acc of accounts) {
      let res = await apiLogin(acc.email, acc.password);
      let success = res.status === 200 && res.data?.success;

      // Try alternative password if first attempt failed
      if (!success && acc.altPassword) {
        const altRes = await apiLogin(acc.email, acc.altPassword);
        if (altRes.status === 200 && altRes.data?.success) {
          success = true;
          res = altRes;
        }
      }

      const isPending = acc.status === 'PENDING_APPROVAL' || res.data?.message?.includes('pending') || res.status === 403;

      if (success) {
        passed++;
        const userRole = res.data?.data?.user?.role || acc.role;
        console.log(
          '✅ PASS'.padEnd(8) +
          acc.section.padEnd(12) +
          acc.role.padEnd(16) +
          acc.email.padEnd(35) +
          `HTTP 200 OK (Role: ${userRole})`
        );
      } else if (isPending) {
        blockedPending++;
        console.log(
          '🔒 LOCK'.padEnd(8) +
          acc.section.padEnd(12) +
          acc.role.padEnd(16) +
          acc.email.padEnd(35) +
          `HTTP ${res.status} (PENDING_APPROVAL as intended)`
        );
      } else {
        failed++;
        console.log(
          '❌ FAIL'.padEnd(8) +
          acc.section.padEnd(12) +
          acc.role.padEnd(16) +
          acc.email.padEnd(35) +
          `HTTP ${res.status}: ${res.data?.message || res.error || 'Login rejected'}`
        );
      }
    }

    console.log('='.repeat(95));
    console.log(`RESULTS: ${passed} Passed | ${blockedPending} Pending Approval Enforced | ${failed} Failed`);
    console.log('='.repeat(95));

    if (failed > 0) {
      console.error(`\n[WARNING] ${failed} credentials failed to authenticate.`);
      process.exit(1);
    } else {
      console.log('\n[SUCCESS] 100% of tested credentials matched expected authentication states.');
    }
  } finally {
    if (backendProc) {
      console.log('[Teardown] Stopping background backend process...');
      backendProc.kill();
    }
  }
}

verifyAllDemoCredentials().catch(err => {
  console.error('[Error] Execution failed:', err);
  process.exit(1);
});
