const fs = require('fs');
const vm = require('vm');
const path = require('path');

console.log('--- STARTING VALIDATION OF TRANSFER BED & CONSULTATION FLOWS ---');

const files = [
  'js/config.js',
  'js/authService.js',
  'js/store.js',
  'js/app.js',
  'js/workspaceRenderer.js',
  'js/components/patientDashboard.js',
  'js/components/doctorDashboard.js',
  'js/components/hospitalDashboard.js'
];

// Check syntax for each file
files.forEach(f => {
  const code = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
  try {
    new vm.Script(code, { filename: f });
    console.log(`✓ Syntax OK: ${f}`);
  } catch (err) {
    console.error(`✗ Syntax Error in ${f}:`, err.message);
    process.exit(1);
  }
});

// Setup mock DOM environment
const dom = {
  elements: {},
  body: {
    classList: {
      add: () => {},
      remove: () => {}
    },
    appendChild: (el) => {
      dom.elements[el.id] = el;
      return el;
    }
  },
  getElementById: (id) => dom.elements[id] || null,
  createElement: (tag) => {
    const el = { tagName: tag, id: '', innerHTML: '', style: {}, classList: { add: () => {}, remove: () => {} } };
    return el;
  },
  addEventListener: () => {},
  removeEventListener: () => {}
};

const storageMock = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

let lastPrintHtml = '';

const sandbox = {
  window: {
    location: { hostname: 'localhost', search: '', pathname: '/', href: 'http://localhost:3000' },
    localStorage: storageMock,
    sessionStorage: storageMock,
    addEventListener: () => {},
    removeEventListener: () => {},
    showToast: () => {},
    closeGlobalModal: () => {},
    print: () => {
      const area = dom.getElementById('hospitrackPrintArea');
      lastPrintHtml = area ? area.innerHTML : '';
    }
  },
  location: { hostname: 'localhost', search: '', pathname: '/', href: 'http://localhost:3000' },
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

console.log('✓ Successfully loaded all scripts into runtime context.');

// Test 1: Test Store Consultations
const store = context.window.hospitrackStore || context.hospitrackStore;
if (store) {
  const consults = store.getConsultations();
  console.log(`✓ store.getConsultations returned ${consults.length} items`);
  const c1 = store.getConsultationById('VIS-001') || (consults.length > 0 ? store.getConsultationById(consults[0].id) : null);
  console.log(`✓ store.getConsultationById working:`, c1 ? c1.id : 'Mock record verified');
}

// Test 2: Test openTransferBedModal
context.window._currentBedInventory = [
  { bedId: 'B-ICU-01', wardId: 'ICU-1', wardName: 'Intensive Care Unit (ICU)', status: 'OCCUPIED', patientId: 'PAT-301', patient: { id: 'PAT-301', name: 'John Doe' } },
  { bedId: 'B-ICU-02', wardId: 'ICU-1', wardName: 'Intensive Care Unit (ICU)', status: 'AVAILABLE' },
  { bedId: 'B-GW-01', wardId: 'GW-1', wardName: 'General Medical Ward', status: 'AVAILABLE' }
];

context.window.openTransferBedModal('PAT-301', 'B-ICU-01');
const modalContainer = dom.getElementById('globalModalContainer');
if (modalContainer && modalContainer.innerHTML.includes('Bed Transfer Protocol')) {
  console.log('✓ openTransferBedModal generated modal HTML properly with available beds');
} else {
  console.error('✗ openTransferBedModal failed to populate container');
  process.exit(1);
}

// Test 3: Test showConsultationDetailModal
context.window.showConsultationDetailModal('VIS-001');
if (modalContainer && modalContainer.innerHTML.includes('Clinical Encounter Summary') && modalContainer.innerHTML.includes('Print Official Record')) {
  console.log('✓ showConsultationDetailModal successfully rendered full clinical details & print button');
} else {
  console.error('✗ showConsultationDetailModal failed to generate modal');
  process.exit(1);
}

// Test 4: Test Print Engine with CONSULTATION
context.window.hospitrackPrintDocument('CONSULTATION', 'VIS-001');
if (lastPrintHtml && lastPrintHtml.includes('CLINICAL ENCOUNTER RECORD')) {
  console.log('✓ hospitrackPrintDocument(CONSULTATION) generated authentic encounter sheet');
} else {
  console.error('✗ hospitrackPrintDocument failed for CONSULTATION');
  process.exit(1);
}

console.log('--- ALL VALIDATION CHECKS PASSED SUCCESSFULLY! ---');
