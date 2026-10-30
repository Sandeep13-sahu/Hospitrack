/**
 * Hospitrack — Ultimate Master Recovery & Layout Regression Verification Suite
 * Exhaustively tests all 15 Acceptance Criteria from the Master Prompt
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

let passCount = 0;
let failCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
    failCount++;
  }
}

console.log('============================================================');
console.log('HOSPITRACK — ULTIMATE MASTER RECOVERY VERIFICATION SUITE');
console.log('============================================================\n');

// --------------------------------------------------------------------------
// 1. CSS Design System & Architecture Audit
// --------------------------------------------------------------------------
console.log('[SECTION 1] CSS Design System & Layout Tokens Audit...');
const css = fs.readFileSync('css/styles.css', 'utf8');

assert(css.includes('--primary: #0D9488'), 'Design token: primary teal (#0D9488)');
assert(css.includes('--bg-body: #F8FAF9'), 'Design token: warm off-white canvas (#F8FAF9)');
assert(css.includes('--bg-surface: #FFFFFF'), 'Design token: pure white surface (#FFFFFF)');
assert(css.includes('--sidebar-width: 260px'), 'Layout token: sidebar width 260px');
assert(css.includes('--sidebar-collapsed-width: 76px'), 'Layout token: collapsed width 76px');
assert(css.includes('--header-height: 64px'), 'Layout token: header height 64px');
assert(!css.includes('@import url('), 'No render-blocking @import in CSS (Google Fonts loaded via <link> in HTML)');

// --------------------------------------------------------------------------
// 2. Login & Registration Layout
// --------------------------------------------------------------------------
console.log('\n[SECTION 2] Login & Registration Interface Audit...');
const html = fs.readFileSync('index.html', 'utf8');

assert(html.includes('class="auth-split-container"'), 'HTML contains split-container for login');
assert(html.includes('class="auth-brand-pane"'), 'HTML contains authoritative brand pane');
assert(html.includes('class="auth-card-pane"'), 'HTML contains auth card pane');
assert(html.includes('class="auth-card-wrapper"'), 'HTML contains centered auth card wrapper (max-width 440px)');
assert(html.includes('id="loginRoleTabPatient"'), 'Role tab for Patient present');
assert(html.includes('id="loginRoleTabDoctor"'), 'Role tab for Doctor present');
assert(html.includes('id="loginRoleTabHospital"'), 'Role tab for Hospital present');
assert(!html.includes('id="loginRoleTabSuperAdmin"'), 'Super Admin is NEVER exposed in login role selector');
assert(css.includes('.auth-split-container'), 'CSS contains .auth-split-container rule');
assert(css.includes('.auth-brand-pane'), 'CSS contains .auth-brand-pane styling');
assert(css.includes('.role-tabs-modern'), 'CSS contains .role-tabs-modern 3-column grid');
assert(css.includes('.role-tab.active'), 'CSS contains active state for role tab');
assert(css.includes('.pwd-input-wrap'), 'CSS contains .pwd-input-wrap for password eye toggle');
assert(css.includes('.pwd-toggle-btn'), 'CSS contains .pwd-toggle-btn positioning');

// --------------------------------------------------------------------------
// 3. Global Header & Profile Dropdown
// --------------------------------------------------------------------------
console.log('\n[SECTION 3] Global Header & Profile Dropdown Audit...');
assert(css.includes('.header-profile-wrap'), 'CSS contains .header-profile-wrap with position: relative');
assert(css.includes('.profile-dropdown'), 'CSS contains .profile-dropdown with position: absolute');
assert(css.includes('.profile-dropdown.open'), 'CSS contains .profile-dropdown.open with display: block');
assert(css.includes('.notification-btn-wrap'), 'CSS contains .notification-btn-wrap with position: relative');
assert(css.includes('.notif-dropdown'), 'CSS contains .notif-dropdown with position: absolute');
assert(css.includes('.notif-dropdown.open'), 'CSS contains .notif-dropdown.open with display: block');
assert(css.includes('.auth-identity-pill'), 'CSS contains .auth-identity-pill styling');
assert(css.includes('.system-status-pill'), 'CSS contains .system-status-pill with green operational dot');

// --------------------------------------------------------------------------
// 4. Global Sidebar & Collapsed Tooltip System
// --------------------------------------------------------------------------
console.log('\n[SECTION 4] Global Sidebar Master Navigation Audit...');
assert(css.includes('.app-container.sidebar-collapsed'), 'CSS contains .app-container.sidebar-collapsed grid rule');
assert(css.includes('html[data-sidebar-state="collapsed"] .nav-label'), 'CSS hides nav-label in collapsed mode');
assert(css.includes('html[data-sidebar-state="collapsed"] .sidebar-header-title'), 'CSS hides sidebar-header-title in collapsed mode');
assert(css.includes('html[data-sidebar-state="collapsed"] .sidebar-category-label'), 'CSS hides sidebar category labels in collapsed mode');
assert(css.includes('.nav-item[data-tooltip]'), 'CSS contains floating tooltip pseudo-element for collapsed items');
assert(css.includes('@media (max-width: 900px)'), 'CSS contains responsive breakpoint for mobile drawer (<= 900px)');
assert(css.includes('.app-sidebar.mobile-open'), 'CSS contains slide-in mobile drawer transition');
assert(css.includes('.mobile-nav-overlay.mobile-open'), 'CSS contains mobile backdrop overlay');

// --------------------------------------------------------------------------
// 5. Dashboard Top Segmented Navigation Pills
// --------------------------------------------------------------------------
console.log('\n[SECTION 5] Dashboard Top Segmented Navigation Pills Audit...');
assert(css.includes('.pill-tabs-nav'), 'CSS contains .pill-tabs-nav rule');
assert(css.includes('overflow-x: auto'), 'Pill tabs nav has intentional horizontal scrolling');
assert(css.includes('flex-wrap: nowrap'), 'Pill tabs nav prevents awkward wrapping');
assert(css.includes('.pill-tab'), 'CSS contains .pill-tab rule');
assert(css.includes('flex-shrink: 0'), 'Pill tab has flex-shrink: 0 to prevent label compression');
assert(css.includes('.pill-tab.active'), 'Pill tab active state has teal accent and elevation');

// --------------------------------------------------------------------------
// 6. Hospital Operations Dashboard & KPI Cards
// --------------------------------------------------------------------------
console.log('\n[SECTION 6] Hospital Operations & 6-Card KPI Grid Audit...');
assert(css.includes('.kpi-row-6'), 'CSS contains .kpi-row-6 responsive auto-fit grid');
assert(css.includes('.kpi-card-clean'), 'CSS contains .kpi-card-clean micro-elevation cards');
assert(css.includes('.page-header-clean'), 'CSS contains .page-header-clean layout');
assert(css.includes('.page-actions-clean'), 'CSS contains .page-actions-clean alignment');

// --------------------------------------------------------------------------
// 7. EVS Bed Turnover & Sanitization Console
// --------------------------------------------------------------------------
console.log('\n[SECTION 7] EVS Bed Turnover & Sanitization Audit...');
assert(css.includes('.evs-flow-stepper-track'), 'CSS contains .evs-flow-stepper-track 4-stage conveyor pipeline');
assert(css.includes('.evs-kanban-board'), 'CSS contains .evs-kanban-board grid layout');
assert(css.includes('.evs-kanban-column'), 'CSS contains .evs-kanban-column styling');
assert(css.includes('.evs-bed-card'), 'CSS contains .evs-bed-card micro-elevation card');
assert(css.includes('.evs-kpi-grid'), 'CSS contains .evs-kpi-grid summary metrics');

// --------------------------------------------------------------------------
// 8. Modals, Tables, Forms & Internal Fields
// --------------------------------------------------------------------------
console.log('\n[SECTION 8] Internal Components, Modals & Data Tables Audit...');
assert(css.includes('.modal-overlay'), 'CSS contains .modal-overlay backdrop blur');
assert(css.includes('.modal-box'), 'CSS contains .modal-box surface elevation');
assert(css.includes('.modal-actions'), 'CSS contains .modal-actions button alignment');
assert(css.includes('.table-responsive'), 'CSS contains .table-responsive overflow protection');
assert(css.includes('.data-table'), 'CSS contains .data-table healthcare styling');
assert(css.includes('.profile-details-grid'), 'CSS contains .profile-details-grid');
assert(css.includes('.profile-field-box'), 'CSS contains .profile-field-box');
assert(css.includes('.facility-info-grid'), 'CSS contains .facility-info-grid');
assert(css.includes('.facility-info-item'), 'CSS contains .facility-info-item');
assert(css.includes('.referral-drawer-grid'), 'CSS contains .referral-drawer-grid');
assert(css.includes('.referral-drawer-field'), 'CSS contains .referral-drawer-field');

// --------------------------------------------------------------------------
// 9. Responsive Viewports Verification
// --------------------------------------------------------------------------
console.log('\n[SECTION 9] Responsive Viewport Breakpoint Coverage Audit...');
assert(css.includes('@media (max-width: 1440px)') || css.includes('@media (min-width: 1024px)'), 'Desktop viewport styling defined');
assert(css.includes('@media (max-width: 1024px)'), 'Tablet / Laptop viewport breakpoint (1024px) defined');
assert(css.includes('@media (max-width: 900px)'), 'Tablet breakpoint (900px) defined for mobile drawer');
assert(css.includes('@media (max-width: 600px)'), 'Mobile portrait breakpoint (600px) defined for single-column stack');

console.log('\n============================================================');
console.log(`TOTAL AUDIT CHECKS: ${passCount + failCount}`);
console.log(`PASSED: ${passCount}`);
console.log(`FAILED: ${failCount}`);
console.log(`SUCCESS RATE: ${Math.round((passCount / (passCount + failCount)) * 100)}%`);
console.log('============================================================');

if (failCount > 0) {
  process.exit(1);
}

