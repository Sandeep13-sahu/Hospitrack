const fs = require('fs');

const replacement = `function renderHospitalReferralPipelineSection(data) {
  const { hospital = {}, referrals = [], patients = [], doctors = [] } = data;
  const store = window.hospitrackStore;

  const safeReferrals = Array.isArray(referrals) ? referrals : [];
  const inbound = safeReferrals.filter(r => r && r.toHospitalId === hospital.id);
  const outbound = safeReferrals.filter(r => r && r.fromHospitalId === hospital.id);

  // Authoritative 6-Metric KPI Distribution (100% Real Backend Data)
  const totalCount = safeReferrals.length;
  const awaitingReviewCount = safeReferrals.filter(r => r && r.status === 'PENDING').length;
  const acceptedCount = safeReferrals.filter(r => r && r.status === 'ACCEPTED').length;
  const transferPendingCount = safeReferrals.filter(r => r && (r.status === 'TRANSFER_PENDING' || r.status === 'TRANSFERRED')).length;
  const inTreatmentCount = safeReferrals.filter(r => r && (r.status === 'IN_PROGRESS' || r.status === 'IN_TREATMENT')).length;
  const completedCount = safeReferrals.filter(r => r && r.status === 'COMPLETED').length;
  const declinedCount = safeReferrals.filter(r => r && (r.status === 'REJECTED' || r.status === 'CANCELLED')).length;

  // Filter pipeline dataset
  const q = (referralSearchQuery || '').toLowerCase().trim();
  const filtered = safeReferrals.filter(r => {
    if (!r) return false;

    // Direction filter
    if (referralDirectionFilter === 'INBOUND' && r.toHospitalId !== hospital.id) return false;
    if (referralDirectionFilter === 'OUTBOUND' && r.fromHospitalId !== hospital.id) return false;

    // Status filter
    if (referralStatusFilter !== 'ALL') {
      if (referralStatusFilter === 'PENDING' && r.status !== 'PENDING') return false;
      else if (referralStatusFilter === 'ACCEPTED' && r.status !== 'ACCEPTED') return false;
      else if (referralStatusFilter === 'TRANSFER_PENDING' && (r.status !== 'TRANSFER_PENDING' && r.status !== 'TRANSFERRED')) return false;
      else if (referralStatusFilter === 'IN_PROGRESS' && (r.status !== 'IN_PROGRESS' && r.status !== 'IN_TREATMENT')) return false;
      else if (referralStatusFilter === 'COMPLETED' && r.status !== 'COMPLETED') return false;
      else if (referralStatusFilter === 'REJECTED' && (r.status !== 'REJECTED' && r.status !== 'CANCELLED')) return false;
    }

    // Priority filter
    if (referralPriorityFilter !== 'ALL' && (r.priority || 'ROUTINE') !== referralPriorityFilter) return false;

    // Search query
    if (q) {
      const p = store && typeof store.getPatientById === 'function' ? store.getPatientById(r.patientId) : null;
      const d = store && typeof store.getDoctorById === 'function' ? store.getDoctorById(r.doctorId) : null;
      const fromH = store && typeof store.getHospitalById === 'function' ? store.getHospitalById(r.fromHospitalId) : null;
      const toH = store && typeof store.getHospitalById === 'function' ? store.getHospitalById(r.toHospitalId) : null;

      const pName = (p?.name || '').toLowerCase();
      const pId = (r.patientId || '').toLowerCase();
      const refId = (r.id || '').toLowerCase();
      const reason = (r.reason || '').toLowerCase();
      const notes = (r.notes || '').toLowerCase();
      const docName = (d?.name || '').toLowerCase();
      const fromHName = (fromH?.name || r.fromHospitalId || '').toLowerCase();
      const toHName = (toH?.name || r.toHospitalId || '').toLowerCase();

      const matches = pName.includes(q) ||
                      pId.includes(q) ||
                      refId.includes(q) ||
                      reason.includes(q) ||
                      notes.includes(q) ||
                      docName.includes(q) ||
                      fromHName.includes(q) ||
                      toHName.includes(q);
      if (!matches) return false;
    }

    return true;
  });

  return \`
    <div class="dashboard-container-clean">
      <!-- Section A: Page Header -->
      <div class="page-header-clean">
        <div class="page-header-title-block">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="page-badge-pill">🏥 Network Logistics &amp; Care Continuity</span>
            <span class="status-pill success">\${escapeHtml(hospital.name || 'Connected Facility')}</span>
          </div>
          <h1 class="page-title-clean">Specialist Referrals</h1>
          <p class="page-subtitle-clean">
            Coordinate specialist referrals, track receiving-facility decisions, and manage continuity of patient care across \${escapeHtml(hospital.name || 'the clinical network')}.
          </p>
        </div>
        <div class="page-actions-clean">
          <button type="button" class="btn btn-secondary" onclick="exportReferralPipelineCsv()" title="Export current referral data to CSV file">
            <span>📥</span> Export
          </button>
          <button type="button" class="btn btn-secondary" onclick="refreshReferralPipeline()" title="Sync real backend referral data">
            <span>🔄</span> Refresh
          </button>
          <button type="button" class="btn btn-primary" onclick="openCreateReferralModal()" title="Create and dispatch a specialist referral">
            <span>+</span> Create Referral
          </button>
        </div>
      </div>

      <!-- Section B: 6-Card Responsive KPI Grid (Real Data) -->
      <div class="referral-kpi-grid">
        <div class="referral-kpi-card \${referralStatusFilter === 'ALL' ? 'active' : ''}" onclick="handleReferralStatusFilter('ALL')" title="Show all specialist referrals" role="button" tabindex="0">
          <div class="referral-kpi-top">
            <span class="referral-kpi-title">All Referrals</span>
            <span class="referral-kpi-icon-wrap" style="background: rgba(14, 165, 233, 0.12); color: #0284c7;">🔁</span>
          </div>
          <div class="referral-kpi-val">\${totalCount}</div>
          <div class="referral-kpi-sub">
            <span class="referral-kpi-dot" style="background: #0284c7;"></span>
            <span>\${inbound.length} inbound • \${outbound.length} outbound</span>
          </div>
        </div>

        <div class="referral-kpi-card \${referralStatusFilter === 'PENDING' ? 'active' : ''}" onclick="handleReferralStatusFilter('PENDING')" title="Filter by referrals awaiting triage review" role="button" tabindex="0">
          <div class="referral-kpi-top">
            <span class="referral-kpi-title">Awaiting Review</span>
            <span class="referral-kpi-icon-wrap" style="background: rgba(245, 158, 11, 0.12); color: #d97706;">⏳</span>
          </div>
          <div class="referral-kpi-val" style="color: \${awaitingReviewCount > 0 ? '#d97706' : 'var(--text-main)'};">\${awaitingReviewCount}</div>
          <div class="referral-kpi-sub">
            <span class="referral-kpi-dot" style="background: #d97706;"></span>
            <span>Awaiting facility decision</span>
          </div>
        </div>

        <div class="referral-kpi-card \${referralStatusFilter === 'ACCEPTED' ? 'active' : ''}" onclick="handleReferralStatusFilter('ACCEPTED')" title="Filter by accepted referrals" role="button" tabindex="0">
          <div class="referral-kpi-top">
            <span class="referral-kpi-title">Accepted</span>
            <span class="referral-kpi-icon-wrap" style="background: rgba(16, 185, 129, 0.12); color: #059669;">✅</span>
          </div>
          <div class="referral-kpi-val" style="color: \${acceptedCount > 0 ? '#059669' : 'var(--text-main)'};">\${acceptedCount}</div>
          <div class="referral-kpi-sub">
            <span class="referral-kpi-dot" style="background: #059669;"></span>
            <span>Confirmed receiving care</span>
          </div>
        </div>

        <div class="referral-kpi-card \${referralStatusFilter === 'TRANSFER_PENDING' ? 'active' : ''}" onclick="handleReferralStatusFilter('TRANSFER_PENDING')" title="Filter by transfer coordination" role="button" tabindex="0">
          <div class="referral-kpi-top">
            <span class="referral-kpi-title">Transfer Pending</span>
            <span class="referral-kpi-icon-wrap" style="background: rgba(239, 68, 68, 0.12); color: #dc2626;">🚑</span>
          </div>
          <div class="referral-kpi-val" style="color: \${transferPendingCount > 0 ? '#dc2626' : 'var(--text-main)'};">\${transferPendingCount}</div>
          <div class="referral-kpi-sub">
            <span class="referral-kpi-dot" style="background: #dc2626;"></span>
            <span>Transfer coordination required</span>
          </div>
        </div>

        <div class="referral-kpi-card \${referralStatusFilter === 'IN_PROGRESS' ? 'active' : ''}" onclick="handleReferralStatusFilter('IN_PROGRESS')" title="Filter by active specialist treatment" role="button" tabindex="0">
          <div class="referral-kpi-top">
            <span class="referral-kpi-title">In Treatment</span>
            <span class="referral-kpi-icon-wrap" style="background: rgba(14, 165, 233, 0.12); color: #0284c7;">🩺</span>
          </div>
          <div class="referral-kpi-val" style="color: \${inTreatmentCount > 0 ? '#0284c7' : 'var(--text-main)'};">\${inTreatmentCount}</div>
          <div class="referral-kpi-sub">
            <span class="referral-kpi-dot" style="background: #0284c7;"></span>
            <span>Specialist care underway</span>
          </div>
        </div>

        <div class="referral-kpi-card \${referralStatusFilter === 'COMPLETED' ? 'active' : ''}" onclick="handleReferralStatusFilter('COMPLETED')" title="Filter by completed referrals" role="button" tabindex="0">
          <div class="referral-kpi-top">
            <span class="referral-kpi-title">Completed</span>
            <span class="referral-kpi-icon-wrap" style="background: rgba(99, 102, 241, 0.12); color: #4f46e5;">🏁</span>
          </div>
          <div class="referral-kpi-val" style="color: #4f46e5;">\${completedCount}</div>
          <div class="referral-kpi-sub">
            <span class="referral-kpi-dot" style="background: #4f46e5;"></span>
            <span>Care fulfilled &amp; documented</span>
          </div>
        </div>
      </div>

      <!-- Section C: Referral Lifecycle Stepper Card -->
      <div class="referral-pipeline-card">
        <div class="referral-pipeline-header">
          <div>
            <h3 class="referral-pipeline-title">REFERRAL LIFECYCLE</h3>
            <p class="referral-pipeline-sub">Track every referral from creation to completed specialist care.</p>
          </div>
          <span class="referral-lifecycle-badge">5 Lifecycle Stages</span>
        </div>

        <div class="referral-pipeline-stepper">
          <div class="referral-stepper-stage \${referralStatusFilter === 'ALL' ? 'active' : ''}" onclick="handleReferralStatusFilter('ALL')" title="All referrals" role="button" tabindex="0">
            <div class="referral-stepper-num">01</div>
            <div class="referral-stepper-info">
              <span class="referral-stepper-label">Referral Created</span>
              <span class="referral-stepper-count">\${totalCount} Total</span>
            </div>
          </div>
          <div class="referral-stepper-arrow">➔</div>

          <div class="referral-stepper-stage \${referralStatusFilter === 'PENDING' ? 'active' : ''}" onclick="handleReferralStatusFilter('PENDING')" title="Pending review" role="button" tabindex="0">
            <div class="referral-stepper-num">02</div>
            <div class="referral-stepper-info">
              <span class="referral-stepper-label">Under Review</span>
              <span class="referral-stepper-count" style="color: \${awaitingReviewCount > 0 ? '#d97706' : 'inherit'};">\${awaitingReviewCount} Pending</span>
            </div>
          </div>
          <div class="referral-stepper-arrow">➔</div>

          <div class="referral-stepper-stage \${referralStatusFilter === 'ACCEPTED' ? 'active' : ''}" onclick="handleReferralStatusFilter('ACCEPTED')" title="Accepted" role="button" tabindex="0">
            <div class="referral-stepper-num">03</div>
            <div class="referral-stepper-info">
              <span class="referral-stepper-label">Accepted</span>
              <span class="referral-stepper-count" style="color: \${acceptedCount > 0 ? '#059669' : 'inherit'};">\${acceptedCount} Confirmed</span>
            </div>
          </div>
          <div class="referral-stepper-arrow">➔</div>

          <div class="referral-stepper-stage \${referralStatusFilter === 'TRANSFER_PENDING' ? 'active' : ''}" onclick="handleReferralStatusFilter('TRANSFER_PENDING')" title="Transfer Pending / In Care" role="button" tabindex="0">
            <div class="referral-stepper-num">04</div>
            <div class="referral-stepper-info">
              <span class="referral-stepper-label">Transfer Pending</span>
              <span class="referral-stepper-count" style="color: \${transferPendingCount > 0 ? '#dc2626' : 'inherit'};">\${transferPendingCount} Transfer</span>
            </div>
          </div>
          <div class="referral-stepper-arrow">➔</div>

          <div class="referral-stepper-stage \${referralStatusFilter === 'COMPLETED' ? 'active' : ''}" onclick="handleReferralStatusFilter('COMPLETED')" title="Completed" role="button" tabindex="0">
            <div class="referral-stepper-num">05</div>
            <div class="referral-stepper-info">
              <span class="referral-stepper-label">Completed</span>
              <span class="referral-stepper-count">\${completedCount} Care Fulfilled</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Section D: Search and Filters Toolbar -->
      <div class="referral-toolbar">
        <div class="referral-search-box">
          <span class="referral-search-icon">🔍</span>
          <input type="text"
                 class="referral-search-input"
                 placeholder="Search referrals by patient, ID, doctor, hospital..."
                 value="\${escapeHtml(referralSearchQuery)}"
                 oninput="handleReferralSearchInput(this.value)">
        </div>

        <div class="referral-filter-group">
          <!-- Direction Filter -->
          <select class="referral-filter-select" onchange="handleReferralDirectionFilter(this.value)">
            <option value="ALL" \${referralDirectionFilter === 'ALL' ? 'selected' : ''}>All Directions (\${totalCount})</option>
            <option value="INBOUND" \${referralDirectionFilter === 'INBOUND' ? 'selected' : ''}>📥 Inbound (\${inbound.length})</option>
            <option value="OUTBOUND" \${referralDirectionFilter === 'OUTBOUND' ? 'selected' : ''}>📤 Outbound (\${outbound.length})</option>
          </select>

          <!-- Status Filter -->
          <select class="referral-filter-select" onchange="handleReferralStatusFilter(this.value)">
            <option value="ALL" \${referralStatusFilter === 'ALL' ? 'selected' : ''}>All Statuses</option>
            <option value="PENDING" \${referralStatusFilter === 'PENDING' ? 'selected' : ''}>⏳ Awaiting Review (\${awaitingReviewCount})</option>
            <option value="ACCEPTED" \${referralStatusFilter === 'ACCEPTED' ? 'selected' : ''}>✅ Accepted (\${acceptedCount})</option>
            <option value="TRANSFER_PENDING" \${referralStatusFilter === 'TRANSFER_PENDING' ? 'selected' : ''}>🚑 Transfer Pending (\${transferPendingCount})</option>
            <option value="IN_PROGRESS" \${referralStatusFilter === 'IN_PROGRESS' ? 'selected' : ''}>🩺 In Treatment (\${inTreatmentCount})</option>
            <option value="COMPLETED" \${referralStatusFilter === 'COMPLETED' ? 'selected' : ''}>🏁 Completed (\${completedCount})</option>
            <option value="REJECTED" \${referralStatusFilter === 'REJECTED' ? 'selected' : ''}>❌ Declined / Cancelled (\${declinedCount})</option>
          </select>

          <!-- Priority Filter -->
          <select class="referral-filter-select" onchange="handleReferralPriorityFilter(this.value)">
            <option value="ALL" \${referralPriorityFilter === 'ALL' ? 'selected' : ''}>All Priorities</option>
            <option value="EMERGENCY" \${referralPriorityFilter === 'EMERGENCY' ? 'selected' : ''}>🚨 Emergency</option>
            <option value="URGENT" \${referralPriorityFilter === 'URGENT' ? 'selected' : ''}>⚠️ Urgent</option>
            <option value="ROUTINE" \${referralPriorityFilter === 'ROUTINE' ? 'selected' : ''}>📋 Routine</option>
          </select>

          \${(referralSearchQuery || referralStatusFilter !== 'ALL' || referralPriorityFilter !== 'ALL' || referralDirectionFilter !== 'ALL') ? \`
            <button type="button" class="btn btn-secondary btn-sm" onclick="clearReferralFilters()" title="Reset all search filters">
              ✕ Clear Filters
            </button>
          \` : ''}
        </div>
      </div>

      <!-- Section E: Practical Referral Work Queue Table -->
      <div class="dashboard-card">
        <div class="dashboard-card-header">
          <div>
            <h3 class="dashboard-card-title"><span>📋</span> Referral Work Queue</h3>
            <p class="dashboard-card-sub">
              Showing <strong>\${filtered.length}</strong> of <strong>\${totalCount}</strong> specialist referrals for \${escapeHtml(hospital.name)}
            </p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="exportReferralPipelineCsv()">
              <span>📥</span> Export CSV
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="refreshReferralPipeline()">
              <span>🔄</span> Refresh
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table-clean">
            <thead>
              <tr>
                <th>Referral ID</th>
                <th>Patient</th>
                <th>Direction</th>
                <th>Facilities</th>
                <th>Specialty / Reason</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Next Required Action</th>
                <th>Updated</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              \${filtered.length === 0 ? \`
                <tr>
                  <td colspan="10">
                    <div class="empty-state-clean" style="padding: 48px 16px; text-align: center;">
                      <span class="empty-icon" style="font-size: 2.5rem;">\${totalCount === 0 ? '🏥' : '🔍'}</span>
                      <div class="empty-title" style="font-size: 1.1rem; font-weight: 700; color: var(--text-main); margin-top: 8px;">
                        \${totalCount === 0 ? 'No specialist referrals recorded' : 'No referrals matched filter criteria'}
                      </div>
                      <p class="empty-desc" style="color: var(--text-muted); font-size: 0.88rem; max-width: 420px; margin: 6px auto 16px;">
                        \${totalCount === 0 ? "You don't currently have any specialist referrals in this facility. Dispatch a new referral to connect with specialist care." : 'Try clearing your search query or status filter.'}
                      </p>
                      \${totalCount === 0 ? \`
                        <button type="button" class="btn btn-primary btn-sm" onclick="openCreateReferralModal()">
                          + Create Referral
                        </button>
                      \` : \`
                        <button type="button" class="btn btn-secondary btn-sm" onclick="clearReferralFilters()">
                          Clear Filters
                        </button>
                      \`}
                    </div>
                  </td>
                </tr>
              \` : filtered.map(r => {
                const isIncoming = r.toHospitalId === hospital.id;
                const isPending = r.status === 'PENDING';
                const isAccepted = r.status === 'ACCEPTED';
                const isInProgress = r.status === 'IN_PROGRESS' || r.status === 'IN_TREATMENT';
                const p = store && typeof store.getPatientById === 'function' ? store.getPatientById(r.patientId) : null;
                const d = store && typeof store.getDoctorById === 'function' ? store.getDoctorById(r.doctorId) : null;
                const fromH = store && typeof store.getHospitalById === 'function' ? store.getHospitalById(r.fromHospitalId) : null;
                const toH = store && typeof store.getHospitalById === 'function' ? store.getHospitalById(r.toHospitalId) : null;

                const statusClass = (r.status || 'PENDING').toLowerCase();
                const priorityClass = (r.priority || 'ROUTINE').toLowerCase();
                const updatedDate = r.updatedAt ? new Date(r.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent');

                let statusLabel = 'Awaiting Review';
                if (r.status === 'ACCEPTED') statusLabel = 'Accepted';
                else if (r.status === 'IN_PROGRESS' || r.status === 'IN_TREATMENT') statusLabel = 'In Treatment';
                else if (r.status === 'TRANSFER_PENDING' || r.status === 'TRANSFERRED') statusLabel = 'Transfer Pending';
                else if (r.status === 'COMPLETED') statusLabel = 'Completed';
                else if (r.status === 'REJECTED') statusLabel = 'Declined';
                else if (r.status === 'CANCELLED') statusLabel = 'Cancelled';

                const nextAction = getReferralNextAction(r, isIncoming);

                return \`
                  <tr style="cursor: pointer;" onclick="if (!event.target.closest('button') && !event.target.closest('a')) openReferralDrawer('\${r.id}')">
                    <td>
                      <a href="#hospital/workspace/referral/\${encodeURIComponent(r.id)}" class="referral-id-link font-mono" onclick="event.preventDefault(); openReferralDrawer('\${r.id}')">
                        <code>\${escapeHtml(r.id)}</code>
                      </a>
                    </td>
                    <td>
                      <div class="cell-patient">
                        <span class="cell-patient-name font-semibold">\${escapeHtml(p ? p.name : r.patientId)}</span>
                        <span class="cell-patient-id font-mono text-xs text-muted"><code>\${escapeHtml(r.patientId)}</code> \${p ? \`• \${p.age}y \${p.gender || 'M'}\` : ''}</span>
                      </div>
                    </td>
                    <td>
                      <span class="referral-direction-pill \${isIncoming ? 'inbound' : 'outbound'}">
                        \${isIncoming ? '📥 Inbound' : '📤 Outbound'}
                      </span>
                    </td>
                    <td>
                      <div style="display: flex; flex-direction: column;">
                        <span style="font-weight: 700; color: var(--text-main); font-size: 0.84rem;">
                          \${escapeHtml(isIncoming ? (fromH ? fromH.name : r.fromHospitalId) : (toH ? toH.name : r.toHospitalId))}
                        </span>
                        <span style="font-size: 0.74rem; color: var(--text-muted);">
                          \${d ? \`Dr. \${escapeHtml(d.name)}\` : (r.doctorId ? escapeHtml(r.doctorId) : 'Attending Specialist')}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style="max-width: 220px;">
                        <div style="font-weight: 600; font-size: 0.82rem; color: var(--text-main); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="\${escapeHtml(r.reason || 'Specialist Evaluation')}">
                          \${escapeHtml(r.reason || 'Specialist Evaluation')}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="referral-badge-priority \${priorityClass}">
                        \${escapeHtml(r.priority || 'ROUTINE')}
                      </span>
                    </td>
                    <td>
                      <span class="referral-badge-status \${statusClass}">
                        \${escapeHtml(statusLabel)}
                      </span>
                    </td>
                    <td>
                      <span class="referral-next-action-pill \${nextAction.badgeClass}">
                        <span>\${nextAction.icon}</span> \${nextAction.text}
                      </span>
                    </td>
                    <td style="font-size: 0.80rem; color: var(--text-secondary); white-space: nowrap;">
                      \${escapeHtml(updatedDate)}
                    </td>
                    <td style="text-align: right;">
                      <div class="action-btn-group" style="justify-content: flex-end; display: flex; gap: 6px;">
                        \${isIncoming && isPending ? \`
                          <button type="button" class="btn btn-primary btn-sm" onclick="event.stopPropagation(); handleAcceptReferralClick('\${r.id}')" title="Accept referral">
                            <span>✓</span> Accept
                          </button>
                          <button type="button" class="btn btn-outline-danger btn-sm" onclick="event.stopPropagation(); openRejectReferralModal('\${r.id}')" title="Decline referral with reason">
                            <span>✕</span> Decline
                          </button>
                        \` : ''}
                        \${isIncoming && isAccepted ? \`
                          <button type="button" class="btn btn-primary btn-sm" onclick="event.stopPropagation(); handleBeginCareReferral('\${r.id}')" title="Confirm patient arrival and begin specialist care">
                            <span>🩺</span> Begin Care
                          </button>
                        \` : ''}
                        \${isInProgress ? \`
                          <button type="button" class="btn btn-primary btn-sm" onclick="event.stopPropagation(); openCompleteReferralModal('\${r.id}')" title="Record clinical outcome and complete referral">
                            <span>🏁</span> Complete
                          </button>
                        \` : ''}
                        \${!isIncoming && isPending ? \`
                          <button type="button" class="btn btn-outline-danger btn-sm" onclick="event.stopPropagation(); openCancelReferralModal('\${r.id}')" title="Cancel this dispatched referral">
                            <span>✕</span> Cancel
                          </button>
                        \` : ''}
                        <button type="button" class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); openReferralDrawer('\${r.id}')" title="Open referral details">
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                \`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section F: Slide-Over Referral Detail Drawer Overlay -->
      <div id="referralDrawerOverlay" class="referral-drawer-overlay \${referralSelectedId ? 'open' : ''}" onclick="if (event.target === this) closeReferralDrawer()">
        \${referralSelectedId ? renderReferralDrawerContent(referralSelectedId, hospital, store) : ''}
      </div>
    </div>
  \`;
}

// --------------------------------------------------------------------------
// Slide-Over Referral Drawer Content Renderer
// --------------------------------------------------------------------------
function renderReferralDrawerContent(referralId, hospital, store) {
  const referral = store && typeof store.getReferralById === 'function' ? store.getReferralById(referralId) : null;
  if (!referral) {
    return \`
      <div class="referral-drawer">
        <div class="referral-drawer-header">
          <div class="referral-drawer-title-wrap">
            <h3 class="referral-drawer-title">Referral Detail</h3>
          </div>
          <button type="button" class="modal-close" onclick="closeReferralDrawer()">✕</button>
        </div>
        <div class="referral-drawer-body">
          <div class="empty-state-clean">
            <span class="empty-icon">⚠️</span>
            <div class="empty-title">Referral not found</div>
            <p class="empty-desc">The selected referral record [\${escapeHtml(referralId)}] could not be retrieved.</p>
          </div>
        </div>
      </div>
    \`;
  }

  const patient = store && typeof store.getPatientById === 'function' ? store.getPatientById(referral.patientId) : null;
  const doctor = store && typeof store.getDoctorById === 'function' ? store.getDoctorById(referral.doctorId) : null;
  const fromH = store && typeof store.getHospitalById === 'function' ? store.getHospitalById(referral.fromHospitalId) : null;
  const toH = store && typeof store.getHospitalById === 'function' ? store.getHospitalById(referral.toHospitalId) : null;

  const isIncoming = referral.toHospitalId === hospital.id;
  const isPending = referral.status === 'PENDING';
  const isAccepted = referral.status === 'ACCEPTED';
  const isInProgress = referral.status === 'IN_PROGRESS' || referral.status === 'IN_TREATMENT';
  const isCompleted = referral.status === 'COMPLETED';
  const isRejected = referral.status === 'REJECTED';
  const isCancelled = referral.status === 'CANCELLED';

  const statusClass = (referral.status || 'PENDING').toLowerCase();
  const priorityClass = (referral.priority || 'ROUTINE').toLowerCase();
  const createdFormatted = referral.createdAt ? new Date(referral.createdAt).toLocaleString() : 'N/A';
  const updatedFormatted = referral.updatedAt ? new Date(referral.updatedAt).toLocaleString() : createdFormatted;

  let statusLabel = 'Awaiting Review';
  if (referral.status === 'ACCEPTED') statusLabel = 'Accepted';
  else if (referral.status === 'IN_PROGRESS' || referral.status === 'IN_TREATMENT') statusLabel = 'In Treatment';
  else if (referral.status === 'TRANSFER_PENDING' || referral.status === 'TRANSFERRED') statusLabel = 'Transfer Pending';
  else if (referral.status === 'COMPLETED') statusLabel = 'Completed';
  else if (referral.status === 'REJECTED') statusLabel = 'Declined';
  else if (referral.status === 'CANCELLED') statusLabel = 'Cancelled';

  const nextAction = getReferralNextAction(referral, isIncoming);

  return \`
    <div class="referral-drawer" role="dialog" aria-modal="true" aria-labelledby="referralDrawerTitle">
      <!-- Drawer Header -->
      <div class="referral-drawer-header">
        <div class="referral-drawer-title-wrap">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span class="referral-direction-pill \${isIncoming ? 'inbound' : 'outbound'}">
              \${isIncoming ? '📥 INBOUND REFERRAL' : '📤 OUTBOUND REFERRAL'}
            </span>
            <span class="referral-badge-status \${statusClass}">\${escapeHtml(statusLabel)}</span>
            <span class="referral-badge-priority \${priorityClass}">\${escapeHtml(referral.priority || 'ROUTINE')}</span>
          </div>
          <h3 class="referral-drawer-title" id="referralDrawerTitle">
            <code>\${escapeHtml(referral.id)}</code>
          </h3>
          <span class="referral-drawer-sub">Dispatched on \${escapeHtml(createdFormatted)} • Last activity: \${escapeHtml(updatedFormatted)}</span>
        </div>
        <button type="button" class="modal-close" onclick="closeReferralDrawer()" aria-label="Close drawer">✕</button>
      </div>

      <!-- Drawer Body -->
      <div class="referral-drawer-body">
        <!-- 1. Next Required Action Banner -->
        <div style="background: var(--bg-surface-alt); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
          <div>
            <div style="font-size: 0.70rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 2px;">Next Required Action</div>
            <div style="font-size: 0.88rem; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 6px;">
              <span>\${nextAction.icon}</span> \${nextAction.text}
            </div>
          </div>
          <span class="referral-next-action-pill \${nextAction.badgeClass}">\${escapeHtml(statusLabel)}</span>
        </div>

        <!-- 2. Patient Profile Section -->
        <div class="referral-drawer-section">
          <div class="referral-drawer-section-title">
            <span>👤</span> PATIENT INFORMATION
          </div>
          <div class="referral-drawer-grid">
            <div class="referral-drawer-field">
              <span class="referral-drawer-label">Patient Name</span>
              <span class="referral-drawer-val">\${escapeHtml(patient ? patient.name : referral.patientId)}</span>
            </div>
            <div class="referral-drawer-field">
              <span class="referral-drawer-label">Patient Identifier</span>
              <span class="referral-drawer-val"><code>\${escapeHtml(referral.patientId)}</code></span>
            </div>
            <div class="referral-drawer-field">
              <span class="referral-drawer-label">Demographics</span>
              <span class="referral-drawer-val">\${patient ? \`\${patient.age} Yrs • \${escapeHtml(patient.gender || 'M')}\` : 'N/A'}</span>
            </div>
            <div class="referral-drawer-field">
              <span class="referral-drawer-label">Blood Group</span>
              <span class="referral-drawer-val">\${patient?.bloodGroup ? \`<span class="status-pill info">\${escapeHtml(patient.bloodGroup)}</span>\` : 'N/A'}</span>
            </div>
            <div class="referral-drawer-field full-span">
              <span class="referral-drawer-label">Emergency Contact</span>
              <span class="referral-drawer-val">\${escapeHtml(patient?.emergencyContact || patient?.contact || 'Standard on file')}</span>
            </div>
          </div>
        </div>

        <!-- 3. Care Connection Flow Visualization -->
        <div class="referral-drawer-section">
          <div class="referral-drawer-section-title">
            <span>🌐</span> CARE CONNECTION PIPELINE
          </div>
          <div class="referral-care-flow-box">
            <div class="referral-care-flow-step">
              <div class="referral-care-flow-bullet">1</div>
              <div class="referral-care-flow-content">
                <div class="referral-care-flow-tag">Origin Hospital</div>
                <div class="referral-care-flow-name">\${escapeHtml(fromH ? fromH.name : referral.fromHospitalId)}</div>
              </div>
            </div>
            <div class="referral-care-flow-connector">↓</div>
            <div class="referral-care-flow-step">
              <div class="referral-care-flow-bullet">2</div>
              <div class="referral-care-flow-content">
                <div class="referral-care-flow-tag">Referring Doctor</div>
                <div class="referral-care-flow-name">\${doctor ? \`Dr. \${escapeHtml(doctor.name)} (\${doctor.specialty || 'General Practice'})\` : (referral.doctorId || 'Attending Physician')}</div>
              </div>
            </div>
            <div class="referral-care-flow-connector">↓</div>
            <div class="referral-care-flow-step">
              <div class="referral-care-flow-bullet">3</div>
              <div class="referral-care-flow-content">
                <div class="referral-care-flow-tag">Clinical Reason</div>
                <div class="referral-care-flow-name" style="font-weight: 500;">\${escapeHtml(referral.reason || 'Specialist evaluation')}</div>
              </div>
            </div>
            <div class="referral-care-flow-connector">↓</div>
            <div class="referral-care-flow-step">
              <div class="referral-care-flow-bullet">4</div>
              <div class="referral-care-flow-content">
                <div class="referral-care-flow-tag">Receiving Hospital</div>
                <div class="referral-care-flow-name">\${escapeHtml(toH ? toH.name : referral.toHospitalId)}</div>
              </div>
            </div>
            <div class="referral-care-flow-connector">↓</div>
            <div class="referral-care-flow-step">
              <div class="referral-care-flow-bullet">5</div>
              <div class="referral-care-flow-content">
                <div class="referral-care-flow-tag">Receiving Specialist Service</div>
                <div class="referral-care-flow-name">\${escapeHtml(toH?.location ? \`\${toH.name} Specialist Triage\` : 'Specialist Department')}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Clinical Referral Dossier -->
        <div class="referral-drawer-section">
          <div class="referral-drawer-section-title">
            <span>📋</span> CLINICAL REFERRAL DETAILS
          </div>
          <div class="referral-drawer-grid">
            <div class="referral-drawer-field">
              <span class="referral-drawer-label">Clinical Priority</span>
              <span class="referral-drawer-val">
                <span class="referral-badge-priority \${priorityClass}">
                  \${escapeHtml(referral.priority || 'ROUTINE')}
                </span>
              </span>
            </div>
            <div class="referral-drawer-field">
              <span class="referral-drawer-label">Current Pipeline Status</span>
              <span class="referral-drawer-val">
                <span class="referral-badge-status \${statusClass}">
                  \${escapeHtml(statusLabel)}
                </span>
              </span>
            </div>
            <div class="referral-drawer-field full-span">
              <span class="referral-drawer-label">Clinical Indication / Reason</span>
              <span class="referral-drawer-val" style="font-weight: 500; line-height: 1.4;">
                \${escapeHtml(referral.reason || 'Specialist diagnostic & clinical continuation')}
              </span>
            </div>
            \${referral.notes ? \`
              <div class="referral-drawer-field full-span">
                <span class="referral-drawer-label">Clinical Notes &amp; Activity Log</span>
                <div class="referral-drawer-val" style="font-weight: 400; line-height: 1.5; color: var(--text-secondary); white-space: pre-wrap; font-size: 0.82rem; background: #fff; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--border-subtle); margin-top: 4px;">\${escapeHtml(referral.notes)}</div>
              </div>
            \` : ''}
          </div>
        </div>

        <!-- 5. Chronological Audit & Event Timeline -->
        <div class="referral-drawer-section">
          <div class="referral-drawer-section-title">
            <span>🕒</span> CHRONOLOGICAL ACTIVITY TIMELINE
          </div>
          <div style="display: flex; flex-direction: column; gap: 14px; position: relative; padding-left: 20px; border-left: 2px solid var(--border-color); margin-left: 8px;">
            <div style="position: relative;">
              <div style="position: absolute; left: -27px; top: 2px; width: 12px; height: 12px; border-radius: 50%; background: var(--primary);"></div>
              <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-main);">Referral Created &amp; Dispatched</div>
              <div style="font-size: 0.74rem; color: var(--text-muted);">\${escapeHtml(createdFormatted)} • By \${doctor ? \`Dr. \${escapeHtml(doctor.name)}\` : (fromH ? escapeHtml(fromH.name) : 'Referring Facility')}</div>
            </div>

            \${(isAccepted || isInProgress || isCompleted) ? \`
              <div style="position: relative;">
                <div style="position: absolute; left: -27px; top: 2px; width: 12px; height: 12px; border-radius: 50%; background: #10B981;"></div>
                <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-main);">Referral Accepted by Receiving Facility</div>
                <div style="font-size: 0.74rem; color: var(--text-muted);">\${escapeHtml(toH ? toH.name : 'Receiving Facility')} accepted care continuity.</div>
              </div>
            \` : ''}

            \${(isInProgress || isCompleted) ? \`
              <div style="position: relative;">
                <div style="position: absolute; left: -27px; top: 2px; width: 12px; height: 12px; border-radius: 50%; background: #0284C7;"></div>
                <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-main);">Specialist Care Commenced</div>
                <div style="font-size: 0.74rem; color: var(--text-muted);">Patient intake confirmed at target department.</div>
              </div>
            \` : ''}

            \${isCompleted ? \`
              <div style="position: relative;">
                <div style="position: absolute; left: -27px; top: 2px; width: 12px; height: 12px; border-radius: 50%; background: #7C3AED;"></div>
                <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-main);">Referral Completed &amp; Documented</div>
                <div style="font-size: 0.74rem; color: var(--text-muted);">\${escapeHtml(updatedFormatted)} • Full clinical discharge/closure completed.</div>
              </div>
            \` : ''}

            \${isRejected ? \`
              <div style="position: relative;">
                <div style="position: absolute; left: -27px; top: 2px; width: 12px; height: 12px; border-radius: 50%; background: #DC2626;"></div>
                <div style="font-size: 0.82rem; font-weight: 700; color: #DC2626;">Referral Declined</div>
                <div style="font-size: 0.74rem; color: var(--text-muted);">\${escapeHtml(updatedFormatted)} • Facility triage rationale recorded.</div>
              </div>
            \` : ''}

            \${isCancelled ? \`
              <div style="position: relative;">
                <div style="position: absolute; left: -27px; top: 2px; width: 12px; height: 12px; border-radius: 50%; background: #64748B;"></div>
                <div style="font-size: 0.82rem; font-weight: 700; color: #64748B;">Referral Cancelled</div>
                <div style="font-size: 0.74rem; color: var(--text-muted);">\${escapeHtml(updatedFormatted)} • Withdrawn by referring institution.</div>
              </div>
            \` : ''}
          </div>
        </div>

        <!-- 6. Connected Records Quick Navigation -->
        <div class="referral-drawer-section">
          <div class="referral-drawer-section-title">
            <span>🔗</span> CONNECTED CLINICAL RECORDS
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="closeReferralDrawer(); window.openWorkspace ? window.openWorkspace('patient', '\${referral.patientId}', 'consultations') : window.openPatientWorkspace('\${referral.patientId}')">
              <span>🩺</span> Consultation
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="closeReferralDrawer(); window.openWorkspace ? window.openWorkspace('patient', '\${referral.patientId}', 'prescriptions') : window.openPatientWorkspace('\${referral.patientId}')">
              <span>💊</span> Prescription
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="closeReferralDrawer(); window.openWorkspace ? window.openWorkspace('patient', '\${referral.patientId}', 'lab-reports') : window.openPatientWorkspace('\${referral.patientId}')">
              <span>🧪</span> Lab Reports
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="closeReferralDrawer(); window.openPatientWorkspace('\${referral.patientId}')">
              <span>👤</span> Patient Record
            </button>
          </div>
        </div>
      </div>

      <!-- Drawer Actions -->
      <div class="referral-drawer-actions">
        \${isIncoming && isPending ? \`
          <button type="button" class="btn btn-outline-danger btn-sm" onclick="openRejectReferralModal('\${referral.id}')">
            <span>✕</span> Decline Referral
          </button>
          <button type="button" class="btn btn-primary btn-sm" onclick="handleAcceptReferralClick('\${referral.id}')">
            <span>✓</span> Accept Referral
          </button>
        \` : ''}

        \${isIncoming && isAccepted ? \`
          <button type="button" class="btn btn-primary btn-sm" onclick="handleBeginCareReferral('\${referral.id}')">
            <span>🩺</span> Begin Specialist Care
          </button>
        \` : ''}

        \${(isAccepted || referral.status === 'TRANSFER_PENDING') ? \`
          <button type="button" class="btn btn-secondary btn-sm" onclick="openEmergencyTransferModal()" title="Connect referral to Emergency Transfer pipeline">
            <span>🚑</span> Coordinate Transfer
          </button>
        \` : ''}

        \${isInProgress ? \`
          <button type="button" class="btn btn-primary btn-sm" onclick="openCompleteReferralModal('\${referral.id}')">
            <span>🏁</span> Complete Care
          </button>
        \` : ''}

        \${!isIncoming && isPending ? \`
          <button type="button" class="btn btn-outline-danger btn-sm" onclick="openCancelReferralModal('\${referral.id}')">
            <span>✕</span> Cancel Referral
          </button>
        \` : ''}

        <button type="button" class="btn btn-secondary btn-sm" onclick="closeReferralDrawer()">
          Close
        </button>
      </div>
    </div>
  \`;
}

// --------------------------------------------------------------------------
// Global Pipeline State Handlers & Action Dispatchers
// --------------------------------------------------------------------------

window.openReferralDrawer = function(referralId) {
  referralSelectedId = referralId;
  const overlay = document.getElementById('referralDrawerOverlay');
  if (overlay) {
    const store = window.hospitrackStore;
    const user = window.hospitrackAuth ? window.hospitrackAuth.getCurrentUser() : null;
    const hospitalId = user?.hospitalId || 'HOSP-101';
    const hospital = (store && typeof store.getHospitalById === 'function' ? store.getHospitalById(hospitalId) : null) || { id: hospitalId, name: 'Hospital' };
    overlay.innerHTML = renderReferralDrawerContent(referralId, hospital, store);
    overlay.classList.add('open');
  } else {
    const container = document.getElementById('mainContentArea');
    if (container && window.renderHospitalDashboard) {
      window.renderHospitalDashboard(container, 'referrals');
    }
  }
};

window.closeReferralDrawer = function() {
  referralSelectedId = null;
  const overlay = document.getElementById('referralDrawerOverlay');
  if (overlay) {
    overlay.classList.remove('open');
  }
};

window.handleReferralSearchInput = function(query) {
  referralSearchQuery = query || '';
  const container = document.getElementById('mainContentArea');
  if (container && window.renderHospitalDashboard) {
    window.renderHospitalDashboard(container, 'referrals');
  }
};

window.handleReferralDirectionFilter = function(direction) {
  referralDirectionFilter = direction || 'ALL';
  const container = document.getElementById('mainContentArea');
  if (container && window.renderHospitalDashboard) {
    window.renderHospitalDashboard(container, 'referrals');
  }
};

window.handleReferralStatusFilter = function(status) {
  referralStatusFilter = status || 'ALL';
  const container = document.getElementById('mainContentArea');
  if (container && window.renderHospitalDashboard) {
    window.renderHospitalDashboard(container, 'referrals');
  }
};

window.handleReferralPriorityFilter = function(priority) {
  referralPriorityFilter = priority || 'ALL';
  const container = document.getElementById('mainContentArea');
  if (container && window.renderHospitalDashboard) {
    window.renderHospitalDashboard(container, 'referrals');
  }
};

window.clearReferralFilters = function() {
  referralSearchQuery = '';
  referralStatusFilter = 'ALL';
  referralPriorityFilter = 'ALL';
  referralDirectionFilter = 'ALL';
  const container = document.getElementById('mainContentArea');
  if (container && window.renderHospitalDashboard) {
    window.renderHospitalDashboard(container, 'referrals');
  }
};

window.exportReferralPipelineCsv = function() {
  const store = window.hospitrackStore;
  const user = window.hospitrackAuth ? window.hospitrackAuth.getCurrentUser() : null;
  const hospitalId = user?.hospitalId || 'HOSP-101';
  const referrals = store ? store.getReferrals(hospitalId) : [];
  if (!referrals || referrals.length === 0) {
    window.showToast('No referrals to export.', 'info');
    return;
  }
  let csv = 'Referral ID,Patient ID,Patient Name,From Hospital,To Hospital,Priority,Status,Reason,Notes,Created At,Updated At\\n';
  referrals.forEach(r => {
    const p = store.getPatientById(r.patientId);
    const pName = p ? p.name : r.patientId;
    const fromH = store.getHospitalById(r.fromHospitalId);
    const toH = store.getHospitalById(r.toHospitalId);
    const row = [
      r.id,
      r.patientId,
      \`"\${(pName || '').replace(/"/g, '""')}"\`,
      \`"\${(fromH ? fromH.name : r.fromHospitalId || '').replace(/"/g, '""')}"\`,
      \`"\${(toH ? toH.name : r.toHospitalId || '').replace(/"/g, '""')}"\`,
      r.priority || 'ROUTINE',
      r.status || 'PENDING',
      \`"\${(r.reason || '').replace(/"/g, '""')}"\`,
      \`"\${(r.notes || '').replace(/"/g, '""')}"\`,
      r.createdAt || '',
      r.updatedAt || ''
    ];
    csv += row.join(',') + '\\n';
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = \`referrals-export-\${hospitalId}-\${new Date().toISOString().slice(0, 10)}.csv\`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.showToast('✓ Referrals exported to CSV.', 'success');
};

window.refreshReferralPipeline = async function() {
  try {
    window.showToast('Refreshing specialist referral pipeline...', 'info');
    if (window.hospitrackStore && typeof window.hospitrackStore.syncAllData === 'function') {
      await window.hospitrackStore.syncAllData();
    }
    const container = document.getElementById('mainContentArea');
    if (container && window.renderHospitalDashboard) {
      window.renderHospitalDashboard(container, 'referrals');
    }
    window.showToast('✓ Specialist referral pipeline synchronized.', 'success');
  } catch (err) {
    window.showToast(err.message || 'Unable to sync referral pipeline.', 'error');
  }
};

window.handleAcceptReferralClick = async function(referralId) {
  try {
    await window.hospitrackStore.updateReferralStatus(referralId, 'ACCEPTED');
    window.showToast(\`✓ Referral \${referralId} accepted successfully.\`, 'success');
    await window.hospitrackStore.syncAllData();
    const container = document.getElementById('mainContentArea');
    if (container && window.renderHospitalDashboard) {
      window.renderHospitalDashboard(container, 'referrals');
    }
    if (referralSelectedId === referralId) {
      window.openReferralDrawer(referralId);
    }
  } catch (err) {
    window.showToast(err.message || 'Unable to accept referral', 'error');
  }
};

window.handleBeginCareReferral = async function(referralId) {
  try {
    await window.hospitrackStore.updateReferralStatus(referralId, 'IN_PROGRESS');
    window.showToast(\`✓ Patient received and care started for referral \${referralId}.\`, 'success');
    await window.hospitrackStore.syncAllData();
    const container = document.getElementById('mainContentArea');
    if (container && window.renderHospitalDashboard) {
      window.renderHospitalDashboard(container, 'referrals');
    }
    if (referralSelectedId === referralId) {
      window.openReferralDrawer(referralId);
    }
  } catch (err) {
    window.showToast(err.message || 'Unable to update care status', 'error');
  }
};

window.openRejectReferralModal = function(referralId) {
  const modalContainer = document.getElementById('globalModalContainer');
  if (!modalContainer) return;

  const referral = window.hospitrackStore ? window.hospitrackStore.getReferralById(referralId) : null;
  const patient = (referral && window.hospitrackStore) ? window.hospitrackStore.getPatientById(referral.patientId) : null;

  modalContainer.innerHTML = \`
    <div id="rejectReferralModal" class="modal-overlay open" role="dialog" aria-modal="true" aria-labelledby="rejectReferralModalTitle">
      <div class="modal-box">
        <div class="modal-header">
          <h3 class="modal-title" id="rejectReferralModalTitle">❌ Decline Specialist Referral</h3>
          <button type="button" class="modal-close" onclick="closeGlobalModal('rejectReferralModal')" aria-label="Close">✕</button>
        </div>
        <form onsubmit="confirmRejectReferralSubmit(event, '\${escapeHtml(referralId)}')" class="p-20">
          <div class="mb-16">
            <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0 0 10px 0;">
              You are about to decline referral <strong>\${escapeHtml(referralId)}</strong> for patient <strong>\${escapeHtml(patient ? patient.name : (referral?.patientId || 'Patient'))}</strong>.
            </p>
            <div class="alert-banner warning">
              Please document the clinical or operational rationale for declining this referral.
            </div>
          </div>
          <div class="form-group mb-20">
            <label class="form-label" for="rejectReasonInput">Decline Rationale / Clinical Notes <span class="text-danger">*</span></label>
            <textarea id="rejectReasonInput"
                      class="form-control"
                      rows="3"
                      placeholder="e.g. Sub-specialty capacity unavailable, bed capacity constraint, or referred to alternative tertiary center..."
                      required></textarea>
          </div>
          <div id="rejectAlert" class="alert-banner hidden mb-16"></div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" onclick="closeGlobalModal('rejectReferralModal')">Cancel</button>
            <button type="submit" class="btn btn-danger">Confirm Rejection</button>
          </div>
        </form>
      </div>
    </div>
  \`;
};

window.confirmRejectReferralSubmit = async function(event, referralId) {
  event.preventDefault();
  const reasonInput = document.getElementById('rejectReasonInput');
  const alertEl = document.getElementById('rejectAlert');
  const reason = reasonInput ? reasonInput.value.trim() : '';

  if (!reason) {
    if (alertEl) {
      alertEl.className = 'alert-banner error mb-16';
      alertEl.textContent = 'Please provide a rationale before declining the referral.';
      alertEl.classList.remove('hidden');
    }
    return;
  }

  try {
    await window.hospitrackStore.updateReferralStatus(referralId, 'REJECTED', reason);
    window.showToast(\`Referral \${referralId} declined and rationale documented.\`, 'info');
    closeGlobalModal('rejectReferralModal');
    await window.hospitrackStore.syncAllData();
    const container = document.getElementById('mainContentArea');
    if (container && window.renderHospitalDashboard) {
      window.renderHospitalDashboard(container, 'referrals');
    }
    if (referralSelectedId === referralId) {
      window.openReferralDrawer(referralId);
    }
  } catch (err) {
    if (alertEl) {
      alertEl.className = 'alert-banner error mb-16';
      alertEl.textContent = err.message || 'Failed to update referral status.';
      alertEl.classList.remove('hidden');
    } else {
      window.showToast(err.message || 'Failed to decline referral', 'error');
    }
  }
};

window.openCompleteReferralModal = function(referralId) {
  const modalContainer = document.getElementById('globalModalContainer');
  if (!modalContainer) return;

  const referral = window.hospitrackStore ? window.hospitrackStore.getReferralById(referralId) : null;
  const patient = (referral && window.hospitrackStore) ? window.hospitrackStore.getPatientById(referral.patientId) : null;

  modalContainer.innerHTML = \`
    <div id="completeReferralModal" class="modal-overlay open" role="dialog" aria-modal="true" aria-labelledby="completeReferralModalTitle">
      <div class="modal-box">
        <div class="modal-header">
          <h3 class="modal-title" id="completeReferralModalTitle">🏁 Complete Specialist Care</h3>
          <button type="button" class="modal-close" onclick="closeGlobalModal('completeReferralModal')" aria-label="Close">✕</button>
        </div>
        <form onsubmit="confirmCompleteReferralSubmit(event, '\${escapeHtml(referralId)}')" class="p-20">
          <div class="mb-16">
            <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0 0 10px 0;">
              Document clinical outcome for referral <strong>\${escapeHtml(referralId)}</strong> (Patient: <strong>\${escapeHtml(patient ? patient.name : (referral?.patientId || 'Patient'))}</strong>).
            </p>
          </div>
          <div class="form-group mb-20">
            <label class="form-label" for="completeOutcomeInput">Clinical Summary / Outcome Documentation <span class="text-danger">*</span></label>
            <textarea id="completeOutcomeInput"
                      class="form-control"
                      rows="3"
                      placeholder="e.g. Completed cardiac catheterization, patient stabilized and discharged with prescription regimen..."
                      required></textarea>
          </div>
          <div id="completeAlert" class="alert-banner hidden mb-16"></div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" onclick="closeGlobalModal('completeReferralModal')">Cancel</button>
            <button type="submit" class="btn btn-primary">Complete Referral</button>
          </div>
        </form>
      </div>
    </div>
  \`;
};

window.confirmCompleteReferralSubmit = async function(event, referralId) {
  event.preventDefault();
  const outcomeInput = document.getElementById('completeOutcomeInput');
  const alertEl = document.getElementById('completeAlert');
  const outcome = outcomeInput ? outcomeInput.value.trim() : '';

  if (!outcome) {
    if (alertEl) {
      alertEl.className = 'alert-banner error mb-16';
      alertEl.textContent = 'Please record clinical outcome documentation.';
      alertEl.classList.remove('hidden');
    }
    return;
  }

  try {
    await window.hospitrackStore.updateReferralStatus(referralId, 'COMPLETED', null, outcome);
    window.showToast(\`✓ Referral \${referralId} completed with clinical documentation.\`, 'success');
    closeGlobalModal('completeReferralModal');
    await window.hospitrackStore.syncAllData();
    const container = document.getElementById('mainContentArea');
    if (container && window.renderHospitalDashboard) {
      window.renderHospitalDashboard(container, 'referrals');
    }
    if (referralSelectedId === referralId) {
      window.openReferralDrawer(referralId);
    }
  } catch (err) {
    if (alertEl) {
      alertEl.className = 'alert-banner error mb-16';
      alertEl.textContent = err.message || 'Failed to complete referral.';
      alertEl.classList.remove('hidden');
    } else {
      window.showToast(err.message || 'Failed to complete referral', 'error');
    }
  }
};

window.openCancelReferralModal = function(referralId) {
  const modalContainer = document.getElementById('globalModalContainer');
  if (!modalContainer) return;

  modalContainer.innerHTML = \`
    <div id="cancelReferralModal" class="modal-overlay open" role="dialog" aria-modal="true" aria-labelledby="cancelReferralModalTitle">
      <div class="modal-box">
        <div class="modal-header">
          <h3 class="modal-title" id="cancelReferralModalTitle">✕ Cancel Referral Request</h3>
          <button type="button" class="modal-close" onclick="closeGlobalModal('cancelReferralModal')" aria-label="Close">✕</button>
        </div>
        <form onsubmit="confirmCancelReferralSubmit(event, '\${escapeHtml(referralId)}')" class="p-20">
          <div class="mb-16">
            <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0 0 10px 0;">
              Are you sure you want to cancel referral <strong>\${escapeHtml(referralId)}</strong>?
            </p>
          </div>
          <div class="form-group mb-20">
            <label class="form-label" for="cancelReasonInput">Cancellation Reason <span class="text-danger">*</span></label>
            <textarea id="cancelReasonInput"
                      class="form-control"
                      rows="2"
                      placeholder="e.g. Patient condition resolved internally, or family requested alternative facility..."
                      required></textarea>
          </div>
          <div id="cancelAlert" class="alert-banner hidden mb-16"></div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" onclick="closeGlobalModal('cancelReferralModal')">Close</button>
            <button type="submit" class="btn btn-danger">Confirm Cancellation</button>
          </div>
        </form>
      </div>
    </div>
  \`;
};

window.confirmCancelReferralSubmit = async function(event, referralId) {
  event.preventDefault();
  const reasonInput = document.getElementById('cancelReasonInput');
  const alertEl = document.getElementById('cancelAlert');
  const reason = reasonInput ? reasonInput.value.trim() : '';

  if (!reason) {
    if (alertEl) {
      alertEl.className = 'alert-banner error mb-16';
      alertEl.textContent = 'Please provide a cancellation reason.';
      alertEl.classList.remove('hidden');
    }
    return;
  }

  try {
    await window.hospitrackStore.updateReferralStatus(referralId, 'CANCELLED', reason);
    window.showToast(\`Referral \${referralId} cancelled.\`, 'info');
    closeGlobalModal('cancelReferralModal');
    await window.hospitrackStore.syncAllData();
    const container = document.getElementById('mainContentArea');
    if (container && window.renderHospitalDashboard) {
      window.renderHospitalDashboard(container, 'referrals');
    }
    if (referralSelectedId === referralId) {
      window.openReferralDrawer(referralId);
    }
  } catch (err) {
    if (alertEl) {
      alertEl.className = 'alert-banner error mb-16';
      alertEl.textContent = err.message || 'Failed to cancel referral.';
      alertEl.classList.remove('hidden');
    } else {
      window.showToast(err.message || 'Failed to cancel referral', 'error');
    }
  }
};`;

const js = fs.readFileSync('js/components/hospitalDashboard.js', 'utf8');

const startTag = 'function renderHospitalReferralPipelineSection(data) {';
const endTag = '// 4A-2. EMERGENCY TRANSFER TRIAGE & OPERATIONS SECTION';

const startIndex = js.indexOf(startTag);
const endIndex = js.indexOf(endTag);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find tags in hospitalDashboard.js');
  process.exit(1);
}

const before = js.substring(0, startIndex);
const after = js.substring(endIndex);

const updatedJs = before + replacement + '\n\n// --------------------------------------------------------------------------\n' + after;

fs.writeFileSync('js/components/hospitalDashboard.js', updatedJs, 'utf8');
console.log('Successfully patched hospitalDashboard.js referral section!');

