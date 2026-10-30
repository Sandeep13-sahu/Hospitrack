const fs = require('fs');
const vm = require('vm');
const path = require('path');

console.log('--- TESTING PORTAL-SPECIFIC LOGIN SEGREGATION & SUPER ADMIN ACCESS ---');

const files = [
  'js/config.js',
  'js/authService.js',
  'js/store.js',
  'js/app.js'
];

const dom = {
  elements: {
    loginIdentifier: { value: '', trim: function() { return this.value.trim(); } },
    loginPassword: { value: '' },
    loginRememberMe: { checked: false },
    loginSubmitBtn: { disabled: false },
    loginBtnSpinner: { classList: { add: () => {}, remove: () => {} } },
    loginBtnText: { textContent: '' },
    loginAlertBanner: { className: '', textContent: '', classList: { add: () => {}, remove: () => {} } },
    loginRoleTabPatient: { classList: { add: () => {}, remove: () => {} } },
    loginRoleTabDoctor: { classList: { add: () => {}, remove: () => {} } },
    loginRoleTabHospital: { classList: { add: () => {}, remove: () => {} } },
    landingViewContainer: { classList: { add: () => {}, remove: () => {} } },
    loginViewContainer: { classList: { add: () => {}, remove: () => {} } },
    registerViewContainer: { classList: { add: () => {}, remove: () => {} } },
    authenticatedAppContainer: { classList: { add: () => {}, remove: () => {} } }
  },
  getElementById: function(id) {
    return this.elements[id] || null;
  },
  createElement: () => ({ innerHTML: '', appendChild: () => {}, classList: { add: () => {}, remove: () => {} } }),
  addEventListener: () => {},
  removeEventListener: () => {}
};

const storageMock = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

const sandbox = {
  window: {
    location: { hostname: 'localhost', search: '', pathname: '/', href: 'http://localhost:3000', hash: '' },
    localStorage: storageMock,
    sessionStorage: storageMock,
    addEventListener: () => {},
    removeEventListener: () => {},
    showToast: () => {},
    closeGlobalModal: () => {}
  },
  location: { hostname: 'localhost', search: '', pathname: '/', href: 'http://localhost:3000', hash: '' },
  localStorage: storageMock,
  sessionStorage: storageMock,
  document: dom,
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
  decodeURIComponent: decodeURIComponent,
  fetch: async () => ({ ok: true, json: async () => ({}) })
};
sandbox.window.window = sandbox.window;
sandbox.window.document = dom;

const context = vm.createContext(sandbox);

// Execute files in sandbox
files.forEach(f => {
  const code = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
  vm.runInContext(code, context, { filename: f });
});

// Setup mock auth provider to return specific roles based on identifier
context.window.hospitrackAuth.login = async (identifier, password) => {
  if (identifier.includes('patient')) {
    return { user: { id: 'PAT-301', name: 'John Doe', email: identifier, role: 'PATIENT' } };
  } else if (identifier.includes('doctor')) {
    return { user: { id: 'DOC-201', name: 'Dr. Sarah Sharma', email: identifier, role: 'DOCTOR' } };
  } else if (identifier.includes('hospital')) {
    return { user: { id: 'HOSP-101', name: 'City General Hospital Admin', email: identifier, role: 'HOSPITAL_ADMIN' } };
  } else if (identifier.includes('admin')) {
    return { user: { id: 'ADMIN-01', name: 'Super Admin', email: identifier, role: 'SUPER_ADMIN' } };
  }
  throw new Error('Invalid credentials');
};

context.window.hospitrackStore.syncAllData = async () => {};
context.window.updateHeaderUI = () => {};
context.window.renderDynamicSidebar = () => {};
context.window.renderNotificationsDropdown = () => {};
context.window.navigateToRoleSection = () => {};
context.renderNotificationsDropdown = () => {};
context.updateHeaderUI = () => {};
context.renderDynamicSidebar = () => {};
context.navigateToRoleSection = () => {};

async function testScenario(portal, userIdentifier, expectSuccess, scenarioDescription) {
  dom.elements.loginAlertBanner.textContent = '';
  dom.elements.loginAlertBanner.className = 'alert-banner hidden';
  context.window.selectLoginRole(portal);
  dom.elements.loginIdentifier.value = userIdentifier;
  dom.elements.loginPassword.value = 'ValidPassword123!';

  const fakeEvent = { preventDefault: () => {} };
  await context.window.handleLoginSubmit(fakeEvent);

  const errorMsg = dom.elements.loginAlertBanner.textContent;

  if (expectSuccess) {
    if (!errorMsg) {
      console.log(`✓ PASS: ${scenarioDescription}`);
    } else {
      console.error(`✗ FAIL (Expected success but got error): ${scenarioDescription} -> ${errorMsg}`);
      process.exit(1);
    }
  } else {
    if (errorMsg && errorMsg.includes('Access Denied')) {
      console.log(`✓ PASS: ${scenarioDescription} (Correctly blocked: ${errorMsg})`);
    } else {
      console.error(`✗ FAIL (Expected access denied): ${scenarioDescription} -> Result: ${errorMsg || 'Allowed!'}`);
      process.exit(1);
    }
  }
}

async function runAllTests() {
  console.log('\n--- 1. PATIENT PORTAL TESTS ---');
  await testScenario('PATIENT', 'patient@example.com', true, 'Patient on Patient Portal -> Allowed');
  await testScenario('PATIENT', 'doctor@example.com', false, 'Doctor on Patient Portal -> Denied');
  await testScenario('PATIENT', 'hospital@example.com', false, 'Hospital on Patient Portal -> Denied');
  await testScenario('PATIENT', 'admin@example.com', true, 'Super Admin on Patient Portal -> Allowed');

  console.log('\n--- 2. DOCTOR PORTAL TESTS ---');
  await testScenario('DOCTOR', 'doctor@example.com', true, 'Doctor on Doctor Portal -> Allowed');
  await testScenario('DOCTOR', 'patient@example.com', false, 'Patient on Doctor Portal -> Denied');
  await testScenario('DOCTOR', 'hospital@example.com', false, 'Hospital on Doctor Portal -> Denied');
  await testScenario('DOCTOR', 'admin@example.com', true, 'Super Admin on Doctor Portal -> Allowed');

  console.log('\n--- 3. HOSPITAL PORTAL TESTS ---');
  await testScenario('HOSPITAL', 'hospital@example.com', true, 'Hospital Admin on Hospital Portal -> Allowed');
  await testScenario('HOSPITAL', 'patient@example.com', false, 'Patient on Hospital Portal -> Denied');
  await testScenario('HOSPITAL', 'doctor@example.com', false, 'Doctor on Hospital Portal -> Denied');
  await testScenario('HOSPITAL', 'admin@example.com', true, 'Super Admin on Hospital Portal -> Allowed');

  console.log('\n======================================================');
  console.log('🎉 ALL 12 PORTAL ROLE SEGREGATION TESTS PASSED 100%!');
  console.log('======================================================');
}

runAllTests().catch(err => {
  console.error('Test Suite Error:', err);
  process.exit(1);
});
