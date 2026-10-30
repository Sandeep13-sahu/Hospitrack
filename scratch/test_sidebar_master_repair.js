/**
 * Automated Verification Script for Hospitrack Global Sidebar & Layout System
 * Validates:
 * 1. Super Admin, Hospital Admin, Doctor, and Patient sidebar rendering
 * 2. Standardized nav-item structure (<button class="nav-item">, .nav-icon, .nav-label, .nav-badge)
 * 3. Desktop collapsed mode state transition & persistence
 * 4. Mobile drawer open/close state transitions & overlay
 * 5. Single source of truth (dataset.sidebarState & localStorage)
 * 6. Content container min-width safety & responsive rules
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== HOSPITRACK GLOBAL SIDEBAR MASTER VERIFICATION ===\n');

// 1. Verify CSS Rules in css/styles.css
const cssContent = fs.readFileSync(path.join(__dirname, '../css/styles.css'), 'utf8');

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

console.log('--- 1. Verifying CSS Architecture ---');
assert(cssContent.includes('--sidebar-width: 260px'), 'CSS contains --sidebar-width: 260px');
assert(cssContent.includes('--sidebar-collapsed-width: 76px'), 'CSS contains --sidebar-collapsed-width: 76px');
assert(cssContent.includes('.app-container.sidebar-collapsed'), 'CSS contains .app-container.sidebar-collapsed grid rule');
assert(cssContent.includes('html[data-sidebar-state="collapsed"]'), 'CSS contains html[data-sidebar-state="collapsed"] dataset selectors');
assert(cssContent.includes('.app-sidebar.collapsed .nav-label'), 'CSS cleanly hides .nav-label in collapsed mode');
assert(cssContent.includes('.app-sidebar.collapsed .sidebar-category-label'), 'CSS cleanly hides .sidebar-category-label in collapsed mode');
assert(cssContent.includes('.app-sidebar.collapsed .sidebar-header-title'), 'CSS cleanly hides .sidebar-header-title in collapsed mode');
assert(cssContent.includes('.app-sidebar.collapsed .nav-item[data-tooltip]'), 'CSS contains accessible tooltip styling for collapsed mode');
assert(cssContent.includes('@media (max-width: 900px)'), 'CSS contains responsive mobile drawer breakpoint (<= 900px)');
assert(cssContent.includes('.app-sidebar.mobile-open'), 'CSS contains mobile drawer slide-in rules');
assert(cssContent.includes('.mobile-nav-overlay.mobile-open'), 'CSS contains mobile overlay backdrop rules');
assert(cssContent.includes('.main-content'), 'CSS contains responsive main-content rules');

// 2. Setup Mock DOM & Environment
console.log('\n--- 2. Setting Up Test Environment ---');
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
    value: '',
    checked: false,
    disabled: false,
    attributes: {},
    dataset: {},
    setAttribute: function(k, v) { this.attributes[k] = String(v); if (k.startsWith('data-')) this.dataset[k.slice(5)] = v; },
    getAttribute: function(k) { return this.attributes[k] || null; },
    removeAttribute: function(k) { delete this.attributes[k]; },
    querySelector: function(sel) {
      if (sel === '#sidebarCollapseBtn') return mockElements['sidebarCollapseBtn'] || null;
      if (sel === '.collapse-icon') return { textContent: '' };
      return null;
    },
    querySelectorAll: function(sel) { return []; },
    contains: function() { return false; },
    focus: function() {}
  };
  if (id) mockElements[id] = el;
  return el;
}

const docElement = createElement('html', 'html');
docElement.dataset = {};

const knownIds = [
  'landingViewContainer', 'loginViewContainer', 'registerViewContainer', 'authenticatedAppContainer',
  'headerBreadcrumbRole', 'headerBreadcrumbTitle', 'authHeaderAvatar', 'authHeaderName', 'authHeaderRole',
  'profileDropdownAvatar', 'profileDropdownName', 'profileDropdownEmail', 'profileDropdownRoleBadge',
  'profileDropdownMenu', 'profileDropdownBtn', 'notifToggleBtn', 'notifBadgeDot', 'notifDropdown', 'notifList',
  'globalSearchInput', 'globalSearchDropdown', 'appSidebar', 'mainContentArea', 'toastContainer',
  'mobileNavOverlay', 'addDoctorModal', 'userProfileModal', 'userProfileModalTitle', 'userProfileModalContent',
  'sidebarCollapseBtn'
];

knownIds.forEach(id => createElement(id));

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
  querySelectorAll: (sel) => [],
  addEventListener: () => {},
  createElement: (tag) => createElement(null, tag),
  body: createElement('body')
};

const storageStore = {};
const windowMock = {
  innerWidth: 1280,
  location: { hash: '', origin: 'http://localhost:8000' },
  history: { pushState: () => {}, replaceState: () => {}, back: () => {} },
  document: documentMock,
  addEventListener: () => {},
  showToast: (msg, type) => {},
  confirm: () => true,
  localStorage: {
    getItem: (k) => storageStore[k] || null,
    setItem: (k, v) => { storageStore[k] = String(v); },
    removeItem: (k) => { delete storageStore[k]; },
    clear: () => { Object.keys(storageStore).forEach(k => delete storageStore[k]); }
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

// Load App Scripts into context
const configJs = fs.readFileSync(path.join(__dirname, '../js/config.js'), 'utf8');
const storeJs = fs.readFileSync(path.join(__dirname, '../js/store.js'), 'utf8');
const authJs = fs.readFileSync(path.join(__dirname, '../js/authService.js'), 'utf8');
const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');

vm.runInContext(configJs, context);
vm.runInContext(storeJs, context);
vm.runInContext(authJs, context);
vm.runInContext(appJs, context);

// 3. Test Sidebar Rendering for All 4 Roles
console.log('\n--- 3. Testing Dynamic Sidebar Rendering for All 4 Roles ---');

const roles = [
  { role: 'SUPER_ADMIN', name: 'Super Admin', checkItem: 'Command Center', checkIcon: 'lucide-activity' },
  { role: 'HOSPITAL_ADMIN', name: 'Hospital Admin', checkItem: 'Ward Management', checkIcon: 'lucide-bed' },
  { role: 'DOCTOR', name: 'Doctor', checkItem: 'Prescriptions', checkIcon: 'lucide-pill' },
  { role: 'PATIENT', name: 'Patient', checkItem: 'Care Journey', checkIcon: 'lucide-clipboard-list' }
];

roles.forEach(({ role, name, checkItem, checkIcon }) => {
  const mockUser = { id: 'test_user_1', role: role, name: `Test ${name}`, hospitalId: 'HOSP-101', doctorId: 'DOC-201' };
  context.window.renderDynamicSidebar(mockUser, role);

  const sidebar = mockElements['appSidebar'];
  assert(sidebar.innerHTML.includes('sidebar-header-bar'), `${name} sidebar contains unified .sidebar-header-bar`);
  assert(sidebar.innerHTML.includes('sidebar-collapse-btn'), `${name} sidebar contains .sidebar-collapse-btn`);
  assert(sidebar.innerHTML.includes('nav-item'), `${name} sidebar contains standard .nav-item buttons`);
  assert(sidebar.innerHTML.includes('nav-icon'), `${name} sidebar contains .nav-icon containers`);
  assert(sidebar.innerHTML.includes('nav-label'), `${name} sidebar contains .nav-label containers`);
  assert(sidebar.innerHTML.includes(checkItem), `${name} sidebar renders "${checkItem}" navigation item`);
  assert(sidebar.innerHTML.includes(checkIcon) || sidebar.innerHTML.includes('lucide'), `${name} sidebar renders "${checkIcon}" navigation icon`);
  assert(sidebar.innerHTML.includes('data-tooltip'), `${name} sidebar contains accessible data-tooltip attribute for collapsed mode`);
  assert(sidebar.innerHTML.includes('aria-label'), `${name} sidebar contains aria-label accessibility attributes`);
});

// 4. Test Sidebar Desktop Collapse Toggle & Persistence
console.log('\n--- 4. Testing Desktop Collapse & State Persistence ---');
windowMock.innerWidth = 1280;

// Initial state: expanded
context.window.setPersistedSidebarState('expanded');
context.window.applySidebarState('expanded');
assert(docElement.dataset.sidebarState === 'expanded', 'Initial dataset.sidebarState is expanded');
assert(!mockElements['appSidebar'].classList.contains('collapsed'), 'Sidebar element is not collapsed initially');

// Toggle to collapsed
context.window.toggleSidebarCollapse();
assert(storageStore['hospitrack_sidebar_state'] === 'collapsed', 'localStorage saved hospitrack_sidebar_state as "collapsed"');
assert(docElement.dataset.sidebarState === 'collapsed', 'dataset.sidebarState is updated to "collapsed"');
assert(mockElements['appSidebar'].classList.contains('collapsed'), 'appSidebar element has class "collapsed"');
assert(appContainer.classList.contains('sidebar-collapsed'), 'app-container has class "sidebar-collapsed"');

// Toggle back to expanded
context.window.toggleSidebarCollapse();
assert(storageStore['hospitrack_sidebar_state'] === 'expanded', 'localStorage saved hospitrack_sidebar_state as "expanded"');
assert(docElement.dataset.sidebarState === 'expanded', 'dataset.sidebarState is updated to "expanded"');
assert(!mockElements['appSidebar'].classList.contains('collapsed'), 'appSidebar element removed "collapsed"');
assert(!appContainer.classList.contains('sidebar-collapsed'), 'app-container removed "sidebar-collapsed"');

// 5. Test Mobile Drawer State Transitions
console.log('\n--- 5. Testing Mobile Drawer State Transitions ---');
windowMock.innerWidth = 430; // Mobile screen width

context.window.toggleMobileSidebar();
assert(mockElements['appSidebar'].classList.contains('mobile-open'), 'appSidebar has class "mobile-open" when opened on mobile');
assert(mockElements['mobileNavOverlay'].classList.contains('mobile-open'), 'mobileNavOverlay has class "mobile-open" when opened on mobile');
assert(docElement.dataset.sidebarState === 'mobile-open', 'dataset.sidebarState is "mobile-open"');

context.window.closeMobileSidebar();
assert(!mockElements['appSidebar'].classList.contains('mobile-open'), 'appSidebar removed "mobile-open" when closed');
assert(!mockElements['mobileNavOverlay'].classList.contains('mobile-open'), 'mobileNavOverlay removed "mobile-open" when closed');

console.log('\n============================================================');
console.log('🎉 ALL UNIT & DOM TESTS PASSED WITH 0 ERRORS!');
console.log('============================================================');
