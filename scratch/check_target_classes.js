const fs = require('fs');

const css = fs.readFileSync('css/styles.css', 'utf8');

const targetClasses = [
  'auth-page-wrapper',
  'auth-split-container',
  'auth-brand-pane',
  'auth-brand-logo-hero',
  'auth-brand-logo-icon',
  'auth-brand-text',
  'auth-brand-hero-msg',
  'auth-brand-features-list',
  'auth-brand-footer',
  'auth-card-pane',
  'role-tabs-modern',
  'role-tab',
  'header-profile-wrap',
  'profile-dropdown',
  'profile-dropdown-header',
  'profile-dropdown-info',
  'profile-dropdown-email',
  'profile-dropdown-body',
  'dropdown-item',
  'dropdown-divider',
  'dropdown-item-danger',
  'notification-btn-wrap',
  'notif-dropdown',
  'notif-header',
  'notif-list',
  'auth-identity-pill',
  'auth-header-details',
  'auth-header-name',
  'auth-header-badge',
  'dropdown-chevron',
  'system-status-pill',
  'status-dot',
  'badge-dot',
  'profile-field-box',
  'profile-field-label',
  'profile-field-value',
  'modal-actions',
  'table-responsive',
  'data-table',
  'pill-tabs-nav',
  'pill-tab',
  'pill-badge',
  'kpi-row-6',
  'kpi-card-clean',
  'evs-flow-stepper-track',
  'evs-kanban-board',
  'evs-bed-card'
];

let missing = 0;
targetClasses.forEach(cls => {
  const has = css.includes('.' + cls);
  if (!has) {
    console.log('STILL MISSING:', cls);
    missing++;
  }
});

console.log(`Audited ${targetClasses.length} key classes: ${targetClasses.length - missing} present, ${missing} missing.`);
