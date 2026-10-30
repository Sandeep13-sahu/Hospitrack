const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== TEST SUITE: PATIENT CLINICAL CHART & INPATIENT DETAIL VIEW REDESIGN ===');

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

// ----------------------------------------------------------------------------
// 1. Setup DOM & Window Environment
// ----------------------------------------------------------------------------
const globalModal = { innerHTML: '', id: 'globalModalContainer' };
const printableRecord = { innerHTML: '', id: 'printable-medical-record', className: '' };
const domElements = {
  globalModalContainer: globalModal,
  'printable-medical-record': printableRecord,
  mainContentArea: { innerHTML: '', id: 'mainContentArea' },
  patientWorkspaceContent: { innerHTML: '', id: 'patientWorkspaceContent' }
};

const mockBodyClasses = new Set();
const mockDocument = {
  getElementById: (id) => {
    if (domElements[id]) return domElements[id];
    // Check if any element contains id in innerHTML
    for (const key in domElements) {
      const el = domElements[key];
      if (el && el.innerHTML && el.innerHTML.includes(`id="${id}"`)) {
        domElements[id] = {
          id,
          value: '',
          innerHTML: '',
          className: '',
          classList: {
            classes: new Set(['hidden']),
            add(c) { this.classes.add(c); this.className = Array.from(this.classes).join(' '); },
            remove(c) { this.classes.delete(c); this.className = Array.from(this.classes).join(' '); },
            contains(c) { return this.classes.has(c); }
          },
          setAttribute: () => {},
          focus: () => {}
        };
        return domElements[id];
      }
    }
    return null;
  },
  createElement: (tag) => {
    const el = {
      tagName: tag.toUpperCase(),
      id: '',
      className: '',
      innerHTML: '',
      classList: {
        classes: new Set(),
        add(c) { this.classes.add(c); this.className = Array.from(this.classes).join(' '); },
        remove(c) { this.classes.delete(c); this.className = Array.from(this.classes).join(' '); },
        contains(c) { return this.classes.has(c); }
      },
      setAttribute: () => {},
      parentElement: { querySelectorAll: () => [] }
    };
    return el;
  },
  body: {
    classList: {
      add: (c) => mockBodyClasses.add(c),
      remove: (c) => mockBodyClasses.delete(c),
      contains: (c) => mockBodyClasses.has(c)
    },
    appendChild: (el) => {
      if (el && el.id) domElements[el.id] = el;
      return el;
    }
  },
  querySelectorAll: () => [],
  addEventListener: () => {},
  removeEventListener: () => {}
};

const mockPatient = {
  id: 'PAT-303',
  name: 'Ananya Iyer',
  age: 31,
  gender: 'Female',
  bloodGroup: 'A+',
  status: 'CHECKED_IN',
  ward: 'General Medicine Ward',
  bedNumber: 'GEN-01',
  currentHospitalId: 'HOSP-102',
  address: '42-B, Indiranagar 1st Stage, Bengaluru, KA - 560038',
  emergencyContactName: 'Karthik Iyer',
  emergencyContactRelation: 'Husband',
  emergencyContactPhone: '+91 98111 99993',
  chiefComplaint: 'Episodes of atypical chest discomfort radiating to left shoulder on exertion, accompanied by episodic palpitations and mild fatigue.',
  allergies: '',
  diagnosis: 'Atypical Angina / Mitral Valve Prolapse Evaluation'
};

const mockDoctor = {
  id: 'DOC-202',
  name: 'Dr. Arjun Verma',
  specialty: 'General & Internal Medicine',
  hospitalId: 'HOSP-102'
};

const mockHospital = {
  id: 'HOSP-102',
  name: 'Apex Care Medical Center',
  code: 'ACMC'
};

const mockStore = {
  data: {
    patients: [mockPatient],
    doctors: [mockDoctor],
    hospitals: [mockHospital],
    prescriptions: [],
    labs: [],
    referrals: []
  },
  getPatients: function () { return this.data.patients; },
  getDoctorById: function () { return mockDoctor; },
  getHospitalById: function () { return mockHospital; },
  getPrescriptions: function () { return this.data.prescriptions; },
  getLabs: function () { return this.data.labs; },
  getReferrals: function () { return this.data.referrals; }
};

let toastMsg = '';
let printTriggered = false;

const mockWindow = {
  console,
  setTimeout: (fn, ms) => { fn(); },
  clearTimeout,
  document: mockDocument,
  hospitrackStore: mockStore,
  hospitrackAuth: {
    getCurrentUser: () => ({ id: 'DOC-202', role: 'DOCTOR', name: 'Dr. Arjun Verma', hospitalId: 'HOSP-102', doctorId: 'DOC-202' })
  },
  showToast: (m) => { toastMsg = m; },
  print: () => { printTriggered = true; },
  escapeHtml: (str) => String(str || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]))
};
mockWindow.window = mockWindow;

// ----------------------------------------------------------------------------
// 2. Load and Execute doctorDashboard.js in VM
// ----------------------------------------------------------------------------
const doctorCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'components', 'doctorDashboard.js'), 'utf8');
const context = vm.createContext(mockWindow);
vm.runInContext(doctorCode, context);

// ----------------------------------------------------------------------------
// TEST 1: Patient Overview Tab Visual Hierarchy & Structure
// ----------------------------------------------------------------------------
const initialHtml = context.renderPatientOverviewTab({
  patient: mockPatient,
  doctor: mockDoctor,
  hospital: mockHospital,
  prescriptions: [],
  labs: [],
  referrals: []
});

assert(initialHtml.includes('patient-clinical-chart-wrap'), 'Wraps view in .patient-clinical-chart-wrap');
assert(initialHtml.includes('clinical-identity-banner'), 'Renders modern .clinical-identity-banner top card');
assert(initialHtml.includes('identity-banner-header'), 'Renders top banner header strip');
assert(initialHtml.includes('Print Clinical Summary'), 'Header includes "Print Clinical Summary" action button');
assert(initialHtml.includes('Ananya Iyer'), 'Renders patient name Ananya Iyer');
assert(initialHtml.includes('PAT-303'), 'Renders patient ID PAT-303');
assert(initialHtml.includes('CHECKED_IN'), 'Renders CHECKED_IN live status indicator');
assert(initialHtml.includes('badge-checked-in'), 'Uses soft emerald .badge-checked-in with pulsing dot');

// 3-Column Demographics Matrix
assert(initialHtml.includes('identity-3col-grid'), 'Renders center 3-column demographics grid');
assert(initialHtml.includes('31 yrs • Female'), 'Col 1: Displays Age / Sex "31 yrs • Female"');
assert(initialHtml.includes('blood-group-pill') && initialHtml.includes('A+'), 'Col 1: Displays Blood Group A+ highlighted in red-tinted pill');
assert(initialHtml.includes('General Medicine Ward') && initialHtml.includes('Bed GEN-01'), 'Col 2: Displays Ward Allocation "General Medicine Ward • Bed GEN-01"');
assert(initialHtml.includes('Dr. Arjun Verma'), 'Col 2: Displays Attending Physician "Dr. Arjun Verma"');
assert(initialHtml.includes('Apex Care Medical Center'), 'Col 3: Displays Facility "Apex Care Medical Center"');
assert(initialHtml.includes('Karthik Iyer') && initialHtml.includes('Husband'), 'Col 3: Displays Emergency Contact "Karthik Iyer (Husband)"');
assert(initialHtml.includes('btn-emergency-call') && initialHtml.includes('tel:+919811199993'), 'Col 3: Renders 1-click telephone call button');
assert(initialHtml.includes('42-B, Indiranagar 1st Stage, Bengaluru'), 'Bottom line: Displays residential address with pin icon');

// ----------------------------------------------------------------------------
// TEST 2: Baseline Vitals Telemetry Grid & Intake Alert Bar
// ----------------------------------------------------------------------------
assert(initialHtml.includes('telemetry-vitals-card'), 'Renders .telemetry-vitals-card container');
assert(initialHtml.includes('telemetry-grid-4col'), 'Renders 4-column responsive telemetry metric grid');
assert(initialHtml.includes('120/80') && initialHtml.includes('mmHg'), 'Telemetry Widget 1: Blood Pressure 120/80 mmHg Normal');
assert(initialHtml.includes('74') && initialHtml.includes('bpm'), 'Telemetry Widget 2: Heart Rate 74 bpm Resting');
assert(initialHtml.includes('99%') && initialHtml.includes('SpO2'), 'Telemetry Widget 3: Oxygen Saturation 99% SpO2 Room Air');
assert(initialHtml.includes('98.6°') && initialHtml.includes('F'), 'Telemetry Widget 4: Body Temperature 98.6° F Normal Afebrile');

// Clinical Intake & Allergy Alert Bar
assert(initialHtml.includes('clinical-intake-bar'), 'Renders dedicated .clinical-intake-bar');
assert(initialHtml.includes('chief-complaint-quote'), 'Chief Complaint uses quotation styling');
assert(initialHtml.includes('Episodes of atypical chest discomfort'), 'Renders chief complaint text correctly');
assert(initialHtml.includes('No Known Drug Allergies - NKDA') && initialHtml.includes('nkda'), 'Renders green allergy badge for NKDA');

// ----------------------------------------------------------------------------
// TEST 3: Active Regimens & Interactive "+ Add Drug" Workflow
// ----------------------------------------------------------------------------
assert(initialHtml.includes('active-regimens-card'), 'Renders .active-regimens-card container');
assert(initialHtml.includes('+ Add Drug'), 'Renders active "+ Add Drug" button');
assert(initialHtml.includes('clinical-regimens-table'), 'Renders formatted medication table');
assert(initialHtml.includes('Metoprolol Succinate') && initialHtml.includes('25mg'), 'Displays initial medication Metoprolol Succinate 25mg');
assert(initialHtml.includes('Pantoprazole Sodium') && initialHtml.includes('40mg'), 'Displays initial medication Pantoprazole Sodium 40mg');
assert(initialHtml.includes('med-schedule-badge'), 'Displays schedule pill');
assert(initialHtml.includes('Edit Dose'), 'Displays "Edit Dose" action button');
assert(initialHtml.includes('Discontinue'), 'Displays "Discontinue" action button');

// ----------------------------------------------------------------------------
// TEST 4: Slide-Over Drawer Opening & Autocompletion
// ----------------------------------------------------------------------------
context.openAddDrugModal('PAT-303');
const drawerOverlay = domElements['addDrugSlideoverOverlay'];
assert(drawerOverlay && drawerOverlay.classList.contains('open'), 'openAddDrugModal opens slide-over drawer overlay');
assert(drawerOverlay.innerHTML.includes('Prescribe Inpatient Medication'), 'Slide-over drawer renders header title');
assert(drawerOverlay.innerHTML.includes('addDrugSearchInput'), 'Renders searchable drug input');

// Test Autocomplete filtering
context.filterDrugSuggestions('paracet');
const suggestionsEl = mockDocument.getElementById('drugSuggestionsList');
assert(suggestionsEl && !suggestionsEl.classList.contains('hidden'), 'Autocomplete popover displays matching suggestions');
assert(suggestionsEl.innerHTML.includes('Paracetamol'), 'Suggests Paracetamol (Acetaminophen)');

// Test Selecting Suggestion
context.selectDrugSuggestion('Paracetamol (Acetaminophen)', '500mg', 'Tablet', 'Thrice Daily [TDS]', 'Oral', 'After Meals');
assert(mockDocument.getElementById('addDrugSearchInput').value === 'Paracetamol (Acetaminophen)', 'Auto-fills drug name on suggestion click');
assert(mockDocument.getElementById('addDrugDosage').value === '500mg', 'Auto-fills dosage on suggestion click');
assert(mockDocument.getElementById('addDrugFrequency').value === 'Thrice Daily [TDS]', 'Auto-fills frequency on suggestion click');

// ----------------------------------------------------------------------------
// TEST 5: Form Submission, Prepending New Drug & Instant Reactivity
// ----------------------------------------------------------------------------
context.handleAddDrugSubmit({ preventDefault: () => {} }, 'PAT-303');
const updatedMeds = context.getPatientActiveMedications('PAT-303');
assert(updatedMeds.length === 3, 'Prepends new drug to active regimens (count is now 3)');
assert(updatedMeds[0].name === 'Paracetamol (Acetaminophen)', 'First active drug is newly added Paracetamol');
assert(updatedMeds[0].scheduleTag.includes('1 - 1 - 1'), 'Calculates schedule pill "1 - 1 - 1" for TDS');
assert(!drawerOverlay.classList.contains('open'), 'Drawer closes automatically after submission');

// Test Discontinue
context.discontinueDrug('PAT-303', 'Pantoprazole Sodium');
const afterDiscontinueMeds = context.getPatientActiveMedications('PAT-303');
assert(afterDiscontinueMeds.length === 2, 'Discontinue removes Pantoprazole from active medications');
assert(!afterDiscontinueMeds.some(m => m.name.includes('Pantoprazole')), 'Pantoprazole successfully discontinued');

// ----------------------------------------------------------------------------
// TEST 6: Diagnostic Lab Orders Section
// ----------------------------------------------------------------------------
assert(initialHtml.includes('diagnostic-labs-card'), 'Renders .diagnostic-labs-card container');
assert(initialHtml.includes('Order Test') && initialHtml.includes('openQuickOrderLabModal'), 'Renders "+ Order Test" button');
assert(initialHtml.includes('View All History'), 'Renders "View All History" button');
assert(initialHtml.includes('Complete Blood Count (CBC)'), 'Displays CBC test order');
assert(initialHtml.includes('Processing in Lab'), 'Displays blue "Processing in Lab" status pill');
assert(initialHtml.includes('Sample Collected'), 'Displays amber "Sample Collected" status pill');

// Test Quick Order Test
context.openQuickOrderLabModal('PAT-303');
const updatedLabs = context.getPatientActiveLabOrders('PAT-303');
assert(updatedLabs.length === 3, 'openQuickOrderLabModal prepends new lab order (count is now 3)');
assert(updatedLabs[0].testName.includes('12-Lead Diagnostic Electrocardiogram'), 'Prepended test is 12-Lead ECG');

// ----------------------------------------------------------------------------
// TEST 7: Real-World Inpatient Summary Printout
// ----------------------------------------------------------------------------
context.printInpatientSummary('PAT-303');
assert(printTriggered === true, 'printInpatientSummary triggers window.print()');
const printHtml = printableRecord.innerHTML;

assert(printHtml.includes('print-inpatient-summary-sheet'), 'Renders .print-inpatient-summary-sheet');
assert(printHtml.includes('APEX CARE MEDICAL CENTER'), 'Header: Hospital Letterhead branding rendered');
assert(printHtml.includes('ADM-2026-8812'), 'Header: Barcode tracking UID ADM-2026-8812 rendered');
assert(printHtml.includes('NABL ISO 15189 • NABH Accredited'), 'Header: Accreditation badges rendered');

// Section 1: Demographics & Ward Allocation
assert(printHtml.includes('Ananya Iyer') && printHtml.includes('PAT-303'), 'Section 1: Patient Demographics rendered');
assert(printHtml.includes('General Medicine Ward') && printHtml.includes('Bed GEN-01'), 'Section 1: Ward & Bed Allocation rendered');

// Section 2: Vitals recorded at intake
assert(printHtml.includes('120/80 mmHg') && printHtml.includes('74 bpm'), 'Section 2: Intake vitals rendered');
assert(printHtml.includes('No Known Drug Allergies - NKDA'), 'Section 2: NKDA allergy alert rendered');

// Section 3: Active Medication Chart with Nurse Administration Timing Slots
assert(printHtml.includes('Morning (08:00)') && printHtml.includes('Noon (14:00)') && printHtml.includes('Night (20:00)'), 'Section 3: Nurse administration slots (08:00, 14:00, 20:00) rendered');
assert(printHtml.includes('Nurse Initial'), 'Section 3: Nurse Initial verification column rendered');
assert(printHtml.includes('Metoprolol Succinate 25mg'), 'Section 3: Populated with active medication rows');

// Section 4: Doctor's provisional diagnosis and signature box
assert(printHtml.includes('Provisional Clinical Diagnosis &amp; Plan'), 'Section 4: Diagnosis and plan rendered');
assert(printHtml.includes('Dr. Arjun Verma') && printHtml.includes('Reg #KMC-44912'), 'Section 4: Attending physician signature box rendered');

// ----------------------------------------------------------------------------
// TEST 8: React Component Deliverable Validation
// ----------------------------------------------------------------------------
const reactFilePath = path.join(__dirname, '..', 'js', 'modules', 'PatientClinicalChart.tsx');
assert(fs.existsSync(reactFilePath), 'PatientClinicalChart.tsx component file exists');
const reactContent = fs.readFileSync(reactFilePath, 'utf8');

assert(reactContent.includes('export const PatientClinicalChart: React.FC'), 'Exports PatientClinicalChart React component');
assert(reactContent.includes('export default PatientClinicalChart'), 'Default export defined');
assert(reactContent.includes('HeartPulse') && reactContent.includes('Thermometer') && reactContent.includes('Activity'), 'Imports requested Lucide React icons');
assert(reactContent.includes('useState<MedicationItem[]>'), 'Uses useState for managing active medications');
assert(reactContent.includes('useState<boolean>(false)'), 'Uses useState for modal toggle');
assert(reactContent.includes('handlePrintClinicalSummary'), 'Implements print trigger');
assert(reactContent.includes('print:hidden') && reactContent.includes('print:block'), 'Uses Tailwind CSS print utilities');

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
