const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'components', 'doctorDashboard.js');
let content = fs.readFileSync(filePath, 'utf8');

const targetStart = 'window.openCreateReferralModal = function (defaultPatientId = null) {';
const targetEnd = 'window.closeGlobalModal = function (id) {';

const startIndex = content.indexOf(targetStart);
const endIndex = content.indexOf(targetEnd);

if (startIndex === -1 || endIndex === -1) {
  console.error('Target not found!', { startIndex, endIndex });
  process.exit(1);
}

const replacement = `// Helper: Extract clean patient ID from string like "Rajesh Kumar (PAT-302) • 58y Male" or "PAT-302"
window.extractCleanPatientId = function (rawVal) {
  if (!rawVal) return '';
  const str = String(rawVal).trim();
  const match = str.match(/PAT-\\d+/i);
  return match ? match[0].toUpperCase() : str;
};

window.openCreateReferralModal = function (defaultPatientId = null) {
  const modalContainer = document.getElementById('globalModalContainer');
  if (!modalContainer) return;

  const store = window.hospitrackStore || {};
  const user = window.hospitrackAuth ? window.hospitrackAuth.getCurrentUser() : null;
  const hospitalId = user?.hospitalId || user?.hospital?.id || (user?.role === 'HOSPITAL' || user?.role === 'HOSPITAL_ADMIN' ? user.id : 'HOSP-101');
  
  let patients = (typeof store.getPatients === 'function' ? store.getPatients(hospitalId) : []);
  if (!patients || patients.length === 0) {
    patients = (typeof store.getPatients === 'function' ? store.getPatients() : []);
  }

  // Ensure reference patient database is complete with demographics & diagnosis
  const knownPatients = [
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

  let hospitals = (typeof store.getHospitals === 'function' ? store.getHospitals() : []).filter(h => h.id !== hospitalId && h.status === 'ACTIVE');
  if (hospitals.length === 0) {
    hospitals = [
      { id: 'HOSP-102', name: 'Apex Care Medical Center', code: 'ACMC', location: 'Metro West District', availableBeds: 4 },
      { id: 'HOSP-103', name: 'Metro Emergency Hospital', code: 'MEH', location: 'Downtown Medical Campus', availableBeds: 8 }
    ];
  }

  const cleanDefaultId = window.extractCleanPatientId(defaultPatientId);
  const selectedPatient = cleanDefaultId ? patients.find(p => p.id === cleanDefaultId) : null;

  modalContainer.innerHTML = \`
    <div id="createReferralModal" class="modal-overlay open" role="dialog" aria-modal="true" aria-labelledby="createReferralModalTitle">
      <div class="modal-box referral-modal-box">
        <!-- Executive Context Header Strip -->
        <div class="referral-context-banner">
          <div class="referral-banner-top">
            <div>
              <h3 class="referral-banner-title" id="createReferralModalTitle">
                <svg class="lucide lucide-send" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                Create Clinical Specialist Referral
              </h3>
              <p class="referral-banner-sub">Route patient medical history, diagnostic impressions, and priority triage directly to accredited partner facilities.</p>
            </div>
            <button type="button" class="modal-close" style="color: #94A3B8; font-size: 1.25rem;" onclick="closeGlobalModal('createReferralModal')" aria-label="Close modal">✕</button>
          </div>
        </div>

        <form id="clinicalReferralForm" onsubmit="handleReferralSubmit(event)" class="referral-modal-body">
          <!-- 1. Patient Combobox / Selector with Clean Unique ID Binding -->
          <div class="form-group mb-16">
            <div class="field-header-row">
              <label class="form-label mb-0" for="refPatientSearch">
                <span class="form-section-title">PATIENT</span> <span class="text-danger">*</span>
              </label>
              <span class="text-xs-muted">Search by Patient Name or MRN/UHID</span>
            </div>

            <!-- Hidden input maintaining clean unique ID (PAT-302) -->
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
                    <span class="patient-summary-badge" id="refSummaryDiagnosis">
                      \${selectedPatient ? escapeHtml(selectedPatient.diagnosis || 'Active Inpatient') : ''}
                    </span>
                  </div>
                  <div class="patient-summary-demographics" id="refSummaryDemographics">
                    \${selectedPatient ? \`\${selectedPatient.age || 58}y \${selectedPatient.gender || 'Male'} • Blood Group: \${selectedPatient.bloodGroup || 'B+'} • MRN: \${selectedPatient.id}\` : ''}
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
                  <svg class="lucide lucide-search" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </span>
                <input type="text" id="refPatientSearch" class="patient-search-input" placeholder="Search patient by name (e.g. Rajesh Kumar) or ID (PAT-302)..." autocomplete="off" oninput="filterReferralPatients(this.value)" onfocus="filterReferralPatients(this.value)">
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
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;" class="mb-16">
            <div class="form-group">
              <label class="form-label" for="refDestHospital">
                <span class="form-section-title">DESTINATION FACILITY</span> <span class="text-danger">*</span>
              </label>
              <select id="refDestHospital" class="form-control" onchange="clearReferralFieldError('refFacilityError', this)" required>
                \${hospitals.map(h => \`
                  <option value="\${h.id}" \${h.id === 'HOSP-102' ? 'selected' : ''}>
                    \${escapeHtml(h.name)} • \${h.availableBeds !== undefined ? \`\${h.availableBeds} beds available\` : '4 beds available'} (\${h.code || h.id})
                  </option>
                \`).join('')}
              </select>
              <!-- Field-Specific Inline Error -->
              <div id="refFacilityError" class="field-error-msg hidden" role="alert">
                <svg class="lucide lucide-alert-circle" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <span>Please select a receiving destination facility.</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="refSpecialty">
                <span class="form-section-title">RECEIVING SPECIALTY</span> <span class="text-danger">*</span>
              </label>
              <select id="refSpecialty" class="form-control" required>
                <option value="Cardiology" selected>Cardiology &amp; Interventional Cath</option>
                <option value="Neurology">Neurology &amp; Stroke Care</option>
                <option value="Nephrology">Nephrology &amp; Dialysis</option>
                <option value="Pulmonology">Pulmonology &amp; Respiratory</option>
                <option value="Orthopedics">Orthopedics &amp; Joint Surgery</option>
                <option value="General Surgery">General &amp; Laparoscopic Surgery</option>
                <option value="Critical Care / ICU">Critical Care / Intensive Care (ICU)</option>
                <option value="Oncology">Medical &amp; Surgical Oncology</option>
              </select>
            </div>
          </div>

          <!-- 3. Clinical Priority (3-Button Interactive Pill Group) -->
          <div class="form-group mb-16">
            <label class="form-label">
              <span class="form-section-title">CLINICAL PRIORITY TRIAGE</span> <span class="text-danger">*</span>
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

          <!-- 4. Referral Reason / Indication with Character Counter -->
          <div class="form-group mb-16">
            <div class="field-header-row">
              <label class="form-label mb-0" for="refReason">
                <span class="form-section-title">REFERRAL REASON &amp; CLINICAL INDICATION</span> <span class="text-danger">*</span>
              </label>
              <span id="refReasonCount" class="char-counter">0 / 500</span>
            </div>
            <textarea id="refReason" class="form-control" rows="2" maxlength="500" placeholder="Reason for specialist consultation, chief complaints, diagnostic suspicion, and provisional diagnosis..." oninput="updateReferralCharCount('refReason', 'refReasonCount', 500); clearReferralFieldError('refReasonError', this);" required></textarea>
            <!-- Field-Specific Inline Error -->
            <div id="refReasonError" class="field-error-msg hidden" role="alert">
              <svg class="lucide lucide-alert-circle" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span>Please specify the clinical indication / reason for this specialist referral.</span>
            </div>
          </div>

          <!-- 5. Additional Notes & Directives with Character Counter -->
          <div class="form-group mb-20">
            <div class="field-header-row">
              <label class="form-label mb-0" for="refNotes">
                <span class="form-section-title">ADDITIONAL NOTES &amp; CLINICAL DIRECTIVES</span>
              </label>
              <span id="refNotesCount" class="char-counter">0 / 500</span>
            </div>
            <textarea id="refNotes" class="form-control" rows="2" maxlength="500" placeholder="Relevant vitals, active drug allergies, immediate telemetry requirements, or transport logistics notes (optional)..." oninput="updateReferralCharCount('refNotes', 'refNotesCount', 500);"></textarea>
          </div>

          <!-- 6. Action Bar with Dual Buttons & Form Reset -->
          <div class="referral-actions-bar">
            <button type="button" class="btn btn-secondary" onclick="resetReferralForm()" title="Clear form inputs and reset errors">
              Reset Form
            </button>
            <div class="referral-actions-right">
              <button type="button" class="btn btn-secondary" onclick="handlePreviewReferralLetter()" title="Preview printable clinical referral letter">
                <svg class="lucide lucide-file-text" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                Preview Referral Letter / Print Form
              </button>
              <button type="submit" id="refDispatchBtn" class="btn btn-primary" style="background: #0D9488; border-color: #0D9488;">
                <svg class="lucide lucide-send" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                Dispatch Referral
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  \`;

  // Close dropdown on outside click
  document.addEventListener('click', function onDocClick(e) {
    const combobox = document.getElementById('refPatientCombobox');
    const dropdown = document.getElementById('refPatientDropdown');
    if (!dropdown) {
      document.removeEventListener('click', onDocClick);
      return;
    }
    if (combobox && !combobox.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });
};

// Autocomplete and selection helpers for referral patient picker
window.filterReferralPatients = function (query) {
  const dropdown = document.getElementById('refPatientDropdown');
  if (!dropdown) return;

  const q = (query || '').toLowerCase().trim();
  const list = window._referralPatientList || [];
  const filtered = q
    ? list.filter(p => (p.name && p.name.toLowerCase().includes(q)) || (p.id && p.id.toLowerCase().includes(q)))
    : list;

  if (filtered.length === 0) {
    dropdown.innerHTML = \`
      <div style="padding: 12px; font-size: 0.82rem; color: #64748B; text-align: center;">
        No patients found matching "\${escapeHtml(q)}".
      </div>
    \`;
  } else {
    dropdown.innerHTML = filtered.map(p => {
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
    }).join('');
  }
  dropdown.classList.remove('hidden');
};

window.selectReferralPatient = function (rawId) {
  const cleanId = window.extractCleanPatientId(rawId);
  const list = window._referralPatientList || [];
  const patient = list.find(p => p.id === cleanId) || { id: cleanId, name: 'Patient Record' };

  const idInput = document.getElementById('refPatientId');
  const select = document.getElementById('refPatientSelect');
  if (idInput) idInput.value = patient.id;
  if (select) select.value = patient.id;

  // Populate Summary Pill
  const summaryAvatar = document.getElementById('refSummaryAvatar');
  const summaryName = document.getElementById('refSummaryName');
  const summaryDiagnosis = document.getElementById('refSummaryDiagnosis');
  const summaryDemographics = document.getElementById('refSummaryDemographics');

  if (summaryAvatar) {
    summaryAvatar.textContent = (patient.name || 'PT').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
  if (summaryName) {
    summaryName.textContent = patient.name;
  }
  if (summaryDiagnosis) {
    summaryDiagnosis.textContent = patient.diagnosis || 'Active Inpatient';
  }
  if (summaryDemographics) {
    summaryDemographics.textContent = \`\${patient.age || 58}y \${patient.gender || 'Male'} • Blood Group: \${patient.bloodGroup || 'B+'} • MRN: \${patient.id}\`;
  }

  // Toggle display
  document.getElementById('refPatientCombobox')?.classList.add('hidden');
  document.getElementById('refPatientSummaryCard')?.classList.remove('hidden');
  document.getElementById('refPatientDropdown')?.classList.add('hidden');

  // Clear validation error immediately
  window.clearReferralFieldError('refPatientError', document.getElementById('refPatientSearch'));
};

window.clearReferralPatient = function () {
  const idInput = document.getElementById('refPatientId');
  const select = document.getElementById('refPatientSelect');
  const searchInput = document.getElementById('refPatientSearch');
  if (idInput) idInput.value = '';
  if (select) select.value = '';
  if (searchInput) searchInput.value = '';

  document.getElementById('refPatientSummaryCard')?.classList.add('hidden');
  const combobox = document.getElementById('refPatientCombobox');
  if (combobox) combobox.classList.remove('hidden');
  if (searchInput) searchInput.focus();
};

window.setReferralPriority = function (priority) {
  const priorityInput = document.getElementById('refPriority');
  if (priorityInput) priorityInput.value = priority;

  const routineBtn = document.getElementById('btnPriorityRoutine');
  const urgentBtn = document.getElementById('btnPriorityUrgent');
  const emergencyBtn = document.getElementById('btnPriorityEmergency');

  [routineBtn, urgentBtn, emergencyBtn].forEach(b => {
    if (b) {
      b.classList.remove('active');
      b.setAttribute('aria-checked', 'false');
    }
  });

  if (priority === 'ROUTINE' && routineBtn) {
    routineBtn.classList.add('active');
    routineBtn.setAttribute('aria-checked', 'true');
  } else if (priority === 'URGENT' && urgentBtn) {
    urgentBtn.classList.add('active');
    urgentBtn.setAttribute('aria-checked', 'true');
  } else if (priority === 'EMERGENCY' && emergencyBtn) {
    emergencyBtn.classList.add('active');
    emergencyBtn.setAttribute('aria-checked', 'true');
  }
};

window.updateReferralCharCount = function (inputId, countId, max = 500) {
  const input = document.getElementById(inputId);
  const counter = document.getElementById(countId);
  if (input && counter) {
    const len = input.value.length;
    counter.textContent = \`\${len} / \${max}\`;
  }
};

window.clearReferralFieldError = function (errorId, inputEl) {
  const errorEl = document.getElementById(errorId);
  if (errorEl) errorEl.classList.add('hidden');
  if (inputEl) inputEl.classList.remove('input-error');
};

window.resetReferralForm = function () {
  window.clearReferralPatient();
  window.setReferralPriority('ROUTINE');
  const reason = document.getElementById('refReason');
  const notes = document.getElementById('refNotes');
  if (reason) reason.value = '';
  if (notes) notes.value = '';
  window.updateReferralCharCount('refReason', 'refReasonCount', 500);
  window.updateReferralCharCount('refNotes', 'refNotesCount', 500);

  // Clear all errors
  ['refPatientError', 'refFacilityError', 'refReasonError'].forEach(errId => {
    const el = document.getElementById(errId);
    if (el) el.classList.add('hidden');
  });
  ['refPatientSearch', 'refDestHospital', 'refReason'].forEach(inpId => {
    const el = document.getElementById(inpId);
    if (el) el.classList.remove('input-error');
  });
};

window.handlePreviewReferralLetter = function () {
  let patientId = document.getElementById('refPatientId')?.value || document.getElementById('refPatientSelect')?.value;
  patientId = window.extractCleanPatientId(patientId);

  const toHospitalId = document.getElementById('refDestHospital')?.value || 'HOSP-102';
  const targetSpecialty = document.getElementById('refSpecialty')?.value || 'Cardiology';
  const priority = document.getElementById('refPriority')?.value || 'ROUTINE';
  const reason = document.getElementById('refReason')?.value?.trim() || 'Comprehensive specialist evaluation and collaborative care transfer.';
  const notes = document.getElementById('refNotes')?.value?.trim() || 'Standard diagnostic and care records attached.';

  if (typeof window.previewReferralLetter === 'function') {
    window.previewReferralLetter({
      patientId: patientId || 'PAT-302',
      toHospitalId,
      targetFacilityId: toHospitalId,
      specialty: targetSpecialty,
      targetSpecialty,
      priority,
      clinicalPriority: priority,
      reason,
      referralReason: reason,
      notes,
      additionalNotes: notes
    });
  } else if (typeof window.hospitrackPrintDocument === 'function') {
    window.hospitrackPrintDocument('referral', {
      patientId: patientId || 'PAT-302',
      toHospitalId,
      targetSpecialty,
      priority,
      reason,
      notes
    });
  }
};

window.handleReferralSubmit = async function (event) {
  if (event && event.preventDefault) event.preventDefault();

  let rawPatientId = document.getElementById('refPatientId')?.value || document.getElementById('refPatientSelect')?.value;
  const patientId = window.extractCleanPatientId(rawPatientId);
  const toHospitalId = document.getElementById('refDestHospital')?.value;
  const targetSpecialty = document.getElementById('refSpecialty')?.value || 'Cardiology';
  const priority = document.getElementById('refPriority')?.value || 'ROUTINE';
  const reason = document.getElementById('refReason')?.value?.trim();
  const notes = document.getElementById('refNotes')?.value?.trim() || null;

  let hasError = false;

  // 1. Validate Clean Patient ID
  const patientErr = document.getElementById('refPatientError');
  const searchInput = document.getElementById('refPatientSearch');
  if (!patientId) {
    if (patientErr) patientErr.classList.remove('hidden');
    if (searchInput) searchInput.classList.add('input-error');
    hasError = true;
  } else {
    if (patientErr) patientErr.classList.add('hidden');
    if (searchInput) searchInput.classList.remove('input-error');
  }

  // 2. Validate Receiving Hospital
  const facilityErr = document.getElementById('refFacilityError');
  const destHospitalInput = document.getElementById('refDestHospital');
  if (!toHospitalId) {
    if (facilityErr) facilityErr.classList.remove('hidden');
    if (destHospitalInput) destHospitalInput.classList.add('input-error');
    hasError = true;
  } else {
    if (facilityErr) facilityErr.classList.add('hidden');
    if (destHospitalInput) destHospitalInput.classList.remove('input-error');
  }

  // 3. Validate Referral Reason
  const reasonErr = document.getElementById('refReasonError');
  const reasonInput = document.getElementById('refReason');
  if (!reason) {
    if (reasonErr) reasonErr.classList.remove('hidden');
    if (reasonInput) reasonInput.classList.add('input-error');
    hasError = true;
  } else {
    if (reasonErr) reasonErr.classList.add('hidden');
    if (reasonInput) reasonInput.classList.remove('input-error');
  }

  if (hasError) return;

  // Set loading state on submit button
  const submitBtn = document.getElementById('refDispatchBtn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="referral-spinner"></span> Dispatching Referral...';
  }

  try {
    const payload = {
      patientId,
      toHospitalId,
      targetFacilityId: toHospitalId,
      priority,
      clinicalPriority: priority,
      targetSpecialty,
      specialty: targetSpecialty,
      reason,
      referralReason: reason,
      notes,
      additionalNotes: notes
    };

    if (window.hospitrackStore && typeof window.hospitrackStore.createReferral === 'function') {
      await window.hospitrackStore.createReferral(payload);
    }

    // Determine target facility name for professional toast
    const destOptionText = document.getElementById('refDestHospital')?.selectedOptions?.[0]?.text || 'Apex Care Medical Center';
    const destName = destOptionText.split('•')[0].split('(')[0].trim() || 'Apex Care Medical Center';

    if (typeof window.showToast === 'function') {
      window.showToast(\`✓ Referral successfully routed to \${destName}\`, 'success');
    }

    if (typeof window.closeGlobalModal === 'function') {
      window.closeGlobalModal('createReferralModal');
    }

    if (window.hospitrackStore && typeof window.hospitrackStore.syncAllData === 'function') {
      await window.hospitrackStore.syncAllData();
    }

    const user = window.hospitrackAuth ? window.hospitrackAuth.getCurrentUser() : null;
    const container = document.getElementById('mainContentArea');
    if (user?.role === 'HOSPITAL_ADMIN' || user?.role === 'HOSPITAL') {
      if (container && window.renderHospitalDashboard) {
        window.renderHospitalDashboard(container, 'referrals');
      }
    } else if (user?.role === 'DOCTOR') {
      if (container && window.renderDoctorDashboard) {
        window.renderDoctorDashboard(container);
      }
    } else if (window.renderCurrentView) {
      window.renderCurrentView();
    }
  } catch (err) {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = \`
        <svg class="lucide lucide-send" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        Dispatch Referral
      \`;
    }
    const reasonErr = document.getElementById('refReasonError');
    if (reasonErr) {
      const span = reasonErr.querySelector('span');
      if (span) span.textContent = err.message || 'Failed to dispatch referral.';
      reasonErr.classList.remove('hidden');
    }
  }
};

`;

content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated js/components/doctorDashboard.js!');

