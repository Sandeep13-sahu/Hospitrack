const fs = require('fs');
const vm = require('vm');

console.log('--- RUNNING PATIENT PORTAL AUDIT & RESTORATION TEST SUITE ---');

// Mock browser environment
const dom = {};
const mockElements = {};

function createMockElement(id) {
  return {
    id,
    innerHTML: '',
    textContent: '',
    style: {},
    classList: {
      _classes: new Set(),
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      contains(c) { return this._classes.has(c); }
    },
    setAttribute(k, v) { this[k] = v; },
    getAttribute(k) { return this[k]; },
    appendChild() {},
    querySelectorAll() { return []; },
    querySelector() { return null; },
    addEventListener() {},
    reset() {}
  };
}

const mockDoc = {
  getElementById(id) {
    if (!mockElements[id]) mockElements[id] = createMockElement(id);
    return mockElements[id];
  },
  createElement(tag) { return createMockElement(tag); },
  addEventListener() {},
  removeEventListener() {},
  body: {
    appendChild(el) { if (el && el.id) mockElements[el.id] = el; },
    classList: { add() {}, remove() {} }
  }
};

const context = {
  window: {},
  document: mockDoc,
  location: { hostname: 'localhost', href: 'http://localhost:8000', pathname: '/', hash: '' },
  localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
  sessionStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
  console,
  setTimeout,
  clearTimeout,
  URLSearchParams: class { get() { return null; } },
  fetch: async () => ({ ok: true, json: async () => ({ success: true, data: {} }) })
};

context.window = context;
context.window.document = mockDoc;
context.window.location = context.location;
context.window.addEventListener = () => {};
context.window.removeEventListener = () => {};

// Load core scripts
const scripts = [
  'js/config.js',
  'js/authService.js',
  'js/store.js',
  'js/components/auditLogger.js',
  'js/workspaceRenderer.js',
  'js/components/patientDashboard.js',
  'js/components/doctorDashboard.js',
  'js/components/hospitalDashboard.js',
  'js/components/adminDashboard.js',
  'js/components/modalManager.js',
  'js/app.js'
];

for (const s of scripts) {
  const code = fs.readFileSync(s, 'utf8');
  vm.runInNewContext(code, context, { filename: s });
}

// Setup Patient session
const patientUser = {
  id: 'USER-PAT-301',
  name: 'Rajesh Patel',
  email: 'rajesh.patel@email.com',
  role: 'PATIENT',
  patientId: 'PAT-301',
  hospitalId: 'HOSP-101',
  phone: '+91 98765 11111'
};

context.window.hospitrackAuth.getCurrentUser = () => patientUser;
context.window.hospitrackAuth.isAuthenticated = () => true;

(async () => {
  console.log('\n[1] Testing Patient Top Navigation Hierarchy & Grouping...');
  const mainArea = mockDoc.getElementById('mainContentArea');
  await context.window.renderPatientDashboard(mainArea, 'overview');
  
  if (mainArea.innerHTML.includes('Overview') && mainArea.innerHTML.includes('Clinical Records') && mainArea.innerHTML.includes('Connected Care')) {
    console.log('✓ PASS: Grouped top segmented pills rendered successfully');
  } else {
    throw new Error('FAIL: Top segmented pills missing expected categories');
  }

  console.log('\n[2] Testing Sub-navigation on Clinical Group (consultations)...');
  await context.window.renderPatientDashboard(mainArea, 'consultations');
  if (mainArea.innerHTML.includes('Consultations') && mainArea.innerHTML.includes('Prescriptions') && mainArea.innerHTML.includes('Lab Reports')) {
    console.log('✓ PASS: Clinical sub-navigation rendered properly without overflow');
  } else {
    throw new Error('FAIL: Clinical sub-navigation missing');
  }

  console.log('\n[3] Testing Profile View Restrictions...');
  await context.window.renderPatientDashboard(mainArea, 'profile');
  const profileHtml = mainArea.innerHTML;
  if (profileHtml.includes('Edit Profile & Photo') || profileHtml.includes('Edit Profile &amp; Photo')) {
    throw new Error('SECURITY VIOLATION: Unauthorized "Edit Profile & Photo" button detected in Patient Profile!');
  }
  console.log('✓ PASS: "Edit Profile & Photo" button is completely removed for Patient');

  if (profileHtml.includes('Contact Hospital') && profileHtml.includes('Hospital Verified Profile')) {
    console.log('✓ PASS: Institutional governance and Contact Hospital action present');
  } else {
    throw new Error('FAIL: Expected Contact Hospital action not found in Profile view');
  }

  console.log('\n[4] Testing Account Profile Modal for Patient...');
  const userModal = mockDoc.getElementById('userProfileModal');
  const userModalContent = mockDoc.getElementById('userProfileModalContent');
  context.window.openUserProfileModal(true); // Attempt to open edit mode
  
  const modalHtml = userModalContent.innerHTML;
  if (modalHtml.includes('modalProfileFileInput') || modalHtml.includes('Browse Image') || modalHtml.includes('handleModalPhotoRemove')) {
    throw new Error('SECURITY VIOLATION: Photo upload controls accessible in Patient userProfileModal!');
  }
  console.log('✓ PASS: Patient cannot access photo upload controls in userProfileModal');

  const modalTitle = mockDoc.getElementById('userProfileModalTitle');
  if (modalTitle.textContent.includes('Patient Account Details') && modalHtml.includes('Contact Hospital')) {
    console.log('✓ PASS: Patient userProfileModal shows read-only account details and Contact Hospital');
  } else {
    throw new Error('FAIL: userProfileModal missing expected Patient read-only content: ' + modalHtml);
  }

  console.log('\n[5] Testing Header Dropdown Profile Item Segregation...');
  const editProfileItem = mockDoc.getElementById('headerDropdownEditProfileItem');
  context.window.updateHeaderUI(patientUser, 'PATIENT');
  if (editProfileItem.style.display === 'none') {
    console.log('✓ PASS: "Edit Profile" dropdown item is hidden for PATIENT role');
  } else {
    throw new Error('FAIL: "Edit Profile" dropdown item visible for Patient');
  }

  console.log('\n[6] Testing Settings View Credential Governance...');
  await context.window.renderPatientDashboard(mainArea, 'settings');
  const settingsHtml = mainArea.innerHTML;
  if (settingsHtml.includes('Institutional Credential Governance') && settingsHtml.includes('Admitting Facility Managed')) {
    console.log('✓ PASS: Patient Settings view displays institutional governance notice');
  } else {
    throw new Error('FAIL: Patient Settings view missing institutional governance');
  }

  console.log('\n[7] Testing Document Printing Handlers for Patient...');
  let printCalled = false;
  context.window.print = () => { printCalled = true; };
  context.window.printPatientSummary('PAT-301');
  await new Promise(r => setTimeout(r, 200));
  if (printCalled) {
    console.log('✓ PASS: printPatientSummary executes window.print cleanly');
  } else {
    throw new Error('FAIL: printPatientSummary failed to invoke window.print');
  }

  console.log('\n======================================================');
  console.log('🎉 ALL 7 PATIENT PORTAL FRONTEND AUDIT TESTS PASSED 100%!');
  console.log('======================================================\n');
})();
