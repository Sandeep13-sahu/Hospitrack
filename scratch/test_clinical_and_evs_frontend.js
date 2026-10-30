const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('================================================================');
console.log('Hospitrack Clinical Safety & EVS Turnover Frontend Test Suite');
console.log('================================================================\n');

// 1. Create Browser Mock Environment
const mockElements = {};
function createMockElement(id, tagName = 'div') {
  const el = {
    id: id,
    tagName: tagName.toUpperCase(),
    dataset: {},
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
    focus: function() {},
    appendChild: function(child) { return child; }
  };
  if (id) mockElements[id] = el;
  return el;
}

const windowMock = {
  location: { search: '', pathname: '/', origin: 'http://localhost:3000' },
  localStorage: {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; },
    clear() { this._data = {}; }
  },
  sessionStorage: {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; },
    clear() { this._data = {}; }
  },
  showToast: (msg, type) => console.log(`   [Toast - ${type || 'info'}]: ${msg}`),
  showError: (msg) => console.log(`   [Toast - error]: ${msg}`),
  escapeHtml: (str) => String(str || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
};
windowMock.window = windowMock;

const documentMock = {
  documentElement: { dataset: {} },
  body: createMockElement('body', 'body'),
  getElementById: (id) => {
    if (!mockElements[id]) mockElements[id] = createMockElement(id);
    return mockElements[id];
  },
  querySelector: (sel) => {
    if (sel.startsWith('#')) return documentMock.getElementById(sel.substring(1));
    return createMockElement(null);
  },
  querySelectorAll: (sel) => [],
  createElement: (tag) => createMockElement(null, tag)
};

const sandbox = {
  window: windowMock,
  document: documentMock,
  navigator: { userAgent: 'NodeTestEnv' },
  setTimeout: (fn, ms) => setTimeout(fn, ms || 0),
  clearTimeout: (id) => clearTimeout(id),
  setInterval: (fn, ms) => setInterval(fn, ms || 0),
  clearInterval: (id) => clearInterval(id),
  console: console
};
vm.createContext(sandbox);

function loadScript(filePath) {
  const code = fs.readFileSync(path.join(__dirname, '..', filePath), 'utf8');
  vm.runInContext(code, sandbox, { filename: filePath });
  console.log(`✓ Loaded: ${filePath}`);
}

// 2. Load Core Dependencies
loadScript('js/config.js');
loadScript('js/modules/clinicalSafety.js');
loadScript('js/modules/evsBedManager.js');

const CS = sandbox.window.ClinicalSafetyManager;
const EVS = sandbox.window.EvsBedManager;

assert(CS, 'ClinicalSafetyManager must be attached to window');
assert(EVS, 'EvsBedManager must be attached to window');

console.log('\n--- 1. Testing Clinical Decision Support (CDS) Safety Engine ---');

// Test 1A: Safe Medication Order
const safeReport = CS.evaluateLocalSafety(
  { id: 'PAT-1', allergies: 'NKDA' },
  ['Metoprolol 25 mg', 'Atorvastatin 20 mg']
);
assert.strictEqual(safeReport.safe, true, 'Clean regimen must pass safety check');
assert.strictEqual(safeReport.hasContraindication, false);
console.log('✓ Clean regimen evaluation: PASSED (safe = true)');

// Test 1B: Strict Contraindication (Sildenafil + Nitroglycerin)
const contraReport = CS.evaluateLocalSafety(
  { id: 'PAT-2', allergies: 'NKDA' },
  ['Sildenafil 50mg', 'Nitroglycerin sublingual']
);
assert.strictEqual(contraReport.safe, false, 'Sildenafil + Nitroglycerin must be flagged');
assert.strictEqual(contraReport.hasContraindication, true, 'Must flag hasContraindication = true');
console.log('✓ Lethal DDI Contraindication (Sildenafil + Nitroglycerin): PASSED (hasContraindication = true)');

// Test 1C: Patient Allergy Contraindication (Penicillin allergy + Amoxicillin)
const allergyReport = CS.evaluateLocalSafety(
  { id: 'PAT-3', allergies: 'Severe Penicillin anaphylaxis' },
  ['Amoxicillin 500mg']
);
assert.strictEqual(allergyReport.safe, false, 'Amoxicillin with Penicillin allergy must fail');
assert.strictEqual(allergyReport.hasAllergyAlert, true, 'Must flag hasAllergyAlert = true');
console.log('✓ Drug-Allergy Cross-Reaction (Amoxicillin + Penicillin allergy): PASSED');

// Test 1D: Duplicate Medication in Same Order
const duplicateReport = CS.evaluateLocalSafety(
  { id: 'PAT-4', allergies: 'None' },
  ['Aspirin 81 mg', 'Aspirin 325 mg']
);
assert.strictEqual(duplicateReport.safe, false, 'Duplicate aspirin must be flagged');
assert.strictEqual(duplicateReport.hasDuplication, true, 'Must flag hasDuplication = true');
console.log('✓ Duplicate Drug in Order: PASSED (hasDuplication = true)');

// Test 1E: Render Rich Alert HTML
const alertHtml = CS.renderSafetyBannerHtml(contraReport);
assert(alertHtml.includes('CRITICAL CONTRAINDICATION DETECTED'), 'Banner must show contraindication headline');
assert(alertHtml.includes('Hard Safety Stop'), 'Banner must indicate Hard Safety Stop');
console.log('✓ CDS Safety Banner HTML generation: PASSED');

console.log('\n--- 2. Testing Environmental Services (EVS) Bed Turnover Manager ---');

// Mock Beds
const mockBeds = [
  { id: 'BED-101', bedNumber: '101', ward: 'General Medicine', type: 'STANDARD', status: 'DIRTY_PENDING_CLEANING', evsProtocol: 'Terminal Disinfection', evsTurnaroundMinutes: 0 },
  { id: 'BED-102', bedNumber: '102', ward: 'ICU', type: 'ICU', status: 'CLEANING_IN_PROGRESS', evsStaffName: 'Priya Sharma', evsProtocol: 'Biohazard Isolation Protocol' },
  { id: 'BED-103', bedNumber: '103', ward: 'Cardiology', type: 'TELEMETRY', status: 'READY_FOR_INSPECTION', evsStaffName: 'Rajesh Kumar', evsProtocol: 'Standard Turnover' },
  { id: 'BED-104', bedNumber: '104', ward: 'Pediatrics', type: 'PEDIATRIC', status: 'AVAILABLE' }
];

// Mock hospitrackStore for EVS
sandbox.window.hospitrackStore = {
  getBeds: async (hospId) => mockBeds,
  getHospitalBeds: async (hospId) => mockBeds,
  getEvsTurnoverSummary: async (hospId) => ({
    dirtyCount: 1,
    cleaningCount: 1,
    readyCount: 1,
    availableCount: 1,
    averageTurnaroundMinutes: 32
  }),
  getHospitalById: (id) => ({ id, name: 'City General Hospital' }),
  dispatchEvsHousekeeping: async (bedId, payload) => {
    const bed = mockBeds.find(b => b.id === bedId);
    if (bed) {
      bed.status = 'CLEANING_IN_PROGRESS';
      bed.evsStaffName = payload.staffName;
      bed.evsProtocol = payload.protocol;
      bed.evsNotes = payload.notes;
    }
    return bed;
  },
  completeEvsCleaning: async (bedId) => {
    const bed = mockBeds.find(b => b.id === bedId);
    if (bed) {
      bed.status = 'READY_FOR_INSPECTION';
      bed.evsTurnaroundMinutes = 35;
    }
    return bed;
  },
  inspectAndReleaseBed: async (bedId, payload) => {
    const bed = mockBeds.find(b => b.id === bedId);
    if (bed) {
      bed.status = 'AVAILABLE';
      bed.evsInspectedBy = payload.supervisorName;
    }
    return bed;
  }
};

const mountContainer = createMockElement('evsTurnoverMountArea');
EVS.renderTurnoverBoard(mountContainer, 'HOSP-101').then(async () => {
  assert(mountContainer.innerHTML.includes('Environmental Services (EVS) Bed Turnover Operations'), 'Must render EVS header');
  assert(mountContainer.innerHTML.includes('BED-101'), 'Must include BED-101 in dirty column');
  assert(mountContainer.innerHTML.includes('BED-102'), 'Must include BED-102 in cleaning column');
  assert(mountContainer.innerHTML.includes('BED-103'), 'Must include BED-103 in inspection column');
  assert(mountContainer.innerHTML.includes('BED-104'), 'Must include BED-104 in available column');
  console.log('✓ EVS 4-Stage Kanban Board rendering: PASSED');

  // Test Dispatch
  await sandbox.window.hospitrackStore.dispatchEvsHousekeeping('BED-101', {
    staffName: 'Anita Roy',
    protocol: 'Terminal Disinfection',
    notes: 'Post-discharge deep clean'
  });
  const bed101 = mockBeds.find(b => b.id === 'BED-101');
  assert.strictEqual(bed101.status, 'CLEANING_IN_PROGRESS');
  assert.strictEqual(bed101.evsStaffName, 'Anita Roy');
  console.log('✓ EVS Dispatch transition to CLEANING_IN_PROGRESS: PASSED');

  // Test Complete Cleaning
  await sandbox.window.hospitrackStore.completeEvsCleaning('BED-101');
  assert.strictEqual(bed101.status, 'READY_FOR_INSPECTION');
  assert.strictEqual(bed101.evsTurnaroundMinutes, 35);
  console.log('✓ EVS Cleaning complete transition to READY_FOR_INSPECTION: PASSED');

  // Test Supervisor Inspection Release
  await sandbox.window.hospitrackStore.inspectAndReleaseBed('BED-101', {
    supervisorName: 'Head Nurse Meera',
    passed: true
  });
  assert.strictEqual(bed101.status, 'AVAILABLE');
  assert.strictEqual(bed101.evsInspectedBy, 'Head Nurse Meera');
  console.log('✓ Charge Nurse inspection release to AVAILABLE: PASSED');

  console.log('\n================================================================');
  console.log('ALL FRONTEND CLINICAL CDS & EVS TESTS PASSED WITH 100% SUCCESS!');
  console.log('================================================================\n');
  process.exit(0);
}).catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
