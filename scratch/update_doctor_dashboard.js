const fs = require('fs');
const path = 'js/components/doctorDashboard.js';
let content = fs.readFileSync(path, 'utf8');

// 1. In renderPatientOverviewTab: Add telemetry extraction
const target1 = `  const emergencyName = patient.emergencyContactName || 'Karthik Iyer';
  const emergencyRelation = patient.emergencyContactRelation || 'Husband';
  const emergencyPhone = patient.emergencyContactPhone || '+91 98111 99993';
  const emergencyPhoneClean = emergencyPhone.replace(/[^0-9+]/g, '');`;

const repl1 = `  const emergencyName = patient.emergencyContactName || 'Emergency Contact';
  const emergencyRelation = patient.emergencyContactRelation || '';
  const emergencyPhone = patient.emergencyContactPhone || patient.emergencyContact || '—';
  const emergencyPhoneClean = emergencyPhone.replace(/[^0-9+]/g, '');

  // Extract real triage telemetry values
  const bpSystolic = patient.bloodPressureSystolic != null ? patient.bloodPressureSystolic : (patient.bloodPressure && String(patient.bloodPressure).includes('/') ? parseInt(String(patient.bloodPressure).split('/')[0]) : null);
  const bpDiastolic = patient.bloodPressureDiastolic != null ? patient.bloodPressureDiastolic : (patient.bloodPressure && String(patient.bloodPressure).includes('/') ? parseInt(String(patient.bloodPressure).split('/')[1]) : null);
  const bpFormatted = (bpSystolic != null && bpDiastolic != null) ? (bpSystolic + '/' + bpDiastolic) : (patient.bloodPressure || null);
  const hr = patient.heartRate != null ? patient.heartRate : (patient.pulse != null ? patient.pulse : null);
  const spo2 = patient.oxygenSaturation != null ? patient.oxygenSaturation : (patient.spO2 != null ? patient.spO2 : (patient.spo2 != null ? patient.spo2 : null));
  const temp = patient.bodyTemperature != null ? patient.bodyTemperature : (patient.temperature != null ? patient.temperature : null);
  const rhythmNotes = patient.rhythmNotes || null;
  const triageRecordedAt = patient.triageRecordedAt ? new Date(patient.triageRecordedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : null;
  const triageRecordedBy = patient.triageRecordedBy || null;

  const hasTriageVitals = Boolean(bpFormatted || hr != null || spo2 != null || temp != null);`;

if (!content.includes(target1.replace(/\n/g, '\r\n')) && !content.includes(target1)) {
  console.error('Target 1 not found!');
  process.exit(1);
}
content = content.replace(content.includes(target1.replace(/\n/g, '\r\n')) ? target1.replace(/\n/g, '\r\n') : target1, repl1);

// 2. Replace hardcoded address in doctorDashboard
content = content.replace(
  "${escapeHtml(patient.address || '42-B, Indiranagar 1st Stage, Bengaluru, KA - 560038')}",
  "${escapeHtml(patient.address || '—')}"
);

// 3. Replace the 4-card telemetry grid in doctorDashboard.js
const targetGrid = `      <!-- 2. Baseline Vitals Telemetry Grid -->
      <div class="telemetry-vitals-card">
        <div class="telemetry-card-header">
          <div>
            <h4 style="margin: 0; font-size: 0.95rem; font-weight: 800; color: #0F172A; display: flex; align-items: center; gap: 6px;">
              <span>💓</span> Baseline Vitals &amp; Telemetry Grid
            </h4>
            <span style="font-size: 0.72rem; color: #64748B;">Continuous clinical observation recorded during intake triage</span>
          </div>
          <span class="badge badge-subtle font-xs">Clinical Intake Telemetry</span>
        </div>

        <!-- 4 interactive telemetry metric widgets -->
        <div class="telemetry-grid-4col">
          <!-- Blood Pressure -->
          <div class="telemetry-metric-widget">
            <div class="telemetry-widget-top">
              <span>Blood Pressure</span>
              <span class="status-tag-pill normal">Normal</span>
            </div>
            <div class="telemetry-widget-main">
              <span class="telemetry-value-lg text-doctor">120/80</span>
              <span class="telemetry-unit">mmHg</span>
            </div>
            <div class="telemetry-widget-sub">
              <span class="live-dot-pulse" style="width: 5px; height: 5px; background: #10B981;"></span>
              <span>Systolic: 120 / Diastolic: 80</span>
            </div>
          </div>

          <!-- Heart Rate -->
          <div class="telemetry-metric-widget">
            <div class="telemetry-widget-top">
              <span>Heart Rate</span>
              <span>💓</span>
            </div>
            <div class="telemetry-widget-main">
              <span class="telemetry-value-lg text-primary">74</span>
              <span class="telemetry-unit">bpm</span>
            </div>
            <div class="telemetry-widget-sub">
              <span class="live-dot-pulse" style="width: 5px; height: 5px; background: #0D9488;"></span>
              <span>Resting Sinus Rhythm</span>
            </div>
          </div>

          <!-- Oxygen Saturation -->
          <div class="telemetry-metric-widget">
            <div class="telemetry-widget-top">
              <span>Oxygen Saturation</span>
              <span>🫁</span>
            </div>
            <div class="telemetry-widget-main">
              <span class="telemetry-value-lg text-success">99%</span>
              <span class="telemetry-unit">SpO2</span>
            </div>
            <div class="telemetry-widget-sub">
              <span class="live-dot-pulse" style="width: 5px; height: 5px; background: #10B981;"></span>
              <span>Room Air (Atmospheric)</span>
            </div>
          </div>

          <!-- Body Temperature -->
          <div class="telemetry-metric-widget">
            <div class="telemetry-widget-top">
              <span>Body Temperature</span>
              <span>🌡️</span>
            </div>
            <div class="telemetry-widget-main">
              <span class="telemetry-value-lg">98.6°</span>
              <span class="telemetry-unit">F</span>
            </div>
            <div class="telemetry-widget-sub">
              <span class="status-tag-pill normal">Normal</span>
              <span>Afebrile</span>
            </div>
          </div>
        </div>

        <!-- Dedicated "Clinical Intake & Allergy Alert" bar -->
        <div class="clinical-intake-bar">
          <div class="chief-complaint-box">
            <div class="chief-complaint-label">CHIEF CLINICAL PRESENTATION / INTAKE COMPLAINT</div>
            <blockquote class="chief-complaint-quote">
              &ldquo;\${escapeHtml(patient.chiefComplaint || 'Episodes of atypical chest discomfort radiating to left shoulder on exertion, accompanied by episodic palpitations and mild fatigue.')}&rdquo;
            </blockquote>
          </div>`;

const replGrid = `      <!-- 2. Baseline Vitals Telemetry Grid -->
      <div class="telemetry-vitals-card">
        <div class="telemetry-card-header">
          <div>
            <h4 style="margin: 0; font-size: 0.95rem; font-weight: 800; color: #0F172A; display: flex; align-items: center; gap: 6px;">
              <span>💓</span> Baseline Vitals &amp; Telemetry Grid
            </h4>
            <span style="font-size: 0.72rem; color: #64748B;">Continuous clinical observation recorded during intake triage</span>
          </div>
          \${hasTriageVitals ? \`
            <span class="badge badge-subtle font-xs" style="color: #059669; background: #ECFDF5; border: 1px solid #A7F3D0; font-weight: 700;">
              ✓ Intake Triage Recorded\${triageRecordedAt ? ' • ' + triageRecordedAt : ''}\${triageRecordedBy ? ' (' + triageRecordedBy + ')' : ''}
            </span>
          \` : \`
            <span class="badge badge-subtle font-xs" style="color: #64748B; background: #F8FAFC; border: 1px solid #CBD5E1; font-weight: 700;">
              Awaiting Triage Telemetry
            </span>
          \`}
        </div>

        <!-- 4 interactive telemetry metric widgets -->
        <div class="telemetry-grid-4col">
          <!-- Blood Pressure -->
          <div class="telemetry-metric-widget">
            <div class="telemetry-widget-top">
              <span>Blood Pressure</span>
              \${bpFormatted ? (
                bpSystolic >= 140 || bpDiastolic >= 90
                  ? '<span class="status-tag-pill warning" style="background:#FEF3C7;color:#B45309;">Elevated</span>'
                  : (bpSystolic < 90 || bpDiastolic < 60
                      ? '<span class="status-tag-pill warning" style="background:#FEF3C7;color:#B45309;">Low</span>'
                      : '<span class="status-tag-pill normal">Recorded</span>')
              ) : '<span class="status-tag-pill" style="background: #F1F5F9; color: #64748B;">Awaiting Triage</span>'}
            </div>
            <div class="telemetry-widget-main">
              \${bpFormatted ? \`
                <span class="telemetry-value-lg text-doctor">\${escapeHtml(bpFormatted)}</span>
                <span class="telemetry-unit">mmHg</span>
              \` : \`
                <span class="telemetry-value-lg" style="color: #94A3B8;">— / —</span>
                <span class="telemetry-unit">mmHg</span>
              \`}
            </div>
            <div class="telemetry-widget-sub">
              \${bpFormatted ? \`
                <span class="live-dot-pulse" style="width: 5px; height: 5px; background: #10B981;"></span>
                <span>Systolic: \${bpSystolic != null ? bpSystolic : '—'} / Diastolic: \${bpDiastolic != null ? bpDiastolic : '—'}</span>
              \` : \`
                <span style="color: #94A3B8; font-size: 0.72rem;">Unmeasured at intake</span>
              \`}
            </div>
          </div>

          <!-- Heart Rate -->
          <div class="telemetry-metric-widget">
            <div class="telemetry-widget-top">
              <span>Heart Rate</span>
              \${hr != null ? (
                hr > 100
                  ? '<span class="status-tag-pill warning" style="background:#FEF3C7;color:#B45309;">Tachycardia</span>'
                  : (hr < 60
                      ? '<span class="status-tag-pill warning" style="background:#FEF3C7;color:#B45309;">Bradycardia</span>'
                      : '<span class="status-tag-pill normal">Normal Rhythm</span>')
              ) : '<span class="status-tag-pill" style="background: #F1F5F9; color: #64748B;">Awaiting Triage</span>'}
            </div>
            <div class="telemetry-widget-main">
              \${hr != null ? \`
                <span class="telemetry-value-lg text-primary">\${hr}</span>
                <span class="telemetry-unit">bpm</span>
              \` : \`
                <span class="telemetry-value-lg" style="color: #94A3B8;">—</span>
                <span class="telemetry-unit">bpm</span>
              \`}
            </div>
            <div class="telemetry-widget-sub">
              \${hr != null ? \`
                <span class="live-dot-pulse" style="width: 5px; height: 5px; background: #0D9488;"></span>
                <span>\${escapeHtml(rhythmNotes || 'Resting Sinus Rhythm')}</span>
              \` : \`
                <span style="color: #94A3B8; font-size: 0.72rem;">Unmeasured</span>
              \`}
            </div>
          </div>

          <!-- Oxygen Saturation -->
          <div class="telemetry-metric-widget">
            <div class="telemetry-widget-top">
              <span>Oxygen Saturation</span>
              \${spo2 != null ? (
                spo2 < 95
                  ? '<span class="status-tag-pill danger" style="background:#FEE2E2;color:#DC2626;">Hypoxic Risk</span>'
                  : '<span class="status-tag-pill normal">Adequate</span>'
              ) : '<span class="status-tag-pill" style="background: #F1F5F9; color: #64748B;">Awaiting Triage</span>'}
            </div>
            <div class="telemetry-widget-main">
              \${spo2 != null ? \`
                <span class="telemetry-value-lg text-success">\${spo2}%</span>
                <span class="telemetry-unit">SpO2</span>
              \` : \`
                <span class="telemetry-value-lg" style="color: #94A3B8;">— %</span>
                <span class="telemetry-unit">SpO2</span>
              \`}
            </div>
            <div class="telemetry-widget-sub">
              \${spo2 != null ? \`
                <span class="live-dot-pulse" style="width: 5px; height: 5px; background: #10B981;"></span>
                <span>Room Air (Atmospheric)</span>
              \` : \`
                <span style="color: #94A3B8; font-size: 0.72rem;">Unmeasured</span>
              \`}
            </div>
          </div>

          <!-- Body Temperature -->
          <div class="telemetry-metric-widget">
            <div class="telemetry-widget-top">
              <span>Body Temperature</span>
              \${temp != null ? (
                temp >= 100.4
                  ? '<span class="status-tag-pill danger" style="background:#FEE2E2;color:#DC2626;">Fever</span>'
                  : '<span class="status-tag-pill normal">Afebrile</span>'
              ) : '<span class="status-tag-pill" style="background: #F1F5F9; color: #64748B;">Awaiting Triage</span>'}
            </div>
            <div class="telemetry-widget-main">
              \${temp != null ? \`
                <span class="telemetry-value-lg">\${temp}°</span>
                <span class="telemetry-unit">F</span>
              \` : \`
                <span class="telemetry-value-lg" style="color: #94A3B8;">— °</span>
                <span class="telemetry-unit">F</span>
              \`}
            </div>
            <div class="telemetry-widget-sub">
              \${temp != null ? \`
                <span class="status-tag-pill \${temp >= 100.4 ? 'danger' : 'normal'}">\${temp >= 100.4 ? 'Febrile' : 'Normal'}</span>
                <span>\${temp >= 100.4 ? 'Elevated' : 'Afebrile'}</span>
              \` : \`
                <span style="color: #94A3B8; font-size: 0.72rem;">Unmeasured</span>
              \`}
            </div>
          </div>
        </div>

        <!-- Dedicated "Clinical Intake & Allergy Alert" bar -->
        <div class="clinical-intake-bar">
          <div class="chief-complaint-box">
            <div class="chief-complaint-label">CHIEF CLINICAL PRESENTATION / INTAKE COMPLAINT</div>
            <blockquote class="chief-complaint-quote">
              &ldquo;\${escapeHtml(patient.chiefComplaint || 'No chief complaint recorded at intake triage.')}&rdquo;
            </blockquote>
          </div>`;

if (!content.includes(targetGrid.replace(/\n/g, '\r\n')) && !content.includes(targetGrid)) {
  console.error('Target Grid not found!');
  process.exit(1);
}
content = content.replace(content.includes(targetGrid.replace(/\n/g, '\r\n')) ? targetGrid.replace(/\n/g, '\r\n') : targetGrid, replGrid);

// 4. Update renderQueueFilterTabs to include "My Assigned Patients" tab pill
const targetTabs = `function renderQueueFilterTabs(allPatients) {
  const allCount = allPatients.length;`;
const replTabs = `function renderQueueFilterTabs(allPatients) {
  const currentDocId = window.hospitrackAuth?.getCurrentUser()?.doctorId;
  const myAssignedCount = allPatients.filter(p => currentDocId && (p.assignedDoctorId === currentDocId || p.primaryDoctorId === currentDocId)).length;
  const allCount = allPatients.length;`;

content = content.replace(content.includes(targetTabs.replace(/\n/g, '\r\n')) ? targetTabs.replace(/\n/g, '\r\n') : targetTabs, replTabs);

const targetPills = `    <div class="queue-filter-pills">
      <button type="button" class="btn-filter-pill \${queueFilterStatus === 'ALL' ? 'active' : ''}" onclick="filterClinicalQueue('ALL')">
        All (\${allCount})
      </button>`;
const replPills = `    <div class="queue-filter-pills">
      <button type="button" class="btn-filter-pill \${queueFilterStatus === 'MY_PATIENTS' ? 'active' : ''}" onclick="filterClinicalQueue('MY_PATIENTS')">
        My Assigned (\${myAssignedCount})
      </button>
      <button type="button" class="btn-filter-pill \${queueFilterStatus === 'ALL' ? 'active' : ''}" onclick="filterClinicalQueue('ALL')">
        All (\${allCount})
      </button>`;

content = content.replace(content.includes(targetPills.replace(/\n/g, '\r\n')) ? targetPills.replace(/\n/g, '\r\n') : targetPills, replPills);

// 5. Update renderClinicalQueueTable for MY_PATIENTS and Assigned to You badge
const targetFilter = `  if (queueFilterStatus !== 'ALL') {
    if (queueFilterStatus === 'WAITING') {`;
const replFilter = `  if (queueFilterStatus !== 'ALL') {
    if (queueFilterStatus === 'MY_PATIENTS') {
      const currentDocId = window.hospitrackAuth?.getCurrentUser()?.doctorId;
      filtered = filtered.filter(p => currentDocId && (p.assignedDoctorId === currentDocId || p.primaryDoctorId === currentDocId));
    } else if (queueFilterStatus === 'WAITING') {`;

content = content.replace(content.includes(targetFilter.replace(/\n/g, '\r\n')) ? targetFilter.replace(/\n/g, '\r\n') : targetFilter, replFilter);

// In queue rows: add Assigned to You badge
const targetRowName = `                  <div class="patient-cell-name">
                    <strong>\${escapeHtml(p.name)}</strong>
                    <span class="patient-id-tag">\${escapeHtml(p.id)}</span>
                  </div>`;
const replRowName = `                  <div class="patient-cell-name">
                    <strong>\${escapeHtml(p.name)}</strong>
                    <span class="patient-id-tag">\${escapeHtml(p.id)}</span>
                    \${(function() {
                      const curDoc = window.hospitrackAuth?.getCurrentUser()?.doctorId;
                      if (curDoc && (p.assignedDoctorId === curDoc || p.primaryDoctorId === curDoc)) {
                        return '<span class="badge badge-success font-xs" style="background:#10B981;color:#fff;font-size:0.65rem;padding:2px 6px;border-radius:4px;margin-left:6px;">Assigned to You</span>';
                      }
                      return '';
                    })()}
                  </div>`;

content = content.replace(content.includes(targetRowName.replace(/\n/g, '\r\n')) ? targetRowName.replace(/\n/g, '\r\n') : targetRowName, replRowName);

// 6. Fix handleAddDrugSubmit: eliminate synthetic defaults
const targetSubmitDrug = `  const name = document.getElementById('addDrugSearchInput')?.value?.trim();
  const dosage = document.getElementById('addDrugDosage')?.value?.trim() || '500mg';
  const form = document.getElementById('addDrugFormType')?.value || 'Tablet';
  const freq = document.getElementById('addDrugFrequency')?.value || 'Twice Daily [BD]';
  const route = document.getElementById('addDrugRoute')?.value || 'Oral';
  const timing = document.getElementById('addDrugTiming')?.value || 'After Meals';
  const durationDays = document.getElementById('addDrugDuration')?.value || '5';`;

const replSubmitDrug = `  const name = document.getElementById('addDrugSearchInput')?.value?.trim();
  const dosage = document.getElementById('addDrugDosage')?.value?.trim();
  const form = document.getElementById('addDrugFormType')?.value || 'Tablet';
  const freq = document.getElementById('addDrugFrequency')?.value || 'Twice Daily [BD]';
  const route = document.getElementById('addDrugRoute')?.value || 'Oral';
  const timing = document.getElementById('addDrugTiming')?.value || 'After Meals';
  const durationDays = document.getElementById('addDrugDuration')?.value?.trim();

  if (!name) {
    alert('Please enter or select a valid drug name.');
    return;
  }
  if (!dosage) {
    alert('Please specify the medication dosage (e.g. 500mg, 10ml, etc.).');
    return;
  }
  if (!durationDays || parseInt(durationDays) <= 0) {
    alert('Please specify a valid duration in days (minimum 1 day).');
    return;
  }`;

content = content.replace(content.includes(targetSubmitDrug.replace(/\n/g, '\r\n')) ? targetSubmitDrug.replace(/\n/g, '\r\n') : targetSubmitDrug, replSubmitDrug);

// 7. Fix dischargeVitals hardcoded value (line 4537)
content = content.replace(
  'value="BP: 120/80 mmHg, HR: 74 bpm, SpO2: 98%"',
  'value=""'
);

// 8. Fix phone fallback (line 4105)
content = content.replace(
  "${escapeHtml(patient.phone || '+91 98765 43210')}",
  "${escapeHtml(patient.phone || patient.contact || '—')}"
);

fs.writeFileSync(path, content, 'utf8');
console.log('doctorDashboard.js updated successfully!');

