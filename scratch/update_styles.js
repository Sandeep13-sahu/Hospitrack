const fs = require('fs');

let css = fs.readFileSync('css/styles.css', 'utf8');

// 1. Fix referral-modal-box width
css = css.replace(
  /\.referral-modal-box\s*\{[\s\S]*?width:\s*min\(740px,\s*94vw\)\s*!important;[\s\S]*?max-width:\s*740px\s*!important;/,
  `.referral-modal-box {
  width: min(780px, 96vw) !important;
  max-width: 780px !important;`
);

// 2. Fix referral-modal-footer flex wrap
css = css.replace(
  /\.referral-modal-footer,\s*\.referral-actions-bar\s*\{[\s\S]*?display:\s*flex;[\s\S]*?justify-content:\s*space-between;[\s\S]*?margin-top:\s*0;\s*\}/,
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
}`
);

// 3. Append clinical records styles if not present
if (!css.includes('PATIENT PORTAL CLINICAL RECORDS & EHR TELEMETRY SYSTEM')) {
  const clinicalStyles = `
/* ============================================================================
   PATIENT PORTAL CLINICAL RECORDS & EHR TELEMETRY SYSTEM
   ============================================================================ */

.hospitrack-clinical-records-root {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #0F172A;
}

/* Facility Network Switcher Pills */
.facility-pill-strip {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.facility-filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 600;
  border: 1px solid #CBD5E1;
  background: #F8FAFC;
  color: #475569;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.facility-filter-pill:hover {
  background: #F1F5F9;
  color: #0F172A;
  border-color: #94A3B8;
}

.facility-filter-pill.active {
  background: #0F766E !important;
  color: #FFFFFF !important;
  border-color: #0F766E !important;
  box-shadow: 0 2px 8px rgba(15, 118, 110, 0.25);
}

.facility-filter-pill .pill-counter {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1px 6px;
  border-radius: 9999px;
  font-size: 0.68rem;
  font-weight: 700;
  background: #E2E8F0;
  color: #334155;
}

.facility-filter-pill.active .pill-counter {
  background: rgba(255, 255, 255, 0.25);
  color: #FFFFFF;
}

/* Category Filter Pills */
.clinical-category-strip {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
}

.category-filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 700;
  border: 1px solid #E2E8F0;
  background: #FFFFFF;
  color: #475569;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.18s ease;
}

.category-filter-pill:hover {
  background: #F8FAFC;
  color: #0F172A;
}

.category-filter-pill.active {
  background: #0F172A !important;
  color: #FFFFFF !important;
  border-color: #0F172A !important;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.2);
}

.category-filter-pill .cat-badge {
  font-size: 0.68rem;
  padding: 1px 6px;
  border-radius: 9999px;
  background: #F1F5F9;
  color: #64748B;
  font-weight: 700;
}

.category-filter-pill.active .cat-badge {
  background: #1E293B;
  color: #E2E8F0;
}

/* Consultation EHR Card */
.consultation-ehr-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
  transition: all 0.2s ease;
  break-inside: avoid;
}

.consultation-ehr-card:hover {
  box-shadow: 0 4px 14px -2px rgba(15, 23, 42, 0.08);
  border-color: #CBD5E1;
}

/* 3-Column Structured Clinical Matrix */
.clinical-matrix-3col {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin: 14px 0;
}

@media (max-width: 860px) {
  .clinical-matrix-3col {
    grid-template-columns: 1fr;
  }
}

.clinical-matrix-col {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.clinical-matrix-col.col-treatment {
  background: rgba(240, 253, 250, 0.7);
  border-color: #99F6E4;
}

.matrix-col-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.74rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #475569;
}

.col-treatment .matrix-col-header {
  color: #0F766E;
}

.matrix-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.8rem;
  color: #334155;
  line-height: 1.45;
}

.matrix-checklist-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-weight: 500;
  color: #0F172A;
}

.matrix-check-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #CCFBF1;
  color: #0F766E;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  flex-shrink: 0;
  margin-top: 1px;
}

/* Pill Metrics */
.vital-pill-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.vital-metric-pill {
  background: #FFFFFF;
  border: 1px solid #CBD5E1;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 0.74rem;
  font-weight: 600;
  color: #334155;
}

.vital-metric-pill strong {
  color: #0D9488;
  font-weight: 800;
}

/* Rx Master Card */
.rx-master-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
  transition: all 0.2s ease;
  break-inside: avoid;
}

.rx-master-card:hover {
  box-shadow: 0 4px 14px -2px rgba(15, 23, 42, 0.08);
  border-color: #CBD5E1;
}

.rx-status-pill-active {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 9999px;
  background: #ECFDF5;
  color: #065F46;
  border: 1px solid #A7F3D0;
  font-size: 0.74rem;
  font-weight: 700;
}

.rx-pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10B981;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: rxPulse 1.8s infinite;
}

@keyframes rxPulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

/* Medication Progress Bar */
.rx-progress-container {
  width: 100%;
  background: #F1F5F9;
  border-radius: 9999px;
  height: 7px;
  overflow: hidden;
  border: 1px solid #E2E8F0;
  margin-top: 4px;
}

.rx-progress-bar {
  height: 100%;
  border-radius: 9999px;
  background: #0D9488;
  transition: width 0.4s ease;
}

/* Care Journey Milestone Stepper */
.milestone-stepper-ribbon {
  display: flex;
  align-items: center;
  gap: 12px;
  overflow-x: auto;
  padding: 12px 16px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
}

.milestone-step-item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 180px;
  flex: 1;
}

.milestone-step-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.76rem;
  font-weight: 800;
  flex-shrink: 0;
}

.milestone-step-circle.completed {
  background: #059669;
  color: #FFFFFF;
}

.milestone-step-circle.active {
  background: #0D9488;
  color: #FFFFFF;
  box-shadow: 0 0 0 4px #CCFBF1;
}

.milestone-step-circle.upcoming {
  background: #E2E8F0;
  color: #64748B;
}

/* Responsive Footer Wrap */
@media (max-width: 640px) {
  .referral-modal-footer,
  .referral-actions-bar {
    flex-direction: column-reverse !important;
    align-items: stretch !important;
    gap: 8px !important;
    padding: 10px 14px !important;
  }
  .referral-footer-left,
  .referral-footer-right,
  .referral-actions-right {
    width: 100% !important;
    justify-content: space-between !important;
    margin-left: 0 !important;
  }
  .btn-dispatch-referral,
  .btn-referral-preview {
    flex: 1 !important;
    justify-content: center !important;
    min-width: 0 !important;
  }
}

/* Printable Institutional Dossier */
@media print {
  .no-print,
  .sidebar,
  .top-app-bar,
  .patient-top-bar,
  .sub-pill-tabs-nav,
  .page-actions-toolbar,
  .btn,
  button,
  .modal-overlay {
    display: none !important;
  }

  .only-print {
    display: block !important;
  }

  .hospitrack-clinical-records-root {
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .consultation-ehr-card,
  .rx-master-card {
    border: 1px solid #94A3B8 !important;
    box-shadow: none !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    margin-bottom: 16px !important;
    padding: 14px !important;
  }

  .clinical-matrix-col {
    background: #F8FAFC !important;
    border: 1px solid #CBD5E1 !important;
  }
}
`;
  css += '\n' + clinicalStyles;
}

fs.writeFileSync('css/styles.css', css, 'utf8');
console.log('Successfully updated css/styles.css');

