const { execSync } = require('child_process');
const initialCss = execSync('git show ab34f0b:css/styles.css').toString('utf8');

const lines = initialCss.split('\n');
console.log(lines.slice(400, 660).join('\n'));

