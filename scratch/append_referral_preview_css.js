const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'css', 'styles.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

const marker = '/* ==========================================================================\n   OFFICIAL CLINICAL REFERRAL SLIP PREVIEW & REAL-WORLD PRINT STYLES';
const markerCRLF = '/* ==========================================================================\r\n   OFFICIAL CLINICAL REFERRAL SLIP PREVIEW & REAL-WORLD PRINT STYLES';

if (cssContent.includes(marker) || cssContent.includes(markerCRLF)) {
  console.log('CSS already contains referral preview styles, updating...');
  const idx = cssContent.includes(markerCRLF) ? cssContent.indexOf(markerCRLF) : cssContent.indexOf(marker);
  cssContent = cssContent.substring(0, idx);
}

const cssToAppend = `
/* ==========================================================================
   OFFICIAL CLINICAL REFERRAL SLIP PREVIEW & REAL-WORLD PRINT STYLES
   ========================================================================== */
.referral-preview-overlay {
  z-index: 1050 !important;
  background: rgba(15, 23, 42, 0.75) !important;
  backdrop-filter: blur(4px) !important;
  padding: 20px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.referral-preview-modal-box {
  width: min(880px, 96vw) !important;
  max-width: 880px !important;
  max-height: 92vh !important;
  display: flex !important;
  flex-direction: column !important;
  border-radius: 16px !important;
  overflow: hidden !important;
  background: #F8FAFC !important;
  box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.35) !important;
}

.referral-preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #0F172A;
  color: #FFFFFF;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.referral-preview-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.preview-mode-pill {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 9999px;
  background: rgba(45, 212, 191, 0.2);
  color: #2DD4BF;
  border: 1px solid rgba(45, 212, 191, 0.4);
  letter-spacing: 0.05em;
}

.referral-preview-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #FFFFFF;
}

.referral-preview-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-back-to-edit {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  background: rgba(255, 255, 255, 0.1) !important;
  color: #FFFFFF !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  font-weight: 600 !important;
  padding: 6px 12px !important;
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
}

.btn-back-to-edit:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  color: #FFFFFF !important;
}

.btn-print-letter {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  background: #0D9488 !important;
  color: #FFFFFF !important;
  border: 1px solid #0D9488 !important;
  font-weight: 700 !important;
  padding: 6px 14px !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.3) !important;
  transition: all 0.2s ease !important;
}

.btn-print-letter:hover {
  background: #0F766E !important;
}

.referral-preview-body {
  padding: 20px;
  overflow-y: auto;
  max-height: calc(92vh - 65px);
  background: #E2E8F0;
  display: flex;
  justify-content: center;
}

.referral-slip-paper {
  width: 100%;
  max-width: 800px;
  background: #FFFFFF;
  border: 1px solid #CBD5E1;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);
  padding: 28px 32px;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #0F172A;
}

.referral-slip-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding-bottom: 14px;
  border-bottom: 2px solid #0D9488;
  gap: 16px;
}

.referral-slip-brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.referral-slip-symbol {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #0D9488;
  color: #FFFFFF;
  font-weight: 900;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.referral-slip-hospital {
  font-size: 1.15rem;
  font-weight: 900;
  color: #0F172A;
  margin: 0;
  letter-spacing: -0.01em;
}

.referral-slip-dept {
  font-size: 0.82rem;
  font-weight: 700;
  color: #0D9488;
  margin: 2px 0 0 0;
}

.referral-slip-meta {
  font-size: 0.74rem;
  color: #64748B;
  margin: 2px 0 0 0;
}

.referral-slip-uid-box {
  text-align: right;
  flex-shrink: 0;
}

.referral-barcode {
  font-family: monospace;
  letter-spacing: 2.5px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0F172A;
}

.referral-uid-text {
  font-size: 0.8rem;
  color: #334155;
  margin-top: 2px;
}

.referral-date-text {
  font-size: 0.72rem;
  color: #64748B;
  margin-top: 1px;
}

.referral-title-strip {
  background: #F1F5F9;
  border: 1px solid #CBD5E1;
  border-radius: 6px;
  padding: 8px 12px;
  margin: 14px 0;
  text-align: center;
}

.referral-doc-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 900;
  color: #0F172A;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.referral-doc-sub {
  font-size: 0.75rem;
  font-weight: 700;
  color: #0D9488;
  margin-top: 2px;
}

.referral-meta-grid-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 14px;
}

.referral-meta-col {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 0.8rem;
}

.referral-meta-heading {
  font-size: 0.72rem;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid #E2E8F0;
  padding-bottom: 4px;
  margin-bottom: 6px;
}

.referral-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px 0;
  border-bottom: 1px dashed #F1F5F9;
}

.meta-label {
  color: #64748B;
  font-weight: 500;
}

.meta-val {
  color: #0F172A;
  font-weight: 600;
  text-align: right;
}

.meta-val.highlight {
  color: #0F172A;
  font-size: 0.88rem;
}

.meta-val.dest-hosp {
  color: #0F766E;
  font-weight: 700;
}

.status-indicator-tag {
  background: #E0F2FE;
  color: #0369A1;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
}

.priority-slip-pill {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 4px;
}

.priority-slip-pill.priority-routine {
  background: #ECFDF5;
  color: #065F46;
  border: 1px solid #A7F3D0;
}

.priority-slip-pill.priority-urgent {
  background: #FFFBEB;
  color: #92400E;
  border: 1px solid #FDE68A;
}

.priority-slip-pill.priority-emergency {
  background: #FEF2F2;
  color: #991B1B;
  border: 1px solid #FECACA;
}

.referral-section-box {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  margin-bottom: 12px;
  overflow: hidden;
  break-inside: avoid;
}

.referral-section-header {
  background: #F1F5F9;
  padding: 6px 12px;
  font-size: 0.74rem;
  font-weight: 800;
  color: #334155;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid #E2E8F0;
}

.referral-section-content {
  padding: 10px 14px;
  font-size: 0.84rem;
  line-height: 1.5;
  color: #1E293B;
}

.referral-section-content.reason-text {
  font-weight: 600;
  color: #0F172A;
  background: #FCFDFD;
}

.attached-records-badges {
  padding: 8px 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.record-badge {
  font-size: 0.72rem;
  font-weight: 700;
  background: #F0FDFA;
  color: #0F766E;
  border: 1px solid #99F6E4;
  padding: 3px 8px;
  border-radius: 6px;
}

.referral-signatures-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid #CBD5E1;
  break-inside: avoid;
}

.referral-sig-block {
  display: flex;
  flex-direction: column;
}

.sig-cursive {
  font-family: 'Brush Script MT', cursive, sans-serif;
  font-size: 1.35rem;
  color: #0F766E;
  margin-bottom: 4px;
  height: 28px;
}

.sig-empty-placeholder {
  height: 28px;
  margin-bottom: 4px;
}

.sig-line {
  height: 1px;
  background: #94A3B8;
  margin-bottom: 6px;
  width: 90%;
}

.sig-name {
  font-size: 0.84rem;
  font-weight: 800;
  color: #0F172A;
}

.sig-title {
  font-size: 0.74rem;
  color: #475569;
}

.sig-reg {
  font-size: 0.7rem;
  color: #64748B;
  margin-top: 2px;
}

.referral-slip-footer {
  margin-top: 16px;
  padding-top: 10px;
  border-top: 1px solid #E2E8F0;
  text-align: center;
  font-size: 0.7rem;
  color: #64748B;
  line-height: 1.4;
  break-inside: avoid;
}

.referral-footer-hash {
  font-size: 0.65rem;
  color: #94A3B8;
  margin-top: 3px;
  font-family: monospace;
}

/* Print Overrides */
@media print {
  @page {
    size: A4 portrait;
    margin: 15mm;
  }

  body.printing-referral-slip .no-print,
  body.printing-referral-slip .modal-overlay,
  body.printing-referral-slip .referral-preview-header,
  body.printing-referral-slip .app-header,
  body.printing-referral-slip .app-sidebar {
    display: none !important;
  }

  body.printing-referral-slip {
    background: #FFFFFF !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  body.printing-referral-slip #printable-medical-record {
    display: block !important;
    position: static !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  body.printing-referral-slip .print-referral-document {
    padding: 0 !important;
    border: none !important;
    box-shadow: none !important;
  }

  .referral-slip-paper {
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
  }
}
`;

const isCRLF = cssContent.includes('\r\n');
const formattedCss = isCRLF ? cssToAppend.replace(/\n/g, '\r\n') : cssToAppend;
fs.writeFileSync(cssPath, cssContent + formattedCss, 'utf8');
console.log('Appended referral preview CSS successfully');

