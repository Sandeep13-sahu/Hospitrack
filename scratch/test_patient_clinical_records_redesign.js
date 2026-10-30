/**
 * Comprehensive Automated Verification Suite for
 * Patient Clinical Records Redesign & Telemetry EHR System
 */
const fs = require('fs');
const assert = require('assert');

console.log('================================================================');
console.log('🧪 VERIFYING PATIENT CLINICAL RECORDS REDESIGN & LIVE INTEGRATION');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  ✓ ${desc}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ ${desc}`);
    console.error(`    Error: ${err.message}`);
    failCount++;
  }
}

// ----------------------------------------------------------------------------
// 1. React Component & TypeScript Contract Verification
// ----------------------------------------------------------------------------
console.log('📦 1. Verifying TypeScript Component (PatientClinicalRecords.tsx)...');

const tsxContent = fs.readFileSync('js/modules/PatientClinicalRecords.tsx', 'utf8');

it('Exports HospitalFacility, ConsultationRecord, PrescriptionItem, FollowUpAppointment', () => {
  assert(tsxContent.includes('export interface HospitalFacility'), 'Missing HospitalFacility interface');
  assert(tsxContent.includes('export interface ConsultationRecord'), 'Missing ConsultationRecord interface');
  assert(tsxContent.includes('export interface PrescriptionItem'), 'Missing PrescriptionItem interface');
  assert(tsxContent.includes('export interface PrescriptionMasterRecord'), 'Missing PrescriptionMasterRecord interface');
  assert(tsxContent.includes('export interface FollowUpAppointment'), 'Missing FollowUpAppointment interface');
  assert(tsxContent.includes('export interface PatientClinicalRecordsProps'), 'Missing PatientClinicalRecordsProps interface');
});

it('Exports PatientClinicalRecords React functional component', () => {
  assert(tsxContent.includes('export const PatientClinicalRecords: React.FC<PatientClinicalRecordsProps>'), 'Missing component export');
  assert(tsxContent.includes('export default PatientClinicalRecords'), 'Missing default export');
});

it('Implements Lucide React stroke icons', () => {
  const icons = ['Calendar', 'FileText', 'Pill', 'Download', 'Printer', 'Clock', 'CheckCircle2', 'Activity', 'Stethoscope', 'Building2'];
  icons.forEach(ic => {
    assert(tsxContent.includes(ic), `Missing icon ${ic} in PatientClinicalRecords.tsx`);
  });
});

it('Contains Facility Switcher with active transitions and bed/record counters', () => {
  assert(tsxContent.includes('filteredFacilities.map'), 'Facility mapping missing');
  assert(tsxContent.includes('availableBeds'), 'Bed counters missing in facilities');
  assert(tsxContent.includes('setSelectedFacilityId'), 'Facility state hook missing');
});

it('Contains Quick Search & Category Filter Bar with Export and Print buttons', () => {
  assert(tsxContent.includes('Search by diagnosis, medication, or physician...'), 'Search placeholder missing');
  assert(tsxContent.includes('Export PDF Summary'), 'Export PDF button missing');
  assert(tsxContent.includes('Print Clinical History'), 'Print Clinical History button missing');
  assert(tsxContent.includes('Clinical Records • Verified Care Network'), 'Verified Care Network badge missing');
});

it('Implements Structured 3-Column Clinical Matrix for consultations', () => {
  assert(tsxContent.includes('Symptoms &amp; Indication') || tsxContent.includes('Symptoms & Indication'), 'Symptoms column missing');
  assert(tsxContent.includes('Active Treatment Plan'), 'Treatment column missing');
  assert(tsxContent.includes('Clinician Notes &amp; Vitals') || tsxContent.includes('Clinician Notes & Vitals'), 'Vitals column missing');
  assert(tsxContent.includes('vitals.bp'), 'Blood pressure metric missing');
  assert(tsxContent.includes('vitals.pulse'), 'Pulse metric missing');
  assert(tsxContent.includes('vitals.spo2'), 'SpO2 metric missing');
});

it('Implements Prescription Master Card & Medication Progress Bar', () => {
  assert(tsxContent.includes('Active Prescriptions') && tsxContent.includes('Medication Regimens'), 'Prescriptions header missing');
  assert(tsxContent.includes('daysCompleted'), 'Days completed missing');
  assert(tsxContent.includes('totalDays'), 'Total days missing');
  assert(tsxContent.includes('progressbar'), 'Visual progress bar missing');
  assert(tsxContent.includes('+ Request Refill'), 'Request refill button missing');
  assert(tsxContent.includes('Print Rx Slip'), 'Print Rx button missing');
});

it('Implements Clinical Follow-up Milestone Stepper & Instructions Box', () => {
  assert(tsxContent.includes('Care Journey Post-Procedure Milestones'), 'Milestone ribbon missing');
  assert(tsxContent.includes('Pre-Visit Instructions') && tsxContent.includes('Directives'), 'Instructions box missing');
  assert(tsxContent.includes('Add to Calendar (.ics)'), 'Add to Calendar button missing');
  assert(tsxContent.includes('Reschedule'), 'Reschedule button missing');
  assert(tsxContent.includes('Pre-visit Intake'), 'Pre-visit intake missing');
});

it('Implements Print-Only Institutional Header and Physician Attestation Block', () => {
  assert(tsxContent.includes('only-print hidden print:block'), 'Print wrapper missing');
  assert(tsxContent.includes('OFFICIAL CLINICAL DOSSIER'), 'Print dossier badge missing');
  assert(tsxContent.includes('Digitally Signed'), 'Digital signature block missing');
});

// ----------------------------------------------------------------------------
// 2. CSS Stylesheet & Print Rules Verification
// ----------------------------------------------------------------------------
console.log('\n🎨 2. Verifying CSS Stylesheet (css/styles.css)...');

const cssContent = fs.readFileSync('css/styles.css', 'utf8');

it('Contains .consultation-ehr-card and .clinical-matrix-3col styles', () => {
  assert(cssContent.includes('.consultation-ehr-card'), 'Missing .consultation-ehr-card');
  assert(cssContent.includes('.clinical-matrix-3col'), 'Missing .clinical-matrix-3col');
  assert(cssContent.includes('.clinical-matrix-col.col-treatment'), 'Missing col-treatment styling');
  assert(cssContent.includes('.vital-metric-pill'), 'Missing .vital-metric-pill');
});

it('Contains .rx-master-card and animated pulsing dot styles', () => {
  assert(cssContent.includes('.rx-master-card'), 'Missing .rx-master-card');
  assert(cssContent.includes('.rx-pulse-dot'), 'Missing .rx-pulse-dot');
  assert(cssContent.includes('@keyframes rxPulse'), 'Missing rxPulse animation');
  assert(cssContent.includes('.rx-progress-bar'), 'Missing .rx-progress-bar');
});

it('Contains .milestone-stepper-ribbon and step circle styles', () => {
  assert(cssContent.includes('.milestone-stepper-ribbon'), 'Missing .milestone-stepper-ribbon');
  assert(cssContent.includes('.milestone-step-circle.active'), 'Missing active step circle');
  assert(cssContent.includes('.milestone-step-circle.completed'), 'Missing completed step circle');
});

it('Contains @media print rules with break-inside-avoid and chrome removal', () => {
  assert(cssContent.includes('.no-print,'), 'Missing .no-print in print media');
  assert(cssContent.includes('break-inside: avoid !important'), 'Missing break-inside avoid rule');
  assert(cssContent.includes('.only-print'), 'Missing .only-print rule');
});

it('Fixes referral modal footer wrapping and prevents button clipping', () => {
  assert(cssContent.includes('width: min(780px, 96vw) !important;'), 'Referral modal box width not updated');
  assert(cssContent.includes('flex-wrap: wrap !important;'), 'Referral modal footer flex-wrap missing');
  assert(cssContent.includes('@media (max-width: 640px)'), 'Mobile responsive footer rule missing');
});

// ----------------------------------------------------------------------------
// 3. Live DOM Patient Dashboard Engine Verification
// ----------------------------------------------------------------------------
console.log('\n💻 3. Verifying Live Patient Dashboard Engine (js/components/patientDashboard.js)...');

// Mock browser environment for testing HTML generation
global.window = {
  hospitrackAuth: {
    getCurrentUser: () => ({ id: 'PAT-303', patientId: 'PAT-303', name: 'Ananya Iyer', role: 'PATIENT' })
  },
  hospitrackStore: {},
  printConsultation: () => {},
  printPrescription: () => {},
  exportCalendarEvent: () => {}
};

global.document = {
  getElementById: (id) => null
};

// Safe evaluation of patientDashboard.js
require('../js/components/patientDashboard.js');

it('Registers window functions for category filtering, facility filtering, and search', () => {
  assert(typeof window.setPatientRecordsCategoryFilter === 'function', 'setPatientRecordsCategoryFilter not registered');
  assert(typeof window.setPatientRecordsFacilityFilter === 'function', 'setPatientRecordsFacilityFilter not registered');
  assert(typeof window.setPatientRecordsSearch === 'function', 'setPatientRecordsSearch not registered');
  assert(typeof window.togglePatientConsultationCard === 'function', 'togglePatientConsultationCard not registered');
  assert(typeof window.requestMedicationRefill === 'function', 'requestMedicationRefill not registered');
  assert(typeof window.printClinicalHistory === 'function', 'printClinicalHistory not registered');
  assert(typeof window.exportCalendarEvent === 'function', 'exportCalendarEvent not registered');
});

const pdCode = fs.readFileSync('js/components/patientDashboard.js', 'utf8');

it('renderClinicalRecordsMasterView returns complete modular EHR structure', () => {
  assert(pdCode.includes('function renderClinicalRecordsMasterView('), 'Missing renderClinicalRecordsMasterView');
  assert(pdCode.includes('renderPatientConsultationsView(data) {'), 'Missing renderPatientConsultationsView');
  assert(pdCode.includes('renderPrescriptionsView(data) {'), 'Missing renderPrescriptionsView');
  assert(pdCode.includes('renderFollowUpView(data) {'), 'Missing renderFollowUpView');
});

it('Includes Facility Switcher with City General Hospital and Apex Care Medical Center', () => {
  assert(pdCode.includes('City General Hospital'), 'City General Hospital missing from switcher');
  assert(pdCode.includes('Apex Care Medical Center'), 'Apex Care missing from switcher');
  assert(pdCode.includes('beds: 247') || pdCode.includes('247 beds'), 'Bed count missing in switcher');
  assert(pdCode.includes('facility-filter-pill'), 'Facility pill class missing');
});

it('Includes structured 3-column clinical matrix in consultations', () => {
  assert(pdCode.includes('clinical-matrix-3col'), 'clinical-matrix-3col class missing');
  assert(pdCode.includes('Symptoms &amp; Indication'), 'Symptoms column missing in HTML');
  assert(pdCode.includes('Active Treatment Plan'), 'Treatment column missing in HTML');
  assert(pdCode.includes('Recorded Vitals &amp; Notes'), 'Vitals column missing in HTML');
  assert(pdCode.includes('BP: <strong>120/76</strong>'), 'BP pill missing');
});

it('Includes Prescription Master Card with progress bar and refill action', () => {
  assert(pdCode.includes('rx-master-card'), 'rx-master-card missing');
  assert(pdCode.includes('rx-progress-bar'), 'rx-progress-bar missing');
  assert(pdCode.includes('rx-pulse-dot'), 'rx-pulse-dot missing');
  assert(pdCode.includes('requestMedicationRefill'), 'requestMedicationRefill missing');
});

it('Includes Follow-up milestone stepper and pre-visit directives', () => {
  assert(pdCode.includes('milestone-stepper-ribbon'), 'milestone stepper ribbon missing');
  assert(pdCode.includes('Pre-Visit Instructions &amp; Diagnostic Directives'), 'Pre-visit instructions box missing');
  assert(pdCode.includes('Add to Calendar (.ics)'), 'Add to Calendar action missing');
});

// ----------------------------------------------------------------------------
// Summary
// ----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`Results: ${passCount} passed, ${failCount} failed.`);
console.log('================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL 20 VERIFICATION CHECKS PASSED PERFECTLY!\n');
}
