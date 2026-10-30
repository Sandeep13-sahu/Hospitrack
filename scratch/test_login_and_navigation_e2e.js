/**
 * Hospitrack — Complete Login, Authentication & Role Dashboard Navigation E2E Test
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('================================================================');
console.log('  HOSPITRACK E2E LOGIN & ROLE DASHBOARD NAVIGATION VERIFICATION  ');
console.log('================================================================\n');

function requestJson(port, pathName, method = 'GET', payload = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const reqHeaders = { ...headers };
    let data = null;
    if (payload) {
      data = JSON.stringify(payload);
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(data);
    }

    const req = http.request({
      hostname: 'localhost',
      port: port,
      path: pathName,
      method: method,
      headers: reqHeaders
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function postJson(port, pathName, payload, headers = {}) {
  return requestJson(port, pathName, 'POST', payload, headers);
}

function getJson(port, pathName, headers = {}) {
  return requestJson(port, pathName, 'GET', null, headers);
}

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: ${message}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // TEST SUITE 1: Proxy and Health API Verification
  // -------------------------------------------------------------
  console.log('[1/5] Testing Backend & Web Server Connectivity...');
  try {
    const directHealth = await getJson(8080, '/api/health');
    assert(directHealth.status === 200 && directHealth.body.status === 'UP', 'Direct Spring Boot Health (/api/health on 8080) is UP');

    const proxiedHealth = await getJson(8000, '/api/health');
    assert(proxiedHealth.status === 200 && proxiedHealth.body.status === 'UP', 'Web Server Reverse Proxy (/api/health on 8000) is operational');
  } catch (err) {
    assert(false, `Health check connectivity failed: ${err.message}`);
  }

  // -------------------------------------------------------------
  // TEST SUITE 2: Live Login API across all 4 Roles
  // -------------------------------------------------------------
  console.log('\n[2/5] Testing Real Spring Security Login API Across All Roles...');
  
  const credentials = [
    { role: 'PATIENT', id: 'john.doe@email.com', pass: 'Patient@123!', expectedRole: 'PATIENT' },
    { role: 'DOCTOR', id: 's.sharma@citygeneral.in', pass: 'Doctor@123!', expectedRole: 'DOCTOR' },
    { role: 'HOSPITAL_ADMIN', id: 'admin@citygeneral.in', pass: 'Hospital@123!', expectedRole: 'HOSPITAL_ADMIN' },
    { role: 'SUPER_ADMIN', id: 'admin@hospitrack.com', pass: 'Admin@Hospitrack2026!', expectedRole: 'SUPER_ADMIN' }
  ];

  const authTokens = {};

  for (const cred of credentials) {
    try {
      const res = await postJson(8000, '/api/auth/login', {
        identifier: cred.id,
        password: cred.pass
      });

      const ok = res.status === 200 && res.body.success === true && res.body.data && res.body.data.accessToken;
      assert(ok, `Login API issued valid JWT for ${cred.role} (${cred.id})`);
      if (ok) {
        authTokens[cred.role] = res.body.data.accessToken;
        assert(res.body.data.user.role === cred.expectedRole, `User role is correctly set to ${cred.expectedRole}`);
      }
    } catch (err) {
      assert(false, `Login failed for ${cred.role}: ${err.message}`);
    }
  }

  // -------------------------------------------------------------
  // TEST SUITE 3: Invalid Credentials Rejection
  // -------------------------------------------------------------
  console.log('\n[3/5] Testing Invalid Credentials & Security Boundaries...');
  try {
    const invalidRes = await postJson(8000, '/api/auth/login', {
      identifier: 'john.doe@email.com',
      password: 'WrongPassword999!'
    });
    assert(invalidRes.status === 401 && invalidRes.body.success === false, 'Invalid password correctly rejected with HTTP 401 Unauthorized');
  } catch (err) {
    assert(false, `Invalid password test error: ${err.message}`);
  }

  // -------------------------------------------------------------
  // TEST SUITE 4: DOM Simulation of Login Flow & Routing
  // -------------------------------------------------------------
  console.log('\n[4/5] Testing Frontend Navigation & Role Routing (DOM simulation)...');

  // Build a lightweight browser environment to execute client scripts
  const storage = {};
  const mockStorage = {
    getItem: (k) => storage[k] || null,
    setItem: (k, v) => { storage[k] = String(v); },
    removeItem: (k) => { delete storage[k]; },
    clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
  };

  const elements = {};
  function makeEl(id, tag = 'div') {
    elements[id] = {
      id,
      tagName: tag.toUpperCase(),
      value: '',
      checked: false,
      innerHTML: '',
      textContent: '',
      className: '',
      style: {},
      classList: {
        classes: new Set(),
        add(c) { this.classes.add(c); },
        remove(c) { this.classes.delete(c); },
        contains(c) { return this.classes.has(c); },
        toggle(c, force) {
          if (force !== undefined) {
            if (force) this.classes.add(c); else this.classes.delete(c);
            return force;
          }
          if (this.classes.has(c)) { this.classes.delete(c); return false; }
          else { this.classes.add(c); return true; }
        }
      },
      setAttribute(k, v) { this[k] = v; },
      getAttribute(k) { return this[k] || null; },
      querySelector(sel) { return null; },
      querySelectorAll(sel) { return []; },
      appendChild(child) {},
      remove() {},
      trim() { return (this.value || '').trim(); }
    };
    return elements[id];
  }

  const docEl = makeEl('html');
  docEl.dataset = {};

  // Pre-populate required elements
  [
    'landingViewContainer', 'loginViewContainer', 'registerViewContainer', 'authenticatedAppContainer',
    'loginIdentifier', 'loginPassword', 'loginRememberMe', 'loginSubmitBtn', 'loginBtnSpinner', 'loginBtnText',
    'loginAlertBanner', 'loginRoleTabPatient', 'loginRoleTabDoctor', 'loginRoleTabHospital', 'roleTabGlider',
    'loginIdentifierLabel', 'authSubtitle', 'loginRoleHelperNote', 'mainContentArea', 'headerBreadcrumbRole',
    'headerBreadcrumbTitle', 'headerUserName', 'headerUserRole', 'headerUserFacility', 'toastContainer',
    'confirmLogoutModal'
  ].forEach(id => makeEl(id));

  const windowMock = {
    location: {
      hostname: 'localhost',
      port: '8000',
      origin: 'http://localhost:8000',
      protocol: 'http:',
      pathname: '/',
      hash: '',
      search: ''
    },
    history: {
      pushState: (state, title, url) => { windowMock.location.hash = url; },
      replaceState: (state, title, url) => { windowMock.location.hash = url; }
    },
    localStorage: mockStorage,
    sessionStorage: mockStorage,
    addEventListener: () => {},
    removeEventListener: () => {},
    document: {
      documentElement: docEl,
      getElementById: (id) => elements[id] || makeEl(id),
      querySelector: (sel) => null,
      querySelectorAll: () => [],
      createElement: (tag) => makeEl(`gen-${Math.random()}`, tag),
      body: makeEl('body'),
      addEventListener: () => {}
    },
    showToast: () => {},
    showError: () => {},
    showSuccess: () => {},
    escapeHtml: (s) => String(s || ''),
    fetch: async (url, opts = {}) => {
      const parsedUrl = new URL(url, 'http://localhost:8000');
      const port = parsedUrl.port || 8000;
      const method = (opts.method || 'GET').toUpperCase();
      const headers = opts.headers || {};
      const payload = opts.body ? JSON.parse(opts.body) : null;
      const fullPath = parsedUrl.pathname + parsedUrl.search;
      const res = await requestJson(port, fullPath, method, payload, headers);
      return {
        ok: res.status >= 200 && res.status < 300,
        status: res.status,
        json: async () => res.body || {}
      };
    }
  };

  const sandboxContext = vm.createContext({
    window: windowMock,
    document: windowMock.document,
    history: windowMock.history,
    localStorage: mockStorage,
    sessionStorage: mockStorage,
    location: windowMock.location,
    fetch: windowMock.fetch,
    console: console,
    setTimeout: (fn) => fn(),
    clearTimeout: () => {},
    Math: Math,
    Date: Date,
    Array: Array,
    Object: Object,
    String: String,
    Number: Number,
    RegExp: RegExp,
    encodeURIComponent: encodeURIComponent,
    decodeURIComponent: decodeURIComponent
  });
  sandboxContext.window.window = sandboxContext.window;

  // Load client scripts into vm context
  const clientFiles = [
    'js/config.js',
    'js/authService.js',
    'js/store.js',
    'js/components/patientDashboard.js',
    'js/components/doctorDashboard.js',
    'js/components/hospitalDashboard.js',
    'js/components/adminDashboard.js',
    'js/app.js'
  ];

  clientFiles.forEach(relPath => {
    const fullPath = path.join(__dirname, '..', relPath);
    const code = fs.readFileSync(fullPath, 'utf8');
    vm.runInContext(code, sandboxContext, { filename: relPath });
  });

  // Test 4A: Patient Login Navigation
  sandboxContext.window.selectLoginRole('PATIENT');
  elements.loginIdentifier.value = 'john.doe@email.com';
  elements.loginPassword.value = 'Patient@123!';
  await sandboxContext.window.handleLoginSubmit({ preventDefault: () => {} });

  if (elements.loginAlertBanner.textContent) {
    console.log('    [Debug Alert]:', elements.loginAlertBanner.textContent);
  }

  assert(
    windowMock.location.hash.startsWith('#patient/'),
    `Patient login navigated to patient workspace (hash: ${windowMock.location.hash})`
  );
  assert(
    elements.authenticatedAppContainer.classList.contains('hidden') === false,
    'Authenticated app container is displayed (visible)'
  );
  assert(
    elements.mainContentArea.innerHTML.length > 50,
    'Patient Dashboard successfully rendered HTML into mainContentArea'
  );

  // Test 4B: Role Segregation Barrier (Doctor trying to log in on Patient tab)
  sandboxContext.window.executeLogoutAction();
  sandboxContext.window.selectLoginRole('PATIENT');
  elements.loginIdentifier.value = 's.sharma@citygeneral.in';
  elements.loginPassword.value = 'Doctor@123!';
  await sandboxContext.window.handleLoginSubmit({ preventDefault: () => {} });

  assert(
    elements.loginAlertBanner.textContent.includes('Access Denied: This portal is for Patients only'),
    'Doctor attempting login on Patient tab receives role segregation warning'
  );

  // Test 4C: Doctor Login on Doctor Tab Navigation
  sandboxContext.window.selectLoginRole('DOCTOR');
  elements.loginIdentifier.value = 's.sharma@citygeneral.in';
  elements.loginPassword.value = 'Doctor@123!';
  await sandboxContext.window.handleLoginSubmit({ preventDefault: () => {} });

  assert(
    windowMock.location.hash.startsWith('#doctor/'),
    `Doctor login navigated to doctor workspace (hash: ${windowMock.location.hash})`
  );
  assert(
    elements.mainContentArea.innerHTML.length > 50,
    'Doctor Workstation successfully rendered HTML into mainContentArea'
  );

  // Test 4D: Hospital Admin Login Navigation
  sandboxContext.window.executeLogoutAction();
  sandboxContext.window.selectLoginRole('HOSPITAL');
  elements.loginIdentifier.value = 'admin@citygeneral.in';
  elements.loginPassword.value = 'Hospital@123!';
  await sandboxContext.window.handleLoginSubmit({ preventDefault: () => {} });

  assert(
    windowMock.location.hash.startsWith('#hospital/'),
    `Hospital Admin login navigated to hospital workspace (hash: ${windowMock.location.hash})`
  );
  assert(
    elements.mainContentArea.innerHTML.length > 50,
    'Hospital Operations Deck successfully rendered HTML into mainContentArea'
  );

  // Test 4E: Super Admin Login Universal Navigation
  sandboxContext.window.executeLogoutAction();
  // Super admin can log in from any tab
  sandboxContext.window.selectLoginRole('HOSPITAL');
  elements.loginIdentifier.value = 'admin@hospitrack.com';
  elements.loginPassword.value = 'Admin@Hospitrack2026!';
  await sandboxContext.window.handleLoginSubmit({ preventDefault: () => {} });

  assert(
    windowMock.location.hash.startsWith('#admin/'),
    `Super Admin login navigated to admin command center (hash: ${windowMock.location.hash})`
  );
  assert(
    elements.mainContentArea.innerHTML.length > 50,
    'Super Admin Command Center successfully rendered HTML into mainContentArea'
  );

  // -------------------------------------------------------------
  // TEST SUITE 5: Page Refresh / Session Restoration
  // -------------------------------------------------------------
  console.log('\n[5/5] Testing Page Refresh & Auth State Preservation...');
  
  // Re-run initApp() while authenticated state is in mockStorage
  windowMock.location.hash = '#admin/overview';
  await sandboxContext.initApp();

  assert(
    sandboxContext.window.hospitrackAuth.isAuthenticated(),
    'User remains authenticated after page reload'
  );
  assert(
    elements.authenticatedAppContainer.classList.contains('hidden') === false,
    'Authenticated app remains visible on reload (does not revert to login)'
  );
  assert(
    windowMock.location.hash === '#admin/overview',
    `Preserved active deep route on reload (hash: ${windowMock.location.hash})`
  );

  console.log('\n================================================================');
  console.log(`  VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
