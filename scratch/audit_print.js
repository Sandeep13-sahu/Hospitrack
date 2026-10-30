const fs = require('fs');

console.log('=== AUDITING EXISTING PRINT IMPLEMENTATION & ROOT CAUSES ===');

// Check app.js print handler
const appJs = fs.readFileSync('js/app.js', 'utf8');
const stylesCss = fs.readFileSync('css/styles.css', 'utf8');

console.log('1. Isolation mechanism check:');
console.log('app.js sets printing-custom-doc class on body? ', appJs.includes("document.body.classList.add('printing-custom-doc')"));
console.log('styles.css has body.printing-custom-doc selector? ', stylesCss.includes('printing-custom-doc'));

console.log('\n2. Check what is hidden in print:');
console.log('Does styles.css hide #mainContentArea during print? ', stylesCss.includes('#mainContentArea') && stylesCss.includes('@media print'));
console.log('Does styles.css hide .app-container during print? ', stylesCss.includes('.app-container { display: none'));

console.log('\n3. Check adminDashboard.js print calls:');
const adminJs = fs.readFileSync('js/components/adminDashboard.js', 'utf8');
const adminPrints = (adminJs.match(/onclick="window\.print\(\)"/g) || []).length;
console.log('Number of raw onclick="window.print()" in adminDashboard:', adminPrints);

console.log('\n4. Check hospitalDashboard.js print calls:');
const hospJs = fs.readFileSync('js/components/hospitalDashboard.js', 'utf8');
const hospPrints = (hospJs.match(/print/gi) || []).length;
console.log('Occurrences of print in hospitalDashboard.js:', hospPrints);

console.log('\n5. Check doctorDashboard.js print calls:');
const docJs = fs.readFileSync('js/components/doctorDashboard.js', 'utf8');
const docPrints = (docJs.match(/window\.print/g) || []).length;
console.log('window.print calls in doctorDashboard.js:', docPrints);

