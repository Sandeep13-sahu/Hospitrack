const fs = require('fs');

const cssRules = `
/* ==========================================================================
   SPECIALIST REFERRAL PIPELINE & NETWORK CARE CONTINUITY
   ========================================================================== */

/* 5-Card Responsive Referral KPI Grid */
.referral-kpi-grid,
.transfer-kpi-grid,
.discharge-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.referral-kpi-card,
.transfer-kpi-card,
.discharge-kpi-card {
  background: #FFFFFF;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.referral-kpi-card:hover,
.transfer-kpi-card:hover,
.discharge-kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary);
}

.referral-kpi-card.active,
.transfer-kpi-card.active,
.discharge-kpi-card.active {
  border-color: var(--primary);
  background: linear-gradient(180deg, #FFFFFF 0%, #F0FDFA 100%);
  box-shadow: 0 0 0 1px var(--primary), var(--shadow-sm);
}

.referral-kpi-top,
.transfer-kpi-top,
.discharge-kpi-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.referral-kpi-title,
.transfer-kpi-title,
.discharge-kpi-title {
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
}

.referral-kpi-icon-wrap,
.transfer-kpi-icon-wrap,
.discharge-kpi-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.referral-kpi-val,
.transfer-kpi-val,
.discharge-kpi-val {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--text-main);
  line-height: 1.15;
  margin-bottom: 6px;
}

.referral-kpi-sub,
.transfer-kpi-sub,
.discharge-kpi-sub {
  font-size: 0.78rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}

.referral-kpi-dot,
.transfer-kpi-dot,
.discharge-kpi-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}

/* Referral Pipeline Stepper & Lifecycle Track */
.referral-pipeline-card,
.transfer-pipeline-card,
.discharge-pipeline-card {
  background: #FFFFFF;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  padding: 20px 24px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-sm);
}

.referral-pipeline-header,
.transfer-pipeline-header,
.discharge-pipeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  flex-wrap: wrap;
  gap: 12px;
}

.referral-pipeline-title,
.transfer-pipeline-title,
.discharge-pipeline-title {
  font-size: 0.88rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-main);
  margin: 0 0 4px 0;
}

.referral-pipeline-sub,
.transfer-pipeline-sub,
.discharge-pipeline-sub {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin: 0;
}

.referral-lifecycle-badge,
.transfer-lifecycle-badge,
.discharge-lifecycle-badge {
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--primary);
  background: var(--primary-light);
  padding: 4px 12px;
  border-radius: 9999px;
  border: 1px solid var(--primary-border);
}

.referral-pipeline-stepper,
.transfer-pipeline-stepper,
.discharge-pipeline-stepper {
  display: flex;
  align-items: center;
  gap: 12px;
  overflow-x: auto;
  padding: 4px 2px 8px 2px;
}

.referral-stepper-stage,
.transfer-stepper-stage,
.discharge-stepper-stage {
  flex: 1;
  min-width: 175px;
  background: var(--bg-surface-alt);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.referral-stepper-stage:hover,
.transfer-stepper-stage:hover,
.discharge-stepper-stage:hover {
  background: #FFFFFF;
  border-color: var(--primary);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.referral-stepper-stage.active,
.transfer-stepper-stage.active,
.discharge-stepper-stage.active {
  background: #FFFFFF;
  border-color: var(--primary);
  box-shadow: 0 0 0 1px var(--primary), var(--shadow-sm);
}

.referral-stepper-num,
.transfer-stepper-num,
.discharge-stepper-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #FFFFFF;
  border: 1px solid var(--border-color);
  font-size: 0.78rem;
  font-weight: 800;
  font-family: var(--font-mono);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.referral-stepper-stage.active .referral-stepper-num,
.transfer-stepper-stage.active .transfer-stepper-num,
.discharge-stepper-stage.active .discharge-stepper-num {
  background: var(--primary);
  color: #FFFFFF;
  border-color: var(--primary);
}

.referral-stepper-info,
.transfer-stepper-info,
.discharge-stepper-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}

.referral-stepper-label,
.transfer-stepper-label,
.discharge-stepper-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.referral-stepper-count,
.transfer-stepper-count,
.discharge-stepper-count {
  font-size: 0.74rem;
  color: var(--text-muted);
  font-weight: 500;
}

.referral-stepper-arrow,
.transfer-stepper-arrow,
.discharge-stepper-arrow {
  color: var(--text-muted);
  font-size: 0.95rem;
  user-select: none;
  opacity: 0.6;
}

/* Referral & Pipeline Toolbar */
.referral-toolbar,
.transfer-toolbar,
.discharge-toolbar {
  background: #FFFFFF;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  padding: 14px 18px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  box-shadow: var(--shadow-sm);
}

.referral-search-box,
.transfer-search-box,
.discharge-search-box,
.bed-search-box {
  flex: 1;
  min-width: 260px;
  position: relative;
  display: flex;
  align-items: center;
  background: var(--bg-surface-alt);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0 12px;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.referral-search-box:focus-within,
.transfer-search-box:focus-within,
.discharge-search-box:focus-within,
.bed-search-box:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-light);
  background: #FFFFFF;
}

.referral-search-icon,
.transfer-search-icon,
.discharge-search-icon,
.bed-search-icon {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-right: 8px;
}

.referral-search-input,
.transfer-search-input,
.discharge-search-input,
.bed-search-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  padding: 9px 0;
  font-size: 0.88rem;
  color: var(--text-main);
}

.referral-search-input::placeholder,
.transfer-search-input::placeholder,
.discharge-search-input::placeholder,
.bed-search-input::placeholder {
  color: var(--text-muted);
}

.referral-filter-group,
.transfer-filter-group,
.discharge-filter-group,
.bed-filter-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.referral-filter-select,
.transfer-filter-select,
.discharge-filter-select,
.bed-filter-select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: #FFFFFF;
  color: var(--text-main);
  font-size: 0.82rem;
  font-weight: 500;
  outline: none;
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.referral-filter-select:focus,
.transfer-filter-select:focus,
.discharge-filter-select:focus,
.bed-filter-select:focus {
  border-color: var(--primary);
}

/* Direction Pills */
.referral-direction-pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.74rem;
  font-weight: 700;
  line-height: 1;
}

.referral-direction-pill.inbound {
  background: #E0F2FE;
  color: #0284C7;
  border: 1px solid #BAE6FD;
}

.referral-direction-pill.outbound {
  background: #F3E8FF;
  color: #7C3AED;
  border: 1px solid #E9D5FF;
}

/* Referral Priority Badges */
.referral-badge-priority {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: var(--radius-xs);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.referral-badge-priority.emergency {
  background: #FEE2E2;
  color: #DC2626;
  border: 1px solid #FECACA;
}

.referral-badge-priority.urgent {
  background: #FEF3C7;
  color: #D97706;
  border: 1px solid #FDE68A;
}

.referral-badge-priority.routine {
  background: #F1F5F9;
  color: #475569;
  border: 1px solid #E2E8F0;
}

/* Referral Status Badges */
.referral-badge-status {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: var(--radius-xs);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.referral-badge-status.pending {
  background: #FEF3C7;
  color: #D97706;
  border: 1px solid #FDE68A;
}

.referral-badge-status.accepted {
  background: #DCFCE7;
  color: #16A34A;
  border: 1px solid #BBF7D0;
}

.referral-badge-status.in_progress,
.referral-badge-status.transfer_pending {
  background: #E0F2FE;
  color: #0284C7;
  border: 1px solid #BAE6FD;
}

.referral-badge-status.completed {
  background: #EDE9FE;
  color: #7C3AED;
  border: 1px solid #DDD6FE;
}

.referral-badge-status.rejected,
.referral-badge-status.cancelled {
  background: #FEE2E2;
  color: #DC2626;
  border: 1px solid #FECACA;
}

.referral-id-link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 700;
}

.referral-id-link:hover {
  text-decoration: underline;
}

/* ==========================================================================
   SLIDE-OVER INSPECTION DRAWERS (Referrals, Transfers, Inpatients, Staff, Beds)
   ========================================================================== */

.referral-drawer-overlay,
.transfer-drawer-overlay,
.discharge-drawer-overlay,
.inpatient-drawer-overlay,
.bed-drawer-overlay,
.staff-drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1050;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}

.referral-drawer-overlay.open,
.transfer-drawer-overlay.open,
.discharge-drawer-overlay.open,
.inpatient-drawer-overlay.open,
.bed-drawer-overlay.open,
.staff-drawer-overlay.open {
  opacity: 1;
  pointer-events: auto;
}

.referral-drawer,
.transfer-drawer,
.discharge-drawer,
.inpatient-drawer,
.bed-drawer,
.staff-drawer,
.doctor-drawer {
  position: fixed;
  top: 0;
  right: -560px;
  width: 540px;
  max-width: 92vw;
  height: 100vh;
  background: #FFFFFF;
  box-shadow: -8px 0 32px rgba(15, 23, 42, 0.16);
  z-index: 1051;
  display: flex;
  flex-direction: column;
  transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.referral-drawer-overlay.open .referral-drawer,
.transfer-drawer-overlay.open .transfer-drawer,
.discharge-drawer-overlay.open .discharge-drawer,
.inpatient-drawer-overlay.open .inpatient-drawer,
.bed-drawer-overlay.open .bed-drawer,
.staff-drawer-overlay.open .staff-drawer {
  right: 0;
}

.referral-drawer-header,
.transfer-drawer-header,
.discharge-drawer-header,
.inpatient-drawer-header,
.bed-drawer-header,
.staff-drawer-header,
.doctor-drawer-header {
  padding: 18px 24px;
  border-bottom: 1px solid var(--border-color);
  background: #FFFFFF;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-shrink: 0;
}

.referral-drawer-title-wrap,
.transfer-drawer-title-wrap,
.discharge-drawer-title-wrap,
.bed-drawer-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.referral-drawer-title,
.transfer-drawer-title,
.discharge-drawer-title,
.bed-drawer-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
  line-height: 1.2;
}

.referral-drawer-sub,
.transfer-drawer-sub,
.discharge-drawer-sub,
.bed-drawer-sub {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.referral-drawer-body,
.transfer-drawer-body,
.discharge-drawer-body,
.inpatient-drawer-body,
.bed-drawer-body,
.staff-drawer-body,
.doctor-drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.referral-drawer-section,
.transfer-drawer-section,
.discharge-drawer-section,
.inpatient-drawer-section,
.bed-drawer-section,
.doctor-drawer-section,
.staff-drawer-section {
  background: #FFFFFF;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-card);
  padding: 16px;
}

.referral-drawer-section-title,
.transfer-drawer-section-title,
.discharge-drawer-section-title,
.inpatient-drawer-section-title,
.bed-drawer-section-title,
.doctor-drawer-section-title,
.staff-drawer-section-title {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.referral-care-flow-box {
  background: var(--bg-surface-alt);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.referral-care-flow-step {
  display: flex;
  align-items: center;
  gap: 12px;
}

.referral-care-flow-bullet {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--primary);
  color: #FFFFFF;
  font-size: 0.72rem;
  font-weight: 800;
  font-family: var(--font-mono);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.referral-care-flow-content {
  display: flex;
  flex-direction: column;
}

.referral-care-flow-tag {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  font-weight: 700;
  color: var(--text-muted);
}

.referral-care-flow-name {
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--text-main);
}

.referral-care-flow-connector {
  margin-left: 10px;
  color: var(--text-muted);
  font-size: 0.8rem;
  line-height: 1;
}

.referral-drawer-actions,
.transfer-drawer-actions,
.discharge-drawer-actions,
.inpatient-drawer-actions,
.bed-drawer-actions,
.staff-drawer-actions,
.doctor-drawer-actions {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-surface-alt);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-shrink: 0;
}

/* Checklist & Clearance Controls */
.clearance-pill-checklist {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.clearance-pill-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: var(--bg-surface-alt);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  font-size: 0.84rem;
}

.clearance-pill-item.cleared {
  background: #DCFCE7;
  border-color: #BBF7D0;
  color: #16A34A;
}

/* ==========================================================================
   FACILITY PROFILE & CAPACITY VISUALIZATION
   ========================================================================== */

.facility-hero-badges {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.facility-hero-name {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0 0 6px 0;
}

.facility-hero-desc {
  font-size: 0.88rem;
  color: var(--text-secondary);
  margin: 0;
}

.facility-hero-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.facility-grid-split {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

@media (max-width: 1024px) {
  .facility-grid-split {
    grid-template-columns: 1fr;
  }
}

.facility-section-card {
  background: #FFFFFF;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  padding: 22px 24px;
  box-shadow: var(--shadow-sm);
}

.facility-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.facility-section-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0 0 4px 0;
}

.facility-section-subtitle {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin: 0;
}

.facility-capacity-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.facility-capacity-metric {
  background: var(--bg-surface-alt);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  text-align: center;
}

.facility-capacity-metric.primary-metric {
  background: var(--primary-light);
  border-color: var(--primary-border);
}

.facility-capacity-metric.success-metric {
  background: #DCFCE7;
  border-color: #BBF7D0;
}

.facility-capacity-label {
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.facility-capacity-num {
  font-size: 1.65rem;
  font-weight: 800;
  color: var(--text-main);
  line-height: 1.2;
}

.facility-capacity-sub {
  font-size: 0.74rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.facility-occupancy-bar-wrap {
  margin: 16px 0;
}

.facility-occupancy-bar-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 8px;
}

.facility-occupancy-bar {
  height: 14px;
  background: #E2E8F0;
  border-radius: 9999px;
  overflow: hidden;
  display: flex;
}

.facility-occupancy-fill {
  height: 100%;
  background: var(--primary);
  transition: width 0.4s ease;
}

.facility-occupancy-fill.icu { background: #DC2626; }
.facility-occupancy-fill.emergency { background: #D97706; }

.facility-occupancy-legend {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.facility-occupancy-legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: var(--text-muted);
}

.facility-occupancy-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.facility-services-grid,
.facility-depts-grid,
.facility-compliance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
}

.facility-service-card,
.facility-dept-card,
.facility-compliance-card {
  background: var(--bg-surface-alt);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  transition: all var(--transition-fast);
}

.facility-service-card:hover,
.facility-dept-card:hover {
  background: #FFFFFF;
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.facility-service-icon {
  font-size: 1.4rem;
  margin-bottom: 8px;
}

.facility-service-name,
.facility-dept-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 4px;
}

.facility-service-meta,
.facility-dept-lead {
  font-size: 0.76rem;
  color: var(--text-muted);
}

/* ==========================================================================
   WARD CAPACITY & REAL-TIME BED OCCUPANCY
   ========================================================================== */

.ward-mgmt-wrapper {
  width: 100%;
}

.ward-header-container {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}

.ward-header-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.capacity-overview-card {
  background: #FFFFFF;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-card);
  padding: 22px 24px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-sm);
}

.capacity-overview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 10px;
}

.capacity-overview-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
}

.capacity-overview-timestamp {
  font-size: 0.76rem;
  color: var(--text-muted);
}

.capacity-overview-bar-track {
  height: 18px;
  background: #E2E8F0;
  border-radius: 9999px;
  overflow: hidden;
  display: flex;
  margin-bottom: 14px;
}

.capacity-bar-segment {
  height: 100%;
  transition: width 0.4s ease;
}

.capacity-bar-segment.occupied { background: #DC2626; }
.capacity-bar-segment.available { background: #10B981; }
.capacity-bar-segment.reserved { background: #F59E0B; }
.capacity-bar-segment.maintenance { background: #6B7280; }

.capacity-legend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 12px;
}

.capacity-legend-box {
  background: var(--bg-surface-alt);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.capacity-legend-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.capacity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.capacity-legend-name {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.capacity-legend-count {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--text-main);
  font-family: var(--font-mono);
}

.ward-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.ward-card-name {
  font-size: 1rem;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 2px;
}

.ward-card-meta {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.ward-stat-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 12px;
}

.ward-stat-table td {
  padding: 4px 0;
  font-size: 0.8rem;
}

.ward-stat-val {
  text-align: right;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--text-main);
}

.ward-occupancy-wrap {
  margin-top: 10px;
}

.ward-occupancy-label-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.ward-occupancy-track {
  height: 8px;
  background: #E2E8F0;
  border-radius: 9999px;
  overflow: hidden;
}

.ward-occupancy-bar {
  height: 100%;
  background: var(--primary);
  border-radius: 9999px;
}

/* ==========================================================================
   BED INVENTORY TABLE & BADGES
   ========================================================================== */

.bed-table {
  width: 100%;
  border-collapse: collapse;
}

.badge-bed-available {
  background: #DCFCE7;
  color: #16A34A;
  border: 1px solid #BBF7D0;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: var(--radius-xs);
  display: inline-flex;
  align-items: center;
}

.badge-bed-occupied {
  background: #FEE2E2;
  color: #DC2626;
  border: 1px solid #FECACA;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: var(--radius-xs);
  display: inline-flex;
  align-items: center;
}

.badge-bed-reserved {
  background: #FEF3C7;
  color: #D97706;
  border: 1px solid #FDE68A;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: var(--radius-xs);
  display: inline-flex;
  align-items: center;
}

.badge-bed-maintenance {
  background: #F1F5F9;
  color: #475569;
  border: 1px solid #E2E8F0;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: var(--radius-xs);
  display: inline-flex;
  align-items: center;
}

.bed-id-cell {
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--text-main);
}

.bed-patient-cell {
  display: flex;
  flex-direction: column;
}

.bed-patient-name {
  font-weight: 700;
  color: var(--text-main);
  font-size: 0.86rem;
}

.bed-patient-id {
  font-size: 0.74rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

/* ==========================================================================
   INPATIENT REGISTRY SYSTEM
   ========================================================================== */

.inpatient-status-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: var(--radius-xs);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.inpatient-status-pill.admitted {
  background: #DCFCE7;
  color: #16A34A;
  border: 1px solid #BBF7D0;
}

.inpatient-status-pill.pending {
  background: #FEF3C7;
  color: #D97706;
  border: 1px solid #FDE68A;
}

.inpatient-status-pill.discharged {
  background: #F1F5F9;
  color: #64748B;
  border: 1px solid #E2E8F0;
}

.inpatient-status-pill.stable {
  background: #E0F2FE;
  color: #0284C7;
  border: 1px solid #BAE6FD;
}

.inpatient-cell-identity {
  display: flex;
  align-items: center;
  gap: 10px;
}

.inpatient-cell-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary-light);
  color: var(--primary);
  font-weight: 800;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.inpatient-cell-details {
  display: flex;
  flex-direction: column;
}

.inpatient-cell-name {
  font-weight: 700;
  color: var(--text-main);
  font-size: 0.86rem;
}

.inpatient-cell-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  color: var(--text-muted);
}

.inpatient-cell-id {
  font-family: var(--font-mono);
}

.inpatient-cell-dot {
  font-size: 0.6rem;
  color: var(--text-muted);
}

.inpatient-bed-badge {
  display: inline-flex;
  flex-direction: column;
  background: var(--bg-surface-alt);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
  padding: 4px 8px;
}

.inpatient-bed-ward {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-main);
}

.inpatient-bed-detail {
  font-size: 0.68rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.inpatient-doc-cell {
  display: flex;
  flex-direction: column;
}

.inpatient-doc-name {
  font-weight: 600;
  font-size: 0.84rem;
  color: var(--text-main);
}

.inpatient-doc-dept {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.inpatient-unassigned {
  font-size: 0.78rem;
  color: var(--text-muted);
  font-style: italic;
}

.inpatient-admit-cell {
  display: flex;
  flex-direction: column;
}

.inpatient-admit-date {
  font-size: 0.8rem;
  color: var(--text-main);
  font-weight: 500;
}

.inpatient-admit-stay {
  font-size: 0.72rem;
  color: var(--text-muted);
}

/* ==========================================================================
   DOCTOR & STAFF DRAWERS
   ========================================================================== */

.doctor-drawer-profile-card,
.staff-drawer-profile-card,
.inpatient-drawer-profile-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--bg-surface-alt);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-card);
  padding: 16px;
}

.doctor-drawer-avatar,
.staff-drawer-avatar,
.inpatient-drawer-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--primary);
  color: #FFFFFF;
  font-size: 1.25rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.doctor-drawer-name,
.staff-drawer-name,
.inpatient-drawer-name {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-main);
}

.doctor-drawer-grid,
.staff-drawer-grid,
.inpatient-drawer-grid,
.bed-drawer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.doctor-drawer-field,
.staff-drawer-field,
.inpatient-drawer-field,
.bed-drawer-field {
  background: var(--bg-surface-alt);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.doctor-drawer-label,
.staff-drawer-label,
.inpatient-drawer-label,
.bed-drawer-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
}

.doctor-drawer-value,
.staff-drawer-value,
.inpatient-drawer-value,
.bed-drawer-value {
  font-size: 0.88rem;
  color: var(--text-main);
  font-weight: 600;
}
`;

fs.writeFileSync('scratch/generated_pipeline_styles.css', cssRules.trim() + '\n', 'utf8');
console.log('Generated pipeline and drawer styles successfully.');
