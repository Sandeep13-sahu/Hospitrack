const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'components', 'doctorDashboard.js');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Decouple getPatientActiveMedications from PAT-303
const targetMeds = `function getPatientActiveMedications(patientId, defaultRx) {
  if (window.__patientClinicalChartState[patientId]?.medications) {
    return window.__patientClinicalChartState[patientId].medications;
  }
  let meds = [];
  if (defaultRx && defaultRx.items && defaultRx.items.length > 0) {
    meds = defaultRx.items.map((m, idx) => ({
      id: \`MED-INIT-\${idx}\`,
      name: m.name,
      dosage: m.dosage || '500mg',
      form: m.form || 'Tablet',
      frequency: m.frequency || 'Twice Daily [BD]',
      scheduleTag: m.scheduleTag || (m.frequency ? \`\${m.frequency} • After Meals\` : '1 - 0 - 1 • After Meals'),
      route: m.route || 'Oral',
      timing: m.timing || 'After Meals',
      duration: m.duration || '7 days',
      prescribedAt: defaultRx.prescribedAt ? new Date(defaultRx.prescribedAt).toLocaleDateString('en-GB') : '28-Oct-2026, 10:30 AM',
      prescribedBy: defaultRx.doctorName || 'Dr. Arjun Verma',
      status: 'ACTIVE'
    }));
  } else if (patientId === 'PAT-303') {
    meds = [
      {
        id: 'MED-303-1',
        name: 'Metoprolol Succinate',
        dosage: '25mg',
        form: 'Tablet',
        frequency: 'Twice Daily [BD]',
        scheduleTag: '1 - 0 - 1 • After Meals',
        route: 'Oral',
        timing: 'After Meals',
        duration: '14 days',
        prescribedAt: '28-Oct-2026, 10:30 AM',
        prescribedBy: 'Dr. Arjun Verma',
        status: 'ACTIVE'
      },
      {
        id: 'MED-303-2',
        name: 'Pantoprazole Sodium',
        dosage: '40mg',
        form: 'Tablet',
        frequency: 'Once Daily [OD]',
        scheduleTag: '1 - 0 - 0 • Before Breakfast',
        route: 'Oral',
        timing: 'Before Meals',
        duration: '7 days',
        prescribedAt: '28-Oct-2026, 10:30 AM',
        prescribedBy: 'Dr. Arjun Verma',
        status: 'ACTIVE'
      }
    ];
  }
  window.__patientClinicalChartState[patientId] = window.__patientClinicalChartState[patientId] || {};
  window.__patientClinicalChartState[patientId].medications = meds;
  return meds;
}`;

const replaceMeds = `function getPatientActiveMedications(patientId, defaultRx) {
  if (window.__patientClinicalChartState[patientId]?.medications) {
    return window.__patientClinicalChartState[patientId].medications;
  }
  let meds = [];
  const store = window.hospitrackStore;
  const patientRxList = (store && typeof store.getPrescriptions === 'function')
    ? store.getPrescriptions(patientId)
    : [];
  const sourceRx = defaultRx || (patientRxList && patientRxList.length > 0 ? patientRxList[0] : null);
  if (sourceRx && sourceRx.items && sourceRx.items.length > 0) {
    meds = sourceRx.items.map((m, idx) => ({
      id: m.id || \`MED-INIT-\${idx}\`,
      name: m.name,
      dosage: m.dosage || '',
      form: m.form || 'Tablet',
      frequency: m.frequency || '',
      scheduleTag: m.scheduleTag || (m.frequency ? \`\${m.frequency} • \${m.timing || 'After Meals'}\` : ''),
      route: m.route || 'Oral',
      timing: m.timing || 'After Meals',
      duration: m.duration || '',
      prescribedAt: sourceRx.prescribedAt ? new Date(sourceRx.prescribedAt).toLocaleDateString('en-GB') : '',
      prescribedBy: sourceRx.doctorName || 'Attending Physician',
      status: 'ACTIVE'
    }));
  }
  window.__patientClinicalChartState[patientId] = window.__patientClinicalChartState[patientId] || {};
  window.__patientClinicalChartState[patientId].medications = meds;
  return meds;
}`;

// 2. Decouple getPatientActiveLabOrders from PAT-303
const targetLabs = `function getPatientActiveLabOrders(patientId, defaultLabs) {
  if (window.__patientClinicalChartState[patientId]?.labOrders) {
    return window.__patientClinicalChartState[patientId].labOrders;
  }
  let orders = [];
  if (defaultLabs && defaultLabs.length > 0) {
    orders = defaultLabs.map(l => ({
      id: l.id,
      testName: l.testName,
      category: l.category || 'Diagnostic Pathology',
      orderedAt: l.timestamp ? new Date(l.timestamp).toLocaleDateString('en-GB') : '28-Oct-2026, 09:15 AM',
      orderedBy: l.doctorName || 'Dr. Arjun Verma',
      status: l.status || 'SAMPLE_COLLECTED',
      resultSummary: l.resultSummary || 'Requisition active in laboratory.'
    }));
  } else if (patientId === 'PAT-303') {
    orders = [
      {
        id: 'LAB-901',
        testName: 'Complete Blood Count (CBC) with Automated Differential',
        category: 'Diagnostic Hematology',
        orderedAt: '28-Oct-2026, 09:15 AM',
        orderedBy: 'Dr. Arjun Verma',
        status: 'PROCESSING_IN_LAB',
        resultSummary: 'Specimen barcoded and incubated in automated flow cytometer.'
      },
      {
        id: 'LAB-902',
        testName: 'High-Sensitivity Cardiac Troponin-I (hs-cTnI)',
        category: 'Cardiac Telemetry Biomarker',
        orderedAt: '28-Oct-2026, 09:15 AM',
        orderedBy: 'Dr. Arjun Verma',
        status: 'SAMPLE_COLLECTED',
        resultSummary: 'Venous blood serum collected via phlebotomy; routed to clinical pathology.'
      }
    ];
  }
  window.__patientClinicalChartState[patientId] = window.__patientClinicalChartState[patientId] || {};
  window.__patientClinicalChartState[patientId].labOrders = orders;
  return orders;
}`;

const replaceLabs = `function getPatientActiveLabOrders(patientId, defaultLabs) {
  if (window.__patientClinicalChartState[patientId]?.labOrders) {
    return window.__patientClinicalChartState[patientId].labOrders;
  }
  let orders = [];
  const store = window.hospitrackStore;
  const patientLabs = (store && typeof store.getLabs === 'function')
    ? store.getLabs(null, patientId)
    : [];
  const sourceLabs = (defaultLabs && defaultLabs.length > 0) ? defaultLabs : patientLabs;
  if (sourceLabs && sourceLabs.length > 0) {
    orders = sourceLabs.map(l => ({
      id: l.id,
      testName: l.testName,
      category: l.category || 'Diagnostic Pathology',
      orderedAt: l.timestamp ? new Date(l.timestamp).toLocaleDateString('en-GB') : (l.orderedAt || ''),
      orderedBy: l.doctorName || 'Attending Physician',
      status: l.status || 'SAMPLE_COLLECTED',
      resultSummary: l.resultSummary || 'Requisition active in laboratory.'
    }));
  }
  window.__patientClinicalChartState[patientId] = window.__patientClinicalChartState[patientId] || {};
  window.__patientClinicalChartState[patientId].labOrders = orders;
  return orders;
}`;

// Normalize line endings for replacement
const normalize = s => s.replace(/\r\n/g, '\n');
let normCode = normalize(code);

if (normCode.includes(normalize(targetMeds))) {
  normCode = normCode.replace(normalize(targetMeds), normalize(replaceMeds));
  console.log('[OK] Replaced getPatientActiveMedications');
} else {
  console.error('[ERROR] targetMeds not found');
}

if (normCode.includes(normalize(targetLabs))) {
  normCode = normCode.replace(normalize(targetLabs), normalize(replaceLabs));
  console.log('[OK] Replaced getPatientActiveLabOrders');
} else {
  console.error('[ERROR] targetLabs not found');
}

// 3. Clean openAddDrugModal defaults
const targetAddDrugInit = `  const initialDrug = editMed ? editMed.name : '';
  const initialDosage = editMed ? editMed.dosage : '500mg';
  const initialForm = editMed ? (editMed.form || 'Tablet') : 'Tablet';
  const initialFreq = editMed ? (editMed.frequency || 'Twice Daily [BD]') : 'Twice Daily [BD]';
  const initialRoute = editMed ? (editMed.route || 'Oral') : 'Oral';
  const initialTiming = editMed ? (editMed.timing || 'After Meals') : 'After Meals';
  const initialDuration = editMed ? (parseInt(editMed.duration) || 5) : 5;
  const initialNotes = editMed ? (editMed.instructions || '') : '';`;

const replaceAddDrugInit = `  const initialDrug = editMed ? editMed.name : '';
  const initialDosage = editMed ? editMed.dosage : '';
  const initialForm = editMed ? (editMed.form || 'Tablet') : 'Tablet';
  const initialFreq = editMed ? (editMed.frequency || '') : '';
  const initialRoute = editMed ? (editMed.route || 'Oral') : 'Oral';
  const initialTiming = editMed ? (editMed.timing || '') : '';
  const initialDuration = editMed ? (parseInt(editMed.duration) || '') : '';
  const initialNotes = editMed ? (editMed.instructions || '') : '';`;

if (normCode.includes(normalize(targetAddDrugInit))) {
  normCode = normCode.replace(normalize(targetAddDrugInit), normalize(replaceAddDrugInit));
  console.log('[OK] Replaced initial addDrugModal values');
} else {
  console.error('[ERROR] targetAddDrugInit not found');
}

// 4. Clean addDrugDuration input
const targetDurationInput = `<input type="number" id="addDrugDuration" class="form-control" style="width: 80px; text-align: center; font-weight: 800;" value="\${initialDuration}" min="1" max="90">`;
const replaceDurationInput = `<input type="number" id="addDrugDuration" class="form-control" style="width: 80px; text-align: center; font-weight: 800;" value="\${initialDuration}" placeholder="5" min="1" max="90">`;

if (normCode.includes(normalize(targetDurationInput))) {
  normCode = normCode.replace(normalize(targetDurationInput), normalize(replaceDurationInput));
  console.log('[OK] Replaced duration input in addDrugModal');
}

// 5. Clean currentPrescriptionRows initial state
const targetRxRows = `let currentPrescriptionRows = [
  { name: 'Metoprolol', dosage: '25 mg', frequency: '2× daily', duration: '7 days', instructions: 'Take with food' }
];`;

const replaceRxRows = `let currentPrescriptionRows = [
  { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
];`;

if (normCode.includes(normalize(targetRxRows))) {
  normCode = normCode.replace(normalize(targetRxRows), normalize(replaceRxRows));
  console.log('[OK] Replaced currentPrescriptionRows initial state');
} else {
  console.error('[ERROR] targetRxRows not found');
}

// 6. Clean reset after order submit
const targetRxReset = `    currentPrescriptionRows = [
      { name: 'Metoprolol', dosage: '25 mg', frequency: '2× daily', duration: '7 days', instructions: 'Take with food' }
    ];`;

const replaceRxReset = `    currentPrescriptionRows = [
      { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ];`;

if (normCode.includes(normalize(targetRxReset))) {
  normCode = normCode.replace(normalize(targetRxReset), normalize(replaceRxReset));
  console.log('[OK] Replaced currentPrescriptionRows reset state');
} else {
  console.error('[ERROR] targetRxReset not found');
}

// 7. Clean pre-filled consultation vitals
const targetConsultVitals = `<div class="form-group">
              <label class="form-label" for="vitalBP">Blood Pressure (mmHg)</label>
              <input type="text" id="vitalBP" class="form-control" placeholder="120/80" value="120/80">
            </div>
            <div class="form-group">
              <label class="form-label" for="vitalHR">Pulse / HR (bpm)</label>
              <input type="text" id="vitalHR" class="form-control" placeholder="72" value="74">
            </div>
            <div class="form-group">
              <label class="form-label" for="vitalSpO2">SpO2 (%)</label>
              <input type="text" id="vitalSpO2" class="form-control" placeholder="98" value="99">
            </div>
            <div class="form-group">
              <label class="form-label" for="vitalTemp">Temperature (°F)</label>
              <input type="text" id="vitalTemp" class="form-control" placeholder="98.6" value="98.6">
            </div>`;

const replaceConsultVitals = `<div class="form-group">
              <label class="form-label" for="vitalBP">Blood Pressure (mmHg)</label>
              <input type="text" id="vitalBP" class="form-control" placeholder="e.g. 120/80" value="\${escapeHtml(patient.bloodPressure || patient.bp || '')}">
            </div>
            <div class="form-group">
              <label class="form-label" for="vitalHR">Pulse / HR (bpm)</label>
              <input type="text" id="vitalHR" class="form-control" placeholder="e.g. 72" value="\${escapeHtml(patient.heartRate || '')}">
            </div>
            <div class="form-group">
              <label class="form-label" for="vitalSpO2">SpO2 (%)</label>
              <input type="text" id="vitalSpO2" class="form-control" placeholder="e.g. 98" value="\${escapeHtml(patient.spO2 || patient.oxygenSaturation || '')}">
            </div>
            <div class="form-group">
              <label class="form-label" for="vitalTemp">Temperature (°F)</label>
              <input type="text" id="vitalTemp" class="form-control" placeholder="e.g. 98.6" value="\${escapeHtml(patient.temperature || '')}">
            </div>`;

if (normCode.includes(normalize(targetConsultVitals))) {
  normCode = normCode.replace(normalize(targetConsultVitals), normalize(replaceConsultVitals));
  console.log('[OK] Replaced consultation pre-filled vitals');
} else {
  console.error('[ERROR] targetConsultVitals not found');
}

// 8. Define window.openDirectPrescriptionModal if not present
if (!normCode.includes('window.openDirectPrescriptionModal =')) {
  normCode += `\n\n// Global shortcut to open direct prescription workspace
window.openDirectPrescriptionModal = function (patientId) {
  if (typeof window.openClinicalWorkspace === 'function') {
    window.openClinicalWorkspace(patientId, 'prescription');
  } else if (typeof window.openPatientWorkspace === 'function') {
    window.openPatientWorkspace(patientId, 'prescriptions');
  }
};\n`;
  console.log('[OK] Added window.openDirectPrescriptionModal');
}

// Write back in CRLF format
fs.writeFileSync(filePath, normCode.replace(/\n/g, '\r\n'), 'utf8');
console.log('Successfully updated doctorDashboard.js');

