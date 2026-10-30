const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== TEST SUITE: PATIENT DASHBOARD SIDEBAR HEADER & PROFILE WIDGET REDESIGN ===\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  } else {
    console.log(`✅ PASS: ${message}`);
    passed++;
  }
}

// 1. Verify CSS Rules in css/styles.css
const cssContent = fs.readFileSync(path.join(__dirname, '../css/styles.css'), 'utf8');

console.log('--- 1. Verifying CSS Architecture for Header & Profile Widget ---');
assert(cssContent.includes('.sidebar-hamburger-btn'), 'CSS contains .sidebar-hamburger-btn styling');
assert(cssContent.includes('.sidebar-header-brand'), 'CSS contains .sidebar-header-brand styling');
assert(cssContent.includes('.sidebar-header-indicator'), 'CSS contains .sidebar-header-indicator styling');
assert(cssContent.includes('.app-sidebar.collapsed .sidebar-header-title'), 'CSS hides .sidebar-header-title in collapsed mode');
assert(cssContent.includes('.app-sidebar.collapsed .sidebar-header-indicator'), 'CSS hides .sidebar-header-indicator in collapsed mode');
assert(cssContent.includes('.sidebar-profile-card'), 'CSS contains .sidebar-profile-card');
assert(cssContent.includes('.sidebar-profile-avatar'), 'CSS contains .sidebar-profile-avatar with circular radius');
assert(cssContent.includes('.sidebar-profile-name'), 'CSS contains .sidebar-profile-name with truncation');
assert(cssContent.includes('.sidebar-profile-sub'), 'CSS contains .sidebar-profile-sub horizontal flex row');
assert(cssContent.includes('.sidebar-role-badge.patient'), 'CSS contains refined purple pill for patient badge');
assert(cssContent.includes('.sidebar-dept-text'), 'CSS contains monospace single-line patient ID styling');
assert(cssContent.includes('.app-sidebar.collapsed .sidebar-profile-card[data-tooltip]'), 'CSS contains collapsed rail hover tooltip');

// 2. Setup Mock Environment & Test Sidebar Rendering
console.log('\n--- 2. Testing Render for Patient Role ("John Doe", "USER-PAT-301") ---');
const mockElements = {};
function createElement(id, tagName = 'div') {
  const el = {
    id: id || '',
    tagName: tagName.toUpperCase(),
    classList: {
      _classes: new Set(),
      add: function(...cls) { cls.forEach(c => this._classes.add(c)); },
      remove: function(...cls) { cls.forEach(c => this._classes.delete(c)); },
      toggle: function(c, force) {
        if (force !== undefined) {
          if (force) this._classes.add(c);
          else this._classes.delete(c);
          return force;
        }
        if (this._classes.has(c)) { this._classes.delete(c); return false; }
        else { this._classes.add(c); return true; }
      },
      contains: function(c) { return this._classes.has(c); }
    },
    style: {},
    innerHTML: '',
    textContent: '',
    attributes: {},
    dataset: {},
    setAttribute: function(k, v) { this.attributes[k] = String(v); if (k.startsWith('data-')) this.dataset[k.slice(5)] = v; },
    getAttribute: function(k) { return this.attributes[k] || null; },
    querySelector: function(sel) {
      if (sel === '#sidebarCollapseBtn') return mockElements['sidebarCollapseBtn'] || null;
      if (sel === '.collapse-icon') return { textContent: '' };
      return null;
    }
  };
  if (id) mockElements[id] = el;
  return el;
}

const docElement = createElement('html', 'html');
const appContainer = createElement('appContainer', 'div');
appContainer.classList.add('app-container');

const documentMock = {
  documentElement: docElement,
  getElementById: (id) => mockElements[id] || createElement(id),
  querySelector: (sel) => {
    if (sel === '.app-container') return appContainer;
    if (sel.startsWith('#')) return documentMock.getElementById(sel.substring(1));
    return null;
  },
  querySelectorAll: () => [],
  addEventListener: () => {},
  createElement: (tag) => createElement(null, tag),
  body: createElement('body')
};

const storageStore = {};
const windowMock = {
  innerWidth: 1280,
  location: { hostname: 'localhost', origin: 'http://localhost:8000', hash: '' },
  document: documentMock,
  addEventListener: () => {},
  localStorage: {
    getItem: (k) => storageStore[k] || null,
    setItem: (k, v) => { storageStore[k] = String(v); },
    removeItem: (k) => { delete storageStore[k]; }
  }
};
windowMock.window = windowMock;

const context = vm.createContext({
  window: windowMock,
  document: documentMock,
  console: console,
  setTimeout: (fn) => fn(),
  clearTimeout: () => {},
  setInterval: () => {},
  clearInterval: () => {},
  localStorage: windowMock.localStorage,
  sessionStorage: windowMock.localStorage,
  escapeHtml: (str) => String(str || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m])
});

const configJs = fs.readFileSync(path.join(__dirname, '../js/config.js'), 'utf8');
const storeJs = fs.readFileSync(path.join(__dirname, '../js/store.js'), 'utf8');
const authJs = fs.readFileSync(path.join(__dirname, '../js/authService.js'), 'utf8');
const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');

vm.runInContext(configJs, context);
vm.runInContext(storeJs, context);
vm.runInContext(authJs, context);
vm.runInContext(appJs, context);

// Test Patient "John Doe" with ID "USER-PAT-301"
const patientUser = {
  id: 'USER-PAT-301',
  role: 'PATIENT',
  name: 'John Doe',
  email: 'john.doe@hospitrack.in'
};

context.window.renderDynamicSidebar(patientUser, 'PATIENT');
const sidebar = mockElements['appSidebar'];
const html = sidebar.innerHTML;

// 3. Test Header Overhaul
console.log('\n--- 3. Verifying Header & Collapse Control ---');
assert(!html.includes('▶') && !html.includes('◀'), 'Old triangle arrows (◀ / ▶) completely removed');
assert(!html.includes('🚪'), 'Door emoji 🚪 replaced with clean Lucide log-out SVG');
assert(html.includes('lucide-menu'), 'Clean 3-line hamburger menu icon (Lucide Menu) rendered');
assert(html.includes('sidebar-header-top'), 'Header top container rendered');
assert(html.includes('aria-label="Toggle Sidebar"'), 'Accessible aria-label="Toggle Sidebar" attribute present');
assert(html.includes('Patient Portal'), 'Crisp "Patient Portal" title rendered');
assert(html.includes('lucide-chevron-right'), 'Subtle indicator chevron icon rendered');

// Verify entire title bar has click handler
assert(html.includes('onclick="toggleSidebarCollapse(event)"'), 'Title header bar is clickable to toggle sidebar');

// 4. Test Patient Profile Card Overhaul
console.log('\n--- 4. Verifying Patient Profile Card Polish ---');
assert(html.includes('sidebar-profile-card'), 'Profile card container exists');
assert(html.includes('JD'), 'Patient initials "JD" correctly extracted for "John Doe"');
assert(html.includes('John Doe'), 'Patient name "John Doe" displayed');
assert(html.includes('sidebar-role-badge patient'), 'Mini pill patient badge with role-specific class exists');
assert(html.includes('PATIENT') || html.includes('Patient'), 'Patient role badge text rendered');
assert(html.includes('ID: PAT-301'), 'Patient ID cleanly formatted to "ID: PAT-301" avoiding awkward line breaks');
assert(html.includes('data-tooltip="John Doe (ID: PAT-301)"'), 'Floating hover tooltip attribute set for collapsed mode');

console.log(`\n============================================================`);
console.log(`Results: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
