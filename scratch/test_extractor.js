const { execSync } = require('child_process');
const fs = require('fs');

console.log('Extracting initial stylesheet from Git ab34f0b...');
const initialCss = execSync('git show ab34f0b:css/styles.css').toString('utf8');

console.log('Reading current css/styles.css...');
const currentCss = fs.readFileSync('css/styles.css', 'utf8');

console.log(`Initial CSS: ${initialCss.length} bytes, Current CSS: ${currentCss.length} bytes`);

