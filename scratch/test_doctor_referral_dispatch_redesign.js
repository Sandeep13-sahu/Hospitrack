const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== TEST SUITE: DOCTOR REFERRAL DISPATCH FORM REDESIGN & VALIDATION FIX ===');

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] ${testName}`);
    failed++;
  }
}

// 1. Setup simulated DOM and window environment
const globalModal = {
  innerHTML: '',
  id: 'globalModalContainer'
};

const domElements = {
  globalModalContainer: globalModal,
  mainContentArea: { innerHTML: '', id: 'mainContentArea' }
};

function extractValueFromHtml(html, id) {
  if (!html) return '';
  const regex = new RegExp(`id="${id}"[^>]*value="([^"]*)"`, 'i');
  const match = html.match(regex);
  if (match) return match[1];
  if (id === 'refDestHospital') return 'HOSP-101';
  if (id === 'refPriority') return 'ROUTINE';
  return '';
}

const mockDocument = {
  getElementById: (id) => {
    if (domElements[id]) return domElements[id];
    if (globalModal.innerHTML && globalModal.innerHTML.includes(`id="${id}"`)) {
      const initVal = extractValueFromHtml(globalModal.innerHTML, id);
      domElements[id] = {
        id,
        value: initVal,
        textContent: '',
        classList: {
          classes: new Set(['hidden']),
          add(c) { this.classes.add(c); },
          remove(c) { this.classes.delete(c); },
          contains(c) { return this.classes.has(c); }
        },
        selectedOptions: [{
          value: 'HOSP-101',
          text: 'City General Hospital • 12 beds available (CGH)',
          getAttribute: (attr) => attr === 'data-facility-name' ? 'City General Hospital' : null
        }],
        querySelector: () => ({ textContent: '' }),
        setAttribute: () => { },
        focus: () => { }
      };
      return domElements[id];
    }
    return null;
  },
  createElement: (tag) => {
    return {
      tagName: tag.toUpperCase(),
      id: '',
      className: '',
      innerHTML: '',
      setAttribute: () => { },
      classList: {
        classes: new Set(),
        add(c) { this.classes.add(c); },
        remove(c) { this.classes.delete(c); },
        contains(c) { return this.classes.has(c); }
      },
      remove: function () {
        if (this.id && domElements[this.id]) {
          delete domElements[this.id];
        }
      }
    };
  },
  body: {
    appendChild: (el) => {
      if (el && el.id) {
        domElements[el.id] = el;
      }
      return el;
    }
  },
  addEventListener: () => { },
  removeEventListener: () => { }
};

const mockStore = {
  data: {
    patients: [
      { id: 'PAT-303', name: 'Ananya Iyer', age: 31, gender: 'Female', bloodGroup: 'A+', currentHospitalId: 'HOSP-102', diagnosis: 'Mitral Valve Prolapse / Arrhythmia Evaluation' },
      { id: 'PAT-302', name: 'Rajesh Kumar', age: 58, gender: 'Male', bloodGroup: 'B+', currentHospitalId: 'HOSP-101', diagnosis: 'Acute Coronary Syndrome — Unstable Angina' },
      { id: 'PAT-301', name: 'John Doe', age: 42, gender: 'Male', bloodGroup: 'O+', currentHospitalId: 'HOSP-101' }
    ],
    hospitals: [
      { id: 'HOSP-101', name: 'City General Hospital', code: 'CGH', location: 'Central Healthcare District', availableBeds: 12, status: 'ACTIVE' },
      { id: 'HOSP-102', name: 'Apex Care Medical Center', code: 'ACMC', location: 'Metro West District', availableBeds: 4, status: 'ACTIVE' },
      { id: 'HOSP-103', name: 'Metro Emergency Hospital', code: 'MEH', location: 'Downtown Medical Campus', availableBeds: 8, status: 'ACTIVE' }
    ],
    referrals: []
  },
  getDoctorById: function (dId) {
    return { id: dId || 'DOC-201', name: 'Dr. Sarah Sharma', specialty: 'Cardiology', hospitalId: 'HOSP-102' };
  },
  getHospitalById: function (hId) {
    return this.data.hospitals.find(h => h.id === hId) || { name: 'City General Hospital', code: 'CGH' };
  },
  getPrescriptions: function () { return []; },
  getLabs: function () { return []; },
  getReferrals: function () { return this.data.referrals; },
  getPatients: function (hId) {
    if (hId) return this.data.patients.filter(p => p.currentHospitalId === hId);
    return this.data.patients;
  },
  getHospitals: function () {
    return this.data.hospitals;
  },
  createReferral: async function (payload) {
    this.data.referrals.unshift(payload);
    return { success: true, referral: payload };
  },
  syncAllData: async function () { }
};

let toastMessage = '';
let doctorTabSwitched = '';
let referralSubtabSwitched = '';

const mockWindow = {
  console,
  setTimeout,
  clearTimeout,
  document: mockDocument,
  hospitrackStore: mockStore,
  hospitrackAuth: {
    getCurrentUser: () => ({ id: 'DOC-201', role: 'DOCTOR', name: 'Dr. Sarah Sharma', hospitalId: 'HOSP-102' })
  },
  showToast: (msg, type) => { toastMessage = msg; },
  closeGlobalModal: (id) => {
    globalModal.innerHTML = '';
    for (const key in domElements) {
      if (key !== 'globalModalContainer' && key !== 'mainContentArea') {
        delete domElements[key];
      }
    }
  },
  setDoctorTab: (tab) => { doctorTabSwitched = tab; },
  setReferralSubtab: (subtab) => { referralSubtabSwitched = subtab; },
  escapeHtml: (str) => String(str || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]))
};
mockWindow.window = mockWindow;

// 2. Load and run doctorDashboard.js in VM
const code = fs.readFileSync(path.join(__dirname, '..', 'js', 'components', 'doctorDashboard.js'), 'utf8');
const context = vm.createContext(mockWindow);
vm.runInContext(code, context);

// Test 1: extractCleanPatientId helper
assert(typeof context.extractCleanPatientId === 'function', 'extractCleanPatientId helper is defined');
assert(context.extractCleanPatientId('PAT-303') === 'PAT-303', 'Extracts exact ID PAT-303');
assert(context.extractCleanPatientId('Ananya Iyer (PAT-303) • 31y Female') === 'PAT-303', 'Extracts PAT-303 from composite label');
assert(context.extractCleanPatientId('pat-301 (John Doe)') === 'PAT-301', 'Case-insensitive extraction PAT-301');

// Test 2: openCreateReferralModal renders executive UI with dedicated sticky footer
context.openCreateReferralModal('PAT-303');
const html = globalModal.innerHTML;
assert(html.includes('Create Clinical Specialist Referral'), 'Header title "Create Clinical Specialist Referral" rendered');
assert(html.includes('referral-context-banner'), 'Context banner rendered');
assert(html.includes('referral-form-wrap'), 'Form wrapper rendered');
assert(html.includes('referral-modal-body'), 'Scrollable modal body rendered');
assert(html.includes('referral-modal-footer'), 'Dedicated sticky modal footer rendered');
assert(html.includes('Cancel'), 'Cancel button in footer rendered');
assert(html.includes('Ananya Iyer'), 'Patient name Ananya Iyer rendered in modal');
assert(html.includes('PAT-303'), 'Patient ID PAT-303 bound');
assert(html.includes('Mitral Valve Prolapse / Arrhythmia Evaluation'), 'Diagnosis badge rendered');
assert(html.includes('City General Hospital'), 'Destination hospital City General Hospital rendered');
assert(html.includes('priority-pill-group'), 'Priority 3-button pill group rendered');
assert(html.includes('Routine') && html.includes('Urgent') && html.includes('STAT / Emergency'), 'All 3 priority pills rendered');
assert(html.includes('refPatientError'), 'Field-specific patient error container rendered');
assert(html.includes('refFacilityError'), 'Field-specific facility error container rendered');
assert(html.includes('refReasonError'), 'Field-specific reason error container rendered');
assert(html.includes('Preview Referral Letter / Print Form'), 'Preview Referral Letter button rendered');
assert(html.includes('Dispatch Referral'), 'Dispatch Referral submit button rendered');

// Test 3: Priority switching
context.setReferralPriority('URGENT');
assert(mockDocument.getElementById('refPriority').value === 'URGENT', 'Priority state switches to URGENT');
context.setReferralPriority('EMERGENCY');
assert(mockDocument.getElementById('refPriority').value === 'EMERGENCY', 'Priority state switches to EMERGENCY');
context.setReferralPriority('ROUTINE');
assert(mockDocument.getElementById('refPriority').value === 'ROUTINE', 'Priority state switches to ROUTINE');

// Test 4: Dynamic Character Counter ("HGAKBJSKBSKML" updates to 13 / 500)
const reasonEl = mockDocument.getElementById('refReason');
reasonEl.value = 'HGAKBJSKBSKML';
context.handleReferralReasonChange(reasonEl);
assert(mockDocument.getElementById('refReasonCount').textContent === '13 / 500', 'Dynamic character count recalculates correctly for HGAKBJSKBSKML (13 / 500)');

// Test 5: Validation handling & Submission flow for Ananya Iyer -> City General Hospital
let formPrevented = false;
let formStopped = false;
const mockEvent = {
  preventDefault: () => { formPrevented = true; },
  stopPropagation: () => { formStopped = true; }
};

const pIdInput = mockDocument.getElementById('refPatientId');
const fIdInput = mockDocument.getElementById('refDestHospital');
const rInput = mockDocument.getElementById('refReason');
const btn = mockDocument.getElementById('refDispatchBtn');

pIdInput.value = 'PAT-303';
fIdInput.value = 'HOSP-101';
rInput.value = ''; // empty reason

(async () => {
  await context.handleReferralSubmit(mockEvent);
  const reasonErr = mockDocument.getElementById('refReasonError');
  assert(!reasonErr.classList.contains('hidden'), 'Inline reason error displayed when reason is empty');
  assert(mockStore.data.referrals.length === 0, 'Submission blocked when required reason is missing');

  // Now set valid referralReason and leave additionalNotes empty (optional field)
  rInput.value = 'Comprehensive electrophysiology review and cardiac telemetry evaluation.';
  await context.handleReferralSubmit(mockEvent);

  assert(mockStore.data.referrals.length === 1, 'Referral dispatched successfully to store');
  const dispatched = mockStore.data.referrals[0];
  assert(dispatched.patientId === 'PAT-303', 'Dispatched payload has clean patientId PAT-303');
  assert(dispatched.patientName === 'Ananya Iyer', 'Dispatched payload has patientName Ananya Iyer');
  assert(dispatched.toHospitalId === 'HOSP-101', 'Dispatched to target facility HOSP-101');
  assert(dispatched.status === 'Dispatched / Pending Triage', 'Referral status is "Dispatched / Pending Triage"');
  assert(toastMessage.includes('Ananya Iyer') && toastMessage.includes('City General Hospital'), `Success toast matches prompt: "${toastMessage}"`);
  assert(context.getDoctorActiveTab() === 'referrals', 'Doctor active tab automatically switched to referrals');
  assert(context.getReferralSubtab() === 'outgoing', 'Referral subtab automatically switched to outgoing');

  // Test 6: Prompt Edge Case - Typing "HAVE to be beacuse of heart note"
  // Clean cached elements and re-open referral modal for Ananya Iyer
  for (const key in domElements) {
    if (key !== 'globalModalContainer' && key !== 'mainContentArea') delete domElements[key];
  }
  context.openCreateReferralModal('PAT-303');
  const edgeReasonEl = mockDocument.getElementById('refReason');
  edgeReasonEl.value = 'HAVE to be beacuse of heart note';
  context.handleReferralReasonChange(edgeReasonEl);

  const edgeCountEl = mockDocument.getElementById('refReasonCount');
  assert(edgeCountEl.textContent === '32 / 500', 'Dynamic counter accurately renders 32 / 500 for typed text');

  const edgeReasonErr = mockDocument.getElementById('refReasonError');
  assert(edgeReasonErr.classList.contains('hidden'), 'Reason error hint cleared immediately on input');

  // Trigger submission with typed reason
  await context.handleReferralSubmit(mockEvent);
  assert(mockStore.data.referrals.length === 2, 'Submission succeeded without false-positive validation error');
  const edgeDispatched = mockStore.data.referrals[0];
  assert(edgeDispatched.reason === 'HAVE to be beacuse of heart note', 'Dispatched payload reason matches typed text');

  // Test 7: Preview Referral Letter Pre-Check Validation & Authentic Slip Rendering
  for (const key in domElements) {
    if (key !== 'globalModalContainer' && key !== 'mainContentArea') delete domElements[key];
  }
  context.openCreateReferralModal('PAT-303');

  // 7a: Pre-check fails when reason is empty
  const previewReasonInput = mockDocument.getElementById('refReason');
  previewReasonInput.value = '';
  context.handleReferralReasonChange(previewReasonInput);
  context.handlePreviewReferralLetter();
  assert(!domElements['referralPreviewModal'], 'Preview blocked by pre-check when required reason is missing');
  const previewReasonErr = mockDocument.getElementById('refReasonError');
  assert(!previewReasonErr.classList.contains('hidden'), 'Inline reason error displayed on preview pre-check failure');

  // 7b: Pre-check passes when valid
  previewReasonInput.value = 'HAVE to be beacuse of heart note';
  context.handleReferralReasonChange(previewReasonInput);
  context.handlePreviewReferralLetter();

  const previewModalEl = mockDocument.getElementById('referralPreviewModal');
  assert(previewModalEl !== null && previewModalEl !== undefined, 'Preview modal successfully created and rendered');
  const previewHtml = previewModalEl.innerHTML;
  assert(previewHtml.includes('Back to Edit'), 'Back to Edit action button rendered');
  assert(previewHtml.includes('Print Official Letter'), 'Print Official Letter action button rendered');
  assert(previewHtml.includes('HOSPITRACK INTER-INSTITUTIONAL CLINICAL REFERRAL SLIP'), 'Official Letterhead title rendered');
  assert(previewHtml.includes('REF-2026-'), 'Barcode tracking UID REF-2026- prefix rendered');
  assert(previewHtml.includes('Ananya Iyer') && previewHtml.includes('PAT-303'), 'Patient demographics in 2-column grid rendered');
  assert(previewHtml.includes('Dr. Sarah Sharma') && previewHtml.includes('City General Hospital'), 'Referring clinician & facility in 2-column grid rendered');
  assert(previewHtml.includes('HAVE to be beacuse of heart note'), 'Chief Clinical Indication renders exact typed reason');
  assert(previewHtml.includes('Complete Longitudinal EHR') && previewHtml.includes('12-Lead ECG'), 'Attached medical records badges rendered');
  assert(previewHtml.includes('Referring Clinician Digital Signature') && previewHtml.includes('Receiving Facility Triage Acceptance'), 'Formal attestation & dual signatures rendered');

  // 7c: Back to Edit closes preview modal cleanly
  context.closeReferralPreviewModal();
  assert(mockDocument.getElementById('referralPreviewModal') === null, 'closeReferralPreviewModal removes preview modal from DOM');

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
})();
