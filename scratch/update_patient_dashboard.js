const fs = require('fs');
const path = 'js/components/patientDashboard.js';
let content = fs.readFileSync(path, 'utf8');

const target = `  const bpVal = c.bp || c.bloodPressure || '120/80 mmHg';
  const hrVal = c.heartRate || c.pulse || '74 bpm';
  const spo2Val = c.spO2 || c.spo2 || '99%';
  const tempVal = c.temperature || '98.6 °F';`;

const repl = `  const bpVal = c.bp || c.bloodPressure || (c.bloodPressureSystolic && c.bloodPressureDiastolic ? (c.bloodPressureSystolic + '/' + c.bloodPressureDiastolic + ' mmHg') : '—');
  const hrVal = c.heartRate || c.pulse ? (c.heartRate || c.pulse) + ' bpm' : '—';
  const spo2Val = c.spO2 || c.spo2 || c.oxygenSaturation ? (c.spO2 || c.spo2 || c.oxygenSaturation) + '%' : '—';
  const tempVal = c.temperature || c.bodyTemperature ? (c.temperature || c.bodyTemperature) + ' °F' : '—';`;

if (!content.includes(target.replace(/\n/g, '\r\n')) && !content.includes(target)) {
  console.error('Target not found in patientDashboard.js');
  process.exit(1);
}
content = content.replace(content.includes(target.replace(/\n/g, '\r\n')) ? target.replace(/\n/g, '\r\n') : target, repl);
fs.writeFileSync(path, content, 'utf8');
console.log('patientDashboard.js vitals fallback sanitized!');

