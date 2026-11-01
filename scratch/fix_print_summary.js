const fs = require('fs');
const path = 'js/components/doctorDashboard.js';
let content = fs.readFileSync(path, 'utf8');

const targetPrintVitals = `      <!-- Section 2: Vitals recorded at intake -->
      <div style="border: 1px solid #CBD5E1; border-radius: 8px; padding: 12px 14px; margin-bottom: 16px; font-size: 0.78rem;">
        <div style="font-weight: 800; text-transform: uppercase; font-size: 0.7rem; color: #64748B; margin-bottom: 8px;">
          Baseline Intake Vitals &amp; Clinical Presentation
        </div>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 10px;">
          <div style="padding: 6px 10px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px;">
            <span style="color: #64748B; display: block; font-size: 0.7rem;">Blood Pressure:</span>
            <strong>120/80 mmHg</strong> (Normal)
          </div>
          <div style="padding: 6px 10px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px;">
            <span style="color: #64748B; display: block; font-size: 0.7rem;">Heart Rate:</span>
            <strong>74 bpm</strong> (Resting)
          </div>
          <div style="padding: 6px 10px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px;">
            <span style="color: #64748B; display: block; font-size: 0.7rem;">SpO2:</span>
            <strong>99%</strong> (Room Air)
          </div>
          <div style="padding: 6px 10px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px;">
            <span style="color: #64748B; display: block; font-size: 0.7rem;">Temperature:</span>
            <strong>98.6° F</strong> (Afebrile)
          </div>
        </div>
        <div style="margin-top: 6px;">
          <span style="color: #64748B;">Chief Complaint:</span> <em>&ldquo;\${escapeHtml(patient.chiefComplaint || 'Episodes of atypical chest discomfort radiating to left shoulder on exertion, accompanied by episodic palpitations and mild fatigue.')}&rdquo;</em>
        </div>`;

const replPrintVitals = `      <!-- Section 2: Vitals recorded at intake -->
      <div style="border: 1px solid #CBD5E1; border-radius: 8px; padding: 12px 14px; margin-bottom: 16px; font-size: 0.78rem;">
        <div style="font-weight: 800; text-transform: uppercase; font-size: 0.7rem; color: #64748B; margin-bottom: 8px;">
          Baseline Intake Vitals &amp; Clinical Presentation
        </div>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 10px;">
          <div style="padding: 6px 10px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px;">
            <span style="color: #64748B; display: block; font-size: 0.7rem;">Blood Pressure:</span>
            <strong>\${escapeHtml(patient.bloodPressureSystolic && patient.bloodPressureDiastolic ? (patient.bloodPressureSystolic + '/' + patient.bloodPressureDiastolic + ' mmHg') : (patient.bloodPressure || '—'))}</strong>
          </div>
          <div style="padding: 6px 10px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px;">
            <span style="color: #64748B; display: block; font-size: 0.7rem;">Heart Rate:</span>
            <strong>\${escapeHtml(patient.heartRate ? (patient.heartRate + ' bpm') : '—')}</strong>
          </div>
          <div style="padding: 6px 10px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px;">
            <span style="color: #64748B; display: block; font-size: 0.7rem;">SpO2:</span>
            <strong>\${escapeHtml(patient.oxygenSaturation ? (patient.oxygenSaturation + '%') : (patient.spO2 ? (patient.spO2 + '%') : '—'))}</strong>
          </div>
          <div style="padding: 6px 10px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px;">
            <span style="color: #64748B; display: block; font-size: 0.7rem;">Temperature:</span>
            <strong>\${escapeHtml(patient.bodyTemperature ? (patient.bodyTemperature + '° F') : (patient.temperature ? (patient.temperature + '° F') : '—'))}</strong>
          </div>
        </div>
        <div style="margin-top: 6px;">
          <span style="color: #64748B;">Chief Complaint:</span> <em>&ldquo;\${escapeHtml(patient.chiefComplaint || 'No chief complaint recorded at intake triage.')}&rdquo;</em>
        </div>`;

content = content.replace(content.includes(targetPrintVitals.replace(/\n/g, '\r\n')) ? targetPrintVitals.replace(/\n/g, '\r\n') : targetPrintVitals, replPrintVitals);

// Replace emergency contact fallback in print
content = content.replace(
  "${escapeHtml(patient.emergencyContactName || 'Karthik Iyer')} (${escapeHtml(patient.emergencyContactPhone || '+91 98111 99993')})",
  "${escapeHtml(patient.emergencyContactName || '—')} (${escapeHtml(patient.emergencyContactPhone || patient.emergencyContact || '—')})"
);

fs.writeFileSync(path, content, 'utf8');
console.log('printInpatientSummary vitals sanitized!');

