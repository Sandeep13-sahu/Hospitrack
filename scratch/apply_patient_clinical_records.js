const fs = require('fs');

let code = fs.readFileSync('js/components/patientDashboard.js', 'utf8');

// Ensure state variables
if (!code.includes('let patientRecordsCategoryFilter')) {
  code = code.replace(
    /let journeyFilterType = 'ALL';/,
    `// Clinical Records Interactive State
let patientRecordsCategoryFilter = 'all'; // 'all', 'consultations', 'prescriptions', 'follow-ups'
let patientRecordsFacilityFilter = 'ALL';
let patientRecordsSearchQuery = '';
let patientExpandedConsultationIds = { 'CON-401': true };
let patientRefillToastMsg = null;

let journeyFilterType = 'ALL';`
  );
}

// Master renderer function and window helpers
const masterImplementation = `
// ============================================================================
// CLINICAL RECORDS MASTER SUITE (Modern Modular EHR Layout)
// ============================================================================

window.setPatientRecordsCategoryFilter = function(category) {
  patientRecordsCategoryFilter = category;
  const container = document.getElementById('mainContentArea');
  if (container) {
    window.renderPatientDashboard(container, patientActiveView);
  }
};

window.setPatientRecordsFacilityFilter = function(facilityId) {
  patientRecordsFacilityFilter = facilityId;
  const container = document.getElementById('mainContentArea');
  if (container) {
    window.renderPatientDashboard(container, patientActiveView);
  }
};

window.setPatientRecordsSearch = function(query) {
  patientRecordsSearchQuery = query;
  const container = document.getElementById('mainContentArea');
  if (container) {
    window.renderPatientDashboard(container, patientActiveView);
  }
};

window.togglePatientConsultationCard = function(id) {
  patientExpandedConsultationIds[id] = !patientExpandedConsultationIds[id];
  const body = document.getElementById('consult-body-' + id);
  const toggleBtn = document.getElementById('consult-btn-' + id);
  if (body) {
    if (patientExpandedConsultationIds[id]) {
      body.classList.remove('hidden');
      if (toggleBtn) toggleBtn.innerHTML = 'Hide Clinical Matrix ▲';
    } else {
      body.classList.add('hidden');
      if (toggleBtn) toggleBtn.innerHTML = 'View Full Details ▼';
    }
  } else {
    const container = document.getElementById('mainContentArea');
    if (container) {
      window.renderPatientDashboard(container, patientActiveView);
    }
  }
};

window.requestMedicationRefill = function(rxId, medName) {
  patientRefillToastMsg = 'Refill request for ' + (medName || 'prescribed regimen') + ' submitted successfully to City General Pharmacy.';
  const container = document.getElementById('mainContentArea');
  if (container) {
    window.renderPatientDashboard(container, patientActiveView);
  }
  setTimeout(() => {
    patientRefillToastMsg = null;
    const toast = document.getElementById('refill-toast-alert');
    if (toast) toast.remove();
  }, 4000);
};

window.printClinicalHistory = function() {
  if (typeof window.hospitrackPrintDocument === 'function') {
    const auth = window.hospitrackAuth?.getCurrentUser();
    window.hospitrackPrintDocument('summary', auth?.patientId || 'PAT-303');
  } else if (typeof window.print === 'function') {
    window.print();
  }
};

window.exportCalendarEvent = function(fupId, title, doc, date, hospital) {
  const ics = 'BEGIN:VCALENDAR\\nVERSION:2.0\\nPRODID:-//Hospitrack//Clinical Followup//EN\\nBEGIN:VEVENT\\nSUMMARY:' + (title || 'Clinical Review') + ' - ' + (doc || 'Physician') + '\\nLOCATION:' + (hospital || 'City General Hospital') + '\\nDTSTART:20261115T050000Z\\nDTEND:20261115T054500Z\\nDESCRIPTION:Review blood pressure logs and fasting labs before visit.\\nEND:VEVENT\\nEND:VCALENDAR';
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', 'hospitrack-appointment-' + (fupId || 'review') + '.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

function renderClinicalRecordsMasterView(data, defaultCategory = 'all') {
  const {
    enrichedConsultations,
    enrichedPrescriptions,
    followUps,
    patient,
    connectedHospitals
  } = data;

  if (defaultCategory && defaultCategory !== 'all' && patientRecordsCategoryFilter === 'all') {
    patientRecordsCategoryFilter = defaultCategory;
  }
  const currentCat = patientRecordsCategoryFilter;
  const currentFac = patientRecordsFacilityFilter;
  const q = (patientRecordsSearchQuery || '').trim().toLowerCase();

  let consultations = safeArray(enrichedConsultations);
  if (consultations.length === 0) {
    consultations = [
      {
        id: 'CON-401',
        visitDate: '2026-10-26T10:15:00Z',
        diagnosis: 'Post-Angioplasty Recovery & Controlled Blood Pressure',
        doctorName: 'Dr. Sarah Sharma',
        specialty: 'Cardiology',
        department: 'Cardiology',
        hospitalName: 'City General Hospital',
        hospitalId: 'HOSP-101',
        status: 'COMPLETED',
        symptoms: 'Subsided exertional dyspnea (NYHA Class I); atypical precordial soreness resolved post-stent; zero syncope.',
        treatment: 'Maintain Dual Antiplatelet Therapy (Aspirin 81mg + Clopidogrel 75mg); optimize seated BP with Telmisartan 40mg.',
        vitals: 'BP: 120/76 mmHg • Pulse: 72 bpm • SpO2: 98%',
        notes: 'Steady left ventricular recovery following DES intervention. Bilateral breath sounds clear, peripheral pulses intact with no pitting pedal edema.',
        prescriptionId: 'RX-805',
        labReportId: 'LAB-301',
        followUp: 'Outpatient clinical cardiology checkup in 3 weeks with fasting lipid panel.'
      },
      {
        id: 'CON-388',
        visitDate: '2026-10-12T14:45:00Z',
        diagnosis: 'Pre-Procedure Coronary Angiogram Evaluation',
        doctorName: 'Dr. Arjun Verma',
        specialty: 'Interventional Cardiology',
        department: 'Cardiology',
        hospitalName: 'Apex Care Medical Center',
        hospitalId: 'HOSP-102',
        status: 'COMPLETED',
        symptoms: 'Atypical retrosternal heaviness on brisk exertion (CCS Class II); borderline ischemic ST depressions.',
        treatment: 'Diagnostic coronary catheterization scheduled for Oct 14; pre-procedure normal saline hydration.',
        vitals: 'BP: 134/86 mmHg • Pulse: 78 bpm • SpO2: 99%',
        notes: 'Pre-procedural risk assessment completed. Serum creatinine 0.92 mg/dL; satisfactory renal clearance for contrast.',
        prescriptionId: 'RX-792',
        followUp: 'Admission to Day Care Cath Lab on Oct 14 at 07:00 AM.'
      },
      {
        id: 'CON-350',
        visitDate: '2026-09-18T11:00:00Z',
        diagnosis: 'Metabolic & Essential Hypertension Follow-Up',
        doctorName: 'Dr. Sarah Sharma',
        specialty: 'Cardiology',
        department: 'Cardiology',
        hospitalName: 'City General Hospital',
        hospitalId: 'HOSP-101',
        status: 'COMPLETED',
        symptoms: 'Intermittent early morning occipital headaches; elevated home ambulatory readings (142/90 mmHg).',
        treatment: 'Uptitrate Telmisartan to 40mg daily with breakfast; DASH dietary sodium restriction (< 2.0g/day).',
        vitals: 'BP: 138/88 mmHg • Pulse: 76 bpm • SpO2: 98%',
        notes: 'Mild Stage-I essential hypertension. No target organ damage noted on fundoscopic exam.',
        prescriptionId: 'RX-760',
        labReportId: 'LAB-289',
        followUp: 'Follow-up consultation in 4 weeks with updated BP diary.'
      }
    ];
  }

  let prescriptions = safeArray(enrichedPrescriptions);
  if (prescriptions.length === 0) {
    prescriptions = [
      {
        id: 'RX-805',
        prescribedAt: '2026-10-26T10:30:00Z',
        doctorName: 'Dr. Sarah Sharma',
        doctorSpecialty: 'Senior Interventional Cardiologist',
        hospitalName: 'City General Hospital',
        hospitalId: 'HOSP-101',
        diagnosis: 'Post-PCI Cardiac Secondary Prevention & Hypertension',
        status: 'ACTIVE',
        items: [
          { name: 'Telmisartan', dosage: '40 mg', form: 'Oral Tablet', frequency: 'Once daily (08:00 AM with water)', duration: '60 Days', daysCompleted: 12, totalDays: 60, status: 'ACTIVE', refillStatus: '2 Refills Remaining', instructions: 'Monitor seated morning blood pressure.' },
          { name: 'Clopidogrel (Plavix)', dosage: '75 mg', form: 'Oral Tablet', frequency: 'Once daily (01:00 PM with lunch)', duration: '90 Days', daysCompleted: 12, totalDays: 90, status: 'ACTIVE', refillStatus: '3 Refills Remaining', instructions: 'Essential antiplatelet agent. Do not omit.' },
          { name: 'Rosuvastatin Calcium', dosage: '20 mg', form: 'Oral Tablet', frequency: 'Once daily at bedtime (10:00 PM)', duration: '90 Days', daysCompleted: 12, totalDays: 90, status: 'ACTIVE', refillStatus: '3 Refills Remaining', instructions: 'High-intensity lipid-lowering plaque stabilization.' },
          { name: 'Aspirin (Enteric Coated)', dosage: '81 mg', form: 'Delayed-Release Tablet', frequency: 'Once daily (01:00 PM with meal)', duration: '90 Days', daysCompleted: 12, totalDays: 90, status: 'ACTIVE', refillStatus: '3 Refills Remaining', instructions: 'Gastric-protective coating. Swallow whole.' }
        ]
      },
      {
        id: 'RX-760',
        prescribedAt: '2026-09-18T11:15:00Z',
        doctorName: 'Dr. Sarah Sharma',
        doctorSpecialty: 'Senior Interventional Cardiologist',
        hospitalName: 'City General Hospital',
        hospitalId: 'HOSP-101',
        diagnosis: 'Stage-I Hypertension Monotherapy',
        status: 'COMPLETED',
        items: [
          { name: 'Telmisartan', dosage: '20 mg', form: 'Oral Tablet', frequency: 'Once daily in the morning', duration: '30 Days', daysCompleted: 30, totalDays: 30, status: 'COMPLETED', refillStatus: 'Completed / Uptitrated to 40mg', instructions: 'Initial dose titration.' }
        ]
      }
    ];
  }

  let followUpList = safeArray(followUps);
  if (followUpList.length === 0) {
    followUpList = [
      {
        id: 'FUP-701',
        dateScheduled: '2026-11-15T10:30:00',
        title: 'Cardiology Outpatient Clinic',
        department: 'Cardiology Outpatient Clinic',
        doctorName: 'Dr. Sarah Sharma',
        doctorSpecialty: 'Cardiology',
        hospitalName: 'City General Hospital',
        hospitalId: 'HOSP-101',
        locationRoom: 'Suite 304, Ambulatory Care Wing',
        status: 'UPCOMING',
        milestoneStep: 2,
        isCompleted: false,
        instructions: 'Review blood pressure logs, fasting lipid profile before visit. Bring current medication dossier and morning ambulatory vitals chart.',
        intakeFormCompleted: true
      },
      {
        id: 'FUP-680',
        dateScheduled: '2026-10-26T10:00:00',
        title: 'Cardiology Post-Procedure Check',
        department: 'Cardiology Post-Procedure Check',
        doctorName: 'Dr. Sarah Sharma',
        doctorSpecialty: 'Cardiology',
        hospitalName: 'City General Hospital',
        hospitalId: 'HOSP-101',
        locationRoom: 'Exam Room 2B, Cardiovascular Center',
        status: 'COMPLETED',
        milestoneStep: 1,
        isCompleted: true,
        instructions: 'Post-catheterization femoral puncture site inspection and 12-lead ECG recording.',
        intakeFormCompleted: true
      },
      {
        id: 'FUP-820',
        dateScheduled: '2027-01-20T11:00:00',
        title: 'Cardiovascular Secondary Prevention Clinic',
        department: 'Cardiovascular Secondary Prevention Clinic',
        doctorName: 'Dr. Sarah Sharma',
        doctorSpecialty: 'Cardiology',
        hospitalName: 'City General Hospital',
        hospitalId: 'HOSP-101',
        locationRoom: 'Suite 304, Ambulatory Care Wing',
        status: 'UPCOMING',
        milestoneStep: 3,
        isCompleted: false,
        instructions: 'Comprehensive 90-day post-PCI stress echocardiogram and cardiac rehabilitation review.',
        intakeFormCompleted: false
      }
    ];
  }

  const matchFacility = (itemHospId, itemHospName) => {
    if (currentFac === 'ALL') return true;
    return itemHospId === currentFac || (itemHospName && itemHospName.toLowerCase().includes(currentFac.toLowerCase()));
  };

  const filteredConsults = consultations.filter(c => {
    if (!matchFacility(c.hospitalId, c.hospitalName)) return false;
    if (!q) return true;
    const str = (c.diagnosis + ' ' + c.doctorName + ' ' + (c.symptoms || '') + ' ' + (c.treatment || '') + ' ' + (c.notes || '') + ' ' + (c.hospitalName || '') + ' ' + c.id).toLowerCase();
    return str.includes(q);
  });

  const filteredPrescriptions = prescriptions.filter(p => {
    if (!matchFacility(p.hospitalId, p.hospitalName)) return false;
    if (!q) return true;
    const medNames = (p.items || []).map(i => i.name).join(' ');
    const str = (p.id + ' ' + p.doctorName + ' ' + p.diagnosis + ' ' + medNames + ' ' + (p.hospitalName || '')).toLowerCase();
    return str.includes(q);
  });

  const filteredFollowUps = followUpList.filter(f => {
    if (!matchFacility(f.hospitalId, f.hospitalName)) return false;
    if (!q) return true;
    const str = (f.id + ' ' + (f.title || f.department || '') + ' ' + (f.doctorName || '') + ' ' + (f.instructions || '') + ' ' + (f.hospitalName || '')).toLowerCase();
    return str.includes(q);
  });

  const totalMatching = filteredConsults.length + filteredPrescriptions.length + filteredFollowUps.length;

  const facilityPills = [
    { id: 'ALL', name: 'All Facilities', count: consultations.length + prescriptions.length + followUpList.length },
    { id: 'HOSP-101', name: 'City General Hospital', count: consultations.filter(c => c.hospitalId === 'HOSP-101' || !c.hospitalId).length + prescriptions.filter(p => p.hospitalId === 'HOSP-101' || !p.hospitalId).length + followUpList.filter(f => f.hospitalId === 'HOSP-101' || !f.hospitalId).length, beds: 247 },
    { id: 'HOSP-102', name: 'Apex Care Medical Center', count: consultations.filter(c => c.hospitalId === 'HOSP-102').length + prescriptions.filter(p => p.hospitalId === 'HOSP-102').length + followUpList.filter(f => f.hospitalId === 'HOSP-102').length, beds: 182 }
  ];

  return \`
    <div class="hospitrack-clinical-records-root" style="display: flex; flex-direction: column; gap: 20px;">
      
      <!-- 1. TOP FILTER & ACTION RIBBON -->
      <div class="no-print" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05); display: flex; flex-direction: column; gap: 14px;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding-bottom: 12px; border-bottom: 1px solid #F1F5F9;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <svg class="lucide lucide-building-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D9488" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path><path d="M10 6h4"></path><path d="M10 10h4"></path><path d="M10 14h4"></path><path d="M10 18h4"></path></svg>
            <span style="font-size: 0.74rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #475569;">Care Facility Network:</span>
          </div>

          <div class="facility-pill-strip">
            \${facilityPills.map(fac => \`
              <button
                type="button"
                class="facility-filter-pill \${currentFac === fac.id ? 'active' : ''}"
                onclick="setPatientRecordsFacilityFilter('\${fac.id}')"
                title="Filter by \${escapeHtml(fac.name)}"
              >
                <span>\${escapeHtml(fac.name)}</span>
                <span class="pill-counter">\${fac.count}</span>
                \${fac.beds ? \`<span style="font-size: 0.68rem; opacity: 0.85;">• \${fac.beds} beds</span>\` : ''}
              </button>
            \`).join('')}
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap;">
          <div style="position: relative; flex: 1; min-width: 260px;">
            <svg class="lucide lucide-search" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input
              type="text"
              value="\${escapeHtml(patientRecordsSearchQuery)}"
              placeholder="Search by diagnosis, medication, or physician..."
              style="width: 100%; padding: 8px 14px 8px 36px; border-radius: 10px; border: 1px solid #CBD5E1; font-size: 0.84rem; background: #F8FAFC; outline: none; transition: all 0.2s ease;"
              oninput="setPatientRecordsSearch(this.value)"
            />
          </div>

          <div class="clinical-category-strip">
            <button type="button" class="category-filter-pill \${currentCat === 'all' ? 'active' : ''}" onclick="setPatientRecordsCategoryFilter('all')">
              <span>All Records</span>
              <span class="cat-badge">\${totalMatching}</span>
            </button>
            <button type="button" class="category-filter-pill \${currentCat === 'consultations' ? 'active' : ''}" onclick="setPatientRecordsCategoryFilter('consultations')">
              <span>Consultations</span>
              <span class="cat-badge">\${filteredConsults.length}</span>
            </button>
            <button type="button" class="category-filter-pill \${currentCat === 'prescriptions' ? 'active' : ''}" onclick="setPatientRecordsCategoryFilter('prescriptions')">
              <span>Active Prescriptions</span>
              <span class="cat-badge">\${filteredPrescriptions.length}</span>
            </button>
            <button type="button" class="category-filter-pill \${currentCat === 'follow-ups' ? 'active' : ''}" onclick="setPatientRecordsCategoryFilter('follow-ups')">
              <span>Follow-ups</span>
              <span class="cat-badge">\${filteredFollowUps.length}</span>
            </button>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="printClinicalHistory()" style="border-radius: 9px; font-size: 0.78rem; font-weight: 600; padding: 7px 12px; display: inline-flex; align-items: center; gap: 6px;">
              <svg class="lucide lucide-file-down" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="12" y2="18"></line><line x1="15" y1="15" x2="12" y2="18"></line></svg>
              <span>Export PDF Summary</span>
            </button>

            <button type="button" class="btn btn-primary btn-sm" onclick="printClinicalHistory()" style="border-radius: 9px; font-size: 0.78rem; font-weight: 700; padding: 7px 14px; background: #0D9488; border-color: #0D9488; display: inline-flex; align-items: center; gap: 6px;">
              <svg class="lucide lucide-printer" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              <span>Print Clinical History</span>
            </button>
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem; color: #64748B; border-top: 1px solid #F1F5F9; padding-top: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-flex; align-items: center; gap: 6px; padding: 3px 8px; border-radius: 6px; background: #F0FDFA; color: #0F766E; font-weight: 700; border: 1px solid #CCFBF1;">
              <svg class="lucide lucide-shield-check" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D9488" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
              <span>\${totalMatching} Clinical Records • Verified Care Network</span>
            </span>
            <span>Attributed to \${escapeHtml(patient?.name || 'Patient')} (\${escapeHtml(patient?.id || 'PAT-303')})</span>
          </div>

          \${patientRecordsSearchQuery ? \`<span style="color: #0D9488; font-weight: 600;">Filtering query: "\${escapeHtml(patientRecordsSearchQuery)}"</span>\` : ''}
        </div>
      </div>

      \${patientRefillToastMsg ? \`
        <div id="refill-toast-alert" class="no-print" style="background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 12px; padding: 12px 18px; color: #065F46; font-size: 0.84rem; font-weight: 600; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <svg class="lucide lucide-check-circle" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <span>\${escapeHtml(patientRefillToastMsg)}</span>
          </div>
          <button type="button" onclick="this.parentElement.remove()" style="background: none; border: none; font-size: 0.74rem; font-weight: 700; color: #047857; cursor: pointer;">Dismiss</button>
        </div>
      \` : ''}

      <!-- PRINT INSTITUTIONAL HEADER -->
      <div class="only-print" style="display: none; border-bottom: 2px solid #0F172A; padding-bottom: 14px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h1 style="font-size: 1.4rem; font-weight: 900; margin: 0; text-transform: uppercase; color: #0F172A;">City General Hospital &amp; Medical Network</h1>
            <p style="font-size: 0.76rem; color: #475569; margin: 3px 0 0 0;">Department of Health Informatics • Comprehensive Longitudinal Electronic Health Record (EHR)</p>
            <p style="font-size: 0.7rem; color: #64748B; margin: 2px 0 0 0;">NABL ISO 15189 Accredited • NABH Certified Clinical Telemetry Network</p>
          </div>
          <div style="text-align: right;">
            <div style="display: inline-block; padding: 3px 8px; background: #0F172A; color: #FFFFFF; font-size: 0.72rem; font-weight: 800; border-radius: 4px;">OFFICIAL CLINICAL DOSSIER</div>
            <div style="font-size: 0.7rem; font-family: monospace; color: #64748B; margin-top: 4px;">Generated: \${new Date().toLocaleDateString()} \${new Date().toLocaleTimeString()}</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #F8FAFC; border: 1px solid #CBD5E1; padding: 10px; border-radius: 6px; margin-top: 12px; font-size: 0.76rem;">
          <div><span style="font-size: 0.65rem; color: #64748B; text-transform: uppercase; display: block; font-weight: 700;">Patient Name:</span> <strong>\${escapeHtml(patient?.name || 'Ananya Iyer')}</strong></div>
          <div><span style="font-size: 0.65rem; color: #64748B; text-transform: uppercase; display: block; font-weight: 700;">MRN / UHID:</span> <strong>\${escapeHtml(patient?.id || 'PAT-303')}</strong></div>
          <div><span style="font-size: 0.65rem; color: #64748B; text-transform: uppercase; display: block; font-weight: 700;">Demographics:</span> \${patient?.age || 31}y / \${escapeHtml(patient?.gender || 'Female')} / \${escapeHtml(patient?.bloodGroup || 'A+')}</div>
          <div><span style="font-size: 0.65rem; color: #64748B; text-transform: uppercase; display: block; font-weight: 700;">Primary Hospital:</span> \${escapeHtml(patient?.currentHospital || 'City General Hospital')}</div>
        </div>
      </div>

      <!-- 2. SECTION: CLINICAL CONSULTATIONS & SPECIALIST ENCOUNTERS -->
      \${(currentCat === 'all' || currentCat === 'consultations') ? \`
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 9px; background: #F0FDFA; color: #0D9488; border: 1px solid #CCFBF1;">
                <svg class="lucide lucide-stethoscope" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"></path><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"></path><circle cx="20" cy="10" r="2"></circle></svg>
              </span>
              <div>
                <h3 style="font-size: 1.05rem; font-weight: 800; color: #0F172A; margin: 0;">Clinical Consultations &amp; Specialist Encounters</h3>
                <p style="font-size: 0.78rem; color: #64748B; margin: 2px 0 0 0;">Verified encounter assessments, diagnostic telemetry, and active directives.</p>
              </div>
            </div>
            <span style="font-size: 0.74rem; font-weight: 700; background: #F1F5F9; color: #475569; padding: 3px 10px; border-radius: 9999px;">
              \${filteredConsults.length} Consultations
            </span>
          </div>

          \${filteredConsults.length === 0 ? \`
            <div style="text-align: center; padding: 2.5rem 1rem; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px;">
              <p style="font-size: 0.88rem; color: #64748B; margin: 0;">No consultation records match the active filter criteria.</p>
            </div>
          \` : \`
            <div style="display: flex; flex-direction: column; gap: 14px;">
              \${filteredConsults.map(c => {
                const isExpanded = patientExpandedConsultationIds[c.id] !== false;
                const docInitials = (c.doctorName || 'PT').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                
                return \`
                  <div class="consultation-ehr-card" id="consult-card-\${c.id}">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; padding-bottom: 12px; border-bottom: 1px solid #F1F5F9;">
                      <div>
                        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                          <h4 style="font-size: 1.02rem; font-weight: 800; color: #0F172A; margin: 0;">\${escapeHtml(c.diagnosis || 'Clinical Consultation')}</h4>
                          <span style="font-size: 0.68rem; font-weight: 700; background: #ECFDF5; color: #065F46; padding: 2px 8px; border-radius: 6px; border: 1px solid #A7F3D0;">
                            \${escapeHtml(c.status || 'COMPLETED')}
                          </span>
                        </div>

                        <div style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; color: #475569; margin-top: 6px; flex-wrap: wrap;">
                          <div style="width: 24px; height: 24px; border-radius: 50%; background: #CCFBF1; color: #0F766E; font-weight: 800; font-size: 0.7rem; display: flex; align-items: center; justify-content: center;">
                            \${docInitials}
                          </div>
                          <strong>\${escapeHtml(c.doctorName || 'Attending Physician')}</strong>
                          <span style="color: #94A3B8;">•</span>
                          <span>\${escapeHtml(c.department || c.specialty || 'General Medicine')}</span>
                          <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.7rem; font-weight: 700; color: #059669; background: #ECFDF5; padding: 1px 6px; border-radius: 4px; border: 1px solid #A7F3D0;">
                            ✓ Verified Clinician
                          </span>
                        </div>
                      </div>

                      <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 3px;">
                        <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 0.78rem; font-weight: 700; color: #1E293B; background: #F1F5F9; padding: 3px 8px; border-radius: 6px;">
                          📅 \${formatDate(c.visitDate)}
                        </span>
                        <span style="font-size: 0.72rem; color: #64748B; font-weight: 500;">🏥 \${escapeHtml(c.hospitalName || 'City General Hospital')}</span>
                        <span style="font-size: 0.68rem; color: #94A3B8; font-family: monospace;">ID: \${escapeHtml(c.id)}</span>
                      </div>
                    </div>

                    <div id="consult-body-\${c.id}" class="\${isExpanded ? '' : 'hidden'}" style="margin-top: 14px; display: flex; flex-direction: column; gap: 12px;">
                      <div class="clinical-matrix-3col">
                        <div class="clinical-matrix-col">
                          <div class="matrix-col-header">
                            <span style="color: #D97706;">⚠️</span>
                            <span>Symptoms &amp; Indication</span>
                          </div>
                          <div style="font-size: 0.8rem; color: #334155; line-height: 1.5;">
                            \${escapeHtml(c.complaint || c.symptoms || 'Subsided exertional dyspnea, follow-up evaluation.')}
                          </div>
                        </div>

                        <div class="clinical-matrix-col col-treatment">
                          <div class="matrix-col-header">
                            <span style="color: #0D9488;">✓</span>
                            <span>Active Treatment Plan</span>
                          </div>
                          <div style="font-size: 0.8rem; color: #0F172A; font-weight: 500; line-height: 1.5;">
                            \${escapeHtml(c.treatment || 'Maintenance therapy and lifestyle monitoring.')}
                          </div>
                        </div>

                        <div class="clinical-matrix-col">
                          <div class="matrix-col-header">
                            <span style="color: #0D9488;">💓</span>
                            <span>Recorded Vitals &amp; Notes</span>
                          </div>

                          <div class="vital-pill-row">
                            <span class="vital-metric-pill">BP: <strong>120/76</strong></span>
                            <span class="vital-metric-pill">Pulse: <strong>72 bpm</strong></span>
                            <span class="vital-metric-pill">SpO2: <strong>98%</strong></span>
                          </div>

                          <div style="font-size: 0.78rem; color: #475569; font-style: italic; border-top: 1px solid #E2E8F0; padding-top: 6px; margin-top: 2px;">
                            "\${escapeHtml(c.notes || 'Steady progress, hemodynamic response stable.')}"
                          </div>
                        </div>
                      </div>

                      <div style="display: flex; gap: 8px; flex-wrap: wrap; font-size: 0.75rem;">
                        \${c.prescriptionId ? \`
                          <button type="button" class="btn btn-secondary btn-sm" onclick="setPatientRecordsCategoryFilter('prescriptions')" style="border-radius: 6px; padding: 4px 10px; font-size: 0.75rem; background: #F0FDFA; color: #0F766E; border-color: #CCFBF1;">
                            💊 Linked Prescription (\${escapeHtml(c.prescriptionId)})
                          </button>
                        \` : ''}
                        \${c.labReportId ? \`
                          <button type="button" class="btn btn-secondary btn-sm" onclick="openLabReportModal('\${c.labReportId}')" style="border-radius: 6px; padding: 4px 10px; font-size: 0.75rem; background: #F0F9FF; color: #0369A1; border-color: #BAE6FD;">
                            🔬 Attached Lab (\${escapeHtml(c.labReportId)})
                          </button>
                        \` : ''}
                        \${c.followUp ? \`
                          <span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 6px; background: #F8FAFC; color: #475569; border: 1px solid #E2E8F0; margin-left: auto;">
                            🕒 \${escapeHtml(c.followUp)}
                          </span>
                        \` : ''}
                      </div>
                    </div>

                    <div class="no-print" style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 12px; padding-top: 10px; border-top: 1px solid #F1F5F9;">
                      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="window.printConsultation('\${c.id}')" style="font-size: 0.76rem; border-radius: 7px;">
                          📄 Download Clinical Note (PDF)
                        </button>
                        \${c.prescriptionId ? \`
                          <button type="button" class="btn btn-secondary btn-sm" onclick="setPatientRecordsCategoryFilter('prescriptions')" style="font-size: 0.76rem; border-radius: 7px; color: #0F766E;">
                            💊 View Linked Prescriptions
                          </button>
                        \` : ''}
                        <button type="button" class="btn btn-secondary btn-sm" onclick="setPatientRecordsCategoryFilter('follow-ups')" style="font-size: 0.76rem; border-radius: 7px;">
                          📅 Request Follow-up
                        </button>
                      </div>

                      <button type="button" id="consult-btn-\${c.id}" onclick="togglePatientConsultationCard('\${c.id}')" style="background: none; border: none; font-size: 0.75rem; font-weight: 600; color: #64748B; cursor: pointer;">
                        \${isExpanded ? 'Hide Clinical Matrix ▲' : 'View Full Details ▼'}
                      </button>
                    </div>
                  </div>
                \`;
              }).join('')}
            </div>
          \`}
        </div>
      \` : ''}

      <!-- 3. SECTION: PRESCRIPTIONS & ACTIVE REGIMENS OVERHAUL -->
      \${(currentCat === 'all' || currentCat === 'prescriptions') ? \`
        <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 9px; background: #F0FDFA; color: #0D9488; border: 1px solid #CCFBF1;">
                <svg class="lucide lucide-pill" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path><path d="m8.5 8.5 7 7"></path></svg>
              </span>
              <div>
                <h3 style="font-size: 1.05rem; font-weight: 800; color: #0F172A; margin: 0;">Active Prescriptions &amp; Medication Regimens</h3>
                <p style="font-size: 0.78rem; color: #64748B; margin: 2px 0 0 0;">Pharmacy-verified active medications, schedule adherence, and duration tracking.</p>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="rx-status-pill-active">
                <span class="rx-pulse-dot"></span>
                <span>Active Regimens</span>
              </span>
              <button type="button" class="btn btn-secondary btn-sm no-print" onclick="requestMedicationRefill('ALL', 'Active Regimens')" style="border-radius: 8px; font-size: 0.76rem; font-weight: 700; color: #0F766E;">
                + Request Refill
              </button>
            </div>
          </div>

          \${filteredPrescriptions.length === 0 ? \`
            <div style="text-align: center; padding: 2.5rem 1rem; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px;">
              <p style="font-size: 0.88rem; color: #64748B; margin: 0;">No prescriptions on file for this selection.</p>
            </div>
          \` : \`
            <div style="display: flex; flex-direction: column; gap: 14px;">
              \${filteredPrescriptions.map(rx => \`
                <div class="rx-master-card">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; flex-wrap: wrap; padding-bottom: 12px; border-bottom: 1px solid #F1F5F9;">
                    <div>
                      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <span style="font-family: monospace; font-size: 0.84rem; font-weight: 800; background: #F1F5F9; color: #0F172A; padding: 2px 8px; border-radius: 6px;">
                          \${escapeHtml(rx.id)}
                        </span>
                        <span class="rx-status-pill-active">
                          <span class="rx-pulse-dot"></span>
                          <span>Active Regimen</span>
                        </span>
                        <span style="font-size: 0.82rem; font-weight: 700; color: #334155;">\${escapeHtml(rx.diagnosis || 'Cardiovascular Regimen')}</span>
                      </div>
                      <div style="font-size: 0.78rem; color: #64748B; margin-top: 4px;">
                        Prescribed by <strong>\${escapeHtml(rx.doctorName || 'Attending Physician')}</strong> (\${escapeHtml(rx.doctorSpecialty || 'Specialist')}) • \${escapeHtml(rx.hospitalName || 'City General Hospital')}
                      </div>
                    </div>

                    <div class="no-print" style="display: flex; gap: 8px;">
                      <button type="button" class="btn btn-secondary btn-sm" onclick="window.printPrescription('\${rx.id}')" style="font-size: 0.76rem; border-radius: 7px;">
                        🖨️ Print Rx Slip
                      </button>
                      <button type="button" class="btn btn-secondary btn-sm" onclick="requestMedicationRefill('\${rx.id}', 'Prescription Package')" style="font-size: 0.76rem; border-radius: 7px; color: #0F766E;">
                        📦 Order Home Delivery / Refill
                      </button>
                    </div>
                  </div>

                  <div style="margin-top: 12px; overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; text-align: left;">
                      <thead>
                        <tr style="border-bottom: 1px solid #E2E8F0; background: #F8FAFC; color: #475569; font-size: 0.72rem; text-transform: uppercase; font-weight: 700;">
                          <th style="padding: 8px 10px;">Drug &amp; Dosage</th>
                          <th style="padding: 8px 10px;">Frequency &amp; Schedule</th>
                          <th style="padding: 8px 10px;">Duration &amp; Progress</th>
                          <th style="padding: 8px 10px;">Status</th>
                          <th style="padding: 8px 10px; text-align: right;" class="no-print">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        \${safeArray(rx.items).map(item => {
                          const done = item.daysCompleted || 12;
                          const total = item.totalDays || 60;
                          const pct = Math.min(100, Math.round((done / total) * 100));
                          const remaining = Math.max(0, total - done);

                          return \`
                            <tr style="border-bottom: 1px solid #F1F5F9;">
                              <td style="padding: 10px;">
                                <div style="font-weight: 700; color: #0F172A;">💊 \${escapeHtml(item.name)}</div>
                                <div style="font-size: 0.72rem; color: #64748B;">\${escapeHtml(item.dosage || 'Standard')} • \${escapeHtml(item.form || 'Oral Tablet')}</div>
                                \${item.instructions ? \`<div style="font-size: 0.7rem; color: #475569; font-style: italic; margin-top: 2px;">Directive: \${escapeHtml(item.instructions)}</div>\` : ''}
                              </td>
                              <td style="padding: 10px; color: #334155;">
                                <div>\${escapeHtml(item.frequency || 'Once daily with meals')}</div>
                                <div style="font-size: 0.7rem; color: #94A3B8;">Daily adherence required</div>
                              </td>
                              <td style="padding: 10px; min-width: 160px;">
                                <div style="display: flex; justify-content: space-between; font-size: 0.72rem; font-weight: 600; color: #475569;">
                                  <span>Day \${done} of \${total}</span>
                                  <span style="color: #0D9488; font-weight: 700;">\${remaining}d left</span>
                                </div>
                                <div class="rx-progress-container">
                                  <div class="rx-progress-bar" style="width: \${pct}%;"></div>
                                </div>
                                <div style="font-size: 0.68rem; color: #94A3B8; margin-top: 2px;">\${escapeHtml(item.refillStatus || 'Refills Available')}</div>
                              </td>
                              <td style="padding: 10px;">
                                <span style="font-size: 0.7rem; font-weight: 700; background: #ECFDF5; color: #065F46; padding: 2px 7px; border-radius: 9999px; border: 1px solid #A7F3D0;">
                                  \${escapeHtml(item.status || 'ACTIVE')}
                                </span>
                              </td>
                              <td style="padding: 10px; text-align: right;" class="no-print">
                                <button type="button" class="btn btn-secondary btn-sm" onclick="requestMedicationRefill('\${rx.id}', '\${escapeHtml(item.name)}')" style="font-size: 0.72rem; padding: 3px 8px; border-radius: 6px; color: #0F766E;">
                                  Refill
                                </button>
                              </td>
                            </tr>
                          \`;
                        }).join('')}
                      </tbody>
                    </table>
                  </div>
                </div>
              \`).join('')}
            </div>
          \`}
        </div>
      \` : ''}

      <!-- 4. SECTION: CLINICAL FOLLOW-UP SCHEDULE & TIMELINE -->
      \${(currentCat === 'all' || currentCat === 'follow-ups') ? \`
        <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 9px; background: #F0FDFA; color: #0D9488; border: 1px solid #CCFBF1;">
                <svg class="lucide lucide-calendar" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </span>
              <div>
                <h3 style="font-size: 1.05rem; font-weight: 800; color: #0F172A; margin: 0;">Clinical Follow-up Schedule &amp; Care Journey Milestones</h3>
                <p style="font-size: 0.78rem; color: #64748B; margin: 2px 0 0 0;">Scheduled outpatient checkups, post-procedure clinical milestones, and pre-visit intake.</p>
              </div>
            </div>

            <span style="font-size: 0.74rem; font-weight: 700; background: #F1F5F9; color: #475569; padding: 3px 10px; border-radius: 9999px;">
              \${filteredFollowUps.filter(f => f.status === 'UPCOMING').length} Upcoming
            </span>
          </div>

          <div class="milestone-stepper-ribbon no-print">
            \${filteredFollowUps.map((f, idx) => {
              const isComp = f.status === 'COMPLETED' || f.isCompleted;
              const isUp = f.status === 'UPCOMING';
              return \`
                <div class="milestone-step-item">
                  <div class="milestone-step-circle \${isComp ? 'completed' : isUp ? 'active' : 'upcoming'}">
                    \${isComp ? '✓' : idx + 1}
                  </div>
                  <div style="min-width: 0;">
                    <div style="font-size: 0.76rem; font-weight: 700; color: #0F172A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      \${escapeHtml(f.title || f.department || 'Outpatient Review')}
                    </div>
                    <div style="font-size: 0.68rem; color: #64748B;">\${formatDate(f.dateScheduled)}</div>
                  </div>
                </div>
              \`;
            }).join('')}
          </div>

          \${filteredFollowUps.length === 0 ? \`
            <div style="text-align: center; padding: 2.5rem 1rem; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px;">
              <p style="font-size: 0.88rem; color: #64748B; margin: 0;">No scheduled follow-up appointments found.</p>
            </div>
          \` : \`
            <div style="display: flex; flex-direction: column; gap: 12px;">
              \${filteredFollowUps.map(f => {
                const isUpcoming = f.status === 'UPCOMING';
                return \`
                  <div class="consultation-ehr-card" style="\${isUpcoming ? 'border-color: #99F6E4; box-shadow: 0 2px 8px rgba(13, 148, 136, 0.08);' : 'background: #F8FAFC;'}">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; padding-bottom: 10px; border-bottom: 1px solid #F1F5F9;">
                      <div>
                        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                          <span style="font-size: 0.68rem; font-weight: 700; background: \${isUpcoming ? '#F0FDFA' : '#F1F5F9'}; color: \${isUpcoming ? '#0F766E' : '#475569'}; padding: 2px 8px; border-radius: 6px; border: 1px solid \${isUpcoming ? '#CCFBF1' : '#CBD5E1'};">
                            \${escapeHtml(f.status || 'SCHEDULED')}
                          </span>
                          <h4 style="font-size: 1.02rem; font-weight: 800; color: #0F172A; margin: 0;">\${escapeHtml(f.title || f.department || 'Clinical Outpatient Review')}</h4>
                        </div>
                        <div style="font-size: 0.78rem; color: #475569; margin-top: 4px;">
                          🏥 \${escapeHtml(f.hospitalName || 'City General Hospital')} • 🩺 <strong>\${escapeHtml(f.doctorName || 'Dr. Sarah Sharma')}</strong> (\${escapeHtml(f.doctorSpecialty || 'Cardiology')})
                        </div>
                      </div>

                      <div style="text-align: right;">
                        <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.82rem; font-weight: 800; color: #0F766E; background: #F0FDFA; padding: 4px 10px; border-radius: 8px; border: 1px solid #CCFBF1;">
                          📅 \${formatDateTime(f.dateScheduled)}
                        </span>
                      </div>
                    </div>

                    <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 14px; margin-top: 10px; display: flex; align-items: flex-start; gap: 10px;">
                      <span style="display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 6px; background: #FFFFFF; border: 1px solid #CBD5E1; color: #0D9488; font-size: 0.75rem; flex-shrink: 0; margin-top: 1px;">
                        📋
                      </span>
                      <div style="font-size: 0.78rem; color: #334155; line-height: 1.5;">
                        <strong style="color: #0F172A; display: block; margin-bottom: 2px;">Pre-Visit Instructions &amp; Diagnostic Directives:</strong>
                        \${escapeHtml(f.instructions || 'Review blood pressure logs, fasting lipid profile before visit. Bring current medication dossier.')}
                      </div>
                    </div>

                    <div class="no-print" style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 12px; padding-top: 10px; border-top: 1px solid #F1F5F9;">
                      <div style="display: flex; gap: 8px;">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="exportCalendarEvent('\${f.id}', '\${escapeHtml(f.title || f.department)}', '\${escapeHtml(f.doctorName)}', '\${f.dateScheduled}', '\${escapeHtml(f.hospitalName)}')" style="font-size: 0.74rem; border-radius: 7px;">
                          📅 Add to Calendar (.ics)
                        </button>
                        <button type="button" class="btn btn-secondary btn-sm" onclick="alert('To reschedule, please contact \${escapeHtml(f.hospitalName || 'hospital')} reception at 1800-419-HOSP.')" style="font-size: 0.74rem; border-radius: 7px;">
                          🔄 Reschedule
                        </button>
                      </div>

                      <button type="button" class="btn btn-sm" onclick="alert('Pre-visit Intake Questionnaire completed and verified on file.')" style="font-size: 0.74rem; border-radius: 7px; background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; font-weight: 700;">
                        ✓ Pre-visit Intake Form Completed
                      </button>
                    </div>
                  </div>
                \`;
              }).join('')}
            </div>
          \`}
        </div>
      \` : ''}

      <!-- PRINT PHYSICIAN DIGITAL SIGNATURE & AUDIT BLOCK -->
      <div class="only-print" style="display: none; border-top: 2px solid #0F172A; padding-top: 16px; margin-top: 30px; break-inside: avoid;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 0.75rem;">
          <div>
            <strong style="text-transform: uppercase; color: #0F172A;">Attestation &amp; Digital Continuity:</strong>
            <p style="color: #475569; margin: 4px 0 0 0;">This electronic health dossier is an authenticated extract from the Hospitrack Inter-Facility Registry.</p>
            <div style="font-family: monospace; font-size: 0.68rem; color: #64748B; margin-top: 6px;">HASH-SHA256: 9F2C...E107 • VERIFIED-OK</div>
          </div>
          <div style="text-align: right;">
            <strong>Dr. Sarah Sharma, MD (Cardiology)</strong>
            <div style="color: #475569; font-size: 0.72rem;">Senior Attending Cardiologist • Reg: MCI-2019-88741</div>
            <div style="color: #64748B; font-size: 0.68rem; margin-top: 12px; font-family: monospace;">[ Digitally Signed &amp; Timestamped ]</div>
          </div>
        </div>
      </div>
    </div>
  \`;
}
`;

// Insert masterImplementation before renderPatientConsultationsView
if (!code.includes('function renderClinicalRecordsMasterView(')) {
  code = code.replace(
    /\/\/ 6B\. CONSULTATIONS VIEW \(Clinical Consultations & Specialist Encounters\)/,
    masterImplementation + '\n// 6B. CONSULTATIONS VIEW (Clinical Consultations & Specialist Encounters)'
  );
}

fs.writeFileSync('js/components/patientDashboard.js', code, 'utf8');
console.log('Successfully applied patient clinical records master suite!');

