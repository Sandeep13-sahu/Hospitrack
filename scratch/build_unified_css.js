const fs = require('fs');

const unifiedCSS = `/* ==========================================================================
   HOSPITRACK — ENTERPRISE HEALTHCARE SAAS DESIGN SYSTEM
   Modern, Clean, Polished Healthcare Management Interface (Design #3)
   ========================================================================== */

@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

:root {
  /* Canvas & Background Surfaces */
  --bg-body: #F8FAF9;
  --bg-surface: #FFFFFF;
  --bg-surface-alt: #F1F5F9;
  --bg-surface-hover: #F8FAFC;
  --bg-input: #FFFFFF;

  /* Borders & Dividers */
  --border-color: #E2E8F0;
  --border-subtle: #EDF2F7;
  --border-focus: #0D9488;

  /* Typography (Slate Scale) */
  --text-main: #0F172A;
  --text-secondary: #475569;
  --text-muted: #64748B;
  --text-dim: #94A3B8;
  --text-inverse: #FFFFFF;

  /* Healthcare Accent Colors (Clean Teal) */
  --primary: #0D9488;
  --primary-hover: #0F766E;
  --primary-soft: #F0FDFA;
  --primary-border: #99F6E4;

  --secondary: #0284C7;
  --secondary-hover: #0369A1;
  --secondary-soft: #F0F9FF;

  /* Role Indicator Accents */
  --doctor-color: #0D9488;
  --doctor-light: #F0FDFA;
  --hospital-color: #0284C7;
  --hospital-light: #F0F9FF;
  --patient-color: #059669;
  --patient-light: #ECFDF5;
  --admin-color: #0D9488;
  --admin-light: #F0FDFA;

  /* Clinical Status Colors */
  --success: #10B981;
  --success-light: #ECFDF5;
  --success-text: #065F46;
  --success-border: #A7F3D0;

  --warning: #F59E0B;
  --warning-light: #FFFBEB;
  --warning-text: #92400E;
  --warning-border: #FDE68A;

  --danger: #EF4444;
  --danger-light: #FEF2F2;
  --danger-text: #991B1B;
  --danger-border: #FECACA;

  --info: #0284C7;
  --info-light: #F0F9FF;
  --info-text: #075985;
  --info-border: #BAE6FD;

  /* Border Radii */
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-card: 16px;
  --radius-xl: 20px;
  --radius-full: 9999px;

  /* Subtle Micro-Elevation Shadows */
  --shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.04);
  --shadow-md: 0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.03);
  --shadow-lg: 0 10px 15px -3px rgba(15, 23, 42, 0.06), 0 4px 6px -4px rgba(15, 23, 42, 0.03);
  --shadow-modal: 0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04);

  /* Layout Measurements (Strict Single Source) */
  --header-height: 64px;
  --sidebar-width: 260px;
  --sidebar-collapsed-width: 76px;
  --font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* ==========================================================================
   BASE RESET & TYPOGRAPHY
   ========================================================================== */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-family);
  background-color: var(--bg-body);
  color: var(--text-main);
  line-height: 1.5;
  font-size: 0.92rem;
  overflow-x: hidden;
  min-height: 100vh;
}

h1, h2, h3, h4, h5, h6 {
  color: var(--text-main);
  font-weight: 700;
  line-height: 1.25;
}

p {
  margin-bottom: 0.5rem;
}

a {
  color: var(--primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--primary-hover);
}

code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.82em;
  background: var(--bg-surface-alt);
  padding: 2px 6px;
  border-radius: var(--radius-xs);
  color: var(--text-main);
}

/* Sleek Scrollbars */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #CBD5E1;
  border-radius: var(--radius-full);
}
::-webkit-scrollbar-thumb:hover {
  background: #94A3B8;
}

/* ==========================================================================
   GLOBAL APP SHELL: HEADER, SIDEBAR & CONTAINER
   ========================================================================== */
.app-header {
  height: var(--header-height);
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
}

.header-brand-breadcrumb-wrap {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mobile-nav-toggle {
  display: none;
  background: none;
  border: 1px solid var(--border-color);
  color: var(--text-main);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.brand-icon {
  width: 32px;
  height: 32px;
  background: var(--primary);
  color: #FFFFFF;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1rem;
}

.brand-text {
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-main);
}

.breadcrumb-separator {
  color: var(--text-dim);
  font-size: 0.8rem;
}

.breadcrumb-role {
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--primary);
  background: var(--primary-soft);
  padding: 3px 8px;
  border-radius: var(--radius-xs);
}

.breadcrumb-section {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.header-center {
  flex: 1;
  max-width: 480px;
  margin: 0 24px;
}

.global-search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.global-search-input {
  width: 100%;
  height: 38px;
  padding: 0 60px 0 38px;
  background: var(--bg-surface-alt);
  border: 1px solid transparent;
  border-radius: var(--radius-full);
  font-size: 0.86rem;
  color: var(--text-main);
  transition: all var(--transition-fast);
}

.global-search-input:focus {
  outline: none;
  background: #FFFFFF;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.12);
}

.search-icon-inside {
  position: absolute;
  left: 12px;
  color: var(--text-dim);
  font-size: 0.95rem;
  pointer-events: none;
}

.search-shortcut-badge {
  position: absolute;
  right: 12px;
  font-size: 0.70rem;
  font-weight: 600;
  background: #FFFFFF;
  border: 1px solid var(--border-color);
  padding: 2px 6px;
  border-radius: var(--radius-xs);
  color: var(--text-muted);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.system-status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--success-text);
  background: var(--success-light);
  border: 1px solid var(--success-border);
  padding: 4px 10px;
  border-radius: var(--radius-full);
}

.status-dot-pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--success);
}

.header-icon-btn {
  background: none;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
}

.header-icon-btn:hover {
  background: var(--bg-surface-alt);
  color: var(--text-main);
}

.badge-notification-count {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--danger);
  color: #FFFFFF;
  font-size: 0.65rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #FFFFFF;
}

.user-profile-header-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius-full);
  transition: background var(--transition-fast);
}

.user-profile-header-btn:hover {
  background: var(--bg-surface-alt);
}

.header-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--primary);
  color: #FFFFFF;
  font-weight: 700;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  object-fit: cover;
}

.header-user-info {
  text-align: left;
  line-height: 1.2;
}

.header-user-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-main);
}

.header-user-role {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-muted);
}

/* Grid App Container */
.app-container {
  display: grid;
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  min-height: calc(100vh - var(--header-height));
  transition: grid-template-columns var(--transition-normal);
}

.app-container.sidebar-collapsed,
html[data-sidebar-state="collapsed"] .app-container {
  grid-template-columns: var(--sidebar-collapsed-width, 76px) minmax(0, 1fr);
}

.main-content {
  padding: 28px 32px;
  overflow-y: auto;
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
}

.mobile-nav-overlay {
  display: none;
  position: fixed;
  top: var(--header-height);
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  z-index: 998;
}

/* ==========================================================================
   UNIVERSAL ROLE-BASED SIDEBAR NAVIGATION
   Super Admin, Hospital Admin, Doctor, Patient Panels
   ========================================================================== */
.app-sidebar {
  background: var(--bg-surface);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 16px 12px;
  overflow-y: auto;
  user-select: none;
  width: var(--sidebar-width, 260px);
  transition: width var(--transition-normal), padding var(--transition-normal);
}

.sidebar-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px 14px;
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 12px;
  gap: 8px;
}

.sidebar-header-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.90rem;
  font-weight: 800;
  color: var(--text-main);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-header-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.sidebar-header-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-collapse-btn {
  width: 26px;
  height: 26px;
  border: 1px solid var(--border-color);
  background: #FFFFFF;
  border-radius: var(--radius-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 0.75rem;
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.sidebar-collapse-btn:hover {
  background: var(--bg-surface-alt);
  color: var(--text-main);
  border-color: #94A3B8;
}

.sidebar-category-label {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--text-dim);
  text-transform: uppercase;
  padding: 14px 12px 6px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 12px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-bottom: 2px;
  text-decoration: none;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
}

.nav-item:hover {
  background: var(--bg-surface-alt);
  color: var(--text-main);
}

.nav-item.active {
  background: var(--primary-soft);
  color: var(--primary);
  font-weight: 700;
}

.nav-icon {
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  flex-shrink: 0;
}

.nav-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  margin-left: 10px;
}

.nav-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: var(--radius-full);
  background: var(--bg-surface-alt);
  color: var(--text-muted);
  margin-left: auto;
}

.nav-item.active .nav-badge {
  background: #FFFFFF;
  color: var(--primary);
  box-shadow: 0 1px 2px rgba(13, 148, 136, 0.15);
}

/* Collapsed Sidebar Rules */
.app-sidebar.collapsed,
html[data-sidebar-state="collapsed"] .app-sidebar {
  width: var(--sidebar-collapsed-width, 76px) !important;
  padding: 14px 8px !important;
}

.app-sidebar.collapsed .sidebar-header-bar,
html[data-sidebar-state="collapsed"] .sidebar-header-bar {
  justify-content: center;
  padding: 6px 0 12px;
}

.app-sidebar.collapsed .sidebar-header-text,
html[data-sidebar-state="collapsed"] .sidebar-header-text,
.app-sidebar.collapsed .nav-label,
html[data-sidebar-state="collapsed"] .nav-label,
.app-sidebar.collapsed .nav-badge,
html[data-sidebar-state="collapsed"] .nav-badge,
.app-sidebar.collapsed .sidebar-category-label,
html[data-sidebar-state="collapsed"] .sidebar-category-label {
  display: none !important;
}

.app-sidebar.collapsed .nav-item,
html[data-sidebar-state="collapsed"] .nav-item {
  justify-content: center !important;
  padding: 10px 0 !important;
  width: 100% !important;
}

.app-sidebar.collapsed .nav-item[data-tooltip],
html[data-sidebar-state="collapsed"] .nav-item[data-tooltip] {
  position: relative;
}

.app-sidebar.collapsed .nav-icon,
html[data-sidebar-state="collapsed"] .nav-icon {
  margin: 0 !important;
  font-size: 1.25rem !important;
}

/* ==========================================================================
   BUTTONS & ACTIONS
   ========================================================================== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 600;
  line-height: 1;
  padding: 10px 18px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.btn-primary {
  background: var(--primary);
  color: #FFFFFF;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
}

.btn-secondary {
  background: #FFFFFF;
  color: var(--text-secondary);
  border-color: var(--border-color);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-surface-alt);
  color: var(--text-main);
  border-color: #CBD5E1;
}

.btn-outline-primary {
  background: transparent;
  color: var(--primary);
  border-color: var(--primary);
}

.btn-outline-primary:hover:not(:disabled) {
  background: var(--primary-soft);
}

.btn-outline-danger {
  background: transparent;
  color: var(--danger);
  border-color: var(--danger);
}

.btn-outline-danger:hover:not(:disabled) {
  background: var(--danger-light);
}

.btn-danger {
  background: var(--danger);
  color: #FFFFFF;
}

.btn-danger:hover:not(:disabled) {
  background: #DC2626;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
}

.btn-purple {
  background: #7C3AED;
  color: #FFFFFF;
}

.btn-purple:hover:not(:disabled) {
  background: #6D28D9;
}

.btn-sm {
  padding: 7px 13px;
  font-size: 0.82rem;
}

.btn-xs {
  padding: 4px 8px;
  font-size: 0.74rem;
  border-radius: var(--radius-xs);
}

.btn-lg {
  padding: 13px 24px;
  font-size: 1rem;
}

.btn-block {
  width: 100%;
}

.btn-link-sm {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.btn-link-sm:hover {
  color: var(--primary-hover);
  text-decoration: underline;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none !important;
}

/* ==========================================================================
   STATUS BADGES & PILL TABS
   ========================================================================== */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: var(--radius-xs);
  font-size: 0.74rem;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.badge-success { background: var(--success-light); color: var(--success-text); border: 1px solid var(--success-border); }
.badge-warning { background: var(--warning-light); color: var(--warning-text); border: 1px solid var(--warning-border); }
.badge-danger  { background: var(--danger-light); color: var(--danger-text); border: 1px solid var(--danger-border); }
.badge-info    { background: var(--info-light); color: var(--info-text); border: 1px solid var(--info-border); }
.badge-neutral { background: var(--bg-surface-alt); color: var(--text-secondary); border: 1px solid var(--border-color); }
.badge-purple  { background: #EDE9FE; color: #6D28D9; border: 1px solid #DDD6FE; }

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 0.76rem;
  font-weight: 700;
}

.status-pill.success { background: var(--success-light); color: var(--success-text); }
.status-pill.warning { background: var(--warning-light); color: var(--warning-text); }
.status-pill.danger  { background: var(--danger-light); color: var(--danger-text); }
.status-pill.neutral { background: var(--bg-surface-alt); color: var(--text-muted); }

/* Top Segmented Navigation Pill Tabs */
.pill-tabs-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0 16px 0;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border-subtle);
  scrollbar-width: none;
}

.pill-tabs-nav::-webkit-scrollbar {
  display: none;
}

.pill-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #FFFFFF;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.pill-tab:hover {
  background: var(--bg-surface-alt);
  color: var(--text-main);
  border-color: #CBD5E1;
}

.pill-tab.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #FFFFFF;
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.25);
}

.pill-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: var(--radius-full);
  background: var(--bg-surface-alt);
  color: var(--text-muted);
}

.pill-tab.active .pill-badge {
  background: rgba(255, 255, 255, 0.25);
  color: #FFFFFF;
}

/* ==========================================================================
   CARDS, PANELS & CONTAINERS
   ========================================================================== */
.card, .glass-panel {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-fast);
}

.card:hover {
  box-shadow: var(--shadow-md);
}

.dashboard-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  padding: 22px 24px;
  box-shadow: var(--shadow-sm);
  margin-bottom: 24px;
}

.dashboard-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border-subtle);
  flex-wrap: wrap;
  gap: 10px;
}

.dashboard-card-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 8px;
}

.dashboard-card-sub {
  margin: 3px 0 0 0;
  font-size: 0.78rem;
  color: var(--text-muted);
}

/* ==========================================================================
   HOSPITAL OPERATIONS DASHBOARD OVERVIEW & 6-CARD KPI GRID
   ========================================================================== */
.dashboard-container-clean {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.page-header-clean {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-header-title-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title-clean {
  font-size: 1.65rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 4px 0 0 0;
  letter-spacing: -0.02em;
}

.page-subtitle-clean {
  font-size: 0.84rem;
  color: var(--text-muted);
  margin: 4px 0 0 0;
  line-height: 1.45;
}

.page-badge-pill {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--primary);
  background: var(--primary-soft);
  border: 1px solid var(--primary-border);
  padding: 3px 8px;
  border-radius: var(--radius-xs);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.page-actions-clean {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* 6-Card KPI Row */
.kpi-row-6 {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 1400px) {
  .kpi-row-6 {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .kpi-row-6 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .kpi-row-6 {
    grid-template-columns: 1fr;
  }
}

.kpi-card-clean {
  background: #FFFFFF;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);
  min-height: 110px;
}

.kpi-card-clean.clickable {
  cursor: pointer;
}

.kpi-card-clean:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary);
}

.kpi-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.kpi-card-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.kpi-card-icon {
  font-size: 1.25rem;
}

.kpi-card-value {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--text-main);
  line-height: 1.1;
  margin-bottom: 4px;
  letter-spacing: -0.02em;
}

.kpi-card-sub {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Two-Column Split (Today's Operations & Operational Alerts) */
.dashboard-split-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

@media (max-width: 900px) {
  .dashboard-split-grid {
    grid-template-columns: 1fr;
  }
}

/* Bed Overview Compact & Ward Progress */
.bed-overview-compact {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.bed-gauge-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: var(--bg-surface-alt);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.bed-gauge-value {
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--text-main);
  margin-top: 2px;
}

.ward-progress-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

@media (max-width: 768px) {
  .ward-progress-list {
    grid-template-columns: 1fr;
  }
}

.ward-progress-item {
  background: var(--bg-surface-alt);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 14px 16px;
}

.ward-progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.ward-name {
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--text-main);
}

.ward-stats {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
}

.ward-bar-track {
  width: 100%;
  height: 6px;
  background: var(--border-color);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.ward-bar-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.compact-alert-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.table-clean {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.table-clean th {
  background: var(--bg-surface-alt);
  color: var(--text-secondary);
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border-color);
}

.table-clean td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 0.85rem;
  vertical-align: middle;
}

.table-clean tbody tr:hover {
  background: var(--bg-surface-alt);
}

/* ==========================================================================
   FACILITY INPATIENTS WORKSPACE
   ========================================================================== */
.inpatient-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.inpatient-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
}

.inpatient-title-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.inpatient-badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.inpatient-header-badge {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--primary);
  background: var(--primary-soft);
  border: 1px solid var(--primary-border);
  padding: 2px 8px;
  border-radius: var(--radius-xs);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.inpatient-status-indicator {
  font-size: 0.74rem;
  color: var(--success-text);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success);
  display: inline-block;
}

.inpatient-title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.02em;
}

.inpatient-subtitle {
  margin: 2px 0 0 0;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.inpatient-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.inpatient-kpi-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}

@media (max-width: 1200px) {
  .inpatient-kpi-row {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 600px) {
  .inpatient-kpi-row {
    grid-template-columns: 1fr;
  }
}

.inpatient-kpi-card {
  background: #FFFFFF;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.inpatient-kpi-card:hover,
.inpatient-kpi-card.active {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(13, 148, 136, 0.12);
}

.inpatient-kpi-card.critical:hover,
.inpatient-kpi-card.critical.active {
  border-color: var(--danger);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.12);
}

.inpatient-kpi-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.inpatient-kpi-label {
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.inpatient-kpi-icon {
  font-size: 1.2rem;
}

.inpatient-kpi-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--text-main);
  line-height: 1.1;
  margin-bottom: 4px;
}

.inpatient-kpi-sub {
  font-size: 0.74rem;
  color: var(--text-muted);
}

.inpatient-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #FFFFFF;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 12px 18px;
  box-shadow: var(--shadow-sm);
  flex-wrap: wrap;
  gap: 12px;
}

.inpatient-search-box {
  position: relative;
  min-width: 260px;
}

.inpatient-search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.85rem;
  color: var(--text-dim);
  pointer-events: none;
}

.inpatient-search-input {
  padding-left: 32px;
  padding-right: 28px;
  border-radius: var(--radius-full);
  border: 1px solid #CBD5E1;
  font-size: 0.84rem;
  height: 36px;
  width: 100%;
}

.inpatient-search-clear {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 0.8rem;
}

.inpatient-filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.inpatient-filter-select {
  height: 36px;
  border: 1px solid #CBD5E1;
  border-radius: var(--radius-sm);
  background: #FFFFFF;
  color: var(--text-secondary);
  font-size: 0.82rem;
  padding: 0 10px;
  cursor: pointer;
}

.inpatient-results-count {
  font-size: 0.80rem;
  color: var(--text-muted);
}

.inpatient-results-count strong {
  color: var(--text-main);
}

.inpatient-table-card {
  background: #FFFFFF;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.inpatient-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.inpatient-table th {
  background: var(--bg-surface-alt);
  color: var(--text-secondary);
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}

.inpatient-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 0.85rem;
  vertical-align: middle;
}

.inpatient-table tbody tr:hover {
  background: var(--bg-surface-alt);
}

.inpatient-empty-state {
  text-align: center;
  padding: 48px 20px;
}

.inpatient-empty-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
}

.inpatient-empty-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 6px 0;
}

.inpatient-empty-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  max-width: 440px;
  margin: 0 auto 18px auto;
}

/* ==========================================================================
   WARD CAPACITY & MANAGEMENT
   ========================================================================== */
.ward-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.ward-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
}

.ward-title-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ward-header-badge {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--primary);
  background: var(--primary-soft);
  border: 1px solid var(--primary-border);
  padding: 2px 8px;
  border-radius: var(--radius-xs);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.ward-header-title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.02em;
}

.ward-header-subtitle {
  margin: 2px 0 0 0;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.ward-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ward-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 1024px) {
  .ward-kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.ward-kpi-card {
  background: #FFFFFF;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 18px 20px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.ward-kpi-card.accent-teal    { border-top: 4px solid var(--primary); }
.ward-kpi-card.accent-amber   { border-top: 4px solid var(--warning); }
.ward-kpi-card.accent-emerald { border-top: 4px solid var(--success); }
.ward-kpi-card.accent-rose    { border-top: 4px solid var(--danger); }

.ward-kpi-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.ward-kpi-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.ward-kpi-icon {
  font-size: 1.3rem;
}

.ward-kpi-val {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-main);
  line-height: 1.1;
  margin-bottom: 4px;
}

.ward-kpi-sub {
  font-size: 0.76rem;
  color: var(--text-muted);
}

.ward-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #FFFFFF;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 12px 18px;
  box-shadow: var(--shadow-sm);
  flex-wrap: wrap;
  gap: 12px;
}

.ward-deck-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 18px;
}

.ward-card {
  background: #FFFFFF;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ward-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 12px;
}

.ward-card-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-main);
}

.bed-pill-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
}

.bed-pill {
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  text-align: center;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid transparent;
}

.bed-pill.available {
  background: var(--success-light);
  color: var(--success-text);
  border-color: var(--success-border);
}

.bed-pill.occupied {
  background: var(--danger-light);
  color: var(--danger-text);
  border-color: var(--danger-border);
}

.bed-pill.maintenance,
.bed-pill.dirty {
  background: var(--warning-light);
  color: var(--warning-text);
  border-color: var(--warning-border);
}

/* ==========================================================================
   ENVIRONMENTAL SERVICES (EVS) BED TURNOVER COMMAND CENTER
   ========================================================================== */
.evs-turnover-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.evs-header-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: #FFFFFF;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  flex-wrap: wrap;
  gap: 16px;
}

.evs-brand-icon {
  width: 52px;
  height: 52px;
  background: var(--primary-soft);
  border: 1px solid var(--primary-border);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(13, 148, 136, 0.1);
}

.evs-header-badge {
  display: inline-block;
  padding: 3px 10px;
  background: var(--bg-surface-alt);
  color: var(--text-secondary);
  border-radius: var(--radius-xs);
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.evs-header-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.4px;
}

.evs-header-subtitle {
  margin: 4px 0 0 0;
  font-size: 0.88rem;
  color: var(--text-muted);
  max-width: 680px;
  line-height: 1.45;
}

.evs-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* View Switcher (Kanban vs Table) */
.evs-view-switcher {
  display: inline-flex;
  align-items: center;
  background: var(--bg-surface-alt);
  padding: 3px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  gap: 2px;
}

.evs-view-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.evs-view-btn:hover {
  color: var(--text-main);
}

.evs-view-btn.active {
  background: #FFFFFF;
  color: var(--primary);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
}

/* Clinical EVS Stepper (Conveyor Pipeline Flow) */
.evs-flow-stepper-card {
  background: #FFFFFF;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  padding: 18px 22px;
  box-shadow: var(--shadow-sm);
}

.evs-stepper-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-subtle);
  flex-wrap: wrap;
  gap: 8px;
}

.stepper-lead-icon {
  font-size: 1.3rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--primary-soft);
  border-radius: var(--radius-sm);
  border: 1px solid var(--primary-border);
}

.stepper-title {
  margin: 0;
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.2px;
}

.stepper-sub {
  margin: 2px 0 0 0;
  font-size: 0.78rem;
  color: var(--text-muted);
}

.stepper-sla-pill {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--primary);
  background: var(--primary-soft);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  border: 1px solid var(--primary-border);
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.evs-flow-stepper-track {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
  align-items: center;
  gap: 10px;
}

@media (max-width: 900px) {
  .evs-flow-stepper-track {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .step-chevron {
    display: none !important;
  }
}

.evs-flow-step {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  background: var(--bg-surface-alt);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  position: relative;
}

.evs-flow-step.step-active {
  background: #FFFFFF;
  border-color: #CBD5E1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.evs-flow-step.step-1.step-active { border-left: 4px solid var(--danger); }
.evs-flow-step.step-2.step-active { border-left: 4px solid var(--warning); }
.evs-flow-step.step-3.step-active { border-left: 4px solid #8B5CF6; }
.evs-flow-step.step-4.step-active { border-left: 4px solid var(--success); }

.step-badge-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--border-color);
  color: var(--text-secondary);
  font-weight: 800;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.step-1.step-active .step-badge-circle { background: #FFE4E6; color: #E11D48; }
.step-2.step-active .step-badge-circle { background: #FEF3C7; color: #D97706; }
.step-3.step-active .step-badge-circle { background: #EDE9FE; color: #7C3AED; }
.step-4.step-active .step-badge-circle { background: #D1FAE5; color: #059669; }

.step-content {
  flex: 1;
  min-width: 0;
}

.step-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.step-desc {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-top: 2px;
  line-height: 1.25;
}

.step-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
}

.step-count-pill {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.pill-rose    { background: #FFE4E6; color: #E11D48; }
.pill-amber   { background: #FEF3C7; color: #B45309; }
.pill-purple  { background: #EDE9FE; color: #6D28D9; }
.pill-emerald { background: #D1FAE5; color: #047857; }

.step-target {
  font-size: 0.68rem;
  color: var(--text-dim);
  font-weight: 500;
}

.step-chevron {
  font-size: 1rem;
  color: var(--text-dim);
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

/* 4-Card Operational Metric Deck */
.evs-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 1024px) {
  .evs-kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .evs-kpi-grid {
    grid-template-columns: 1fr;
  }
}

.evs-kpi-card {
  background: #FFFFFF;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 18px 20px;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.evs-kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.evs-kpi-card.accent-rose    { border-top: 4px solid var(--danger); }
.evs-kpi-card.accent-amber   { border-top: 4px solid var(--warning); }
.evs-kpi-card.accent-purple  { border-top: 4px solid #8B5CF6; }
.evs-kpi-card.accent-emerald { border-top: 4px solid var(--success); }

.evs-kpi-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.evs-kpi-label {
  font-size: 0.80rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.evs-kpi-icon {
  font-size: 1.35rem;
}

.evs-kpi-val {
  font-size: 2.1rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 4px;
}

.evs-kpi-sub {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.evs-filter-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #FFFFFF;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 12px 18px;
  box-shadow: var(--shadow-sm);
  flex-wrap: wrap;
  gap: 12px;
}

.evs-ward-filters {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.evs-filter-pill {
  background: #FFFFFF;
  border: 1px solid #CBD5E1;
  color: var(--text-secondary);
  font-size: 0.80rem;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.evs-filter-pill:hover {
  background: var(--bg-surface-alt);
  border-color: #94A3B8;
  color: var(--text-main);
}

.evs-filter-pill.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #FFFFFF;
  box-shadow: 0 2px 6px rgba(13, 148, 136, 0.25);
}

.evs-search-box {
  position: relative;
  min-width: 280px;
}

@media (max-width: 600px) {
  .evs-search-box {
    width: 100%;
  }
}

.evs-search-box input {
  padding-left: 34px;
  padding-right: 28px;
  border-radius: 20px;
  border: 1px solid #CBD5E1;
  font-size: 0.84rem;
  height: 36px;
  width: 100%;
}

.evs-search-box .search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.85rem;
  color: var(--text-dim);
  pointer-events: none;
}

.clear-search-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-dim);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0;
}

.clear-search-btn:hover {
  color: var(--text-secondary);
}

/* 4-Stage Kanban Pipeline Board */
.evs-kanban-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  align-items: flex-start;
}

@media (max-width: 1200px) {
  .evs-kanban-board {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .evs-kanban-board {
    grid-template-columns: 1fr;
  }
}

.evs-kanban-column {
  background: var(--bg-surface-alt);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.evs-kanban-column.column-dirty    { border-top: 4px solid var(--danger); }
.evs-kanban-column.column-cleaning { border-top: 4px solid var(--warning); }
.evs-kanban-column.column-inspect  { border-top: 4px solid #8B5CF6; }
.evs-kanban-column.column-ready    { border-top: 4px solid var(--success); }

.evs-col-header {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-color);
  background: #FFFFFF;
}

.evs-col-title-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.evs-col-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  font-size: 0.95rem;
  color: var(--text-main);
}

.evs-col-count {
  font-size: 0.75rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.count-dirty    { background: #FFE4E6; color: #E11D48; }
.count-cleaning { background: #FEF3C7; color: #B45309; }
.count-inspect  { background: #EDE9FE; color: #6D28D9; }
.count-ready    { background: #D1FAE5; color: #047857; }

.evs-col-sub {
  margin: 0;
  font-size: 0.74rem;
  color: var(--text-muted);
}

.evs-column-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  min-height: 280px;
}

/* Individual Bed Cards */
.evs-bed-card {
  background: #FFFFFF;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 14px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.evs-bed-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.card-dirty-bed     { border-left: 4px solid var(--danger); }
.card-cleaning-bed  { border-left: 4px solid var(--warning); }
.card-inspect-bed   { border-left: 4px solid #8B5CF6; }
.card-available-bed { border-left: 4px solid var(--success); }

.evs-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.evs-bed-id {
  font-weight: 800;
  font-size: 1.05rem;
  color: var(--text-main);
}

.badge-urgent-pulse {
  background: #FFE4E6;
  color: #E11D48;
  font-size: 0.70rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: var(--radius-xs);
  border: 1px solid #FECDD3;
}

.badge-active-pulse {
  background: #FEF3C7;
  color: #B45309;
  font-size: 0.70rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: var(--radius-xs);
  border: 1px solid #FDE68A;
}

.badge-inspect-ready {
  background: #EDE9FE;
  color: #6D28D9;
  font-size: 0.70rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: var(--radius-xs);
  border: 1px solid #DDD6FE;
}

.badge-standard-sub {
  background: var(--bg-surface-alt);
  color: var(--text-muted);
  font-size: 0.70rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: var(--radius-xs);
}

.evs-card-ward {
  font-size: 0.80rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.evs-card-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: var(--bg-surface-alt);
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-subtle);
}

.evs-meta-item {
  font-size: 0.75rem;
  color: var(--text-muted);
  display: flex;
  justify-content: space-between;
}

.evs-meta-item strong {
  color: var(--text-main);
  font-weight: 600;
}

.evs-meta-notes {
  font-size: 0.74rem;
  color: var(--text-secondary);
  border-top: 1px dashed var(--border-color);
  padding-top: 4px;
  margin-top: 2px;
  line-height: 1.35;
}

.evs-card-actions {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}

.evs-empty-col {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 16px;
  text-align: center;
  color: var(--text-muted);
  background: #FFFFFF;
  border: 1px dashed #CBD5E1;
  border-radius: var(--radius-md);
}

.evs-empty-col span {
  font-size: 2rem;
  margin-bottom: 8px;
}

.evs-empty-col p {
  margin: 0;
  font-size: 0.82rem;
}

/* Per-Column Pagination in Kanban Board */
.evs-col-pagination {
  margin-top: 10px;
  padding: 8px 12px;
  background: var(--bg-surface-alt);
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}

.evs-col-page-info {
  font-size: 0.70rem;
  font-weight: 600;
  color: var(--text-muted);
}

.evs-col-page-ctrls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.evs-page-btn {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #CBD5E1;
  background: #FFFFFF;
  color: var(--text-secondary);
  border-radius: var(--radius-xs);
  font-size: 0.68rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  padding: 0;
}

.evs-page-btn:hover:not(:disabled) {
  background: var(--bg-surface-alt);
  border-color: #94A3B8;
  color: var(--text-main);
}

.evs-page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  border-color: var(--border-color);
}

.evs-page-num {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-main);
  padding: 0 4px;
}

/* Card Progress Trackers (SLA Latency) */
.evs-card-progress-wrap {
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px dashed var(--border-color);
}

.evs-progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.68rem;
  color: var(--text-muted);
  margin-bottom: 3px;
}

.evs-progress-track {
  width: 100%;
  height: 5px;
  background: var(--border-color);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.evs-progress-bar {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.evs-progress-bar.bar-rose  { background: linear-gradient(90deg, #F43F5E, #FB7185); }
.evs-progress-bar.bar-amber { background: linear-gradient(90deg, #F59E0B, #FBBF24); }

/* Master Turnover Directory Table */
.evs-master-table-card {
  background: #FFFFFF;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.evs-table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border-subtle);
  flex-wrap: wrap;
  gap: 12px;
}

.evs-table-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-main);
}

.evs-table-subtitle {
  margin: 4px 0 0 0;
  font-size: 0.82rem;
  color: var(--text-muted);
}

.evs-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.evs-table th {
  background: var(--bg-surface-alt);
  color: var(--text-secondary);
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border-color);
  border-top: 1px solid var(--border-color);
}

.evs-table td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 0.85rem;
  vertical-align: middle;
}

.evs-table tbody tr:hover {
  background: var(--bg-surface-alt);
}

.evs-table-pagination-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--border-subtle);
  flex-wrap: wrap;
  gap: 12px;
}

.evs-table-count-summary {
  font-size: 0.82rem;
  color: var(--text-muted);
}

.evs-table-count-summary strong {
  color: var(--text-main);
}

.evs-table-pagination-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.evs-page-selector-pills {
  display: flex;
  align-items: center;
  gap: 4px;
}

.evs-num-pill {
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  background: #FFFFFF;
  color: var(--text-secondary);
  border-radius: var(--radius-xs);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.evs-num-pill:hover {
  background: var(--bg-surface-alt);
  color: var(--text-main);
}

.evs-num-pill.active {
  background: var(--primary);
  color: #FFFFFF;
  border-color: var(--primary);
  box-shadow: 0 2px 6px rgba(13, 148, 136, 0.3);
}

.evs-page-ellipsis {
  font-size: 0.82rem;
  color: var(--text-dim);
  padding: 0 4px;
}

/* Pulsing dot beacons */
.pulse-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  position: relative;
  flex-shrink: 0;
}

.pulse-dirty { background: var(--danger); }
.pulse-cleaning { background: var(--warning); }
.pulse-inspect { background: #8B5CF6; }
.pulse-ready { background: var(--success); }

/* ==========================================================================
   DOCTORS & MEDICAL STAFF WORKSPACE
   ========================================================================== */
.doctor-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.doctor-kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 1024px) {
  .doctor-kpi-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

.doctor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #FFFFFF;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 12px 18px;
  box-shadow: var(--shadow-sm);
  flex-wrap: wrap;
  gap: 12px;
}

.doctor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 18px;
}

.doctor-card {
  background: #FFFFFF;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.doctor-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* ==========================================================================
   UNIVERSAL CLEAN PAGINATION CONTROLS
   ========================================================================== */
.pagination-container,
.table-pagination-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: #FFFFFF;
  border-top: 1px solid var(--border-color);
  border-radius: 0 0 var(--radius-card) var(--radius-card);
  flex-wrap: wrap;
  gap: 12px;
}

.pagination-info {
  font-size: 0.82rem;
  color: var(--text-muted);
}

.pagination-info strong {
  color: var(--text-main);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pagination-btn {
  height: 30px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #CBD5E1;
  background: #FFFFFF;
  color: var(--text-secondary);
  border-radius: var(--radius-xs);
  font-size: 0.80rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pagination-btn:hover:not(:disabled) {
  background: var(--bg-surface-alt);
  border-color: #94A3B8;
  color: var(--text-main);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  border-color: var(--border-color);
}

.pagination-btn.active {
  background: var(--primary);
  color: #FFFFFF;
  border-color: var(--primary);
  box-shadow: 0 2px 6px rgba(13, 148, 136, 0.3);
}

/* ==========================================================================
   CLINICAL DECISION SUPPORT (CDS) & MODALS
   ========================================================================== */
.modal-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1050;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-overlay.open {
  display: flex;
}

.modal-box {
  background: #FFFFFF;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-modal);
  width: 100%;
  max-width: 580px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-box-md {
  max-width: 540px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-subtle);
}

.modal-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-main);
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--text-dim);
  cursor: pointer;
  padding: 4px;
}

.modal-close:hover {
  color: var(--text-main);
}

.modal-body {
  padding: 24px;
  color: var(--text-main);
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-surface-hover);
  border-radius: 0 0 var(--radius-card) var(--radius-card);
}

/* CDS Drug Safety Banners */
.cds-safety-banner {
  border-radius: var(--radius-md);
  padding: 14px 18px;
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
}

.cds-contraindication {
  background: #FEF2F2;
  border: 1px solid #FECACA;
  color: #991B1B;
}

.cds-allergy {
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  color: #92400E;
}

.cds-duplication {
  background: #F0F9FF;
  border: 1px solid #BAE6FD;
  color: #075985;
}

/* Form Styles */
.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.form-label.required::after,
.req-star {
  content: ' *';
  color: var(--danger);
  font-weight: 700;
}

.form-control {
  width: 100%;
  padding: 9px 13px;
  border: 1px solid #CBD5E1;
  border-radius: var(--radius-sm);
  background: #FFFFFF;
  color: var(--text-main);
  font-size: 0.88rem;
  font-family: inherit;
  transition: all var(--transition-fast);
}

.form-control:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.12);
}

.form-grid-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.form-grid-2col .full-width {
  grid-column: 1 / -1;
}

.pwd-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.pwd-toggle-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 1rem;
}

/* Alert banners */
.alert-banner {
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  font-size: 0.84rem;
  line-height: 1.4;
  margin-bottom: 16px;
}

.alert-banner.info {
  background: var(--info-light);
  border: 1px solid var(--info-border);
  color: var(--info-text);
}

.alert-banner.warning {
  background: var(--warning-light);
  border: 1px solid var(--warning-border);
  color: var(--warning-text);
}

.alert-banner.danger {
  background: var(--danger-light);
  border: 1px solid var(--danger-border);
  color: var(--danger-text);
}

/* Auth split layout */
.auth-split-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
}

.auth-brand-pane {
  background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
  color: #FFFFFF;
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.auth-card-pane {
  background: var(--bg-body);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
}

/* Utility Helpers */
.d-flex-align { display: flex; align-items: center; }
.d-flex-between { display: flex; align-items: center; justify-content: space-between; }
.gap-4 { gap: 4px; }
.gap-6 { gap: 6px; }
.gap-8 { gap: 8px; }
.gap-10 { gap: 10px; }
.gap-12 { gap: 12px; }
.gap-16 { gap: 16px; }
.gap-20 { gap: 20px; }
.mb-4 { margin-bottom: 4px; }
.mb-8 { margin-bottom: 8px; }
.mb-12 { margin-bottom: 12px; }
.mb-16 { margin-bottom: 16px; }
.mb-24 { margin-bottom: 24px; }
.mt-4 { margin-top: 4px; }
.mt-8 { margin-top: 8px; }
.mt-12 { margin-top: 12px; }
.mt-16 { margin-top: 16px; }
.w-100 { width: 100%; }
.text-right { text-align: right; }
.text-center { text-align: center; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
.text-xs-muted { font-size: 0.74rem; color: var(--text-muted); }
.text-secondary-sm { font-size: 0.82rem; color: var(--text-secondary); }
.text-danger { color: var(--danger); }
.text-success { color: var(--success); }
.text-amber { color: var(--warning); }
.hidden { display: none !important; }

/* ==========================================================================
   RESPONSIVE LAYOUT & MEDIA QUERIES
   ========================================================================== */
@media (max-width: 1024px) {
  .app-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .mobile-nav-toggle {
    display: inline-flex;
  }
  .app-sidebar {
    position: fixed;
    top: var(--header-height);
    left: -100%;
    width: 280px;
    height: calc(100vh - var(--header-height));
    z-index: 999;
    transition: left var(--transition-normal);
  }
  .app-sidebar.mobile-open {
    left: 0;
  }
  .mobile-nav-overlay.mobile-open {
    display: block;
  }
  .main-content {
    padding: 20px 16px;
  }
}

@media (max-width: 600px) {
  .auth-split-container {
    grid-template-columns: 1fr;
  }
  .auth-brand-pane {
    display: none;
  }
  .global-search-container {
    display: none;
  }
  .form-grid-2col {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

@media print {
  .no-print, .app-header, .app-sidebar, .modal-overlay, .toast-container {
    display: none !important;
  }
  .app-container {
    display: block !important;
  }
  .main-content {
    padding: 0 !important;
  }
}
`;

fs.writeFileSync('css/styles.css', unifiedCSS, 'utf8');
console.log('✓ Consolidated unified CSS written to css/styles.css (' + unifiedCSS.split('\\n').length + ' lines).');

