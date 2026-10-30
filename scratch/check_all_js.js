const fs = require('fs');
const path = require('path');

const jsFiles = [
  'js/config.js',
  'js/authService.js',
  'js/store.js',
  'js/app.js',
  'js/workspaceRenderer.js',
  'js/components/adminDashboard.js',
  'js/components/auditLogger.js',
  'js/components/departmentWorkspace.js',
  'js/components/doctorDashboard.js',
  'js/components/hospitalDashboard.js',
  'js/components/modalManager.js',
  'js/components/patientDashboard.js'
];

let hasErrors = false;
jsFiles.forEach(f => {
  const p = path.join(__dirname, '..', f);
  const content = fs.readFileSync(p, 'utf8');
  try {
    new Function(content);
    console.log(`✓ Valid JS: ${f}`);
  } catch (err) {
    console.error(`✗ Error in ${f}:`, err.message);
    hasErrors = true;
  }
});

if (!hasErrors) {
  console.log('All JS files pass syntax parsing successfully!');
}
