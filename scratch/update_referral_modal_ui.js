const fs = require('fs');
const path = require('path');

// 1. Update js/components/doctorDashboard.js
const docDashPath = path.resolve(__dirname, '../js/components/doctorDashboard.js');
let docContent = fs.readFileSync(docDashPath, 'utf8');

// Replace openCreateReferralModal body definition
const startMarker = "window.openCreateReferralModal = function (defaultPatientId = null) {";
const endMarker = "window.filterReferralPatients = function (query) {";

const startIndex = docContent.indexOf(startMarker);
const endIndex = docContent.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error("Markers not found in doctorDashboard.js!");
  process.exit(1);
}

const newOpenModalCode = `window.openCreateReferralModal = function (defaultPatientId = null) {
  const modalContainer = document.getElementById('globalModalContainer');
  if (!modalContainer) return;

  const store = window.hospitrackStore || {};
  const user = window.hospitrackAuth ? window.hospitrackAuth.getCurrentUser() : null;
  const hospitalId = user?.hospitalId || user?.hospital?.id || (user?.role === 'HOSPITAL' || user?.role === 'HOSPITAL_ADMIN' ? user.id : 'HOSP-101');
  
  let patients = (typeof store.getPatients === 'function' ? store.getPatients(hospitalId) : []);
  if (!patients || patients.length === 0) {
    patients = (typeof store.getPatients === 'function' ? store.getPatients() : []);
  }

  // Ensure comprehensive patient registry including Ananya Iyer (PAT-303), Rajesh Kumar (PAT-302), etc.
  const knownPatients = [
    { id: 'PAT-303', name: 'Ananya Iyer', age: 31, gender: 'Female', bloodGroup: 'A+', diagnosis: 'Mitral Valve Prolapse / Arrhythmia Evaluation' },
    { id: 'PAT-302', name: 'Rajesh Kumar', age: 58, gender: 'Male', bloodGroup: 'B+', diagnosis: 'Acute Coronary Syndrome — Unstable Angina' },
    { id: 'PAT-301', name: 'John Doe', age: 42, gender: 'Male', bloodGroup: 'O+', diagnosis: 'Type 2 Diabetes Mellitus — Follow-up' },
    { id: 'PAT-300', name: 'Rahul Sharma', age: 45, gender: 'Male', bloodGroup: 'A+', diagnosis: 'Essential Hypertension Stage II' }
  ];
  knownPatients.forEach(kp => {
    const existing = patients.find(p => p.id === kp.id);
    if (!existing) {
      patients.push(kp);
    } else {
      if (!existing.diagnosis && kp.diagnosis) existing.diagnosis = kp.diagnosis;
      if (!existing.bloodGroup && kp.bloodGroup) existing.bloodGroup = kp.bloodGroup;
      if (!existing.age && kp.age) existing.age = kp.age;
      if (!existing.gender && kp.gender) existing.gender = kp.gender;
    }
  });

  // Store for runtime combobox filtering
  window._referralPatientList = patients;

  // Complete accredited network facilities
  const allNetworkHospitals = [
    { id: 'HOSP-101', name: 'City General Hospital', code: 'CGH', location: 'Central Healthcare District', availableBeds: 12 },
    { id: 'HOSP-102', name: 'Apex Care Medical Center', code: 'ACMC', location: 'Metro West District', availableBeds: 4 },
    { id: 'HOSP-103', name: 'Metro Emergency Hospital', code: 'MEH', location: 'Downtown Medical Campus', availableBeds: 8 }
  ];

  let hospitals = typeof store.getHospitals === 'function' ? store.getHospitals() : [];
  if (!hospitals || hospitals.length === 0) {
    hospitals = allNetworkHospitals;
  } else {
    // Merge known details
    allNetworkHospitals.forEach(anh => {
      const existing = hospitals.find(h => h.id === anh.id);
      if (!existing) {
        hospitals.push(anh);
      } else {
        if (!existing.availableBeds) existing.availableBeds = anh.availableBeds;
        if (!existing.code) existing.code = anh.code;
      }
    });
  }

  // Pre-select patient (default to active patient, or fallback to Ananya Iyer PAT-303)
  const cleanDefaultId = window.extractCleanPatientId(defaultPatientId || (doctorActiveTab === 'workspace' && selectedPatientId ? selectedPatientId : null) || 'PAT-303');
  const selectedPatient = cleanDefaultId ? patients.find(p => p.id === cleanDefaultId) : (patients.length > 0 ? patients[0] : null);

  // Filter destination facilities: offer partner accredited hospitals
  const myHospitalId = user?.hospitalId || user?.hospital?.id || 'HOSP-101';
  const partnerHospitals = hospitals.filter(h => h.id !== myHospitalId);
  const selectableHospitals = partnerHospitals.length > 0 ? partnerHospitals : hospitals;

  modalContainer.innerHTML = \`
    <div id="createReferralModal" class="modal-overlay open" role="dialog" aria-modal="true" aria-labelledby="createReferralModalTitle">
      <div class="modal-box referral-modal-box">
        <!-- 1. Executive Context Header Strip (Sticky Top) -->
        <div class="referral-context-banner">
          <div class="referral-banner-top">
            <div>
              <h3 class="referral-banner-title" id="createReferralModalTitle">
                <svg class="lucide lucide-send" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                Create Clinical Specialist Referral
              </h3>
              <p class="referral-banner-sub">Direct Inter-Facility Clinical Handover &amp; Priority Specialist Triage</p>
            </div>
            <button type="button" class="modal-close" style="color: #94A3B8; font-size: 1.25rem;" onclick="closeGlobalModal('createReferralModal'); resetReferralForm();" aria-label="Close modal">✕</button>
          </div>
        </div>

        <!-- 2. Form Wrapper (Encloses Form Body + Dedicated Sticky Footer) -->
        <form id="clinicalReferralForm" onsubmit="handleReferralSubmit(event)" class="referral-form-wrap" novalidate>
          <!-- Form Body (Cleanly Arranged & Proportioned) -->
          <div class="referral-modal-body">
            <!-- 1. Patient Context Strip / Selector (Always Prominent & at Top) -->
            <div class="form-group mb-4">
              <div class="field-header-row">
                <label class="form-label mb-0" for="refPatientSearch">
                  <span class="form-section-title">Patient Identification</span> <span class="text-danger">*</span>
                </label>
                <span class="text-xs-muted">Verified Inpatient Registry</span>
              </div>

              <!-- Hidden input maintaining clean unique ID (PAT-303) -->
              <input type="hidden" id="refPatientId" name="patientId" value="\${selectedPatient ? selectedPatient.id : ''}">
              <select id="refPatientSelect" name="refPatientSelect" style="display:none;" aria-hidden="true">
                <option value="">Select a patient...</option>
                \${patients.map(p => \`
                  <option value="\${p.id}" \${selectedPatient && selectedPatient.id === p.id ? 'selected' : ''}>
                    \${escapeHtml(p.name)} (\${p.id}) \${p.age ? \`• \${p.age}y \${p.gender || ''}\` : ''}
                  </option>
                \`).join('')}
              </select>

              <!-- Inline Patient Summary Pill (When patient is selected) -->
              <div id="refPatientSummaryCard" class="patient-summary-pill-card \${selectedPatient ? '' : 'hidden'}">
                <div class="patient-summary-left">
                  <div class="patient-avatar-mini" id="refSummaryAvatar">
                    \${selectedPatient ? (selectedPatient.name || 'PT').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'PT'}
                  </div>
                  <div class="patient-summary-info">
                    <div class="patient-summary-name">
                      <span id="refSummaryName">\${selectedPatient ? escapeHtml(selectedPatient.name) : ''}</span>
                      <span class="patient-id-badge" id="refSummaryIdBadge">\${selectedPatient ? selectedPatient.id : ''}</span>
                      <span class="patient-summary-badge" id="refSummaryDiagnosis">
                        \${selectedPatient ? escapeHtml(selectedPatient.diagnosis || 'Active Inpatient') : ''}
                      </span>
                    </div>
                    <div class="patient-summary-demographics" id="refSummaryDemographics">
                      \${selectedPatient ? \`\${selectedPatient.age || 31}y \${selectedPatient.gender || 'Female'} • Blood Group: \${selectedPatient.bloodGroup || 'A+'} • MRN: \${selectedPatient.id}\` : ''}
                    </div>
                  </div>
                </div>
                <button type="button" class="btn-change-patient" onclick="clearReferralPatient()" title="Select a different patient">
                  Change Patient
                </button>
              </div>

              <!-- Searchable Combobox Input (When no patient is selected) -->
              <div id="refPatientCombobox" class="patient-combobox-wrap \${selectedPatient ? 'hidden' : ''}">
                <div class="patient-search-input-wrap">
                  <span class="patient-search-icon" aria-hidden="true">
                    <svg class="lucide lucide-search" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="2" x2="16.65" y2="16.65"></line></svg>
                  </span>
                  <input type="text" id="refPatientSearch" class="patient-search-input" placeholder="Search patient by name (e.g. Ananya Iyer, Rajesh Kumar) or ID (PAT-303)..." autocomplete="off" oninput="filterReferralPatients(this.value)" onfocus="filterReferralPatients(this.value)">
                </div>
                <div id="refPatientDropdown" class="patient-autocomplete-list hidden">
                  \${patients.map(p => {
                    const initials = (p.name || 'PT').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    const diag = p.diagnosis || 'Clinical Care';
                    return \`
                      <div class="patient-autocomplete-item" onclick="selectReferralPatient('\${p.id}')">
                        <div class="patient-autocomplete-left">
                          <div class="patient-avatar-mini">\${initials}</div>
                          <div>
                            <div style="font-size: 0.88rem; font-weight: 700; color: #0F172A;">\${escapeHtml(p.name)} <span style="font-weight: 500; color: #64748B;">(\${p.id})</span></div>
                            <div style="font-size: 0.75rem; color: #64748B;">\${p.age ? \`\${p.age}y \${p.gender || ''}\` : ''} \${p.bloodGroup ? \`• Blood: \${p.bloodGroup}\` : ''} • \${diag}</div>
                          </div>
                        </div>
                        <span style="font-size: 0.72rem; font-weight: 600; color: #0D9488;">Select →</span>
                      </div>
                    \`;
                  }).join('')}
                </div>
              </div>

              <!-- Field-Specific Inline Error -->
              <div id="refPatientError" class="field-error-msg hidden" role="alert">
                <svg class="lucide lucide-alert-circle" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <span>Please select a valid patient from the accredited registry.</span>
              </div>
            </div>

            <!-- 2. Destination Facility & Receiving Specialty (2-Column Grid) -->
            <div class="referral-grid-2col mb-4">
              <div class="form-group mb-0">
                <label class="form-label mb-4" for="refDestHospital">
                  <span class="form-section-title">Destination Facility</span> <span class="text-danger">*</span>
                </label>
                <select id="refDestHospital" class="form-control" onchange="clearReferralFieldError('refFacilityError', this)" required>
                  \${selectableHospitals.map((h, idx) => \`
                    <option value="\${h.id}" data-facility-name="\${escapeHtml(h.name)}" title="\${escapeHtml(h.name)} (\${h.availableBeds != null ? h.availableBeds : 0} beds available)" \${idx === 0 ? 'selected' : ''}>
                      \${escapeHtml(h.name)} (\${h.availableBeds != null ? \`\${h.availableBeds} beds free\` : 'Accredited'})
                    </option>
                  \`).join('')}
                </select>
                <!-- Field-Specific Inline Error -->
                <div id="refFacilityError" class="field-error-msg hidden" role="alert">
                  <svg class="lucide lucide-alert-circle" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  <span>Please select a receiving destination facility.</span>
                </div>
              </div>

              <div class="form-group mb-0">
                <label class="form-label mb-4" for="refSpecialty">
                  <span class="form-section-title">Receiving Specialty</span> <span class="text-danger">*</span>
                </label>
                <select id="refSpecialty" class="form-control" required>
                  <option value="Cardiology & Interventional Cath" selected>Cardiology &amp; Interventional Cath</option>
                  <option value="Neurology & Stroke Care">Neurology &amp; Stroke Care</option>
                  <option value="Nephrology & Dialysis">Nephrology &amp; Dialysis</option>
                  <option value="Pulmonology & Respiratory Care">Pulmonology &amp; Respiratory Care</option>
                  <option value="Orthopedics & Joint Surgery">Orthopedics &amp; Joint Surgery</option>
                  <option value="General & Laparoscopic Surgery">General &amp; Laparoscopic Surgery</option>
                  <option value="Critical Care / Intensive Care (ICU)">Critical Care / Intensive Care (ICU)</option>
                  <option value="Medical & Surgical Oncology">Medical &amp; Surgical Oncology</option>
                </select>
              </div>
            </div>

            <!-- 3. Clinical Priority Triage (3-Button Segmented Control) -->
            <div class="form-group mb-4">
              <label class="form-label mb-4">
                <span class="form-section-title">Clinical Priority Triage</span> <span class="text-danger">*</span>
              </label>
              <input type="hidden" id="refPriority" value="ROUTINE">
              <div class="priority-pill-group" role="radiogroup" aria-label="Clinical Priority">
                <button type="button" id="btnPriorityRoutine" class="priority-pill-btn active priority-routine" onclick="setReferralPriority('ROUTINE')" role="radio" aria-checked="true">
                  <span class="priority-dot routine"></span>
                  <span>Routine</span>
                </button>
                <button type="button" id="btnPriorityUrgent" class="priority-pill-btn priority-urgent" onclick="setReferralPriority('URGENT')" role="radio" aria-checked="false">
                  <span class="priority-dot urgent"></span>
                  <span>Urgent (&lt; 48h)</span>
                </button>
                <button type="button" id="btnPriorityEmergency" class="priority-pill-btn priority-emergency" onclick="setReferralPriority('EMERGENCY')" role="radio" aria-checked="false">
                  <span class="priority-dot emergency"></span>
                  <span>STAT / Emergency</span>
                </button>
              </div>
            </div>

            <!-- 4. Referral Reason / Indication with Dynamic Character Counter -->
            <div class="form-group mb-4">
              <div class="field-header-row">
                <label class="form-label mb-0" for="refReason">
                  <span class="form-section-title">Referral Reason &amp; Clinical Indication</span> <span class="text-danger">*</span>
                </label>
                <span id="refReasonCount" class="char-counter">0 / 500</span>
              </div>
              <textarea id="refReason" class="form-control" rows="2" maxlength="500" style="height: 54px; min-height: 54px; max-height: 76px; resize: none;" placeholder="Reason for specialist consultation, chief complaints, diagnostic suspicion, and provisional diagnosis..." oninput="handleReferralReasonChange(this)" onkeyup="handleReferralReasonChange(this)" onchange="handleReferralReasonChange(this)" required></textarea>
              <!-- Field-Specific Inline Error -->
              <div id="refReasonError" class="field-error-msg hidden" role="alert">
                <svg class="lucide lucide-alert-circle" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <span>Please specify the clinical indication / reason for this specialist referral.</span>
              </div>
            </div>

            <!-- 5. Additional Notes & Directives with Dynamic Character Counter (Optional) -->
            <div class="form-group mb-0">
              <div class="field-header-row">
                <label class="form-label mb-0" for="refNotes">
                  <span class="form-section-title">Additional Notes &amp; Clinical Directives</span>
                </label>
                <span id="refNotesCount" class="char-counter">0 / 500</span>
              </div>
              <textarea id="refNotes" class="form-control" rows="2" maxlength="500" style="height: 50px; min-height: 50px; max-height: 70px; resize: none;" placeholder="Relevant vitals, active drug allergies, immediate telemetry requirements, or transport logistics notes (optional)..." oninput="handleReferralNotesChange(this)" onkeyup="handleReferralNotesChange(this)" onchange="handleReferralNotesChange(this)"></textarea>
            </div>
          </div>

          <!-- 3. Dedicated Sticky Footer (Always Visible, Zero Truncation) -->
          <div class="referral-modal-footer">
            <div class="referral-footer-left">
              <button type="button" class="btn btn-secondary btn-sm" onclick="closeGlobalModal('createReferralModal'); resetReferralForm();">
                Cancel
              </button>
              <button type="button" class="btn btn-secondary btn-sm" style="border-color: #CBD5E1; color: #475569;" onclick="resetReferralForm()" title="Clear form inputs and reset errors">
                Reset Form
              </button>
            </div>
            <div class="referral-footer-right">
              <button type="button" class="btn btn-secondary btn-sm btn-referral-preview" onclick="handlePreviewReferralLetter()" title="Preview Official Referral Slip & Print Form">
                <svg class="lucide lucide-file-text" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                <span>Preview Letter</span>
              </button>
              <button type="submit" id="refDispatchBtn" class="btn btn-primary btn-dispatch-referral">
                <svg class="lucide lucide-send" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                <span>Dispatch Referral</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  \`;

  // Always enforce reset scroll position to top
  setTimeout(() => {
    try {
      const modalBody = (modalContainer && typeof modalContainer.querySelector === 'function')
        ? modalContainer.querySelector('.referral-modal-body')
        : (typeof document !== 'undefined' && typeof document.querySelector === 'function' ? document.querySelector('.referral-modal-body') : null);
      if (modalBody) modalBody.scrollTop = 0;
    } catch (_) {}
  }, 10);

  // Close dropdown on outside click
  document.addEventListener('click', function onDocClick(e) {
    const combobox = document.getElementById('refPatientCombobox');
    const dropdown = document.getElementById('refPatientDropdown');
    if (!dropdown) {
      document.removeEventListener('click', onDocClick);
      return;
    }
    if (combobox && !combobox.contains(e.target)) {
      dropdown?.classList?.add?.('hidden');
    }
  });
};

`;

docContent = docContent.substring(0, startIndex) + newOpenModalCode + docContent.substring(endIndex);

// Also harden handleReferralSubmit in doctorDashboard.js
docContent = docContent.replace(
  `  if (!patientId) {
    if (patientErr) patientErr?.classList?.remove?.('hidden');
    if (searchInput) searchInput?.classList?.add?.('input-error');
    hasError = true;
  }`,
  `  if (!patientId) {
    if (patientErr) patientErr?.classList?.remove?.('hidden');
    if (searchInput) searchInput?.classList?.add?.('input-error');
    const mBody = document.querySelector('.referral-modal-body');
    if (mBody) mBody.scrollTop = 0;
    hasError = true;
  }`
);

fs.writeFileSync(docDashPath, docContent, 'utf8');
console.log('✓ Successfully updated doctorDashboard.js');

// 2. Update css/styles.css
const cssPath = path.resolve(__dirname, '../css/styles.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

// Replace referral modal styles
const cssTarget = `/* ==========================================================================
   CLINICAL REFERRAL DISPATCH PANEL & PRIORITY TRIAGE CONTROLS (EXECUTIVE REDESIGN)
   ========================================================================== */
.modal-box.referral-modal-box,
.referral-modal-box {
  width: min(760px, 96vw) !important;
  max-width: 760px !important;
  max-height: 90vh !important;
  display: flex !important;
  flex-direction: column !important;
  border-radius: 14px !important;
  overflow: hidden !important;
  background: #FFFFFF !important;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.28), 0 0 0 1px rgba(15, 23, 42, 0.08) !important;
}`;

const cssReplacement = `/* ==========================================================================
   CLINICAL REFERRAL DISPATCH PANEL & PRIORITY TRIAGE CONTROLS (EXECUTIVE REDESIGN)
   ========================================================================== */
.modal-box.referral-modal-box,
.referral-modal-box {
  width: min(800px, 96vw) !important;
  max-width: 800px !important;
  max-height: 92vh !important;
  display: flex !important;
  flex-direction: column !important;
  border-radius: 16px !important;
  overflow: hidden !important;
  background: #FFFFFF !important;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.28), 0 0 0 1px rgba(15, 23, 42, 0.08) !important;
}

.referral-grid-2col {
  display: grid !important;
  grid-template-columns: 1fr 1fr !important;
  gap: 14px !important;
}`;

if (cssContent.includes(cssTarget)) {
  cssContent = cssContent.replace(cssTarget, cssReplacement);
} else {
  console.log('CSS target not exact match, using fallback replacement for referral-modal-box');
  cssContent = cssContent.replace(
    /width: min\(760px, 96vw\) !important;\s*max-width: 760px !important;/,
    `width: min(800px, 96vw) !important;\n  max-width: 800px !important;`
  );
  if (!cssContent.includes('.referral-grid-2col')) {
    cssContent = cssContent.replace(
      `.referral-form-wrap {`,
      `.referral-grid-2col {\n  display: grid !important;\n  grid-template-columns: 1fr 1fr !important;\n  gap: 14px !important;\n}\n\n.referral-form-wrap {`
    );
  }
}

// Ensure referral-modal-footer has nowrap
cssContent = cssContent.replace(
  `.referral-modal-footer,
.referral-actions-bar {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 10px !important;
  padding: 12px 20px !important;
  background: #F8FAFC !important;
  border-top: 1px solid #E2E8F0 !important;
  flex-shrink: 0 !important;
  z-index: 10 !important;
  margin-top: 0 !important;
  flex-wrap: wrap !important;
  box-sizing: border-box !important;
}`,
  `.referral-modal-footer,
.referral-actions-bar {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 12px !important;
  padding: 12px 22px !important;
  background: #F8FAFC !important;
  border-top: 1px solid #E2E8F0 !important;
  flex-shrink: 0 !important;
  z-index: 10 !important;
  margin-top: 0 !important;
  flex-wrap: nowrap !important;
  box-sizing: border-box !important;
}`
);

fs.writeFileSync(cssPath, cssContent, 'utf8');
console.log('✓ Successfully updated css/styles.css');

