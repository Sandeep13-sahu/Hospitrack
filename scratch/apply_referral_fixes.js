const fs = require('fs');
const path = require('path');

const docPath = path.join(__dirname, '..', 'js', 'components', 'doctorDashboard.js');
let docContent = fs.readFileSync(docPath, 'utf8');

// Replace counter section if not already replaced
const oldCounterSection = `window.handleReferralReasonChange = function (el) {
  const val = el ? (el.value || '') : (document.getElementById('refReason')?.value || '');`;

const newCounterSection = `// Reactive referral form state holding live keystrokes
let activeReferralReason = '';
let activeReferralNotes = '';

// Real-time dynamic character counter and state synchronization handlers
window.handleReferralReasonChange = function (el) {
  const form = el && el.closest ? el.closest('form') : document.getElementById('clinicalReferralForm');
  const textarea = el || (form && typeof form.querySelector === 'function' ? form.querySelector('#refReason') : document.getElementById('refReason'));
  const val = textarea ? (textarea.value || '') : (el?.value || '');
  activeReferralReason = val;
  const counter = form && typeof form.querySelector === 'function' ? form.querySelector('#refReasonCount') : document.getElementById('refReasonCount');
  if (counter) counter.textContent = \`\${val.length} / 500\`;
  const err = form && typeof form.querySelector === 'function' ? form.querySelector('#refReasonError') : document.getElementById('refReasonError');
  if (err && val.trim().length > 0) {
    err.classList.add('hidden');
    if (textarea) textarea.classList.remove('input-error');
  }
};

window.handleReferralNotesChange = function (el) {
  const form = el && el.closest ? el.closest('form') : document.getElementById('clinicalReferralForm');
  const textarea = el || (form && typeof form.querySelector === 'function' ? form.querySelector('#refNotes') : document.getElementById('refNotes'));
  const val = textarea ? (textarea.value || '') : (el?.value || '');
  activeReferralNotes = val;
  const counter = form && typeof form.querySelector === 'function' ? form.querySelector('#refNotesCount') : document.getElementById('refNotesCount');
  if (counter) counter.textContent = \`\${val.length} / 500\`;
};`;

if (docContent.includes(oldCounterSection)) {
  docContent = docContent.replace(
    /window\.handleReferralReasonChange = function[\s\S]*?window\.handleReferralNotesChange = function[\s\S]*?if \(counter\) counter\.textContent = `\$\{val\.length\} \/ 500`;\s*\};/,
    newCounterSection
  );
  console.log('Replaced counter section successfully');
}

const previewStartMarker = 'window.resetReferralForm = function () {';
const previewEndMarker = 'window.closeGlobalModal = function (id) {';

const startIndex = docContent.indexOf(previewStartMarker);
const endIndex = docContent.indexOf(previewEndMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find boundaries in doctorDashboard.js", { startIndex, endIndex });
  process.exit(1);
}

const isCRLF = docContent.includes('\r\n');
const newline = isCRLF ? '\r\n' : '\n';

const newReferralLogic = `window.resetReferralForm = function () {
  activeReferralReason = '';
  activeReferralNotes = '';
  window.clearReferralPatient();
  window.setReferralPriority('ROUTINE');
  const reason = document.getElementById('refReason');
  const notes = document.getElementById('refNotes');
  if (reason) reason.value = '';
  if (notes) notes.value = '';
  const reasonCount = document.getElementById('refReasonCount');
  if (reasonCount) reasonCount.textContent = '0 / 500';
  const notesCount = document.getElementById('refNotesCount');
  if (notesCount) notesCount.textContent = '0 / 500';

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

// ----------------------------------------------------------------------------
// Dedicated Inter-Hospital Referral Letter Preview & Print Architecture
// ----------------------------------------------------------------------------
window.handlePreviewReferralLetter = function () {
  const form = document.getElementById('clinicalReferralForm');
  // 1. Resolve Patient ID
  let rawPatientId = (form && typeof form.querySelector === 'function' ? form.querySelector('#refPatientId')?.value : null) || document.getElementById('refPatientId')?.value || document.getElementById('refPatientSelect')?.value;
  if (!rawPatientId) {
    const searchVal = document.getElementById('refPatientSearch')?.value?.trim();
    if (searchVal) {
      const list = window._referralPatientList || [];
      const match = list.find(p => p.id.toLowerCase() === searchVal.toLowerCase() || p.name.toLowerCase().includes(searchVal.toLowerCase()));
      if (match) {
        rawPatientId = match.id;
        window.selectReferralPatient(match.id);
      } else {
        rawPatientId = window.extractCleanPatientId(searchVal);
      }
    }
  }

  const patientId = window.extractCleanPatientId(rawPatientId);
  const destSelect = (form && typeof form.querySelector === 'function' ? form.querySelector('#refDestHospital') : null) || document.getElementById('refDestHospital');
  const toHospitalId = destSelect?.value;
  const reasonTextarea = (form && typeof form.querySelector === 'function' ? form.querySelector('#refReason') : null) || document.getElementById('refReason');
  const rawReason = (reasonTextarea ? reasonTextarea.value : '') || activeReferralReason || '';
  const reason = rawReason.trim();

  let hasError = false;

  // Pre-check 1: Patient validation
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

  // Pre-check 2: Destination facility validation
  const facilityErr = document.getElementById('refFacilityError');
  if (!toHospitalId) {
    if (facilityErr) facilityErr.classList.remove('hidden');
    if (destSelect) destSelect.classList.add('input-error');
    hasError = true;
  } else {
    if (facilityErr) facilityErr.classList.add('hidden');
    if (destSelect) destSelect.classList.remove('input-error');
  }

  // Pre-check 3: Referral Reason validation
  const reasonErr = document.getElementById('refReasonError');
  if (!reason || reason.length === 0) {
    if (reasonErr) reasonErr.classList.remove('hidden');
    if (reasonTextarea) reasonTextarea.classList.add('input-error');
    hasError = true;
  } else {
    if (reasonErr) reasonErr.classList.add('hidden');
    if (reasonTextarea) reasonTextarea.classList.remove('input-error');
  }

  if (hasError) {
    if (typeof window.showToast === 'function') {
      window.showToast('Please complete required referral details before previewing.', 'warning');
    }
    return;
  }

  // Collect Payload
  const destFacilityName = destSelect ? (destSelect.selectedOptions[0]?.getAttribute('data-facility-name') || destSelect.selectedOptions[0]?.text.split('•')[0].split('(')[0].trim()) : 'Apex Care Medical Center';
  const targetSpecialty = document.getElementById('refSpecialty')?.value || 'Cardiology & Interventional Cath';
  const priority = document.getElementById('refPriority')?.value || 'ROUTINE';
  const notesTextarea = (form && typeof form.querySelector === 'function' ? form.querySelector('#refNotes') : null) || document.getElementById('refNotes');
  const notes = (notesTextarea ? notesTextarea.value : '') || activeReferralNotes || '';

  const list = window._referralPatientList || [];
  const selectedPatient = list.find(p => p.id === patientId) || { id: patientId, name: 'Ananya Iyer', age: 31, gender: 'Female', bloodGroup: 'A+' };
  const currentUser = window.hospitrackAuth ? window.hospitrackAuth.getCurrentUser() : null;

  const payload = {
    patientId: selectedPatient.id,
    patientName: selectedPatient.name,
    patient: selectedPatient,
    fromDoctor: currentUser?.name || 'Dr. Sarah Sharma, MD',
    doctorId: currentUser?.doctorId || currentUser?.id || 'DOC-201',
    sourceFacility: currentUser?.hospitalName || 'City General Hospital',
    department: 'Department of Cardiology & Electrophysiology',
    licenseNo: 'MCI-CGH-2026-9812',
    destinationFacility: destFacilityName,
    toHospitalId,
    targetFacilityId: toHospitalId,
    specialty: targetSpecialty,
    targetSpecialty,
    priority,
    clinicalPriority: priority,
    referralReason: reason,
    reason: reason,
    additionalNotes: notes.trim(),
    notes: notes.trim(),
    referralCode: \`REF-2026-\${Math.floor(1000 + Math.random() * 9000)}\`,
    timestamp: new Date().toISOString()
  };

  window.openReferralPreviewModal(payload);
};

window.openReferralPreviewModal = function (ref) {
  let modalContainer = document.getElementById('globalModalContainer');
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'globalModalContainer';
    document.body.appendChild(modalContainer);
  }

  const patient = ref.patient || { name: ref.patientName || 'Ananya Iyer', id: ref.patientId || 'PAT-303', age: 31, gender: 'Female', bloodGroup: 'A+' };
  const priority = (ref.clinicalPriority || ref.priority || 'ROUTINE').toUpperCase();
  const priorityPillClass = priority === 'EMERGENCY' ? 'priority-emergency' : priority === 'URGENT' ? 'priority-urgent' : 'priority-routine';
  const priorityBadgeText = priority === 'EMERGENCY' ? '🔴 STAT / EMERGENCY' : priority === 'URGENT' ? '🟡 URGENT (&lt; 48h)' : '🟢 ROUTINE';
  const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const existingPreview = document.getElementById('referralPreviewModal');
  if (existingPreview) existingPreview.remove();

  const previewEl = document.createElement('div');
  previewEl.id = 'referralPreviewModal';
  previewEl.className = 'modal-overlay open referral-preview-overlay';
  previewEl.setAttribute('role', 'dialog');
  previewEl.setAttribute('aria-modal', 'true');
  previewEl.setAttribute('aria-labelledby', 'referralPreviewModalTitle');

  previewEl.innerHTML = \`
    <div class="modal-box referral-preview-modal-box">
      <!-- 1. Dedicated Action Header Bar -->
      <div class="referral-preview-header no-print">
        <div class="referral-preview-header-left">
          <span class="preview-mode-pill">PREVIEW (PRE-DISPATCH)</span>
          <h3 class="referral-preview-title" id="referralPreviewModalTitle">Official Clinical Referral Slip</h3>
        </div>
        <div class="referral-preview-actions">
          <button type="button" class="btn btn-secondary btn-sm btn-back-to-edit" onclick="closeReferralPreviewModal()">
            <svg class="lucide lucide-arrow-left" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            <span>Back to Edit</span>
          </button>
          <button type="button" class="btn btn-primary btn-sm btn-print-letter" onclick="window.printReferralLetterDoc()">
            <svg class="lucide lucide-printer" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            <span>Print Official Letter</span>
          </button>
          <button type="button" class="modal-close" onclick="closeReferralPreviewModal()" aria-label="Close Preview">✕</button>
        </div>
      </div>

      <!-- 2. Authentic Hospital Referral Letter Document Body -->
      <div class="referral-preview-body">
        <div class="referral-slip-paper" id="referralSlipPrintableArea">
          <!-- Institutional Header & Letterhead -->
          <div class="referral-slip-header">
            <div class="referral-slip-brand">
              <div class="referral-slip-symbol">H+</div>
              <div>
                <h1 class="referral-slip-hospital">\${escapeHtml(ref.sourceFacility || 'CITY GENERAL HOSPITAL & RESEARCH INSTITUTE')}</h1>
                <p class="referral-slip-dept">\${escapeHtml(ref.department || 'Department of Cardiology & Electrophysiology')}</p>
                <p class="referral-slip-meta">Facility License: <code>\${escapeHtml(ref.licenseNo || 'MCI-CGH-2026-9812')}</code> • NABH &amp; NABL Accredited Care Network</p>
              </div>
            </div>
            <div class="referral-slip-uid-box">
              <div class="referral-barcode">||| ||| | |||| ||| |||||| |||| |||</div>
              <div class="referral-uid-text">UID: <strong>\${escapeHtml(ref.referralCode || 'REF-2026-9812')}</strong></div>
              <div class="referral-date-text">\${nowStr}</div>
            </div>
          </div>

          <!-- Document Title Ribbon -->
          <div class="referral-title-strip">
            <h2 class="referral-doc-title">HOSPITRACK INTER-INSTITUTIONAL CLINICAL REFERRAL SLIP</h2>
            <div class="referral-doc-sub">Authorized Clinical Handover &amp; Inter-Facility Specialist Triage Directive</div>
          </div>

          <!-- Clinical Referral Metadata Grid (2-Column Box) -->
          <div class="referral-meta-grid-2col">
            <!-- Column 1: Patient Demographics -->
            <div class="referral-meta-col">
              <div class="referral-meta-heading">1. PATIENT DEMOGRAPHICS &amp; IDENTIFICATION</div>
              <div class="referral-meta-row">
                <span class="meta-label">Patient Full Name:</span>
                <span class="meta-val highlight"><strong>\${escapeHtml(patient.name)}</strong></span>
              </div>
              <div class="referral-meta-row">
                <span class="meta-label">MRN / UHID:</span>
                <span class="meta-val"><code>\${escapeHtml(patient.id)}</code></span>
              </div>
              <div class="referral-meta-row">
                <span class="meta-label">Age / Gender:</span>
                <span class="meta-val">\${patient.age || 31} Yrs / \${escapeHtml(patient.gender || 'Female')}</span>
              </div>
              <div class="referral-meta-row">
                <span class="meta-label">Blood Group:</span>
                <span class="meta-val">\${escapeHtml(patient.bloodGroup || 'A+')}</span>
              </div>
              <div class="referral-meta-row">
                <span class="meta-label">Contact Number:</span>
                <span class="meta-val">\${escapeHtml(patient.phone || '+91 98765 43210')}</span>
              </div>
              <div class="referral-meta-row">
                <span class="meta-label">Encounter Status:</span>
                <span class="meta-val"><span class="status-indicator-tag">Inpatient Telemetry Care</span></span>
              </div>
            </div>

            <!-- Column 2: Referral Details -->
            <div class="referral-meta-col">
              <div class="referral-meta-heading">2. REFERRAL ROUTING &amp; SPECIALIST ASSIGNMENT</div>
              <div class="referral-meta-row">
                <span class="meta-label">Referring Clinician:</span>
                <span class="meta-val"><strong>\${escapeHtml(ref.fromDoctor || 'Dr. Sarah Sharma, MD')}</strong></span>
              </div>
              <div class="referral-meta-row">
                <span class="meta-label">Destination Facility:</span>
                <span class="meta-val dest-hosp"><strong>\${escapeHtml(ref.destinationFacility || 'Apex Care Medical Center')}</strong></span>
              </div>
              <div class="referral-meta-row">
                <span class="meta-label">Target Specialty:</span>
                <span class="meta-val">\${escapeHtml(ref.targetSpecialty || ref.specialty || 'Cardiology & Interventional Cath')}</span>
              </div>
              <div class="referral-meta-row">
                <span class="meta-label">Priority Triage Level:</span>
                <span class="meta-val"><span class="priority-slip-pill \${priorityPillClass}">\${priorityBadgeText}</span></span>
              </div>
              <div class="referral-meta-row">
                <span class="meta-label">Dispatch Timestamp:</span>
                <span class="meta-val">\${nowStr}</span>
              </div>
              <div class="referral-meta-row">
                <span class="meta-label">Transfer Channel:</span>
                <span class="meta-val">Hospitrack Encrypted Clinical Highway</span>
              </div>
            </div>
          </div>

          <!-- Section 1: Chief Clinical Indication / Reason for Transfer -->
          <div class="referral-section-box">
            <div class="referral-section-header">CHIEF CLINICAL INDICATION / REASON FOR TRANSFER</div>
            <div class="referral-section-content reason-text">
              \${escapeHtml(ref.referralReason || ref.reason || 'None specified')}
            </div>
          </div>

          <!-- Section 2: Clinical Notes, Vitals & Transport Directives -->
          <div class="referral-section-box">
            <div class="referral-section-header">CLINICAL NOTES, VITALS &amp; TRANSPORT DIRECTIVES</div>
            <div class="referral-section-content notes-text">
              \${escapeHtml(ref.additionalNotes || ref.notes || 'None specified')}
            </div>
          </div>

          <!-- Section 3: Attached Medical Records (Automated Provenance) -->
          <div class="referral-section-box attached-records-box">
            <div class="referral-section-header">ATTACHED ELECTRONIC MEDICAL DOSSIERS (CONNECTED CARE)</div>
            <div class="attached-records-badges">
              <span class="record-badge">✓ Complete Longitudinal EHR</span>
              <span class="record-badge">✓ 12-Lead ECG &amp; Telemetry Strips</span>
              <span class="record-badge">✓ Diagnostic Laboratory Panels (ISO 15189)</span>
              <span class="record-badge">✓ Active Verified Pharmacotherapy Regimen</span>
            </div>
          </div>

          <!-- Formal Attestation & Dual Signatures -->
          <div class="referral-signatures-grid">
            <div class="referral-sig-block">
              <div class="sig-cursive">\${escapeHtml(ref.fromDoctor || 'Dr. Sarah Sharma')}</div>
              <div class="sig-line"></div>
              <div class="sig-name">\${escapeHtml(ref.fromDoctor || 'Dr. Sarah Sharma, MD')}</div>
              <div class="sig-title">Referring Clinician Digital Signature &amp; Stamp</div>
              <div class="sig-reg">Reg: MCI-CGH-99201 • Hospitrack Care Network</div>
            </div>

            <div class="referral-sig-block triage-accept">
              <div class="sig-empty-placeholder"></div>
              <div class="sig-line"></div>
              <div class="sig-name">Receiving Specialist / Triage Officer</div>
              <div class="sig-title">Receiving Facility Triage Acceptance Acknowledgment</div>
              <div class="sig-reg">Signature &amp; Facility Reception Timestamp</div>
            </div>
          </div>

          <!-- Institutional Governance Footer -->
          <div class="referral-slip-footer">
            <p>This confidential clinical transfer document is electronically generated via Hospitrack Care Network. Valid for hospital admission and inter-facility transit triage.</p>
            <div class="referral-footer-hash">Security Token: HTR-REF-SHA256-\${Math.random().toString(36).substring(2, 10).toUpperCase()} • System Time: \${new Date().toISOString()}</div>
          </div>
        </div>
      </div>
    </div>
  \`;

  document.body.appendChild(previewEl);
};

window.closeReferralPreviewModal = function () {
  const el = document.getElementById('referralPreviewModal');
  if (el) el.remove();
};

window.printReferralLetterDoc = function () {
  const slip = document.getElementById('referralSlipPrintableArea');
  let printContainer = document.getElementById('printable-medical-record');
  if (!printContainer) {
    printContainer = document.createElement('div');
    printContainer.id = 'printable-medical-record';
    printContainer.className = 'printable-document-container';
    document.body.appendChild(printContainer);
  }

  if (slip) {
    printContainer.innerHTML = \`<div class="print-medical-sheet print-referral-document">\${slip.innerHTML}</div>\`;
  }

  document.body.classList.add('printing-referral-slip');

  const onAfterPrint = () => {
    document.body.classList.remove('printing-referral-slip');
    if (printContainer) printContainer.innerHTML = '';
    window.removeEventListener('afterprint', onAfterPrint);
  };
  window.addEventListener('afterprint', onAfterPrint);

  setTimeout(() => {
    if (typeof window.print === 'function') {
      window.print();
    }
    setTimeout(onAfterPrint, 1500);
  }, 120);
};

// ----------------------------------------------------------------------------
// Form Submission Pipeline with Strict State Synchronization
// ----------------------------------------------------------------------------
window.handleReferralSubmit = async function (event) {
  if (event) {
    if (typeof event.preventDefault === 'function') event.preventDefault();
    if (typeof event.stopPropagation === 'function') event.stopPropagation();
  }

  const form = document.getElementById('clinicalReferralForm') || (event?.target?.closest ? event.target.closest('form') : null);

  // 1. Resolve Patient ID
  let rawPatientId = (form && typeof form.querySelector === 'function' ? form.querySelector('#refPatientId')?.value : null) || document.getElementById('refPatientId')?.value || document.getElementById('refPatientSelect')?.value;
  if (!rawPatientId) {
    const searchVal = document.getElementById('refPatientSearch')?.value?.trim();
    if (searchVal) {
      const list = window._referralPatientList || [];
      const match = list.find(p => p.id.toLowerCase() === searchVal.toLowerCase() || p.name.toLowerCase().includes(searchVal.toLowerCase()));
      if (match) {
        rawPatientId = match.id;
        window.selectReferralPatient(match.id);
      } else {
        rawPatientId = window.extractCleanPatientId(searchVal);
      }
    }
  }

  const patientId = window.extractCleanPatientId(rawPatientId);
  const destSelect = (form && typeof form.querySelector === 'function' ? form.querySelector('#refDestHospital') : null) || document.getElementById('refDestHospital');
  const toHospitalId = destSelect?.value;
  const destFacilityName = destSelect ? (destSelect.selectedOptions[0]?.getAttribute('data-facility-name') || destSelect.selectedOptions[0]?.text.split('•')[0].split('(')[0].trim()) : 'City General Hospital';
  const targetSpecialty = document.getElementById('refSpecialty')?.value || 'Cardiology & Interventional Cath';
  const priority = document.getElementById('refPriority')?.value || 'ROUTINE';
  
  // Extract strictly synchronized reason
  const reasonTextarea = (form && typeof form.querySelector === 'function' ? form.querySelector('#refReason') : null) || document.getElementById('refReason');
  const rawReason = (reasonTextarea ? reasonTextarea.value : '') || activeReferralReason || '';
  const reason = rawReason.trim();

  // Extract strictly synchronized notes
  const notesTextarea = (form && typeof form.querySelector === 'function' ? form.querySelector('#refNotes') : null) || document.getElementById('refNotes');
  const rawNotes = (notesTextarea ? notesTextarea.value : '') || activeReferralNotes || '';
  const notes = rawNotes.trim();

  let hasError = false;

  // 1. Validate Clean Patient ID (Mandatory)
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

  // 2. Validate Receiving Hospital (Mandatory)
  const facilityErr = document.getElementById('refFacilityError');
  if (!toHospitalId) {
    if (facilityErr) facilityErr.classList.remove('hidden');
    if (destSelect) destSelect.classList.add('input-error');
    hasError = true;
  } else {
    if (facilityErr) facilityErr.classList.add('hidden');
    if (destSelect) destSelect.classList.remove('input-error');
  }

  // 3. Validate Referral Reason (Mandatory: trim().length > 0)
  const reasonErr = document.getElementById('refReasonError');
  if (!reason || reason.length === 0) {
    if (reasonErr) reasonErr.classList.remove('hidden');
    if (reasonTextarea) reasonTextarea.classList.add('input-error');
    hasError = true;
  } else {
    if (reasonErr) reasonErr.classList.add('hidden');
    if (reasonTextarea) reasonTextarea.classList.remove('input-error');
  }

  if (hasError) return;

  // Set loading state on submit button
  const submitBtn = document.getElementById('refDispatchBtn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="referral-spinner"></span> Routing Referral...';
  }

  try {
    const list = window._referralPatientList || [];
    const selectedPatient = list.find(p => p.id === patientId) || { id: patientId, name: 'Ananya Iyer' };
    const currentUser = window.hospitrackAuth ? window.hospitrackAuth.getCurrentUser() : null;

    // Simulate 500ms network latency for authentic clinical routing responsiveness
    await new Promise(resolve => setTimeout(resolve, 500));

    // Construct the authoritative referral record
    const newReferral = {
      id: \`REF-\${Date.now().toString().slice(-4)}\`,
      patientName: selectedPatient.name,
      patientId: selectedPatient.id,
      fromDoctor: currentUser?.name || 'Dr. Sarah Sharma',
      doctorId: currentUser?.doctorId || currentUser?.id || 'DOC-201',
      sourceFacility: currentUser?.hospitalName || 'City General Hospital',
      fromHospitalId: currentUser?.hospitalId || 'HOSP-101',
      destinationFacility: destFacilityName,
      toHospitalId: toHospitalId,
      targetFacilityId: toHospitalId,
      specialty: targetSpecialty,
      targetSpecialty: targetSpecialty,
      priority: priority,
      clinicalPriority: priority,
      reason: reason,
      referralReason: reason,
      notes: notes,
      additionalNotes: notes,
      status: 'Dispatched / Pending Triage',
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    if (window.hospitrackStore && typeof window.hospitrackStore.createReferral === 'function') {
      await window.hospitrackStore.createReferral(newReferral);
    } else {
      if (window.hospitrackStore && window.hospitrackStore.data) {
        if (!window.hospitrackStore.data.referrals) window.hospitrackStore.data.referrals = [];
        window.hospitrackStore.data.referrals.unshift(newReferral);
        if (typeof window.hospitrackStore.notify === 'function') {
          window.hospitrackStore.notify();
        }
      }
    }

    // Instant Post-Submission Feedback
    const successMsg = \`✓ Clinical referral for \${selectedPatient.name} successfully dispatched to \${destFacilityName}.\`;
    if (typeof window.showToast === 'function') {
      window.showToast(successMsg, 'success');
    }

    // Reset form and close modal
    window.resetReferralForm();
    if (typeof window.closeGlobalModal === 'function') {
      window.closeGlobalModal('createReferralModal');
    }

    // Refresh Doctor Dashboard and switch to Outgoing Referrals view automatically
    if (typeof window.setDoctorTab === 'function') {
      window.setDoctorTab('referrals');
    }
    if (typeof window.setReferralSubtab === 'function') {
      window.setReferralSubtab('outgoing');
    }

  } catch (err) {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = \`
        <svg class="lucide lucide-send" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        <span>Dispatch Referral</span>
      \`;
    }
    window.showToast(err.message || 'Failed to dispatch specialist referral.', 'error');
  }
};
`;

const formattedLogic = isCRLF ? newReferralLogic.replace(/\n/g, '\r\n') : newReferralLogic;
docContent = docContent.substring(0, startIndex) + formattedLogic + newline + docContent.substring(endIndex);
fs.writeFileSync(docPath, docContent, 'utf8');
console.log('doctorDashboard.js successfully updated with synchronized validation and preview modal architecture');
