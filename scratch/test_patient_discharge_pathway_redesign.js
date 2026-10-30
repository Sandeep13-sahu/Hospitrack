/**
 * Comprehensive Automated Verification Suite:
 * Patient Discharge Pathway & Records Module Redesign
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ${name}: ${err.message}`);
  }
}

console.log('================================================================');
console.log('🧪 VERIFYING PATIENT DISCHARGE PATHWAY & RECORDS MODULE');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// 1. Verifying TypeScript Component (PatientDischargePathway.tsx)
// -----------------------------------------------------------------------------
const tsxPath = path.join(__dirname, '../js/modules/PatientDischargePathway.tsx');
const tsxContent = fs.readFileSync(tsxPath, 'utf8');

runTest('PatientDischargePathway.tsx: exports typed data contracts', () => {
  assert.ok(tsxContent.includes('export interface ClearanceStep'), 'Must export ClearanceStep');
  assert.ok(tsxContent.includes('export interface AdmissionEpisodeContext'), 'Must export AdmissionEpisodeContext');
  assert.ok(tsxContent.includes('export interface DischargeVitals'), 'Must export DischargeVitals');
  assert.ok(tsxContent.includes('export interface HospitalCourseSummary'), 'Must export HospitalCourseSummary');
  assert.ok(tsxContent.includes('export interface MedicationReconciliationItem'), 'Must export MedicationReconciliationItem');
  assert.ok(tsxContent.includes('export interface RecoveryDirectives'), 'Must export RecoveryDirectives');
  assert.ok(tsxContent.includes('export interface PostDischargeFollowUp'), 'Must export PostDischargeFollowUp');
  assert.ok(tsxContent.includes('export interface DischargeSummary'), 'Must export DischargeSummary');
});

runTest('PatientDischargePathway.tsx: exports React component and default mock data', () => {
  assert.ok(tsxContent.includes('export const PatientDischargePathway'), 'Must export PatientDischargePathway');
  assert.ok(tsxContent.includes('export default PatientDischargePathway'), 'Must have default export');
  assert.ok(tsxContent.includes('export const DEFAULT_DISCHARGE_DATA'), 'Must export DEFAULT_DISCHARGE_DATA');
});

runTest('PatientDischargePathway.tsx: imports all required Lucide React stroke icons', () => {
  const requiredIcons = [
    'FileCheck',
    'Activity',
    'CalendarCheck',
    'AlertTriangle',
    'Download',
    'Printer',
    'Pill',
    'PhoneCall'
  ];
  requiredIcons.forEach(icon => {
    assert.ok(tsxContent.includes(icon), `Must import Lucide icon: ${icon}`);
  });
});

runTest('PatientDischargePathway.tsx: renders 4-step multi-department clearance pipeline', () => {
  assert.ok(tsxContent.includes('Clinical Stability & Primary Consultant Sign-off'), 'Step 1 title missing');
  assert.ok(tsxContent.includes('Dr. Arjun Verma'), 'Consultant sign-off missing');
  assert.ok(tsxContent.includes('Medication Reconciliation & Pharmacy Clearance'), 'Step 2 title missing');
  assert.ok(tsxContent.includes('Billing, Insurance & TPA Approval'), 'Step 3 title missing');
  assert.ok(tsxContent.includes('Final Inpatient Discharge Summary Generated'), 'Step 4 title missing');
  assert.ok(tsxContent.includes('FORMALLY DISCHARGED • HOME CARE TRANSITION') || tsxContent.includes('FORMALLY DISCHARGED'), 'Discharge status badge missing');
});

runTest('PatientDischargePathway.tsx: renders Admission & Episode Context Banner', () => {
  assert.ok(tsxContent.includes('Apex Care Medical Center'), 'Hospital name missing');
  assert.ok(tsxContent.includes('General Medicine Ward'), 'Ward name missing');
  assert.ok(tsxContent.includes('Bed GEN-01'), 'Bed allocation missing');
  assert.ok(tsxContent.includes('Oct 24, 2026, 10:15 AM'), 'Admission timestamp missing');
  assert.ok(tsxContent.includes('Oct 29, 2026, 02:30 PM'), 'Discharge timestamp missing');
  assert.ok(tsxContent.includes('5 Days'), 'Length of stay missing');
  assert.ok(tsxContent.includes('I21.9'), 'ICD-10 code missing');
  assert.ok(tsxContent.includes('Download PDF Summary') || tsxContent.includes('Download Official Summary'), 'PDF download button missing');
  assert.ok(tsxContent.includes('Print Paperwork'), 'Print paperwork button missing');
});

runTest('PatientDischargePathway.tsx: renders Card A (Hospital Course & Discharge Vitals)', () => {
  assert.ok(tsxContent.includes('Card A: Clinical Hospital Course & Treatment Summary'), 'Card A header missing');
  assert.ok(tsxContent.includes('120/80 mmHg'), 'BP vital missing');
  assert.ok(tsxContent.includes('72 bpm'), 'Heart rate vital missing');
  assert.ok(tsxContent.includes('99% Room Air') || tsxContent.includes('99%'), 'SpO2 vital missing');
  assert.ok(tsxContent.includes('Afebrile, hemodynamically stable, ambulatory without assistance'), 'Exam text missing');
  assert.ok(tsxContent.includes('High-Sensitivity Troponin-I'), 'Troponin highlight missing');
});

runTest('PatientDischargePathway.tsx: renders Card B (Medication Reconciliation with Discontinued Alert)', () => {
  assert.ok(tsxContent.includes('Card B: Discharge Medication Reconciliation (To Take at Home)'), 'Card B header missing');
  assert.ok(tsxContent.includes('Rosuvastatin 20mg Tablet'), 'Rosuvastatin missing');
  assert.ok(tsxContent.includes('Clopidogrel 75mg Tablet'), 'Clopidogrel missing');
  assert.ok(tsxContent.includes('0 - 0 - 1 (Night)'), 'Schedule missing');
  assert.ok(tsxContent.includes('Newly Added'), 'Newly added badge missing');
  assert.ok(tsxContent.includes('Continued Drug') || tsxContent.includes('Continued'), 'Continued badge missing');
  assert.ok(tsxContent.includes('⚠️ Discontinue prior medication: Do not take OTC Ibuprofen'), 'Discontinued drug alert missing');
});

runTest('PatientDischargePathway.tsx: renders Card C (Recovery Instructions & Emergency Speed-Dial)', () => {
  assert.ok(tsxContent.includes('Card C: Recovery Instructions, Diet & Red-Flag Warnings'), 'Card C header missing');
  assert.ok(tsxContent.includes('Walking permitted on flat surfaces') || tsxContent.includes('Walking permitted'), 'Activity restriction missing');
  assert.ok(tsxContent.includes('heavy lifting (> 5 kg') || tsxContent.includes('heavy lifting'), 'Lifting restriction missing');
  assert.ok(tsxContent.includes('Low sodium'), 'Dietary guideline missing');
  assert.ok(tsxContent.includes('Emergency Red-Flag Symptoms'), 'Red flags missing');
  assert.ok(tsxContent.includes('tel:+919811199993') || tsxContent.includes('+91 98111 99993'), 'Emergency speed-dial missing');
});

runTest('PatientDischargePathway.tsx: renders Card D (Post-Discharge Follow-Up Pathway)', () => {
  assert.ok(tsxContent.includes('Card D: Post-Discharge Outpatient Review Pathway'), 'Card D header missing');
  assert.ok(tsxContent.includes('Nov 12, 2026 at 10:00 AM'), 'Scheduled appointment missing');
  assert.ok(tsxContent.includes('Dr. Sarah Sharma, MD (Cardiology)'), 'Follow-up physician missing');
  assert.ok(tsxContent.includes('OPD Block B'), 'Location missing');
  assert.ok(tsxContent.includes('Add to Google Calendar (.ics)'), 'Calendar export button missing');
  assert.ok(tsxContent.includes('Request Virtual Consult'), 'Virtual consult button missing');
});

// -----------------------------------------------------------------------------
// 2. Verifying Patient Dashboard Live Engine (patientDashboard.js)
// -----------------------------------------------------------------------------
const jsPath = path.join(__dirname, '../js/components/patientDashboard.js');
const jsContent = fs.readFileSync(jsPath, 'utf8');

runTest('patientDashboard.js: contains interactive discharge pathway view', () => {
  assert.ok(jsContent.includes('function renderDischargeRecordsView'), 'Must define renderDischargeRecordsView');
  assert.ok(jsContent.includes('function renderDischargeSubtabContent'), 'Must define renderDischargeSubtabContent');
  assert.ok(jsContent.includes('window.setDischargeSubtab'), 'Must define window.setDischargeSubtab');
  assert.ok(jsContent.includes('window.downloadFollowUpCalendarIcs'), 'Must define window.downloadFollowUpCalendarIcs');
  assert.ok(jsContent.includes('window.shareDischargePaperwork'), 'Must define window.shareDischargePaperwork');
});

runTest('patientDashboard.js: binds Print Discharge Paperwork to centralized print system', () => {
  assert.ok(jsContent.includes("window.hospitrackPrintDocument('discharge'"), 'Must call hospitrackPrintDocument with discharge');
});

runTest('patientDashboard.js: renders 4-step clearance stepper with emerald badge', () => {
  assert.ok(jsContent.includes('Clinical Stability & Primary Consultant Sign-off'), 'Clearance step 1 missing');
  assert.ok(jsContent.includes('Medication Reconciliation & Pharmacy Clearance'), 'Clearance step 2 missing');
  assert.ok(jsContent.includes('Billing, Insurance & TPA Approval'), 'Clearance step 3 missing');
  assert.ok(jsContent.includes('Final Inpatient Discharge Summary Generated'), 'Clearance step 4 missing');
  assert.ok(jsContent.includes('FORMALLY DISCHARGED • HOME CARE TRANSITION'), 'Discharge status badge missing');
});

runTest('patientDashboard.js: renders episode context banner with admission/discharge times', () => {
  assert.ok(jsContent.includes('Apex Care Medical Center'), 'Hospital name missing');
  assert.ok(jsContent.includes('General Medicine Ward (Bed GEN-01)') || jsContent.includes('Bed GEN-01'), 'Ward/bed missing');
  assert.ok(jsContent.includes('Oct 24, 2026, 10:15 AM'), 'Admission date missing');
  assert.ok(jsContent.includes('Oct 29, 2026, 02:30 PM'), 'Discharge date missing');
  assert.ok(jsContent.includes('Dr. Arjun Verma, MD (Internal Medicine)'), 'Attending physician missing');
  assert.ok(jsContent.includes('I21.9 - Acute Myocardial Infarction / Unspecified') || jsContent.includes('I21.9'), 'ICD-10 tag missing');
});

runTest('patientDashboard.js: renders Cards A, B, C, D with all required clinical sections', () => {
  assert.ok(jsContent.includes('Card A: Clinical Hospital Course &amp; Treatment Summary'), 'Card A header missing');
  assert.ok(jsContent.includes('Card B: Discharge Medication Reconciliation (To Take at Home)'), 'Card B header missing');
  assert.ok(jsContent.includes('Card C: Recovery Instructions, Diet &amp; Red-Flag Warnings'), 'Card C header missing');
  assert.ok(jsContent.includes('Card D: Post-Discharge Outpatient Follow-Up Pathway'), 'Card D header missing');
  assert.ok(jsContent.includes('Critical Safety Alert: Discontinued Home Medications'), 'Discontinued alert missing');
  assert.ok(jsContent.includes('Emergency Red-Flag Warning Signs'), 'Red flag alert missing');
  assert.ok(jsContent.includes('Add to Google Calendar (.ics)'), 'Calendar button missing');
});

// -----------------------------------------------------------------------------
// 3. Verifying CSS Stylesheet (css/styles.css)
// -----------------------------------------------------------------------------
const cssPath = path.join(__dirname, '../css/styles.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

runTest('css/styles.css: contains discharge pathway component classes', () => {
  const classes = [
    '.discharge-pathway-container',
    '.discharge-header-toolbar',
    '.discharge-status-pill-emerald',
    '.discharge-stepper-panel',
    '.discharge-stepper-grid',
    '.discharge-step-card-v2',
    '.discharge-episode-banner-v2',
    '.discharge-nav-tabs',
    '.discharge-card',
    '.discharge-vitals-matrix-4col',
    '.discharge-table',
    '.discharge-discontinued-alert',
    '.discharge-red-flag-card',
    '.btn-emergency-speeddial',
    '.discharge-followup-banner'
  ];
  classes.forEach(cls => {
    assert.ok(cssContent.includes(cls), `CSS must define ${cls}`);
  });
});

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
if (passedTests === totalTests) {
  console.log('ALL VERIFICATION CHECKS PASSED SUCCESSFULLY (100% PASS)');
} else {
  console.error(`FAILED ${totalTests - passedTests} CHECKS`);
  process.exit(1);
}
console.log('================================================================\n');

