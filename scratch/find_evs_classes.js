const fs = require('fs');
const evs = fs.readFileSync('js/modules/evsBedManager.js', 'utf8');
const css = fs.readFileSync('css/styles.css', 'utf8');

const regex = /class=["']([^"']+)["']/g;
let match;
const classes = new Set();
while ((match = regex.exec(evs)) !== null) {
  match[1].split(/\s+/).forEach(c => {
    if (c && !c.includes('${') && !c.includes('}')) classes.add(c);
  });
}

const missing = [];
classes.forEach(c => {
  if (!css.includes('.' + c) && !['hidden', 'active', 'open', 'show'].includes(c)) {
    missing.push(c);
  }
});
console.log('Total classes in evsBedManager:', classes.size);
console.log('Missing in CSS:', missing.slice(0, 30));

