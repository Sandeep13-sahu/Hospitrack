const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Simple DOM Mock
const mockElements = {};

function createElement(id, tagName = 'div') {
  const el = {
    id: id,
    tagName: tagName.toUpperCase(),
    classList: {
      _classes: new Set(),
      add: function(...cls) { cls.forEach(c => this._classes.add(c)); },
      remove: function(...cls) { cls.forEach(c => this._classes.delete(c)); },
      toggle: function(c) { if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c); },
      contains: function(c) { return this._classes.has(c); }
    },
    style: {},
    innerHTML: '',
    textContent: '',
    value: '',
    checked: false,
    disabled: false,
    setAttribute: function(k, v) { this[k] = v; },
    getAttribute: function(k) { return this[k]; },
    removeAttribute: function(k) { delete this[k]; },
    querySelector: function(sel) { return null; },
    querySelectorAll: function(sel) { return []; },
    contains: function() { return false; },
    scrollIntoView: function() {},
    focus: function() {}
  };
  if (id) mockElements[id] = el;
  return el;
}

// Pre-create known elements from index.html
const elementIds = [
  'landingViewContainer', 'loginViewContainer', 'registerViewContainer', 'authenticatedAppContainer',
  'headerBreadcrumbRole', 'headerBreadcrumbTitle', 'authHeaderAvatar', 'authHeaderName', 'authHeaderRole',
  'profileDropdownAvatar', 'profileDropdownName', 'profileDropdownEmail', 'profileDropdownRoleBadge',
  'profileDropdownMenu', 'profileDropdownBtn', 'notifToggleBtn', 'notifBadgeDot', 'notifDropdown', 'notifList',
  'globalSearchInput', 'globalSearchDropdown', 'appSidebar', 'mainContentArea', 'toastContainer',
  'mobileNavOverlay', 'addDoctorModal', 'userProfileModal', 'userProfileModalTitle', 'userProfileModalContent',
  'reportDetailModal', 'reportDetailBody', 'reviewModal', 'reviewHospitalNameDisplay', 'reviewHospitalId',
  'reviewRating', 'reviewTitle', 'reviewText', 'submitReviewBtn', 'globalModalContainer', 'confirmLogoutModal'
];

elementIds.forEach(id => createElement(id));

const documentMock = {
  getElementById: (id) => {
    if (!mockElements[id]) {
      mockElements[id] = createElement(id);
    }
    return mockElements[id];
  },
  querySelector: (sel) => {
    if (sel.startsWith('#')) return documentMock.getElementById(sel.substring(1));
    return null;
  },
  querySelectorAll: (sel) => [],
  addEventListener: () => {},
  createElement: (tag) => createElement(null, tag),
  body: createElement('body')
};

const windowMock = {
  location: { hash: '', origin: 'http://localhost:8080' },
  history: { pushState: () => {}, replaceState: () => {} },
  document: documentMock,
  addEventListener: () => {},
  showToast: (msg, type) => console.log(`[TOAST ${type}] ${msg}`),
  confirm: () => true,
  localStorage: {
    _data: {},
    getItem: function(k) { return this._data[k] || null; },
    setItem: function(k, v) { this._data[k] = String(v); },
    removeItem: function(k) { delete this._data[k]; },
    clear: function() { this._data = {}; }
  },
  sessionStorage: {
    _data: {},
    getItem: function(k) { return this._data[k] || null; },
    setItem: function(k, v) { this._data[k] = String(v); },
    removeItem: function(k) { delete this._data[k]; },
    clear: function() { this._data = {}; }
  }
};
windowMock.window = windowMock;

const context = vm.createContext({
  window: windowMock,
  document: documentMock,
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({ data: [] }) }),
  localStorage: windowMock.localStorage,
  sessionStorage: windowMock.sessionStorage
});

// Load files in order
const jsFiles = [
  'js/config.js',
  'js/authService.js',
  'js/store.js',
  'js/components/auditLogger.js',
  'js/workspaceRenderer.js',
  'js/components/patientDashboard.js',
  'js/components/doctorDashboard.js',
  'js/components/hospitalDashboard.js',
  'js/components/adminDashboard.js',
  'js/components/departmentWorkspace.js',
  'js/components/modalManager.js',
  'js/app.js'
];

for (const file of jsFiles) {
  const code = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  try {
    vm.runInContext(code, context, { filename: file });
    console.log(`[OK] Loaded ${file}`);
  } catch (err) {
    console.error(`[FAIL] Loading ${file}:`, err);
  }
}

// Test Hospital Admin Rendering
console.log('\n--- Testing Hospital Admin Dashboard Rendering ---');
try {
  const hospitalUser = {
    id: 'USR-HOSP-01',
    name: 'City General Hospital Admin',
    email: 'admin@hospital.in',
    role: 'HOSPITAL_ADMIN',
    hospitalId: 'HOSP-101'
  };
  
  context.window.hospitrackAuth.getCurrentUser = () => hospitalUser;
  context.window.hospitrackAuth.isAuthenticated = () => true;
  
  const hospitalSections = ['overview', 'bed-management', 'patients', 'staff', 'referrals', 'transfers', 'discharge-clearance', 'reviews', 'profile'];
  
  for (const sec of hospitalSections) {
    console.log(`Testing Hospital section: ${sec}`);
    context.window.navigateToRoleSection('HOSPITAL_ADMIN', sec, {}, false);
    const mainHtml = mockElements['mainContentArea'].innerHTML;
    console.log(`  -> Rendered length: ${mainHtml.length} chars (First 60: ${mainHtml.substring(0, 60).replace(/\n/g, ' ')})`);
    if (mainHtml.length === 0) {
      console.error(`  [EMPTY HTML] Section ${sec} produced empty HTML!`);
    }
  }
} catch (err) {
  console.error('[CRASH] Hospital Admin test crashed:', err);
}

// Test Super Admin Rendering
console.log('\n--- Testing Super Admin Dashboard Rendering ---');
try {
  const adminUser = {
    id: 'USR-ADMIN-01',
    name: 'System Super Administrator',
    email: 'admin@hospitrack.com',
    role: 'SUPER_ADMIN'
  };
  
  context.window.hospitrackAuth.getCurrentUser = () => adminUser;
  context.window.hospitrackAuth.isAuthenticated = () => true;
  
  const adminSections = ['overview', 'hospitals', 'doctors', 'patients', 'referrals', 'transfers', 'reviews', 'audit', 'profile', 'quality'];
  
  for (const sec of adminSections) {
    console.log(`Testing Super Admin section: ${sec}`);
    context.window.navigateToRoleSection('SUPER_ADMIN', sec, {}, false);
    const mainHtml = mockElements['mainContentArea'].innerHTML;
    console.log(`  -> Rendered length: ${mainHtml.length} chars (First 60: ${mainHtml.substring(0, 60).replace(/\n/g, ' ')})`);
    if (mainHtml.length === 0) {
      console.error(`  [EMPTY HTML] Section ${sec} produced empty HTML!`);
    }
  }
} catch (err) {
  console.error('[CRASH] Super Admin test crashed:', err);
}

// Test Doctor Rendering
console.log('\n--- Testing Doctor Dashboard Rendering ---');
try {
  const doctorUser = {
    id: 'USR-DOC-01',
    name: 'Dr. Sarah Mehta',
    email: 'dr.mehta@carepoint.in',
    role: 'DOCTOR',
    doctorId: 'DOC-201',
    hospitalId: 'HOSP-101'
  };
  
  context.window.hospitrackAuth.getCurrentUser = () => doctorUser;
  context.window.hospitrackAuth.isAuthenticated = () => true;
  context.window.hospitrackStore.lastSync = new Date();
  
  const doctorSections = ['dashboard', 'patients', 'consultations', 'prescriptions', 'laboratory', 'referrals', 'discharge-requests', 'profile'];
  
  (async () => {
    for (const sec of doctorSections) {
      console.log(`Testing Doctor section: ${sec}`);
      await context.window.navigateToRoleSection('DOCTOR', sec, {}, false);
      const mainHtml = mockElements['mainContentArea'].innerHTML;
      console.log(`  -> Rendered length: ${mainHtml.length} chars (First 60: ${mainHtml.substring(0, 60).replace(/\n/g, ' ')})`);
      if (mainHtml.length === 0) {
        console.error(`  [EMPTY HTML] Section ${sec} produced empty HTML!`);
      }
    }
  })();
} catch (err) {
  console.error('[CRASH] Doctor test crashed:', err);
}

// Test Patient Rendering
console.log('\n--- Testing Patient Dashboard Rendering ---');
try {
  const patientUser = {
    id: 'USR-PAT-01',
    name: 'Ramesh Patel',
    email: 'ramesh@example.com',
    role: 'PATIENT',
    patientId: 'PAT-301'
  };
  
  context.window.hospitrackAuth.getCurrentUser = () => patientUser;
  context.window.hospitrackAuth.isAuthenticated = () => true;
  
  const patientSections = ['overview', 'journey', 'consultations', 'prescriptions', 'lab-reports', 'discharge', 'current-hospital', 'reviews', 'profile'];
  
  for (const sec of patientSections) {
    console.log(`Testing Patient section: ${sec}`);
    context.window.navigateToRoleSection('PATIENT', sec, {}, false);
    const mainHtml = mockElements['mainContentArea'].innerHTML;
    console.log(`  -> Rendered length: ${mainHtml.length} chars (First 60: ${mainHtml.substring(0, 60).replace(/\n/g, ' ')})`);
    if (mainHtml.length === 0) {
      console.error(`  [EMPTY HTML] Section ${sec} produced empty HTML!`);
    }
  }
} catch (err) {
  console.error('[CRASH] Patient test crashed:', err);
}
