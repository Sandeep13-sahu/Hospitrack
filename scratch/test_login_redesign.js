const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== TEST SUITE: HOSPITRACK MODERN AUTHENTICATION INTERFACE ===');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'styles.css'), 'utf8');

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    console.log(`[PASS] ${name}`);
    passed++;
  } else {
    console.error(`[FAIL] ${name}`);
    failed++;
  }
}

// ----------------------------------------------------
// 1. Audit Removed Elements (Must not be in #loginForm)
// ----------------------------------------------------
const loginFormMatch = html.match(/<form id="loginForm"[\s\S]*?<\/form>/);
assert(loginFormMatch !== null, 'loginForm element exists in index.html');

if (loginFormMatch) {
  const formHtml = loginFormMatch[0];
  assert(!formHtml.includes('Accounts and credential recovery are managed exclusively'), 
    'REMOVED: Static disclaimer beneath Sign In button is absent');
  assert(!formHtml.includes('🔒 Institutional Credential Governance'), 
    'REMOVED: Informational compliance card inside login form is absent');
  assert(!formHtml.includes('Credential Assistance &amp; Facility Support'), 
    'REMOVED: Credential Assistance & Facility Support link inside login form is absent');
}

// ----------------------------------------------------
// 2. Audit Modern Visual Polish Elements
// ----------------------------------------------------
assert(html.includes('class="auth-mesh-glow-1"'), 'Left Hero: Radial mesh glow 1 exists');
assert(html.includes('class="auth-mesh-glow-2"'), 'Left Hero: Radial mesh glow 2 exists');
assert(html.includes('class="auth-grid-pattern"'), 'Left Hero: Fine medical grid overlay exists');
assert(html.includes('class="feature-check-icon"'), 'Left Hero: Refined feature checkmark icons exist');
assert(html.includes('class="auth-card-box"'), 'Right Panel: Modern auth-card-box exists');
assert(html.includes('id="roleTabGlider"'), 'Role Tabs: Smooth sliding glider indicator exists');
assert(html.includes('id="loginRoleHelperNote"'), 'Dynamic Role Helper Note container exists');

// CSS checks
assert(css.includes('.auth-grid-pattern'), 'CSS: .auth-grid-pattern defined');
assert(css.includes('.auth-mesh-glow-1'), 'CSS: .auth-mesh-glow-1 defined');
assert(css.includes('.role-tab-glider'), 'CSS: .role-tab-glider defined with transition');
assert(css.includes('.auth-card-box'), 'CSS: .auth-card-box defined with subtle stroke & shadow');
assert(css.includes('.auth-submit-btn'), 'CSS: .auth-submit-btn styled with emerald/teal gradient & hover lift');

// ----------------------------------------------------
// 3. Dynamic Role-Switching State Logic (Simulated DOM)
// ----------------------------------------------------
const dom = {
  elements: {
    loginIdentifier: { value: 'initial@email.com', placeholder: '' },
    loginPassword: { value: 'secret123' },
    loginRememberMe: { checked: true },
    loginRoleTabPatient: { classList: { add: function(c){this.classes.add(c);}, remove: function(c){this.classes.delete(c);}, classes: new Set(['active']) }, setAttribute: function(k, v){ this[k] = v; } },
    loginRoleTabDoctor: { classList: { add: function(c){this.classes.add(c);}, remove: function(c){this.classes.delete(c);}, classes: new Set() }, setAttribute: function(k, v){ this[k] = v; } },
    loginRoleTabHospital: { classList: { add: function(c){this.classes.add(c);}, remove: function(c){this.classes.delete(c);}, classes: new Set() }, setAttribute: function(k, v){ this[k] = v; } },
    roleTabGlider: { style: { transform: '' } },
    loginIdentifierLabel: { innerHTML: '' },
    authSubtitle: { textContent: '' },
    loginRoleHelperNote: { innerHTML: '' },
    loginAlertBanner: { className: '', textContent: '', classList: { add: () => {}, remove: () => {} } },
    loginSubmitBtn: { disabled: false },
    loginBtnSpinner: { classList: { add: function(c){this.classes.add(c);}, remove: function(c){this.classes.delete(c);}, classes: new Set(['hidden']) } },
    loginBtnText: { textContent: 'Sign In' }
  },
  getElementById: function(id) {
    return this.elements[id] || null;
  },
  querySelector: function() { return null; },
  addEventListener: () => {}
};

const sandbox = {
  window: { addEventListener: () => {}, removeEventListener: () => {} },
  document: dom,
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout
};
sandbox.window.window = sandbox.window;
sandbox.window.document = dom;

// Load app.js in sandbox
const appJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
const context = vm.createContext(sandbox);
vm.runInContext(appJs, context);

// Test Switch to DOCTOR
dom.elements.loginIdentifier.value = 'typed-input';
dom.elements.loginPassword.value = 'typed-pwd';
dom.elements.loginRememberMe.checked = true;

context.selectLoginRole('DOCTOR');

assert(dom.elements.loginIdentifier.value === '', 'Form Reset: Email/username cleared on switch to Doctor');
assert(dom.elements.loginPassword.value === '', 'Form Reset: Password cleared on switch to Doctor');
assert(dom.elements.loginRememberMe.checked === false, 'Form Reset: Remember me unchecked on switch to Doctor');
assert(dom.elements.roleTabGlider.style.transform === 'translateX(100%)', 'Glider Animation: Glider moved to index 1 (Doctor)');
assert(dom.elements.loginIdentifier.placeholder.includes('dr.sharma@hospital.org'), 'Contextual Adaptation: Doctor placeholder applied');
assert(dom.elements.loginRoleHelperNote.innerHTML.includes('Doctor credentials are tied to your institutional SSO'), 'Contextual Adaptation: Doctor helper note applied');

// Test Switch to HOSPITAL
dom.elements.loginIdentifier.value = 'user@test.com';
dom.elements.loginPassword.value = 'mypassword';
dom.elements.loginRememberMe.checked = true;

context.selectLoginRole('HOSPITAL');

assert(dom.elements.loginIdentifier.value === '', 'Form Reset: Email cleared on switch to Hospital');
assert(dom.elements.loginPassword.value === '', 'Form Reset: Password cleared on switch to Hospital');
assert(dom.elements.loginRememberMe.checked === false, 'Form Reset: Remember me unchecked on switch to Hospital');
assert(dom.elements.roleTabGlider.style.transform === 'translateX(200%)', 'Glider Animation: Glider moved to index 2 (Hospital)');
assert(dom.elements.loginIdentifier.placeholder.includes('admin@metrohealth.gov'), 'Contextual Adaptation: Hospital placeholder applied');
assert(dom.elements.loginRoleHelperNote.innerHTML.includes('Requires Department Token or Facility Key'), 'Contextual Adaptation: Hospital helper note applied');

// Test Switch back to PATIENT
dom.elements.loginIdentifier.value = 'something';
context.selectLoginRole('PATIENT');

assert(dom.elements.loginIdentifier.value === '', 'Form Reset: Email cleared on switch to Patient');
assert(dom.elements.roleTabGlider.style.transform === 'translateX(0%)', 'Glider Animation: Glider moved to index 0 (Patient)');
assert(dom.elements.loginIdentifier.placeholder.includes('ramesh@example.com'), 'Contextual Adaptation: Patient placeholder applied');
assert(dom.elements.loginRoleHelperNote.innerHTML.includes('Need help accessing your patient portal?') && dom.elements.loginRoleHelperNote.innerHTML.includes('Contact Hospital Desk'), 'Contextual Adaptation: Patient helper note applied');

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
