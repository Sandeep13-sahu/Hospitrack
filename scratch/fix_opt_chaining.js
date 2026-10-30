const fs = require('fs');
const path = require('path');

const docPath = path.join(__dirname, '..', 'js', 'components', 'doctorDashboard.js');
let docContent = fs.readFileSync(docPath, 'utf8');

docContent = docContent.replace(
  /destSelect\.selectedOptions\[0\]/g,
  'destSelect?.selectedOptions?.[0]'
);

fs.writeFileSync(docPath, docContent, 'utf8');
console.log('Fixed destSelect?.selectedOptions?.[0] with optional chaining');

