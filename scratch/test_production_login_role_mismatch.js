/**
 * Hospitrack — Production Login Role Mismatch & Multi-Portal Authentication Test
 * Validates the fix for operations@apexcare.in and all cross-portal role authorization barriers.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('='.repeat(70));
console.log('🏥 HOSPITRACK: PRODUCTION LOGIN ROLE MISMATCH VERIFICATION TEST');
console.log('='.repeat(70));

// Setup DOM Mock Environment
const domElements = new Map();

function createMockElement(id, tagName = 'div') {
  const el = {
    id,
    tagName: tagName.toUpperCase(),
    value: '',
    checked: false,
    className: '',
    classList: {
      classes: new Set(),
      add(c) { this.classes.add(c); el.className = Array.from(this.classes).join(' '); },
      remove(c) { this.classes.delete(c); el.className = Array.from(this.classes).join(' '); },
      contains(c) { return this.classes.has(c); },
      toggle(c) { if (this.classes.has(c)) this.remove(c); else this.add(c); }
    },
    attributes: {},
    setAttribute(k, v) { this.attributes[k] = String(v); },
    getAttribute(k) { return this.attributes[k] || null; },
    removeAttribute(k) { delete this.attributes[k]; },
    style: {},
    innerHTML: '',
    _textContent: '',
    get textContent() {
      if (this.innerHTML) {
        return this.innerHTML.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      }
      return this._textContent || '';
    },
    set textContent(v) {
      this._textContent = v;
      this.innerHTML = '';
    },
    children: [],
    appendChild: (child) => { el.children.push(child); return child; },
    removeChild: (child) => {
      const idx = el.children.indexOf(child);
      if (idx !== -1) el.children.splice(idx, 1);
      return child;
    },
    remove: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    focus: () => { el._focused = true; },
    blur: () => { el._focused = false; },
    _focused: false
  };
  domElements.set(id, el);
  return el;
}

// Instantiate required DOM elements
const requiredIds = [
  'loginForm', 'loginIdentifier', 'loginPassword', 'loginRememberMe',
  'loginSubmitBtn', 'loginBtnSpinner', 'loginBtnText', 'loginAlertBanner',
  'loginIdentifierLabel', 'authSubtitle', 'loginRoleHelperNote',
  'loginRoleTabPatient', 'loginRoleTabDoctor', 'loginRoleTabHospital',
  'roleTabGlider', 'helpDeskModal', 'helpDeskTitle', 'helpDeskSubtitle',
  'helpDeskBody', 'loginViewContainer', 'authenticatedAppContainer',
  'mainContentArea', 'pageTitle', 'headerHospitalBadge', 'headerUserRole',
  'headerUserName', 'userProfileMenu', 'toastContainer'
];

requiredIds.forEach(id => createMockElement(id));

// Document Mock
const documentMock = {
  getElementById: (id) => domElements.get(id) || null,
  querySelector: (sel) => {
    if (sel.startsWith('#')) return domElements.get(sel.slice(1)) || null;
    return null;
  },
  querySelectorAll: () => [],
  createElement: (tag) => createMockElement('dyn-' + Math.random().toString(36).substr(2, 6), tag),
  body: createMockElement('body'),
  addEventListener: () => {},
  removeEventListener: () => {}
};

// Storage Mock
const createStorage = () => {
  const map = new Map();
  return {
    getItem: (k) => map.get(k) || null,
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear()
  };
};

const localStorageMock = createStorage();
const sessionStorageMock = createStorage();

// Window Mock
const windowMock = {
  document: documentMock,
  localStorage: localStorageMock,
  sessionStorage: sessionStorageMock,
  location: {
    hash: '',
    pathname: '/',
    origin: 'http://localhost:8000',
    hostname: 'localhost',
    port: '8000'
  },
  history: {
    pushState: (state, title, url) => {
      console.log('   [pushState called with]:', url);
      if (url && url.startsWith('#')) {
        windowMock.location.hash = url;
      }
    },
    replaceState: (state, title, url) => {
      console.log('   [replaceState called with]:', url);
      if (url && url.startsWith('#')) {
        windowMock.location.hash = url;
      }
    }
  },
  navigator: { userAgent: 'NodeTestEnv' },
  showToast: (msg, type) => {
    console.log(`   [Toast] (${type || 'info'}): ${msg}`);
  },
  openModal: () => {},
  closeModal: () => {},
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  addEventListener: () => {}
};
windowMock.window = windowMock;

// Mock Users Database matching DatabaseSeeder.java
const SEEDED_USERS = {
  'operations@apexcare.in': {
    id: 'USER-HOSP-102',
    name: 'Apex Care Admin',
    email: 'operations@apexcare.in',
    role: 'HOSPITAL_ADMIN',
    hospitalId: 'HOSP-102',
    hospitalName: 'Apex Care Medical Center',
    status: 'ACTIVE'
  },
  'admin@citygeneral.in': {
    id: 'USER-HOSP-101',
    name: 'City General Hospital Admin',
    email: 'admin@citygeneral.in',
    role: 'HOSPITAL_ADMIN',
    hospitalId: 'HOSP-101',
    hospitalName: 'City General Hospital',
    status: 'ACTIVE'
  },
  'dr.arjun@apexcare.com': {
    id: 'USER-DOC-202-ALIAS',
    name: 'Dr. Arjun Verma',
    email: 'dr.arjun@apexcare.com',
    role: 'DOCTOR',
    hospitalId: 'HOSP-102',
    doctorId: 'DOC-202',
    hospitalName: 'Apex Care Medical Center',
    status: 'ACTIVE'
  },
  'r.verma@apexcare.in': {
    id: 'USER-DOC-202',
    name: 'Dr. Arjun Verma',
    email: 'r.verma@apexcare.in',
    role: 'DOCTOR',
    hospitalId: 'HOSP-102',
    doctorId: 'DOC-202',
    hospitalName: 'Apex Care Medical Center',
    status: 'ACTIVE'
  },
  's.sharma@citygeneral.in': {
    id: 'USER-DOC-201',
    name: 'Dr. Sarah Sharma',
    email: 's.sharma@citygeneral.in',
    role: 'DOCTOR',
    hospitalId: 'HOSP-101',
    doctorId: 'DOC-201',
    hospitalName: 'City General Hospital',
    status: 'ACTIVE'
  },
  'john.doe@email.com': {
    id: 'USER-PAT-301',
    name: 'John Doe',
    email: 'john.doe@email.com',
    role: 'PATIENT',
    patientId: 'PAT-301',
    hospitalId: 'HOSP-101',
    status: 'ACTIVE'
  },
  'rahul.sharma@gmail.com': {
    id: 'USER-PAT-300',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@gmail.com',
    role: 'PATIENT',
    patientId: 'PAT-300',
    hospitalId: 'HOSP-101',
    status: 'ACTIVE'
  },
  'admin@hospitrack.com': {
    id: 'ADMIN-01',
    name: 'System Administrator',
    email: 'admin@hospitrack.com',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE'
  }
};

// Create Auth Service Mock
let currentAuthUser = null;
windowMock.hospitrackAuth = {
  getCurrentUser: () => currentAuthUser,
  getAccessToken: () => currentAuthUser ? 'jwt-token-' + currentAuthUser.id : null,
  isAuthenticated: () => !!currentAuthUser,
  login: async (identifier, password, rememberMe) => {
    const user = SEEDED_USERS[identifier.trim().toLowerCase()];
    if (!user) {
      throw new Error('Invalid email or password.');
    }
    currentAuthUser = user;
    sessionStorageMock.setItem('hospitrack_access_token', 'jwt-' + user.id);
    sessionStorageMock.setItem('hospitrack_auth_user', JSON.stringify(user));
    return {
      token: 'jwt-' + user.id,
      user: user,
      redirectUrl: user.role === 'SUPER_ADMIN' ? '#admin/overview' :
                   user.role === 'DOCTOR' ? '#doctor/dashboard' :
                   user.role === 'HOSPITAL_ADMIN' ? '#hospital/overview' : '#patient/overview'
    };
  },
  logout: async () => {
    currentAuthUser = null;
    sessionStorageMock.clear();
    localStorageMock.clear();
  }
};

windowMock.hospitrackStore = {
  syncAllData: async () => {},
  getCurrentUser: () => currentAuthUser,
  getNotifications: () => [],
  getPatients: () => [],
  getDoctors: () => [],
  getHospitals: () => [],
  getVisits: () => [],
  getPrescriptions: () => [],
  getLabReports: () => [],
  getReferrals: () => [],
  getTransfers: () => [],
  getReviews: () => [],
  getAuditLogs: () => []
};

// Load code into Sandbox
const context = vm.createContext({
  window: windowMock,
  document: documentMock,
  localStorage: localStorageMock,
  sessionStorage: sessionStorageMock,
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout
});

const configCode = fs.readFileSync(path.join(__dirname, '../js/config.js'), 'utf8');
const appCode = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');

vm.runInContext(configCode, context);
vm.runInContext(appCode, context);

async function runTests() {
  console.log('\n--- 1. Testing Role Mismatch for operations@apexcare.in on Doctor Tab ---');
  
  // User selects DOCTOR tab
  context.selectLoginRole('DOCTOR');
  assert.strictEqual(windowMock.getCurrentSelectedLoginRole(), 'DOCTOR', 'Active login role should be DOCTOR');
  
  const idInput = domElements.get('loginIdentifier');
  const pwdInput = domElements.get('loginPassword');
  const alertBanner = domElements.get('loginAlertBanner');
  
  idInput.value = 'operations@apexcare.in';
  pwdInput.value = 'Hospital@123!';
  
  // Trigger login
  await context.handleLoginSubmit({ preventDefault: () => {} });
  
  // Verify banner content
  console.log('   Alert Banner Text:', alertBanner.textContent);
  assert(
    alertBanner.textContent.includes('Access Denied: This portal is for Medical Doctors only'),
    'Should state that the portal is for Medical Doctors only'
  );
  assert(
    alertBanner.textContent.includes('Please switch to the "Hospital" tab above to sign in') ||
    alertBanner.textContent.includes('Please switch to the Hospital tab above to sign in'),
    'Should guide the user to switch to the Hospital tab'
  );
  assert(
    alertBanner.textContent.includes('operations@apexcare.in') && alertBanner.textContent.includes('Hospital Administrator'),
    'Should clearly state that operations@apexcare.in is registered as a Hospital Administrator'
  );
  assert(
    alertBanner.innerHTML.includes('switchLoginPortalAndPreserve'),
    'Should provide a one-click button to switch to the Hospital tab'
  );
  assert(
    alertBanner.textContent.includes('dr.arjun@apexcare.com') || alertBanner.textContent.includes('r.verma@apexcare.in'),
    'Should provide doctor credentials hint for Apex Care'
  );
  assert.strictEqual(windowMock.hospitrackAuth.getCurrentUser(), null, 'Unauthorized session must be completely logged out');
  console.log('   ✓ Role mismatch successfully intercepted and explained with 1-click action');

  console.log('\n--- 2. Testing One-Click Switch to Hospital Tab with Email Preservation ---');
  // Invoke one-click switch
  context.switchLoginPortalAndPreserve('HOSPITAL', 'operations@apexcare.in');
  
  assert.strictEqual(windowMock.getCurrentSelectedLoginRole(), 'HOSPITAL', 'Active login role must now be HOSPITAL');
  assert.strictEqual(idInput.value, 'operations@apexcare.in', 'Email must be preserved in the input');
  assert.strictEqual(pwdInput.value, '', 'Password input must be cleared');
  assert.strictEqual(pwdInput._focused, true, 'Password input must be focused');
  assert(
    alertBanner.textContent.includes('Switched to Hospital tab'),
    'Informational banner must confirm switch to Hospital tab'
  );
  console.log('   ✓ Switched to Hospital tab with preserved email and focused password');

  console.log('\n--- 3. Testing Hospital Admin Login for operations@apexcare.in on Hospital Tab ---');
  pwdInput.value = 'Hospital@123!';
  await context.handleLoginSubmit({ preventDefault: () => {} });
  console.log('   Alert Banner after login submit:', alertBanner.textContent);
  console.log('   Current Hash:', windowMock.location.hash);
  console.log('   Auth user:', windowMock.hospitrackAuth.getCurrentUser());
  
  assert.strictEqual(windowMock.hospitrackAuth.isAuthenticated(), true, 'User should now be authenticated');
  assert.strictEqual(windowMock.hospitrackAuth.getCurrentUser().role, 'HOSPITAL_ADMIN', 'Authenticated user role must be HOSPITAL_ADMIN');
  assert(
    windowMock.location.hash.startsWith('#hospital/'),
    `Hash navigation must route to hospital overview (current: ${windowMock.location.hash})`
  );
  console.log(`   ✓ Authenticated successfully! Routed to ${windowMock.location.hash}`);

  console.log('\n--- 4. Testing Medical Doctor Login for dr.arjun@apexcare.com on Doctor Tab ---');
  await windowMock.executeLogoutAction();
  context.selectLoginRole('DOCTOR');
  idInput.value = 'dr.arjun@apexcare.com';
  pwdInput.value = 'Doctor@123!';
  await context.handleLoginSubmit({ preventDefault: () => {} });
  
  assert.strictEqual(windowMock.hospitrackAuth.isAuthenticated(), true, 'Doctor should be authenticated');
  assert.strictEqual(windowMock.hospitrackAuth.getCurrentUser().role, 'DOCTOR', 'Role must be DOCTOR');
  assert(
    windowMock.location.hash.startsWith('#doctor/'),
    `Hash navigation must route to doctor workstation (current: ${windowMock.location.hash})`
  );
  console.log(`   ✓ Doctor authenticated successfully! Routed to ${windowMock.location.hash}`);

  console.log('\n--- 5. Testing Medical Doctor Login for r.verma@apexcare.in on Doctor Tab ---');
  await windowMock.executeLogoutAction();
  context.selectLoginRole('DOCTOR');
  idInput.value = 'r.verma@apexcare.in';
  pwdInput.value = 'Doctor@123!';
  await context.handleLoginSubmit({ preventDefault: () => {} });
  
  assert.strictEqual(windowMock.hospitrackAuth.isAuthenticated(), true, 'Doctor r.verma should be authenticated');
  assert.strictEqual(windowMock.hospitrackAuth.getCurrentUser().role, 'DOCTOR', 'Role must be DOCTOR');
  assert(
    windowMock.location.hash.startsWith('#doctor/'),
    `Hash navigation must route to doctor workstation (current: ${windowMock.location.hash})`
  );
  console.log(`   ✓ Doctor r.verma authenticated successfully! Routed to ${windowMock.location.hash}`);

  console.log('\n--- 6. Testing Patient Login for john.doe@email.com on Patient Tab ---');
  await windowMock.executeLogoutAction();
  context.selectLoginRole('PATIENT');
  idInput.value = 'john.doe@email.com';
  pwdInput.value = 'Patient@123!';
  await context.handleLoginSubmit({ preventDefault: () => {} });
  
  assert.strictEqual(windowMock.hospitrackAuth.isAuthenticated(), true, 'Patient should be authenticated');
  assert.strictEqual(windowMock.hospitrackAuth.getCurrentUser().role, 'PATIENT', 'Role must be PATIENT');
  assert(
    windowMock.location.hash.startsWith('#patient/'),
    `Hash navigation must route to patient overview (current: ${windowMock.location.hash})`
  );
  console.log(`   ✓ Patient authenticated successfully! Routed to ${windowMock.location.hash}`);

  console.log('\n--- 7. Testing Super Admin Universal Login on Any Tab ---');
  await windowMock.executeLogoutAction();
  context.selectLoginRole('DOCTOR'); // Even from Doctor tab
  idInput.value = 'admin@hospitrack.com';
  pwdInput.value = 'Admin@Hospitrack2026!';
  await context.handleLoginSubmit({ preventDefault: () => {} });
  
  assert.strictEqual(windowMock.hospitrackAuth.isAuthenticated(), true, 'Super Admin should be authenticated');
  assert.strictEqual(windowMock.hospitrackAuth.getCurrentUser().role, 'SUPER_ADMIN', 'Role must be SUPER_ADMIN');
  assert(
    windowMock.location.hash.startsWith('#admin/'),
    `Hash navigation must route to super admin overview (current: ${windowMock.location.hash})`
  );
  console.log(`   ✓ Super Admin authenticated universally! Routed to ${windowMock.location.hash}`);

  console.log('\n--- 8. Testing Cross-Role Barriers for All Roles ---');
  
  // Doctor trying to login on Hospital tab
  await windowMock.executeLogoutAction();
  context.selectLoginRole('HOSPITAL');
  idInput.value = 's.sharma@citygeneral.in';
  pwdInput.value = 'Doctor@123!';
  await context.handleLoginSubmit({ preventDefault: () => {} });
  assert(
    alertBanner.textContent.includes('This portal is for Hospital Administrators and staff only') &&
    alertBanner.textContent.includes('Medical Doctor'),
    'Doctor on Hospital tab is blocked with doctor role identification'
  );
  assert(alertBanner.innerHTML.includes("switchLoginPortalAndPreserve('DOCTOR'"), 'Has switch to Doctor button');
  console.log('   ✓ Doctor blocked on Hospital tab with Doctor switch action');

  // Patient trying to login on Doctor tab
  await windowMock.executeLogoutAction();
  context.selectLoginRole('DOCTOR');
  idInput.value = 'john.doe@email.com';
  pwdInput.value = 'Patient@123!';
  await context.handleLoginSubmit({ preventDefault: () => {} });
  assert(
    alertBanner.textContent.includes('This portal is for Medical Doctors only') &&
    alertBanner.textContent.includes('Patient'),
    'Patient on Doctor tab is blocked with Patient role identification'
  );
  assert(alertBanner.innerHTML.includes("switchLoginPortalAndPreserve('PATIENT'"), 'Has switch to Patient button');
  console.log('   ✓ Patient blocked on Doctor tab with Patient switch action');

  console.log('\n' + '='.repeat(70));
  console.log('🎉 ALL 8 PRODUCTION ROLE AUTHENTICATION TESTS PASSED PERFECTLY!');
  console.log('='.repeat(70));
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
