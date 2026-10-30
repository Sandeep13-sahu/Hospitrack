const fs = require('fs');
const path = require('path');
const vm = require('vm');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('=== TEST SUITE: HOSPITAL-GRADE PRINT ARCHITECTURE & LAB MODAL DOSSIER ===\n');

// 1. Static File Verification
const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const stylesCss = fs.readFileSync(path.join(__dirname, '../css/styles.css'), 'utf8');
const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
const patientDashboardJs = fs.readFileSync(path.join(__dirname, '../js/components/patientDashboard.js'), 'utf8');

console.log('--- 1. Verifying HTML & DOM Containers ---');
assert(indexHtml.includes('id="printable-medical-record"'), 'index.html contains isolated printable container #printable-medical-record');
assert(indexHtml.includes('class="printable-document-container"'), 'index.html has printable-document-container class');
assert(indexHtml.includes('id="hospitrackPrintArea"'), 'index.html retains #hospitrackPrintArea for legacy compatibility');

console.log('\n--- 2. Verifying CSS Print Architecture & Page Setup ---');
assert(stylesCss.includes('size: A4 portrait'), 'CSS defines A4 portrait sheet');
assert(stylesCss.includes('margin: 12mm 14mm'), 'CSS specifies exact 12mm 14mm clinical margins');
assert(stylesCss.includes('@media print'), 'CSS contains @media print rules');
assert(stylesCss.includes('#printable-medical-record'), 'Print styles target #printable-medical-record');
assert(stylesCss.includes('break-inside: avoid !important') || stylesCss.includes('page-break-inside: avoid !important'), 'Print CSS enforces break-inside protection');
assert(stylesCss.includes('.lab-modal-dossier'), 'CSS contains styling for .lab-modal-dossier');
assert(stylesCss.includes('.lab-status-emerald'), 'CSS contains styling for deep emerald status pill');
assert(stylesCss.includes('.print-emergency-redflag'), 'CSS contains styling for .print-emergency-redflag');

console.log('\n--- 3. Verifying On-Screen Lab Modal UI (openLabReportModal) ---');
assert(patientDashboardJs.includes('lab-modal-header-strip'), 'Lab modal contains institutional header strip');
assert(patientDashboardJs.includes('NABL ISO 15189:2022 Accredited'), 'Lab modal displays NABL ISO 15189 accreditation badge');
assert(patientDashboardJs.includes('NABH Certified Clinical Laboratory'), 'Lab modal displays NABH certified badge');
assert(patientDashboardJs.includes('FINAL CERTIFIED'), 'Lab modal displays FINAL CERTIFIED deep emerald status pill');
assert(patientDashboardJs.includes('PATIENT DEMOGRAPHICS &amp; IDENTIFICATION'), 'Lab modal displays structured patient demographics section');
assert(patientDashboardJs.includes('SPECIMEN CUSTODY &amp; CLINICIAN DETAILS'), 'Lab modal displays specimen custody and clinician details');
assert(patientDashboardJs.includes('Dr. Sarah Sharma'), 'Lab modal references Ordering Physician Dr. Sarah Sharma');
assert(patientDashboardJs.includes('Dr. Vikram Malhotra'), 'Lab modal references Signing Pathologist Dr. Vikram Malhotra');
assert(patientDashboardJs.includes('INVESTIGATION / PARAMETER'), 'Lab modal findings table has INVESTIGATION / PARAMETER header');
assert(patientDashboardJs.includes('OBSERVED VALUE (UNITS)'), 'Lab modal findings table has OBSERVED VALUE (UNITS) header');
assert(patientDashboardJs.includes('REFERENCE INTERVAL'), 'Lab modal findings table has REFERENCE INTERVAL header');
assert(patientDashboardJs.includes('FLAG / INTERPRETATION'), 'Lab modal findings table has FLAG / INTERPRETATION header');
assert(patientDashboardJs.includes('METHODOLOGY'), 'Lab modal findings table has METHODOLOGY header');
assert(patientDashboardJs.includes('CRITICAL HIGH') && patientDashboardJs.includes('Normal'), 'Lab modal findings table contains CRITICAL HIGH and Normal flags');
assert(patientDashboardJs.includes('*** END OF EXAMINATION REPORT ***'), 'Lab modal opinion box includes *** END OF EXAMINATION REPORT ***');
assert(patientDashboardJs.includes('Print Certified Report'), 'Lab modal action footer includes Print Certified Report button');
assert(patientDashboardJs.includes('Download Clinical PDF'), 'Lab modal action footer includes Download Clinical PDF button');
assert(patientDashboardJs.includes('closeModal(\'reportDetailModal\')'), 'Lab modal action footer includes Close action');

console.log('\n--- 4. Setting Up VM Runtime to Execute Print Engine ---');
const domMock = {
  elementMap: {},
  createElement(tag) {
    const el = {
      tagName: tag.toUpperCase(),
      id: '',
      className: '',
      innerHTML: '',
      style: {},
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false
      },
      appendChild: (c) => c
    };
    return el;
  },
  getElementById(id) {
    if (!domMock.elementMap[id]) {
      domMock.elementMap[id] = domMock.createElement('div');
      domMock.elementMap[id].id = id;
    }
    return domMock.elementMap[id];
  }
};

const sandbox = {
  window: {},
  document: {
    createElement: (tag) => domMock.createElement(tag),
    getElementById: (id) => domMock.getElementById(id),
    addEventListener: () => {},
    removeEventListener: () => {},
    body: {
      classList: {
        add: (cls) => {},
        remove: (cls) => {}
      },
      appendChild: (child) => child
    }
  },
  location: { hostname: 'localhost', origin: 'http://localhost:8000', hash: '' },
  localStorage: {
    data: {},
    getItem(k) { return this.data[k] || null; },
    setItem(k, v) { this.data[k] = String(v); },
    removeItem(k) { delete this.data[k]; }
  },
  navigator: { userAgent: 'NodeTest' },
  addEventListener: () => {},
  removeEventListener: () => {},
  print: () => {},
  setTimeout: (fn, ms) => {
    // Execute print trigger synchronously, but do not execute post-print cleanup immediately so assertions can inspect HTML
    if (ms <= 150) fn();
  },
  console: console
};
sandbox.window = sandbox;

// Run app.js inside sandbox
vm.createContext(sandbox);
vm.runInContext(appJs, sandbox);

assert(typeof sandbox.window.hospitrackPrintDocument === 'function', 'window.hospitrackPrintDocument is exported function');
assert(typeof sandbox.window.downloadClinicalPdf === 'function', 'window.downloadClinicalPdf is exported function');
assert(typeof sandbox.window.printPrescription === 'function', 'window.printPrescription is exported function');
assert(typeof sandbox.window.printLabReport === 'function', 'window.printLabReport is exported function');
assert(typeof sandbox.window.printDischargeSummary === 'function', 'window.printDischargeSummary is exported function');

console.log('\n--- 5. Executing Template A: Certified Laboratory Diagnostic Report ---');
sandbox.window.printLabReport('LAB-301');
const labContainer = sandbox.document.getElementById('printable-medical-record');
const labHtml = labContainer.innerHTML;

assert(labHtml.includes('CITY GENERAL HOSPITAL &amp; RESEARCH INSTITUTE'), 'Template A includes CITY GENERAL HOSPITAL & RESEARCH INSTITUTE');
assert(labHtml.includes('DEPARTMENT OF CLINICAL PATHOLOGY &amp; BIOCHEMISTRY'), 'Template A includes DEPARTMENT OF CLINICAL PATHOLOGY & BIOCHEMISTRY');
assert(labHtml.includes('NABL Accredited Medical Testing Laboratory (Certificate No: MC-2026/088)'), 'Template A includes NABL Certificate No: MC-2026/088');
assert(labHtml.includes('NABH Certified (ISO 15189:2022)'), 'Template A includes NABH Certified (ISO 15189:2022)');
assert(labHtml.includes('PATIENT DEMOGRAPHICS &amp; IDENTIFICATION'), 'Template A includes Demographics & Identification');
assert(labHtml.includes('SAMPLE CUSTODY &amp; CLINICAL REQUISITION'), 'Template A includes Sample Custody & Requisition');
assert(labHtml.includes('Dr. Sarah Sharma'), 'Template A includes Referring Doctor Dr. Sarah Sharma');
assert(labHtml.includes('TEST NAME') && labHtml.includes('RESULT') && labHtml.includes('UNITS') && labHtml.includes('BIOLOGICAL REF INTERVAL') && labHtml.includes('METHOD'), 'Template A includes exact 5 diagnostic investigation columns');
assert(labHtml.includes('Clinical Methodology Note:') && labHtml.includes('Chemiluminescent Immunoassay'), 'Template A includes explicit clinical methodology notes');
assert(labHtml.includes('Medical Laboratory Technologist (MLT)'), 'Template A includes MLT left signature');
assert(labHtml.includes('Dr. Vikram Malhotra, MD (Pathology) - Reg. No: MCI-54219, Consultant Pathologist'), 'Template A includes Dr. Vikram Malhotra right signature');
assert(labHtml.includes('Laboratory results should be correlated clinically with patient findings. A certified digital copy verified through Hospitrack.'), 'Template A includes official disclaimer notice');
assert(labHtml.includes('*** END OF EXAMINATION REPORT ***') && labHtml.includes('*** END OF CLINICAL DIAGNOSTIC REPORT ***'), 'Template A includes end-of-report markers');

console.log('\n--- 6. Executing Template B: Official Prescription Slip (Print Rx) ---');
sandbox.window.printPrescription('RX-301');
const rxContainer = sandbox.document.getElementById('printable-medical-record');
const rxHtml = rxContainer.innerHTML;

assert(rxHtml.includes('Dr. Sarah Sharma, MD (Cardiology)'), 'Template B includes Dr. Sarah Sharma, MD (Cardiology)');
assert(rxHtml.includes('MCI-99401'), 'Template B includes Medical Registration No: MCI-99401');
assert(rxHtml.includes('OPD Hours: Mon-Fri: 09:00 AM - 01:00 PM | Sat: 09:00 AM - 12:00 PM'), 'Template B includes OPD timings');
assert(rxHtml.includes('Department of Cardiology, Main Block - Level 3, 100 Health Way'), 'Template B includes Hospital Address');
assert(rxHtml.includes('1800-419-8800'), 'Template B includes Emergency Triage Hotline');
assert(rxHtml.includes('BP:') && rxHtml.includes('120/76 mmHg') && rxHtml.includes('72 bpm') && rxHtml.includes('74 kg'), 'Template B patient bar includes clinical vitals (BP: 120/76 mmHg, Pulse: 72 bpm, Weight: 74 kg)');
assert(rxHtml.includes('℞'), 'Template B includes prominent Latin Rx ℞ symbol');
assert(rxHtml.includes('Tab. Rosuvastatin 20mg') || rxHtml.includes('Rosuvastatin'), 'Template B medication grid contains Rosuvastatin');
assert(rxHtml.includes('Tab. Aspirin 75mg') || rxHtml.includes('Aspirin'), 'Template B medication grid contains Aspirin');
assert(rxHtml.includes('Dietary &amp; Lifestyle Recommendations:'), 'Template B includes dietary and lifestyle recommendations');
assert(rxHtml.includes('NEXT APPOINTMENT / REVIEW DATE:'), 'Template B includes review date');

console.log('\n--- 7. Executing Template C: Discharge / Longitudinal Clinical Summary ---');
sandbox.window.printDischargeSummary('PAT-301');
const dischargeContainer = sandbox.document.getElementById('printable-medical-record');
const dischargeHtml = dischargeContainer.innerHTML;

assert(dischargeHtml.includes('INPATIENT CLINICAL DISCHARGE &amp; CARE CONTINUITY SUMMARY'), 'Template C title is INPATIENT CLINICAL DISCHARGE & CARE CONTINUITY SUMMARY');
assert(dischargeHtml.includes('Oct 24, 2026, 06:45 AM') && dischargeHtml.includes('Oct 28, 2026, 11:30 AM'), 'Template C includes Admission & Discharge timestamps');
assert(dischargeHtml.includes('I20.0'), 'Template C includes ICD-10 Code I20.0');
assert(dischargeHtml.includes('Percutaneous Coronary Intervention (PCI) with Drug-Eluting Stent (DES) to proximal LAD'), 'Template C includes procedures performed');
assert(dischargeHtml.includes('Hemodynamically stable, ambulatory'), 'Template C includes discharge condition');
assert(dischargeHtml.includes('Tab. Rosuvastatin 20mg') && dischargeHtml.includes('Tab. Ticagrelor 90mg'), 'Template C includes discharge medications table');
assert(dischargeHtml.includes('RED-FLAG EMERGENCY SYMPTOMS REQUIRING IMMEDIATE HOSPITAL VISIT'), 'Template C includes red-flag warning banner');
assert(dischargeHtml.includes('1800-419-8800'), 'Template C includes 24/7 immediate triage hotline');
assert(dischargeHtml.includes('Dr. Sarah Sharma, MD (Cardiology)') && dischargeHtml.includes('MCI-99401'), 'Template C includes Attending Cardiologist signature block');

console.log(`\n============================================================`);
console.log(`FINAL RESULTS: ${passed} passed, ${failed} failed.`);
console.log(`============================================================`);

if (failed > 0) process.exit(1);
