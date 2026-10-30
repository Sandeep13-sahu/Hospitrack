const fs = require('fs');
const css = fs.readFileSync('css/styles.css', 'utf8');

const doctorClasses = [
  'doctor-management-container',
  'doctor-header-clean',
  'doctor-title-block',
  'doctor-badge-row',
  'doctor-header-badge',
  'doctor-status-indicator',
  'doctor-page-title',
  'doctor-page-subtitle',
  'doctor-actions-toolbar',
  'doctor-kpi-row',
  'doctor-kpi-card',
  'doctor-kpi-top',
  'doctor-kpi-label',
  'doctor-kpi-icon',
  'doctor-kpi-value',
  'doctor-kpi-sub',
  'doctor-toolbar',
  'doctor-search-box',
  'doctor-search-icon',
  'doctor-search-input',
  'doctor-search-clear',
  'doctor-filter-group',
  'doctor-filter-select',
  'doctor-reset-btn',
  'doctor-results-count',
  'doctor-departments-list',
  'doc-dept-group-card',
  'doc-dept-group-header',
  'doc-dept-group-title-wrap',
  'doc-dept-group-icon',
  'doc-dept-group-title',
  'doc-dept-group-badge',
  'doc-cards-grid',
  'doctor-profile-card',
  'doctor-card-top-row',
  'doctor-card-avatar-wrap',
  'doctor-card-avatar',
  'doctor-status-dot',
  'doctor-card-identity',
  'doctor-card-name',
  'doctor-card-id-row',
  'doctor-card-dept-tag',
  'doctor-card-meta-grid',
  'doctor-card-meta-item',
  'doctor-card-meta-label',
  'doctor-card-meta-val',
  'doctor-card-status-bar',
  'doctor-card-actions',
  'doctor-drawer-overlay',
  'doctor-drawer'
];

let present = 0;
let missing = 0;
doctorClasses.forEach(cls => {
  const has = css.includes('.' + cls);
  if (!has) {
    console.log('MISSING in CSS:', cls);
    missing++;
  } else {
    present++;
  }
});
console.log(`Audited ${doctorClasses.length} doctor classes: ${present} present, ${missing} missing.`);

